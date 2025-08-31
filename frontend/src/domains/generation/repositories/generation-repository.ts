/**
 * Generation Repository - API Integration
 * 
 * Handles all generation-related API calls
 * Includes demo generation for public users
 */

import { apiClient } from '../../../shared/api/api-client';
import {
  CreateGenerationRequest,
  CreateGenerationResponse,
  DemoGenerationRequest,
  DemoGenerationResponse,
  GetGenerationsResponse
} from '../contracts/generation';

export class GenerationRepository {
  /**
   * Create Demo Generations (Public Endpoint)
   * Generates content for 3 platforms without authentication
   * Endpoint: POST /generation/demo
   */
  async createDemoGenerations(data: DemoGenerationRequest): Promise<DemoGenerationResponse> {
    try {
      const response = await apiClient.post<DemoGenerationResponse>('/generation/demo', data);
      return response.data;
    } catch (error: any) {
      // Handle API errors gracefully
      return {
        success: false,
        message: 'Failed to generate demo content',
        error: error.response?.data?.message || error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Create Generation (Authenticated)
   * Creates a single generation for authenticated users
   * Endpoint: POST /generation
   */
  async createGeneration(data: CreateGenerationRequest): Promise<CreateGenerationResponse> {
    try {
      const response = await apiClient.post<CreateGenerationResponse>('/generation', data);
      return response.data;
    } catch (error: any) {
      // Extract specific error message from backend
      const backendMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      // Check for specific error types
      if (backendMessage.includes('Generation limit reached')) {
        return {
          success: false,
          message: 'You\'ve reached your generation limit. Upgrade to create more content.',
          error: backendMessage
        };
      }
      
      if (backendMessage.includes('validation failed')) {
        return {
          success: false,
          message: backendMessage,
          error: backendMessage
        };
      }
      
      // Generic error handling
      return {
        success: false,
        message: 'Failed to generate content. Please try again.',
        error: backendMessage
      };
    }
  }

  /**
   * Get User Generations (Authenticated)
   * Retrieves all generations for the current user
   * Endpoint: GET /generation
   */
  async getUserGenerations(limit?: number): Promise<GetGenerationsResponse> {
    const endpoint = limit ? `/generation?limit=${limit}` : '/generation';
    const response = await apiClient.get<GetGenerationsResponse>(endpoint);
    return response.data;
  }

  /**
   * Get Recent Generations (Authenticated)
   * Retrieves recent generations for dashboard
   * Endpoint: GET /generation/recent
   */
  async getRecentGenerations(limit: number = 10): Promise<GetGenerationsResponse> {
    const response = await apiClient.get<GetGenerationsResponse>(`/generation/recent?limit=${limit}`);
    return response.data;
  }
}

// Export singleton instance
export const generationRepository = new GenerationRepository();