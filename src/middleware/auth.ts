/**
 * Authentication Middleware
 * Protects routes and validates sessions
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/sessionManager';

// Routes that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/api/whatsapp',
  '/api/whatsapp/send',
  '/api/whatsapp/verify',
  '/api/whatsapp/qr',
];

// API routes that have their own auth handling
const selfAuthPaths = [
  '/api/auth/logout',
  '/api/auth/me',
];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // Skip auth for self-authenticating API routes
  if (selfAuthPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const authToken = request.cookies.get('authToken')?.value;

  if (!authToken) {
    // For API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session
  const validation = await validateSession(authToken);

  if (!validation.valid) {
    // Clear invalid cookie
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ success: false, message: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', validation.session!.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export default authMiddleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
