/**
 * Create Demo Generation Use Case
 * 
 * Staff Engineer Design: Single responsibility, pure business logic
 * Follows auth domain pattern exactly
 */

import { GenerationService } from '../services/generation-service';
import type { DemoGenerationRequest, DemoGenerationResponse } from '../contracts/generation';

export class CreateDemoGenerationUseCase {
  constructor(private generationService: GenerationService) {}

  async execute(request: DemoGenerationRequest): Promise<DemoGenerationResponse> {
    return await this.generationService.createDemoGenerations(request);
  }
}