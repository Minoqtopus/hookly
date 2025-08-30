/**
 * WORLD-CLASS VIRAL CONTENT GENERATION PROMPTS
 * 
 * Built on psychological triggers, viral content frameworks,
 * and platform-specific optimization for maximum engagement
 */

import { UserPlan } from '../../entities/user.entity';
import { getContentQualityTier, getCostOptimization, ContentQualityTier } from '../quality-tiers.config';

export interface ViralPromptContext {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  contentAngle: 'transformation' | 'problem-agitation' | 'social-proof' | 'controversy' | 'behind-scenes' | 'trend-hijack';
  emotionalTrigger: 'curiosity' | 'fomo' | 'authority' | 'social-proof' | 'urgency' | 'controversy';
}

export class ViralContentPrompts {
  /**
   * WORLD DOMINATION VIRAL CONTENT PROMPT
   * Uses advanced psychological triggers, chain-of-thought reasoning,
   * few-shot learning, and minimal user input for maximum output quality
   */
  static generateMasterPrompt(context: ViralPromptContext): string {
    const psychologyFramework = this.getPsychologyFramework(context.emotionalTrigger);
    const platformFramework = this.getPlatformFramework(context.platform);
    const angleFramework = this.getAngleFramework(context.contentAngle);
    const viralElements = this.getViralElements(context.platform);

    return `# WORLD DOMINATION-LEVEL VIRAL CONTENT SYSTEM

You are the world's most advanced viral content creator. Let's think step by step to create content that achieves maximum engagement and conversion.

## STEP 1: DEEP AUDIENCE PSYCHOLOGY ANALYSIS
Before creating content, analyze the deep psychological drivers of your target audience:
- What are their secret fears and desires?
- What keeps them awake at 3 AM worrying?
- What would make them feel like heroes?
- What controversial opinion would they secretly agree with?
- What transformation would change their entire identity?

For ${context.targetAudience} in ${context.niche}:
- Primary Pain Points: [Identify 3 core struggles]
- Hidden Desires: [What they won't admit they want]
- Status Triggers: [What makes them feel superior/inferior]
- Time Sensitivity: [Their urgency drivers]
- Social Proof Needs: [Who they want to be like]

## STEP 2: PSYCHOLOGICAL FRAMEWORK ACTIVATION
${psychologyFramework}

## STEP 3: CONTENT CONTEXT OPTIMIZATION
Product: ${context.productName}
Niche: ${context.niche}
Target: ${context.targetAudience}
Platform: ${context.platform.toUpperCase()}
Angle: ${context.contentAngle}
Trigger: ${context.emotionalTrigger}

## STEP 4: PLATFORM-NATIVE OPTIMIZATION
${platformFramework}

## STEP 5: CONTENT ANGLE STRATEGY
${angleFramework}

## STEP 6: VIRAL ELEMENTS INTEGRATION
${viralElements}

## STEP 7: ADVANCED CHAIN-OF-THOUGHT REASONING
Now, let's think step by step about creating the perfect viral content:

1. **Hook Analysis**: What will make someone stop scrolling in 0.5 seconds?
2. **Emotional Journey**: How will we take them from curiosity to action?
3. **Value Delivery**: What specific outcome will they achieve?
4. **Social Dynamics**: Why will they NEED to share this?
5. **Psychological Completion**: How do we create the perfect dopamine loop?

## STEP 8: FEW-SHOT LEARNING EXAMPLES

### VIRAL HOOK EXAMPLES:
**High-Performing TikTok Hooks:**
- "POV: You just discovered the $67M industry secret that fitness influencers don't want you to know"
- "Stop wasting money on [product category]. Here's what actually works (saved me $2,847)"
- "Day 23 of trying the method that got 847,000 people results. Here's what happened..."

**High-Converting Instagram Hooks:**
- "Screenshots of the DMs I get after sharing this productivity hack (swipe to see why)"
- "Things I wish someone told me before I spent $12K learning this the hard way"
- "Plot twist: The #1 reason your [goal] isn't working isn't what you think"

**YouTube Shorts Winners:**
- "This 37-second routine changed everything (try it right now)"
- "Everyone does this wrong. Here's the method that actually works"
- "What happened when I tried the viral [trend] for 30 days straight"

## STEP 9: CRITICAL SUCCESS FACTORS

### HOOK REQUIREMENTS (First 3 seconds)
- Use pattern interrupts: "Stop doing X", "Everyone gets this wrong", "Nobody talks about..."
- Create immediate curiosity gaps: "The thing that changed everything was...", "What they don't tell you about..."
- Use controversial statements: "Unpopular opinion:", "This is why X doesn't work:"
- Reference specific numbers/timeframes: "In 37 days...", "After 847 attempts..."

### SCRIPT PSYCHOLOGY
1. **Open Loop**: Create questions that demand answers
2. **Social Proof**: Reference others' results/reactions
3. **Authority Signals**: Specific details, insider knowledge
4. **Urgency/Scarcity**: Time-sensitive information
5. **Controversy**: Challenge common beliefs
6. **Relatability**: "I was just like you" moments

### ENGAGEMENT MAXIMIZATION
- End with questions that generate comments
- Include shareable moments/quotes
- Create "save for later" value
- Build in natural pause points
- Use cliffhangers and callbacks

## ADVANCED VIRAL TRIGGERS TO INCLUDE:

### Pattern Interrupts (Use 2-3):
- "Stop doing X" (authority challenge)
- "Everyone gets X wrong" (contrarian positioning)
- "What they don't tell you about X" (insider knowledge)
- "Nobody talks about X" (forbidden knowledge)
- "Before you waste more time on X" (urgency + value)

### Curiosity Gaps (Use 1-2):
- "The thing that changed everything was..." (open loop)
- "But here's what happened next..." (story continuation)  
- "What I discovered will shock you..." (revelation tease)
- "The difference? X does the opposite." (contrarian reveal)

### Social Proof Amplifiers (Use 1-2):
- Specific numbers: "After 847 attempts...", "In exactly 23 days..."
- Authority positioning: "Industry insiders don't want you to know..."
- Peer validation: "People like you are already doing this..."
- FOMO triggers: "While everyone else is doing X, smart people do Y..."

## CRITICAL OUTPUT REQUIREMENTS:
- Write ONLY final user-readable content
- NO video directions like "(Video opens with...)" 
- NO timing markers like "[0-3 seconds]"
- NO production notes or technical instructions
- Use natural, conversational language
- Include specific numbers and timeframes for credibility
- End with engagement questions that generate comments

## OUTPUT FORMAT
Return clean JSON only:
{
  "title": "Pattern interrupt title with specific benefit and numbers",
  "hook": "3-second scroll-stopping opener with curiosity gap and specificity", 
  "script": "Complete viral script with psychological triggers, specific results, and engagement CTA",
  "viral_elements": ["specific psychological triggers used"],
  "engagement_hooks": ["specific questions designed to generate comments/saves/shares"]
}

## ADVANCED VIRAL PSYCHOLOGY INTEGRATION

### KNOWLEDGE GENERATION PHASE
First, generate deep knowledge about the topic:
1. What are 3 little-known facts about ${context.niche} that would surprise experts?
2. What controversial industry practices exist that insiders know but outsiders don't?
3. What transformation story would seem impossible but is actually achievable?
4. What specific numbers/metrics would create instant credibility?
5. What emotional trigger will create the strongest response in ${context.targetAudience}?

### TREE OF THOUGHTS EVALUATION
Consider multiple content paths:
- **Path A**: Direct education with authority positioning
- **Path B**: Story-driven transformation with relatability
- **Path C**: Controversial opinion with social proof backing
- **Path D**: Behind-scenes revelation with insider knowledge

Select the path that maximizes: Engagement × Shareability × Conversion Potential

### MULTI-MODAL CONTENT OPTIMIZATION
Ensure content works across formats:
- **Visual Elements**: What would make this screenshot-worthy?
- **Audio Elements**: What would make this quotable?
- **Interactive Elements**: What would drive comments and saves?
- **Viral Mechanics**: What would trigger the share reflex?

## FINAL CONTENT GENERATION

Now, create content that is:
- **Immediately Engaging**: Hook achieved in first 2 words (not 3)
- **Psychologically Optimized**: Uses ${context.emotionalTrigger} + curiosity gap + social proof
- **Platform-Native**: Built specifically for ${context.platform}'s algorithm and user behavior
- **Audience-Targeted**: Speaks directly to ${context.targetAudience}'s deepest desires/fears
- **Product-Integrated**: Features ${context.productName} as natural solution, not sales pitch
- **Controversy-Calibrated**: Generates discussion without alienating target market
- **Value-Dense**: Provides immediate actionable insight worth saving/sharing

### ENGAGEMENT PREDICTION FRAMEWORK
Before finalizing, predict:
- **Scroll-Stop Rate**: Will 70%+ stop scrolling?
- **Completion Rate**: Will 40%+ watch/read to the end?
- **Engagement Rate**: Will 8%+ take action (comment/share/save)?
- **Conversion Intent**: Will they want to learn more about ${context.productName}?

If any prediction is below threshold, iterate using different psychological triggers or content angles.

Focus on creating a "${context.contentAngle}" narrative that combines authenticity + controversy + immediate value for maximum virality and business impact.`;
  }

