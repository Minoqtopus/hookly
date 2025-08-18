'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Mail, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';

function VerifyEmailPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already_verified'>('loading');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setStatus('error');
    }
  }, [token]);

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

  const verifyEmailToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        
        // If user is logged in, update their verification status
        const currentUser = AuthService.getStoredUser();
        if (currentUser) {
          AuthService.storeUser({ ...currentUser, is_verified: true });
        }
      } else {
        if (data.message?.includes('expired')) {
          setStatus('expired');
        } else if (data.message?.includes('already verified')) {
          setStatus('already_verified');
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      setStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (!canResend || isResending) return;

    const user = AuthService.getStoredUser();
    const tokens = AuthService.getStoredTokens();

    if (!user || !tokens?.accessToken) {
      router.push('/');
      return;
    }

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying your email...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your email address
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You now have full access to all Hookly features.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's unlocked:</h3>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li>✅ Account security</li>
              <li>✅ Password reset capability</li>
              <li>✅ Email notifications</li>
              <li>✅ Full feature access</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary w-full flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/generate')}
              className="btn-secondary w-full"
            >
              Create New Ad
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'already_verified') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Already Verified
          </h2>
          <p className="text-gray-600 mb-6">
            Your email is already verified. You're all set to use Hookly!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary w-full flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error or expired states
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600 mb-6">
          {status === 'expired' 
            ? 'This verification link has expired. Please request a new one.' 
            : 'We couldn\'t verify your email. The link may be invalid or expired.'
          }
        </p>

        {AuthService.getStoredTokens() ? (
          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={!canResend || isResending}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Send New Link'
                  }
                </>
              )}
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary w-full"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Sign In to Resend
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Check your spam folder
              </p>
              <p className="text-xs text-yellow-700">
                Verification emails sometimes end up in spam. Look for an email from Hookly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}