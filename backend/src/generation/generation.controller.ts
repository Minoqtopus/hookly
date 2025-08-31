import { Controller, Post, UseGuards, Request, Get, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerationService } from './generation.service';
import { DemoGenerationDto } from './dto/demo-generation.dto';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { ErrorSanitizerUtil } from '../common/utils/error-sanitizer.util';
import { ProductAnalyzerService } from '../scraping/product-analyzer.service';

@ApiTags('Generation')
@Controller('generation')
export class GenerationController {
  constructor(
    private generationService: GenerationService,
    private productAnalyzerService: ProductAnalyzerService
  ) {}

  @Post('demo')
  @RateLimit(RateLimits.GENERATION_GUEST)
  @ApiOperation({
    summary: 'Create demo UGC script (public endpoint)',
    description: `Generate viral UGC scripts for TikTok or Instagram customized for creators and their products.
    
    **Public Endpoint** - No authentication required. Perfect for creators to test the platform before signing up.
    
    **Creator-Focused Features:**
    - Creates viral-quality UGC scripts for TikTok or Instagram
    - Content optimized for individual creators building their brand
    - Perfect for product promotion, personal branding, and audience building
    - Shows realistic performance metrics to demonstrate viral potential
    - Real-time typewriter effect for premium experience
    
    **Use Cases:**
    - Content creators testing viral potential
    - Personal brand building demos
    - Product promotion script generation
    - Landing page demonstrations for creator signups`
  })
  @ApiResponse({
    status: 201,
    description: 'Demo generations created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Demo generations created successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string', example: 'Productivity Hack That Changed My Life' },
              platform: { type: 'string', enum: ['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin'] },
              niche: { type: 'string', example: 'Productivity' },
              target_audience: { type: 'string', example: 'Working professionals aged 25-40' },
              hook: { type: 'string', example: 'I used to work 12-hour days and still felt behind. Then I discovered the 2-minute rule...' },
              script: { type: 'string' },
              performance_data: {
                type: 'object',
                properties: {
                  views: { type: 'number', example: 45000 },
                  clicks: { type: 'number', example: 2800 },
                  conversions: { type: 'number', example: 156 },
                  ctr: { type: 'number', example: 6.2 },
                  engagement_rate: { type: 'number', example: 8.4 }
                }
              },
              is_demo: { type: 'boolean', example: true },
              created_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded'
  })
  @ApiResponse({
    status: 403,
    description: 'Demo limit reached'
  })
  async createDemoGenerations(@Body() demoData: DemoGenerationDto, @Request() req: any) {
    try {
      // Get IP address from request
      const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers?.['user-agent'];
      
      // Check demo eligibility
      const eligibility = await this.generationService.checkDemoEligibility(ipAddress);
      
      if (!eligibility.eligible) {
        return {
          success: false,
          error: 'DEMO_LIMIT_REACHED',
          message: eligibility.message,
          statusCode: 403
        };
      }
      
      // Generate demo content
      const demoGenerations = await this.generationService.createDemoGenerations(demoData);
      
      // Track demo completion
      await this.generationService.trackDemoCompletion(ipAddress, userAgent, {
        productName: demoData.productName,
        niche: demoData.niche,
        targetAudience: demoData.targetAudience,
        platform: demoData.platform
      });
      
      return {
        success: true,
        message: 'Demo generations created successfully',
        data: demoGenerations
      };
    } catch (error) {
      return ErrorSanitizerUtil.createErrorResponse(error, 'Demo generation creation');
    }
  }

  @Post('analyze-product')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimits.API_GENERAL)
  @ApiOperation({
    summary: 'Analyze product from URL',
    description: `**NEW FEATURE**: Analyze any product URL to automatically extract product information for content generation.
    
    **How it works:**
    1. Paste your product URL (website, landing page, etc.)
    2. AI analyzes the page and extracts key product details
    3. Get optimized content suggestions based on your product
    4. Use the analysis results to generate targeted viral content
    
    **Perfect for:**
    - SaaS founders wanting to promote their products
    - E-commerce businesses creating product content
    - Service providers showcasing their offerings
    - Anyone with a product website or landing page
    
    **Fallback:** If URL analysis fails, you can still input details manually.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Product analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Product analyzed successfully' },
        data: {
          type: 'object',
          properties: {
            product_name: { type: 'string', example: 'Hookly Content Generator' },
            description: { type: 'string', example: 'AI-powered viral content generation platform' },
            features: { type: 'array', items: { type: 'string' }, example: ['AI content generation', 'Platform optimization', 'Viral prediction'] },
            target_audience: { type: 'string', example: 'SaaS founders and content creators' },
            niche: { type: 'string', example: 'SaaS/Software' },
            price_positioning: { type: 'string', enum: ['budget', 'mid-tier', 'premium'], example: 'mid-tier' },
            confidence_score: { type: 'number', example: 85 },
            analysis_method: { type: 'string', enum: ['scraped', 'fallback'], example: 'scraped' }
          }
        },
        suggestions: {
          type: 'object',
          properties: {
            content_angles: { type: 'array', items: { type: 'string' }, example: ['transformation', 'problem-solution', 'social-proof'] },
            platforms: { type: 'array', items: { type: 'string' }, example: ['tiktok', 'instagram'] }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or analysis failed'
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded - too many analysis requests'
  })
  async analyzeProduct(
    @Body() body: { productUrl: string },
    @Request() req: any
  ) {
    try {
      console.log(`🔍 Product analysis requested by user ${req.user.sub}: ${body.productUrl}`);
      
      const analysis = await this.productAnalyzerService.analyzeProductUrl(body.productUrl);
      
      // Generate content suggestions based on analysis
      const suggestions = {
        content_angles: this.suggestContentAngles(analysis),
        platforms: this.suggestOptimalPlatforms(analysis)
      };

      return {
        success: true,
        message: analysis.success ? 'Product analyzed successfully' : 'Analysis completed with limitations',
        data: analysis,
        suggestions
      };
    } catch (error) {
      console.error('❌ Product analysis failed:', error);
      return ErrorSanitizerUtil.createErrorResponse(error, 'Product analysis');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimits.GENERATION)
  @ApiOperation({
    summary: 'Create new generation',
    description: `Generate personalized viral content for authenticated users.
    
    **Features:**
    - AI-powered content generation using Gemini
    - Platform-specific optimization (TikTok, Instagram)
    - Usage limit enforcement based on user plan
    - Real-time performance metrics simulation
    
    **Plan Limits:**
    - Trial: 5 total generations, TikTok + Instagram
    - Creator: 50/month, TikTok + Instagram  
    - Business: 200/month, TikTok + Instagram
    
    **Rate Limiting:**
    - USER_GENERATION limit applies (5 per hour for quality control)`
  })
  @ApiResponse({
    status: 201,
    description: 'Generation created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Generation created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'How This Product Changed My Life' },
            platform: { type: 'string', enum: ['tiktok', 'instagram'] },
            hook: { type: 'string' },
            script: { type: 'string' },
            performance_data: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        user_stats: {
          type: 'object',
          properties: {
            generations_remaining: { type: 'number' },
            monthly_limit: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Generation limit exceeded or platform not available'
  })
  async createGeneration(
    @Body() createData: CreateGenerationDto,
    @Request() req: any
  ) {
    try {
      // Log the incoming data for debugging
      console.log('📥 Generation request received:', {
        userId: req.user?.sub || req.user?.userId,
        productName: createData.productName,
        niche: createData.niche,
        targetAudience: createData.targetAudience,
        platform: createData.platform,
        streamingId: createData.streamingId
      });
      
      // Use provided streaming ID or generate a new one
      const streamingId = createData.streamingId || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      console.log(`🎯 Controller received generation request with streamingId: ${streamingId}`);
      
      const generation = await this.generationService.createUserGeneration(
        req.user.sub,
        createData,
        streamingId
      );
      
      // Get updated user stats after generation
      const updatedUser = await this.generationService.getUserById(req.user.sub);
      const remainingGenerations = this.generationService.calculateRemainingGenerations(updatedUser);

      return {
        success: true,
        message: 'Generation created successfully',
        data: {
          ...generation,
          id: streamingId, // Ensure frontend gets the streaming ID
        },
        user_stats: {
          generations_remaining: remainingGenerations,
          trial_generations_used: updatedUser.trial_generations_used,
          monthly_generation_count: updatedUser.monthly_generation_count,
        }
      };
    } catch (error) {
      const errorId = createData?.streamingId || 'unknown';
      console.error('❌ Generation creation failed:', error);
      ErrorSanitizerUtil.logError(error, `Generation creation (${errorId})`);
      return ErrorSanitizerUtil.createErrorResponse(error, 'Generation creation');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimits.API_GENERAL)
  @ApiOperation({
    summary: 'Get user generations',
    description: 'Retrieve all generations for the authenticated user'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of generations to return (default: 50)',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'Generations retrieved successfully'
  })
  async getUserGenerations(@Request() req, @Query('limit') limit?: number) {
    try {
      const userId = req.user.sub;
      const generations = await this.generationService.getUserGenerations(userId, limit);
      
      return {
        success: true,
        data: generations
      };
    } catch (error) {
      return ErrorSanitizerUtil.createErrorResponse(error, 'Get user generations');
    }
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimits.API_GENERAL)
  @ApiOperation({
    summary: 'Get recent generations',
    description: 'Get recent generations for dashboard display'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of recent generations (default: 10)',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'Recent generations retrieved successfully'
  })
  async getRecentGenerations(@Request() req, @Query('limit') limit?: number) {
    try {
      const userId = req.user.sub;
      const generations = await this.generationService.getRecentGenerations(userId, limit);
      
      return {
        success: true,
        data: generations
      };
    } catch (error) {
      return ErrorSanitizerUtil.createErrorResponse(error, 'Get recent generations');
    }
  }

  // Helper methods for product analysis suggestions
  private suggestContentAngles(analysis: any): string[] {
    const niche = analysis.niche?.toLowerCase() || '';
    const pricePos = analysis.price_positioning;
    
    // AI-powered content angle suggestions based on product analysis
    const angleMap = {
      'saas': ['transformation', 'problem-solution', 'behind-scenes'],
      'fitness': ['transformation', 'social-proof', 'controversy'],  
      'productivity': ['problem-solution', 'transformation', 'trend-hijack'],
      'marketing': ['controversy', 'behind-scenes', 'social-proof'],
      'education': ['transformation', 'social-proof', 'problem-solution'],
      'finance': ['social-proof', 'controversy', 'transformation']
    };

    // Default angles based on price positioning
    const defaultAngles = pricePos === 'premium' 
      ? ['social-proof', 'transformation', 'controversy']
      : ['problem-solution', 'transformation', 'social-proof'];
    
    // Find matching niche
    for (const [key, angles] of Object.entries(angleMap)) {
      if (niche.includes(key)) {
        return angles;
      }
    }
    
    return defaultAngles;
  }

  private suggestOptimalPlatforms(analysis: any): string[] {
    const audience = analysis.target_audience?.toLowerCase() || '';
    const niche = analysis.niche?.toLowerCase() || '';
    
    // Platform suggestions based on audience and niche - UGC CREATOR FOCUSED
    if (audience.includes('founder') || audience.includes('business') || niche.includes('saas')) {
      return ['tiktok', 'instagram']; // B2B creators focus on TikTok & Instagram
    }
    
    if (audience.includes('creative') || niche.includes('design')) {
      return ['instagram', 'tiktok']; // Visual creators focus on Instagram first
    }
    
    if (audience.includes('fitness') || audience.includes('health')) {
      return ['instagram', 'tiktok']; // Fitness creators focus on Instagram & TikTok
    }
    
    // Default for all UGC creators - TikTok & Instagram only
    return ['tiktok', 'instagram'];
  }
}