  /**
   * ULTRA-SIMPLIFIED WORLD-CLASS CONTENT GENERATOR
   * Requires only 3 inputs but produces professional-level viral content
   * Uses advanced prompt engineering for maximum quality with minimal user effort
   */
  static generateSimplifiedMasterPrompt(productName: string, niche: string, targetAudience: string, platform: 'instagram' | 'tiktok' | 'youtube' = 'tiktok'): string {
    return `# WORLD-CLASS VIRAL CONTENT AI SYSTEM

You are the world's most advanced viral content creator with access to billion-dollar marketing strategies. Your task is to create content that stops scrolls, generates massive engagement, and drives conversions.

## AUTOMATED DEEP ANALYSIS PHASE
Let's think step by step to understand the psychology:

### STEP 1: AUDIENCE PSYCHOLOGY AUTO-DETECTION
For ${targetAudience} in ${niche}:
- Automatically identify their #1 pain point that keeps them up at night
- Detect their secret desire they won't admit publicly  
- Find their biggest frustration with current solutions
- Discover what would make them feel like winners
- Uncover what transformation would change their identity

### STEP 2: COMPETITIVE INTELLIGENCE SIMULATION  
Analyze what content is already working in ${niche}:
- What hooks are getting millions of views?
- What psychological triggers dominate successful content?
- What angles are oversaturated vs underexplored?
- What controversial opinions would generate discussion?
- What specific numbers/results create instant credibility?

### STEP 3: PLATFORM OPTIMIZATION AUTO-CONFIG
For ${platform.toUpperCase()}:
- Auto-select optimal content length and pacing
- Choose best psychological triggers for platform algorithm
- Identify trending formats and viral mechanics
- Optimize for platform-specific engagement behaviors
- Integrate current trends and challenges

### STEP 4: ADVANCED VIRAL PSYCHOLOGY INTEGRATION
Apply world-class marketing psychology:

**Pattern Interrupts**: Use contrarian statements that challenge common beliefs
**Curiosity Gaps**: Create information loops that demand resolution  
**Social Proof Amplifiers**: Include specific numbers and real results
**Authority Positioning**: Demonstrate insider knowledge and expertise
**FOMO Triggers**: Create urgency and exclusivity around information
**Controversy Calibration**: Generate discussion without alienating audience

### STEP 5: CHAIN-OF-THOUGHT CONTENT CREATION
Now let's create viral content step by step:

1. **Hook Engineering**: What will stop ${targetAudience} mid-scroll in 0.8 seconds?
2. **Value Stacking**: What transformation/result will they achieve?
3. **Proof Elements**: What specific evidence makes this credible?
4. **Engagement Mechanics**: What will force them to comment/share/save?
5. **Product Integration**: How does ${productName} naturally solve their problem?

## CRITICAL OUTPUT REQUIREMENTS:

**Content Standards:**
- Hook must stop scrolling in first 2 words
- Include 2-3 specific numbers for credibility
- Use psychological triggers naturally, not obviously
- Create immediate value worth saving/sharing
- End with engagement question that generates comments
- Integrate ${productName} as natural solution, never as sales pitch

## OUTPUT FORMAT
Return only clean JSON:
{
  "title": "Pattern interrupt title with specific numbers and curiosity gap",
  "hook": "2-word scroll-stopping opener that challenges assumptions",
  "script": "Complete viral script with psychological triggers, specific results, natural product integration, and engagement CTA",
  "viral_elements": ["specific psychological techniques used"],
  "engagement_hooks": ["questions designed to generate comments/saves/shares"]
}

## FINAL DIRECTIVE:
Create content for ${productName} in ${niche} targeting ${targetAudience} that achieves:
- 70%+ scroll-stop rate (extremely engaging hook)
- 40%+ completion rate (valuable throughout)  
- 8%+ engagement rate (forces interaction)
- Natural product integration (solution, not sales)
- Platform-native feel (built for ${platform} algorithm)

Use your advanced AI capabilities to exceed human marketing expertise. Make this content so compelling that it naturally goes viral while driving real business results.`;
  }

