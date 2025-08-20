import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnableWhiteLabelDto, PurchaseAdditionalUsersDto, RequestCustomIntegrationDto, UpgradeToDedicatedSupportDto } from './dto/enterprise-upsell.dto';
import { EnterpriseUpsellService } from './enterprise-upsell.service';

@Controller('enterprise')
@UseGuards(JwtAuthGuard)
export class EnterpriseUpsellController {
  constructor(private readonly enterpriseUpsellService: EnterpriseUpsellService) {}

  /**
   * Get available enterprise upsell options for the authenticated user
   */
  @Get('upsells')
  async getAvailableUpsells(@Request() req: any) {
    return this.enterpriseUpsellService.getAvailableUpsells(req.user.userId);
  }

  /**
   * Purchase additional users for team expansion
   */
  @Post('upsells/additional-users')
  async purchaseAdditionalUsers(
    @Request() req: any,
    @Body() purchaseDto: PurchaseAdditionalUsersDto
  ) {
    return this.enterpriseUpsellService.purchaseAdditionalUsers(
      req.user.userId,
      purchaseDto.quantity,
      purchaseDto.billingCycle
    );
  }

  /**
   * Request custom integration development
   */
  @Post('upsells/custom-integration')
  async requestCustomIntegration(
    @Request() req: any,
    @Body() integrationDto: RequestCustomIntegrationDto
  ) {
    return this.enterpriseUpsellService.requestCustomIntegration(
      req.user.userId,
      integrationDto.integrationType,
      integrationDto.requirements,
      integrationDto.complexity
    );
  }

  /**
   * Enable white-label solution
   */
  @Post('upsells/white-label')
  async enableWhiteLabel(
    @Request() req: any,
    @Body() whiteLabelDto: EnableWhiteLabelDto
  ) {
    return this.enterpriseUpsellService.enableWhiteLabel(
      req.user.userId,
      whiteLabelDto.customBranding,
      whiteLabelDto.customDomain,
      whiteLabelDto.setupRequirements
    );
  }

  /**
   * Upgrade to dedicated support
   */
  @Post('upsells/dedicated-support')
  async upgradeToDedicatedSupport(
    @Request() req: any,
    @Body() supportDto: UpgradeToDedicatedSupportDto
  ) {
    return this.enterpriseUpsellService.upgradeToDedicatedSupport(
      req.user.userId,
      supportDto.supportLevel
    );
  }

  /**
   * Get enterprise analytics and revenue metrics
   */
  @Get('analytics')
  async getEnterpriseAnalytics(@Request() req: any) {
    return this.enterpriseUpsellService.getEnterpriseAnalytics(req.user.userId);
  }

  /**
   * Cancel enterprise upsell subscription
   */
  @Delete('upsells/:upsellType')
  async cancelEnterpriseUpsell(
    @Request() req: any,
    @Param('upsellType') upsellType: string
  ) {
    return this.enterpriseUpsellService.cancelEnterpriseUpsell(req.user.userId, upsellType as any);
  }
}
