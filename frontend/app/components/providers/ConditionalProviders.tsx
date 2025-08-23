'use client';

import { AppProvider } from '@/app/lib/context/AppContext';
import { ReactNode } from 'react';

interface ConditionalProvidersProps {
  children: ReactNode;
}

export default function ConditionalProviders({ children }: ConditionalProvidersProps) {
  // All routes need auth context since:
  // - Public routes need to redirect authenticated users
  // - Protected routes need auth state
  // - Modals are used everywhere and may need auth state
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}