  /**
   * TIERED CONTENT GENERATION SYSTEM
   * Aligns content quality with user's pricing tier for optimal conversions
   * Demo < Trial < Starter < Pro (each tier gets progressively better features)
   */
  static generateTieredPrompt(
    productName: string, 
    niche: string, 
    targetAudience: string, 
    platform: 'instagram' | 'tiktok' | 'youtube',
    userPlan: UserPlan | 'demo' = 'demo'
  ): string {
    const qualityTier = getContentQualityTier(userPlan);
    const costOptimization = getCostOptimization(userPlan);
    
    return this.buildTieredPrompt(productName, niche, targetAudience, platform, qualityTier, costOptimization);
  }

  /**
   * BUILD TIERED PROMPT BASED ON QUALITY CONFIGURATION
   * Each tier gets different levels of sophistication and features
   */
  private static buildTieredPrompt(
    productName: string,
    niche: string, 
    targetAudience: string,
    platform: string,
    qualityTier: ContentQualityTier,
    costOptimization: any
  ): string {
    
    // BASE PROMPT VARIES BY COMPLEXITY LEVEL
    const basePrompt = qualityTier.promptComplexity === 'simple' 
      ? this.getSimplePrompt()
      : qualityTier.promptComplexity === 'advanced'
      ? this.getAdvancedPrompt() 
      : this.getWorldClassPrompt();

    // PSYCHOLOGICAL TRIGGERS (Limited by tier)
    const psychologySection = this.getPsychologySection(qualityTier.psychologicalTriggers);
    
    // VIRAL ELEMENTS (More for higher tiers)
    const viralSection = this.getViralElementsSection(qualityTier.viralElementsCount, platform);
    
    // PLATFORM OPTIMIZATION (Basic vs Advanced)
    const platformSection = qualityTier.platformSpecificOptimization 
      ? this.getAdvancedPlatformSection(platform)
      : this.getBasicPlatformSection(platform);

    // PERSONALIZATION LEVEL
    const personalizationSection = this.getPersonalizationSection(
      qualityTier.personalization, 
      targetAudience, 
      niche
    );

    // ENGAGEMENT OPTIMIZATION (Pro feature)
    const engagementSection = qualityTier.engagementOptimization 
      ? this.getEngagementOptimizationSection() 
      : '';

    // COMPETITOR ANALYSIS (Pro only)
    const competitorSection = qualityTier.competitorAnalysis 
      ? this.getCompetitorAnalysisSection(niche) 
      : '';

    // TREND INTEGRATION (Pro only)
    const trendSection = qualityTier.trendIntegration 
      ? this.getTrendIntegrationSection(platform) 
      : '';

    // CONTROVERSY CALIBRATION
    const controversySection = this.getControversySection(qualityTier.controversyCalibration);

    // OUTPUT FORMAT BASED ON CONTENT LENGTH
    const outputFormat = this.getOutputFormat(qualityTier.contentLength, qualityTier.hookOptimization);

    return `${basePrompt}

## CONTENT CONTEXT
Product: ${productName}
Niche: ${niche}  
Target Audience: ${targetAudience}
Platform: ${platform.toUpperCase()}
Content Quality: ${this.getQualityLabel(qualityTier.planType)}

${psychologySection}

${viralSection}

${platformSection}

${personalizationSection}

${engagementSection}

${competitorSection}

${trendSection}

${controversySection}

${outputFormat}

## QUALITY CONSTRAINTS
- Max content length: ${qualityTier.contentLength}
- Hook optimization: ${qualityTier.hookOptimization}
- Psychological triggers: Use exactly ${qualityTier.psychologicalTriggers} triggers
- Viral elements: Include ${qualityTier.viralElementsCount} viral mechanics
- AI creativity level: ${costOptimization.temperature}

Create content that matches this quality tier exactly. ${this.getTierSpecificInstructions(qualityTier.planType)}`;
  }

