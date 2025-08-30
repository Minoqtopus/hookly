/**
 * Create Generation Use Case
 * 
 * Staff Engineer Design: Single responsibility, pure business logic
 * Follows auth domain pattern exactly
 */

import { GenerationService } from '../services/generation-service';
import type { CreateGenerationRequest, CreateGenerationResponse } from '../contracts/generation';

export class CreateGenerationUseCase {
  constructor(private generationService: GenerationService) {}

  async execute(request: CreateGenerationRequest): Promise<CreateGenerationResponse> {
    return await this.generationService.createGeneration(request);
  }
}