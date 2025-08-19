import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../src/analytics/analytics.service';
import { PlanDeterminationPolicy } from '../src/core/domain/policies/plan-determination.policy';
import { User, UserPlan } from '../src/entities/user.entity';
import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    plan: UserPlan.TRIAL,
    daily_count: 0,
    reset_date: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAnalyticsService = {
    trackEvent: jest.fn(),
    trackConversion: jest.fn(),
  } as Partial<AnalyticsService> as AnalyticsService;

  const mockPaymentProvider = {
    verifyWebhookSignature: jest.fn(),
    processWebhook: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    getSubscription: jest.fn(),
    getProviderHealth: jest.fn(),
  };

  const mockAnalyticsPort = {
    trackEvent: jest.fn(),
    trackConversion: jest.fn(),
    trackUserBehavior: jest.fn(),
    getAnalyticsSummary: jest.fn(),
  };

  const mockPlanDeterminationPolicy = {
    determinePlanFromProductData: jest.fn(),
    isValidPlanTransition: jest.fn(),
    getPlanHierarchy: jest.fn(),
    getPlanPrice: jest.fn(),
    getPlanFeatures: jest.fn(),
    validatePromoCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
        {
          provide: 'PaymentProviderPort',
          useValue: mockPaymentProvider,
        },
        {
          provide: 'AnalyticsPort',
          useValue: mockAnalyticsPort,
        },
        {
          provide: PlanDeterminationPolicy,
          useValue: mockPlanDeterminationPolicy,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plan Determination', () => {
    test('should determine STARTER plan from product name', () => {
      const webhookData = {
        attributes: {
          product_name: 'Hookly Starter Plan',
          variant_name: 'Monthly',
          custom_data: {},
        },
      };

      mockPlanDeterminationPolicy.determinePlanFromProductData.mockReturnValue(UserPlan.STARTER);
      const plan = mockPlanDeterminationPolicy.determinePlanFromProductData(webhookData);
      expect(plan).toBe(UserPlan.STARTER);
    });

    test('should determine PRO plan from variant name', () => {
      const webhookData = {
        attributes: {
          product_name: 'Hookly Subscription',
          variant_name: 'Pro Monthly',
          custom_data: {},
        },
      };

      mockPlanDeterminationPolicy.determinePlanFromProductData.mockReturnValue(UserPlan.PRO);
      const plan = mockPlanDeterminationPolicy.determinePlanFromProductData(webhookData);
      expect(plan).toBe(UserPlan.PRO);
    });

    test('should determine AGENCY plan from custom data', () => {
      const webhookData = {
        attributes: {
          product_name: 'Hookly Enterprise',
          variant_name: 'Yearly',
          custom_data: { plan: 'AGENCY' },
        },
      };

      mockPlanDeterminationPolicy.determinePlanFromProductData.mockReturnValue(UserPlan.AGENCY);
      const plan = mockPlanDeterminationPolicy.determinePlanFromProductData(webhookData);
      expect(plan).toBe(UserPlan.AGENCY);
    });

    test('should default to PRO for unknown products', () => {
      const webhookData = {
        attributes: {
          product_name: 'Unknown Product',
          variant_name: 'Unknown Variant',
          custom_data: {},
        },
      };

      mockPlanDeterminationPolicy.determinePlanFromProductData.mockReturnValue(UserPlan.PRO);
      const plan = mockPlanDeterminationPolicy.determinePlanFromProductData(webhookData);
      expect(plan).toBe(UserPlan.PRO);
    });
  });

  describe('Webhook Handling', () => {
    test('should handle subscription_created webhook', async () => {
      const webhookPayload = {
        meta: {
          event_name: 'subscription_created',
          custom_data: { user_id: 'user-1' },
        },
        data: {
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            status: 'active',
            product_name: 'Hookly Pro',
            variant_name: 'Monthly',
            user_email: 'test@example.com',
            customer_id: 'cust-123',
          },
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.handleWebhook(webhookPayload);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    test('should handle subscription_cancelled webhook', async () => {
      const webhookPayload = {
        meta: {
          event_name: 'subscription_cancelled',
          custom_data: { user_id: 'user-1' },
        },
        data: {
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            status: 'cancelled',
            user_email: 'test@example.com',
            product_name: 'Hookly Pro',
            variant_name: 'Monthly',
            customer_id: 'cust-123',
          },
        },
      };

      const proUser = { ...mockUser, plan: UserPlan.PRO };
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue({ ...proUser, plan: UserPlan.TRIAL });

      await service.handleWebhook(webhookPayload);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ plan: UserPlan.TRIAL })
      );
    });

    test('should handle order_created webhook for one-time purchases', async () => {
      const webhookPayload = {
        meta: {
          event_name: 'order_created',
          custom_data: { user_id: 'user-1' },
        },
        data: {
          id: 'order-123',
          type: 'order',
          attributes: {
            status: 'paid',
            product_name: 'Hookly Agency',
            variant_name: 'One-time',
            user_email: 'test@example.com',
            customer_id: 'cust-123',
          },
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      
      // Mock the plan determination to return AGENCY
      mockPlanDeterminationPolicy.determinePlanFromProductData.mockReturnValue(UserPlan.AGENCY);

      await service.handleWebhook(webhookPayload);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ plan: UserPlan.AGENCY })
      );
    });
  });

  describe('Manual Upgrades', () => {
    test('should upgrade user manually', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        plan: UserPlan.PRO,
      });

      const result = await service.upgradeUserManually(
        'user-1',
        UserPlan.PRO,
        'Admin upgrade'
      );

      expect(result.plan).toBe(UserPlan.PRO);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    test('should throw error for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upgradeUserManually('user-1', UserPlan.PRO)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Promo Codes', () => {
    test('should apply valid promo code', async () => {
      const trialUser = { ...mockUser, plan: UserPlan.TRIAL };
      mockUserRepository.findOne.mockResolvedValue(trialUser);
      mockUserRepository.save.mockResolvedValue({
        ...trialUser,
        plan: UserPlan.STARTER,
      });

      mockPlanDeterminationPolicy.validatePromoCode.mockReturnValue({
        isValid: true,
        targetPlan: UserPlan.STARTER,
        message: 'Launch Special - 50% off Starter',
        isBeta: false,
      });

      const result = await service.applyPromoCode('user-1', 'LAUNCH50');

      expect(result.success).toBe(true);
      expect(result.newPlan).toBe(UserPlan.STARTER);
      expect(result.message).toContain('Launch Special');
    });

    test('should reject invalid promo code', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      mockPlanDeterminationPolicy.validatePromoCode.mockReturnValue({
        isValid: false,
        targetPlan: null,
        message: 'Invalid promo code',
        isBeta: false,
      });

      const result = await service.applyPromoCode('user-1', 'INVALID');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid promo code');
    });

    test('should reject promo code for higher tier users', async () => {
      const proUser = { ...mockUser, plan: UserPlan.PRO };
      mockUserRepository.findOne.mockResolvedValue(proUser);

      mockPlanDeterminationPolicy.validatePromoCode.mockReturnValue({
        isValid: false,
        targetPlan: null,
        message: 'Promo code not applicable to your current plan',
        isBeta: false,
      });

      const result = await service.applyPromoCode('user-1', 'LAUNCH50');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Promo code not applicable to your current plan');
    });
  });

  describe('Plan Hierarchy Validation', () => {
    test('should allow upgrades', () => {
      mockPlanDeterminationPolicy.isValidPlanTransition.mockReturnValue(true);
      const isValid = mockPlanDeterminationPolicy.isValidPlanTransition(UserPlan.TRIAL, UserPlan.PRO);
      expect(isValid).toBe(true);
    });

    test('should allow lateral moves', () => {
      mockPlanDeterminationPolicy.isValidPlanTransition.mockReturnValue(true);
      const isValid = mockPlanDeterminationPolicy.isValidPlanTransition(UserPlan.PRO, UserPlan.PRO);
      expect(isValid).toBe(true);
    });

    test('should prevent downgrades', () => {
      mockPlanDeterminationPolicy.isValidPlanTransition.mockReturnValue(false);
      const isValid = mockPlanDeterminationPolicy.isValidPlanTransition(UserPlan.PRO, UserPlan.TRIAL);
      expect(isValid).toBe(false);
    });
  });

  describe('Webhook Signature Verification', () => {
    test('should verify valid webhook signature', async () => {
      mockPaymentProvider.verifyWebhookSignature.mockResolvedValue(true);

      const payload = '{"test": "data"}';
      const validSignature = 'valid-signature';

      const isValid = await service.verifyWebhookSignature(payload, validSignature);
      expect(isValid).toBe(true);
    });

    test('should reject invalid webhook signature', async () => {
      mockPaymentProvider.verifyWebhookSignature.mockResolvedValue(false);

      const payload = '{"test": "data"}';
      const invalidSignature = 'invalid-signature';

      const isValid = await service.verifyWebhookSignature(payload, invalidSignature);
      expect(isValid).toBe(false);
    });

    test('should handle missing webhook secret', async () => {
      mockPaymentProvider.verifyWebhookSignature.mockResolvedValue(false);

      const payload = '{"test": "data"}';
      const signature = 'any-signature';

      const isValid = await service.verifyWebhookSignature(payload, signature);
      expect(isValid).toBe(false);
    });
  });
});

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockService = {
    verifyWebhookSignature: jest.fn(),
    handleWebhook: jest.fn(),
    upgradeUserManually: jest.fn(),
    applyPromoCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Webhook Endpoint', () => {
    test('should handle valid webhook', async () => {
      const webhookBody = {
        meta: { event_name: 'subscription_created' },
        data: { 
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            status: 'active',
            user_email: 'test@example.com',
            product_name: 'Hookly Pro',
            variant_name: 'Monthly',
            customer_id: 'cust-123',
          }
        },
      };
      const signature = 'valid-signature';

      mockService.verifyWebhookSignature.mockReturnValue(true);
      mockService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleLemonSqueezyWebhook(webhookBody, signature);

      expect(result).toEqual({ status: 'success' });
      expect(mockService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(webhookBody),
        signature
      );
      expect(mockService.handleWebhook).toHaveBeenCalledWith(webhookBody);
    });

    test('should reject webhook with invalid signature', async () => {
      const webhookBody = {
        meta: { event_name: 'subscription_created' },
        data: { 
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            status: 'active',
            user_email: 'test@example.com',
            product_name: 'Hookly Pro',
            variant_name: 'Monthly',
            customer_id: 'cust-123',
          }
        },
      };
      const signature = 'invalid-signature';

      mockService.verifyWebhookSignature.mockReturnValue(false);

      await expect(
        controller.handleLemonSqueezyWebhook(webhookBody, signature)
      ).rejects.toThrow('Invalid webhook signature');
    });

    test('should reject webhook without signature', async () => {
      const webhookBody = {
        meta: { event_name: 'subscription_created' },
        data: { 
          id: 'sub-123',
          type: 'subscription',
          attributes: {
            status: 'active',
            user_email: 'test@example.com',
            product_name: 'Hookly Pro',
            variant_name: 'Monthly',
            customer_id: 'cust-123',
          }
        },
      };

      await expect(
        controller.handleLemonSqueezyWebhook(webhookBody, '')
      ).rejects.toThrow('Missing webhook signature');
    });
  });

  describe('Manual Upgrade Endpoint', () => {
    test('should upgrade user manually', async () => {
      const req = { user: { userId: 'user-1' } };
      const body = { targetPlan: UserPlan.PRO, reason: 'Test upgrade' };
      const upgradeResult = {
        id: 'user-1',
        email: 'test@example.com',
        plan: UserPlan.PRO,
      };

      mockService.upgradeUserManually.mockResolvedValue(upgradeResult);

      const result = await controller.upgradeUserManually(req, body);

      expect(result.success).toBe(true);
      expect(result.user.plan).toBe(UserPlan.PRO);
      expect(mockService.upgradeUserManually).toHaveBeenCalledWith(
        'user-1',
        UserPlan.PRO,
        'Test upgrade'
      );
    });

    test('should reject invalid plan', async () => {
      const req = { user: { userId: 'user-1' } };
      const body = { targetPlan: 'INVALID_PLAN' as any };

      await expect(
        controller.upgradeUserManually(req, body)
      ).rejects.toThrow('Invalid plan specified');
    });
  });

  describe('Promo Code Endpoint', () => {
    test('should apply valid promo code', async () => {
      const req = { user: { userId: 'user-1' } };
      const body = { promoCode: 'LAUNCH50' };
      const promoResult = {
        success: true,
        message: 'Promo applied successfully',
        newPlan: UserPlan.STARTER,
      };

      mockService.applyPromoCode.mockResolvedValue(promoResult);

      const result = await controller.applyPromoCode(req, body);

      expect(result.success).toBe(true);
      expect(result.newPlan).toBe(UserPlan.STARTER);
      expect(mockService.applyPromoCode).toHaveBeenCalledWith('user-1', 'LAUNCH50');
    });

    test('should reject empty promo code', async () => {
      const req = { user: { userId: 'user-1' } };
      const body = { promoCode: '' };

      await expect(
        controller.applyPromoCode(req, body)
      ).rejects.toThrow('Valid promo code is required');
    });
  });
});