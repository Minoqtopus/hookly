import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AlignedViralContentPrompts,
  PricingTier,
  ViralPromptContext,
} from "./prompts/viral-content-prompts";

export interface GenerationRequest {
  productName: string;
  niche: string;
  targetAudience: string;
  platform: "instagram" | "tiktok" | "youtube";
  contentAngle?:
    | "transformation"
    | "problem-agitation"
    | "social-proof"
    | "controversy"
    | "behind-scenes"
    | "trend-hijack";
  emotionalTrigger?:
    | "curiosity"
    | "fomo"
    | "authority"
    | "social-proof"
    | "urgency"
    | "controversy";
  userTier?: PricingTier; // NEW: User's pricing tier
}

export interface StreamingOptions {
  streamingId: string;
  onContentChunk?: (
    section: string,
    content: string,
    isComplete: boolean,
    progress: number
  ) => void;
}

export interface GeneratedContent {
  title: string;
  hook: string;
  script: string;
  viral_elements?: string[];
  engagement_hooks?: string[];
  // NEW: Tier-specific fields based on pricing structure
  psychological_triggers?: string[];
  engagement_prediction?: string;
  business_metrics?: string;
  scaling_notes?: string[];
  client_presentation?: string;
  platform_hashtags?: string[];
  call_to_action?: string;
  creator_tips?: string[];
  performance_data: {
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    engagement_rate: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY not found. AI generation will use fallback templates."
      );
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName = this.configService.get<string>(
      "GEMINI_MODEL",
      "gemini-1.5-flash"
    );
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.logger.log(
      `Gemini AI service initialized successfully with model: ${modelName}`
    );
  }

  async generateContent(
    request: GenerationRequest,
    streamingOptions?: StreamingOptions
  ): Promise<GeneratedContent> {
    if (!this.model) {
      this.logger.warn("Gemini API not available, using fallback generation");
      return this.generateFallbackContent(request, streamingOptions);
    }

    try {
      const prompt = this.buildPrompt(request);

      if (streamingOptions?.onContentChunk) {
        // Use streaming generation for real-time content
        return await this.generateStreamingContent(
          request,
          prompt,
          streamingOptions
        );
      } else {
        // Use regular non-streaming generation
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return this.parseAiResponse(text, request);
      }
    } catch (error) {
      this.logger.error(
        "AI generation failed, using fallback",
        error instanceof Error ? error.message : "Unknown error"
      );
      return this.generateFallbackContent(request, streamingOptions);
    }
  }

  private async generateStreamingContent(
    request: GenerationRequest,
    prompt: string,
    streamingOptions: StreamingOptions
  ): Promise<GeneratedContent> {
    try {
      // Use streaming for real-time content generation
      const result = await this.model.generateContentStream(prompt);

      let accumulatedText = "";
      let currentSection = "title";
      let progress = 40; // Start after validation stage (30%)

      // Process streaming chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;

        // Simulate section-by-section streaming
        if (
          accumulatedText.includes('"title":') &&
          currentSection === "title"
        ) {
          const titleMatch = accumulatedText.match(/"title"\s*:\s*"([^"]+)"/);
          if (titleMatch) {
            streamingOptions.onContentChunk?.(
              "title",
              titleMatch[1],
              true,
              progress
            );
            currentSection = "hook";
            progress = 55;
          }
        }

        if (accumulatedText.includes('"hook":') && currentSection === "hook") {
          const hookMatch = accumulatedText.match(/"hook"\s*:\s*"([^"]+)"/);
          if (hookMatch) {
            streamingOptions.onContentChunk?.(
              "hook",
              hookMatch[1],
              true,
              progress
            );
            currentSection = "script";
            progress = 70;
          }
        }

        if (
          accumulatedText.includes('"script":') &&
          currentSection === "script"
        ) {
          const scriptMatch = accumulatedText.match(/"script"\s*:\s*"([^"]+)"/);
          if (scriptMatch) {
            // Stream script content word by word for typewriter effect
            const scriptWords = scriptMatch[1].split(" ");
            let streamedScript = "";

            for (let i = 0; i < scriptWords.length; i++) {
              streamedScript += (i > 0 ? " " : "") + scriptWords[i];
              const isComplete = i === scriptWords.length - 1;
              const scriptProgress = progress + (i / scriptWords.length) * 15;

              streamingOptions.onContentChunk?.(
                "script",
                streamedScript,
                isComplete,
                Math.floor(scriptProgress)
              );

              // Small delay for typewriter effect
              if (!isComplete) {
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            }

            break; // Exit the stream processing
          }
        }
      }

      // Parse the final response
      return this.parseAiResponse(accumulatedText, request);
    } catch (error) {
      this.logger.error(
        "Streaming generation failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      // Fall back to simulated streaming with fallback content
      return this.simulateStreamingFallback(request, streamingOptions);
    }
  }

  private async simulateStreamingFallback(
    request: GenerationRequest,
    streamingOptions: StreamingOptions
  ): Promise<GeneratedContent> {
    const fallbackContent = this.generateFallbackContent(request);

    // Simulate streaming of fallback content
    streamingOptions.onContentChunk?.("title", fallbackContent.title, true, 50);
    await new Promise((resolve) => setTimeout(resolve, 300));

    streamingOptions.onContentChunk?.("hook", fallbackContent.hook, true, 65);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Stream script with typewriter effect
    const scriptWords = fallbackContent.script.split(" ");
    let streamedScript = "";

    for (let i = 0; i < scriptWords.length; i++) {
      streamedScript += (i > 0 ? " " : "") + scriptWords[i];
      const isComplete = i === scriptWords.length - 1;
      const scriptProgress = 65 + (i / scriptWords.length) * 15;

      streamingOptions.onContentChunk?.(
        "script",
        streamedScript,
        isComplete,
        Math.floor(scriptProgress)
      );

      if (!isComplete) {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    return fallbackContent;
  }

  /**
   * UPDATED: Build prompt using new aligned pricing structure
   */
  private buildPrompt(request: GenerationRequest): string {
    const userTier = request.userTier || PricingTier.FREE;

    // Use the new aligned prompt system
    return AlignedViralContentPrompts.generateContentPrompt(
      request.productName,
      request.niche,
      request.targetAudience,
      request.platform,
      userTier
    );
  }

  /**
   * AI-powered selection of optimal content angle based on product/niche
   */
  private selectOptimalAngle(
    request: GenerationRequest
  ):
    | "transformation"
    | "problem-agitation"
    | "social-proof"
    | "controversy"
    | "behind-scenes"
    | "trend-hijack" {
    // Business logic to select best angle based on niche and platform
    const niches = {
      fitness: "transformation",
      productivity: "problem-agitation",
      saas: "behind-scenes",
      marketing: "controversy",
      lifestyle: "social-proof",
      education: "authority",
    };

    const niche = request.niche.toLowerCase();
    for (const [key, angle] of Object.entries(niches)) {
      if (niche.includes(key)) {
        return angle as any;
      }
    }

    // Default high-performing angle
    return "transformation";
  }

  /**
   * AI-powered selection of optimal emotional trigger
   */
  private selectOptimalTrigger(
    request: GenerationRequest
  ):
    | "curiosity"
    | "fomo"
    | "authority"
    | "social-proof"
    | "urgency"
    | "controversy" {
    const platformTriggers = {
      tiktok: "curiosity",
      instagram: "fomo",
      youtube: "authority",
    };

    return platformTriggers[request.platform] as any;
  }

  /**
   * UPDATED: Enhanced JSON parsing to handle tier-specific fields
   */
  private parseAiResponse(
    text: string,
    request: GenerationRequest
  ): GeneratedContent {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.replace(/```json\s*|\s*```/g, "");

      // Handle nested JSON in script (common AI response issue)
      if (cleanedText.includes('{"title"')) {
        // Extract the outer JSON structure
        const outerMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (outerMatch) {
          let jsonStr = outerMatch[0];

          // Fix nested JSON by extracting inner content
          const scriptMatch = jsonStr.match(/"script":\s*"({[^}]+})"/);
          if (scriptMatch) {
            const innerJson = scriptMatch[1].replace(/\\"/g, '"');
            try {
              const parsedInner = JSON.parse(innerJson);
              jsonStr = jsonStr.replace(
                scriptMatch[0],
                `"script": "${parsedInner.script || parsedInner.content || ""}"`
              );
            } catch (e) {
              // If inner JSON parsing fails, extract text content
              const textContent = scriptMatch[1]
                .replace(/[{}]/g, "")
                .replace(/"/g, "");
              jsonStr = jsonStr.replace(
                scriptMatch[0],
                `"script": "${textContent}"`
              );
            }
          }

          const parsed = JSON.parse(jsonStr);

          return this.buildGeneratedContent(parsed, request);
        }
      }

      // Try regular JSON extraction
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.buildGeneratedContent(parsed, request);
      }
    } catch (parseError) {
      this.logger.warn(
        "Failed to parse AI response as JSON",
        parseError instanceof Error ? parseError.message : "Unknown parse error"
      );
    }

    // If JSON parsing fails, use viral fallbacks
    return this.generateFallbackContent(request);
  }

  /**
   * NEW: Build GeneratedContent with tier-specific fields
   */
  private buildGeneratedContent(
    parsed: any,
    request: GenerationRequest
  ): GeneratedContent {
    const userTier = request.userTier || PricingTier.FREE;

    const baseContent: GeneratedContent = {
      title:
        this.ensureString(parsed.title) || this.generateViralTitle(request),
      hook: this.ensureString(parsed.hook) || this.generateViralHook(request),
      script:
        this.ensureString(parsed.script) || this.generateViralScript(request),
      viral_elements: parsed.viral_elements || [
        "curiosity-gap",
        "social-proof",
      ],
      engagement_hooks: parsed.engagement_hooks || [
        "What would you do?",
        "Tag someone who needs this",
      ],
      performance_data: this.generatePerformanceData(),
    };

    // Add tier-specific fields
    if (userTier === PricingTier.CREATOR) {
      baseContent.psychological_triggers = parsed.psychological_triggers || [
        "curiosity",
        "authority",
        "social-proof",
      ];
      baseContent.engagement_prediction =
        parsed.engagement_prediction ||
        "High engagement potential based on curiosity triggers";
      baseContent.creator_tips = parsed.creator_tips || [
        "Post during peak hours",
        "Use trending hashtags",
      ];
      baseContent.platform_hashtags =
        parsed.platform_hashtags || this.generateHashtags(request);
      baseContent.call_to_action =
        parsed.call_to_action || "Follow for more tips like this!";
    } else if (userTier === PricingTier.BUSINESS) {
      baseContent.psychological_triggers = parsed.psychological_triggers || [
        "curiosity",
        "authority",
        "social-proof",
        "fomo",
        "controversy",
      ];
      baseContent.engagement_prediction =
        parsed.engagement_prediction ||
        "Estimated 8-12% engagement rate with high viral potential";
      baseContent.business_metrics =
        parsed.business_metrics ||
        "Projected 15-25% conversion rate for agency clients";
      baseContent.scaling_notes = parsed.scaling_notes || [
        "Batch create 10 variations",
        "A/B test hooks",
        "White-label ready",
      ];
      baseContent.client_presentation =
        parsed.client_presentation ||
        "Professional-grade content ready for client delivery";
      baseContent.platform_hashtags =
        parsed.platform_hashtags || this.generateHashtags(request);
      baseContent.call_to_action =
        parsed.call_to_action || "DM for business inquiries";
    }

    return baseContent;
  }

  /**
   * NEW: Generate platform-specific hashtags
   */
  private generateHashtags(request: GenerationRequest): string[] {
    const platformHashtags = {
      tiktok: ["#fyp", "#viral", "#trending"],
      instagram: ["#explore", "#reels", "#viral"],
      youtube: ["#shorts", "#viral", "#trending"],
    };

    const baseHashtags =
      platformHashtags[request.platform] || platformHashtags.tiktok;
    const nicheTag = `#${request.niche.toLowerCase().replace(/\s+/g, "")}`;

    return [...baseHashtags, nicheTag, "#ugc", "#contentcreator"];
  }

  private ensureString(value: any): string | null {
    if (typeof value === "string") {
      return value;
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    return null;
  }

  /**
   * UPDATED: Enhanced fallback content generation with tier awareness
   */
  private generateFallbackContent(
    request: GenerationRequest,
    streamingOptions?: StreamingOptions
  ): GeneratedContent {
    const userTier = request.userTier || PricingTier.FREE;

    const baseContent: GeneratedContent = {
      title: this.generateViralTitle(request),
      hook: this.generateViralHook(request),
      script: this.generateViralScript(request),
      viral_elements: ["transformation", "social-proof", "specificity"],
      engagement_hooks: [
        "What would you do in my situation?",
        "Anyone else struggling with this?",
      ],
      performance_data: this.generatePerformanceData(),
    };

    // Add tier-specific fallback fields
    if (userTier === PricingTier.CREATOR) {
      baseContent.psychological_triggers = [
        "curiosity",
        "transformation",
        "social-proof",
      ];
      baseContent.engagement_prediction =
        "Strong engagement potential for personal brand building";
      baseContent.creator_tips = [
        "Consistency is key",
        "Engage with comments",
        "Use trending audio",
      ];
      baseContent.platform_hashtags = this.generateHashtags(request);
      baseContent.call_to_action = "Follow for daily content tips!";
    } else if (userTier === PricingTier.BUSINESS) {
      baseContent.psychological_triggers = [
        "curiosity",
        "authority",
        "controversy",
        "fomo",
      ];
      baseContent.engagement_prediction =
        "Premium content with 10-15% engagement rate projection";
      baseContent.business_metrics =
        "High conversion potential for business applications";
      baseContent.scaling_notes = [
        "Create content series",
        "Repurpose across platforms",
        "Track performance metrics",
      ];
      baseContent.client_presentation =
        "Ready for professional client delivery and white-labeling";
      baseContent.platform_hashtags = this.generateHashtags(request);
      baseContent.call_to_action =
        "Contact us for content strategy consultation";
    }

    return baseContent;
  }

  /**
   * Generate viral title with psychological triggers
   */
  private generateViralTitle(request: GenerationRequest): string {
    const viralPatterns = [
      `Stop doing ${request.niche} wrong - ${request.productName} exposed the truth`,
      `What nobody tells you about ${request.niche} (${request.productName} changed everything)`,
      `I tried ${request.productName} for 30 days - results shocked everyone`,
      `${request.niche} experts don't want you to know about ${request.productName}`,
      `Everyone gets ${request.niche} wrong - ${request.productName} proved it`,
      `Before you waste more time on ${request.niche}, try ${request.productName}`,
      `The ${request.niche} secret that tripled my results in 21 days`,
      `Why 99% of ${request.targetAudience} fail at ${request.niche} (${request.productName} fixes this)`,
    ];

    return viralPatterns[Math.floor(Math.random() * viralPatterns.length)];
  }

  /**
   * Generate viral hook with pattern interrupt and specificity
   */
  private generateViralHook(request: GenerationRequest): string {
    const viralHooks = [
      `Everyone gets ${request.niche} wrong. I did too - wasted 6 months until ${request.productName} changed everything.`,
      `Stop. Before you waste another day on ${request.niche}, you need to see what ${request.productName} just exposed.`,
      `Unpopular opinion: 97% of ${request.targetAudience} do ${request.niche} backwards. ${request.productName} proved it in 21 days.`,
      `I was skeptical about ${request.productName}. Then I tested it for 72 hours and my mind was blown.`,
      `Nobody talks about this ${request.niche} secret. ${request.productName} exposed it and everything changed.`,
      `What they don't tell you about ${request.niche}: it's not about working harder. ${request.productName} showed me the real way.`,
      `After 347 failed attempts at ${request.niche}, ${request.productName} finally cracked the code.`,
      `Industry insiders don't want you to know this ${request.niche} truth. ${request.productName} exposed everything.`,
    ];

    return viralHooks[Math.floor(Math.random() * viralHooks.length)];
  }

  /**
   * Generate viral script with psychological progression
   */
  private generateViralScript(request: GenerationRequest): string {
    return `Everyone gets ${request.niche} wrong. I did too until I found ${request.productName}.

Here's the thing nobody tells you:

Most ${request.targetAudience} waste months trying the "popular" methods. I was one of them.

Day 1 with ${request.productName}: Nothing special
Day 7: Small changes, but I noticed
Day 21: Friends asking what I'm doing differently  
Day 30: Complete transformation

The difference? ${request.productName} doesn't follow the mainstream ${request.niche} advice.

It does the opposite.

While everyone else is doing X, ${request.productName} focuses on Y.

Results speak louder than theories.

If you're tired of the same old ${request.niche} advice that doesn't work, this is different.

Question: What's the biggest ${request.niche} myth you believed? Comments below 👇`;
  }

  private generatePerformanceData() {
    // Generate realistic performance metrics with some randomization
    const baseViews = Math.floor(Math.random() * 80000) + 20000; // 20K-100K views
    const baseCTR = parseFloat((Math.random() * 4 + 3).toFixed(1)); // 3-7% CTR
    const conversionRate = parseFloat((Math.random() * 0.05 + 0.02).toFixed(3)); // 2-7% conversion

    return {
      views: baseViews,
      clicks: Math.floor(baseViews * (baseCTR / 100)),
      conversions: Math.floor(baseViews * conversionRate),
      ctr: baseCTR,
      engagement_rate: parseFloat((Math.random() * 8 + 5).toFixed(1)), // 5-13% engagement
    };
  }

  /**
   * NEW: Convenience methods for different pricing tiers
   */
  async generateFreeContent(
    request: Omit<GenerationRequest, "userTier">
  ): Promise<GeneratedContent> {
    return this.generateContent({ ...request, userTier: PricingTier.FREE });
  }

  async generateCreatorContent(
    request: Omit<GenerationRequest, "userTier">
  ): Promise<GeneratedContent> {
    return this.generateContent({ ...request, userTier: PricingTier.CREATOR });
  }

  async generateBusinessContent(
    request: Omit<GenerationRequest, "userTier">
  ): Promise<GeneratedContent> {
    return this.generateContent({ ...request, userTier: PricingTier.BUSINESS });
  }
}
