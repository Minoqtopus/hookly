/**
 * ALIGNED VIRAL CONTENT GENERATION PROMPTS
 *
 *  Pricing strategy:
 * - FREE: 5 free scripts (demo quality)
 * - CREATOR: $15/month - 50 scripts (individual creators)
 * - BUSINESS: $39/month - 200 scripts (agencies/scaling)
 */

import { UserPlan } from "../../entities/user.entity";

// Enum to match pricing strategy
export enum PricingTier {
  FREE = "free", // 5 free scripts
  CREATOR = "creator", // $15/month - 50 scripts
  BUSINESS = "business", // $39/month - 200 scripts
}

export interface ContentQualityConfig {
  tier: PricingTier;
  scriptsPerMonth: number;
  psychologicalTriggers: number;
  viralElementsCount: number;
  platformOptimization: "basic" | "advanced" | "expert";
  personalization: "generic" | "targeted" | "hyper-targeted";
  contentLength: "short" | "medium" | "long";
  hookOptimization: string;
  commercialUse: boolean;
  realTimeTypewriter: boolean;
  copyPasteScripts: boolean;
}

export interface ViralPromptContext {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: "instagram" | "tiktok" | "youtube";
  contentAngle:
    | "transformation"
    | "problem-agitation"
    | "social-proof"
    | "controversy"
    | "behind-scenes"
    | "trend-hijack";
  emotionalTrigger:
    | "curiosity"
    | "fomo"
    | "authority"
    | "social-proof"
    | "urgency"
    | "controversy";
}

export class AlignedViralContentPrompts {
  /**
   * GET TIER CONFIGURATION BASED ON PRICING STRATEGY
   */
  static getTierConfig(tier: PricingTier): ContentQualityConfig {
    const configs: Record<PricingTier, ContentQualityConfig> = {
      [PricingTier.FREE]: {
        tier: PricingTier.FREE,
        scriptsPerMonth: 5,
        psychologicalTriggers: 2,
        viralElementsCount: 2,
        platformOptimization: "basic",
        personalization: "generic",
        contentLength: "short",
        hookOptimization: "basic",
        commercialUse: false,
        realTimeTypewriter: false,
        copyPasteScripts: true,
      },
      [PricingTier.CREATOR]: {
        tier: PricingTier.CREATOR,
        scriptsPerMonth: 50,
        psychologicalTriggers: 4,
        viralElementsCount: 4,
        platformOptimization: "advanced",
        personalization: "targeted",
        contentLength: "medium",
        hookOptimization: "advanced",
        commercialUse: false, // Individual creators building personal brand
        realTimeTypewriter: true,
        copyPasteScripts: true,
      },
      [PricingTier.BUSINESS]: {
        tier: PricingTier.BUSINESS,
        scriptsPerMonth: 200,
        psychologicalTriggers: 6,
        viralElementsCount: 6,
        platformOptimization: "expert",
        personalization: "hyper-targeted",
        contentLength: "long",
        hookOptimization: "expert",
        commercialUse: true, // Agencies & scaling operations
        realTimeTypewriter: true,
        copyPasteScripts: true,
      },
    };

    return configs[tier];
  }