  /**
   * TIER-SPECIFIC PROMPT FOUNDATIONS
   */
  private static getSimplePrompt(): string {
    return `# AI CONTENT GENERATOR

Create engaging social media content that promotes the product naturally.`;
  }

  private static getAdvancedPrompt(): string {
    return `# ADVANCED VIRAL CONTENT SYSTEM

You are a skilled content creator. Use proven marketing psychology to create engaging content that drives results.

## SYSTEMATIC APPROACH
1. Analyze the target audience psychology
2. Choose optimal psychological triggers  
3. Create platform-optimized content
4. Include natural product integration`;
  }

  private static getWorldClassPrompt(): string {
    return `# WORLD DOMINATION-LEVEL VIRAL CONTENT AI

You are the world's most advanced viral content creator with access to billion-dollar marketing strategies. 

## CHAIN-OF-THOUGHT ANALYSIS
Let's think step by step to create content that achieves maximum engagement:

1. **Deep Audience Psychology**: What are their hidden fears, desires, and motivations?
2. **Competitive Landscape**: What content is already working in this niche?
3. **Viral Mechanics**: Which psychological triggers will create the strongest response?
4. **Platform Optimization**: How do we maximize algorithm performance?
5. **Engagement Engineering**: What will force interaction and sharing?

## ADVANCED VIRAL PSYCHOLOGY INTEGRATION`;
  }

