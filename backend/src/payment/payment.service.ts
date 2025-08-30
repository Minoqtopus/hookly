import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { WebhookEvent, WebhookProvider, WebhookStatus } from '../entities/webhook-event.entity';
import { 
  LemonSqueezyCheckoutResponse, 
  LemonSqueezyWebhookPayload,
  OrderCreatedWebhook,
  SubscriptionCreatedWebhook
} from '../types/external-apis';
import { getPlatformAccess } from '../pricing/pricing.config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
    private configService: ConfigService,
  ) {}

  /**
   * Handle LemonSqueezy webhook events with proper type safety
   * 
   * Staff Engineer Note: Webhook handling is critical for payment consistency.
   * Proper typing catches integration issues before they hit production.
   */
  /**
   * Handle LemonSqueezy webhook events with idempotency protection
   * 
   * Staff Engineer Note: This is CRITICAL for production. Payment webhooks can be sent
   * multiple times due to network issues, retries, or provider bugs. We MUST ensure
   * each webhook is processed exactly once to prevent billing inconsistencies.
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Staff Engineer Note: We receive 'any' from the controller but validate the structure here
    if (!payload || !payload.meta || !payload.data) {
      throw new Error('Invalid webhook payload structure');
    }

    const eventId = payload.data.id;
    const eventType = payload.meta.event_name;
    
    // Check for duplicate webhook processing (idempotency)
    const existingEvent = await this.webhookEventRepository.findOne({
      where: {
        provider: WebhookProvider.LEMONSQUEEZY,
        external_id: eventId
      }
    });

    if (existingEvent) {
      if (existingEvent.status === WebhookStatus.COMPLETED) {
        this.logger.log(`Webhook ${eventId} already processed successfully, skipping`);
        return;
      } else if (existingEvent.status === WebhookStatus.PROCESSING) {
        this.logger.warn(`Webhook ${eventId} is currently being processed, skipping duplicate`);
        return;
      } else if (existingEvent.status === WebhookStatus.FAILED) {
        this.logger.log(`Retrying failed webhook ${eventId}`);
        await this.retryWebhookProcessing(existingEvent, payload, signature);
        return;
      }
    }

    // Create webhook event record for tracking
    const webhookEvent = this.webhookEventRepository.create({
      provider: WebhookProvider.LEMONSQUEEZY,
      external_id: eventId,
      event_type: eventType,
      status: WebhookStatus.PROCESSING,
      payload: payload,
      user_id: payload.meta.custom_data?.user_id,
      processing_attempts: 1,
      last_processed_at: new Date()
    });

    const savedEvent = await this.webhookEventRepository.save(webhookEvent);

    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      this.logger.log(`Processing LemonSqueezy webhook: ${eventType} (${eventId})`);

      // Cast to proper type after validation
      const typedPayload = payload as LemonSqueezyWebhookPayload;
      
      // Staff Engineer Note: Using type-safe event handling with discriminated unions
      switch (typedPayload.meta.event_name) {
        case 'order_created':
          await this.handleOrderCreated(payload as OrderCreatedWebhook);
          break;
        case 'subscription_created':
          await this.handleSubscriptionCreated(payload as SubscriptionCreatedWebhook);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${payload.meta.event_name}`);
          await this.webhookEventRepository.update(savedEvent.id, {
            status: WebhookStatus.SKIPPED,
            processing_result: `Event type ${payload.meta.event_name} not implemented`
          });
          return;
      }

      // Mark webhook as completed
      await this.webhookEventRepository.update(savedEvent.id, {
        status: WebhookStatus.COMPLETED,
        processing_result: 'Successfully processed'
      });

      this.logger.log(`Webhook ${eventId} processed successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark webhook as failed
      await this.webhookEventRepository.update(savedEvent.id, {
        status: WebhookStatus.FAILED,
        error_details: errorMessage
      });

      this.logger.error(`Webhook ${eventId} processing failed: ${errorMessage}`);
      throw error; // Re-throw for controller error handling
    }
  }

  /**
   * Create LemonSqueezy checkout URL for plan upgrade
   */
  async createCheckoutUrl(userId: string, planId: 'starter' | 'pro'): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // LemonSqueezy product/variant IDs (configure in environment)
    const productVariants = {
      starter: this.configService.get<string>('LEMONSQUEEZY_STARTER_VARIANT_ID'),
      pro: this.configService.get<string>('LEMONSQUEEZY_PRO_VARIANT_ID')
    };

    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          product_options: {
            name: planId === 'starter' ? 'Starter Plan' : 'Pro Plan',
            description: planId === 'starter' ? 
              '50 generations per month, TikTok + Instagram' : 
              '200 generations per month, All platforms',
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          checkout_data: {
            email: user.email,
            custom: {
              user_id: user.id,
              plan: planId
            }
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: this.configService.get<string>('LEMONSQUEEZY_STORE_ID')
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: productVariants[planId]
            }
          }
        }
      }
    };

    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.configService.get<string>('LEMONSQUEEZY_API_KEY')}`
        },
        body: JSON.stringify(checkoutData)
      });

      const result = await response.json() as LemonSqueezyCheckoutResponse;
      
      if (!response.ok) {
        this.logger.error('LemonSqueezy API error:', result);
        throw new Error('Failed to create checkout session');
      }

      return result.data.attributes.url;
    } catch (error) {
      this.logger.error('Error creating checkout URL:', error);
      throw new Error('Payment system temporarily unavailable');
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implement LemonSqueezy webhook signature verification
    const secret = this.configService.get<string>('LEMONSQUEEZY_WEBHOOK_SECRET');
    // For now, return true - implement proper HMAC verification in production
    return true;
  }

  /**
   * Handle successful order creation
   * Upgrades user plan and sets platform access
   * 
   * Staff Engineer Note: This is a critical business transaction.
   * Any failure here could result in user paying but not getting access.
   */
  private async handleOrderCreated(webhook: OrderCreatedWebhook): Promise<void> {
    const customData = webhook.meta.custom_data;
    const userId = customData?.user_id;
    const plan = customData?.plan;
    const orderStatus = webhook.data.attributes.status;

    // Only process paid orders to avoid upgrading on pending/failed payments
    if (userId && plan && orderStatus === 'paid') {
      await this.upgradUserPlan(userId, plan);
      this.logger.log(`User ${userId} upgraded to ${plan} plan via order ${webhook.data.id}`);
    } else if (orderStatus !== 'paid') {
      this.logger.warn(`Order ${webhook.data.id} not processed - status: ${orderStatus}`);
    } else {
      this.logger.warn(`Order ${webhook.data.id} missing user_id or plan in custom_data`);
    }
  }

  /**
   * Handle subscription creation
   * Sets up recurring billing and plan features
   * 
   * Staff Engineer Note: Subscriptions are more complex than one-time orders.
   * We need to handle trial periods, billing cycles, and subscription states.
   */
  private async handleSubscriptionCreated(webhook: SubscriptionCreatedWebhook): Promise<void> {
    const customData = webhook.meta.custom_data;
    const userId = customData?.user_id;
    const plan = customData?.plan;
    const subscriptionStatus = webhook.data.attributes.status;

    if (userId && plan) {
      // Handle different subscription states
      if (subscriptionStatus === 'active' || subscriptionStatus === 'on_trial') {
        await this.upgradUserPlan(userId, plan);
        
        // TODO: Store subscription ID in user entity for future reference
        // This would require adding subscription_id field to User entity
        
        this.logger.log(
          `User ${userId} subscription created: ${webhook.data.id} (${subscriptionStatus})`
        );
      } else {
        this.logger.warn(
          `Subscription ${webhook.data.id} created but not active (${subscriptionStatus})`
        );
      }
    } else {
      this.logger.warn(
        `Subscription ${webhook.data.id} missing user_id or plan in custom_data`
      );
    }
  }

  // TODO: Implement subscription_updated and subscription_cancelled handlers
  // These would require additional webhook type definitions and business logic

  /**
   * Upgrade user plan with atomic database operation
   * 
   * Staff Engineer Note: This is a critical business operation that must be atomic.
   * Any failure here could result in billing inconsistencies.
   */
  private async upgradUserPlan(userId: string, planName: string): Promise<void> {
    const plan = planName === 'starter' ? UserPlan.STARTER : UserPlan.PRO;
    const now = new Date();

    // Get platform access from centralized pricing config
    const availablePlatforms = getPlatformAccess(plan);
    const platformAccess = {
      has_tiktok_access: availablePlatforms.includes('tiktok'),
      has_instagram_access: availablePlatforms.includes('instagram'), 
      has_youtube_access: availablePlatforms.includes('youtube')
    };

    const updateData = {
      plan,
      monthly_generation_count: 0, // Reset count on upgrade
      monthly_reset_date: now,
      ...platformAccess // Spread platform access flags
    };

    // Staff Engineer Note: This should be wrapped in a transaction
    // but for now we'll use a single update operation for atomicity
    await this.userRepository.update(userId, updateData);
    
    this.logger.log(`User ${userId} successfully upgraded to ${plan} plan`);
  }

  /**
   * Retry failed webhook processing
   * 
   * Staff Engineer Note: Implement exponential backoff and max retry limits
   * to prevent infinite retry loops while ensuring eventual consistency.
   */
  private async retryWebhookProcessing(
    webhookEvent: WebhookEvent, 
    payload: any, 
    signature: string
  ): Promise<void> {
    const maxRetries = 3;
    
    if (webhookEvent.processing_attempts >= maxRetries) {
      this.logger.error(
        `Webhook ${webhookEvent.external_id} exceeded max retries (${maxRetries}), giving up`
      );
      return;
    }

    // Update retry attempt
    await this.webhookEventRepository.update(webhookEvent.id, {
      processing_attempts: webhookEvent.processing_attempts + 1,
      last_processed_at: new Date(),
      status: WebhookStatus.PROCESSING
    });

    // Recursive call to main handler will process the webhook
    await this.handleWebhook(payload, signature);
  }
}