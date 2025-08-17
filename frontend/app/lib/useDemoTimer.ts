import { useState, useEffect, useCallback } from 'react';

interface DemoState {
  isActive: boolean;
  timeLeft: number | null;
  isExpired: boolean;
  startTime: number | null;
  duration: number | null;
}

export function useDemoTimer() {
  const [demoState, setDemoState] = useState<DemoState>({
    isActive: false,
    timeLeft: null,
    isExpired: false,
    startTime: null,
    duration: null,
  });

  const DEMO_TIMER_KEY = 'demo_timer_start';
  const DEMO_DURATION_KEY = 'demo_duration';

  const checkDemoStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const startTimeStr = sessionStorage.getItem(DEMO_TIMER_KEY);
    const durationStr = sessionStorage.getItem(DEMO_DURATION_KEY);

    if (!startTimeStr || !durationStr) {
      setDemoState({
        isActive: false,
        timeLeft: null,
        isExpired: false,
        startTime: null,
        duration: null,
      });
      return;
    }

    const startTime = parseInt(startTimeStr);
    const duration = parseInt(durationStr);
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      setDemoState({
        isActive: true,
        timeLeft: 0,
        isExpired: true,
        startTime,
        duration,
      });
    } else {
      setDemoState({
        isActive: true,
        timeLeft: remaining,
        isExpired: false,
        startTime,
        duration,
      });
    }
  }, []);

  const startDemo = useCallback((durationSeconds = 300) => {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    sessionStorage.setItem(DEMO_TIMER_KEY, startTime.toString());
    sessionStorage.setItem(DEMO_DURATION_KEY, durationSeconds.toString());
    
    setDemoState({
      isActive: true,
      timeLeft: durationSeconds,
      isExpired: false,
      startTime,
      duration: durationSeconds,
    });
  }, []);

  const endDemo = useCallback(() => {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem(DEMO_TIMER_KEY);
    sessionStorage.removeItem(DEMO_DURATION_KEY);
    
    setDemoState({
      isActive: false,
      timeLeft: null,
      isExpired: false,
      startTime: null,
      duration: null,
    });
  }, []);

  const extendDemo = useCallback((additionalSeconds: number) => {
    if (typeof window === 'undefined') return;
    
    const currentDuration = parseInt(sessionStorage.getItem(DEMO_DURATION_KEY) || '0');
    const newDuration = currentDuration + additionalSeconds;
    
    sessionStorage.setItem(DEMO_DURATION_KEY, newDuration.toString());
    checkDemoStatus();
  }, [checkDemoStatus]);

  // Check demo status on mount and when storage changes
  useEffect(() => {
    checkDemoStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEMO_TIMER_KEY || e.key === DEMO_DURATION_KEY) {
        checkDemoStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkDemoStatus]);

  // Periodic check to update time left
  useEffect(() => {
    if (!demoState.isActive || demoState.isExpired) return;

    const interval = setInterval(checkDemoStatus, 1000);
    return () => clearInterval(interval);
  }, [demoState.isActive, demoState.isExpired, checkDemoStatus]);

  return {
    ...demoState,
    startDemo,
    endDemo,
    extendDemo,
    checkDemoStatus,
  };
}