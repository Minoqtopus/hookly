import { UserPlan } from './user.entity';

export interface PlanFeatures {
  has_batch_generation: boolean;
  has_advanced_analytics: boolean;
  monthly_generation_limit: number | null;
  // Platform access mapping
  has_tiktok_access: boolean;
  has_x_access: boolean;
  has_instagram_access: boolean;
  has_youtube_access: boolean;
}

export function getPlanFeatures(plan: UserPlan): PlanFeatures {
  switch (plan) {
    case UserPlan.TRIAL:
      return {
        has_batch_generation: false,
        has_advanced_analytics: false,
        monthly_generation_limit: 15, // 15 total during trial period
        // Platform access: TikTok only for trial
        has_tiktok_access: true,
        has_x_access: false,
        has_instagram_access: false,
        has_youtube_access: false,
      };

    case UserPlan.STARTER:
      return {
        has_batch_generation: false,
        has_advanced_analytics: false,
        monthly_generation_limit: 50,
        // Platform access: TikTok + Instagram for starter
        has_tiktok_access: true,
        has_instagram_access: true,
        has_x_access: false,
        has_youtube_access: false,
      };

    case UserPlan.PRO:
      return {
        has_batch_generation: true,
        has_advanced_analytics: true,
        monthly_generation_limit: 200,
        // Platform access: TikTok + Instagram + X for pro
        has_tiktok_access: true,
        has_instagram_access: true,
        has_x_access: true,
        has_youtube_access: false,
      };

    case UserPlan.AGENCY:
      return {
        has_batch_generation: true,
        has_advanced_analytics: true,
        monthly_generation_limit: 500,
        // Platform access: All platforms for agency
        has_tiktok_access: true,
        has_x_access: true,
        has_instagram_access: true,
        has_youtube_access: true,
      };

    default:
      return getPlanFeatures(UserPlan.TRIAL);
  }
}

export function updateUserPlanFeatures(user: any, plan: UserPlan): void {
  const features = getPlanFeatures(plan);
  
  user.plan = plan;
  user.has_batch_generation = features.has_batch_generation;
  user.has_advanced_analytics = features.has_advanced_analytics;
  user.monthly_generation_limit = features.monthly_generation_limit;
  
  // Update platform access flags
  user.has_tiktok_access = features.has_tiktok_access;
  user.has_x_access = features.has_x_access;
  user.has_instagram_access = features.has_instagram_access;
  user.has_youtube_access = features.has_youtube_access;
}