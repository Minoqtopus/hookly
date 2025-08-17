'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

interface DemoTimerProps {
  onExpiry: () => void;
  onAlmostExpired?: () => void; // 1 minute warning
  className?: string;
}

export default function DemoTimer({ onExpiry, onAlmostExpired, className = '' }: DemoTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [almostExpiredTriggered, setAlmostExpiredTriggered] = useState(false);

  useEffect(() => {
    const DEMO_TIMER_KEY = 'demo_timer_start';
    const DEMO_DURATION_KEY = 'demo_duration';
    
    const startTimeStr = sessionStorage.getItem(DEMO_TIMER_KEY);
    const durationStr = sessionStorage.getItem(DEMO_DURATION_KEY);
    
    if (!startTimeStr || !durationStr) {
      // No demo timer active
      return;
    }

    const startTime = parseInt(startTimeStr);
    const duration = parseInt(durationStr);
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      setIsExpired(true);
      onExpiry();
      return;
    }

    setTimeLeft(remaining);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        
        const newTime = prev - 1;
        
        // Trigger almost expired callback at 1 minute (60 seconds)
        if (newTime === 60 && !almostExpiredTriggered && onAlmostExpired) {
          setAlmostExpiredTriggered(true);
          onAlmostExpired();
        }
        
        if (newTime <= 0) {
          clearInterval(timer);
          setIsExpired(true);
          onExpiry();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpiry, onAlmostExpired, almostExpiredTriggered]);

  if (timeLeft === null) {
    return null; // No demo timer active
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyLevel = () => {
    if (timeLeft <= 30) return 'critical'; // Last 30 seconds
    if (timeLeft <= 60) return 'warning';  // Last minute
    if (timeLeft <= 120) return 'attention'; // Last 2 minutes
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  const getColorClasses = () => {
    switch (urgencyLevel) {
      case 'critical':
        return 'bg-red-500 text-white border-red-600 animate-pulse';
      case 'warning':
        return 'bg-orange-500 text-white border-orange-600';
      case 'attention':
        return 'bg-yellow-500 text-white border-yellow-600';
      default:
        return 'bg-primary-500 text-white border-primary-600';
    }
  };

  const getIcon = () => {
    switch (urgencyLevel) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyMessage = () => {
    switch (urgencyLevel) {
      case 'critical':
        return 'Demo expiring soon!';
      case 'warning':
        return 'Less than 1 minute left!';
      case 'attention':
        return 'Demo time running low';
      default:
        return 'Demo time remaining';
    }
  };

  if (isExpired) {
    return (
      <div className={`rounded-lg border-2 p-4 bg-red-50 border-red-200 text-center ${className}`}>
        <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
        <div className="font-semibold text-red-800">Demo Time Expired!</div>
        <div className="text-sm text-red-600">Sign up to continue creating ads</div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-3 ${getColorClasses()} ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        {getIcon()}
        <div className="font-semibold text-sm">
          {getUrgencyMessage()}
        </div>
        <div className="font-mono text-lg font-bold">
          {formatTime(timeLeft)}
        </div>
      </div>
      
      {urgencyLevel !== 'normal' && (
        <div className="text-center text-xs mt-1 opacity-90">
          {urgencyLevel === 'critical' 
            ? 'Sign up now to save your progress!'
            : urgencyLevel === 'warning'
            ? 'Create account to continue unlimited'
            : 'Sign up for unlimited generations'
          }
        </div>
      )}
    </div>
  );
}