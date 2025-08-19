import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerationPolicy } from '../src/core/domain/policies/generation.policy';
import { PlanLimitPolicy } from '../src/core/domain/policies/plan-limit.policy';
import { Generation } from '../src/entities/generation.entity';
import { User, UserPlan } from '../src/entities/user.entity';
import { GenerationService } from '../src/generation/generation.service';
import { OpenAIService } from '../src/openai/openai.service';

describe('GenerationService', () => {
  let service: GenerationService;
  let userRepository: Repository<User>;
  let generationRepository: Repository<Generation>;
  let openaiService: OpenAIService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    plan: UserPlan.TRIAL,
    monthly_count: 0,
    trial_generations_used: 0,
    reset_date: new Date(),
    has_batch_generation: false,
  } as unknown as User;

  const mockGeneration = {
    id: 'gen-1',
    user_id: 'user-1',
    hook: 'Test hook',
    script: 'Test script',
    visuals: ['Test visual'],
    performance: { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 },
    created_at: new Date(),
  } as unknown as Generation;

  const mockGeneratedContent = {
    hook: 'AI generated hook',
    script: 'AI generated script',
    visuals: ['AI generated visual'],
    performance: { estimatedViews: 75000, estimatedCTR: 3.8, viralScore: 7.5 },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockGenerationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };

  const mockOpenAIService = {
    generateUGCContent: jest.fn(),
    generateUGCVariations: jest.fn(),
  };

  const mockContentGenerator = {
    generateUGCContent: jest.fn(),
    generateUGCVariations: jest.fn(),
  };

  const mockPlanLimitPolicy = {
    canUserGenerate: jest.fn(),
  };

  const mockGenerationPolicy = {
    getGenerationConfig: jest.fn(),
    calculateRetryDelay: jest.fn(),
  };

  beforeEach(async () => {
    // Setup default mock behaviors
    mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
      canGenerate: true,
      remainingGenerations: 50,
      limitType: 'monthly',
      resetDate: new Date(),
    });

    mockGenerationPolicy.getGenerationConfig.mockReturnValue({
      maxRetries: 3,
      timeout: 30000,
      retryDelay: 1000,
    });

    mockGenerationPolicy.calculateRetryDelay.mockReturnValue(1000);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Generation),
          useValue: mockGenerationRepository,
        },
        {
          provide: OpenAIService,
          useValue: mockOpenAIService,
        },
        {
          provide: 'ContentGeneratorPort',
          useValue: mockContentGenerator,
        },
        {
          provide: PlanLimitPolicy,
          useValue: mockPlanLimitPolicy,
        },
        {
          provide: GenerationPolicy,
          useValue: mockGenerationPolicy,
        },
      ],
    }).compile();

    service = module.get<GenerationService>(GenerationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    generationRepository = module.get<Repository<Generation>>(getRepositoryToken(Generation));
    openaiService = module.get<OpenAIService>(OpenAIService);

    // Default identity behavior for create/save so service returns the values it writes
    mockGenerationRepository.create.mockImplementation((data: any) => ({ ...data }));
    mockGenerationRepository.save.mockImplementation(async (data: any) => ({ id: 'gen-1', created_at: new Date(), ...data }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plan-Based Limits', () => {
    test('should allow generation for trial user within limit', async () => {
      const trialUser = { ...mockUser, plan: UserPlan.TRIAL, trial_generations_used: 14 };
      mockUserRepository.findOne.mockResolvedValue(trialUser);
      mockUserRepository.save.mockResolvedValue(trialUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockContentGenerator.generateUGCContent.mockResolvedValue(mockGeneratedContent);
      
      // Mock the policy to allow generation
      mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
        canGenerate: true,
        remainingGenerations: 0, // After generation, remaining should be 0
        limitType: 'trial',
        resetDate: new Date(),
        trialStatus: {
          isActive: true,
          daysRemaining: 3,
          generationsRemaining: 0,
        },
      });

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBe(0);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ trial_generations_used: 15 })
      );
    });

    test('should reject generation for trial user over limit', async () => {
      const trialUser = { ...mockUser, plan: UserPlan.TRIAL, trial_generations_used: 15 };
      mockUserRepository.findOne.mockResolvedValue(trialUser);
      
      // Mock the policy to reject generation
      mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
        canGenerate: false,
        remainingGenerations: 0,
        limitType: 'trial',
        resetDate: new Date(),
        upgradeMessage: 'Trial generation limit of 15 reached. Upgrade to Starter plan for 50 generations/month.',
        trialStatus: {
          isActive: true,
          daysRemaining: 3,
          generationsRemaining: 0,
        },
      });

      await expect(
        service.generateContent('user-1', {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    test('should respect PRO monthly limit', async () => {
      const proUser = { ...mockUser, plan: UserPlan.PRO, monthly_count: 100 };
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue(proUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockContentGenerator.generateUGCContent.mockResolvedValue(mockGeneratedContent);
      
      // Mock the policy to allow generation and return correct remaining count
      mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
        canGenerate: true,
        remainingGenerations: 99, // 200 - (100 + 1) = 99
        limitType: 'monthly',
        resetDate: new Date(),
      });

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBe(99);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ monthly_count: 101 })
      );
    });

    test('should handle STARTER monthly limit', async () => {
      const starterUser = { ...mockUser, plan: UserPlan.STARTER, monthly_count: 49 };
      mockUserRepository.findOne.mockResolvedValue(starterUser);
      mockUserRepository.save.mockResolvedValue(starterUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockContentGenerator.generateUGCContent.mockResolvedValue(mockGeneratedContent);
      
      // Mock the policy to allow generation and return correct remaining count
      mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
        canGenerate: true,
        remainingGenerations: 0, // 50 - (49 + 1) = 0
        limitType: 'monthly',
        resetDate: new Date(),
      });

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBe(0);
    });
  });

  describe('Watermark Application', () => {
    test('should add watermark for trial users', async () => {
      const trialUser = { ...mockUser, plan: UserPlan.TRIAL, trial_generations_used: 0 };
      mockUserRepository.findOne.mockResolvedValue(trialUser);
      mockUserRepository.save.mockResolvedValue(trialUser);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.script).toContain('Generated with Hookly (Trial)');
      expect(result.hook).toContain('Hookly Trial');
    });

    test('should not add watermark for pro users', async () => {
      const proUser = { ...mockUser, plan: UserPlan.PRO, monthly_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue(proUser);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.script).toBe(mockGeneratedContent.script);
      expect(result.hook).toBe(mockGeneratedContent.hook);
    });

    test('should not add watermark for agency users', async () => {
      const agencyUser = { ...mockUser, plan: UserPlan.AGENCY, monthly_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(agencyUser);
      mockUserRepository.save.mockResolvedValue(agencyUser);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.script).toBe(mockGeneratedContent.script);
      expect(result.hook).toBe(mockGeneratedContent.hook);
    });
  });

  describe('Monthly Count Reset', () => {
    test('should reset monthly count for new month', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const userWithOldMonth = { ...mockUser, plan: UserPlan.STARTER, monthly_count: 5, reset_date: lastMonth };
      mockUserRepository.findOne.mockResolvedValue(userWithOldMonth);
      mockUserRepository.save.mockResolvedValue(userWithOldMonth);
      mockContentGenerator.generateUGCContent.mockResolvedValue(mockGeneratedContent);
      
      // Mock the policy to allow generation and return correct remaining count
      mockPlanLimitPolicy.canUserGenerate.mockReturnValue({
        canGenerate: true,
        remainingGenerations: 49, // 50 - 1 = 49
        limitType: 'monthly',
        resetDate: new Date(),
      });

      await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ 
          monthly_count: 6, // 5 + 1
          reset_date: expect.any(Date)
        })
      );
    });
  });

  describe('Guest Generation', () => {
    test('should generate content for guest users', async () => {
      mockGenerationRepository.count.mockResolvedValue(0); // No recent guest generations
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateGuestContent(
        {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        },
        '127.0.0.1'
      );

      expect(result.is_guest).toBe(true);
      expect(result.upgrade_message).toContain('Start your free trial');
      expect(result.script).toContain('Generated with Hookly');
    });

    test('should enforce guest rate limiting', async () => {
      mockGenerationRepository.count.mockResolvedValue(1); // Already generated within hour

      await expect(
        service.generateGuestContent(
          {
            productName: 'Test Product',
            niche: 'Test',
            targetAudience: 'Test Audience',
          },
          '127.0.0.1'
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Batch Variations', () => {
    test('should generate variations for users with batch feature', async () => {
      const proUser = { 
        ...mockUser, 
        plan: UserPlan.PRO, 
        has_batch_generation: true,
        monthly_count: 0 
      };
      
      const mockVariationsData = {
        variations: [
          { hook: 'Hook 1', script: 'Script 1', visuals: ['Visual 1'] },
          { hook: 'Hook 2', script: 'Script 2', visuals: ['Visual 2'] },
          { hook: 'Hook 3', script: 'Script 3', visuals: ['Visual 3'] },
        ],
        performance: [
          { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 },
          { estimatedViews: 45000, estimatedCTR: 3.9, viralScore: 7.5 },
          { estimatedViews: 55000, estimatedCTR: 4.5, viralScore: 8.2 },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue(proUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockContentGenerator.generateUGCVariations.mockResolvedValue([
        { hook: 'Hook 1', script: 'Script 1', visuals: ['Visual 1'], performance: { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 } },
        { hook: 'Hook 2', script: 'Script 2', visuals: ['Visual 2'], performance: { estimatedViews: 45000, estimatedCTR: 3.9, viralScore: 7.5 } },
        { hook: 'Hook 3', script: 'Script 3', visuals: ['Visual 3'], performance: { estimatedViews: 55000, estimatedCTR: 4.5, viralScore: 8.2 } },
      ]);

      const result = await service.generateVariations('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.variations).toHaveLength(3);
      expect(result.totalGenerated).toBe(3);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ monthly_count: 3 })
      );
    });

    test('should reject variations for users without batch feature', async () => {
      const freeUser = { ...mockUser, has_batch_generation: false };
      mockUserRepository.findOne.mockResolvedValue(freeUser);

      await expect(
        service.generateVariations('user-1', {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    test('should compute remaining generations for Pro after batch generation', async () => {
      const proUser = { 
        ...mockUser, 
        plan: UserPlan.PRO, 
        has_batch_generation: true,
        monthly_count: 98
      };
      
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockContentGenerator.generateUGCVariations.mockResolvedValue([
        { hook: 'Hook 1', script: 'Script 1', visuals: ['Visual 1'], performance: { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 } },
        { hook: 'Hook 2', script: 'Script 2', visuals: ['Visual 2'], performance: { estimatedViews: 45000, estimatedCTR: 3.9, viralScore: 7.5 } },
        { hook: 'Hook 3', script: 'Script 3', visuals: ['Visual 3'], performance: { estimatedViews: 55000, estimatedCTR: 4.5, viralScore: 8.2 } },
      ]);

      const result = await service.generateVariations('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(typeof result.remaining_generations).toBe('number');
      expect(result.remaining_generations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle OpenAI service errors', async () => {
      const trialUser = { ...mockUser, plan: UserPlan.TRIAL, trial_generations_used: 0 };
      mockUserRepository.findOne.mockResolvedValue(trialUser);
      mockUserRepository.save.mockResolvedValue(trialUser);
      mockContentGenerator.generateUGCContent.mockRejectedValue(new Error('API Error'));

      await expect(
        service.generateContent('user-1', {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        })
      ).rejects.toThrow(BadRequestException);
    });

    test('should handle non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateContent('user-1', {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Generation History', () => {
    test('should return paginated generation history', async () => {
      const mockGenerations = [
        { ...mockGeneration, id: 'gen-1' },
        { ...mockGeneration, id: 'gen-2' },
      ];

      mockGenerationRepository.findAndCount.mockResolvedValue([mockGenerations, 2]);

      const result = await service.getUserGenerations('user-1', 1, 10);

      expect(result.generations).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    test('should handle pagination correctly', async () => {
      const mockGenerations = Array(5).fill(null).map((_, i) => ({
        ...mockGeneration,
        id: `gen-${i}`,
      }));

      mockGenerationRepository.findAndCount.mockResolvedValue([mockGenerations, 25]);

      const result = await service.getUserGenerations('user-1', 2, 5);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(5);
    });
  });
});