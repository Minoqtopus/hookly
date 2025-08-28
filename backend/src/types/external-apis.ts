/**
 * External API Type Definitions
 * 
 * This file contains TypeScript interfaces for all external API integrations
 * to eliminate 'any' types and improve type safety across the application.
 * 
 * Staff Engineer Note: Type safety is critical for production systems.
 * These interfaces serve as contracts that catch integration issues at compile time.
 */

// ================================
// LemonSqueezy API Types - Exact Schema from Official Docs
// ================================

export interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    type: 'checkouts';
    attributes: {
      url: string;
      expires_at: string;
      created_at: string;
      updated_at: string;
    };
  };
}

/**
 * Base webhook payload structure - all LemonSqueezy webhooks follow this pattern
 */
interface BaseLemonSqueezyWebhook {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, any>;
    relationships?: Record<string, any>;
    links?: {
      self: string;
    };
  };
}

/**
 * Order Created Webhook - Exact schema from LemonSqueezy docs
 */
export interface OrderCreatedWebhook extends BaseLemonSqueezyWebhook {
  meta: {
    event_name: 'order_created';
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    type: 'orders';
    attributes: {
      store_id: number;
      customer_id: number;
      order_number: number;
      user_name: string;
      user_email: string;
      currency: string;
      currency_rate: string;
      subtotal: number;
      discount_total: number;
      tax: number;
      total: number;
      subtotal_usd: number;
      discount_total_usd: number;
      tax_usd: number;
      total_usd: number;
      tax_name: string;
      tax_rate: string;
      status: 'paid' | 'pending' | 'failed' | 'cancelled';
      status_formatted: string;
      refunded: boolean | null;
      refunded_at: string | null;
      subtotal_formatted: string;
      discount_total_formatted: string;
      tax_formatted: string;
      total_formatted: string;
      first_order_item: {
        order_id: number;
        product_id: number;
        variant_id: number;
        product_name: string;
        variant_name: string;
        price: number;
        created_at: string;
        updated_at: string;
        test_mode: boolean;
      };
      urls: {
        receipt: string;
      };
    };
    relationships: {
      store: { links: { related: string; self: string } };
      customer: { links: { related: string; self: string } };
    };
    links: {
      self: string;
    };
  };
}

/**
 * Subscription Created Webhook - Exact schema from LemonSqueezy docs
 */
export interface SubscriptionCreatedWebhook extends BaseLemonSqueezyWebhook {
  meta: {
    event_name: 'subscription_created';
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    type: 'subscriptions';
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      order_item_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      user_name: string;
      user_email: string;
      status: 'on_trial' | 'active' | 'paused' | 'cancelled' | 'expired';
      status_formatted: string;
      card_brand: string;
      card_last_four: string;
      payment_processor: string;
      pause: any | null;
      cancelled: boolean;
      trial_ends_at: string | null;
      billing_anchor: number;
      first_subscription_item: {
        id: number;
        subscription_id: number;
        price_id: number;
        quantity: number;
        created_at: string;
        updated_at: string;
      };
      urls: {
        update_payment_method: string;
        customer_portal: string;
      };
    };
    relationships: {
      store: { links: { related: string; self: string } };
      customer: { links: { related: string; self: string } };
      order: { links: { related: string; self: string } };
    };
    links: {
      self: string;
    };
  };
}

/**
 * Union type for all supported webhook events
 */
export type LemonSqueezyWebhookPayload = 
  | OrderCreatedWebhook 
  | SubscriptionCreatedWebhook;

// ================================
// Google Gemini AI API Types
// ================================

export interface GeminiGenerationRequest {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
}

export interface GeminiApiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface GeminiGeneratedContent {
  title: string;
  hook: string;
  script: string;
  performance_data: {
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    engagement_rate: number;
  };
}

// ================================
// Internal Business Types
// ================================

export interface PlatformSpecifications {
  [key: string]: {
    length: string;
    style: string;
    format: string;
    specialRequirements: string[];
  };
}

export interface UserGenerationLimits {
  trial: {
    total: number;
    platforms: string[];
    durationDays: number;
  };
  starter: {
    monthly: number;
    platforms: string[];
  };
  pro: {
    monthly: number;
    platforms: string[];
    batchSize: number;
  };
}

// ================================
// Email Service Types
// ================================

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface EmailSendRequest {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ================================
// Analytics Event Types
// ================================

export interface AnalyticsEventData {
  userId?: string;
  sessionId?: string;
  eventType: string;
  properties: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

// ================================
// Security Types
// ================================

export interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  riskScore?: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  userId?: string;
  error?: string;
  expiresAt?: Date;
}