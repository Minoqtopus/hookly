'use client';

import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'attention':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
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
        return 'Demo ending soon';
      case 'warning':
        return 'Demo ending soon';
      case 'attention':
        return 'Demo ending soon';
      default:
        return 'Demo in progress';
    }
  };

  const getUrgencySubtext = () => {
    switch (urgencyLevel) {
      case 'critical':
        return 'Sign up to save your work';
      case 'warning':
        return 'Sign up to save your work';
      case 'attention':
        return 'Sign up to save your work';
      default:
        return '';
    }
  };

  if (isExpired) {
    return (
      <div className={`rounded-lg border-2 p-4 bg-red-50 border-red-200 text-center ${className}`}>
        <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
        <div className="font-semibold text-red-800">Demo Complete!</div>
        <div className="text-sm text-red-600">Sign up to save your work and continue creating</div>
      </div>
    );
  }

  // Don't show timer for first 4 minutes to reduce anxiety
  if (timeLeft > 240) {
    return (
      <div className={`rounded-lg border p-2 bg-gray-50 border-gray-200 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-3 w-3 text-gray-600" />
          <div className="text-xs text-gray-600">
            Demo Active
          </div>
        </div>
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
        {timeLeft <= 120 && (
          <div className="font-mono text-lg font-bold">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      <div className="text-center text-xs mt-1 opacity-90">
        {getUrgencySubtext()}
      </div>
    </div>
  );
}