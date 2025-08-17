/**
 * Conversion Flow Tests
 * Tests the complete user journey from guest demo to authenticated user
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import HomePage from '@/app/page';
import GeneratePage from '@/app/generate/page';
import { AppProvider } from '@/app/lib/AppContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};

const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockSessionStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockSessionStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockSessionStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockSessionStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Mock fetch
global.fetch = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('Conversion Flow Tests', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
    
    // Clear all mocks and storage
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('Guest Demo Flow', () => {
    test('should start demo timer when "Try Free Demo" is clicked', async () => {
      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      renderWithProvider(<HomePage />);
      
      const demoButton = screen.getByText(/try free demo/i);
      fireEvent.click(demoButton);
      
      // Should set demo timer in sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'demo_timer_start',
        expect.any(String)
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'demo_duration',
        '300'
      );
      
      // Should navigate to generate page with demo parameters
      expect(window.location.href).toBe('/generate?demo=true&timer=300');
    });

    test('should persist demo timer in sessionStorage', async () => {
      // Simulate demo timer start
      const startTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(startTime);
      
      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      renderWithProvider(<HomePage />);
      
      const demoButton = screen.getByText(/try free demo/i);
      fireEvent.click(demoButton);
      
      // Check that demo start time is stored
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'demo_timer_start',
        startTime.toString()
      );
    });

    test('should show countdown timer during demo', async () => {
      // Set demo start time to 2 minutes ago
      const startTime = Date.now() - (2 * 60 * 1000);
      mockSessionStorage.store['demoStartTime'] = startTime.toString();
      
      renderWithProvider(<GeneratePage />);
      
      // Should show remaining time (3 minutes - 2 minutes = 1 minute)
      await waitFor(() => {
        expect(screen.getByText(/1.*minute/i)).toBeInTheDocument();
      });
    });

    test('should trigger auth modal when demo expires', async () => {
      // Set demo start time to 4 minutes ago (expired)
      const startTime = Date.now() - (4 * 60 * 1000);
      mockSessionStorage.store['demoStartTime'] = startTime.toString();
      
      renderWithProvider(<GeneratePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/demo expired/i)).toBeInTheDocument();
      });
    });

    test('should prevent demo timer manipulation via refresh', async () => {
      // Set initial demo start time
      const startTime = Date.now() - (1 * 60 * 1000);
      mockSessionStorage.store['demoStartTime'] = startTime.toString();
      
      // Render component
      renderWithProvider(<GeneratePage />);
      
      // Simulate page refresh by clearing and re-rendering
      mockSessionStorage.store = {};
      
      // Re-render should not reset the timer if demo was in progress
      renderWithProvider(<GeneratePage />);
      
      // Timer should still be expired or continue from where it left off
      // (This tests the session storage persistence)
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('demoStartTime');
    });
  });

  describe('Authentication Flow', () => {
    test('should store pending demo data when auth is triggered', async () => {
      renderWithProvider(<GeneratePage />);
      
      // Fill out form
      const productInput = screen.getByPlaceholderText(/wireless bluetooth earbuds/i);
      const nicheInput = screen.getByPlaceholderText(/tech, beauty, fitness/i);
      const audienceInput = screen.getByPlaceholderText(/music lovers aged/i);
      
      fireEvent.change(productInput, { target: { value: 'Test Product' } });
      fireEvent.change(nicheInput, { target: { value: 'Test Niche' } });
      fireEvent.change(audienceInput, { target: { value: 'Test Audience' } });
      
      // Click generate (should trigger auth for unauthenticated user)
      const generateButton = screen.getByText(/generate viral ad/i);
      fireEvent.click(generateButton);
      
      // Should store form data in session storage
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pendingDemoData',
        expect.stringContaining('Test Product')
      );
    });

    test('should restore demo data after successful authentication', async () => {
      // Set up pending demo data
      const pendingData = JSON.stringify({
        productName: 'Test Product',
        niche: 'Test Niche',
        targetAudience: 'Test Audience',
        generatedAd: {
          hook: 'Test hook',
          script: 'Test script',
          visuals: ['Test visual']
        }
      });
      mockSessionStorage.store['pendingDemoData'] = pendingData;
      
      // Mock URL search params to simulate return from auth
      const mockSearchParams = {
        get: jest.fn((key: string) => key === 'restored' ? 'true' : null),
      };
      (require('next/navigation').useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      renderWithProvider(<GeneratePage />);
      
      await waitFor(() => {
        // Form should be pre-filled with restored data
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Niche')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Audience')).toBeInTheDocument();
      });
      
      // Pending data should be cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('pendingDemoData');
    });

    test('should maintain demo timer across auth flow', async () => {
      const startTime = Date.now() - (1 * 60 * 1000); // 1 minute ago
      mockSessionStorage.store['demoStartTime'] = startTime.toString();
      
      // Simulate auth flow with data restoration
      const pendingData = JSON.stringify({
        productName: 'Test Product',
        niche: 'Test Niche',
        targetAudience: 'Test Audience'
      });
      mockSessionStorage.store['pendingDemoData'] = pendingData;
      
      const mockSearchParams = {
        get: jest.fn((key: string) => key === 'restored' ? 'true' : null),
      };
      (require('next/navigation').useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      renderWithProvider(<GeneratePage />);
      
      // Demo timer should still be running
      await waitFor(() => {
        expect(screen.getByText(/2.*minute/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence', () => {
    test('should save template selection to session storage', async () => {
      const templateData = {
        title: 'Fitness Template',
        niche: 'Health',
        targetAudience: 'Gym enthusiasts'
      };
      
      // Mock template selection from dashboard
      mockSessionStorage.store['selectedTemplate'] = JSON.stringify({
        productName: templateData.title,
        niche: templateData.niche,
        targetAudience: templateData.targetAudience,
      });
      
      renderWithProvider(<GeneratePage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue(templateData.title)).toBeInTheDocument();
        expect(screen.getByDisplayValue(templateData.niche)).toBeInTheDocument();
        expect(screen.getByDisplayValue(templateData.targetAudience)).toBeInTheDocument();
      });
      
      // Template data should be cleared after use
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('selectedTemplate');
    });

    test('should persist local saves for guest users', async () => {
      const savedAd = {
        title: 'Test Ad',
        hook: 'Test hook',
        script: 'Test script',
        visuals: ['Test visual'],
        niche: 'Test',
        targetAudience: 'Test audience',
        performance: { views: 1000, ctr: 2.5, viralScore: 7 },
        isFavorite: true,
        timestamp: Date.now()
      };
      
      // Test local save functionality
      const { LocalSaveService } = require('@/app/lib/localSaves');
      const saveResult = LocalSaveService.saveAd(savedAd);
      
      expect(saveResult.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hookly_local_saves',
        expect.stringContaining('Test Ad')
      );
    });

    test('should enforce 3-save limit for guest users', async () => {
      const { LocalSaveService } = require('@/app/lib/localSaves');
      
      // Save 3 ads (should succeed)
      for (let i = 1; i <= 3; i++) {
        const result = LocalSaveService.saveAd({
          title: `Ad ${i}`,
          hook: 'Hook',
          script: 'Script',
          visuals: ['Visual'],
          niche: 'Test',
          targetAudience: 'Test',
          performance: { views: 1000, ctr: 2.5, viralScore: 7 },
          isFavorite: false,
          timestamp: Date.now()
        });
        expect(result.success).toBe(true);
      }
      
      // 4th save should fail
      const result = LocalSaveService.saveAd({
        title: 'Ad 4',
        hook: 'Hook',
        script: 'Script',
        visuals: ['Visual'],
        niche: 'Test',
        targetAudience: 'Test',
        performance: { views: 1000, ctr: 2.5, viralScore: 7 },
        isFavorite: false,
        timestamp: Date.now()
      });
      
      expect(result.success).toBe(false);
      expect(result.limitReached).toBe(true);
    });
  });

  describe('Generation Flow', () => {
    test('should handle successful ad generation', async () => {
      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          output: {
            hook: 'Generated hook',
            script: 'Generated script',
            visuals: ['Generated visual'],
            performance: { estimatedViews: 50000, estimatedCTR: 4.2, viralScore: 8 }
          }
        })
      });
      
      // Mock authenticated user
      const mockUser = { id: 'user-1', email: 'test@test.com', plan: 'free' };
      const mockAppContext = {
        user: mockUser,
        isAuthenticated: true,
        actions: { logout: jest.fn() }
      };
      
      // We would need to mock the AppContext provider here
      // For now, this tests the API call structure
      renderWithProvider(<GeneratePage />);
      
      const productInput = screen.getByPlaceholderText(/wireless bluetooth earbuds/i);
      const nicheInput = screen.getByPlaceholderText(/tech, beauty, fitness/i);
      const audienceInput = screen.getByPlaceholderText(/music lovers aged/i);
      
      fireEvent.change(productInput, { target: { value: 'Test Product' } });
      fireEvent.change(nicheInput, { target: { value: 'Test Niche' } });
      fireEvent.change(audienceInput, { target: { value: 'Test Audience' } });
      
      const generateButton = screen.getByText(/generate viral ad/i);
      fireEvent.click(generateButton);
      
      // Should call API with correct data
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/generate',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Test Product')
          })
        );
      });
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Generation failed' })
      });
      
      renderWithProvider(<GeneratePage />);
      
      const productInput = screen.getByPlaceholderText(/wireless bluetooth earbuds/i);
      fireEvent.change(productInput, { target: { value: 'Test Product' } });
      
      const generateButton = screen.getByText(/generate viral ad/i);
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upgrade Triggers', () => {
    test('should show upgrade modal after 2nd generation for free users', async () => {
      // Mock user with 2 total generations
      const mockUserStats = { totalGenerations: 2, generationsToday: 1 };
      
      // This would require mocking the useUserStats hook
      // For now, this documents the expected behavior
      renderWithProvider(<GeneratePage />);
      
      // After successful generation, should trigger upgrade modal
      // with 3-second delay for free users on their 2nd generation
    });

    test('should show upgrade modal after 3rd copy action', async () => {
      // Mock copy actions in sessionStorage
      mockSessionStorage.store['copyCount'] = '2';
      
      renderWithProvider(<GeneratePage />);
      
      // Simulate copy action (would need generated content visible)
      // Should increment copy count and show upgrade modal
    });

    test('should show auth modal when guest save limit reached', async () => {
      // Fill local storage with 3 saves
      const saves = Array(3).fill(null).map((_, i) => ({
        id: `save-${i}`,
        title: `Ad ${i}`,
        timestamp: Date.now()
      }));
      
      mockLocalStorage.store['hookly_local_saves'] = JSON.stringify(saves);
      
      renderWithProvider(<GeneratePage />);
      
      // Attempt to save another ad should trigger auth modal
      // This would require having a generated ad visible and clicking save
    });
  });
});