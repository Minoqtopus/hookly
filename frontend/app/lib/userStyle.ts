// User Style Learning System - Core competitive advantage for Hookly
// This system captures user preferences and brand voice to personalize AI content generation

export interface UserStyleProfile {
  id: string;
  userId: string;
  brandPersonality: BrandPersonality;
  industryFocus: IndustryFocus;
  audienceDemographics: AudienceDemographics;
  contentPreferences: ContentPreferences;
  toneAndVoice: ToneAndVoice;
  vocabularyStyle: VocabularyStyle;
  contentSamples: ContentSample[];
  lastUpdated: Date;
  confidenceScore: number; // 0-100, how confident we are in the style profile
}

export interface BrandPersonality {
  primary: BrandTrait;
  secondary: BrandTrait[];
  brandValues: string[];
  brandMission: string;
  uniqueSellingPoints: string[];
}

export interface IndustryFocus {
  primary: string;
  secondary: string[];
  industryJargon: string[];
  competitorAnalysis: string[];
  marketPositioning: string;
}

export interface AudienceDemographics {
  ageRange: AgeRange;
  genderDistribution: GenderDistribution;
  location: string[];
  interests: string[];
  painPoints: string[];
  aspirations: string[];
  contentConsumption: ContentConsumption[];
}

export interface ContentPreferences {
  preferredLength: ContentLength;
  formatPreferences: ContentFormat[];
  visualStyle: VisualStyle;
  callToActionStyle: CallToActionStyle;
  storytellingApproach: StorytellingApproach;
}

export interface ToneAndVoice {
  formality: FormalityLevel;
  enthusiasm: EnthusiasmLevel;
  humor: HumorStyle;
  empathy: EmpathyLevel;
  authority: AuthorityLevel;
  friendliness: FriendlinessLevel;
}

export interface VocabularyStyle {
  complexity: ComplexityLevel;
  industryTerms: boolean;
  slangUsage: SlangUsage;
  culturalReferences: boolean;
  technicalDepth: TechnicalDepth;
}

export interface ContentSample {
  id: string;
  content: string;
  platform: SocialPlatform;
  performance: ContentPerformance;
  userRating: number; // 1-5 stars
  tags: string[];
  createdAt: Date;
}

export interface ContentPerformance {
  views: number;
  engagement: number;
  conversionRate: number;
  viralScore: number; // 0-100
}

// Enums and Constants
export enum BrandTrait {
  INNOVATIVE = 'innovative',
  RELIABLE = 'reliable',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  LUXURIOUS = 'luxurious',
  AFFORDABLE = 'affordable',
  TRENDY = 'trendy',
  TRADITIONAL = 'traditional',
  BOLD = 'bold',
  CALM = 'calm',
  ENERGETIC = 'energetic'
}

export enum AgeRange {
  TEENS = '13-17',
  YOUNG_ADULTS = '18-24',
  ADULTS = '25-34',
  MIDDLE_ADULTS = '35-44',
  OLDER_ADULTS = '45-54',
  SENIORS = '55+'
}

export enum GenderDistribution {
  PREDOMINANTLY_MALE = 'predominantly_male',
  PREDOMINANTLY_FEMALE = 'predominantly_female',
  BALANCED = 'balanced',
  GENDER_NEUTRAL = 'gender_neutral'
}

export enum ContentConsumption {
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
  AUDIO = 'audio',
  INTERACTIVE = 'interactive'
}

export enum ContentLength {
  SHORT = 'short', // 15-30 seconds
  MEDIUM = 'medium', // 30-60 seconds
  LONG = 'long', // 1-3 minutes
  EXTENDED = 'extended' // 3+ minutes
}

export enum ContentFormat {
  STORY = 'story',
  TUTORIAL = 'tutorial',
  ENTERTAINMENT = 'entertainment',
  EDUCATIONAL = 'educational',
  PROMOTIONAL = 'promotional',
  BEHIND_THE_SCENES = 'behind_the_scenes'
}

export enum VisualStyle {
  MINIMALIST = 'minimalist',
  BOLD = 'bold',
  PLAYFUL = 'playful',
  SOPHISTICATED = 'sophisticated',
  RUSTIC = 'rustic',
  MODERN = 'modern',
  VINTAGE = 'vintage'
}

export enum CallToActionStyle {
  DIRECT = 'direct',
  SOFT = 'soft',
  URGENT = 'urgent',
  PLAYFUL = 'playful',
  PROFESSIONAL = 'professional'
}

