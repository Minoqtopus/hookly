'use client';

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { setLogoutAction, validateSession } from '../api/authenticated-client';

// Simple types
export type User = {
  id: string;
  email: string;
  plan: string;
  trial_generations_used?: number;
  is_beta_user?: boolean;
  email_verified?: boolean;
  trial_ends_at?: string;
};

export type Generation = {
  id: string;
  hook: string;
  script: string;
  title?: string;
  niche?: string;
  target_audience?: string;
  created_at: string;
  is_favorite?: boolean;
  performance_data?: {
    views?: number;
    ctr?: number;
    conversions?: number;
  };
};

export type UserStats = {
  generationsUsed?: number;
  generationsThisMonth?: number;
  totalGenerations?: number;
  isTrialUser?: boolean;
  monthlyLimit?: number;
  streak?: number;
  totalViews?: number;
  avgCTR?: number;
  generationsToday?: number;
  trialGenerationsUsed?: number;
};

// State interfaces
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userStats: UserStats | null;
  recentGenerations: Generation[];
  error: string | null;
  isInitialized: boolean;
}

// Action types
type AppAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User | null; userStats: UserStats | null; recentGenerations: Generation[] } }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; userStats: UserStats } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER_STATS'; payload: UserStats }
  | { type: 'ADD_GENERATION'; payload: Generation }
  | { type: 'UPDATE_RECENT_GENERATIONS'; payload: Generation[] }
  | { type: 'TOGGLE_FAVORITE'; payload: { generationId: string; isFavorite: boolean } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userStats: null,
  recentGenerations: [],
  error: null,
  isInitialized: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, isLoading: true };
      
    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        userStats: action.payload.userStats,
        recentGenerations: action.payload.recentGenerations,
        isLoading: false,
        isInitialized: true,
        error: null,
      };
      
    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userStats: null,
        recentGenerations: [],
        isLoading: false,
        isInitialized: true,
        error: action.payload,
      };
      
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        userStats: action.payload.userStats,
        isLoading: false,
        error: null,
      };
      
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userStats: null,
        recentGenerations: [],
        error: null,
      };
      
    case 'UPDATE_USER_STATS':
      return {
        ...state,
        userStats: action.payload,
      };
      
    case 'ADD_GENERATION':
      return {
        ...state,
        recentGenerations: [action.payload, ...state.recentGenerations].slice(0, 10), // Keep only last 10
      };
      
    case 'UPDATE_RECENT_GENERATIONS':
      return {
        ...state,
        recentGenerations: action.payload,
      };
      
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        recentGenerations: state.recentGenerations.map(gen =>
          gen.id === action.payload.generationId
            ? { ...gen, is_favorite: action.payload.isFavorite }
            : gen
        ),
      };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
}

// Actions interface
interface AppActions {
  initialize: () => Promise<void>;
  login: (user: User, userStats: UserStats) => void;
  logout: () => Promise<void>;
  updateUserStats: (stats: UserStats) => void;
  addGeneration: (generation: Generation) => void;
  updateRecentGenerations: (generations: Generation[]) => void;
  toggleFavorite: (generationId: string) => Promise<void>;
  setError: (error: string) => void;
  clearError: () => void;
}

// Context
interface AppContextType {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions: AppActions = {
    initialize: async () => {
      dispatch({ type: 'INITIALIZE_START' });
      try {
        // Check if user is authenticated by looking for access token
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        
        if (token) {
          // TODO: Replace with actual API call to get user profile when backend endpoint available
          // For now, create a mock user from token (basic JWT decode could work)
          const mockUser: User = {
            id: '1',
            email: 'user@example.com', // TODO: Extract from JWT or API call
            plan: 'trial',
            trial_generations_used: 0,
            is_beta_user: false,
            email_verified: true,
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          };
          
          const mockUserStats: UserStats = {
            generationsUsed: 0,
            generationsThisMonth: 0,
            totalGenerations: 0,
            isTrialUser: true,
            monthlyLimit: 15,
            streak: 0,
            totalViews: 0,
            avgCTR: 0,
            generationsToday: 0,
            trialGenerationsUsed: 0,
          };
          
          dispatch({
            type: 'INITIALIZE_SUCCESS',
            payload: {
              user: mockUser,
              userStats: mockUserStats,
              recentGenerations: [],
            },
          });
        } else {
          // No token, user is not authenticated
          dispatch({
            type: 'INITIALIZE_SUCCESS',
            payload: {
              user: null,
              userStats: null,
              recentGenerations: [],
            },
          });
        }
      } catch (error) {
        dispatch({
          type: 'INITIALIZE_FAILURE',
          payload: error instanceof Error ? error.message : 'Initialization failed',
        });
      }
    },

    login: (user: User, userStats: UserStats) => {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, userStats } });
    },

    logout: async () => {
      try {
        // Get refresh token for backend logout
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        
        if (refreshToken) {
          // Import logout API dynamically to avoid circular dependency
          const { authAPI } = await import('../api');
          
          try {
            // Call backend logout to invalidate refresh token
            await authAPI.logout({ refresh_token: refreshToken });
          } catch (error) {
            // Continue with logout even if backend call fails
            console.warn('Backend logout failed:', error);
          }
        }
      } catch (error) {
        console.warn('Logout API import failed:', error);
      }
      
      // Clear tokens from localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Clear access token cookie
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      dispatch({ type: 'LOGOUT' });
      
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },

    updateUserStats: (stats: UserStats) => {
      dispatch({ type: 'UPDATE_USER_STATS', payload: stats });
    },

    addGeneration: (generation: Generation) => {
      dispatch({ type: 'ADD_GENERATION', payload: generation });
    },

    updateRecentGenerations: (generations: Generation[]) => {
      dispatch({ type: 'UPDATE_RECENT_GENERATIONS', payload: generations });
    },

    toggleFavorite: async (generationId: string) => {
      // Mock toggle - just flip the current state
      const generation = state.recentGenerations.find(g => g.id === generationId);
      const newFavoriteState = !generation?.is_favorite;
      
      dispatch({
        type: 'TOGGLE_FAVORITE',
        payload: { generationId, isFavorite: newFavoriteState },
      });
    },

    setError: (error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  // Initialize on mount and register logout action
  useEffect(() => {
    // Register the logout action with the authenticated API client
    setLogoutAction(actions.logout);
    
    // Initialize the app
    actions.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useAuth() {
  const { state } = useApp();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  };
}

export function useUserStats() {
  const { state } = useApp();
  return state.userStats;
}

export function useRecentGenerations() {
  const { state } = useApp();
  return state.recentGenerations;
}