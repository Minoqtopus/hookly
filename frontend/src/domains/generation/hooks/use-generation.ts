/**
 * Generation Hook - React Integration
 * 
 * Staff Engineer Design: Clean hook pattern following auth pattern exactly
 * Business Logic: Uses use-cases for business logic only
 * UI Concerns: Handles notifications, loading states, and data management
 * No Mock Data: Real backend integration through use-cases
 */

import { useCallback, useEffect, useState } from 'react';
import { NotificationService } from '../../../shared/services';
import type {
  CreateGenerationRequest,
  DemoGenerationRequest,
  Generation,
} from '../contracts/generation';
import {
  CreateDemoGenerationUseCase,
  CreateGenerationUseCase,
  GetRecentGenerationsUseCase,
  GetUserGenerationsUseCase,
  generationRepository,
  GenerationService
} from '../index';

// Create singleton instances following auth pattern
const generationService = new GenerationService(generationRepository);
const notificationService = new NotificationService();

// Create use cases with dependencies (only business logic)
const createDemoGenerationUseCase = new CreateDemoGenerationUseCase(generationService);
const createGenerationUseCase = new CreateGenerationUseCase(generationService);
const getUserGenerationsUseCase = new GetUserGenerationsUseCase(generationService);
const getRecentGenerationsUseCase = new GetRecentGenerationsUseCase(generationService);

// Local state interface
interface GenerationState {
  generations: Generation[];
  recentGenerations: Generation[];
  viralScoreAverage: number;
  isLoading: boolean;
  error: string | null;
}

export function useGeneration() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    generations: [],
    recentGenerations: [],
    viralScoreAverage: 0,
    isLoading: false,
    error: null,
  });

  // Create Demo Generation - Uses CreateDemoGenerationUseCase
  const createDemoGeneration = useCallback(async (data: DemoGenerationRequest) => {
    setGenerationState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await createDemoGenerationUseCase.execute(data);
      
      if (result.success && result.data) {
        notificationService.showSuccess('Demo content generated successfully!');
        setGenerationState(prev => ({ ...prev, isLoading: false }));
        return result;
      } else {
        const errorMessage = result.error || 'Failed to generate demo content';
        setGenerationState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        notificationService.showError(errorMessage);
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate demo content';
      setGenerationState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create Generation - Uses CreateGenerationUseCase
  const createGeneration = useCallback(async (data: CreateGenerationRequest) => {
    setGenerationState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await createGenerationUseCase.execute(data);
      
      if (result.success && result.data) {
        // Add new generation to state
        setGenerationState(prev => ({
          ...prev,
          generations: [result.data!, ...prev.generations],
          recentGenerations: [result.data!, ...prev.recentGenerations].slice(0, 10),
          isLoading: false,
        }));
        
        notificationService.showSuccess('Content generated successfully!');
        return result;
      } else {
        const errorMessage = result.error || 'Failed to generate content';
        setGenerationState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        notificationService.showError(errorMessage);
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
      setGenerationState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      notificationService.showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get User Generations - Uses GetUserGenerationsUseCase
  const getUserGenerations = useCallback(async (limit?: number) => {
    setGenerationState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await getUserGenerationsUseCase.execute(limit);
      
      if (result.success && result.data) {
        // Calculate viral score average
        const viralScoreAverage = generationService.calculateViralScoreAverage(result.data);
        
        setGenerationState(prev => ({
          ...prev,
          generations: result.data || [],
          viralScoreAverage,
          isLoading: false,
        }));
        
        return result;
      } else {
        setGenerationState(prev => ({ 
          ...prev, 
          isLoading: false,
          generations: [],
          viralScoreAverage: 0
        }));
        return result;
      }
    } catch (error) {
      setGenerationState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load generations',
        generations: [],
        viralScoreAverage: 0
      }));
      return { success: false, data: [] };
    }
  }, []);

  // Get Recent Generations - Uses GetRecentGenerationsUseCase
  const getRecentGenerations = useCallback(async (limit: number = 10) => {
    try {
      const result = await getRecentGenerationsUseCase.execute(limit);
      
      if (result.success && result.data) {
        setGenerationState(prev => ({
          ...prev,
          recentGenerations: result.data || [],
        }));
        
        return result;
      } else {
        setGenerationState(prev => ({ 
          ...prev, 
          recentGenerations: []
        }));
        return result;
      }
    } catch (error) {
      setGenerationState(prev => ({ 
        ...prev, 
        recentGenerations: []
      }));
      return { success: false, data: [] };
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load both user generations and recent generations
        await Promise.all([
          getUserGenerations(),
          getRecentGenerations()
        ]);
      } catch (error) {
        console.error('Failed to load initial generation data:', error);
      }
    };

    loadInitialData();
  }, [getUserGenerations, getRecentGenerations]);

  return {
    // State
    generations: generationState.generations,
    recentGenerations: generationState.recentGenerations,
    viralScoreAverage: generationState.viralScoreAverage,
    isLoading: generationState.isLoading,
    error: generationState.error,
    
    // Actions - All use use-cases for business logic
    createDemoGeneration,
    createGeneration,
    getUserGenerations,
    getRecentGenerations,
  };
}