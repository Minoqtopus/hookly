import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define route categories for proper authentication boundaries

// Routes that require authentication (redirect to homepage if not authenticated)
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/teams',
  '/analytics',
  '/upgrade/success',
  '/upgrade/cancel',
  '/upgrade/cancelled',
];

// Routes that should redirect authenticated users away (guest-only routes)
const guestOnlyRoutes = [
  '/', // Landing page - should redirect authenticated users to dashboard
  '/examples', // Examples page - should redirect authenticated users to dashboard
];

// Routes that should redirect authenticated users away (auth pages)
const authRoutes = [
  '/auth/register',
];

// Routes that have demo functionality and should allow guest access
const demoRoutes = [
  '/generate',
];

// Routes that are accessible to both but show different content
const mixedRoutes = [
  '/upgrade',
];

// Routes that should always be accessible
const alwaysAccessibleRoutes = [
  '/auth/callback',
  '/auth/error',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Check if user is authenticated
  const isAuthenticated = !!token;
  
  // Handle protected routes (require authentication)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to homepage where user can use the auth modal
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // User is authenticated, allow access
    return NextResponse.next();
  }
  
  // Handle guest-only routes (redirect authenticated users away)
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // User is not authenticated, allow access
    return NextResponse.next();
  }
  
  // Handle auth routes (redirect authenticated users away)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // User is already authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // User is not authenticated, allow access to auth pages
    return NextResponse.next();
  }
  
  // Handle demo routes (allow both authenticated and unauthenticated users)
  if (demoRoutes.some(route => pathname.startsWith(route))) {
    // Allow access to all users
    // Demo mode is controlled by URL parameters and client-side logic
    return NextResponse.next();
  }
  
  // Handle mixed routes (accessible to both but show different content)
  if (mixedRoutes.some(route => pathname.startsWith(route))) {
    // Allow access to all users
    // The page itself will handle showing appropriate content based on auth state
    return NextResponse.next();
  }
  
  // Handle always accessible routes
  if (alwaysAccessibleRoutes.some(route => pathname.startsWith(route))) {
    // Always allow access to these routes
    return NextResponse.next();
  }
  
  // Default: allow access to all other routes
  // This includes any new routes that aren't explicitly categorized
  return NextResponse.next();
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