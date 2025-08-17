import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoTimer } from './useDemoTimer';
import { useAuth } from './AppContext';

interface NavigationState {
  isLoading: boolean;
  redirectPath: string | null;
  pendingAction: string | null;
  templateSelection: any | null;
  demoData: any | null;
}

interface NavigationActions {
  startNavigation: (path: string) => void;
  completeNavigation: () => void;
  setPendingAction: (action: string) => void;
  clearPendingAction: () => void;
  storeTemplateSelection: (template: any) => void;
  getTemplateSelection: () => any | null;
  clearTemplateSelection: () => void;
  storeDemoData: (data: any) => void;
  getDemoData: () => any | null;
  clearDemoData: () => void;
  handleAuthRequired: (intendedPath?: string) => void;
  handlePostAuthRedirect: () => string;
}

export function useNavigationState(): NavigationState & NavigationActions {
  const [state, setState] = useState<NavigationState>({
    isLoading: false,
    redirectPath: null,
    pendingAction: null,
    templateSelection: null,
    demoData: null,
  });

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const demoTimer = useDemoTimer();

  // Initialize state from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const templateSelection = sessionStorage.getItem('selectedTemplate');
    const demoData = sessionStorage.getItem('demo_data');
    const pendingAction = sessionStorage.getItem('pending_action');
    const redirectPath = sessionStorage.getItem('post_auth_redirect');

    setState(prev => ({
      ...prev,
      templateSelection: templateSelection ? JSON.parse(templateSelection) : null,
      demoData: demoData ? JSON.parse(demoData) : null,
      pendingAction: pendingAction || null,
      redirectPath: redirectPath || null,
    }));
  }, []);

  const startNavigation = useCallback((path: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    router.push(path);
  }, [router]);

  const completeNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const setPendingAction = useCallback((action: string) => {
    sessionStorage.setItem('pending_action', action);
    setState(prev => ({ ...prev, pendingAction: action }));
  }, []);

  const clearPendingAction = useCallback(() => {
    sessionStorage.removeItem('pending_action');
    setState(prev => ({ ...prev, pendingAction: null }));
  }, []);

  const storeTemplateSelection = useCallback((template: any) => {
    const templateData = {
      productName: template.title || template.productName,
      niche: template.niche,
      targetAudience: template.targetAudience,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem('selectedTemplate', JSON.stringify(templateData));
    setState(prev => ({ ...prev, templateSelection: templateData }));
  }, []);

  const getTemplateSelection = useCallback(() => {
    const stored = sessionStorage.getItem('selectedTemplate');
    if (!stored) return null;

    try {
      const template = JSON.parse(stored);
      // Check if template is still valid (not older than 1 hour)
      if (Date.now() - template.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem('selectedTemplate');
        return null;
      }
      return template;
    } catch {
      sessionStorage.removeItem('selectedTemplate');
      return null;
    }
  }, []);

  const clearTemplateSelection = useCallback(() => {
    sessionStorage.removeItem('selectedTemplate');
    setState(prev => ({ ...prev, templateSelection: null }));
  }, []);

  const storeDemoData = useCallback((data: any) => {
    const demoData = {
      ...data,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem('demo_data', JSON.stringify(demoData));
    setState(prev => ({ ...prev, demoData }));
  }, []);

  const getDemoData = useCallback(() => {
    const stored = sessionStorage.getItem('demo_data');
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      // Check if demo data is still valid (not older than demo duration)
      if (Date.now() - data.timestamp > 10 * 60 * 1000) { // 10 minutes max
        sessionStorage.removeItem('demo_data');
        return null;
      }
      return data;
    } catch {
      sessionStorage.removeItem('demo_data');
      return null;
    }
  }, []);

  const clearDemoData = useCallback(() => {
    sessionStorage.removeItem('demo_data');
    setState(prev => ({ ...prev, demoData: null }));
  }, []);

  const handleAuthRequired = useCallback((intendedPath?: string) => {
    // Store current location or intended path for post-auth redirect
    const path = intendedPath || window.location.pathname + window.location.search;
    
    if (path !== '/auth/login' && path !== '/') {
      sessionStorage.setItem('post_auth_redirect', path);
      setState(prev => ({ ...prev, redirectPath: path }));
    }

    // Navigate to login
    router.push('/auth/login' + (path !== '/' ? `?redirect=${encodeURIComponent(path)}` : ''));
  }, [router]);

  const handlePostAuthRedirect = useCallback((): string => {
    // Check for stored redirect path
    const storedRedirect = sessionStorage.getItem('post_auth_redirect');
    
    // Check for demo data that needs restoration
    const pendingDemo = sessionStorage.getItem('pendingDemoData');
    
    // Check for pending actions
    const pendingAction = sessionStorage.getItem('pending_action');

    // Clean up storage
    sessionStorage.removeItem('post_auth_redirect');
    setState(prev => ({ ...prev, redirectPath: null }));

    // Priority order for redirects:
    // 1. Demo restoration
    if (pendingDemo) {
      return '/generate?restored=true';
    }
    
    // 2. Stored redirect path
    if (storedRedirect && storedRedirect !== '/auth/login') {
      return storedRedirect;
    }
    
    // 3. Pending action-based redirect
    if (pendingAction === 'template_use') {
      clearPendingAction();
      return '/generate';
    }
    
    // 4. Default to dashboard
    return '/dashboard';
  }, [clearPendingAction]);

  // Auto-cleanup expired data
  useEffect(() => {
    const cleanup = () => {
      getTemplateSelection(); // This will auto-remove expired templates
      getDemoData(); // This will auto-remove expired demo data
    };

    // Run cleanup every minute
    const interval = setInterval(cleanup, 60 * 1000);
    return () => clearInterval(interval);
  }, [getTemplateSelection, getDemoData]);

  // Handle demo expiry
  useEffect(() => {
    if (demoTimer.isExpired && !isAuthenticated) {
      // Store current demo data before clearing
      const currentDemoData = getDemoData();
      if (currentDemoData) {
        sessionStorage.setItem('pendingDemoData', JSON.stringify(currentDemoData));
        clearDemoData();
      }
      
      // Set pending action for post-auth flow
      setPendingAction('demo_expired');
      
      // Trigger auth flow
      handleAuthRequired('/generate');
    }
  }, [demoTimer.isExpired, isAuthenticated, getDemoData, clearDemoData, setPendingAction, handleAuthRequired]);

  return {
    ...state,
    startNavigation,
    completeNavigation,
    setPendingAction,
    clearPendingAction,
    storeTemplateSelection,
    getTemplateSelection,
    clearTemplateSelection,
    storeDemoData,
    getDemoData,
    clearDemoData,
    handleAuthRequired,
    handlePostAuthRedirect,
  };
}