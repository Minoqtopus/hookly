/**
 * Generation Domain Contracts
 * 
 * TypeScript interfaces for generation API
 * Matches backend structure for premium demo experience
 */

// ================================
// Request Types
// ================================

export interface DemoGenerationRequest {
  productName: string;
  niche: string;
  targetAudience: string;
}

export interface CreateGenerationRequest {
  topic: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  niche?: string;
  targetAudience?: string;
}

// ================================
// Response Types
// ================================

export enum GenerationType {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube'
}

export enum GenerationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface PerformanceData {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  engagement_rate: number;
}

export interface Generation {
  id: string;
  title: string;
  hook: string;
  script: string;
  platform: GenerationType;
  niche?: string;
  target_audience?: string;
  performance_data?: PerformanceData;
  status: GenerationStatus;
  is_demo: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DemoGenerationResponse {
  success: boolean;
  message: string;
  data?: Generation[];
  error?: string;
}

export interface CreateGenerationResponse {
  success: boolean;
  message: string;
  data?: Generation;
  error?: string;
}

export interface GetGenerationsResponse {
  success: boolean;
  data: Generation[];
}