import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_REDIRECT_ROUTES = ["/login", "/register"];
const DEFAULT_PROTECTED_ROUTE = "/chat";
const DEFAULT_PUBLIC_ROUTE = "/login";

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function shouldRedirectAuthenticated(pathname: string): boolean {
  return AUTH_REDIRECT_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function getAuthToken(cookies: any): string | null {
  return cookies.get("authToken")?.value || 
         cookies.get("authjs.session-token")?.value ||
         cookies.get("__Secure-authjs.session-token")?.value ||
         null;
}

function createSecureRedirect(url: URL, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/whatsapp") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/marketplace") ||
    pathname.startsWith("/api/tophot") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const isPublic = isPublicRoute(pathname);
  const authToken = getAuthToken(cookies);

  if (authToken) {
    if (shouldRedirectAuthenticated(pathname)) {
      return createSecureRedirect(new URL(DEFAULT_PROTECTED_ROUTE, nextUrl), request);
    }
    return NextResponse.next();
  }

  if (!authToken && !isPublic) {
    const loginUrl = new URL(DEFAULT_PUBLIC_ROUTE, nextUrl);
    loginUrl.searchParams.set("redirect", pathname);
    return createSecureRedirect(loginUrl, request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
