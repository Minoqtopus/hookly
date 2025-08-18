'use client';

import { useState, useEffect } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';

export default function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = AuthService.getStoredUser();
    setUser(currentUser);
    
    // Show banner if user is logged in but not verified
    if (currentUser && !currentUser.is_verified && currentUser.auth_provider === 'email') {
      setIsVisible(true);
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!canResend || isResending) return;

    const tokens = AuthService.getStoredTokens();
    if (!tokens?.accessToken) return;

    setIsResending(true);
    setCanResend(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setResendCooldown(60); // 60 second cooldown
      } else {
        setCanResend(true);
      }
    } catch (error) {
      console.error('Failed to resend verification:', error);
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Please verify your email address
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              We sent a verification email to <strong>{user?.email}</strong>. 
              Check your inbox and click the link to verify your account.
            </p>
            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={handleResendVerification}
                disabled={!canResend || isResending}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend email'
                    }
                  </>
                )}
              </button>
              <span className="text-yellow-600">•</span>
              <span className="text-sm text-yellow-700">
                Check your spam folder
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-yellow-400 hover:text-yellow-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}