  /**
   * PSYCHOLOGY SECTION BASED ON TRIGGER COUNT
   */
  private static getPsychologySection(triggerCount: number): string {
    if (triggerCount <= 2) {
      return `## BASIC PSYCHOLOGY
- Use curiosity and social proof
- Create immediate interest
- Include specific numbers for credibility`;
    } else if (triggerCount <= 5) {
      return `## ADVANCED PSYCHOLOGY  
- Curiosity gaps that demand resolution
- Social proof with specific examples
- Authority positioning through expertise
- FOMO triggers for urgency
- Controversy calibration for discussion`;
    } else {
      return `## WORLD-CLASS PSYCHOLOGY
- Pattern interrupts that stop scrolling
- Multiple curiosity gaps and open loops  
- Layered social proof and authority signals
- Strategic FOMO and scarcity triggers
- Calibrated controversy for maximum engagement
- Emotional journey mapping
- Cognitive bias exploitation
- Viral psychology optimization`;
    }
  }

  /**
   * VIRAL ELEMENTS SECTION
   */
  private static getViralElementsSection(elementCount: number, platform: string): string {
    if (elementCount <= 1) {
      return `## BASIC VIRAL MECHANICS
- Hook that stops scrolling
- Clear value proposition`;
    } else if (elementCount <= 3) {
      return `## VIRAL MECHANICS
- Scroll-stopping hook with pattern interrupt
- Value stacking throughout content
- Platform-specific optimization for ${platform}
- Engagement question at the end`;
    } else {
      return `## ADVANCED VIRAL MECHANICS
- Multi-layered hooks and pattern interrupts
- Curiosity gaps and open loops
- Social proof stacking and authority signals
- Platform algorithm optimization
- Engagement baiting and share triggers
- Trend integration and controversy calibration`;
    }
  }

  /**
   * Get quality label for display
   */
  private static getQualityLabel(planType: UserPlan | 'demo'): string {
    switch(planType) {
      case 'demo': return 'Demo Quality';
      case UserPlan.TRIAL: return 'Standard Quality';
      case UserPlan.STARTER: return 'Advanced Quality'; 
      case UserPlan.PRO: return 'Premium Quality + AI Analysis';
      default: return 'Basic Quality';
    }
  }

