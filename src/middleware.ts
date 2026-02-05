import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/api/auth", "/api/auth/"]

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request
  const pathname = nextUrl.pathname

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Get the auth token from cookies
  const authToken = cookies.get("next-auth.session-token")?.value || 
                    cookies.get("authToken")?.value

  // Redirect to login if accessing protected route without authentication
  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Redirect to chat if already authenticated and trying to access login
  if (pathname === "/login" && authToken) {
    return NextResponse.redirect(new URL("/chat", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
