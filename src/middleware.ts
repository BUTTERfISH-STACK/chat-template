import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

// List of public routes that don't require authentication
const publicRoutes = ["/login", "/auth/login", "/auth/otp", "/api/auth/login", "/api/whatsapp"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get the auth token from cookies
  const authToken = request.cookies.get("authToken");

  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is already authenticated and trying to access login/otp page, redirect to chat
    if (authToken) {
      try {
        jwt.verify(authToken.value, JWT_SECRET);
        return NextResponse.redirect(new URL("/chat", request.url));
      } catch {
        // Token is invalid, continue to login page
      }
    }
    return NextResponse.next();
  }

  // If it's a protected route and user is not authenticated, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify the token
    jwt.verify(authToken.value, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Token is invalid or expired
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