  /**
   * TIER-SPECIFIC INSTRUCTIONS
   */
  private static getTierSpecificInstructions(planType: UserPlan | 'demo'): string {
    switch(planType) {
      case 'demo': 
        return 'Focus on showing basic value. Keep it simple but effective.';
      case UserPlan.TRIAL:
        return 'Create good content that showcases the platform\'s potential.';
      case UserPlan.STARTER:
        return 'Deliver strong value with advanced psychology and viral mechanics.';
      case UserPlan.PRO:
        return 'Create world-class content that justifies premium pricing with competitive analysis and trend integration.';
      default:
        return 'Create engaging content.';
    }
  }

  // Placeholder methods for other sections (to be implemented)
  private static getBasicPlatformSection(platform: string): string {
    return `## ${platform.toUpperCase()} OPTIMIZATION
- Create content suitable for ${platform}
- Use appropriate length and format`;
  }

  private static getAdvancedPlatformSection(platform: string): string {
    return this.getPlatformFramework(platform);
  }

  private static getPersonalizationSection(level: string, audience: string, niche: string): string {
    if (level === 'generic') {
      return `## AUDIENCE TARGETING
Target: General ${niche} audience`;
    } else if (level === 'targeted') {
      return `## AUDIENCE TARGETING  
Target: ${audience} in ${niche}
- Address their specific needs
- Use language they understand`;
    } else {
      return `## HYPER-PERSONALIZATION
Target: ${audience} in ${niche}
- Deep psychological profiling
- Specific pain points and desires
- Cultural and demographic nuances
- Behavioral trigger optimization`;
    }
  }

  private static getEngagementOptimizationSection(): string {
    return `## ENGAGEMENT OPTIMIZATION
- End with questions that generate comments
- Include "save this post" value
- Create shareable moments and quotes
- Build natural pause points for interaction`;
  }

  private static getCompetitorAnalysisSection(niche: string): string {
    return `## COMPETITIVE INTELLIGENCE (PRO FEATURE)
- Analyze top-performing content in ${niche}
- Identify gaps in competitor content
- Use contrarian positioning where appropriate
- Integrate insights from successful campaigns`;
  }

  private static getTrendIntegrationSection(platform: string): string {
    return `## TREND INTEGRATION (PRO FEATURE)
- Reference current ${platform} trends
- Integrate viral challenges and formats
- Use trending hashtags strategically
- Capitalize on cultural moments`;
  }

  private static getControversySection(level: string): string {
    if (level === 'none') return '';
    if (level === 'mild') {
      return `## CONTROVERSY GUIDELINES
- Use mild contrarian positioning
- Challenge common assumptions safely
- Avoid offensive or divisive topics`;
    } else {
      return `## STRATEGIC CONTROVERSY
- Calculated contrarian statements
- Challenge industry norms intelligently  
- Create discussion without alienating audience
- Balance engagement with brand safety`;
    }
  }

  private static getOutputFormat(length: string, optimization: string): string {
    const lengthGuide = length === 'short' ? '30-50 words'
      : length === 'medium' ? '60-100 words'
      : '100-150 words';

    const hookGuide = optimization === 'basic' ? 'Clear, engaging opening'
      : optimization === 'advanced' ? 'Pattern interrupt with curiosity gap'
      : 'Multi-layered hook with psychological triggers';

    return `## OUTPUT FORMAT
Return clean JSON:
{
  "title": "${hookGuide}",
  "hook": "Scroll-stopping opener (2-5 words max)",
  "script": "Complete content (${lengthGuide})",
  "viral_elements": ["psychological techniques used"],
  "engagement_hooks": ["questions for comments/shares"]
}`;
  }

