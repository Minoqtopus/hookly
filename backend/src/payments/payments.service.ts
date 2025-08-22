import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { PlanDeterminationPolicy } from '../core/domain/policies/plan-determination.policy';
import { AnalyticsPort } from '../core/ports/analytics.port';
import { PaymentProviderPort } from '../core/ports/payment-provider.port';
import { EventType } from '../entities/analytics-event.entity';
import { updateUserPlanFeatures } from '../entities/plan-features.util';
import { User, UserPlan } from '../entities/user.entity';
import { LemonSqueezyWebhookDto } from './dto/webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);



  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private analyticsService: AnalyticsService,
    @Inject('PaymentProviderPort')
    private paymentProvider: PaymentProviderPort,
    @Inject('AnalyticsPort')
    private analyticsPort: AnalyticsPort,
    private planDeterminationPolicy: PlanDeterminationPolicy,
  ) {}

  verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    return this.paymentProvider.verifyWebhookSignature(payload, signature);
  }

  async handleWebhook(payload: LemonSqueezyWebhookDto): Promise<void> {
    const { meta, data } = payload;
    
    this.logger.log(`Processing webhook event: ${meta.event_name}`);

    try {
      switch (meta.event_name) {
        case 'order_created':
          await this.handleOrderCreated(data, meta.custom_data?.user_id);
          break;
        case 'subscription_created':
          await this.handleSubscriptionCreated(data, meta.custom_data?.user_id);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(data, meta.custom_data?.user_id);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(data, meta.custom_data?.user_id);
          break;
        case 'subscription_expired':
          await this.handleSubscriptionExpired(data, meta.custom_data?.user_id);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${meta.event_name}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  private async handleOrderCreated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) {
      this.logger.error(`Order created but user not found. Order ID: ${data.id}, Email: ${data.attributes.user_email}, UserId: ${userId}`);
      return;
    }

    try {
      // For one-time purchases, determine plan from product data
      if (data.attributes.status === 'paid') {
        const targetPlan = this.determinePlanFromProductData(data);
        await this.upgradeUserToPlan(user, targetPlan);
        this.logger.log(`User ${user.email} upgraded to ${targetPlan} via order ${data.id}`);
      }
    } catch (error) {
      this.logger.error(`Error processing order ${data.id} for user ${user.email}:`, error);
      throw error; // Re-throw to trigger webhook retry
    }
  }

  private async handleSubscriptionCreated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) {
      this.logger.error(`Subscription created but user not found. Subscription ID: ${data.id}, Email: ${data.attributes.user_email}, UserId: ${userId}`);
      return;
    }

    try {
      if (data.attributes.status === 'active') {
        const targetPlan = this.determinePlanFromProductData(data);
        await this.upgradeUserToPlan(user, targetPlan);
        this.logger.log(`User ${user.email} subscribed to ${targetPlan} ${data.id}`);
      }
    } catch (error) {
      this.logger.error(`Error processing subscription ${data.id} for user ${user.email}:`, error);
      throw error; // Re-throw to trigger webhook retry
    }
  }

  private async handleSubscriptionUpdated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) {
      this.logger.error(`Subscription updated but user not found. Subscription ID: ${data.id}, Email: ${data.attributes.user_email}, UserId: ${userId}`);
      return;
    }

    try {
      if (data.attributes.status === 'active') {
        const targetPlan = this.determinePlanFromProductData(data);
        await this.upgradeUserToPlan(user, targetPlan);
        this.logger.log(`User ${user.email} subscription updated to ${targetPlan}: ${data.attributes.status}`);
      } else if (['cancelled', 'expired', 'past_due'].includes(data.attributes.status)) {
        await this.downgradeUserToTrial(user);
        this.logger.log(`User ${user.email} subscription ${data.attributes.status} - downgraded to TRIAL`);
      }
    } catch (error) {
      this.logger.error(`Error processing subscription update ${data.id} for user ${user.email}:`, error);
      throw error; // Re-throw to trigger webhook retry
    }
  }

  private async handleSubscriptionCancelled(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) {
      this.logger.error(`Subscription cancelled but user not found. Subscription ID: ${data.id}, Email: ${data.attributes.user_email}, UserId: ${userId}`);
      return;
    }

    try {
      // Track cancellation event before downgrade
      try {
        await this.analyticsService.trackEvent(
          EventType.UPGRADE_COMPLETED,
          user.id,
          {
            cancelled_plan: user.plan,
            subscription_id: data.id,
            cancellation_reason: data.attributes?.cancellation_reason || 'unknown',
          }
        );
      } catch (error) {
        this.logger.error('Failed to track cancellation analytics:', error);
        // Don't throw - analytics failure shouldn't block the cancellation
      }

      await this.downgradeUserToTrial(user);
      this.logger.log(`User ${user.email} subscription cancelled ${data.id}`);
    } catch (error) {
      this.logger.error(`Error processing subscription cancellation ${data.id} for user ${user.email}:`, error);
      throw error; // Re-throw to trigger webhook retry
    }
  }

  private async handleSubscriptionExpired(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) {
      this.logger.error(`Subscription expired but user not found. Subscription ID: ${data.id}, Email: ${data.attributes.user_email}, UserId: ${userId}`);
      return;
    }

    try {
      await this.downgradeUserToTrial(user);
      this.logger.log(`User ${user.email} subscription expired ${data.id}`);
    } catch (error) {
      this.logger.error(`Error processing subscription expiration ${data.id} for user ${user.email}:`, error);
      throw error; // Re-throw to trigger webhook retry
    }
  }

  private async findUserByEmailOrId(email: string, userId?: string): Promise<User | null> {
    let user: User | null = null;

    // Try to find by userId first (more reliable)
    if (userId) {
      try {
        user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          this.logger.log(`User found by ID: ${userId}`);
          return user;
        }
      } catch (error) {
        this.logger.error(`Error finding user by ID ${userId}:`, error);
      }
    }

    // Fallback to email lookup
    if (email) {
      try {
        user = await this.userRepository.findOne({ where: { email } });
        if (user) {
          this.logger.log(`User found by email: ${email}`);
          return user;
        }
      } catch (error) {
        this.logger.error(`Error finding user by email ${email}:`, error);
      }
    }

    // Log detailed information for debugging webhook issues
    this.logger.error(`User lookup failed - Email: ${email}, UserId: ${userId}. This payment event will be lost.`);
    
    // In production, you might want to queue this for retry or manual review
    // For now, we'll return null and the webhook handler will log the error
    return null;
  }

  private determinePlanFromProductData(data: any): UserPlan {
    return this.planDeterminationPolicy.determinePlanFromProductData(data);
  }

  private async upgradeUserToPlan(user: User, plan: UserPlan): Promise<void> {
    const previousPlan = user.plan;
    updateUserPlanFeatures(user, plan);
          user.monthly_generation_count = 0; // Reset monthly count on upgrade
    await this.userRepository.save(user);
    
    // Track conversion event
    try {
      await this.analyticsPort.trackConversion({
        userId: user.id,
        fromPlan: previousPlan,
        toPlan: plan,
        amount: this.getPlanPrice(plan),
        source: 'lemon_squeezy',
      });
    } catch (error) {
      this.logger.error('Failed to track conversion analytics:', error);
    }
    
    this.logger.log(`User ${user.email} upgraded to ${plan}`);
  }

  private getPlanPrice(plan: UserPlan): number {
    return this.planDeterminationPolicy.getPlanPrice(plan);
  }



  private async downgradeUserToTrial(user: User): Promise<void> {
    updateUserPlanFeatures(user, UserPlan.TRIAL);
    // Reset monthly count to apply trial tier limits immediately
    const today = new Date().toISOString().split('T')[0];
    
    // Reset monthly generation count
    user.monthly_generation_count = 0;
    user.monthly_reset_date = new Date();
    await this.userRepository.save(user);
    this.logger.log(`User ${user.email} downgraded to TRIAL`);
  }

  // Public method for manual plan changes (e.g., admin upgrades, promo codes)
  async upgradeUserManually(userId: string, targetPlan: UserPlan, reason: string = 'Manual upgrade'): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPlan = user.plan;
    await this.upgradeUserToPlan(user, targetPlan);
    
    this.logger.log(`Manual upgrade: User ${user.email} from ${currentPlan} to ${targetPlan}. Reason: ${reason}`);
    
    return user;
  }

  // Check if plan transition is valid (can only upgrade, not downgrade via payments)
  private isValidPlanTransition(fromPlan: UserPlan, toPlan: UserPlan): boolean {
    return this.planDeterminationPolicy.isValidPlanTransition(fromPlan, toPlan);
  }

  // Method to handle promo codes or special offers
  async applyPromoCode(userId: string, promoCode: string): Promise<{ success: boolean; message: string; newPlan?: UserPlan }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validation = this.planDeterminationPolicy.validatePromoCode(user.plan, promoCode);
    
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    if (validation.isBeta) {
      // Special handling for beta users with proper type safety
      user.is_beta_user = true;
      user.beta_expires_at = new Date(Date.now() + (validation.duration || 30) * 24 * 60 * 60 * 1000);
      await this.upgradeUserToPlan(user, validation.targetPlan!);
      this.logger.log(`Beta promo code applied: User ${user.email} marked as beta user and upgraded to ${validation.targetPlan} for ${validation.duration || 30} days`);
    } else {
      // Regular promo code handling
      await this.upgradeUserToPlan(user, validation.targetPlan!);
      this.logger.log(`Promo code applied: User ${user.email} upgraded to ${validation.targetPlan} with code ${promoCode}`);
    }

    return { 
      success: true, 
      message: validation.message,
      newPlan: validation.targetPlan!
    };
  }
}