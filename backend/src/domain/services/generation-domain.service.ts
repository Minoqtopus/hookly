/**
 * Generation Domain Service
 * 
 * Encapsulates core business logic for content generation.
 * This service orchestrates the generation process while keeping
 * business rules separate from infrastructure concerns.
 * 
 * Staff Engineer Note: Domain services contain business logic that doesn't
 * naturally fit into a single entity. They coordinate between multiple
 * domain models and enforce business rules.
 */

import { Injectable } from '@nestjs/common';
import { UserPlanModel } from '../models/user-plan.model';
import { GenerationRequestModel } from '../models/generation-request.model';
import { BUSINESS_CONSTANTS } from '../../constants/business-rules';

export interface GenerationResult {
  title: string;
  hook: string;
  script: string;
  platform: string;
  estimatedMetrics: {
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    engagement_rate: number;
  };
  qualityScore: number;
  suggestions?: string[];
}

export interface GenerationContext {
  userPlan: UserPlanModel;
  request: GenerationRequestModel;
  isDemo: boolean;
}

/**
 * Generation Domain Service
 * 
 * Coordinates the business logic for AI content generation
 */
@Injectable()
export class GenerationDomainService {

  /**
   * Create generation context (validation now handled by centralized ValidationService)
   * 
   * Staff Engineer Note: Validation logic has been moved to ValidationService
   * for better separation of concerns and centralized validation management.
   */

  /**
   * Calculate performance metrics based on business rules
   */
  calculatePerformanceMetrics(request: GenerationRequestModel): GenerationResult['estimatedMetrics'] {
    // Platform-based multipliers
    const platformMultipliers = {
      tiktok: { views: 1.3, engagement: 1.4, ctr: 1.2 },
      instagram: { views: 1.0, engagement: 1.2, ctr: 1.0 },
      youtube: { views: 0.8, engagement: 1.0, ctr: 0.9 }
    };

    // Base metrics within configured ranges
    const baseViews = this.randomInRange(
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.VIEWS.MIN,
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.VIEWS.MAX
    );

    const baseCTR = this.randomInRange(
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.CTR.MIN,
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.CTR.MAX
    );

    const baseConversionRate = this.randomInRange(
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.CONVERSION_RATE.MIN,
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.CONVERSION_RATE.MAX
    );

    const baseEngagementRate = this.randomInRange(
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.ENGAGEMENT_RATE.MIN,
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.ENGAGEMENT_RATE.MAX
    );

    // Apply platform multipliers
    const multipliers = platformMultipliers[request.platform];
    const views = Math.floor(baseViews * multipliers.views);
    const ctr = parseFloat((baseCTR * multipliers.ctr).toFixed(1));
    const engagement_rate = parseFloat((baseEngagementRate * multipliers.engagement).toFixed(1));
    const clicks = Math.floor(views * (ctr / 100));
    const conversions = Math.floor(views * baseConversionRate);

    return {
      views,
      clicks,
      conversions,
      ctr,
      engagement_rate
    };
  }

  /**
   * Calculate content quality score based on business rules
   */
  calculateQualityScore(content: { title: string; hook: string; script: string }): number {
    let score = 100;

    // Title quality checks
    if (content.title.length < 10) score -= 10;
    if (content.title.length > 80) score -= 15;
    if (!content.title.match(/[!?]/)) score -= 5; // No emotional punctuation

    // Hook quality checks
    if (content.hook.length < 20) score -= 15;
    if (!content.hook.toLowerCase().includes('i')) score -= 10; // Not personal enough

    // Script quality checks
    if (content.script.length < 100) score -= 20;
    if (content.script.split('\n').length < 3) score -= 10; // Not structured enough

    // Positive indicators
    if (content.hook.toLowerCase().includes('transformation')) score += 5;
    if (content.script.toLowerCase().includes('result')) score += 5;
    if (content.script.match(/\d+/g)) score += 5; // Contains numbers

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate content suggestions based on quality analysis
   */
  generateSuggestions(
    content: { title: string; hook: string; script: string },
    qualityScore: number,
    platform: string
  ): string[] {
    const suggestions: string[] = [];

    if (qualityScore < 70) {
      suggestions.push('Consider making your content more personal and authentic');
    }

    if (content.title.length > 60) {
      suggestions.push('Try shortening your title for better readability');
    }

    if (!content.hook.toLowerCase().includes('i') && !content.hook.toLowerCase().includes('my')) {
      suggestions.push('Make your hook more personal by using "I" or "My"');
    }

    if (platform === 'tiktok' && !content.script.toLowerCase().includes('watch')) {
      suggestions.push('Consider adding viewing prompts like "watch until the end"');
    }

    if (platform === 'instagram' && !content.script.includes('#')) {
      suggestions.push('Add relevant hashtags for better discovery');
    }

    if (platform === 'youtube' && content.script.length < 300) {
      suggestions.push('YouTube content typically performs better with longer scripts');
    }

    return suggestions;
  }

  /**
   * Staff Engineer Note: Content policy and rate limit validation has been 
   * moved to the centralized ValidationService for better separation of concerns
   * and consistent validation across all modules.
   */

  /**
   * Generate random number within range
   */
  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Create optimized generation context for business logic
   */
  createGenerationContext(
    userPlan: UserPlanModel,
    request: GenerationRequestModel,
    isDemo: boolean = false
  ): GenerationContext {
    return {
      userPlan,
      request,
      isDemo
    };
  }
}