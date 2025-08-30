/**
 * OAuth Error Page - Handles OAuth Authentication Failures
 * 
 * Staff Engineer Implementation:
 * - Displays OAuth error messages
 * - Provides user-friendly error handling
 * - Redirects back to login with proper messaging
 */

'use client';

import { Suspense } from 'react';
import { OAuthErrorContent } from '@/components/feature/auth';

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OAuthErrorContent />
    </Suspense>
  );
}
