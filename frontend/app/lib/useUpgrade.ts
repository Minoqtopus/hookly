import { useCallback, useState } from 'react';
import { ApiClient, ApiErrorClass } from './api';
import { useApp } from './AppContext';

interface UseUpgradeReturn {
  upgradeToStarterMonthly: () => Promise<string | null>;
  upgradeToProMonthly: () => Promise<string | null>;
  upgradeToAgencyMonthly: () => Promise<string | null>;
  upgradeToStarterYearly: () => Promise<string | null>;
  upgradeToProYearly: () => Promise<string | null>;
  upgradeToAgencyYearly: () => Promise<string | null>;
  isUpgrading: boolean;
  error: string | null;
  cancelSubscription: () => Promise<boolean>;
  clearError: () => void;
}

export const useUpgrade = (): UseUpgradeReturn => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, actions } = useApp();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const upgradeToStarterMonthly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToStarter({
        plan: 'starter',
        interval: 'monthly'
      });
      
      return result.checkout_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade to Starter plan';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const upgradeToAgencyMonthly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToAgency({
        plan: 'monthly',
        user_id: state.user.id,
        email: state.user.email,
        success_url: `${window.location.origin}/dashboard?upgrade=success`,
        cancel_url: `${window.location.origin}/dashboard?upgrade=cancelled`,
      });
      
      return result.checkout_url;
    } catch (err) {
      let errorMessage = 'Failed to initiate upgrade';
      
      if (err instanceof ApiErrorClass) {
        errorMessage = err.details.message;
        
        switch (err.details.code) {
          case 'ALREADY_SUBSCRIBED':
            errorMessage = 'You already have an active subscription';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'SESSION_EXPIRED':
            errorMessage = 'Your session has expired. Please log in again.';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const upgradeToStarterYearly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToStarter({
        plan: 'starter',
        interval: 'yearly'
      });
      
      return result.checkout_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade to Starter plan';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const upgradeToProMonthly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToPro({
        plan: 'pro',
        interval: 'monthly'
      });
      
      return result.checkout_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade to Pro plan';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const upgradeToProYearly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToPro({
        plan: 'pro',
        interval: 'yearly'
      });
      
      return result.checkout_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade to Pro plan';
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const upgradeToAgencyYearly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToAgency({
        plan: 'yearly',
        user_id: state.user.id,
        email: state.user.email,
        success_url: `${window.location.origin}/dashboard?upgrade=success`,
        cancel_url: `${window.location.origin}/dashboard?upgrade=cancelled`,
      });
      
      return result.checkout_url;
    } catch (err) {
      let errorMessage = 'Failed to initiate upgrade';
      
      if (err instanceof ApiErrorClass) {
        errorMessage = err.details.message;
        
        switch (err.details.code) {
          case 'ALREADY_SUBSCRIBED':
            errorMessage = 'You already have an active subscription';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'SESSION_EXPIRED':
            errorMessage = 'Your session has expired. Please log in again.';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user]);

  const handleUpgrade = useCallback(async (plan: string, interval: string): Promise<string | null> => {
    if (plan === 'starter' && interval === 'monthly') {
      return upgradeToStarterMonthly();
    } else if (plan === 'starter' && interval === 'yearly') {
      return upgradeToStarterYearly();
    } else if (plan === 'agency' && interval === 'monthly') {
      return upgradeToAgencyMonthly();
    } else if (plan === 'agency' && interval === 'yearly') {
      return upgradeToAgencyYearly();
    } else if (plan === 'pro' && interval === 'monthly') {
      return upgradeToProMonthly();
    } else if (plan === 'pro' && interval === 'yearly') {
      return upgradeToProYearly();
    }
    
    throw new Error(`Unsupported plan: ${plan} ${interval}`);
  }, [
    upgradeToStarterMonthly,
    upgradeToProMonthly,
    upgradeToStarterYearly,
    upgradeToProYearly,
    upgradeToAgencyMonthly,
    upgradeToAgencyYearly
  ]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!state.user) {
      setError('Please log in to manage your subscription');
      return false;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      await ApiClient.cancelSubscription();
      
      // Refresh user data to get updated plan status
      await actions.refreshUserData();
      
      return true;
    } catch (err) {
      let errorMessage = 'Failed to cancel subscription';
      
      if (err instanceof ApiErrorClass) {
        errorMessage = err.details.message;
        
        switch (err.details.code) {
          case 'NO_ACTIVE_SUBSCRIPTION':
            errorMessage = 'No active subscription found';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'SESSION_EXPIRED':
            errorMessage = 'Your session has expired. Please log in again.';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  }, [state.user, actions]);

  return {
    upgradeToStarterMonthly,
    upgradeToProMonthly,
    upgradeToAgencyMonthly,
    upgradeToStarterYearly,
    upgradeToProYearly,
    upgradeToAgencyYearly,
    isUpgrading,
    error,
    cancelSubscription,
    clearError,
  };
};