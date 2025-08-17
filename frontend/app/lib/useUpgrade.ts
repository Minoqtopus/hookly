import { useState, useCallback } from 'react';
import { ApiClient, ApiErrorClass } from './api';
import { useApp } from './AppContext';

interface UseUpgradeReturn {
  isUpgrading: boolean;
  error: string | null;
  upgradeToCreatorMonthly: () => Promise<string | null>;
  upgradeToAgencyMonthly: () => Promise<string | null>;
  upgradeToProMonthly: () => Promise<string | null>;
  upgradeToProYearly: () => Promise<string | null>;
  cancelSubscription: () => Promise<boolean>;
  clearError: () => void;
}

export function useUpgrade(): UseUpgradeReturn {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state, actions } = useApp();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const upgradeToCreatorMonthly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToCreator({
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

  const upgradeToProMonthly = useCallback(async (): Promise<string | null> => {
    // Legacy method - redirect to Creator plan
    return upgradeToCreatorMonthly();
  }, [upgradeToCreatorMonthly]);

  const upgradeToProYearly = useCallback(async (): Promise<string | null> => {
    if (!state.user) {
      setError('Please log in to upgrade your plan');
      return null;
    }

    setIsUpgrading(true);
    setError(null);
    
    try {
      const result = await ApiClient.upgradeToPro({
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
            errorMessage = 'You already have an active Pro subscription';
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
    isUpgrading,
    error,
    upgradeToCreatorMonthly,
    upgradeToAgencyMonthly,
    upgradeToProMonthly,
    upgradeToProYearly,
    cancelSubscription,
    clearError,
  };
}