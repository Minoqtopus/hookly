// Main API barrel exports
export * from './client';
export * from './authenticated-client';
export * from './auth';
export * from './generation';

// Re-export for convenience
export { ApiClient, apiClient, ApiClientError, createApiClient } from './client';
export { authenticatedApiClient, validateSession } from './authenticated-client';