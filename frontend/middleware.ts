import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  // const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
  // const { pathname } = request.nextUrl;

  // // TODO: Re-enable this auth guard once UI development is complete.
  // // If user is not authenticated and is trying to access a protected route,
  // // redirect them to the login page.
  // if (!accessToken && !refreshToken && !pathname.startsWith("/login")) {
  //   const loginUrl = new URL("/login", request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  // Matcher to apply middleware to all routes except for API, static files, and image optimization routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};