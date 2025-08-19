import React from 'react';

// Simple mock for AppContext that bypasses complex initialization
export const createSimpleAuthMock = () => {
  // Mock the entire AppContext module
  jest.doMock('@/app/lib/AppContext', () => ({
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
};

// Helper to setup simple auth mock
export const setupSimpleAuthMock = () => {
  createSimpleAuthMock();
  
  // Mock localStorage to return user data
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => {
        if (key === 'user') return JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          plan: 'trial',
        });
        if (key === 'access_token') return 'mock-access-token';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
  
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
  
  // Mock fetch for API calls
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
};

// Helper to clear simple auth mock
export const clearSimpleAuthMock = () => {
  jest.resetModules();
  jest.clearAllMocks();
};
