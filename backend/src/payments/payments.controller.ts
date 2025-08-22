import { Controller, Post, Body, Headers, BadRequestException, HttpCode, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { LemonSqueezyWebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPlan } from '../entities/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('webhook/lemonsqueezy')
  @HttpCode(200)
  async handleLemonSqueezyWebhook(
    @Body() body: LemonSqueezyWebhookDto,
    @Headers('x-signature') signature: string,
  ) {
    // Critical security fix: Strict signature validation
    if (!signature || typeof signature !== 'string' || signature.trim().length === 0) {
      throw new BadRequestException('Missing or invalid webhook signature');
    }

    // Validate signature format (should be hex string)
    if (!/^[a-fA-F0-9]+$/.test(signature)) {
      throw new BadRequestException('Invalid signature format');
    }

    const payload = JSON.stringify(body);
    
    // Ensure payload is not empty
    if (!payload || payload.length === 0) {
      throw new BadRequestException('Empty webhook payload');
    }

    let isValidSignature: boolean;
    try {
      isValidSignature = await this.paymentsService.verifyWebhookSignature(payload, signature);
    } catch (error) {
      throw new BadRequestException('Signature verification failed');
    }

    if (!isValidSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.paymentsService.handleWebhook(body);

    return { status: 'success' };
  }

  @Post('upgrade-manual')
  @UseGuards(JwtAuthGuard)
  async upgradeUserManually(
    @Request() req: any,
    @Body() body: { targetPlan: UserPlan; reason?: string },
  ) {
    const { targetPlan, reason = 'Manual upgrade' } = body;
    
    if (!Object.values(UserPlan).includes(targetPlan)) {
      throw new BadRequestException('Invalid plan specified');
    }

    const user = await this.paymentsService.upgradeUserManually(req.user.userId, targetPlan, reason);
    
    return {
      success: true,
      message: `Successfully upgraded to ${targetPlan}`,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        planName: targetPlan
      }
    };
  }

  @Post('promo-code')
  @UseGuards(JwtAuthGuard)
  async applyPromoCode(
    @Request() req: any,
    @Body() body: { promoCode: string },
  ) {
    const { promoCode } = body;
    
    if (!promoCode || typeof promoCode !== 'string') {
      throw new BadRequestException('Valid promo code is required');
    }

    const result = await this.paymentsService.applyPromoCode(req.user.userId, promoCode);
    
    return result;
  }
}