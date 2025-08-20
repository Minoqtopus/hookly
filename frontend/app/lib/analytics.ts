import { AuthService } from './auth';

export enum EventType {
  // User actions
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  EMAIL_VERIFIED = 'email_verified',
  
  // Generation events
  GENERATION_STARTED = 'generation_started',
  GENERATION_COMPLETED = 'generation_completed',
  GENERATION_FAILED = 'generation_failed',
  TEMPLATE_USED = 'template_used',
  
  // Engagement events
  COPY_TO_CLIPBOARD = 'copy_to_clipboard',
  SAVE_TO_FAVORITES = 'save_to_favorites',
  SHARE_GENERATION = 'share_generation',
  EXPORT_GENERATION = 'export_generation',
  
  // Conversion events
  TRIAL_STARTED = 'trial_started',
  UPGRADE_MODAL_SHOWN = 'upgrade_modal_shown',
  UPGRADE_INITIATED = 'upgrade_initiated',
  UPGRADE_COMPLETED = 'upgrade_completed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  
  // Team events
  TEAM_CREATED = 'team_created',
  TEAM_MEMBER_INVITED = 'team_member_invited',
  TEAM_GENERATION_SHARED = 'team_generation_shared',
  
  // Page views
  PAGE_VIEW = 'page_view',
  DEMO_COMPLETED = 'demo_completed',
  PRICING_PAGE_VIEWED = 'pricing_page_viewed'
}

export interface TrackEventOptions {
  eventData?: any;
  sessionId?: string;
  anonymous?: boolean;
}

export class AnalyticsService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  private static sessionId: string;

  static init() {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      this.sessionId = sessionId;
    }
  }

  private static generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  static async trackEvent(
    eventType: EventType,
    options: TrackEventOptions = {}
  ): Promise<void> {
    try {
      const { eventData, sessionId, anonymous = false } = options;
      
      const payload = {
        eventType,
        eventData,
        sessionId: sessionId || this.sessionId,
      };

      const endpoint = anonymous ? '/analytics/track-anonymous' : '/analytics/track';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth header if not anonymous and user is logged in
      if (!anonymous) {
        const tokens = AuthService.getStoredTokens();
        if (tokens?.accessToken) {
          headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
      }

      await fetch(`${this.API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  // Convenience methods for common events
  static async trackPageView(page: string, anonymous: boolean = false) {
    return this.trackEvent(EventType.PAGE_VIEW, {
      eventData: { page, url: window.location.href },
      anonymous,
    });
  }

  static async trackGeneration(generationId: string, success: boolean, templateId?: string) {
    const eventType = success ? EventType.GENERATION_COMPLETED : EventType.GENERATION_FAILED;
    return this.trackEvent(eventType, {
      eventData: {
        generation_id: generationId,
        template_id: templateId,
      },
    });
  }

  static async trackUpgradeModal(source: string) {
    return this.trackEvent(EventType.UPGRADE_MODAL_SHOWN, {
      eventData: { source },
    });
  }

  static async trackUpgradeInitiated(plan: string, source: string) {
    return this.trackEvent(EventType.UPGRADE_INITIATED, {
      eventData: { 
        target_plan: plan,
        conversion_source: source,
      },
    });
  }

  static async trackFeatureUsage(feature: string, context?: any) {
    return this.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        feature_used: feature,
        ...context,
      },
    });
  }

  static async trackCopyToClipboard(content: string, source: string) {
    return this.trackEvent(EventType.COPY_TO_CLIPBOARD, {
      eventData: {
        content_type: content,
        source,
      },
    });
  }

  static async trackShareGeneration(generationId: string, method: string) {
    return this.trackEvent(EventType.SHARE_GENERATION, {
      eventData: {
        generation_id: generationId,
        share_method: method,
      },
    });
  }

  static async trackFavoriteToggle(generationId: string, isFavorite: boolean) {
    return this.trackEvent(EventType.SAVE_TO_FAVORITES, {
      eventData: {
        generation_id: generationId,
        is_favorite: isFavorite,
      },
    });
  }

  static async trackTemplateUsage(templateId: string, templateNiche: string) {
    return this.trackEvent(EventType.TEMPLATE_USED, {
      eventData: {
        template_id: templateId,
        template_niche: templateNiche,
      },
    });
  }

  static async trackDemoCompletion(demoData: any) {
    return this.trackEvent(EventType.DEMO_COMPLETED, {
      eventData: demoData,
      anonymous: true, // Demo users might not be logged in
    });
  }
}

// Initialize analytics on module load
if (typeof window !== 'undefined') {
  AnalyticsService.init();
}