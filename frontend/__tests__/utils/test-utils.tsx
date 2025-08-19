import { AppProvider } from '@/app/lib/AppContext';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Test data factories (define first to avoid circular references)
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  plan: 'trial' as const,
  monthly_generation_count: 0,
  trial_generations_used: 5,
  trial_started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  trial_ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  has_batch_generation: false,
  has_advanced_analytics: false,
  has_team_features: false,
  ...overrides,
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  store: {
    user: JSON.stringify(createMockUser()),
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  } as Record<string, string>,
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

// Mock fetch globally
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <AppProvider>
        {children}
      </AppProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories (duplicate removed - defined at top)

export const createMockGeneration = (overrides = {}) => ({
  id: 'test-generation-id',
  title: 'Test Ad Generation',
  hook: 'This amazing product will change your life!',
  script: 'Are you tired of the same old solutions?',
  visuals: ['visual1.jpg', 'visual2.jpg'],
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
  ...overrides,
});

export const createMockUserStats = (overrides = {}) => ({
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
  ...overrides,
});

// Mock API responses
export const mockApiResponses = {
  getUserStats: createMockUserStats(),
  getUserGenerations: {
    generations: [createMockGeneration()],
    total: 1,
    pagination: {
      limit: 10,
      offset: 0,
      hasMore: false,
      totalPages: 1,
    },
  },
  generateAd: {
    id: 'new-generation-id',
    hook: 'New amazing hook!',
    script: 'New amazing script!',
    visuals: ['new-visual1.jpg'],
    performance: {
      estimatedViews: 75000,
      estimatedCTR: 4.8,
      viralScore: 8.5,
    },
    created_at: new Date().toISOString(),
    remaining_generations: 7,
    trial_days_left: 4,
  },
};

// Helper to setup fetch mocks
export const setupFetchMock = (endpoint: string, response: any, status = 200) => {
  (global.fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  );
};

// Helper to clear all mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  (global.fetch as jest.Mock).mockClear();
};

// Helper to setup authenticated user
export const setupAuthenticatedUser = (user = createMockUser()) => {
  mockLocalStorage.setItem('user', JSON.stringify(user));
  mockLocalStorage.setItem('access_token', 'mock-access-token');
  mockLocalStorage.setItem('refresh_token', 'mock-refresh-token');
};

// Helper to setup unauthenticated user
export const setupUnauthenticatedUser = () => {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
};
