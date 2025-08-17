'use client';

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { ApiClient, Generation, UserStats } from './api';
import { AuthService, User } from './auth';

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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USER_STATS'; payload: UserStats }
  | { type: 'SET_RECENT_GENERATIONS'; payload: Generation[] }
  | { type: 'ADD_GENERATION'; payload: Generation }
  | { type: 'UPDATE_GENERATION'; payload: { id: string; updates: Partial<Generation> } }
  | { type: 'REMOVE_GENERATION'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userStats: null,
  recentGenerations: [],
  error: null,
  isInitialized: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };
    
    case 'SET_USER_STATS':
      return { ...state, userStats: action.payload };
    
    case 'SET_RECENT_GENERATIONS':
      return { ...state, recentGenerations: action.payload };
    
    case 'ADD_GENERATION':
      return {
        ...state,
        recentGenerations: [action.payload, ...state.recentGenerations.slice(0, 9)],
      };
    
    case 'UPDATE_GENERATION':
      return {
        ...state,
        recentGenerations: state.recentGenerations.map(gen =>
          gen.id === action.payload.id ? { ...gen, ...action.payload.updates } : gen
        ),
      };
    
    case 'REMOVE_GENERATION':
      return {
        ...state,
        recentGenerations: state.recentGenerations.filter(gen => gen.id !== action.payload),
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isInitialized: true,
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    initialize: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    toggleFavorite: (generationId: string) => Promise<void>;
    deleteGeneration: (generationId: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
  };
} | null>(null);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state
  const initialize = async () => {
    if (state.isInitialized) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Ensure localStorage and cookies are synchronized
      if (!AuthService.validateStorageSync()) {
        console.warn('Storage synchronization issue detected, attempting to fix...');
        AuthService.syncStorage();
      }
      
      // Check if user is authenticated
      const storedUser = AuthService.getStoredUser();
      const tokens = AuthService.getStoredTokens();
      
      if (storedUser && tokens) {
        // Check if token is expired before proceeding
        if (AuthService.isTokenExpiringSoon()) {
          try {
            // Try to refresh the token
            const refreshResult = await AuthService.refreshToken();
            if (!refreshResult) {
              // Refresh failed, clear tokens
              AuthService.clearTokens();
              dispatch({ type: 'SET_USER', payload: null });
              dispatch({ type: 'SET_LOADING', payload: false });
              dispatch({ type: 'SET_INITIALIZED', payload: true });
              return;
            }
          } catch (error) {
            // Refresh failed, clear tokens
            AuthService.clearTokens();
            dispatch({ type: 'SET_USER', payload: null });
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_INITIALIZED', payload: true });
            return;
          }
        }
        
        // Set user immediately for better UX
        dispatch({ type: 'SET_USER', payload: storedUser });
        
        // Validate token and refresh user data in background
        try {
          const userResponse = await ApiClient.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: userResponse.user });
          AuthService.storeUser(userResponse.user);
          
          // Load user data in parallel after successful validation
          await Promise.all([
            loadUserStats(),
            loadRecentGenerations(),
          ]);
        } catch (error) {
          // Token validation failed - check if it's a network error or auth error
          if (error instanceof Error && error.message.includes('Session expired')) {
            // Clear invalid tokens and redirect to login
            AuthService.clearTokens();
            dispatch({ type: 'SET_USER', payload: null });
          } else {
            // Network error - keep user logged in but show error
            console.error('Token validation failed:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to validate session. Please refresh the page.' });
          }
        }
      }
    } catch (error) {
      console.error('App initialization failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  };

  // Load user stats
  const loadUserStats = async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const stats = await ApiClient.getUserStats();
      dispatch({ type: 'SET_USER_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  // Load recent generations
  const loadRecentGenerations = async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const response = await ApiClient.getUserGenerations(10);
      dispatch({ type: 'SET_RECENT_GENERATIONS', payload: response.generations });
    } catch (error) {
      console.error('Failed to load recent generations:', error);
    }
  };

  // Refresh all user data
  const refreshUserData = async () => {
    if (!state.isAuthenticated) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await Promise.all([
        loadUserStats(),
        loadRecentGenerations(),
      ]);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Toggle favorite
  const toggleFavorite = async (generationId: string) => {
    try {
      const result = await ApiClient.toggleFavorite(generationId);
      dispatch({
        type: 'UPDATE_GENERATION',
        payload: { id: generationId, updates: { is_favorite: result.is_favorite } },
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update favorite' });
    }
  };

  // Delete generation
  const deleteGeneration = async (generationId: string) => {
    try {
      await ApiClient.deleteGeneration(generationId);
      dispatch({ type: 'REMOVE_GENERATION', payload: generationId });
    } catch (error) {
      console.error('Failed to delete generation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete generation' });
    }
  };

  // Logout
  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Actions object
  const actions = {
    initialize,
    refreshUserData,
    toggleFavorite,
    deleteGeneration,
    logout,
    clearError,
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    // Set up periodic storage validation (every 5 minutes)
    const storageValidationInterval = setInterval(() => {
      if (!AuthService.validateStorageSync()) {
        console.warn('Periodic storage validation failed, attempting to fix...');
        AuthService.syncStorage();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearInterval(storageValidationInterval);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Individual hooks for specific data
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