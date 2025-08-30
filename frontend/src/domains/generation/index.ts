/**
 * Generation Domain - Public API
 * 
 * Staff Engineer Design: Clean domain exports following auth pattern
 * Business Logic: Centralized generation functionality
 * No Mock Data: Real backend integration
 */

// Export contracts (types)
export * from './contracts/generation';

// Export repository
export { generationRepository } from './repositories/generation-repository';

// Export service
export { GenerationService } from './services/generation-service';

// Export use cases
export { CreateDemoGenerationUseCase } from './use-cases/create-demo-generation-use-case';
export { CreateGenerationUseCase } from './use-cases/create-generation-use-case';
export { GetUserGenerationsUseCase } from './use-cases/get-user-generations-use-case';
export { GetRecentGenerationsUseCase } from './use-cases/get-recent-generations-use-case';

// Export hooks
export { useGeneration } from './hooks/use-generation';