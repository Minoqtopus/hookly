import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/teams',
  '/upgrade/success',
  '/upgrade/cancel',
  '/upgrade/cancelled',
];

// Define routes that should redirect authenticated users away
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

// Routes that have demo functionality and should allow guest access
const demoRoutes = [
  '/generate',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Check if user is authenticated
  const isAuthenticated = !!token;
  
  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Store the intended destination for post-auth redirect
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // User is authenticated, allow access
    return NextResponse.next();
  }
  
  // Handle auth routes (login, register)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // User is already authenticated, redirect to dashboard
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const redirectUrl = redirectParam || '/dashboard';
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // User is not authenticated, allow access to auth pages
    return NextResponse.next();
  }
  
  // Handle demo routes
  if (demoRoutes.some(route => pathname.startsWith(route))) {
    // Allow both authenticated and unauthenticated users
    // Demo mode is controlled by URL parameters and client-side logic
    return NextResponse.next();
  }
  
  // Handle upgrade routes based on authentication and plan
  if (pathname.startsWith('/upgrade')) {
    // Allow access to upgrade page regardless of auth state
    // The page itself will handle showing appropriate content
    return NextResponse.next();
  }
  
  // Handle auth callback routes
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/error')) {
    // Always allow access to auth callback routes
    return NextResponse.next();
  }
  
  // Allow access to all other routes (home, examples, etc.)
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