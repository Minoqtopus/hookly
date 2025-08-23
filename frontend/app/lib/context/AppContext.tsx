'use client';

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

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
  logout: () => void;
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
        // Mock initialization - just set as not authenticated for now
        dispatch({
          type: 'INITIALIZE_SUCCESS',
          payload: {
            user: null,
            userStats: null,
            recentGenerations: [],
          },
        });
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

    logout: () => {
      dispatch({ type: 'LOGOUT' });
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

  // Initialize on mount
  useEffect(() => {
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