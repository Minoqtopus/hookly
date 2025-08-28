import { Controller, Post, UseGuards, Request, Get, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerationService } from './generation.service';
import { DemoGenerationDto } from './dto/demo-generation.dto';
import { CreateGenerationDto } from './dto/create-generation.dto';

@ApiTags('Generation')
@Controller('generation')
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Post('demo')
  @RateLimit(RateLimits.GENERATION_GUEST)
  @ApiOperation({
    summary: 'Create demo generations (public endpoint)',
    description: `Generate high-quality demo content customized for your product to showcase the platform's capabilities.
    
    **Public Endpoint** - No authentication required. Perfect for users to test the platform before signing up.
    
    **Features:**
    - Creates 3 viral-quality demo generations across different platforms (Facebook, Instagram, TikTok)
    - Content is customized using your product name, niche, and target audience
    - Shows realistic performance metrics to demonstrate potential
    - Returns fresh demo content on each request
    - Perfect for product demonstrations and lead generation
    
    **Use Cases:**
    - Landing page demonstrations
    - Trial user engagement  
    - Lead generation and conversion
    - Showcasing viral potential to prospects`
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
  async createDemoGenerations(@Body() demoData: DemoGenerationDto) {
    try {
      const demoGenerations = await this.generationService.createDemoGenerations(demoData);
      
      return {
        success: true,
        message: 'Demo generations created successfully',
        data: demoGenerations
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create demo generations',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
    - Platform-specific optimization (TikTok, Instagram, YouTube)
    - Usage limit enforcement based on user plan
    - Real-time performance metrics simulation
    
    **Plan Limits:**
    - Trial: 15 total generations, TikTok only
    - Starter: 50/month, TikTok + Instagram  
    - Pro: 200/month, TikTok + Instagram + YouTube
    
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
            platform: { type: 'string', enum: ['tiktok', 'instagram', 'youtube'] },
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
      const generation = await this.generationService.createUserGeneration(
        req.user.sub,
        createData
      );
      
      return {
        success: true,
        message: 'Generation created successfully',
        data: generation
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create generation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
      return {
        success: false,
        message: 'Failed to retrieve generations',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
      return {
        success: false,
        message: 'Failed to retrieve recent generations',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}