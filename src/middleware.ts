/**
 * Authentication Middleware
 * Protects routes and validates authentication tokens
 * Supports both NextAuth.js session cookies and custom token-based authentication
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * List of public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth",
  "/api/auth/login",
  "/api/auth/verify",
  "/api/auth/register",
]

/**
 * Routes that should redirect authenticated users
 */
const AUTH_REDIRECT_ROUTES = [
  "/login",
  "/register",
]

/**
 * Default protected route to redirect to
 */
const DEFAULT_PROTECTED_ROUTE = "/chat"

/**
 * Default public route to redirect to
 */
const DEFAULT_PUBLIC_ROUTE = "/login"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  )
}

/**
 * Check if a path should redirect authenticated users
 */
function shouldRedirectAuthenticated(pathname: string): boolean {
  return AUTH_REDIRECT_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  )
}

/**
 * Get authentication token from cookies
 * Checks for NextAuth session token and custom auth token
 */
function getAuthToken(cookies: any): string | null {
  // Check for NextAuth session token (JWT format)
  const nextAuthToken = cookies.get("next-auth.session-token")?.value
  if (nextAuthToken && nextAuthToken.split(".").length === 3) {
    return nextAuthToken
  }

  // Check for NextAuth callback token
  const callbackToken = cookies.get("__Secure-next-auth.session-token")?.value
  if (callbackToken && callbackToken.split(".").length === 3) {
    return callbackToken
  }

  // Check for custom auth token
  const customToken = cookies.get("authToken")?.value
  if (customToken) return customToken

  return null
}

/**
 * Validate token format
 */
function isValidTokenFormat(token: string): boolean {
  // Check if it's a JWT (3 parts separated by dots)
  if (token.split(".").length === 3) {
    return true // Likely a NextAuth JWT
  }
  
  // Check if it's a hex string (custom token)
  const hexRegex = /^[a-f0-9]{32,}$/i
  return hexRegex.test(token)
}

/**
 * Create a redirect response with security headers
 */
function createSecureRedirect(url: URL, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(url)
  
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  return response
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Main middleware function
 * Handles authentication and route protection
 */
export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request
  const pathname = nextUrl.pathname

  // Skip middleware for static files and specific API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/whatsapp") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/marketplace") ||
    pathname.startsWith("/api/tophot")
  ) {
    return NextResponse.next()
  }

  // Check if the current route is public
  const isPublic = isPublicRoute(pathname)

  // Get the auth token from cookies
  const authToken = getAuthToken(cookies)

  // Case 1: User is authenticated
  if (authToken) {
    // Validate token format
    if (!isValidTokenFormat(authToken)) {
      // Invalid token format, clear it and redirect to login
      const response = NextResponse.redirect(new URL(DEFAULT_PUBLIC_ROUTE, nextUrl))
      response.cookies.delete("authToken")
      response.cookies.delete("next-auth.session-token")
      response.cookies.delete("__Secure-next-auth.session-token")
      return response
    }

    // If authenticated user tries to access auth redirect routes, redirect to chat
    if (shouldRedirectAuthenticated(pathname)) {
      return createSecureRedirect(new URL(DEFAULT_PROTECTED_ROUTE, nextUrl), request)
    }

    // Allow access to protected routes
    return NextResponse.next()
  }

  // Case 2: User is not authenticated
  if (!authToken) {
    // If trying to access protected route, redirect to login
    if (!isPublic) {
      // Store the original URL for redirect after login
      const loginUrl = new URL(DEFAULT_PUBLIC_ROUTE, nextUrl)
      loginUrl.searchParams.set("redirect", pathname)
      return createSecureRedirect(loginUrl, request)
    }

    // Allow access to public routes
    return NextResponse.next()
  }

  // Default: allow access
  return NextResponse.next()
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
