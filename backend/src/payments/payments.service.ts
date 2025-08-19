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
    if (!user) return;

    // For one-time purchases, determine plan from product data
    if (data.attributes.status === 'paid') {
      const targetPlan = this.determinePlanFromProductData(data);
      await this.upgradeUserToPlan(user, targetPlan);
      this.logger.log(`User ${user.email} upgraded to ${targetPlan} via order ${data.id}`);
    }
  }

  private async handleSubscriptionCreated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    if (data.attributes.status === 'active') {
      const targetPlan = this.determinePlanFromProductData(data);
      await this.upgradeUserToPlan(user, targetPlan);
      this.logger.log(`User ${user.email} subscribed to ${targetPlan} ${data.id}`);
    }
  }

  private async handleSubscriptionUpdated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    if (data.attributes.status === 'active') {
      const targetPlan = this.determinePlanFromProductData(data);
      await this.upgradeUserToPlan(user, targetPlan);
      this.logger.log(`User ${user.email} subscription updated to ${targetPlan}: ${data.attributes.status}`);
    } else if (['cancelled', 'expired', 'past_due'].includes(data.attributes.status)) {
      await this.downgradeUserToTrial(user);
      this.logger.log(`User ${user.email} subscription ${data.attributes.status} - downgraded to TRIAL`);
    }
  }

  private async handleSubscriptionCancelled(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    // Track cancellation event before downgrade
    try {
      await this.analyticsService.trackEvent(
        EventType.SUBSCRIPTION_CANCELLED,
        user.id,
        {
          cancelled_plan: user.plan,
          subscription_id: data.id,
          cancellation_reason: data.attributes?.cancellation_reason || 'unknown',
        }
      );
    } catch (error) {
      this.logger.error('Failed to track cancellation analytics:', error);
    }

    await this.downgradeUserToTrial(user);
    this.logger.log(`User ${user.email} subscription cancelled ${data.id}`);
  }

  private async handleSubscriptionExpired(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    await this.downgradeUserToTrial(user);
    this.logger.log(`User ${user.email} subscription expired ${data.id}`);
  }

  private async findUserByEmailOrId(email: string, userId?: string): Promise<User | null> {
    let user: User | null = null;

    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!user && email) {
      user = await this.userRepository.findOne({ where: { email } });
    }

    if (!user) {
      this.logger.warn(`User not found for email: ${email}, userId: ${userId}`);
    }

    return user;
  }

  private determinePlanFromProductData(data: any): UserPlan {
    return this.planDeterminationPolicy.determinePlanFromProductData(data);
  }

  private async upgradeUserToPlan(user: User, plan: UserPlan): Promise<void> {
    const previousPlan = user.plan;
    updateUserPlanFeatures(user, plan);
    user.monthly_count = 0; // Reset monthly count on upgrade
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
    
    // Ensure reset_date is a Date object
    const resetDate = user.reset_date instanceof Date ? user.reset_date : new Date(user.reset_date);
    if (resetDate.toISOString().split('T')[0] !== today) {
      user.monthly_count = 0;
      user.reset_date = new Date();
    }
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
      // Special handling for beta users
      (user as any).is_beta_user = true;
      (user as any).beta_expires_at = new Date(Date.now() + (validation.duration || 30) * 24 * 60 * 60 * 1000);
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