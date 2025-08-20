import { Controller, Post, Get, Body, UseGuards, Request, Query, Ip, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { GenerationQueueService } from './generation-queue.service';
import { GenerateDto } from './dto/generate.dto';
import { GenerateVariationsDto } from './dto/generate-variations.dto';
import { GuestGenerateDto } from './dto/guest-generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';

@ApiTags('Generation')
@Controller('generate')
export class GenerationController {
  constructor(private generationService: GenerationQueueService) {}

  @Post()
  @ApiOperation({ summary: 'Generate AI-powered ad content', description: 'Generate personalized ad content using AI based on user input' })
  @ApiResponse({ status: 201, description: 'Ad content generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @RateLimit(RateLimits.GENERATION)
  async generate(@Request() req: any, @Body() generateDto: GenerateDto) {
    return this.generationService.generateContent(req.user.userId, generateDto);
  }

  @Post('variations')
  @ApiOperation({ summary: 'Generate content variations', description: 'Generate multiple variations of existing ad content' })
  @ApiResponse({ status: 201, description: 'Content variations generated successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @RateLimit(RateLimits.GENERATION)
  async generateVariations(@Request() req: any, @Body() generateVariationsDto: GenerateVariationsDto) {
    return this.generationService.generateVariations(req.user.userId, generateVariationsDto);
  }

  @Post('guest')
  @ApiOperation({ summary: 'Generate content as guest', description: 'Generate ad content without authentication (limited features)' })
  @ApiResponse({ status: 201, description: 'Guest content generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded for guests' })
  @RateLimit(RateLimits.GENERATION_GUEST)
  async generateGuest(@Body() guestGenerateDto: GuestGenerateDto, @Ip() ip: string) {
    return this.generationService.generateGuestContent(guestGenerateDto, ip);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get generation history', description: 'Retrieve paginated history of user generated content' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Generation history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.generationService.getUserGenerations(req.user.userId, pageNum, limitNum);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status', description: 'Add or remove generation from user favorites' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Param('id') generationId: string, @Request() req: any) {
    return this.generationService.toggleFavorite(req.user.userId, generationId);
  }
}