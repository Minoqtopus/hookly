'use client';

import { useCallback, useEffect, useState } from 'react';

interface DemoOptimizationState {
  shouldShowSignup: boolean; // Changed from shouldShowUpgrade
  signupReason: 'engagement' | 'time' | 'generations' | 'feature_discovery';
  signupMessage: string;
  signupUrgency: 'low' | 'medium' | 'high';
}

interface UserBehavior {
  generationsCreated: number;
  timeSpent: number;
  featuresExplored: string[];
  demoTimeLeft: number;
}

export function useDemoOptimization() {
  const [state, setState] = useState<DemoOptimizationState>({
    shouldShowSignup: false, // Changed from shouldShowUpgrade
    signupReason: 'engagement',
    signupMessage: '',
    signupUrgency: 'low',
  });

  const analyzeUserBehavior = useCallback((): UserBehavior => {
    // Get demo start time
    const startTimeStr = sessionStorage.getItem('demo_timer_start');
    const startTime = startTimeStr ? parseInt(startTimeStr) : Date.now();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Get demo duration
    const durationStr = sessionStorage.getItem('demo_duration');
    const duration = durationStr ? parseInt(durationStr) : 300;
    const demoTimeLeft = Math.max(0, duration - timeSpent);

    // Count generations (this would need to be tracked in your app state)
    const generationsCreated = parseInt(sessionStorage.getItem('demo_generations') || '0');

    // Track features explored
    const featuresExplored = JSON.parse(sessionStorage.getItem('demo_features') || '[]');

    return {
      generationsCreated,
      timeSpent,
      featuresExplored,
      demoTimeLeft,
    };
  }, []);

  const shouldTriggerUpgrade = useCallback((behavior: UserBehavior): DemoOptimizationState => {
    const { generationsCreated, timeSpent, demoTimeLeft } = behavior;

    // CRITICAL: Don't show upgrade until user has actually engaged
    // Wait for at least 1 generation before considering any upgrade triggers
    if (generationsCreated === 0) {
      return {
        shouldShowSignup: false, // Changed from shouldShowUpgrade
        signupReason: 'engagement',
        signupMessage: '',
        signupUrgency: 'low',
      };
    }

    // CRITICAL: Minimum delay before any upgrade triggers (2 minutes)
    // This prevents the modal from appearing immediately
    if (timeSpent < 120) {
      return {
        shouldShowSignup: false, // Changed from shouldShowUpgrade
        signupReason: 'engagement',
        signupMessage: '',
        signupUrgency: 'low',
      };
    }

    // High engagement trigger (multiple generations) - MOST IMPORTANT
    if (generationsCreated >= 3) {
      return {
        shouldShowSignup: true, // Changed from shouldShowUpgrade
        signupReason: 'generations',
        signupMessage: 'You\'ve created 3 amazing ads! Sign up to save them all and create unlimited more.',
        signupUrgency: 'high',
      };
    }

    // Time-based trigger (demo ending soon) - ONLY in last 30 seconds
    if (demoTimeLeft <= 30) {
      return {
        shouldShowSignup: true, // Changed from shouldShowUpgrade
        signupReason: 'time',
        signupMessage: 'Demo ending! Save your work before time runs out.',
        signupUrgency: 'high',
      };
    }

    // Engagement trigger (time spent exploring) - ONLY after 4 minutes
    if (timeSpent >= 240 && generationsCreated >= 2) {
      return {
        shouldShowSignup: true, // Changed from shouldShowUpgrade
        signupReason: 'engagement',
        signupMessage: 'You\'re clearly loving this tool! Ready to unlock unlimited access?',
        signupUrgency: 'medium',
      };
    }

    // Feature discovery trigger - ONLY after exploring 5+ features
    if (behavior.featuresExplored.length >= 5 && generationsCreated >= 2) {
      return {
        shouldShowSignup: true, // Changed from shouldShowUpgrade
        signupReason: 'feature_discovery',
        signupMessage: 'You\'ve explored the basics. Ready for advanced features?',
        signupUrgency: 'medium',
      };
    }

    // No upgrade trigger - let user explore freely
    return {
      shouldShowSignup: false, // Changed from shouldShowUpgrade
      signupReason: 'engagement',
      signupMessage: '',
      signupUrgency: 'low',
    };
  }, []);

  const trackGeneration = useCallback(() => {
    const current = parseInt(sessionStorage.getItem('demo_generations') || '0');
    sessionStorage.setItem('demo_generations', (current + 1).toString());
  }, []);

  const trackFeatureExploration = useCallback((feature: string) => {
    const features = JSON.parse(sessionStorage.getItem('demo_features') || '[]');
    if (!features.includes(feature)) {
      features.push(feature);
      sessionStorage.setItem('demo_features', JSON.stringify(features));
    }
  }, []);

  useEffect(() => {
    // Only run optimization if there's an active demo timer
    const startTimeStr = sessionStorage.getItem('demo_timer_start');
    const durationStr = sessionStorage.getItem('demo_duration');
    
    if (!startTimeStr || !durationStr) {
      // No demo timer active, don't run optimization
      setState({
        shouldShowSignup: false, // Changed from shouldShowUpgrade
        signupReason: 'engagement',
        signupMessage: '',
        signupUrgency: 'low',
      });
      return;
    }

    const checkOptimization = () => {
      const behavior = analyzeUserBehavior();
      const optimization = shouldTriggerUpgrade(behavior);
      
      // Debug logging to track trigger behavior
      if (process.env.NODE_ENV === 'development') {
        console.log('Demo Optimization Check:', {
          timeSpent: behavior.timeSpent,
          generationsCreated: behavior.generationsCreated,
          demoTimeLeft: behavior.demoTimeLeft,
          featuresExplored: behavior.featuresExplored.length,
          shouldShowUpgrade: optimization.shouldShowSignup, // Changed from shouldShowUpgrade
          reason: optimization.signupReason
        });
      }
      
      setState(optimization);
    };

    // Check every 30 seconds
    const interval = setInterval(checkOptimization, 30000);
    checkOptimization(); // Initial check

    return () => clearInterval(interval);
  }, [analyzeUserBehavior, shouldTriggerUpgrade]);

  return {
    ...state,
    trackGeneration,
    trackFeatureExploration,
    analyzeUserBehavior,
  };
}
