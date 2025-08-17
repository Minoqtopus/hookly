import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserPlan } from '../entities/user.entity';
import { LemonSqueezyWebhookDto } from './dto/webhook.dto';
import { updateUserPlanFeatures } from '../entities/plan-features.util';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Map LemonSqueezy product IDs to user plans
  private readonly PRODUCT_PLAN_MAPPING = {
    // Replace these with your actual LemonSqueezy product IDs
    'starter_monthly': UserPlan.STARTER,
    'starter_yearly': UserPlan.STARTER,
    'pro_monthly': UserPlan.PRO,
    'pro_yearly': UserPlan.PRO,
    'agency_monthly': UserPlan.AGENCY,
    'agency_yearly': UserPlan.AGENCY,
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>('LEMONSQUEEZY_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('LemonSqueezy webhook secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
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
      await this.downgradeUserToFree(user);
      this.logger.log(`User ${user.email} subscription ${data.attributes.status} - downgraded to FREE`);
    }
  }

  private async handleSubscriptionCancelled(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    await this.downgradeUserToFree(user);
    this.logger.log(`User ${user.email} subscription cancelled ${data.id}`);
  }

  private async handleSubscriptionExpired(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    await this.downgradeUserToFree(user);
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
    // Try to determine plan from product variant name or custom data
    const productName = data.attributes?.product_name?.toLowerCase() || '';
    const variantName = data.attributes?.variant_name?.toLowerCase() || '';
    const customData = data.attributes?.custom_data || {};
    
    // Check custom plan data first
    if (customData.plan) {
      const customPlan = customData.plan.toLowerCase();
      if (Object.values(UserPlan).includes(customPlan as UserPlan)) {
        return customPlan as UserPlan;
      }
    }

    // Check product/variant names for plan indicators
    const fullName = `${productName} ${variantName}`.toLowerCase();
    
    if (fullName.includes('agency')) {
      return UserPlan.AGENCY;
    } else if (fullName.includes('pro')) {
      return UserPlan.PRO;
    } else if (fullName.includes('starter')) {
      return UserPlan.STARTER;
    }

    // Default to PRO for backwards compatibility
    this.logger.warn(`Could not determine plan from product data. Defaulting to PRO. Product: ${productName}, Variant: ${variantName}`);
    return UserPlan.PRO;
  }

  private async upgradeUserToPlan(user: User, plan: UserPlan): Promise<void> {
    updateUserPlanFeatures(user, plan);
    user.daily_count = 0; // Reset daily count on upgrade
    await this.userRepository.save(user);
    this.logger.log(`User ${user.email} upgraded to ${plan}`);
  }

  // Legacy method - defaults to Pro for backwards compatibility
  private async upgradeUserToPro(user: User): Promise<void> {
    await this.upgradeUserToPlan(user, UserPlan.PRO);
  }

  private async downgradeUserToFree(user: User): Promise<void> {
    updateUserPlanFeatures(user, UserPlan.FREE);
    // Reset daily count to apply free tier limits immediately
    const today = new Date().toISOString().split('T')[0];
    if (user.reset_date.toISOString().split('T')[0] !== today) {
      user.daily_count = 0;
      user.reset_date = new Date();
    }
    await this.userRepository.save(user);
    this.logger.log(`User ${user.email} downgraded to FREE`);
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

  // Get plan hierarchy for validation
  private getPlanHierarchy(): UserPlan[] {
    return [UserPlan.FREE, UserPlan.STARTER, UserPlan.PRO, UserPlan.AGENCY];
  }

  // Check if plan transition is valid (can only upgrade, not downgrade via payments)
  private isValidPlanTransition(fromPlan: UserPlan, toPlan: UserPlan): boolean {
    const hierarchy = this.getPlanHierarchy();
    const fromIndex = hierarchy.indexOf(fromPlan);
    const toIndex = hierarchy.indexOf(toPlan);
    
    // Allow upgrades and lateral moves (e.g., Pro monthly to Pro yearly)
    return toIndex >= fromIndex;
  }

  // Method to handle promo codes or special offers
  async applyPromoCode(userId: string, promoCode: string): Promise<{ success: boolean; message: string; newPlan?: UserPlan }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Define promo codes and their benefits
    const promoCodes = {
      'LAUNCH50': { plan: UserPlan.STARTER, description: 'Launch Special - 50% off Starter' },
      'BETA100': { plan: UserPlan.PRO, description: 'Beta Tester - Free Pro Access' },
      'AGENCY30': { plan: UserPlan.AGENCY, description: 'Agency Trial - 30 days free' },
    };

    const promo = promoCodes[promoCode.toUpperCase()];
    if (!promo) {
      return { success: false, message: 'Invalid promo code' };
    }

    // Check if this is a valid upgrade
    if (!this.isValidPlanTransition(user.plan, promo.plan)) {
      return { success: false, message: 'Promo code not applicable to your current plan' };
    }

    await this.upgradeUserToPlan(user, promo.plan);
    this.logger.log(`Promo code applied: User ${user.email} upgraded to ${promo.plan} with code ${promoCode}`);

    return { 
      success: true, 
      message: `${promo.description} - You've been upgraded to ${promo.plan}!`,
      newPlan: promo.plan
    };
  }
}