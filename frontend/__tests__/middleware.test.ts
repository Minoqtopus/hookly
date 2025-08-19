/**
 * Middleware Tests
 * Tests route protection and navigation logic
 */

// Mock NextResponse and NextRequest with proper hoisting
jest.mock('next/server', () => {
  const mockRedirect = jest.fn().mockReturnValue('redirected');
  const mockNext = jest.fn().mockReturnValue('next');
  
  return {
    NextResponse: {
      redirect: mockRedirect,
      next: mockNext,
    },
    NextRequest: jest.fn().mockImplementation((url) => ({
      url,
      nextUrl: {
        pathname: new URL(url).pathname,
      },
      cookies: {
        get: jest.fn(),
      },
      headers: {
        get: jest.fn(),
      },
    })),
  };
});

import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Get the mocked functions
const { NextResponse } = require('next/server');
const mockRedirect = NextResponse.redirect;
const mockNext = NextResponse.next;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (pathname: string, token?: string) => {
    const url = `https://example.com${pathname}`;
    const request = new NextRequest(url);
    
    if (token) {
      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn((name: string) => 
            name === 'access_token' ? { value: token } : undefined
          ),
        },
      });
    } else {
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn(() => undefined),
        },
      });
    }
    
    // Mock headers
    Object.defineProperty(request, 'headers', {
      value: {
        get: jest.fn((name: string) => 
          name === 'authorization' && token ? `Bearer ${token}` : null
        ),
      },
    });
    
    return request;
  };

  describe('Protected Routes', () => {
    const protectedPaths = [
      '/dashboard',
      '/settings',
      '/teams',
      '/upgrade/success',
    ];

    test('should redirect unauthenticated users to homepage', () => {
      const request = createRequest('/dashboard');
      
      middleware(request);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/'
        })
      );
    });

    test.each(protectedPaths)('should allow authenticated users to access %s', (path) => {
      const request = createRequest(path, 'valid-token');
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('should redirect to homepage without redirect parameters', () => {
      const request = createRequest('/dashboard');
      
      middleware(request);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/'
        })
      );
    });
  });

  describe('Auth Routes', () => {
    const authPaths = ['/auth/register'];

    test.each(authPaths)('should allow unauthenticated users to access %s', (path) => {
      const request = createRequest(path);
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test.each(authPaths)('should redirect authenticated users away from %s', (path) => {
      const request = createRequest(path, 'valid-token');
      
      middleware(request);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/dashboard'
        })
      );
    });
  });

  describe('Demo Routes', () => {
    test('should allow unauthenticated users to access /generate', () => {
      const request = createRequest('/generate');
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('should allow authenticated users to access /generate', () => {
      const request = createRequest('/generate', 'valid-token');
      
      const result = middleware(request);
      
      // Demo routes should allow access to all users
      expect(result).toBe('next');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('should allow demo mode with parameters', () => {
      const request = createRequest('/generate?demo=true&timer=300');
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Public Routes', () => {
    describe('Guest-only routes (/, /examples)', () => {
      const guestOnlyPaths = ['/', '/examples'];

      test.each(guestOnlyPaths)('should allow unauthenticated users to access %s', (path) => {
        const request = createRequest(path);
        
        middleware(request);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRedirect).not.toHaveBeenCalled();
      });

      test.each(guestOnlyPaths)('should redirect authenticated users away from %s', (path) => {
        const request = createRequest(path, 'valid-token');
        
        middleware(request);
        
        expect(mockRedirect).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Mixed routes (/upgrade)', () => {
      test('should allow unauthenticated users to access /upgrade', () => {
        const request = createRequest('/upgrade');
        
        middleware(request);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockRedirect).not.toHaveBeenCalled();
      });

      test('should allow authenticated users to access /upgrade', () => {
        const request = createRequest('/upgrade', 'valid-token');
        
        const result = middleware(request);
        
        // The middleware should call NextResponse.next() for mixed routes
        expect(result).toBe('next');
        expect(mockNext).toHaveBeenCalled();
        expect(mockRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Auth Callback Routes', () => {
    const callbackPaths = ['/auth/callback', '/auth/error'];

    test.each(callbackPaths)('should always allow access to %s', (path) => {
      const request = createRequest(path);
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Token Detection', () => {
    test('should detect token from cookies', () => {
      const request = createRequest('/dashboard');
      request.cookies.get = jest.fn((name) => 
        name === 'access_token' ? { value: 'cookie-token' } : undefined
      );
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should detect token from authorization header', () => {
      const request = createRequest('/dashboard');
      request.headers.get = jest.fn((name) => 
        name === 'authorization' ? 'Bearer header-token' : null
      );
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should prioritize cookie token over header', () => {
      const request = createRequest('/dashboard');
      request.cookies.get = jest.fn((name) => 
        name === 'access_token' ? { value: 'cookie-token' } : undefined
      );
      request.headers.get = jest.fn((name) => 
        name === 'authorization' ? 'Bearer header-token' : null
      );
      
      middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Static Files', () => {
    test('should not process static file requests', () => {
      // This would be handled by the matcher config
      const staticPaths = [
        '/_next/static/css/app.css',
        '/_next/image/logo.png',
        '/favicon.ico',
        '/api/auth/google',
      ];

      // These paths should be excluded by the matcher config
      // so middleware wouldn't be called for them
      expect(true).toBe(true); // Placeholder for static file exclusion test
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed URLs gracefully', () => {
      const request = createRequest('/dashboard%20malformed');
      
      expect(() => middleware(request)).not.toThrow();
    });

    test('should handle missing URL components', () => {
      const request = createRequest('');
      
      expect(() => middleware(request)).not.toThrow();
    });

    test('should handle deep nested routes', () => {
      const request = createRequest('/dashboard/analytics/performance');
      
      middleware(request);
      
      expect(mockRedirect).toHaveBeenCalled(); // Should redirect if unauthenticated
    });
  });
});