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
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleOrderCreated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    // For one-time purchases, upgrade to Pro
    if (data.attributes.status === 'paid') {
      await this.upgradeUserToPro(user);
      this.logger.log(`User ${user.email} upgraded to Pro via order ${data.id}`);
    }
  }

  private async handleSubscriptionCreated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    if (data.attributes.status === 'active') {
      await this.upgradeUserToPro(user);
      this.logger.log(`User ${user.email} subscribed to Pro ${data.id}`);
    }
  }

  private async handleSubscriptionUpdated(data: any, userId?: string): Promise<void> {
    const user = await this.findUserByEmailOrId(data.attributes.user_email, userId);
    if (!user) return;

    if (data.attributes.status === 'active') {
      await this.upgradeUserToPro(user);
    } else if (['cancelled', 'expired', 'past_due'].includes(data.attributes.status)) {
      await this.downgradeUserToFree(user);
    }

    this.logger.log(`User ${user.email} subscription updated: ${data.attributes.status}`);
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
}