import DashboardPage from '@/app/dashboard/page';
import { clearAllMocks, fireEvent, mockApiResponses, render, screen, setupFetchMock, waitFor } from '../utils/test-utils';

// Mock AppContext to bypass complex initialization
jest.mock('@/app/lib/AppContext', () => ({
  useApp: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      plan: 'trial',
      monthly_generation_count: 0,
      trial_generations_used: 5,
      trial_started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      trial_ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      has_batch_generation: false,
      has_advanced_analytics: false,
      has_team_features: false,
    },
    userStats: {
      generationsToday: 2,
      generationsThisMonth: 8,
      totalGenerations: 15,
      totalViews: 150000,
      avgCTR: 4.2,
      streak: 3,
      plan: 'trial',
      isTrialUser: true,
      trialGenerationsUsed: 8,
      monthlyLimit: 15,
      remainingThisMonth: 7,
    },
    recentGenerations: [
      {
        id: 'gen-1',
        title: 'Test Generation 1',
        hook: 'Amazing hook 1',
        script: 'Amazing script 1',
        visuals: ['visual1.jpg'],
        niche: 'lifestyle',
        target_audience: 'Young professionals',
        performance_data: {
          views: 50000,
          clicks: 2500,
          conversions: 125,
          ctr: 5.0,
        },
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'gen-2',
        title: 'Test Generation 2',
        hook: 'Amazing hook 2',
        script: 'Amazing script 2',
        visuals: ['visual2.jpg'],
        niche: 'lifestyle',
        target_audience: 'Young professionals',
        performance_data: {
          views: 75000,
          clicks: 3000,
          conversions: 150,
          ctr: 4.0,
        },
        is_favorite: true,
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
    dispatch: jest.fn(),
  }),
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      plan: 'trial',
    },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
  useUserStats: () => ({
    generationsToday: 2,
    generationsThisMonth: 8,
    totalGenerations: 15,
    totalViews: 150000,
    avgCTR: 4.2,
    streak: 3,
    plan: 'trial',
    isTrialUser: true,
    trialGenerationsUsed: 8,
    monthlyLimit: 15,
    remainingThisMonth: 7,
  }),
  useRecentGenerations: () => [
    {
      id: 'gen-1',
      title: 'Test Generation 1',
      hook: 'Amazing hook 1',
      script: 'Amazing script 1',
      visuals: ['visual1.jpg'],
      niche: 'lifestyle',
      target_audience: 'Young professionals',
      performance_data: {
        views: 50000,
        clicks: 2500,
        conversions: 125,
        ctr: 5.0,
      },
      is_favorite: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'gen-2',
      title: 'Test Generation 2',
      hook: 'Amazing hook 2',
      script: 'Amazing script 2',
      visuals: ['visual2.jpg'],
      niche: 'lifestyle',
      target_audience: 'Young professionals',
      performance_data: {
        views: 75000,
        clicks: 3000,
        conversions: 150,
        ctr: 4.0,
      },
      is_favorite: true,
      created_at: new Date().toISOString(),
    },
  ],
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

    it('should be enabled when user has generations', () => {
      // The default mock already has generations, so button should be enabled
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).not.toBeDisabled();
    });


    it('should handle duplicate click correctly', async () => {
      // Test that the duplicate function works with valid generations
      render(<DashboardPage />);
      
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).not.toBeDisabled();
      
      // Click should work without errors (navigation will be mocked by existing router mock)
      fireEvent.click(duplicateButton!);
      
      // Button should remain functional
      expect(duplicateButton).toBeInTheDocument();
    });

    it('should find best performing generation and redirect on successful duplication', async () => {
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
      expect(parsedData.productName).toBe('Test Generation 2'); // Should pick the best performer (highest views)
      expect(parsedData.hook).toBe('Amazing hook 2');
      expect(parsedData.script).toBe('Amazing script 2');
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
      
      // Test Duplicate (should be enabled with generations from default mock)
      const duplicateButton = screen.getByText('Duplicate').closest('button');
      expect(duplicateButton).not.toBeDisabled(); // Should be enabled since we have generations
      
      // Click duplicate button
      fireEvent.click(duplicateButton!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/generate?mode=duplicate');
      });
    });
  });
});
