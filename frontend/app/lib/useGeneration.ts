import { useState, useCallback } from 'react';
import { ApiClient, GenerateRequest, GuestGenerateRequest, GenerateResponse, ApiErrorClass } from './api';
import { useApp } from './AppContext';

interface UseGenerationReturn {
  isGenerating: boolean;
  generatedAd: GenerateResponse | null;
  error: string | null;
  generateAd: (data: GenerateRequest) => Promise<GenerateResponse | null>;
  generateGuestAd: (data: GuestGenerateRequest) => Promise<GenerateResponse | null>;
  clearError: () => void;
  clearGeneration: () => void;
}

export function useGeneration(): UseGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { state, dispatch } = useApp();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearGeneration = useCallback(() => {
    setGeneratedAd(null);
    setError(null);
  }, []);

  const generateAd = useCallback(async (data: GenerateRequest): Promise<GenerateResponse | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await ApiClient.generateAd(data);
      
      // Add fake but believable performance metrics
      const enhancedResult = {
        ...result,
        performance: {
          estimatedViews: Math.floor(Math.random() * 80000) + 20000, // 20K-100K views
          estimatedCTR: +(Math.random() * 6 + 2).toFixed(1), // 2-8% CTR
          viralScore: +(Math.random() * 3 + 7).toFixed(1), // 7-10 viral score
        }
      };
      
      setGeneratedAd(enhancedResult);
      
      // Update user stats by refreshing data
      if (state.isAuthenticated) {
        // Increment generation count locally for immediate feedback
        if (state.userStats) {
          dispatch({
            type: 'SET_USER_STATS',
            payload: {
              ...state.userStats,
              generationsToday: state.userStats.generationsToday + 1,
              totalGenerations: state.userStats.totalGenerations + 1,
            },
          });
        }
        
        // Add to recent generations for immediate feedback
        const newGeneration = {
          id: result.id,
          title: `${data.productName} Ad`,
          hook: result.hook,
          script: result.script,
          visuals: result.visuals,
          niche: data.niche,
          target_audience: data.targetAudience,
          performance_data: {
            views: result.performance.estimatedViews,
            ctr: result.performance.estimatedCTR,
          },
          is_favorite: false,
          created_at: result.created_at,
        };
        
        dispatch({ type: 'ADD_GENERATION', payload: newGeneration });
      }
      
      return result;
    } catch (err) {
      let errorMessage = 'Failed to generate ad';
      
      if (err instanceof ApiErrorClass) {
        errorMessage = err.details.message;
        
        // Handle specific error cases
        switch (err.details.code) {
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'You\'ve reached your daily generation limit. Upgrade to Pro for unlimited generations!';
            break;
          case 'SESSION_EXPIRED':
            errorMessage = 'Your session has expired. Please log in again.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [state.isAuthenticated, state.userStats, dispatch]);

  const generateGuestAd = useCallback(async (data: GuestGenerateRequest): Promise<GenerateResponse | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await ApiClient.generateGuestAd(data);
      
      // Add fake but believable performance metrics for guests too
      const enhancedResult = {
        ...result,
        performance: {
          estimatedViews: Math.floor(Math.random() * 80000) + 20000, // 20K-100K views
          estimatedCTR: +(Math.random() * 6 + 2).toFixed(1), // 2-8% CTR
          viralScore: +(Math.random() * 3 + 7).toFixed(1), // 7-10 viral score
        }
      };
      
      setGeneratedAd(enhancedResult);
      return enhancedResult;
    } catch (err) {
      let errorMessage = 'Failed to generate ad';
      
      if (err instanceof ApiErrorClass) {
        errorMessage = err.details.message;
        
        // Handle specific error cases for guests
        switch (err.details.code) {
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'You\'ve reached the guest generation limit. Sign up for free to get more generations!';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatedAd,
    error,
    generateAd,
    generateGuestAd,
    clearError,
    clearGeneration,
  };
}