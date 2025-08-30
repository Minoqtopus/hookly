/**
 * Create Generation DTO
 * 
 * Validates and sanitizes user input for AI content generation.
 * This DTO ensures consistent validation rules and provides proper
 * API documentation through Swagger decorators.
 */

import { IsString, IsNotEmpty, MaxLength, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BUSINESS_CONSTANTS } from '../../constants/business-rules';
import { 
  IsContentPolicyCompliant, 
  IsSpecificTargetAudience, 
  IsAuthenticProductName 
} from '../../common/decorators/business-validation.decorator';

export enum GenerationPlatform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube'
}

export class CreateGenerationDto {
  @ApiProperty({
    description: 'Name of the product or service to generate content for',
    example: 'FitTracker Pro Smartwatch',
    minLength: BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.TITLE,
    maxLength: BUSINESS_CONSTANTS.MAX_CONTENT_LENGTH.TITLE
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.TITLE)
  @MaxLength(BUSINESS_CONSTANTS.MAX_CONTENT_LENGTH.TITLE)
  @IsContentPolicyCompliant()
  @IsAuthenticProductName()
  productName: string;

  @ApiProperty({
    description: 'Market niche or industry category',
    example: 'Health & Fitness Wearables',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @IsContentPolicyCompliant()
  niche: string;

  @ApiProperty({
    description: 'Target audience demographic and characteristics',
    example: 'Fitness enthusiasts aged 25-40 who track workouts regularly',
    minLength: BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.HOOK,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(BUSINESS_CONSTANTS.MIN_CONTENT_LENGTH.HOOK)
  @MaxLength(200)
  @IsContentPolicyCompliant()
  @IsSpecificTargetAudience()
  targetAudience: string;

  @ApiProperty({
    description: 'Social media platform for content generation',
    enum: GenerationPlatform,
    example: GenerationPlatform.TIKTOK
  })
  @IsEnum(GenerationPlatform)
  platform: GenerationPlatform;

  @ApiProperty({
    description: 'Optional streaming ID for WebSocket real-time updates',
    example: 'gen_1756512096754_sa9p22zwi',
    required: false
  })
  @IsOptional()
  @IsString()
  streamingId?: string;
}