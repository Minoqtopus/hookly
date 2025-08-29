/**
 * Auth Domain - Public API
 * 
 * Staff Engineer Design: Clean domain exports
 * Business Logic: Centralized auth functionality
 * No Mock Data: Real backend integration
 */

// Export contracts (types)
export * from './contracts/auth';

// Export repository
export { AuthRepository } from './repositories/auth-repository';

// Export service
export { AuthService } from './services/auth-service';

// Export use cases
export { LoginUseCase } from './use-cases/login-use-case';

// Export hooks
export { useAuth } from './hooks/use-auth';
