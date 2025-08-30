/**
 * Pricing Controller
 * 
 * Public API endpoint for frontend to fetch pricing configuration
 * Cached by CloudFlare + Vercel for performance
 */

import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PricingService } from './pricing.service';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * Get complete pricing configuration
   * Used by frontend pricing page
   */
  @Get('config')
  @ApiOperation({
    summary: 'Get pricing configuration',
    description: 'Returns complete pricing configuration for frontend display'
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing configuration retrieved successfully'
  })
  async getPricingConfig(@Res() res: Response) {
    const config = this.pricingService.getPricingConfiguration();
    
    // Set cache headers for CloudFlare + Vercel
    res.set({
      'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1hr browser, 24hr CDN
      'Vary': 'Accept-Encoding',
      'ETag': `"pricing-v${config.version}"`
    });
    
    return res.json(config);
  }

  /**
   * Get pricing for specific billing cycle
   */
  @Get('plans/:cycle')
  @ApiOperation({
    summary: 'Get pricing plans for billing cycle',
    description: 'Returns pricing plans for monthly or yearly billing'
  })
  async getPricingPlans(
    @Res() res: Response,
    cycle: 'monthly' | 'yearly' = 'monthly'
  ) {
    const plans = this.pricingService.getPricingForBillingCycle(cycle);
    
    res.set({
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Vary': 'Accept-Encoding'
    });
    
    return res.json({
      billingCycle: cycle,
      plans,
      currency: 'USD',
      currencySymbol: '$'
    });
  }

  /**
   * Get trial configuration
   */
  @Get('trial')
  @ApiOperation({
    summary: 'Get trial configuration',
    description: 'Returns trial plan details and limitations'
  })
  async getTrialConfig(@Res() res: Response) {
    const trialConfig = this.pricingService.getTrialConfiguration();
    
    res.set({
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    });
    
    return res.json(trialConfig);
  }
}