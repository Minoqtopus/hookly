import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MultiProviderAIService } from './multi-provider-ai.service';

describe('MultiProviderAIService', () => {
  let service: MultiProviderAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiProviderAIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Mock configuration for testing
              const config = {
                'GEMINI_API_KEY': 'test-gemini-key',
                'GROQ_API_KEY': 'test-groq-key',
                'OPENAI_API_KEY': 'test-openai-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MultiProviderAIService>(MultiProviderAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have providers available', async () => {
    const isAvailable = await service.isAvailable();
    expect(isAvailable).toBe(true);
  });

  it('should return correct capabilities', () => {
    const capabilities = service.getCapabilities();
    expect(capabilities.fallbackProviders).toBe(3);
    expect(capabilities.costOptimized).toBe(true);
  });

  it('should provide health status', async () => {
    const health = await service.getProviderHealth();
    expect(health.status).toBeDefined();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
  });
});