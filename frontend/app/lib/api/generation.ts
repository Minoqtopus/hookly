import type { DemoGenerationRequest, DemoGenerationResponse } from '../contracts/generation';
import { createApiClient } from './client';

/**
 * Generation API client for demo content generation
 */
class GenerationApi {
  private apiClient = createApiClient();

  /**
   * Generate demo content for testing the platform
   * Public endpoint - no authentication required
   */
  async generateDemo(request: DemoGenerationRequest): Promise<DemoGenerationResponse> {
    return this.apiClient.post<DemoGenerationResponse>('/generation/demo', request);
  }
}

// Export singleton instance
export const generationApi = new GenerationApi();