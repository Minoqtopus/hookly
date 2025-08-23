'use client';

import { useState, useEffect } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/app/lib/context';

export default function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { user } = useAuth();

  useEffect(() => {
    // Show banner if user exists but is not verified
    if (user && !user.email_verified) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    try {
      // Mock resend for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCanResend(false);
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage for this session
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Mail className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Verify your email address</strong> to unlock full access to Hookly.
              We sent a verification link to <strong>{user.email}</strong>.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canResend ? (
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="inline-flex items-center gap-1 text-sm text-yellow-800 hover:text-yellow-900 font-medium"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          ) : (
            <span className="text-sm text-yellow-700">
              Resend in {resendCooldown}s
            </span>
          )}
          
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}