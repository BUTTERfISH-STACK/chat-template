/**
 * Email Verification OTP API Route
 * Handles OTP verification for email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, getOTPStatus, generateSecureOTP, storeOTP } from '@/services/emailVerificationService';
import { checkRateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Check rate limiting
    const rateLimit = checkRateLimit(`verify-otp:${clientIP}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.retryAfter || 0) / 1000),
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfter || 0) / 1000)) },
        }
      );
    }

    // Parse request body
    let body: { identifier: string; userId: string; otp: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { identifier, userId, otp } = body;

    // Validate input
    if (!identifier || !userId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: identifier, userId, otp' },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = verifyOTP(identifier, userId, otp);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification successful!',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
        expired: result.expired,
      },
      { status: 400 }
    );

  } catch (error) {
    console.error(`[${requestId}] OTP verification error:`, error);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Check rate limiting
    const rateLimit = checkRateLimit(`resend-otp:${clientIP}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.retryAfter || 0) / 1000),
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfter || 0) / 1000)) },
        }
      );
    }

    // Parse request body
    let body: { identifier: string; userId: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { identifier, userId } = body;

    if (!identifier || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: identifier, userId' },
        { status: 400 }
      );
    }

    // Generate new OTP
    const newOTP = generateSecureOTP();
    storeOTP(identifier, newOTP, userId);

    // In production, send the OTP via email/SMS
    console.log(`[${requestId}] New OTP generated for ${identifier}: ${newOTP}`);

    return NextResponse.json({
      success: true,
      message: 'New verification code sent!',
    });

  } catch (error) {
    console.error(`[${requestId}] Resend OTP error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to resend verification code.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!identifier) {
    return NextResponse.json(
      { success: false, message: 'Missing identifier parameter' },
      { status: 400 }
    );
  }

  const status = getOTPStatus(identifier);

  return NextResponse.json({
    success: true,
    exists: status.exists,
    expired: status.expired,
    remainingAttempts: status.remainingAttempts,
  });
}
