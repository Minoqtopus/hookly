import { NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced Middleware with Route Protection
 * 
 * Staff Engineer Implementation:
 * - Two route types: Public (guest only) and Protected (authenticated only)
 * - Server-side authentication checks
 * - Proper route protection for public/private routes
 * - Security headers and redirects
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication token from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Determine authentication status
  const isAuthenticated = !!(accessToken || refreshToken);
  
  // Define route categories - SIMPLIFIED to two types
  const publicRoutes = ['/', '/login', '/register', '/pricing', '/demo'];
  const protectedRoutes = ['/dashboard', '/generate', '/settings', '/verification', '/history'];
  
  // Check if current path matches any route category
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Route protection logic - SIMPLIFIED
  if (isAuthenticated && isPublicRoute) {
    // Authenticated users trying to access public routes - redirect to dashboard
    console.log(`[MIDDLEWARE] Authenticated user redirected from ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (!isAuthenticated && isProtectedRoute) {
    // Unauthenticated users trying to access protected routes - redirect to login
    console.log(`[MIDDLEWARE] Unauthenticated user redirected from ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Set comprehensive security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (security files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.well-known).*)',
  ],
};