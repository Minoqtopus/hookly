import { UserPlan } from '../../../entities/user.entity';

export interface ProductPlanMapping {
  [productId: string]: UserPlan;
}

export interface PlanHierarchy {
  plans: UserPlan[];
  canUpgrade: (fromPlan: UserPlan, toPlan: UserPlan) => boolean;
  canDowngrade: (fromPlan: UserPlan, toPlan: UserPlan) => boolean;
  getNextPlan: (currentPlan: UserPlan) => UserPlan | null;
  getPreviousPlan: (currentPlan: UserPlan) => UserPlan | null;
}

export class PlanDeterminationPolicy {
  private readonly PRODUCT_PLAN_MAPPING: ProductPlanMapping = {
    // LemonSqueezy product IDs mapped to user plans (3-plan launch structure)
    'starter_monthly': UserPlan.STARTER,
    'starter_yearly': UserPlan.STARTER,
    'pro_monthly': UserPlan.PRO,
    'pro_yearly': UserPlan.PRO,
  };

  private readonly PLAN_HIERARCHY: UserPlan[] = [
    UserPlan.TRIAL,
    UserPlan.STARTER,
    UserPlan.PRO,
  ];

  /**
   * Determine user plan from product data
   */
  determinePlanFromProductData(productData: any): UserPlan {
    const productId = productData.attributes?.product_id || productData.attributes?.variant_id;
    
    if (!productId) {
      throw new Error('Product ID not found in product data');
    }

    const plan = this.PRODUCT_PLAN_MAPPING[productId];
    if (!plan) {
      throw new Error(`Unknown product ID: ${productId}`);
    }

    return plan;
  }

  /**
   * Check if plan transition is valid
   */
  isValidPlanTransition(fromPlan: UserPlan, toPlan: UserPlan): boolean {
    const fromIndex = this.PLAN_HIERARCHY.indexOf(fromPlan);
    const toIndex = this.PLAN_HIERARCHY.indexOf(toPlan);
    
    // Allow upgrades and lateral moves (e.g., Pro monthly to Pro yearly)
    return toIndex >= fromIndex;
  }

  /**
   * Get plan hierarchy information
   */
  getPlanHierarchy(): PlanHierarchy {
    return {
      plans: [...this.PLAN_HIERARCHY],
      canUpgrade: (fromPlan: UserPlan, toPlan: UserPlan) => {
        const fromIndex = this.PLAN_HIERARCHY.indexOf(fromPlan);
        const toIndex = this.PLAN_HIERARCHY.indexOf(toPlan);
        return toIndex > fromIndex;
      },
      canDowngrade: (fromPlan: UserPlan, toPlan: UserPlan) => {
        const fromIndex = this.PLAN_HIERARCHY.indexOf(fromPlan);
        const toIndex = this.PLAN_HIERARCHY.indexOf(toPlan);
        return toIndex < fromIndex;
      },
      getNextPlan: (currentPlan: UserPlan) => {
        const currentIndex = this.PLAN_HIERARCHY.indexOf(currentPlan);
        const nextIndex = currentIndex + 1;
        return nextIndex < this.PLAN_HIERARCHY.length ? this.PLAN_HIERARCHY[nextIndex] : null;
      },
      getPreviousPlan: (currentPlan: UserPlan) => {
        const currentIndex = this.PLAN_HIERARCHY.indexOf(currentPlan);
        const previousIndex = currentIndex - 1;
        return previousIndex >= 0 ? this.PLAN_HIERARCHY[previousIndex] : null;
      },
    };
  }

  /**
   * Get plan price information
   */
  getPlanPrice(plan: UserPlan): number {
    const prices = {
      [UserPlan.TRIAL]: 0,
      [UserPlan.STARTER]: 19,
      [UserPlan.PRO]: 59,
    };
    return prices[plan] || 0;
  }

  /**
   * Get plan features and limits
   */
  getPlanFeatures(plan: UserPlan): {
    monthlyGenerations: number;
    platforms: string[];
    premiumAI: boolean;
    watermarks: boolean;
  } {
    const features = {
      [UserPlan.TRIAL]: {
        monthlyGenerations: 7,
        platforms: ['TikTok'],
        premiumAI: false,
        watermarks: true,
      },
      [UserPlan.STARTER]: {
        monthlyGenerations: 50,
        platforms: ['TikTok', 'Instagram'],
        premiumAI: false,
        watermarks: false,
      },
      [UserPlan.PRO]: {
        monthlyGenerations: 150,
        platforms: ['TikTok', 'Instagram', 'X'],
        premiumAI: true,
        watermarks: false,
      },
    };
    return features[plan] || features[UserPlan.TRIAL];
  }

  /**
   * Validate promo code applicability
   */
  validatePromoCode(currentPlan: UserPlan, promoCode: string): {
    isValid: boolean;
    targetPlan: UserPlan | null;
    message: string;
    isBeta: boolean;
    duration?: number;
  } {
    const promoCodes = {
      'STARTER50': { plan: UserPlan.STARTER, description: 'Launch Special - 50% off Starter', isBeta: false },
      'LAUNCH50': { plan: UserPlan.STARTER, description: 'Launch Special - 50% off Starter', isBeta: false },
      'BETA_PRO': { plan: UserPlan.PRO, description: 'Beta Tester - 30 Days Free PRO Access', isBeta: true, duration: 30 },
      'AGENCY30': { plan: UserPlan.AGENCY, description: 'Agency Trial - 30 days free', isBeta: false, duration: 30 },
    } as const;

    const promo = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes];
    if (!promo) {
      return { isValid: false, targetPlan: null, message: 'Invalid promo code', isBeta: false };
    }

    // Check if promo code is applicable to current plan
    if (!this.isValidPlanTransition(currentPlan, promo.plan)) {
      return { 
        isValid: false, 
        targetPlan: null, 
        message: 'Promo code not applicable to your current plan', 
        isBeta: false 
      };
    }

    return {
      isValid: true,
      targetPlan: promo.plan,
      message: promo.description,
      isBeta: promo.isBeta,
      duration: (promo as any).duration,
    };
  }
}
