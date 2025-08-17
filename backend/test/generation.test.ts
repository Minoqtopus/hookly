import { Test, TestingModule } from '@nestjs/testing';
import { GenerationService } from '../src/generation/generation.service';
import { GenerationController } from '../src/generation/generation.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserPlan } from '../src/entities/user.entity';
import { Generation } from '../src/entities/generation.entity';
import { OpenAIService } from '../src/openai/openai.service';
import { Repository } from 'typeorm';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('GenerationService', () => {
  let service: GenerationService;
  let userRepository: Repository<User>;
  let generationRepository: Repository<Generation>;
  let openaiService: OpenAIService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    plan: UserPlan.FREE,
    daily_count: 0,
    reset_date: new Date(),
    has_batch_generation: false,
  };

  const mockGeneration = {
    id: 'gen-1',
    user_id: 'user-1',
    output: {
      hook: 'Test hook',
      script: 'Test script',
      visuals: ['Test visual'],
      performance: { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 },
    },
    created_at: new Date(),
  };

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

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<GenerationService>(GenerationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    generationRepository = module.get<Repository<Generation>>(getRepositoryToken(Generation));
    openaiService = module.get<OpenAIService>(OpenAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plan-Based Limits', () => {
    test('should allow generation for free user within limit', async () => {
      const freeUser = { ...mockUser, daily_count: 2 }; // 2 out of 3 daily limit
      mockUserRepository.findOne.mockResolvedValue(freeUser);
      mockUserRepository.save.mockResolvedValue(freeUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBe(0); // 3 - (2 + 1) = 0
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ daily_count: 3 })
      );
    });

    test('should reject generation for free user over limit', async () => {
      const freeUser = { ...mockUser, daily_count: 3 }; // Already at limit
      mockUserRepository.findOne.mockResolvedValue(freeUser);

      await expect(
        service.generateContent('user-1', {
          productName: 'Test Product',
          niche: 'Test',
          targetAudience: 'Test Audience',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    test('should allow unlimited generation for pro user', async () => {
      const proUser = { ...mockUser, plan: UserPlan.PRO, daily_count: 100 };
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue(proUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBeNull(); // Unlimited
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ daily_count: 101 })
      );
    });

    test('should handle starter user monthly limit', async () => {
      const starterUser = { ...mockUser, plan: UserPlan.STARTER, daily_count: 49 };
      mockUserRepository.findOne.mockResolvedValue(starterUser);
      mockUserRepository.save.mockResolvedValue(starterUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.remaining_generations).toBe(0); // 50 - (49 + 1) = 0
    });
  });

  describe('Watermark Application', () => {
    test('should add watermark for free users', async () => {
      const freeUser = { ...mockUser, daily_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(freeUser);
      mockUserRepository.save.mockResolvedValue(freeUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.output.script).toContain('AI UGC Ad Generator (Free Plan)');
      expect(result.output.hook).toContain('[Generated with AI UGC Ad Generator]');
    });

    test('should add watermark for starter users', async () => {
      const starterUser = { ...mockUser, plan: UserPlan.STARTER, daily_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(starterUser);
      mockUserRepository.save.mockResolvedValue(starterUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.output.script).toContain('AI UGC Ad Generator (Starter Plan)');
      expect(result.output.hook).toContain('[AI UGC Ad Generator]');
    });

    test('should not add watermark for pro users', async () => {
      const proUser = { ...mockUser, plan: UserPlan.PRO, daily_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(proUser);
      mockUserRepository.save.mockResolvedValue(proUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.output.script).toBe(mockGeneratedContent.script);
      expect(result.output.hook).toBe(mockGeneratedContent.hook);
    });

    test('should not add watermark for agency users', async () => {
      const agencyUser = { ...mockUser, plan: UserPlan.AGENCY, daily_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(agencyUser);
      mockUserRepository.save.mockResolvedValue(agencyUser);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      const result = await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.output.script).toBe(mockGeneratedContent.script);
      expect(result.output.hook).toBe(mockGeneratedContent.hook);
    });
  });

  describe('Daily Count Reset', () => {
    test('should reset daily count for new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const userWithOldDate = { ...mockUser, daily_count: 5, reset_date: yesterday };
      mockUserRepository.findOne.mockResolvedValue(userWithOldDate);
      mockUserRepository.save.mockResolvedValue(userWithOldDate);
      mockGenerationRepository.create.mockReturnValue(mockGeneration);
      mockGenerationRepository.save.mockResolvedValue(mockGeneration);
      mockOpenAIService.generateUGCContent.mockResolvedValue(mockGeneratedContent);

      await service.generateContent('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      // Should save the user with updated daily count and reset date
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ 
          daily_count: 1,
          reset_date: expect.any(Date)
        })
      );
    });
  });

  describe('Guest Generation', () => {
    test('should generate content for guest users', async () => {
      mockGenerationRepository.count.mockResolvedValue(0); // No recent guest generations
      mockGenerationRepository.create.mockReturnValue({
        ...mockGeneration,
        user_id: null,
        is_guest_generation: true,
      });
      mockGenerationRepository.save.mockResolvedValue({
        ...mockGeneration,
        user_id: null,
        is_guest_generation: true,
      });
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
      expect(result.upgrade_message).toContain('Sign up');
      expect(result.output.script).toContain('Sign up for unlimited generations');
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
        daily_count: 0 
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
      mockOpenAIService.generateUGCVariations.mockResolvedValue(mockVariationsData);

      const result = await service.generateVariations('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      expect(result.variations).toHaveLength(3);
      expect(result.totalGenerated).toBe(3);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ daily_count: 3 })
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

    test('should check limits for batch generation', async () => {
      const proUser = { 
        ...mockUser, 
        plan: UserPlan.PRO, 
        has_batch_generation: true,
        daily_count: 98 // Close to hypothetical limit
      };
      
      mockUserRepository.findOne.mockResolvedValue(proUser);

      // This should work for Pro (unlimited), but test the limit checking logic
      const result = await service.generateVariations('user-1', {
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });

      // Pro users should have null remaining_generations (unlimited)
      expect(result.remaining_generations).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle OpenAI service errors', async () => {
      const freeUser = { ...mockUser, daily_count: 0 };
      mockUserRepository.findOne.mockResolvedValue(freeUser);
      mockUserRepository.save.mockResolvedValue(freeUser);
      mockOpenAIService.generateUGCContent.mockRejectedValue(new Error('API Error'));

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