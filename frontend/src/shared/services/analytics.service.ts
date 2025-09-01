/**
 * Frontend Analytics Service
 * 
 * Centralized analytics tracking that wraps backend API calls and provides
 * a simple interface for tracking user events throughout the application.
 */

import { apiClient } from '../api/api-client';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
  user_context?: Record<string, any>;
}

export interface AnalyticsContext {
  page_url: string;
  referrer: string;
  user_agent: string;
  timestamp: string;
}

class AnalyticsService {
  private context: AnalyticsContext;

  constructor() {
    this.context = this.getDefaultContext();
  }

  /**
   * Track an analytics event
   */
  async track(
    eventType: string, 
    eventData?: Record<string, any>, 
    userContext?: Record<string, any>
  ): Promise<void> {
    try {
      const payload: AnalyticsEvent = {
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
        page_url: window.location.href,
        user_context: userContext,
      };

      // Send to backend analytics endpoint
      await apiClient.post('/analytics/track', payload);
      
      // Console log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', eventType, payload);
      }
    } catch (error) {
      // Don't throw - analytics failures shouldn't break user experience
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(pageName?: string): Promise<void> {
    const eventData = {
      page_name: pageName || this.getPageNameFromUrl(),
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };

    await this.track('page_view', eventData);
  }

  /**
   * Track user registration
   */
  async trackRegistration(method: 'email' | 'oauth', provider?: string): Promise<void> {
    await this.track('registration', {
      method,
      provider,
      registration_source: document.referrer || 'direct',
    });
  }

  /**
   * Track user login
   */
  async trackLogin(method: 'email' | 'oauth', provider?: string): Promise<void> {
    await this.track('login', {
      method,
      provider,
    });
  }

  /**
   * Track trial start
   */
  async trackTrialStarted(): Promise<void> {
    await this.track('trial_started', {
      trial_start_source: window.location.pathname,
    });
  }

  /**
   * Track generation events
   */
  async trackGenerationStarted(platform: string, generationId: string): Promise<void> {
    await this.track('generation_started', {
      platform,
      generation_id: generationId,
    });
  }

  async trackGenerationCompleted(
    platform: string, 
    generationId: string, 
    success: boolean, 
    errorMessage?: string
  ): Promise<void> {
    const eventType = success ? 'generation_completed' : 'generation_failed';
    await this.track(eventType, {
      platform,
      generation_id: generationId,
      success,
      error_message: errorMessage,
    });
  }

  /**
   * Track engagement events
   */
  async trackCopyToClipboard(contentType: 'script' | 'hook' | 'title', generationId?: string): Promise<void> {
    await this.track('copy_to_clipboard', {
      content_type: contentType,
      generation_id: generationId,
    });
  }

  async trackSaveToFavorites(generationId: string): Promise<void> {
    await this.track('save_to_favorites', {
      generation_id: generationId,
    });
  }

  /**
   * Track conversion events
   */
  async trackUpgradeModalShown(trigger: string, currentPlan: string): Promise<void> {
    await this.track('upgrade_modal_shown', {
      trigger,
      current_plan: currentPlan,
      conversion_source: window.location.pathname,
    });
  }

  async trackUpgradeInitiated(plan: string, billingCycle: 'monthly' | 'yearly'): Promise<void> {
    await this.track('upgrade_initiated', {
      plan,
      billing_cycle: billingCycle,
      conversion_source: window.location.pathname,
    });
  }

  async trackUpgradeCompleted(plan: string, amount: number, currency: string): Promise<void> {
    await this.track('upgrade_completed', {
      plan,
      amount,
      currency,
      conversion_source: window.location.pathname,
    });
  }

  async trackPricingPageViewed(source?: string): Promise<void> {
    await this.track('pricing_page_viewed', {
      source,
      referrer: document.referrer,
    });
  }

  /**
   * Track demo events
   */
  async trackDemoCompleted(demoData?: Record<string, any>): Promise<void> {
    await this.track('demo_completed', {
      ...demoData,
      demo_completion_source: window.location.pathname,
    });
  }

  /**
   * Track email verification
   */
  async trackEmailVerified(): Promise<void> {
    await this.track('email_verified', {
      verification_source: window.location.pathname,
    });
  }

  /**
   * Batch track multiple events (for performance)
   */
  async trackBatch(events: Array<{ eventType: string; eventData?: Record<string, any> }>): Promise<void> {
    try {
      const payload = events.map(({ eventType, eventData }) => ({
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
        page_url: window.location.href,
      }));

      await apiClient.post('/analytics/track-batch', { events: payload });
    } catch (error) {
      console.warn('Batch analytics tracking failed:', error);
    }
  }

  /**
   * Get default context for events
   */
  private getDefaultContext(): AnalyticsContext {
    return {
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract page name from URL for tracking
   */
  private getPageNameFromUrl(): string {
    const path = window.location.pathname;
    
    // Map common paths to readable names
    const pageMap: Record<string, string> = {
      '/': 'home',
      '/demo': 'demo',
      '/generate': 'generate',
      '/dashboard': 'dashboard',
      '/pricing': 'pricing',
      '/login': 'login',
      '/register': 'register',
      '/verification': 'email-verification',
      '/settings': 'settings',
      '/history': 'generation-history',
    };

    return pageMap[path] || path.replace(/^\//, '') || 'unknown';
  }

  /**
   * Update user context (call when user logs in/out)
   */
  updateContext(newContext: Partial<AnalyticsContext>): void {
    this.context = {
      ...this.context,
      ...newContext,
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export hook for React components
export const useAnalytics = () => {
  return {
    track: analyticsService.track.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackRegistration: analyticsService.trackRegistration.bind(analyticsService),
    trackLogin: analyticsService.trackLogin.bind(analyticsService),
    trackTrialStarted: analyticsService.trackTrialStarted.bind(analyticsService),
    trackGenerationStarted: analyticsService.trackGenerationStarted.bind(analyticsService),
    trackGenerationCompleted: analyticsService.trackGenerationCompleted.bind(analyticsService),
    trackCopyToClipboard: analyticsService.trackCopyToClipboard.bind(analyticsService),
    trackSaveToFavorites: analyticsService.trackSaveToFavorites.bind(analyticsService),
    trackUpgradeModalShown: analyticsService.trackUpgradeModalShown.bind(analyticsService),
    trackUpgradeInitiated: analyticsService.trackUpgradeInitiated.bind(analyticsService),
    trackUpgradeCompleted: analyticsService.trackUpgradeCompleted.bind(analyticsService),
    trackPricingPageViewed: analyticsService.trackPricingPageViewed.bind(analyticsService),
    trackDemoCompleted: analyticsService.trackDemoCompleted.bind(analyticsService),
    trackEmailVerified: analyticsService.trackEmailVerified.bind(analyticsService),
    trackBatch: analyticsService.trackBatch.bind(analyticsService),
  };
};