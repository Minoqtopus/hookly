'use client';

import React, { useCallback, useEffect } from 'react';
import { useAuth } from './AppContext';
import { AnalyticsService, EventType } from './analytics';

/**
 * Custom hook for analytics tracking throughout the application
 * Provides convenient methods for tracking user behavior and engagement
 */
export function useAnalytics() {
  const { user, isAuthenticated } = useAuth();

  // Track page views automatically
  const trackPageView = useCallback((page: string, additionalData?: any) => {
    AnalyticsService.trackPageView(page, !isAuthenticated);
    
    if (additionalData) {
      AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
        eventData: { 
          page, 
          url: window.location.href,
          user_plan: user?.plan,
          ...additionalData 
        },
        anonymous: !isAuthenticated,
      });
    }
  }, [isAuthenticated, user?.plan]);

  // Track user engagement
  const trackEngagement = useCallback((action: string, context?: any) => {
    AnalyticsService.trackFeatureUsage(action, {
      user_plan: user?.plan,
      is_trial_user: user?.plan === 'trial',
      ...context,
    });
  }, [user?.plan]);

  // Track conversion funnel events
  const trackConversionEvent = useCallback((stage: string, data?: any) => {
    const conversionData = {
      funnel_stage: stage,
      user_plan: user?.plan,
      trial_days_remaining: user?.trial_ends_at ? 
        Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
      generations_used: user?.trial_generations_used || user?.monthly_generation_count || 0,
      ...data,
    };

    switch (stage) {
      case 'demo_completed':
        AnalyticsService.trackDemoCompletion(conversionData);
        break;
      case 'signup_started':
        AnalyticsService.trackEvent(EventType.USER_SIGNUP, {
          eventData: conversionData,
          anonymous: true,
        });
        break;
      case 'trial_started':
        AnalyticsService.trackEvent(EventType.TRIAL_STARTED, {
          eventData: conversionData,
        });
        break;
      case 'upgrade_modal_shown':
        AnalyticsService.trackUpgradeModal(data?.source || 'unknown');
        break;
      case 'upgrade_initiated':
        AnalyticsService.trackUpgradeInitiated(data?.plan || 'unknown', data?.source || 'unknown');
        break;
      case 'upgrade_completed':
        AnalyticsService.trackEvent(EventType.UPGRADE_COMPLETED, {
          eventData: conversionData,
        });
        break;
      default:
        AnalyticsService.trackFeatureUsage(stage, conversionData);
    }
  }, [user]);

  // Track generation performance
  const trackGenerationPerformance = useCallback((data: {
    generationId?: string;
    success: boolean;
    duration?: number;
    templateId?: string;
    provider?: string;
    tokenUsage?: number;
    cost?: number;
  }) => {
    const performanceData = {
      ...data,
      user_plan: user?.plan,
      generation_count: user?.trial_generations_used || user?.monthly_generation_count || 0,
    };

    if (data.success) {
      AnalyticsService.trackEvent(EventType.GENERATION_COMPLETED, {
        eventData: performanceData,
      });
    } else {
      AnalyticsService.trackEvent(EventType.GENERATION_FAILED, {
        eventData: performanceData,
      });
    }
  }, [user]);

  // Track user interactions
  const trackInteraction = useCallback((interaction: string, data?: any) => {
    const interactionData = {
      interaction_type: interaction,
      user_plan: user?.plan,
      timestamp: new Date().toISOString(),
      ...data,
    };

    switch (interaction) {
      case 'copy_to_clipboard':
        AnalyticsService.trackCopyToClipboard(data?.content_type || 'unknown', data?.source || 'unknown');
        break;
      case 'share_generation':
        AnalyticsService.trackShareGeneration(data?.generation_id, data?.method || 'unknown');
        break;
      case 'favorite_toggle':
        AnalyticsService.trackFavoriteToggle(data?.generation_id, data?.is_favorite);
        break;
      case 'template_usage':
        AnalyticsService.trackTemplateUsage(data?.template_id, data?.template_niche);
        break;
      default:
        AnalyticsService.trackFeatureUsage(interaction, interactionData);
    }
  }, [user]);

  // Track session duration and engagement metrics
  useEffect(() => {
    if (!isAuthenticated) return;

    const sessionStart = Date.now();
    const trackingInterval = setInterval(() => {
      const sessionDuration = Date.now() - sessionStart;
      
      // Track engagement every 30 seconds for active users
      AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
        eventData: {
          session_duration: sessionDuration,
          page: window.location.pathname,
          user_plan: user?.plan,
          is_active_session: true,
        },
      });
    }, 30000); // Track every 30 seconds

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const finalSessionDuration = Date.now() - sessionStart;
      AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
        eventData: {
          session_duration: finalSessionDuration,
          session_end: true,
          user_plan: user?.plan,
        },
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(trackingInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Track session end on component unmount
    };
  }, [isAuthenticated, user?.plan]);

  return {
    trackPageView,
    trackEngagement,
    trackConversionEvent,
    trackGenerationPerformance,
    trackInteraction,
    
    // Direct access to analytics service for custom tracking
    trackCustomEvent: AnalyticsService.trackEvent,
  };
}

/**
 * Higher-order component for automatic page view tracking
 */
export function withAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  pageName: string,
  additionalData?: any
) {
  const AnalyticsWrapper = (props: T) => {
    const { trackPageView } = useAnalytics();

    useEffect(() => {
      trackPageView(pageName, additionalData);
    }, [trackPageView]);

    return React.createElement(WrappedComponent, props);
  };
  
  return AnalyticsWrapper;
}

/**
 * Hook for tracking user behavior patterns and feature adoption
 */
export function useUserBehaviorTracking() {
  const { user } = useAuth();
  
  const trackFeatureAdoption = useCallback((feature: string, adopted: boolean, context?: any) => {
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        feature_adoption: feature,
        adopted,
        user_plan: user?.plan,
        days_since_signup: user?.created_at ? 
          Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null,
        ...context,
      },
    });
  }, [user]);

  const trackUserJourney = useCallback((stage: string, data?: any) => {
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        user_journey_stage: stage,
        user_plan: user?.plan,
        generations_created: user?.trial_generations_used || user?.monthly_generation_count || 0,
        is_beta_user: user?.is_beta_user,
        ...data,
      },
    });
  }, [user]);

  const trackRetentionMetric = useCallback((metric: string, value: number, context?: any) => {
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        retention_metric: metric,
        metric_value: value,
        user_plan: user?.plan,
        days_active: user?.created_at ? 
          Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null,
        ...context,
      },
    });
  }, [user]);

  return {
    trackFeatureAdoption,
    trackUserJourney,
    trackRetentionMetric,
  };
}
