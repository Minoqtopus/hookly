/**
 * Get Recent Generations Use Case
 * 
 * Staff Engineer Design: Single responsibility, pure business logic
 * Follows auth domain pattern exactly
 */

import { GenerationService } from '../services/generation-service';
import type { GetGenerationsResponse } from '../contracts/generation';

export class GetRecentGenerationsUseCase {
  constructor(private generationService: GenerationService) {}

  async execute(limit: number = 10): Promise<GetGenerationsResponse> {
    return await this.generationService.getRecentGenerations(limit);
  }
}