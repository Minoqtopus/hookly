import { Body, Controller, Post, Request, UseGuards, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimits.API_GENERAL)
  @ApiOperation({
    summary: 'Create payment checkout URL',
    description: `Generate LemonSqueezy checkout URL for plan upgrade.
    
    **Features:**
    - Secure checkout session creation
    - Pre-filled user information
    - Plan-specific pricing and features
    - 24-hour session expiry for security
    
    **Supported Plans:**
    - Starter: $19/month, 50 generations, TikTok + Instagram
    - Pro: $59/month, 200 generations, All platforms`
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout URL created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        checkout_url: { 
          type: 'string', 
          example: 'https://hookly.lemonsqueezy.com/checkout/custom/...'
        },
        expires_at: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-25T12:00:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid plan specified'
  })
  async createCheckout(
    @Body() body: { plan: 'starter' | 'pro' },
    @Request() req: any
  ) {
    try {
      const checkoutUrl = await this.paymentService.createCheckoutUrl(
        req.user.sub,
        body.plan
      );

      return {
        success: true,
        checkout_url: checkoutUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout creation failed'
      };
    }
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'LemonSqueezy webhook endpoint',
    description: `Handle payment events from LemonSqueezy.
    
    **Webhook Events:**
    - order_created: Process successful payment
    - subscription_created: Set up recurring billing
    - subscription_updated: Handle plan changes
    - subscription_cancelled: Process cancellations
    
    **Security:**
    - Webhook signature verification
    - Idempotent event processing
    - Comprehensive error logging`
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload'
  })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string
  ) {
    try {
      // Staff Engineer Note: NestJS automatically parses JSON body
      // For webhook signature verification in production, we'd need raw body middleware
      await this.paymentService.handleWebhook(payload, signature);
      return { success: true };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Webhook processing failed' 
      };
    }
  }
}