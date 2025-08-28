/**
 * Generation Request Domain Model
 * 
 * Encapsulates business logic for AI content generation requests.
 * This model validates input, checks platform requirements, and ensures
 * business rules are enforced before generation.
 * 
 * Staff Engineer Note: This model serves as the business layer between
 * the controller input and the AI service, ensuring all business rules
 * are applied consistently.
 */

import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PLATFORM_SPECIFICATIONS, BUSINESS_CONSTANTS } from '../../constants/business-rules';
import { UserPlanModel } from './user-plan.model';

export interface GenerationRequestData {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Generation Request Domain Model
 * 
 * Represents a request for AI content generation with validation and business logic
 */
export class GenerationRequestModel {
  constructor(
    public readonly productName: string,
    public readonly niche: string,
    public readonly targetAudience: string,
    public readonly platform: 'tiktok' | 'instagram' | 'youtube',
    public readonly userId: string
  ) {}

  /**
   * Validate the generation request against business rules
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Product name validation
    if (!this.productName || this.productName.trim().length === 0) {
      errors.push('Product name is required');
    } else if (this.productName.length < BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.TITLE) {
      errors.push(`Product name must be at least ${BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.TITLE} characters`);
    } else if (this.productName.length > BUSINESS_CONSTANTS.MAX_CONTENT_LENGTH.TITLE) {
      errors.push(`Product name must be less than ${BUSINESS_CONSTANTS.MAX_CONTENT_LENGTH.TITLE} characters`);
    }

    // Niche validation
    if (!this.niche || this.niche.trim().length === 0) {
      errors.push('Niche is required');
    } else if (this.niche.length < 3) {
      errors.push('Niche must be at least 3 characters');
    } else if (this.niche.length > 50) {
      errors.push('Niche must be less than 50 characters');
    }

    // Target audience validation
    if (!this.targetAudience || this.targetAudience.trim().length === 0) {
      errors.push('Target audience is required');
    } else if (this.targetAudience.length < BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.HOOK) {
      errors.push(`Target audience must be at least ${BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.HOOK} characters`);
    } else if (this.targetAudience.length > 200) {
      errors.push('Target audience must be less than 200 characters');
    }

    // Platform validation
    const validPlatforms = ['tiktok', 'instagram', 'youtube'];
    if (!validPlatforms.includes(this.platform)) {
      errors.push(`Platform must be one of: ${validPlatforms.join(', ')}`);
    }

    // Business rule warnings
    if (this.productName.toLowerCase().includes('clickbait')) {
      warnings.push('Avoid using "clickbait" in product names for better authenticity');
    }

    if (this.targetAudience.toLowerCase().includes('everyone')) {
      warnings.push('Consider targeting a more specific audience for better results');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate user access and limits for this generation request
   */
  validateUserAccess(userPlan: UserPlanModel): void {
    // Check if user has access to the requested platform
    if (!userPlan.hasAccessToPlatform(this.platform)) {
      const requiredPlan = userPlan.needsUpgradeFor(this.platform as any);
      throw new ForbiddenException(
        `${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)} access requires ${requiredPlan} plan upgrade`
      );
    }

    // Check if user can create more generations
    if (!userPlan.canCreateGeneration()) {
      const limits = userPlan.getGenerationLimits();
      if (userPlan.plan === 'trial' && userPlan.trialEndsAt && new Date() > userPlan.trialEndsAt) {
        throw new ForbiddenException('Trial period has expired. Upgrade to continue generating content.');
      } else {
        throw new ForbiddenException(`Generation limit reached. Remaining: ${limits.remaining}`);
      }
    }
  }

  /**
   * Get platform-specific specifications for AI generation
   */
  getPlatformSpecifications() {
    return PLATFORM_SPECIFICATIONS[this.platform];
  }

  /**
   * Build AI prompt based on platform specifications and business rules
   */
  buildAIPrompt(): string {
    const specs = this.getPlatformSpecifications();
    
    const basePrompt = `Generate high-converting UGC (User Generated Content) for ${this.platform.toUpperCase()} that feels authentic and viral-worthy.

PRODUCT CONTEXT:
- Product/Service: ${this.productName}
- Niche: ${this.niche}
- Target Audience: ${this.targetAudience}

PLATFORM: ${this.platform.toUpperCase()}
- Length: ${specs.length}
- Style: ${specs.style}
- Format: ${specs.format}

SPECIAL REQUIREMENTS:
${specs.specialRequirements.map(req => `- ${req}`).join('\n')}

CONTENT REQUIREMENTS:
1. Write a compelling TITLE (max 80 characters)
2. Create an attention-grabbing HOOK (first 1-2 sentences that stop the scroll)
3. Write a complete SCRIPT that feels authentic and personal

TONE & STYLE:
- Sound like a real person sharing their experience
- Use casual, conversational language
- Include specific details and numbers when possible
- Be enthusiastic but not salesy
- Use emotional triggers (curiosity, FOMO, social proof)

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Your compelling title here",
  "hook": "Your attention-grabbing hook here",
  "script": "Your complete script here with proper formatting"
}

Generate content that feels authentic, personal, and viral-worthy for ${this.targetAudience} interested in ${this.niche}.`;

    return basePrompt;
  }

  /**
   * Get estimated content metrics based on platform and niche
   */
  getEstimatedMetrics() {
    // Simple algorithm based on platform and niche popularity
    const platformMultipliers = {
      tiktok: 1.2,
      instagram: 1.0,
      youtube: 0.8
    };

    const baseViews = Math.floor(
      Math.random() * (BUSINESS_CONSTANTS.PERFORMANCE_RANGES.VIEWS.MAX - BUSINESS_CONSTANTS.PERFORMANCE_RANGES.VIEWS.MIN) + 
      BUSINESS_CONSTANTS.PERFORMANCE_RANGES.VIEWS.MIN
    );

    const platformMultiplier = platformMultipliers[this.platform];
    const estimatedViews = Math.floor(baseViews * platformMultiplier);

    return {
      estimatedViews,
      platform: this.platform,
      confidenceScore: 0.85 // Could be based on historical data
    };
  }

  /**
   * Create GenerationRequestModel from request data with validation
   */
  static fromRequestData(data: GenerationRequestData, userId: string): GenerationRequestModel {
    const request = new GenerationRequestModel(
      data.productName?.trim() || '',
      data.niche?.trim() || '',
      data.targetAudience?.trim() || '',
      data.platform,
      userId
    );

    // Validate the request
    const validation = request.validate();
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid generation request: ${validation.errors.join(', ')}`);
    }

    return request;
  }
}