  /**
   * PLATFORM-SPECIFIC FRAMEWORKS
   */
  private static getPlatformFramework(platform: string): string {
    const frameworks = {
      tiktok: `
### TIKTOK VIRAL FRAMEWORK
- **Hook Duration**: First 1-2 seconds (not 3)
- **Pacing**: Fast cuts, quick reveals every 5-7 seconds
- **Format**: Vertical video optimized (9:16)
- **Length**: 15-60 seconds ideal for virality
- **Trends**: Reference current sounds, challenges, formats
- **Comments**: End with polarizing questions or "what would you do?"
- **Shares**: Include "send this to someone who..." moments
- **Algorithm**: Use trending hashtags + niche hashtags (3:7 ratio)

**TikTok Psychology**:
- Dopamine hits every 3-5 seconds
- Visual pattern interrupts
- Relatable "main character" moments
- "That girl/boy who..." storytelling
- Quick value delivery with entertainment`,

      instagram: `
### INSTAGRAM VIRAL FRAMEWORK
- **Hook Strategy**: Carousel post hooks, story-worthy moments
- **Visual Appeal**: Aesthetic consistency, lifestyle integration
- **Length**: 30-90 seconds for Reels, longer for IGTV
- **Hashtags**: Mix of trending and niche (5-10 total)
- **Stories**: Behind-scenes content, polls, questions
- **Engagement**: "Save this post" value, "Tag a friend who..." shares
- **Algorithm**: Prioritize saves and shares over likes

**Instagram Psychology**:
- FOMO and lifestyle aspiration
- Educational carousel content
- Before/after transformations
- "Get ready with me" style narratives
- Community building through shared experiences`,

      youtube: `
### YOUTUBE VIRAL FRAMEWORK (SHORTS)
- **Hook Power**: First 3 seconds determine everything
- **Retention**: Hook every 15-20 seconds for watch time
- **Length**: 60 seconds max for Shorts algorithm
- **Thumbnails**: High contrast, emotional expressions
- **Titles**: Curiosity + benefit + urgency
- **Comments**: Ask specific questions to generate discussion
- **Subscribe**: Natural integration, value-first approach

**YouTube Psychology**:
- Educational entertainment blend
- Authority building through expertise
- Story-driven content with clear payoffs
- "How to" and "Why" question formats
- Community tab integration for engagement`
    };

    return frameworks[platform] || frameworks.tiktok;
  }

  /**
   * PSYCHOLOGICAL TRIGGER FRAMEWORKS
   */
  private static getPsychologyFramework(trigger: string): string {
    const frameworks = {
      curiosity: `
### CURIOSITY PSYCHOLOGICAL FRAMEWORK
- **Open Loops**: Start stories without immediate resolution
- **Pattern Interrupts**: Challenge expected outcomes
- **Information Gaps**: "What they don't tell you about..."
- **Specificity**: Use exact numbers, timeframes, details
- **Forbidden Knowledge**: "Insiders don't want you to know..."
- **Cognitive Dissonance**: Present contradictory information`,

      fomo: `
### FOMO PSYCHOLOGICAL FRAMEWORK  
- **Scarcity**: Limited time/availability language
- **Social Proof**: "Everyone is doing this except you"
- **Missed Opportunities**: "While you were sleeping..."
- **Trend Urgency**: "This is everywhere right now"
- **Exclusive Access**: "Only X people know this"
- **Time Sensitivity**: "This window is closing"`,

      authority: `
### AUTHORITY PSYCHOLOGICAL FRAMEWORK
- **Credentials**: Specific achievements, numbers, results
- **Insider Knowledge**: Behind-scenes information
- **Case Studies**: Real examples with data
- **Industry Experience**: Years, clients, transformations
- **Controversial Opinions**: Takes that only experts can make
- **Teaching Style**: Educational content delivery`,

      'social-proof': `
### SOCIAL PROOF PSYCHOLOGICAL FRAMEWORK
- **Testimonials**: Real people, real results
- **Numbers**: "X people can't be wrong"
- **Celebrity Endorsement**: Known figures using/recommending
- **Peer Validation**: "People like you are doing this"
- **Community**: "Join thousands who have..."
- **Reviews/Ratings**: Authentic feedback integration`,

      urgency: `
### URGENCY PSYCHOLOGICAL FRAMEWORK
- **Time Limits**: Countdown mentality
- **Immediate Action**: "Don't wait" language
- **Consequences**: What happens if they don't act
- **Opportunity Cost**: What they're missing right now
- **Momentum**: "Strike while the iron is hot"
- **Decision Fatigue**: Make the choice obvious`,

      controversy: `
### CONTROVERSY PSYCHOLOGICAL FRAMEWORK
- **Unpopular Opinions**: Challenge conventional wisdom
- **Polarizing Statements**: Create clear sides
- **Industry Secrets**: What insiders won't say
- **Myth Busting**: Destroy common beliefs
- **Contrarian Views**: Go against the crowd
- **Provocative Questions**: Force people to pick sides`
    };

    return frameworks[trigger] || frameworks.curiosity;
  }