export enum StorytellingApproach {
  PROBLEM_SOLUTION = 'problem_solution',
  STORY_ARC = 'story_arc',
  COMPARISON = 'comparison',
  TESTIMONIAL = 'testimonial',
  HOW_TO = 'how_to',
  BEHIND_THE_SCENES = 'behind_the_scenes'
}

export enum FormalityLevel {
  VERY_CASUAL = 'very_casual',
  CASUAL = 'casual',
  SEMI_FORMAL = 'semi_formal',
  FORMAL = 'formal',
  VERY_FORMAL = 'very_formal'
}

export enum EnthusiasmLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export enum HumorStyle {
  NONE = 'none',
  DRY = 'dry',
  PLAYFUL = 'playful',
  SARCASM = 'sarcasm',
  PUNS = 'puns',
  MEMES = 'memes'
}

export enum EmpathyLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export enum AuthorityLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXPERT = 'expert'
}

export enum FriendlinessLevel {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  VERY_FRIENDLY = 'very_friendly',
  FAMILIAR = 'familiar'
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  EXPERT = 'expert'
}

export enum SlangUsage {
  NONE = 'none',
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HEAVY = 'heavy'
}

export enum TechnicalDepth {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum SocialPlatform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  X = 'x',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin'
}

// User Style Learning System Class
export class UserStyleLearningSystem {
  private userProfile: UserStyleProfile | null = null;
  private learningHistory: ContentSample[] = [];
  private confidenceThreshold = 70; // Minimum confidence to use style profile

  constructor(userId: string) {
    this.loadUserProfile(userId);
  }

