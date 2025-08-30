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
    try {
      // BUSINESS RULE: Validate required fields
      if (!request.productName?.trim()) {
        return {
          success: false,
          message: 'Product name is required'
        };
      }

      if (!request.niche?.trim()) {
        return {
          success: false,
          message: 'Niche is required'
        };
      }

      if (!request.targetAudience?.trim()) {
        return {
          success: false,
          message: 'Target audience is required'
        };
      }

      // BUSINESS RULE: Validate platform
      const allowedPlatforms = ['instagram', 'tiktok', 'youtube'];
      if (!allowedPlatforms.includes(request.platform)) {
        return {
          success: false,
          message: 'Invalid platform selected'
        };
      }

      // BUSINESS RULE: Validate streaming ID format (required for WebSocket)
      if (!request.streamingId?.trim() || !request.streamingId.startsWith('gen_')) {
        return {
          success: false,
          message: 'Invalid streaming session ID'
        };
      }

      // BUSINESS LOGIC: Delegate to service layer for coordination
      const result = await this.generationService.createGeneration(request);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }
}