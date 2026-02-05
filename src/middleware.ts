import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

// List of public routes that don't require authentication
const publicRoutes = ["/auth/login", "/auth/otp"];

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
      } catch (error) {
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
    const decoded = jwt.verify(authToken.value, JWT_SECRET);
    console.log("Decoded token:", decoded);
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
