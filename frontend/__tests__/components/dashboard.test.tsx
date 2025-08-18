import DashboardPage from '@/app/dashboard/page';
import { clearAllMocks, fireEvent, mockApiResponses, render, screen, setupAuthenticatedUser, setupFetchMock, waitFor } from '../utils/test-utils';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the generate page route
jest.mock('@/app/components/TemplateLibrary', () => {
  return function MockTemplateLibrary() {
    return <div data-testid="template-library">Template Library</div>;
  };
});

jest.mock('@/app/components/TrialCountdown', () => {
  return function MockTrialCountdown() {
    return <div data-testid="trial-countdown">Trial Countdown</div>;
  };
});

jest.mock('@/app/components/UpgradeModal', () => {
  return function MockUpgradeModal({ showUpgradeModal, setShowUpgradeModal }: any) {
    if (!showUpgradeModal) return null;
    return (
      <div data-testid="upgrade-modal">
        <button onClick={() => setShowUpgradeModal(false)}>Close Modal</button>
      </div>
    );
  };
});

describe('Dashboard Quick Actions', () => {
  beforeEach(() => {
    clearAllMocks();
    setupAuthenticatedUser();
    mockPush.mockClear();
  });

  describe('Quick AI Button', () => {
    it('should render Quick AI button with correct text', () => {
      render(<DashboardPage />);
      
      const quickAIButton = screen.getByText('Quick AI');
      expect(quickAIButton).toBeInTheDocument();
      expect(quickAIButton.closest('button')).toHaveTextContent('One-click magic');
    });

    it('should show loading state when Quick AI is clicked', async () => {
      // Mock the API call to take some time
      setupFetchMock('/generate', mockApiResponses.generateAd);
      
      render(<DashboardPage />);
      
      const quickAIButton = screen.getByText('Quick AI').closest('button');
      fireEvent.click(quickAIButton!);
      
      // Should show loading state
      expect(screen.getByText('Generating...')).toBeInTheDocument();
      expect(screen.getByText('One-click magic')).toBeInTheDocument();
      
      // Button should be disabled
      expect(quickAIButton).toBeDisabled();
    });

    it('should call API and redirect on successful Quick AI generation', async () => {
      setupFetchMock('/generate', mockApiResponses.generateAd);
      
      render(<DashboardPage />);
      
      const quickAIButton = screen.getByText('Quick AI').closest('button');
      fireEvent.click(quickAIButton!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/generate?mode=quick');
      });
      
      // Check that result was stored in sessionStorage
      const storedResult = sessionStorage.getItem('quickAIResult');
      expect(storedResult).toBeTruthy();
      
      const parsedResult = JSON.parse(storedResult!);
      expect(parsedResult).toEqual(mockApiResponses.generateAd);
    });

    it('should handle Quick AI API errors gracefully', async () => {
      // Mock API error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      render(<DashboardPage />);
      
      const quickAIButton = screen.getByText('Quick AI').closest('button');
      fireEvent.click(quickAIButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Quick AI')).toBeInTheDocument(); // Button text back to normal
      });
      
      // Should not redirect on error
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate Button', () => {
    it('should render Duplicate button with correct text', () => {
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate');
      expect(duplicateButton).toBeInTheDocument();
      expect(duplicateButton.closest('button')).toHaveTextContent('Best performer');
    });

    it('should be disabled when user has no generations', () => {
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).toBeDisabled();
    });

    it('should be enabled when user has generations', () => {
      // Mock user with generations
      const mockUserWithGenerations = {
        ...mockApiResponses.getUserGenerations.generations[0],
        id: 'gen-1',
        performance_data: { views: 1000, ctr: 5.0 },
      };
      
      // Mock the AppContext to return generations
      jest.doMock('@/app/lib/AppContext', () => ({
        useApp: () => ({
          actions: {
            logout: jest.fn(),
            toggleFavorite: jest.fn(),
            deleteGeneration: jest.fn(),
            clearError: jest.fn(),
          },
        }),
        useAuth: () => ({
          user: { plan: 'trial' },
          isAuthenticated: true,
          isLoading: false,
        }),
        useUserStats: () => mockApiResponses.getUserStats,
        useRecentGenerations: () => [mockUserWithGenerations],
      }));
      
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).not.toBeDisabled();
    });

    it('should show loading state when Duplicate is clicked', async () => {
      // Mock user with generations
      const mockUserWithGenerations = {
        ...mockApiResponses.getUserGenerations.generations[0],
        id: 'gen-1',
        performance_data: { views: 1000, ctr: 5.0 },
      };
      
      // Mock the AppContext to return generations
      jest.doMock('@/app/lib/AppContext', () => ({
        useApp: () => ({
          actions: {
            logout: jest.fn(),
            toggleFavorite: jest.fn(),
            deleteGeneration: jest.fn(),
            clearError: jest.fn(),
          },
        }),
        useAuth: () => ({
          user: { plan: 'trial' },
          isAuthenticated: true,
          isLoading: false,
        }),
        useUserStats: () => mockApiResponses.getUserStats,
        useRecentGenerations: () => [mockUserWithGenerations],
      }));
      
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      fireEvent.click(duplicateButton!);
      
      // Should show loading state
      expect(screen.getByText('Duplicating...')).toBeInTheDocument();
      expect(screen.getByText('Best performer')).toBeInTheDocument();
      
      // Button should be disabled
      expect(duplicateButton).toBeDisabled();
    });

    it('should find best performing generation and redirect on successful duplication', async () => {
      // Mock user with multiple generations
      const mockGenerations = [
        {
          id: 'gen-1',
          title: 'Low Performer',
          performance_data: { views: 100, ctr: 2.0 },
          niche: 'lifestyle',
          target_audience: 'Young professionals',
          hook: 'Basic hook',
          script: 'Basic script',
        },
        {
          id: 'gen-2',
          title: 'High Performer',
          performance_data: { views: 10000, ctr: 8.0 },
          niche: 'lifestyle',
          target_audience: 'Young professionals',
          hook: 'Amazing hook',
          script: 'Amazing script',
        },
      ];
      
      // Mock the AppContext to return generations
      jest.doMock('@/app/lib/AppContext', () => ({
        useApp: () => ({
          actions: {
            logout: jest.fn(),
            toggleFavorite: jest.fn(),
            deleteGeneration: jest.fn(),
            clearError: jest.fn(),
          },
        }),
        useAuth: () => ({
          user: { plan: 'trial' },
          isAuthenticated: true,
          isLoading: false,
        }),
        useUserStats: () => mockApiResponses.getUserStats,
        useRecentGenerations: () => mockGenerations,
      }));
      
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      fireEvent.click(duplicateButton!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/generate?mode=duplicate');
      });
      
      // Check that best generation data was stored in sessionStorage
      const storedData = sessionStorage.getItem('duplicateData');
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.title).toBe('High Performer'); // Should pick the best performer
      expect(parsedData.hook).toBe('Amazing hook');
      expect(parsedData.script).toBe('Amazing script');
    });
  });

  describe('Integration', () => {
    it('should handle both Quick AI and Duplicate buttons independently', async () => {
      setupFetchMock('/generate', mockApiResponses.generateAd);
      
      render(<DashboardPage />);
      
      // Test Quick AI
      const quickAIButton = screen.getByText('Quick AI').closest('button');
      fireEvent.click(quickAIButton!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/generate?mode=quick');
      });
      
      // Reset mock
      mockPush.mockClear();
      
      // Test Duplicate (should be disabled without generations)
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).toBeDisabled();
      
      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