  /**
   * MAIN CONTENT GENERATION SYSTEM ALIGNED WITH PRICING
   */
  static generateContentPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: "instagram" | "tiktok" | "youtube",
    userTier: PricingTier = PricingTier.FREE
  ): string {
    const config = this.getTierConfig(userTier);

    return this.buildAlignedPrompt(
      productName,
      niche,
      targetAudience,
      platform,
      config
    );
  }

  /**
   * BUILD PROMPT ALIGNED WITH PRICING STRATEGY
   */
  private static buildAlignedPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: string,
    config: ContentQualityConfig
  ): string {
    const basePrompt = this.getBasePromptByTier(config.tier);
    const features = this.getFeaturesByTier(config, platform, niche);

    return `${basePrompt}

## CONTENT CONTEXT
Product: ${productName}
Niche: ${niche}
Target Audience: ${targetAudience}
Platform: ${platform.toUpperCase()}
Plan: ${this.getPlanLabel(config.tier)}
Scripts Remaining: ${config.scriptsPerMonth} this month

${features.psychologySection}

${features.viralSection}

${features.platformSection}

${features.personalizationSection}

${features.businessSection}

${features.outputSection}

${this.getTierUpgradeMessage(config.tier)}`;
  }

  /**
   * TIER-SPECIFIC BASE PROMPTS ALIGNED WITH VALUE PROPOSITION
   */
  private static getBasePromptByTier(tier: PricingTier): string {
    switch (tier) {
      case PricingTier.FREE:
        return `# VIRAL UGC CONTENT GENERATOR (FREE TRIAL)
You are a content creation assistant helping creators make engaging social media content.

## FREE TRIAL (5 Scripts)
Experience our AI-powered script generation. Perfect for testing our platform before upgrading.

## LIMITATIONS
- Basic content structure
- 2 psychological triggers maximum
- Generic audience targeting
- Short content format only`;

      case PricingTier.CREATOR:
        return `# PRO VIRAL CONTENT CREATOR ($15/month)
You are an expert viral content creator specializing in personal brand building and individual creator success.

## CREATOR PLAN FEATURES
✓ 50 UGC scripts per month
✓ TikTok & Instagram optimization
✓ Advanced AI script generation  
✓ Real-time typewriter effect
✓ Copy & paste ready scripts
✓ Personal brand focus

## PERFECT FOR
Individual creators building their personal brand and content library.`;

      case PricingTier.BUSINESS:
        return `# BUSINESS VIRAL CONTENT SYSTEM ($39/month)
You are the ultimate viral content creation system for agencies and scaling content operations.

## BUSINESS PLAN FEATURES
✓ 200 UGC scripts per month
✓ TikTok & Instagram scripts
✓ Expert-level AI generation
✓ Real-time typewriter effect  
✓ Copy & paste scripts
✓ Commercial usage rights
✓ Agency-scale content production

## PERFECT FOR  
Creators and agencies scaling their UGC content operations with high-volume needs.`;
    }
  }

  /**
   * PROGRESSIVE FEATURES ALIGNED WITH PRICING VALUE
   */
  private static getFeaturesByTier(
    config: ContentQualityConfig,
    platform: string,
    niche: string
  ) {
    return {
      psychologySection: this.getPsychologySection(config),
      viralSection: this.getViralSection(config, platform),
      platformSection: this.getPlatformSection(config, platform),
      personalizationSection: this.getPersonalizationSection(config, niche),
      businessSection: this.getBusinessSection(config),
      outputSection: this.getOutputSection(config),
    };
  }

  /**
   * PSYCHOLOGY TRIGGERS BY TIER
   */
  private static getPsychologySection(config: ContentQualityConfig): string {
    if (config.tier === PricingTier.FREE) {
      return `## BASIC PSYCHOLOGY (FREE)
- Create curiosity with engaging opening
- Include social proof when relevant  
- Use clear, benefit-focused language
- Maximum 2 basic triggers`;
    }

    if (config.tier === PricingTier.CREATOR) {
      return `## ADVANCED CREATOR PSYCHOLOGY (CREATOR PLAN)
- **Curiosity Gaps**: Questions that demand answers
- **Social Proof**: Specific numbers and testimonials
- **Authority Building**: Personal expertise signals
- **FOMO Triggers**: Limited availability messaging
- **Pattern Interrupts**: Challenge assumptions
- Use up to ${config.psychologicalTriggers} psychological triggers for maximum engagement`;
    }

    // BUSINESS tier
    return `## EXPERT BUSINESS PSYCHOLOGY (BUSINESS PLAN)
- **Multi-Layered Curiosity**: Complex information loops
- **Authority Stacking**: Multiple credibility signals  
- **Strategic Controversy**: Calculated polarization
- **Advanced Social Proof**: Case studies and metrics
- **Viral Psychology Triggers**: Platform-specific engagement
- **Cognitive Bias Leverage**: Mental shortcut exploitation
- Use up to ${config.psychologicalTriggers} expert-level psychological triggers`;
  }

  /**
   * VIRAL MECHANICS BY TIER
   */
  private static getViralSection(
    config: ContentQualityConfig,
    platform: string
  ): string {
    if (config.tier === PricingTier.FREE) {
      return `## BASIC VIRAL MECHANICS (FREE)
- Attention-grabbing hook
- Clear value delivery
- Simple call-to-action`;
    }

    if (config.tier === PricingTier.CREATOR) {
      return `## CREATOR VIRAL MECHANICS (CREATOR PLAN)
- **Hook Mastery**: First 2-second attention capture
- **Value Stacking**: Progressive benefit reveals
- **${platform} Optimization**: Platform-specific viral triggers
- **Engagement Bait**: Comment-generating questions
- **Share Triggers**: Quotable, memorable moments
- Up to ${config.viralElementsCount} viral elements per script`;
    }

    // BUSINESS tier
    return `## BUSINESS VIRAL MECHANICS (BUSINESS PLAN)
- **Multi-Hook Architecture**: Layered attention systems
- **Viral Loop Creation**: Self-amplifying content structure
- **Algorithm Mastery**: Platform algorithm optimization
- **Trend Integration**: Real-time trend capitalization  
- **Engagement Optimization**: Advanced interaction triggers
- **Scale-Ready Format**: Agency-level content systems
- Up to ${config.viralElementsCount} expert viral elements per script`;
  }

  /**
   * PLATFORM OPTIMIZATION BY TIER
   */
  private static getPlatformSection(
    config: ContentQualityConfig,
    platform: string
  ): string {
    const platformName = platform.toUpperCase();

    if (config.platformOptimization === "basic") {
      return `## ${platformName} BASICS (FREE)
- Standard ${platform} format compatibility
- Basic hashtag suggestions
- Generic best practices`;
    }

    if (config.platformOptimization === "advanced") {
      return `## ${platformName} CREATOR OPTIMIZATION (CREATOR PLAN)
- **Advanced Timing**: Optimal posting strategies
- **Format Mastery**: ${platform}-specific content structure
- **Hashtag Strategy**: Targeted hashtag research
- **Trend Alignment**: Current ${platform} trends integration
- **Algorithm Factors**: Engagement velocity optimization`;
    }

    // Expert level for BUSINESS
    return `## ${platformName} BUSINESS OPTIMIZATION (BUSINESS PLAN)  
- **Expert Algorithm Understanding**: Deep platform mechanics
- **Multi-Format Strategy**: Cross-format content adaptation
- **Competitive Analysis**: Competitor content intelligence
- **Trend Prediction**: Emerging trend identification
- **Performance Optimization**: Data-driven content refinement
- **Scale Systems**: Batch content creation workflows`;
  }

  /**
   * PERSONALIZATION BY TIER
   */
  private static getPersonalizationSection(
    config: ContentQualityConfig,
    niche: string
  ): string {
    if (config.personalization === "generic") {
      return `## AUDIENCE TARGETING (FREE)
- Broad ${niche} audience appeal
- Generic messaging approach`;
    }

    if (config.personalization === "targeted") {
      return `## CREATOR PERSONALIZATION (CREATOR PLAN)
- **Niche-Specific**: Deep ${niche} audience understanding
- **Demographic Targeting**: Age, location, interest optimization
- **Pain Point Focus**: Specific problem addressing
- **Language Adaptation**: Audience-appropriate tone and terms`;
    }

    // Hyper-targeted for BUSINESS
    return `## BUSINESS HYPER-TARGETING (BUSINESS PLAN)
- **Psychographic Profiling**: Deep audience psychology
- **Micro-Niche Targeting**: Ultra-specific audience segments
- **Cultural Adaptation**: Regional and cultural optimization
- **Behavioral Triggers**: Action-based personalization
- **A/B Testing Ready**: Multiple audience variations`;
  }

  /**
   * BUSINESS FEATURES SECTION
   */
  private static getBusinessSection(config: ContentQualityConfig): string {
    if (!config.commercialUse && config.tier !== PricingTier.BUSINESS) {
      return config.tier === PricingTier.CREATOR
        ? `## CREATOR FOCUS
- Personal brand building optimization
- Individual creator success metrics
- Authentic voice development`
        : "";
    }

    return `## BUSINESS FEATURES (BUSINESS PLAN)
- **Commercial Usage Rights**: Use scripts for client work
- **Agency Scaling**: High-volume content production
- **Client-Ready Content**: Professional-grade scripts
- **White-Label Ready**: Brandable content creation
- **ROI Optimization**: Revenue-focused content strategy`;
  }

  /**
   * OUTPUT FORMAT BY TIER
   */
  private static getOutputSection(config: ContentQualityConfig): string {
    const lengthGuide = {
      short: "30-50 words",
      medium: "60-100 words",
      long: "100-150 words",
    }[config.contentLength];

    let additionalFields = "";

    if (config.tier === PricingTier.CREATOR) {
      additionalFields = `,\n  "psychological_triggers": ["triggers used"],\n  "engagement_prediction": "estimated performance",\n  "creator_tips": ["optimization suggestions"]`;
    } else if (config.tier === PricingTier.BUSINESS) {
      additionalFields = `,\n  "psychological_triggers": ["expert triggers used"],\n  "engagement_prediction": "detailed performance forecast",\n  "business_metrics": "ROI and conversion potential",\n  "scaling_notes": ["agency implementation tips"],\n  "client_presentation": "ready for client delivery"`;
    }

    return `## OUTPUT FORMAT
Return clean JSON ready for copy & paste:
{
  "title": "${config.hookOptimization} hook optimized for virality",
  "hook": "Scroll-stopping opener (${config.hookOptimization} level)",
  "script": "Complete UGC script (${lengthGuide})",
  "viral_elements": ["specific viral mechanics used"],
  "platform_hashtags": ["optimized hashtags"],
  "call_to_action": "engagement-driving CTA"${additionalFields}
}

## COPY & PASTE READY
All scripts formatted for immediate use with real-time typewriter effect.`;
  }

  /**
   * TIER UPGRADE MESSAGING
   */
  private static getTierUpgradeMessage(tier: PricingTier): string {
    if (tier === PricingTier.FREE) {
      return `## 🚀 UPGRADE TO UNLOCK MORE
**CREATOR PLAN ($15/month):**
- 50 scripts/month (vs 5 free)
- Advanced psychology triggers
- Real-time typewriter effect
- Perfect for personal brand building

**BUSINESS PLAN ($39/month):**  
- 200 scripts/month
- Expert-level optimization
- Commercial usage rights
- Perfect for agencies & scaling`;
    }

    if (tier === PricingTier.CREATOR) {
      return `## 🎯 SCALE WITH BUSINESS PLAN
**Upgrade to BUSINESS ($39/month):**
- 4x more scripts (200 vs 50)
- Commercial usage rights
- Expert-level optimization  
- Perfect for client work & agencies`;
    }

    return `## 🏆 YOU'RE ON THE ULTIMATE PLAN
Business Plan includes all premium features for maximum content scaling.`;
  }

  /**
   * HELPER METHODS
   */
  private static getPlanLabel(tier: PricingTier): string {
    const labels = {
      [PricingTier.FREE]: "Free Trial (5 scripts)",
      [PricingTier.CREATOR]: "Creator Plan ($15/month - 50 scripts)",
      [PricingTier.BUSINESS]: "Business Plan ($39/month - 200 scripts)",
    };
    return labels[tier];
  }

  /**
   * LEGACY COMPATIBILITY METHODS
   */
  static generateMasterPrompt(context: ViralPromptContext): string {
    return this.generateContentPrompt(
      context.productName,
      context.niche,
      context.targetAudience,
      context.platform,
      PricingTier.BUSINESS // Use highest tier for legacy calls
    );
  }

  static generateSimplifiedMasterPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: "instagram" | "tiktok" | "youtube" = "tiktok"
  ): string {
    return this.generateContentPrompt(
      productName,
      niche,
      targetAudience,
      platform,
      PricingTier.CREATOR
    );
  }

  /**
   * NEW CONVENIENCE METHODS FOR PRICING STRATEGY
   */
  static generateFreeTrialPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: "instagram" | "tiktok" | "youtube" = "tiktok"
  ): string {
    return this.generateContentPrompt(
      productName,
      niche,
      targetAudience,
      platform,
      PricingTier.FREE
    );
  }

  static generateCreatorPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: "instagram" | "tiktok" | "youtube" = "tiktok"
  ): string {
    return this.generateContentPrompt(
      productName,
      niche,
      targetAudience,
      platform,
      PricingTier.CREATOR
    );
  }

  static generateBusinessPrompt(
    productName: string,
    niche: string,
    targetAudience: string,
    platform: "instagram" | "tiktok" | "youtube" = "tiktok"
  ): string {
    return this.generateContentPrompt(
      productName,
      niche,
      targetAudience,
      platform,
      PricingTier.BUSINESS
    );
  }
}
