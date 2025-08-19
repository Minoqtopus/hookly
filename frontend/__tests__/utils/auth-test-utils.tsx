import { act } from '@testing-library/react';
import { createMockUser } from './test-utils';

// Mock JWT token utilities
export const createMockJWT = (payload: any, expiresIn: number = 3600) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const tokenPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  
  // Simple base64 encoding for test purposes
  const encode = (obj: any) => btoa(JSON.stringify(obj));
  
  return `${encode(header)}.${encode(tokenPayload)}.mock-signature`;
};

// createMockUser is now imported from test-utils

// Mock authentication state
export const setupAuthenticatedTestState = (user = createMockUser()) => {
  const accessToken = createMockJWT({ userId: user.id, email: user.email });
  const refreshToken = createMockJWT({ userId: user.id, type: 'refresh' }, 86400);
  
  // Setup localStorage
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Setup sessionStorage
  sessionStorage.setItem('user', JSON.stringify(user));
  
  return { user, accessToken, refreshToken };
};

export const setupUnauthenticatedTestState = () => {
  localStorage.clear();
  sessionStorage.clear();
};

// Mock fetch for authentication endpoints
export const mockAuthEndpoints = () => {
  // Mock /auth/refresh endpoint
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/auth/refresh')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          access_token: createMockJWT({ userId: 'test-user-id', email: 'test@example.com' }),
          refresh_token: createMockJWT({ userId: 'test-user-id', type: 'refresh' }, 86400),
        }),
      });
    }
    
    if (url.includes('/auth/me')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(createMockUser()),
      });
    }
    
    // Default mock for other endpoints
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  }) as jest.Mock;
};

// Helper to wait for AppContext to initialize
export const waitForAppContextInitialization = async (timeout = 5000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      // Check if user data is loaded
      const userElement = document.querySelector('[data-testid="user-info"]') || 
                         document.querySelector('[data-testid="dashboard-content"]');
      
      if (userElement) {
        return true;
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Continue waiting
    }
  }
  
  throw new Error('AppContext failed to initialize within timeout');
};

// Helper to render components with proper authentication context
export const renderWithAuth = async (
  Component: React.ComponentType<any>,
  props: any = {},
  user = createMockUser()
) => {
  // Setup authentication state
  setupAuthenticatedTestState(user);
  
  // Mock auth endpoints
  mockAuthEndpoints();
  
  // Import render from test-utils (which includes AppProvider)
  const { render } = await import('./test-utils');
  
  // Render with act to handle async initialization
  let result: any;
  await act(async () => {
    result = render(<Component {...props} />);
  });
  
  // Wait for AppContext to initialize
  try {
    await waitForAppContextInitialization();
  } catch (error) {
    console.warn('AppContext initialization timeout - tests may be unstable');
  }
  
  return result;
};

// Helper to test authentication flows
export const testAuthenticationFlow = async (
  Component: React.ComponentType<any>,
  testCallback: (utils: any) => Promise<void>
) => {
  // Test unauthenticated state
  setupUnauthenticatedTestState();
  const { render } = await import('./test-utils');
  
  let result = render(<Component />);
  
  // Test authenticated state
  setupAuthenticatedTestState();
  result = render(<Component />);
  
  // Execute test callback
  await testCallback(result);
};

// Mock storage validation
export const mockStorageValidation = () => {
  // Mock AuthService.validateStorageSync
  jest.doMock('@/app/lib/auth', () => ({
    ...jest.requireActual('@/app/lib/auth'),
    validateStorageSync: () => true,
    syncStorage: jest.fn(),
  }));
  
  // Mock periodic storage validation
  jest.doMock('@/app/lib/AppContext', () => ({
    ...jest.requireActual('@/app/lib/AppContext'),
    // Remove periodic storage validation for tests
  }));
};

// Helper to clear all auth mocks
export const clearAuthMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  if (global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
};

// Export everything
export * from './test-utils';
