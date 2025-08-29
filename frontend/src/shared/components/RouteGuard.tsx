/**
 * Route Guard Component - Route-Level Protection
 * 
 * Staff Engineer Implementation:
 * - Two route types: Public (guest only) and Protected (authenticated only)
 * - Reusable route protection component
 * - Loading states and redirects
 * - Integration with useAuth hook
 */

'use client';

import { useAuth } from '@/domains/auth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

// ================================
// Types
// ================================

export interface RouteGuardProps {
  children: ReactNode;
  type: 'public' | 'protected';
  fallback?: ReactNode;
  redirectTo?: string;
}

// ================================
// Component
// ================================

export function RouteGuard({ 
  children, 
  type, 
  fallback,
  redirectTo 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    switch (type) {
      case 'public':
        // Guest users only - redirect authenticated users
        if (isAuthenticated) {
          const target = redirectTo || '/dashboard';
          console.log(`[ROUTE_GUARD] Authenticated user redirected from public route to ${target}`);
          router.push(target);
        }
        break;

      case 'protected':
        // Authenticated users only - redirect guest users
        if (!isAuthenticated) {
          const target = redirectTo || '/login';
          console.log(`[ROUTE_GUARD] Guest user redirected from protected route to ${target}`);
          router.push(target);
        }
        break;
    }
  }, [isAuthenticated, isLoading, type, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show redirect state for public routes when authenticated
  if (type === 'public' && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show redirect state for protected routes when not authenticated
  if (type === 'protected' && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if access is allowed
  return <>{children}</>;
}
