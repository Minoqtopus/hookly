import { UserPlan } from './user.entity';

export interface PlanFeatures {
  has_batch_generation: boolean;
  has_advanced_analytics: boolean;
  has_api_access: boolean;
  has_team_features: boolean;
  has_white_label: boolean;
  has_custom_integrations: boolean;
  monthly_generation_limit: number | null;
}

export function getPlanFeatures(plan: UserPlan): PlanFeatures {
  switch (plan) {
    case UserPlan.FREE:
      return {
        has_batch_generation: false,
        has_advanced_analytics: false,
        has_api_access: false,
        has_team_features: false,
        has_white_label: false,
        has_custom_integrations: false,
        monthly_generation_limit: 3, // 3 per day
      };

    case UserPlan.STARTER:
      return {
        has_batch_generation: false,
        has_advanced_analytics: false,
        has_api_access: false,
        has_team_features: false,
        has_white_label: false,
        has_custom_integrations: false,
        monthly_generation_limit: 50,
      };

    case UserPlan.PRO:
      return {
        has_batch_generation: true,
        has_advanced_analytics: true,
        has_api_access: true,
        has_team_features: false,
        has_white_label: false,
        has_custom_integrations: false,
        monthly_generation_limit: null, // unlimited
      };

    case UserPlan.AGENCY:
      return {
        has_batch_generation: true,
        has_advanced_analytics: true,
        has_api_access: true,
        has_team_features: true,
        has_white_label: true,
        has_custom_integrations: true,
        monthly_generation_limit: null, // unlimited
      };

    default:
      return getPlanFeatures(UserPlan.FREE);
  }
}

export function updateUserPlanFeatures(user: any, plan: UserPlan): void {
  const features = getPlanFeatures(plan);
  
  user.plan = plan;
  user.has_batch_generation = features.has_batch_generation;
  user.has_advanced_analytics = features.has_advanced_analytics;
  user.has_api_access = features.has_api_access;
  user.has_team_features = features.has_team_features;
  user.has_white_label = features.has_white_label;
  user.has_custom_integrations = features.has_custom_integrations;
  user.monthly_generation_limit = features.monthly_generation_limit;
}