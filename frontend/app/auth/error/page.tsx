'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get('message') || 'unknown';

  const getErrorContent = () => {
    switch (errorMessage) {
      case 'oauth_failed':
        return {
          title: 'Authentication Failed',
          message: 'We couldn\'t complete your Google sign-in. This usually happens due to a temporary issue.',
          suggestion: 'Please try signing in again, or check your internet connection.',
          actionText: 'Try Again',
          action: () => AuthService.initiateGoogleAuth()
        };
      case 'session_expired':
        return {
          title: 'Session Expired',
          message: 'Your login session has expired for security reasons.',
          suggestion: 'Please sign in again to continue using AI UGC.',
          actionText: 'Sign In',
          action: () => router.push('/auth/login')
        };
      case 'access_denied':
        return {
          title: 'Access Denied',
          message: 'You cancelled the Google sign-in process.',
          suggestion: 'To use AI UGC, we need you to sign in with Google to save your ads.',
          actionText: 'Try Signing In',
          action: () => AuthService.initiateGoogleAuth()
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'We encountered an unexpected error during sign-in.',
          suggestion: 'Please try again, or contact support if the problem persists.',
          actionText: 'Try Again',
          action: () => router.push('/')
        };
    }
  };

  const error = getErrorContent();

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

        {/* Error Card */}
        <div className="card text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          {/* Error Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error.title}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 {error.suggestion}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={error.action}
              className="btn-primary w-full flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {error.actionText}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="btn-secondary w-full flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Try Free Demo Instead
            </button>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Still having trouble?
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Make sure you allow popups for this site</p>
              <p>• Clear your browser cache and try again</p>
              <p>• Check that you're using a supported browser</p>
            </div>
            
            <div className="mt-4">
              <a 
                href="mailto:support@aiugc.com"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>

        {/* Alternative Option */}
        <div className="mt-6 p-4 bg-white/50 rounded-xl border border-white/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Want to try AI UGC without signing in?
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Use the free demo instead →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}