  // Load existing user profile from storage/API
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      // TODO: Load from API/localStorage
      const storedProfile = localStorage.getItem(`userStyle_${userId}`);
      if (storedProfile) {
        this.userProfile = JSON.parse(storedProfile);
      }
    } catch (error) {
      console.error('Error loading user style profile:', error);
    }
  }

  // Save user profile to storage/API
  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return;
    
    try {
      // TODO: Save to API/localStorage
      localStorage.setItem(`userStyle_${this.userProfile.userId}`, JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('Error saving user style profile:', error);
    }
  }

  // Initialize new user profile
  public async initializeProfile(userId: string): Promise<UserStyleProfile> {
    const defaultProfile: UserStyleProfile = {
      id: `profile_${Date.now()}`,
      userId,
      brandPersonality: {
        primary: BrandTrait.PROFESSIONAL,
        secondary: [BrandTrait.RELIABLE],
        brandValues: [],
        brandMission: '',
        uniqueSellingPoints: []
      },
      industryFocus: {
        primary: '',
        secondary: [],
        industryJargon: [],
        competitorAnalysis: [],
        marketPositioning: ''
      },
      audienceDemographics: {
        ageRange: AgeRange.ADULTS,
        genderDistribution: GenderDistribution.BALANCED,
        location: [],
        interests: [],
        painPoints: [],
        aspirations: [],
        contentConsumption: [ContentConsumption.VIDEO]
      },
      contentPreferences: {
        preferredLength: ContentLength.MEDIUM,
        formatPreferences: [ContentFormat.ENTERTAINMENT],
        visualStyle: VisualStyle.MODERN,
        callToActionStyle: CallToActionStyle.DIRECT,
        storytellingApproach: StorytellingApproach.PROBLEM_SOLUTION
      },
      toneAndVoice: {
        formality: FormalityLevel.SEMI_FORMAL,
        enthusiasm: EnthusiasmLevel.MODERATE,
        humor: HumorStyle.NONE,
        empathy: EmpathyLevel.MODERATE,
        authority: AuthorityLevel.MODERATE,
        friendliness: FriendlinessLevel.FRIENDLY
      },
      vocabularyStyle: {
        complexity: ComplexityLevel.MODERATE,
        industryTerms: false,
        slangUsage: SlangUsage.NONE,
        culturalReferences: false,
        technicalDepth: TechnicalDepth.BASIC
      },
      contentSamples: [],
      lastUpdated: new Date(),
      confidenceScore: 0
    };

    this.userProfile = defaultProfile;
    await this.saveUserProfile();
    return defaultProfile;
  }

  // Update profile based on user input
  public async updateProfile(updates: Partial<UserStyleProfile>): Promise<UserStyleProfile> {
    if (!this.userProfile) {
      throw new Error('User profile not initialized');
    }

    this.userProfile = { ...this.userProfile, ...updates };
    this.userProfile.lastUpdated = new Date();
    
    // Recalculate confidence score
    this.userProfile.confidenceScore = this.calculateConfidenceScore();
    
    await this.saveUserProfile();
    return this.userProfile;
  }

  // Add content sample for learning
  public async addContentSample(sample: Omit<ContentSample, 'id' | 'createdAt'>): Promise<void> {
    if (!this.userProfile) return;

    const newSample: ContentSample = {
      ...sample,
      id: `sample_${Date.now()}`,
      createdAt: new Date()
    };

    this.userProfile.contentSamples.push(newSample);
    this.learningHistory.push(newSample);
    
    // Update confidence score
    this.userProfile.confidenceScore = this.calculateConfidenceScore();
    
    await this.saveUserProfile();
  }

  // Learn from content performance
  public async learnFromPerformance(contentId: string, performance: ContentPerformance): Promise<void> {
    const sample = this.userProfile?.contentSamples.find(s => s.id === contentId);
    if (sample) {
      sample.performance = performance;
      await this.saveUserProfile();
    }
  }

  // Get style recommendations for content generation
  public getStyleRecommendations(platform: SocialPlatform, contentType: string): StyleRecommendations {
    if (!this.userProfile || this.userProfile.confidenceScore < this.confidenceThreshold) {
      return this.getDefaultRecommendations(platform, contentType);
    }

    return {
      tone: this.recommendTone(platform, contentType),
      length: this.recommendLength(platform, contentType),
      format: this.recommendFormat(platform, contentType),
      vocabulary: this.recommendVocabulary(platform, contentType),
      callToAction: this.recommendCallToAction(platform, contentType),
      confidence: this.userProfile.confidenceScore
    };
  }

  // Calculate confidence score based on profile completeness and learning history
  private calculateConfidenceScore(): number {
    if (!this.userProfile) return 0;

    let score = 0;
    const maxScore = 100;

    // Profile completeness (40 points)
    const profileFields = [
      this.userProfile.brandPersonality.brandMission,
      this.userProfile.industryFocus.primary,
      this.userProfile.audienceDemographics.interests.length,
      this.userProfile.contentSamples.length
    ];
    
    const completedFields = profileFields.filter(field => 
      field && (typeof field === 'string' ? field.length > 0 : field > 0)
    ).length;
    
    score += (completedFields / profileFields.length) * 40;

    // Learning history (30 points)
    const sampleCount = this.userProfile.contentSamples.length;
    score += Math.min(sampleCount * 3, 30);

    // Profile age (20 points)
    const daysSinceUpdate = (Date.now() - this.userProfile.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 20 - daysSinceUpdate);

    // User engagement (10 points)
    const recentSamples = this.userProfile.contentSamples.filter(sample => 
      (Date.now() - sample.createdAt.getTime()) < (1000 * 60 * 60 * 24 * 7) // Last 7 days
    );
    score += Math.min(recentSamples.length * 2, 10);

    return Math.min(Math.round(score), maxScore);
  }

  // Get default recommendations when confidence is low
  private getDefaultRecommendations(platform: SocialPlatform, contentType: string): StyleRecommendations {
    return {
      tone: {
        formality: FormalityLevel.SEMI_FORMAL,
        enthusiasm: EnthusiasmLevel.MODERATE,
        humor: HumorStyle.NONE,
        empathy: EmpathyLevel.MODERATE
      },
      length: ContentLength.MEDIUM,
      format: ContentFormat.ENTERTAINMENT,
      vocabulary: {
        complexity: ComplexityLevel.MODERATE,
        industryTerms: false,
        slangUsage: SlangUsage.NONE
      },
      callToAction: CallToActionStyle.DIRECT,
      confidence: 0
    };
  }

  // Platform-specific tone recommendations
  private recommendTone(platform: SocialPlatform, contentType: string): any {
    const baseTone = this.userProfile?.toneAndVoice;
    if (!baseTone) return this.getDefaultRecommendations(platform, contentType).tone;

    // Adjust tone based on platform
    switch (platform) {
      case SocialPlatform.TIKTOK:
        return {
          ...baseTone,
          enthusiasm: EnthusiasmLevel.HIGH,
          humor: baseTone.humor === HumorStyle.NONE ? HumorStyle.PLAYFUL : baseTone.humor,
          formality: FormalityLevel.CASUAL
        };
      case SocialPlatform.LINKEDIN:
        return {
          ...baseTone,
          formality: FormalityLevel.FORMAL,
          authority: AuthorityLevel.HIGH,
          humor: HumorStyle.NONE
        };
      case SocialPlatform.INSTAGRAM:
        return {
          ...baseTone,
          enthusiasm: EnthusiasmLevel.MODERATE,
          friendliness: FriendlinessLevel.FRIENDLY
        };
      default:
        return baseTone;
    }
  }

  // Platform-specific length recommendations
  private recommendLength(platform: SocialPlatform, contentType: string): ContentLength {
    switch (platform) {
      case SocialPlatform.TIKTOK:
        return ContentLength.SHORT;
      case SocialPlatform.YOUTUBE:
        return ContentLength.LONG;
      case SocialPlatform.INSTAGRAM:
        return ContentLength.MEDIUM;
      default:
        return ContentLength.MEDIUM;
    }
  }

  // Platform-specific format recommendations
  private recommendFormat(platform: SocialPlatform, contentType: string): ContentFormat {
    switch (platform) {
      case SocialPlatform.TIKTOK:
        return ContentFormat.ENTERTAINMENT;
      case SocialPlatform.LINKEDIN:
        return ContentFormat.EDUCATIONAL;
      case SocialPlatform.INSTAGRAM:
        return ContentFormat.STORY;
      default:
        return ContentFormat.ENTERTAINMENT;
    }
  }

  // Vocabulary recommendations based on audience and industry
  private recommendVocabulary(platform: SocialPlatform, contentType: string): any {
    const baseVocab = this.userProfile?.vocabularyStyle;
    if (!baseVocab) return this.getDefaultRecommendations(platform, contentType).vocabulary;

    // Adjust based on audience demographics
    const audience = this.userProfile?.audienceDemographics;
    if (audience?.ageRange === AgeRange.TEENS) {
      return {
        ...baseVocab,
        complexity: ComplexityLevel.SIMPLE,
        slangUsage: SlangUsage.MODERATE
      };
    }

    return baseVocab;
  }

  // Call-to-action recommendations
  private recommendCallToAction(platform: SocialPlatform, contentType: string): CallToActionStyle {
    const baseStyle = this.userProfile?.contentPreferences.callToActionStyle;
    if (!baseStyle) return CallToActionStyle.DIRECT;

    // Adjust based on platform and content type
    if (platform === SocialPlatform.LINKEDIN) {
      return CallToActionStyle.PROFESSIONAL;
    }

    if (contentType === 'promotional') {
      return CallToActionStyle.URGENT;
    }

    return baseStyle;
  }

  // Get profile insights and recommendations
  public getProfileInsights(): ProfileInsights {
    if (!this.userProfile) {
      return { insights: [], recommendations: [] };
    }

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Analyze brand personality
    if (this.userProfile.brandPersonality.brandValues.length < 3) {
      insights.push('Brand values could be more defined');
      recommendations.push('Add 3-5 core brand values to strengthen your brand identity');
    }

    // Analyze audience understanding
    if (this.userProfile.audienceDemographics.painPoints.length < 2) {
      insights.push('Limited understanding of audience pain points');
      recommendations.push('Research and document your audience\'s main challenges');
    }

    // Analyze content performance
    const highPerformingSamples = this.userProfile.contentSamples.filter(
      sample => sample.performance.viralScore > 70
    );
    
    if (highPerformingSamples.length > 0) {
      insights.push(`${highPerformingSamples.length} high-performing content pieces identified`);
      recommendations.push('Analyze what made these pieces successful and replicate the patterns');
    }

    // Analyze consistency
    const recentSamples = this.userProfile.contentSamples.filter(
      sample => (Date.now() - sample.createdAt.getTime()) < (1000 * 60 * 60 * 24 * 30)
    );
    
    if (recentSamples.length < 5) {
      insights.push('Limited recent content for style learning');
      recommendations.push('Create more content to improve style learning accuracy');
    }

    return { insights, recommendations };
  }

  // Export profile for backup/sharing
  public exportProfile(): string {
    if (!this.userProfile) return '';
    return JSON.stringify(this.userProfile, null, 2);
  }

  // Import profile from backup
  public async importProfile(profileData: string): Promise<void> {
    try {
      const profile = JSON.parse(profileData) as UserStyleProfile;
      this.userProfile = profile;
      await this.saveUserProfile();
    } catch (error) {
      throw new Error('Invalid profile data format');
    }
  }
}

// Style recommendations interface
export interface StyleRecommendations {
  tone: {
    formality: FormalityLevel;
    enthusiasm: EnthusiasmLevel;
    humor: HumorStyle;
    empathy: EmpathyLevel;
  };
  length: ContentLength;
  format: ContentFormat;
  vocabulary: {
    complexity: ComplexityLevel;
    industryTerms: boolean;
    slangUsage: SlangUsage;
  };
  callToAction: CallToActionStyle;
  confidence: number;
}

// Profile insights interface
export interface ProfileInsights {
  insights: string[];
  recommendations: string[];
}

// Export default instance
export const userStyleSystem = new UserStyleLearningSystem('default');
