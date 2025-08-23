// Main lib barrel exports
export * from './utils';
export * from './copy';
export * from './pricing';

// Export context with explicit naming to avoid conflicts
export { 
  AppProvider, 
  useApp, 
  useAuth, 
  useUserStats, 
  useRecentGenerations,
  type User as ContextUser,
  type Generation as ContextGeneration,
  type UserStats as ContextUserStats
} from './context';

// Export contracts and API
export * from './contracts';
export * from './api';