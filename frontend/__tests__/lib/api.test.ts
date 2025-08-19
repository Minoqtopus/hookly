import { ApiClient, ApiErrorClass } from '@/app/lib/api';
import { clearAllMocks, mockApiResponses, setupFetchMock } from '../utils/test-utils';

describe('ApiClient', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('generateAd', () => {
    it('should generate ad content successfully', async () => {
      const mockData = {
        productName: 'Test Product',
        niche: 'lifestyle',
        targetAudience: 'Young professionals',
      };

      setupFetchMock('/generate', mockApiResponses.generateAd);

      const result = await ApiClient.generateAd(mockData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
        })
      );

      expect(result).toEqual(mockApiResponses.generateAd);
    });

    it('should handle network errors gracefully', async () => {
      const mockData = {
        productName: 'Test Product',
        niche: 'lifestyle',
        targetAudience: 'Young professionals',
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiClient.generateAd(mockData)).rejects.toThrow('Network error');
    });

    it('should handle API errors with proper error details', async () => {
      const mockData = {
        productName: 'Test Product',
        niche: 'lifestyle',
        targetAudience: 'Young professionals',
      };

      const errorResponse = {
        message: 'Rate limit exceeded',
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(ApiClient.generateAd(mockData)).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('generateGuestAd', () => {
    it('should generate guest ad content successfully', async () => {
      const mockData = {
        productName: 'Test Product',
        niche: 'lifestyle',
        targetAudience: 'Young professionals',
      };

      setupFetchMock('/generate/guest', mockApiResponses.generateAd);

      const result = await ApiClient.generateGuestAd(mockData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate/guest'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
        })
      );

      expect(result).toEqual(mockApiResponses.generateAd);
    });
  });

  describe('getUserGenerations', () => {
    it('should fetch user generations with pagination', async () => {
      setupFetchMock('/user/generations?limit=10&offset=0', mockApiResponses.getUserGenerations);

      const result = await ApiClient.getUserGenerations(10, 0);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/generations?limit=10&offset=0'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockApiResponses.getUserGenerations);
    });

    it('should use default pagination values', async () => {
      setupFetchMock('/user/generations?limit=10&offset=0', mockApiResponses.getUserGenerations);

      await ApiClient.getUserGenerations();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/generations?limit=10&offset=0'),
        expect.any(Object)
      );
    });
  });

  describe('getUserStats', () => {
    it('should fetch user stats successfully', async () => {
      setupFetchMock('/user/stats', mockApiResponses.getUserStats);

      const result = await ApiClient.getUserStats();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/stats'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockApiResponses.getUserStats);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle generation favorite status', async () => {
      const generationId = 'test-generation-id';
      const mockResponse = { is_favorite: true };

      setupFetchMock(`/generate/${generationId}/favorite`, mockResponse);

      const result = await ApiClient.toggleFavorite(generationId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/generate/${generationId}/favorite`),
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteGeneration', () => {
    it('should delete generation successfully', async () => {
      const generationId = 'test-generation-id';

      setupFetchMock(`/generate/${generationId}`, {}, 204);

      await ApiClient.deleteGeneration(generationId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/generate/${generationId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('upgradeToStarter', () => {
    it('should upgrade user to starter plan', async () => {
      const checkoutData = {
        plan: 'monthly',
        user_id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockResponse = { checkout_url: 'https://checkout.example.com' };
      setupFetchMock('/user/upgrade/starter', mockResponse);

      const result = await ApiClient.upgradeToStarter(checkoutData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/upgrade/starter'),
        expect.objectContaining({
          method: 'POST',
          body: checkoutData,
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('upgradeToPro', () => {
    it('should upgrade user to pro plan', async () => {
      const checkoutData = {
        plan: 'monthly',
        user_id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockResponse = { checkout_url: 'https://checkout.example.com' };
      setupFetchMock('/user/upgrade/pro', mockResponse);

      const result = await ApiClient.upgradeToPro(checkoutData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/upgrade/pro'),
        expect.objectContaining({
          method: 'POST',
          body: checkoutData,
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('upgradeToAgency', () => {
    it('should upgrade user to agency plan', async () => {
      const checkoutData = {
        plan: 'monthly',
        user_id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockResponse = { checkout_url: 'https://checkout.example.com' };
      setupFetchMock('/user/upgrade/agency', mockResponse);

      const result = await ApiClient.upgradeToAgency(checkoutData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/upgrade/agency'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(checkoutData),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel user subscription', async () => {
      setupFetchMock('/user/cancel-subscription', {}, 200);

      await ApiClient.cancelSubscription();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/cancel-subscription'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('getTemplates', () => {
    it('should fetch templates with filters', async () => {
      const mockResponse = {
        templates: [],
        total: 0,
        pagination: {
          limit: 20,
          offset: 0,
          totalPages: 0,
        },
      };

      setupFetchMock('/templates?limit=20&offset=0', mockResponse);

      const result = await ApiClient.getTemplates({
        limit: 20,
        offset: 0,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/templates?limit=20'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle empty filters', async () => {
      const mockResponse = {
        templates: [],
        total: 0,
        pagination: {
          limit: 50,
          offset: 0,
          totalPages: 0,
        },
      };

      setupFetchMock('/templates', mockResponse);

      const result = await ApiClient.getTemplates();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/templates'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPopularTemplates', () => {
    it('should fetch popular templates', async () => {
      const mockResponse: any[] = [];
      setupFetchMock('/templates/popular?limit=10', mockResponse);

      const result = await ApiClient.getPopularTemplates(10);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/templates/popular?limit=10'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTemplateCategories', () => {
    it('should fetch template categories', async () => {
      const mockResponse = [];
      setupFetchMock('/templates/categories', mockResponse);

      const result = await ApiClient.getTemplateCategories();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/templates/categories'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTemplate', () => {
    it('should fetch specific template', async () => {
      const templateId = 'test-template-id';
      const mockResponse = { id: templateId, title: 'Test Template' };

      setupFetchMock(`/templates/${templateId}`, mockResponse);

      const result = await ApiClient.getTemplate(templateId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/templates/${templateId}`),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('trackTemplateUsage', () => {
    it('should track template usage', async () => {
      const templateId = 'test-template-id';
      const mockResponse = { success: true, message: 'Usage tracked' };

      setupFetchMock(`/templates/${templateId}/use`, mockResponse);

      const result = await ApiClient.trackTemplateUsage(templateId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/templates/${templateId}/use`),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});

describe('ApiErrorClass', () => {
  it('should create error with proper details', () => {
    const errorDetails = {
      message: 'Test error message',
      status: 400,
      code: 'VALIDATION_ERROR',
    };

    const error = new ApiErrorClass(errorDetails);

    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('ApiError');
    expect(error.details).toEqual(errorDetails);
  });
});
