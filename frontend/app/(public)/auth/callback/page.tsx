/**
 * OAuth Callback Page - Handles Backend OAuth Redirects
 * 
 * Staff Engineer Implementation:
 * - Receives JWT tokens from backend OAuth callback
 * - Processes authentication tokens from URL parameters
 * - Stores tokens and updates auth state
 * - Redirects to dashboard on success
 * 
 * IMPORTANT: This is NOT a Google OAuth callback!
 * Backend processes OAuth and redirects here with tokens.
 * 
 * Staff Engineer Note: Avoid useSearchParams build-time issues
 * by using window.location directly in useEffect
 */

'use client';

import { useAuth } from '@/src/domains/auth';
import { TokenService } from '@/src/shared/services';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OAuthCallbackPage() {
  const { getCurrentUser, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Create token service instance
  const tokenService = new TokenService();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Staff Engineer Solution: Use window.location to avoid build-time issues
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const userParam = urlParams.get('user');

        console.log('[OAUTH_CALLBACK] Processing backend OAuth redirect');

        // Validate required parameters
        if (!accessToken || !refreshToken || !userParam) {
          console.error('[OAUTH_CALLBACK] Missing required parameters');
          setError('Missing authentication data from OAuth callback');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Parse user data
        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
        } catch (parseError) {
          console.error('[OAUTH_CALLBACK] Failed to parse user data:', parseError);
          setError('Invalid user data from OAuth callback');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        console.log('[OAUTH_CALLBACK] User data parsed:', userData);

        // Store tokens in token service
        tokenService.setAccessToken(accessToken);
        tokenService.setRefreshToken(refreshToken);

        // Get current user to update auth state
        await getCurrentUser();
        
        console.log('[OAUTH_CALLBACK] OAuth successful, redirecting to dashboard');
        router.push('/dashboard');

      } catch (error) {
        console.error('[OAUTH_CALLBACK] Unexpected error:', error);
        setError('Unexpected error during OAuth callback');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [getCurrentUser, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing OAuth sign-in...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-lg font-semibold mb-2">Authentication Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to login page...</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing OAuth sign-in...</p>
      </div>
    </div>
  );
}
