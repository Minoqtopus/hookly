/**
 * Get User Generations Use Case
 * 
 * Staff Engineer Design: Single responsibility, pure business logic
 * Follows auth domain pattern exactly
 */

import { GenerationService } from '../services/generation-service';
import type { GetGenerationsResponse } from '../contracts/generation';

export interface GetUserGenerationsResult extends GetGenerationsResponse {
  viralScoreAverage?: number;
}

export class GetUserGenerationsUseCase {
  constructor(private generationService: GenerationService) {}

  async execute(limit?: number): Promise<GetUserGenerationsResult> {
    try {
      // BUSINESS RULE: Validate limit parameter
      const validatedLimit = this.validateLimit(limit);
      
      // SERVICE COORDINATION: Get user generations
      const result = await this.generationService.getUserGenerations(validatedLimit);
      
      if (result.success && result.data) {
        // BUSINESS LOGIC: Calculate viral score average
        const viralScoreAverage = this.calculateViralScoreAverage(result.data);
        
        return {
          ...result,
          viralScoreAverage
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

  // BUSINESS RULE: Validate and sanitize limit parameter
  private validateLimit(limit?: number): number | undefined {
    if (limit === undefined) return undefined;
    
    // Ensure limit is within reasonable bounds
    if (limit < 1) return 1;
    if (limit > 100) return 100;
    
    return Math.floor(limit);
  }

  // BUSINESS LOGIC: Calculate average viral score from user's generations
  private calculateViralScoreAverage(generations: any[]): number {
    if (!generations || generations.length === 0) {
      return 0;
    }

    const totalScore = generations.reduce((sum, gen) => {
      // Business logic for viral score calculation
      if (gen.performance_data) {
        const { views = 0, clicks = 0, engagement_rate = 0 } = gen.performance_data;
        
        // Prevent division by zero and ensure reasonable score
        const clickRate = views > 0 ? (clicks / views) * 100 : 0;
        const score = Math.min(10, (engagement_rate + clickRate) / 2);
        return sum + Math.max(0, score);
      }
      
      return sum + 5; // Default neutral score for generations without performance data
    }, 0);

    // Return rounded average
    return Math.round((totalScore / generations.length) * 10) / 10;
  }
}