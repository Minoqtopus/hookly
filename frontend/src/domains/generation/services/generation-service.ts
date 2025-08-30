/**
 * Generation Service - Business Logic Layer
 * 
 * Staff Engineer Design: Clean service layer following auth pattern
 * Business Logic: Pure business logic, no UI concerns
 * Repository Pattern: Uses repository for data access
 */

import { GenerationRepository } from '../repositories/generation-repository';
import type {
  CreateGenerationRequest,
  CreateGenerationResponse,
  DemoGenerationRequest,
  DemoGenerationResponse,
  GetGenerationsResponse
} from '../contracts/generation';

export class GenerationService {
  constructor(private repository: GenerationRepository) {}

  /**
   * Create Demo Generations
   * Business Logic: Validates input, handles demo generation
   */
  async createDemoGenerations(data: DemoGenerationRequest): Promise<DemoGenerationResponse> {
    // Validate input
    if (!data.productName?.trim()) {
      return {
        success: false,
        message: 'Product name is required'
      };
    }

    if (!data.niche?.trim()) {
      return {
        success: false,
        message: 'Niche is required'
      };
    }

    if (!data.targetAudience?.trim()) {
      return {
        success: false,
        message: 'Target audience is required'
      };
    }

    try {
      const result = await this.repository.createDemoGenerations(data);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create demo generations'
      };
    }
  }

  /**
   * Create User Generation
   * Business Logic: Validates input, creates generation for authenticated user
   */
  async createGeneration(data: CreateGenerationRequest): Promise<CreateGenerationResponse> {
    // Validate input
    if (!data.productName?.trim()) {
      return {
        success: false,
        message: 'Product name is required'
      };
    }

    if (!data.niche?.trim()) {
      return {
        success: false,
        message: 'Niche is required'
      };
    }

    if (!data.targetAudience?.trim()) {
      return {
        success: false,
        message: 'Target audience is required'
      };
    }

    if (!['instagram', 'tiktok', 'youtube'].includes(data.platform)) {
      return {
        success: false,
        message: 'Invalid platform selected'
      };
    }

    try {
      const result = await this.repository.createGeneration(data);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create generation'
      };
    }
  }

  /**
   * Get User Generations
   * Business Logic: Retrieves user generations with optional filtering
   */
  async getUserGenerations(limit?: number): Promise<GetGenerationsResponse> {
    try {
      const result = await this.repository.getUserGenerations(limit);
      return result;
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Get Recent Generations
   * Business Logic: Retrieves recent generations for dashboard
   */
  async getRecentGenerations(limit: number = 10): Promise<GetGenerationsResponse> {
    try {
      const result = await this.repository.getRecentGenerations(limit);
      return result;
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

}