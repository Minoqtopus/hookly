import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { EnterpriseUpsellPort } from '../core/ports/enterprise-upsell.port';
import { PaymentProviderPort } from '../core/ports/payment-provider.port';
import { EventType } from '../entities/analytics-event.entity';
import { CustomIntegrationRequest, IntegrationComplexity, IntegrationStatus } from '../entities/custom-integration-request.entity';
import { BillingCycle, EnterpriseUpsell, UpsellStatus, UpsellType } from '../entities/enterprise-upsell.entity';
import { Team } from '../entities/team.entity';
import { User, UserPlan } from '../entities/user.entity';

@Injectable()
export class EnterpriseUpsellService implements EnterpriseUpsellPort {
  private readonly logger = new Logger(EnterpriseUpsellService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EnterpriseUpsell)
    private enterpriseUpsellRepository: Repository<EnterpriseUpsell>,
    @InjectRepository(CustomIntegrationRequest)
    private customIntegrationRepository: Repository<CustomIntegrationRequest>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private configService: ConfigService,
    private analyticsService: AnalyticsService,
    @Inject('PaymentProviderPort')
    private paymentProvider: PaymentProviderPort,
  ) {}

  /**
   * Get available upsell options for a user based on their current plan
   */
  async getAvailableUpsells(userId: string): Promise<{
    additionalUsers: {
      available: boolean;
      currentCount: number;
      maxAllowed: number;
      pricePerUser: number;
      nextBillingDate?: Date;
    };
    customIntegrations: {
      available: boolean;
      options: Array<{
        type: string;
        description: string;
        monthlyPrice: number;
        setupFee: number;
        features: string[];
      }>;
    };
    whiteLabel: {
      available: boolean;
      monthlyPrice: number;
      setupFee: number;
      features: string[];
      customBranding: boolean;
      customDomain: boolean;
    };
    dedicatedSupport: {
      available: boolean;
      monthlyPrice: number;
      features: string[];
      responseTime: string;
    };
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's team information
    const userTeam = await this.teamRepository.findOne({
      where: { owner_id: userId },
      relations: ['members'],
    });

    const currentMemberCount = userTeam?.current_member_count || 0;
    const maxAllowed = this.getMemberLimitForPlan(user.plan);

    return {
      additionalUsers: {
        available: this.canPurchaseAdditionalUsers(user),
        currentCount: currentMemberCount,
        maxAllowed,
        pricePerUser: 29, // $29/month per additional user
        nextBillingDate: this.getNextBillingDate(user),
      },
      customIntegrations: {
        available: this.canRequestCustomIntegrations(user),
        options: this.getCustomIntegrationOptions(),
      },
      whiteLabel: {
        available: this.canEnableWhiteLabel(user),
        monthlyPrice: 500,
        setupFee: 1000,
        features: [
          'Custom branding and logo',
          'Custom domain',
          'White-label analytics',
          'Custom email templates',
          'Branded export files',
        ],
        customBranding: true,
        customDomain: true,
      },
      dedicatedSupport: {
        available: this.canUpgradeToDedicatedSupport(user),
        monthlyPrice: 199,
        features: [
          'Priority support response',
          'Dedicated account manager',
          '24/7 emergency support',
          'Custom training sessions',
          'Monthly strategy calls',
        ],
        responseTime: '2 hours',
      },
    };
  }

  /**
   * Purchase additional users for a team
   */
  async purchaseAdditionalUsers(
    userId: string,
    quantity: number,
    billingCycle: BillingCycle
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    totalMonthlyCost: number;
    nextBillingDate: Date;
    userLimit: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.canPurchaseAdditionalUsers(user)) {
      throw new ForbiddenException('Your current plan does not allow purchasing additional users');
    }

    const userTeam = await this.teamRepository.findOne({
      where: { owner_id: userId },
    });

    if (!userTeam) {
      throw new BadRequestException('You must have a team to purchase additional users');
    }

    const pricePerUser = 29;
    const totalMonthlyCost = quantity * pricePerUser;
    const yearlyDiscount = billingCycle === BillingCycle.YEARLY ? 0.17 : 0; // 17% discount for yearly
    const adjustedMonthlyCost = totalMonthlyCost * (1 - yearlyDiscount);

    // Create enterprise upsell record
    const enterpriseUpsell = this.enterpriseUpsellRepository.create({
      user_id: userId,
      upsell_type: UpsellType.ADDITIONAL_USERS,
      status: UpsellStatus.ACTIVE,
      billing_cycle: billingCycle,
      monthly_price: adjustedMonthlyCost,
      setup_fee: 0,
      total_paid: 0,
      features: {
        additionalUsers: quantity,
        billingCycle,
        yearlyDiscount,
      },
      configuration: {
        teamId: userTeam.id,
        currentMemberCount: userTeam.current_member_count,
        newMemberLimit: userTeam.member_limit + quantity,
      },
      description: `${quantity} additional team member${quantity > 1 ? 's' : ''} (${billingCycle})`,
      started_at: new Date(),
      expires_at: billingCycle === BillingCycle.YEARLY 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const savedUpsell = await this.enterpriseUpsellRepository.save(enterpriseUpsell);

    // Update team member limit
    await this.teamRepository.update(userTeam.id, {
      member_limit: userTeam.member_limit + quantity,
    });

    // Track analytics
    await this.analyticsService.trackEvent(
      EventType.ENTERPRISE_UPSELL_PURCHASED,
      userId,
      {
        upsell_type: UpsellType.ADDITIONAL_USERS,
        quantity,
        billing_cycle: billingCycle,
        monthly_cost: adjustedMonthlyCost,
        yearly_discount: yearlyDiscount,
      }
    );

    this.logger.log(`User ${userId} purchased ${quantity} additional users for $${adjustedMonthlyCost}/month`);

    return {
      success: true,
      subscriptionId: savedUpsell.id,
      totalMonthlyCost: adjustedMonthlyCost,
      nextBillingDate: savedUpsell.expires_at,
      userLimit: userTeam.member_limit + quantity,
    };
  }

  /**
   * Request custom integration
   */
  async requestCustomIntegration(
    userId: string,
    integrationType: string,
    requirements: string,
    estimatedComplexity: IntegrationComplexity
  ): Promise<{
    requestId: string;
    estimatedCost: number;
    estimatedTimeline: string;
    status: IntegrationStatus;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.canRequestCustomIntegrations(user)) {
      throw new ForbiddenException('Your current plan does not allow custom integrations');
    }

    const { estimatedCost, estimatedTimeline } = this.calculateIntegrationCostAndTimeline(estimatedComplexity);

    // Create custom integration request
    const integrationRequest = this.customIntegrationRepository.create({
      user_id: userId,
      integration_type: integrationType,
      requirements,
      complexity: estimatedComplexity,
      estimated_cost: estimatedCost,
      estimated_timeline: estimatedTimeline,
      status: IntegrationStatus.PENDING,
      business_justification: requirements,
      priority: 'medium',
    });

    const savedRequest = await this.customIntegrationRepository.save(integrationRequest);

    // Track analytics
    await this.analyticsService.trackEvent(
      EventType.CUSTOM_INTEGRATION_REQUESTED,
      userId,
      {
        integration_type: integrationType,
        complexity: estimatedComplexity,
        estimated_cost: estimatedCost,
        estimated_timeline: estimatedTimeline,
      }
    );

    this.logger.log(`Custom integration requested by user ${userId}: ${integrationType} (${estimatedComplexity})`);

    return {
      requestId: savedRequest.id,
      estimatedCost,
      estimatedTimeline,
      status: IntegrationStatus.PENDING,
    };
  }

  /**
   * Enable white-label solution
   */
  async enableWhiteLabel(
    userId: string,
    customBranding: boolean,
    customDomain: boolean,
    setupRequirements: string
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    monthlyCost: number;
    setupFee: number;
    features: string[];
    estimatedSetupTime: string;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.canEnableWhiteLabel(user)) {
      throw new ForbiddenException('Your current plan does not allow white-label solutions');
    }

    const monthlyCost = 500;
    const setupFee = 1000;
    const features = [
      'Custom branding and logo',
      'Custom domain',
      'White-label analytics',
      'Custom email templates',
      'Branded export files',
    ];

    // Create enterprise upsell record
    const enterpriseUpsell = this.enterpriseUpsellRepository.create({
      user_id: userId,
      upsell_type: UpsellType.WHITE_LABEL,
      status: UpsellStatus.ACTIVE,
      billing_cycle: BillingCycle.MONTHLY,
      monthly_price: monthlyCost,
      setup_fee: setupFee,
      total_paid: 0,
      features: {
        customBranding,
        customDomain,
        setupRequirements,
      },
      configuration: {
        customBranding,
        customDomain,
        setupRequirements,
      },
      description: 'White-label solution with custom branding and domain',
      started_at: new Date(),
    });

    const savedUpsell = await this.enterpriseUpsellRepository.save(enterpriseUpsell);

    // Track analytics
    await this.analyticsService.trackEvent(
      EventType.ENTERPRISE_UPSELL_PURCHASED,
      userId,
      {
        upsell_type: UpsellType.WHITE_LABEL,
        monthly_cost: monthlyCost,
        setup_fee: setupFee,
        custom_branding: customBranding,
        custom_domain: customDomain,
      }
    );

    this.logger.log(`White-label solution enabled for user ${userId}`);

    return {
      success: true,
      subscriptionId: savedUpsell.id,
      monthlyCost,
      setupFee,
      features,
      estimatedSetupTime: '2-3 business days',
    };
  }

  /**
   * Upgrade to dedicated support
   */
  async upgradeToDedicatedSupport(
    userId: string,
    supportLevel: 'basic' | 'premium' | 'enterprise'
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    monthlyCost: number;
    features: string[];
    responseTime: string;
    accountManager: boolean;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.canUpgradeToDedicatedSupport(user)) {
      throw new ForbiddenException('Your current plan does not allow dedicated support');
    }

    const supportConfig = this.getSupportLevelConfig(supportLevel);

    // Create enterprise upsell record
    const enterpriseUpsell = this.enterpriseUpsellRepository.create({
      user_id: userId,
      upsell_type: UpsellType.DEDICATED_SUPPORT,
      status: UpsellStatus.ACTIVE,
      billing_cycle: BillingCycle.MONTHLY,
      monthly_price: supportConfig.monthlyCost,
      setup_fee: 0,
      total_paid: 0,
      features: supportConfig.features,
      configuration: {
        supportLevel,
        responseTime: supportConfig.responseTime,
        accountManager: supportConfig.accountManager,
      },
      description: `Dedicated support - ${supportLevel} level`,
      started_at: new Date(),
    });

    const savedUpsell = await this.enterpriseUpsellRepository.save(enterpriseUpsell);

    // Track analytics
    await this.analyticsService.trackEvent(
      EventType.ENTERPRISE_UPSELL_PURCHASED,
      userId,
      {
        upsell_type: UpsellType.DEDICATED_SUPPORT,
        support_level: supportLevel,
        monthly_cost: supportConfig.monthlyCost,
        response_time: supportConfig.responseTime,
        account_manager: supportConfig.accountManager,
      }
    );

    this.logger.log(`Dedicated support upgraded for user ${userId} to ${supportLevel} level`);

    return {
      success: true,
      subscriptionId: savedUpsell.id,
      monthlyCost: supportConfig.monthlyCost,
      features: supportConfig.features,
      responseTime: supportConfig.responseTime,
      accountManager: supportConfig.accountManager,
    };
  }

  /**
   * Get enterprise upsell analytics and revenue metrics
   */
  async getEnterpriseAnalytics(userId: string): Promise<{
    totalUpsellRevenue: number;
    monthlyRecurringRevenue: number;
    upsellBreakdown: {
      additionalUsers: number;
      customIntegrations: number;
      whiteLabel: number;
      dedicatedSupport: number;
    };
    conversionRates: {
      additionalUsers: number;
      customIntegrations: number;
      whiteLabel: number;
      dedicatedSupport: number;
    };
    customerLifetimeValue: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all active upsells for the user
    const activeUpsells = await this.enterpriseUpsellRepository.find({
      where: { user_id: userId, status: UpsellStatus.ACTIVE },
    });

    // Calculate revenue metrics
    const totalUpsellRevenue = activeUpsells.reduce((total, upsell) => {
      return total + Number(upsell.monthly_price) + Number(upsell.setup_fee);
    }, 0);

    const monthlyRecurringRevenue = activeUpsells.reduce((total, upsell) => {
      return total + Number(upsell.monthly_price);
    }, 0);

    // Calculate upsell breakdown
    const upsellBreakdown = {
      additionalUsers: activeUpsells.filter(u => u.upsell_type === UpsellType.ADDITIONAL_USERS).length,
      customIntegrations: activeUpsells.filter(u => u.upsell_type === UpsellType.CUSTOM_INTEGRATIONS).length,
      whiteLabel: activeUpsells.filter(u => u.upsell_type === UpsellType.WHITE_LABEL).length,
      dedicatedSupport: activeUpsells.filter(u => u.upsell_type === UpsellType.DEDICATED_SUPPORT).length,
    };

    // Calculate conversion rates (simplified - in real implementation would track views vs purchases)
    const conversionRates = {
      additionalUsers: upsellBreakdown.additionalUsers > 0 ? 100 : 0,
      customIntegrations: upsellBreakdown.customIntegrations > 0 ? 100 : 0,
      whiteLabel: upsellBreakdown.whiteLabel > 0 ? 100 : 0,
      dedicatedSupport: upsellBreakdown.dedicatedSupport > 0 ? 100 : 0,
    };

    // Calculate customer lifetime value (simplified)
    const customerLifetimeValue = totalUpsellRevenue + (monthlyRecurringRevenue * 12); // 1 year projection

    return {
      totalUpsellRevenue,
      monthlyRecurringRevenue,
      upsellBreakdown,
      conversionRates,
      customerLifetimeValue,
    };
  }

  /**
   * Cancel enterprise upsell subscription
   */
  async cancelEnterpriseUpsell(
    userId: string,
    upsellType: UpsellType
  ): Promise<{
    cancelled: boolean;
    effectiveDate: Date;
    proratedRefund?: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const upsell = await this.enterpriseUpsellRepository.findOne({
      where: { user_id: userId, upsell_type: upsellType, status: UpsellStatus.ACTIVE },
    });

    if (!upsell) {
      throw new NotFoundException('Active upsell not found');
    }

    // Update upsell status
    upsell.status = UpsellStatus.CANCELLED;
    upsell.cancelled_at = new Date();
    await this.enterpriseUpsellRepository.save(upsell);

    // Handle specific cancellation logic
    if (upsellType === UpsellType.ADDITIONAL_USERS) {
      await this.handleAdditionalUsersCancellation(userId, upsell);
    }

    // Track analytics
    await this.analyticsService.trackEvent(
      EventType.ENTERPRISE_UPSELL_CANCELLED,
      userId,
      {
        upsell_type: upsellType,
        monthly_cost: upsell.monthly_price,
        setup_fee: upsell.setup_fee,
        total_paid: upsell.total_paid,
      }
    );

    this.logger.log(`Enterprise upsell cancelled for user ${userId}: ${upsellType}`);

    return {
      cancelled: true,
      effectiveDate: new Date(),
      proratedRefund: 0, // No prorated refunds for monthly subscriptions
    };
  }

  // Private helper methods

  private canPurchaseAdditionalUsers(user: User): boolean {
    return ['pro', 'agency'].includes(user.plan);
  }

  private canRequestCustomIntegrations(user: User): boolean {
    return ['agency'].includes(user.plan);
  }

  private canEnableWhiteLabel(user: User): boolean {
    return ['agency'].includes(user.plan);
  }

  private canUpgradeToDedicatedSupport(user: User): boolean {
    return ['pro', 'agency'].includes(user.plan);
  }

  private getMemberLimitForPlan(plan: UserPlan): number {
    switch (plan) {
      case UserPlan.PRO:
        return 3;
      case UserPlan.AGENCY:
        return 10;
      default:
        return 1;
    }
  }

  private getNextBillingDate(user: User): Date {
    // Simplified - in real implementation would get from payment provider
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private getCustomIntegrationOptions(): Array<{
    type: string;
    description: string;
    monthlyPrice: number;
    setupFee: number;
    features: string[];
  }> {
    return [
      {
        type: 'API Integration',
        description: 'Custom API endpoints and webhooks',
        monthlyPrice: 1000,
        setupFee: 2000,
        features: ['Custom API endpoints', 'Webhook integration', 'Data synchronization', 'Custom authentication'],
      },
      {
        type: 'Third-party Platform',
        description: 'Integration with external platforms',
        monthlyPrice: 1500,
        setupFee: 3000,
        features: ['Platform integration', 'Data mapping', 'Real-time sync', 'Error handling'],
      },
      {
        type: 'Enterprise Workflow',
        description: 'Custom business process automation',
        monthlyPrice: 2000,
        setupFee: 5000,
        features: ['Workflow automation', 'Business rules engine', 'Custom reporting', 'Advanced analytics'],
      },
    ];
  }

  private calculateIntegrationCostAndTimeline(complexity: IntegrationComplexity): {
    estimatedCost: number;
    estimatedTimeline: string;
  } {
    switch (complexity) {
      case IntegrationComplexity.SIMPLE:
        return { estimatedCost: 1000, estimatedTimeline: '1-2 weeks' };
      case IntegrationComplexity.MEDIUM:
        return { estimatedCost: 2500, estimatedTimeline: '3-4 weeks' };
      case IntegrationComplexity.COMPLEX:
        return { estimatedCost: 5000, estimatedTimeline: '6-8 weeks' };
      default:
        return { estimatedCost: 1000, estimatedTimeline: '2-3 weeks' };
    }
  }

  private getSupportLevelConfig(supportLevel: string): {
    monthlyCost: number;
    features: string[];
    responseTime: string;
    accountManager: boolean;
  } {
    switch (supportLevel) {
      case 'basic':
        return {
          monthlyCost: 99,
          features: ['Priority support', 'Email support', '4-hour response time'],
          responseTime: '4 hours',
          accountManager: false,
        };
      case 'premium':
        return {
          monthlyCost: 199,
          features: ['Priority support', 'Phone support', '2-hour response time', 'Monthly check-ins'],
          responseTime: '2 hours',
          accountManager: false,
        };
      case 'enterprise':
        return {
          monthlyCost: 299,
          features: ['Priority support', 'Phone support', '1-hour response time', 'Weekly check-ins', 'Dedicated account manager'],
          responseTime: '1 hour',
          accountManager: true,
        };
      default:
        return {
          monthlyCost: 199,
          features: ['Priority support', 'Phone support', '2-hour response time'],
          responseTime: '2 hours',
          accountManager: false,
        };
    }
  }

  private async handleAdditionalUsersCancellation(userId: string, upsell: EnterpriseUpsell): Promise<void> {
    // Revert team member limit changes
    const userTeam = await this.teamRepository.findOne({
      where: { owner_id: userId },
    });

    if (userTeam && upsell.configuration?.teamId === userTeam.id) {
      const additionalUsers = upsell.features?.additionalUsers || 0;
      const newLimit = Math.max(userTeam.member_limit - additionalUsers, this.getMemberLimitForPlan(userTeam.plan_tier as UserPlan));
      
      await this.teamRepository.update(userTeam.id, {
        member_limit: newLimit,
      });

      this.logger.log(`Team member limit reverted for user ${userId}: ${userTeam.member_limit} → ${newLimit}`);
    }
  }
}
