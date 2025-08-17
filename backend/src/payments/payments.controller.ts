import { Controller, Post, Body, Headers, BadRequestException, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { LemonSqueezyWebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('webhook/lemonsqueezy')
  @HttpCode(200)
  async handleLemonSqueezyWebhook(
    @Body() body: LemonSqueezyWebhookDto,
    @Headers('x-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const payload = JSON.stringify(body);
    const isValidSignature = this.paymentsService.verifyWebhookSignature(payload, signature);

    if (!isValidSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.paymentsService.handleWebhook(body);

    return { status: 'success' };
  }
}