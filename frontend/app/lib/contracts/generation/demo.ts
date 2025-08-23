// Demo Generation API Contracts
// Based on backend swagger schema: /generation/demo

export interface DemoGenerationRequest {
  productName: string;  // Max 100 chars
  niche: string;        // Max 50 chars  
  targetAudience: string; // Max 100 chars
}

export interface PerformanceData {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  engagement_rate: number;
}

export interface GenerationItem {
  id: string;
  title: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  niche: string;
  target_audience: string;
  hook: string;
  script: string;
  performance_data: PerformanceData;
  is_demo: boolean;
  created_at: string; // ISO date string
}

export interface DemoGenerationResponse {
  success: boolean;
  message: string;
  data: GenerationItem[];
}

// Error responses
export interface DemoGenerationError {
  statusCode: number;
  message: string;
  error?: string;
}