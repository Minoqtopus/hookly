/**
 * Public Layout - Guest User Protection
 * 
 * Staff Engineer Implementation:
 * - Redirects authenticated users away from public-only routes
 * - Guest-only access for login, register, demo
 * - Integration with useAuth hook for state management
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/src/domains/auth';
import { useRouter, usePathname } from 'next/navigation';

// ================================
// Types
// ================================

interface PublicLayoutProps {
  children: ReactNode;
}

// ================================
// Component
// ================================

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define public-only routes (guest users only)
  const publicOnlyRoutes = ['/login', '/register', '/demo'];
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

  // Guest user protection effect
  useEffect(() => {
    if (!isLoading && isAuthenticated && isPublicOnlyRoute) {
      console.log(`[PUBLIC_LAYOUT] Authenticated user redirected from ${pathname} to /dashboard`);
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, pathname, isPublicOnlyRoute]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirect state for authenticated users on public-only routes
  if (isAuthenticated && isPublicOnlyRoute) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Render public content for guest users
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Viral Content Generator
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="/pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </a>
              <a href="/demo" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Demo
              </a>
              <a href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </a>
              <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}