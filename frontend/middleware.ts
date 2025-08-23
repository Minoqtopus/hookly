import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define route categories based on actual app structure

// Public routes - accessible to everyone
const publicRoutes: string[] = [
  '/',
  '/pricing', 
  '/demo',
  '/privacy',
  '/terms',
];

// Protected routes - require authentication
const protectedRoutes: string[] = [
  '/dashboard',
];

// System routes that should always be accessible (SEO and performance)
const systemRoutes: string[] = [
  '/_next',    // Next.js internal routes
  '/favicon.ico', // Favicon
  '/robots.txt',  // SEO
  '/sitemap.xml', // SEO
];

// Simple JWT validation (without crypto verification for middleware performance)
function isValidJWTStructure(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Check if payload can be decoded (basic structure validation)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired (basic expiry check)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Always allow access to system routes (Next.js internal, SEO files)
  if (systemRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get auth token from cookies/headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Validate token structure and expiry
  const isAuthenticated = token ? isValidJWTStructure(token) : false;
  
  // Handle protected routes - require authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to homepage
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('access_token'); // Clear invalid token
      return response;
    }
    
    // User is authenticated, allow access
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  
  // Handle root route - redirect authenticated users to dashboard
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Unauthenticated users see landing page
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  
  // Handle public routes - accessible to everyone
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  
  // Default: allow access with security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

// Add security headers to responses
function addSecurityHeaders(response: NextResponse) {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP for additional security (adjust as needed for your app)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-analytics.com *.vercel.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' *.vercel.app *.supabase.co;"
  );
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};