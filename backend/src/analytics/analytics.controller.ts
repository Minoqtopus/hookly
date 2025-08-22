import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { EventType } from '../entities/analytics-event.entity';
import { AnalyticsService } from './analytics.service';

export class TrackEventDto {
  eventType: EventType;
  eventData?: any;
  sessionId?: string;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @RateLimit(RateLimits.ANALYTICS)
  async trackEvent(@Body() trackEventDto: TrackEventDto, @Request() req: any) {
    return this.analyticsService.trackEvent(
      trackEventDto.eventType,
      req.user.userId,
      trackEventDto.eventData,
      req
    );
  }

  @Post('track-anonymous')
  @RateLimit(RateLimits.ANALYTICS)
  async trackAnonymousEvent(@Body() trackEventDto: TrackEventDto, @Request() req: any) {
    return this.analyticsService.trackEvent(
      trackEventDto.eventType,
      undefined,
      trackEventDto.eventData,
      req
    );
  }

  @Get('conversion-metrics')
  @RequireAdmin()
  @RateLimit(RateLimits.ADMIN)
  async getConversionMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getConversionMetrics(start, end);
  }

  @Get('user-journey')
  @RequireAdmin()
  @RateLimit(RateLimits.ADMIN)
  async getUserJourneyAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getUserJourneyAnalytics(start, end);
  }

  @Get('funnel')
  @RequireAdmin()
  @RateLimit(RateLimits.ADMIN)
  async getFunnelAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.analyticsService.getBasicFunnel(start, end);
  }

  @Get('dashboard')
  @RequireAdmin()
  @RateLimit(RateLimits.ADMIN)
  async getAnalyticsDashboard(
    @Query('period') period: '24h' | '7d' | '30d' | '90d' = '30d'
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [conversionMetrics, userJourney, funnel] = await Promise.all([
      this.analyticsService.getConversionMetrics(startDate, now),
      this.analyticsService.getUserJourneyAnalytics(startDate, now),
      this.analyticsService.getBasicFunnel(startDate, now),
    ]);

    return {
      period,
      conversion: conversionMetrics,
      userJourney,
      funnel,
      generatedAt: new Date().toISOString(),
    };
  }
}