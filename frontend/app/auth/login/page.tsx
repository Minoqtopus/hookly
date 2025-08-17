'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Store redirect path for post-auth navigation
    if (redirectPath && redirectPath !== '/dashboard') {
      sessionStorage.setItem('post_auth_redirect', redirectPath);
    }
    
    AuthService.initiateGoogleAuth();
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        {/* Main Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600">
              Continue creating viral ads in seconds
            </p>
          </div>

          {/* Quick Stats for Motivation */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">
                🔥 While you were away...
              </p>
              <p className="text-xs text-gray-600">
                Our users generated <span className="font-semibold">2,847 new ads</span> and got <span className="font-semibold">15.2M views</span>
              </p>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
                Signing you in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Benefits Reminder */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Your account includes:</h3>
            <ul className="space-y-2">
              {[
                'All your saved ad campaigns',
                'Generation history and analytics',
                'Favorite ads collection',
                'Custom templates (Pro)',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
            <Shield className="h-3 w-3 mr-1" />
            <span>Secure login • Your data stays private</span>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              New to Hookly?{' '}
              <Link href="/" className="font-medium text-primary-600 hover:text-primary-700">
                Try the free demo
              </Link>
            </p>
          </div>
        </div>

        {/* Social Proof Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Trusted by <span className="font-medium">10,000+ creators</span> worldwide
          </p>
        </div>
      </div>
    </div>
  );
}