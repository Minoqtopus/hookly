import { Controller, Get, Post, Param, Query, Request, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplateCategory, TemplatePricingType } from '../entities/template.entity';
import { TemplatesService } from './templates.service';
import { TemplateRevenueService } from './template-revenue.service';
import { TemplatePricingService } from './template-pricing.service';
import { TemplateAnalyticsService } from './template-analytics.service';
import { TemplateApprovalService } from './template-approval.service';

@ApiTags('Templates & Marketplace')
@Controller('templates')
export class TemplatesController {
  constructor(
    private templatesService: TemplatesService,
    private revenueService: TemplateRevenueService,
    private pricingService: TemplatePricingService,
    private analyticsService: TemplateAnalyticsService,
    private approvalService: TemplateApprovalService,
  ) {}

  @Get()
  async getTemplates(
    @Query('category') category?: TemplateCategory,
    @Query('popular') popular?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters = {
      category,
      popular: popular === 'true',
      featured: featured === 'true',
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    return this.templatesService.getTemplates(filters);
  }

  @Get('popular')
  async getPopularTemplates(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.templatesService.getPopularTemplates(limitNum);
  }

  @Get('categories')
  async getCategories() {
    return this.templatesService.getCategories();
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Get(':id/use')
  @UseGuards(JwtAuthGuard)
  async trackTemplateUsage(@Param('id') id: string, @Request() req: any) {
    return this.templatesService.trackTemplateUsage(id, req.user.userId);
  }

  // ========== MARKETPLACE ENDPOINTS ==========

  @Post(':id/purchase')
  @ApiOperation({ summary: 'Purchase premium template', description: 'Purchase a premium template with revenue sharing to creator' })
  @ApiResponse({ status: 200, description: 'Template purchased successfully' })
  @ApiResponse({ status: 400, description: 'Purchase failed - already owned or invalid template' })
  @ApiResponse({ status: 403, description: 'Authentication required' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async purchaseTemplate(
    @Param('id') templateId: string,
    @Request() req: any,
    @Body() purchaseData: { paymentMethod?: string; metadata?: any }
  ) {
    const result = await this.revenueService.purchaseTemplate(
      templateId, 
      req.user.userId, 
      purchaseData
    );
    
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    
    return {
      message: 'Template purchased successfully',
      purchase: result.purchase,
    };
  }

  @Get('marketplace/overview')
  @ApiOperation({ summary: 'Get marketplace overview', description: 'Marketplace performance metrics and top templates' })
  @ApiResponse({ status: 200, description: 'Marketplace overview retrieved' })
  @RequireAdmin()
  async getMarketplaceOverview() {
    return this.revenueService.getMarketplaceOverview();
  }

  @Get('creator/:creatorId/earnings')
  @ApiOperation({ summary: 'Get creator earnings', description: 'Creator revenue analytics and earnings breakdown' })
  @ApiResponse({ status: 200, description: 'Creator earnings retrieved' })
  @ApiParam({ name: 'creatorId', description: 'Creator user ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getCreatorEarnings(
    @Param('creatorId') creatorId: string,
    @Request() req: any
  ) {
    // Verify user can access this data (self or admin)
    if (req.user.userId !== creatorId && !req.user.isAdmin) {
      throw new BadRequestException('Access denied');
    }
    
    return this.revenueService.getCreatorEarnings(creatorId);
  }

  // ========== PRICING ENDPOINTS ==========

  @Get(':id/pricing/recommendation')
  @ApiOperation({ summary: 'Get pricing recommendation', description: 'AI-powered pricing suggestion for template' })
  @ApiResponse({ status: 200, description: 'Pricing recommendation generated' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getPricingRecommendation(@Param('id') templateId: string) {
    return this.pricingService.getPricingRecommendation(templateId);
  }

  @Post(':id/pricing')
  @ApiOperation({ summary: 'Set premium pricing', description: 'Set premium pricing for template ($10-25 range)' })
  @ApiResponse({ status: 200, description: 'Pricing updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid price range or template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ schema: { properties: { price: { type: 'number', minimum: 10, maximum: 25 } } } })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async setPremiumPricing(
    @Param('id') templateId: string,
    @Body() pricingData: { price: number },
    @Request() req: any
  ) {
    await this.pricingService.setPremiumPricing(
      templateId, 
      pricingData.price,
      req.user.userId
    );
    
    return {
      message: 'Premium pricing set successfully',
      templateId,
      price: pricingData.price,
    };
  }

  @Post(':id/pricing/dynamic')
  @ApiOperation({ summary: 'Apply dynamic pricing', description: 'AI-powered dynamic pricing adjustment based on performance' })
  @ApiResponse({ status: 200, description: 'Dynamic pricing applied' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async applyDynamicPricing(@Param('id') templateId: string) {
    return this.pricingService.applyDynamicPricing(templateId);
  }

  // ========== ANALYTICS ENDPOINTS ==========

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get template analytics', description: 'Comprehensive usage metrics and performance data' })
  @ApiResponse({ status: 200, description: 'Template analytics retrieved' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getTemplateAnalytics(@Param('id') templateId: string) {
    return this.analyticsService.getTemplateUsageMetrics(templateId);
  }

  @Get('analytics/performance-insights')
  @ApiOperation({ summary: 'Get performance insights', description: 'Top performing, trending, and underperforming templates' })
  @ApiResponse({ status: 200, description: 'Performance insights retrieved' })
  @RequireAdmin()
  async getPerformanceInsights() {
    return this.analyticsService.getTemplatePerformanceInsights();
  }

  @Get(':id/purchase-analytics')
  @ApiOperation({ summary: 'Get purchase analytics', description: 'Revenue and purchase metrics for template' })
  @ApiResponse({ status: 200, description: 'Purchase analytics retrieved' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getPurchaseAnalytics(@Param('id') templateId: string) {
    return this.revenueService.getTemplatePurchaseAnalytics(templateId);
  }

  // ========== APPROVAL & QUALITY CONTROL ENDPOINTS ==========

  @Post(':id/submit-approval')
  @ApiOperation({ summary: 'Submit for approval', description: 'Submit template to approval queue for marketplace listing' })
  @ApiResponse({ status: 200, description: 'Template submitted for approval' })
  @ApiResponse({ status: 400, description: 'Template not ready for submission' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async submitForApproval(
    @Param('id') templateId: string,
    @Request() req: any
  ) {
    await this.approvalService.submitForApproval(templateId, req.user.userId);
    
    return {
      message: 'Template submitted for approval',
      templateId,
      status: 'pending_approval',
    };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve template', description: 'Admin approval of template for marketplace' })
  @ApiResponse({ status: 200, description: 'Template approved successfully' })
  @ApiResponse({ status: 400, description: 'Template cannot be approved' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ schema: { properties: { reviewNotes: { type: 'string' } } } })
  @RequireAdmin()
  async approveTemplate(
    @Param('id') templateId: string,
    @Body() approvalData: { reviewNotes?: string },
    @Request() req: any
  ) {
    const decision = await this.approvalService.approveTemplate(
      templateId,
      req.user.userId,
      approvalData.reviewNotes
    );
    
    return {
      message: decision.approved ? 'Template approved' : 'Template approval failed',
      decision,
    };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject template', description: 'Admin rejection of template with reason' })
  @ApiResponse({ status: 200, description: 'Template rejected' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } }, required: ['reason'] } })
  @RequireAdmin()
  async rejectTemplate(
    @Param('id') templateId: string,
    @Body() rejectionData: { reason: string },
    @Request() req: any
  ) {
    await this.approvalService.rejectTemplate(
      templateId,
      req.user.userId,
      rejectionData.reason
    );
    
    return {
      message: 'Template rejected',
      templateId,
      reason: rejectionData.reason,
    };
  }

  @Get('admin/approval-queue')
  @ApiOperation({ summary: 'Get approval queue', description: 'List of templates pending approval' })
  @ApiResponse({ status: 200, description: 'Approval queue retrieved' })
  @RequireAdmin()
  async getApprovalQueue() {
    return this.approvalService.getApprovalQueue();
  }

  @Get(':id/quality-assessment')
  @ApiOperation({ summary: 'Get quality assessment', description: 'Detailed quality analysis and recommendations' })
  @ApiResponse({ status: 200, description: 'Quality assessment retrieved' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getQualityAssessment(
    @Param('id') templateId: string,
    @Request() req: any
  ) {
    return this.approvalService.getQualityAssessment(templateId, req.user.userId);
  }

  // ========== CREATOR DASHBOARD ENDPOINTS ==========

  @Get('creator/dashboard/:creatorId')
  @ApiOperation({ summary: 'Creator dashboard', description: 'Comprehensive creator analytics and revenue dashboard' })
  @ApiResponse({ status: 200, description: 'Creator dashboard data retrieved' })
  @ApiParam({ name: 'creatorId', description: 'Creator user ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getCreatorDashboard(
    @Param('creatorId') creatorId: string,
    @Request() req: any
  ) {
    // Verify access permissions
    if (req.user.userId !== creatorId && !req.user.isAdmin) {
      throw new BadRequestException('Access denied');
    }

    // Get comprehensive creator data
    const [earnings, pricingRecommendations, performanceInsights] = await Promise.all([
      this.revenueService.getCreatorEarnings(creatorId),
      this.pricingService.getBulkPricingRecommendations(creatorId),
      this.analyticsService.getTemplatePerformanceInsights(),
    ]);

    return {
      creatorId,
      earnings,
      pricingRecommendations,
      performanceInsights,
      summary: {
        totalTemplates: pricingRecommendations.length,
        totalEarnings: earnings.totalEarnings,
        avgMonthlyEarnings: Object.values(earnings.monthlyEarnings).reduce((a, b) => a + b, 0) / 12,
        topTemplate: earnings.topTemplates[0] || null,
      },
    };
  }

  // ========== ADMIN ENDPOINTS ==========

  @Get('admin/seed')
  @ApiOperation({ summary: 'Seed templates', description: 'Admin endpoint to seed initial templates' })
  @ApiResponse({ status: 200, description: 'Templates seeded successfully' })
  @RequireAdmin()
  async seedTemplates(@Request() req: any) {
    console.log(`Admin template seeding initiated by: ${req.adminUser.email}`);
    return this.templatesService.seedTemplates();
  }
}