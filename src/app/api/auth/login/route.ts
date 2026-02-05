/**
 * Authentication API - DISABLED
 * Phone and Email OTP login has been deprecated.
 * Only Google OAuth sign-in is now supported.
 * 
 * This file is kept for reference but all endpoints return an error.
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// MAIN ROUTE HANDLER - Returns error for all requests
// ============================================================================

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Phone and email login has been disabled. Please use Google Sign-In.',
      code: 'AUTH_METHOD_DISABLED',
    },
    { status: 410 }
  );
}

// GET handler also returns error
export async function GET() {
  return NextResponse.json(
    {
      error: 'Phone and email login has been disabled. Please use Google Sign-In.',
      code: 'AUTH_METHOD_DISABLED',
    },
    { status: 410 }
  );
}
