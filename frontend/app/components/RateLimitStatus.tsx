'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { RateLimitManager } from '@/app/lib/rate-limit';

interface RateLimitStatusProps {
  endpoint?: string;
  className?: string;
}

export default function RateLimitStatus({ endpoint = 'general', className = '' }: RateLimitStatusProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState(RateLimitManager.getStoredRateLimitInfo(endpoint));
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  const endpointLimits = RateLimitManager.getEndpointLimits();
  const endpointConfig = endpointLimits[endpoint] || endpointLimits.general;

  useEffect(() => {
    // Update stored rate limit info periodically
    const interval = setInterval(() => {
      const stored = RateLimitManager.getStoredRateLimitInfo(endpoint);
      setRateLimitInfo(stored);
      
      if (stored && stored.resetTime) {
        setTimeUntilReset(RateLimitManager.getTimeUntilReset(stored.resetTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endpoint]);

  // Don't show if no rate limit info available
  if (!rateLimitInfo) {
    return null;
  }

  const shouldShowWarning = RateLimitManager.shouldShowWarning(rateLimitInfo);
  const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100;
  
  return (
    <div className={`${className}`}>
      {shouldShowWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Rate Limit Warning
              </h4>
              <p className="text-sm text-yellow-700">
                You have {rateLimitInfo.remaining} of {rateLimitInfo.limit} {endpointConfig.description.toLowerCase()} remaining.
              </p>
              {timeUntilReset && (
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Resets in {timeUntilReset}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for showing rate limit info in a compact format
export function RateLimitIndicator({ endpoint = 'general', className = '' }: RateLimitStatusProps) {
  const [rateLimitInfo, setRateLimitInfo] = useState(RateLimitManager.getStoredRateLimitInfo(endpoint));

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = RateLimitManager.getStoredRateLimitInfo(endpoint);
      setRateLimitInfo(stored);
    }, 5000);

    return () => clearInterval(interval);
  }, [endpoint]);

  if (!rateLimitInfo) {
    return null;
  }

  const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100;
  const isLow = percentage <= 20;
  
  return (
    <div className={`flex items-center text-sm ${isLow ? 'text-yellow-600' : 'text-gray-500'} ${className}`}>
      <Shield className="h-4 w-4 mr-1" />
      <span>{rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
    </div>
  );
}

// Hook for handling rate limits in API calls
export function useRateLimit(endpoint: string) {
  const [rateLimitInfo, setRateLimitInfo] = useState(RateLimitManager.getStoredRateLimitInfo(endpoint));

  const updateRateLimit = (info: any) => {
    setRateLimitInfo(info);
    RateLimitManager.storeRateLimitInfo(endpoint, info);
  };

  const fetchWithRateLimit = async (url: string, options?: RequestInit) => {
    try {
      const { response, rateLimitInfo } = await RateLimitManager.fetchWithRateLimit(url, options);
      
      if (rateLimitInfo) {
        updateRateLimit(rateLimitInfo);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    rateLimitInfo,
    shouldShowWarning: rateLimitInfo ? RateLimitManager.shouldShowWarning(rateLimitInfo) : false,
    fetchWithRateLimit,
    updateRateLimit,
  };
}