  /**
   * CONTENT ANGLE FRAMEWORKS
   */
  private static getAngleFramework(angle: string): string {
    const frameworks = {
      transformation: `
### TRANSFORMATION ANGLE FRAMEWORK
- **Before State**: Detailed pain points, struggles
- **Catalyst Moment**: What triggered the change
- **Journey**: Step-by-step process with obstacles
- **After State**: Specific results, metrics, feelings
- **Social Impact**: How others reacted to the change
- **Authenticity**: Raw emotions, real challenges`,

      'problem-agitation': `
### PROBLEM-AGITATION FRAMEWORK
- **Problem Identification**: What's really wrong
- **Pain Amplification**: Make them feel the cost
- **Industry Lies**: What they've been sold vs reality
- **Failed Solutions**: Why other approaches don't work  
- **Rock Bottom**: The breaking point
- **Hope Introduction**: The light at the end`,

      'social-proof': `
### SOCIAL PROOF ANGLE FRAMEWORK
- **Community Evidence**: What others are achieving
- **Testimonial Narratives**: Real people, real stories
- **Numbers Game**: Statistics that shock
- **Celebrity Connection**: Famous people who use/endorse
- **Peer Validation**: "People like you" messaging
- **FOMO Integration**: What they're missing`,

      controversy: `
### CONTROVERSY ANGLE FRAMEWORK
- **Unpopular Truth**: What nobody wants to admit
- **Industry Critique**: Call out bad practices
- **Conventional Wisdom**: Challenge accepted beliefs
- **Personal Stakes**: Why this matters deeply
- **Evidence**: Data that supports the controversial view
- **Call to Action**: Join the revolution`,

      'behind-scenes': `
### BEHIND-SCENES FRAMEWORK
- **Hidden Process**: How it really works
- **Insider Access**: What outsiders never see
- **Real Struggles**: The unglamorous truth
- **Secret Methods**: Proprietary approaches
- **Personal Journey**: Your authentic experience
- **Exclusive Information**: First-time reveals`,

      'trend-hijack': `
### TREND-HIJACK FRAMEWORK
- **Current Trend**: What's happening right now
- **Unique Angle**: Your spin on the trend
- **Authority Position**: Why you can speak to this
- **Value Addition**: What you bring to the conversation
- **Community Connection**: How your audience relates
- **Call to Action**: Join the trend with your product`
    };

    return frameworks[angle] || frameworks.transformation;
  }

  /**
   * VIRAL ELEMENTS BY PLATFORM
   */
  private static getViralElements(platform: string): string {
    const elements = {
      tiktok: `
### TIKTOK VIRAL ELEMENTS
- **Trend Integration**: Current sounds, challenges, formats
- **Duet/Stitch Bait**: Content that invites responses
- **Educational Hooks**: "Things I wish I knew" format
- **Relatability**: "POV:", "Tell me you're X without telling me"
- **Transformation**: Before/after reveals
- **Controversy**: "Unpopular opinion" starters`,

      instagram: `
### INSTAGRAM VIRAL ELEMENTS
- **Carousel Value**: Multi-slide educational content
- **Story Integration**: Polls, questions, interactive elements
- **Aesthetic Hooks**: Visually striking content
- **Save-Worthy**: Content worth referencing later
- **Share Triggers**: "Send this to someone who..."
- **Community Building**: Hashtag creation, challenges`,

      youtube: `
### YOUTUBE VIRAL ELEMENTS  
- **Thumbnail Psychology**: High contrast, emotional faces
- **Title Optimization**: Curiosity + benefit + keyword
- **Retention Hooks**: Value promises every 15 seconds
- **Community Posts**: Pre-launch engagement
- **Comment Optimization**: Questions that generate discussion
- **Subscribe Integration**: Natural, value-first approach`
    };

    return elements[platform] || elements.tiktok;
  }
}