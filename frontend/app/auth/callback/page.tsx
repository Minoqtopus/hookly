'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';

function AuthCallbackPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [user, setUser] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      AuthService.storeTokens(accessToken, refreshToken);
      
      // Decode user info from token (in real app, fetch from API)
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const userData = {
          id: tokenPayload.sub,
          email: tokenPayload.email,
          plan: 'trial' as const,
          auth_provider: 'google' as const,
          is_verified: true
        };
        
        AuthService.storeUser(userData);
        setUser(userData);
        setStatus('success');

        // Auto-redirect after success animation
        setTimeout(() => {
          setRedirecting(true);
          
          // Check for stored redirect path from middleware
          const postAuthRedirect = sessionStorage.getItem('post_auth_redirect');
          
          // Check if there's pending demo data to restore
          const pendingDemo = sessionStorage.getItem('pendingDemoData');
          
          if (pendingDemo) {
            sessionStorage.removeItem('pendingDemoData');
            router.push('/generate?restored=true');
          } else if (postAuthRedirect) {
            sessionStorage.removeItem('post_auth_redirect');
            router.push(postAuthRedirect);
          } else {
            router.push('/dashboard');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Failed to process auth callback:', error);
        setStatus('error');
      }
    } else {
      setStatus('error');
    }
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Setting up your account...
          </h2>
          <p className="text-gray-600">
            This will just take a moment
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't complete your signup. Let's try again!
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
          </div>
          
          {/* Confetti Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce">
              <Sparkles className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Hookly! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          {user?.email && (
            <>Hi {user.email.split('@')[0]}! </>
          )}
          Your account is ready and your demos are saved.
        </p>

        {/* Benefits Reminder */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What's next?</h3>
          <ul className="text-sm text-gray-700 space-y-1 text-left">
            <li>✨ Create unlimited ad variations</li>
            <li>📊 Track your ad performance</li>
            <li>💾 Save and organize your favorites</li>
            <li>🚀 Access advanced features</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          {redirecting ? (
            <div className="btn-primary w-full flex items-center justify-center cursor-not-allowed">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Taking you to your dashboard...
            </div>
          ) : (
            <button
              onClick={() => {
                setRedirecting(true);
                router.push('/dashboard');
              }}
              className="btn-primary w-full flex items-center justify-center"
            >
              Continue to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
          
          <button
            onClick={() => router.push('/generate')}
            className="btn-secondary w-full"
          >
            Create Another Ad
          </button>
        </div>

        {/* Trust Message */}
        <p className="text-xs text-gray-500 mt-6">
          🔒 Your data is secure and private. We'll never spam you.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AuthCallbackPageContent />
    </Suspense>
  );
}