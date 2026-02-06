/**
 * Logout API Route
 * Handles user logout and session destruction
 */

import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getCurrentSession } from '@/lib/sessionManager';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getCurrentSession();

    if (session.valid && session.session) {
      // Destroy the session in the database
      await destroySession(session.session.userId);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the auth cookie
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  }
}

export async function GET() {
  // Handle GET requests the same as POST
  return POST(new NextRequest(new URL('/api/auth/logout', 'http://localhost')));
}
