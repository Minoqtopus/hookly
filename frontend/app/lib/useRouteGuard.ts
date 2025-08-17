'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AppContext';

export type RouteAccess = 'public' | 'guest-only' | 'protected' | 'mixed';

interface RouteGuardConfig {
  access: RouteAccess;
  redirectTo?: string;
}

export function useRouteGuard(config: RouteGuardConfig) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const { access, redirectTo } = config;

    if (access === 'protected' && !isAuthenticated) {
      router.push(redirectTo || '/');
      return;
    }

    if (access === 'guest-only' && isAuthenticated) {
      router.push(redirectTo || '/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, config, router]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: !isLoading && (
      config.access === 'public' ||
      (config.access === 'protected' && isAuthenticated) ||
      (config.access === 'guest-only' && !isAuthenticated) ||
      config.access === 'mixed'
    )
  };
}

export const routeConfigs = {
  landing: { access: 'guest-only' as const, redirectTo: '/dashboard' },
  examples: { access: 'guest-only' as const, redirectTo: '/dashboard' },
  demo: { access: 'guest-only' as const, redirectTo: '/generate' },
  pricing: { access: 'public' as const },
  dashboard: { access: 'protected' as const, redirectTo: '/' },
  settings: { access: 'protected' as const, redirectTo: '/' },
  teams: { access: 'protected' as const, redirectTo: '/' },
  analytics: { access: 'protected' as const, redirectTo: '/' },
  generate: { access: 'protected' as const, redirectTo: '/demo' },
  upgrade: { access: 'mixed' as const },
  auth: { access: 'guest-only' as const, redirectTo: '/dashboard' },
};
