import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentProviderPort } from '../../core/ports/payment-provider.port';

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      user_email?: string;
      product_id?: string;
      variant_id?: string;
      status: string;
      [key: string]: any;
    };
  };
}

@Injectable()
export class LemonSqueezyAdapter implements PaymentProviderPort {
  private readonly logger = new Logger(LemonSqueezyAdapter.name);

  constructor(private configService: ConfigService) {}

  /**
   * Verify webhook signature from LemonSqueezy
   */
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to verify webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook events from LemonSqueezy
   */
  async processWebhook(payload: LemonSqueezyWebhookPayload): Promise<void> {
    const { meta, data } = payload;
    
    this.logger.log(`Processing LemonSqueezy webhook event: ${meta.event_name}`);

    // This method will be called by the PaymentsService
    // The actual business logic remains in the service layer
    // This adapter only handles LemonSqueezy-specific data transformation
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(userId: string, planId: string, metadata?: Record<string, any>): Promise<{
    subscriptionId: string;
    status: string;
    nextBillingDate: Date;
  }> {
    // This would integrate with LemonSqueezy's API to create subscriptions
    // For now, return mock data
    this.logger.log(`Creating LemonSqueezy subscription for user ${userId}, plan ${planId}`);
    
    return {
      subscriptionId: `ls_sub_${Date.now()}`,
      status: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{
    cancelled: boolean;
    effectiveDate: Date;
  }> {
    // This would integrate with LemonSqueezy's API to cancel subscriptions
    this.logger.log(`Cancelling LemonSqueezy subscription: ${subscriptionId}`);
    
    return {
      cancelled: true,
      effectiveDate: new Date(),
    };
  }

  /**
   * Update subscription (plan change, billing cycle, etc.)
   */
  async updateSubscription(subscriptionId: string, updates: Record<string, any>): Promise<{
    updated: boolean;
    changes: Record<string, any>;
  }> {
    // This would integrate with LemonSqueezy's API to update subscriptions
    this.logger.log(`Updating LemonSqueezy subscription: ${subscriptionId}`, updates);
    
    return {
      updated: true,
      changes: updates,
    };
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }> {
    // This would integrate with LemonSqueezy's API to get subscription details
    this.logger.log(`Getting LemonSqueezy subscription details: ${subscriptionId}`);
    
    return {
      id: subscriptionId,
      status: 'active',
      planId: 'pro_monthly',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    };
  }

  /**
   * Get provider health and performance metrics
   */
  async getProviderHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    uptime: number;
  }> {
    // This would check LemonSqueezy's API status
    try {
      // Mock health check - in production, this would ping LemonSqueezy's API
      return {
        status: 'healthy',
        responseTime: 150, // 150ms average response time
        errorRate: 0.01, // 1% error rate
        uptime: 99.9, // 99.9% uptime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        errorRate: 1.0,
        uptime: 0,
      };
    }
  }

  /**
   * Extract user ID from webhook payload
   */
  extractUserIdFromWebhook(payload: LemonSqueezyWebhookPayload): string | undefined {
    return payload.meta.custom_data?.user_id;
  }

  /**
   * Extract product information from webhook payload
   */
  extractProductInfoFromWebhook(payload: LemonSqueezyWebhookPayload): {
    productId: string;
    variantId: string;
    status: string;
    userEmail?: string;
  } {
    const { data } = payload;
    
    return {
      productId: data.attributes.product_id || '',
      variantId: data.attributes.variant_id || '',
      status: data.attributes.status,
      userEmail: data.attributes.user_email,
    };
  }

  /**
   * Map LemonSqueezy product IDs to internal plan identifiers
   */
  mapProductToPlan(productId: string, variantId: string): string {
    // This mapping should be configurable and match the PlanDeterminationPolicy
    const productMappings: Record<string, string> = {
      'starter_monthly': 'starter_monthly',
      'starter_yearly': 'starter_yearly',
      'pro_monthly': 'pro_monthly',
      'pro_yearly': 'pro_yearly',
      'agency_monthly': 'agency_monthly',
      'agency_yearly': 'agency_yearly',
    };

    const key = productId || variantId;
    return productMappings[key] || 'unknown';
  }
}
