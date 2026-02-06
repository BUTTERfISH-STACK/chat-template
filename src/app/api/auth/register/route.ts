/**
 * Registration API Route
 * Simple registration with name and Gmail email
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { checkRateLimit, resetRateLimit } from '@/lib/security';

// Configuration
const REGISTRATION_RATE_LIMIT = 5;
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;

interface RegisterRequest {
  name: string;
  email: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email?: string;
    name: string;
  };
  errors?: Array<{ field: string; message: string; code: string }>;
  retryAfter?: number;
}

/**
 * Generate auth token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate Gmail email
 */
function isValidGmail(email: string): boolean {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(email);
}

/**
 * Handle registration POST request
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomBytes(8).toString('hex');
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  console.log(`[${requestId}] Registration attempt from IP: ${clientIP}`);
  
  try {
    // Check rate limiting
    const rateLimit = checkRateLimit(`register:${clientIP}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.retryAfter || 0) / 1000),
        } as RegisterResponse,
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfter || 0) / 1000)) },
        }
      );
    }

    // Parse request body
    let body: RegisterRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and email are required',
          errors: [
            { field: 'name', message: 'Name is required', code: 'REQUIRED' },
            { field: 'email', message: 'Email is required', code: 'REQUIRED' },
          ],
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate Gmail
    if (!isValidGmail(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please use a valid Gmail address',
          errors: [
            { field: 'email', message: 'Please use your Gmail address for registration', code: 'INVALID_EMAIL' },
          ],
        } as RegisterResponse,
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists',
          errors: [
            { field: 'email', message: 'An account with this Gmail already exists', code: 'DUPLICATE' },
          ],
        } as RegisterResponse,
        { status: 409 }
      );
    }

    // Generate user ID and token
    const userId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const authToken = generateToken();

    // Create user in database
    await db.insert(users).values({
      id: userId,
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phoneNumber: `gmail_${userId}`, // Placeholder for Gmail users
      authToken: authToken,
      isVerified: true, // Gmail users are considered verified
    });

    // Reset rate limit on successful registration
    resetRateLimit(`register:${clientIP}`);
    
    console.log(`[${requestId}] User registered successfully: ${userId}`);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      token: authToken,
      user: {
        id: userId,
        email: body.email.toLowerCase(),
        name: body.name,
      },
    } as RegisterResponse);

    // Set auth cookie
    response.cookies.set("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error.message);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again later.' } as RegisterResponse,
      { status: 500 }
    );
  }
}

/**
 * Handle GET request - return API info
 */
export async function GET() {
  return NextResponse.json({
    name: 'Registration API',
    version: '1.0.0',
    description: 'Register with name and Gmail email',
    endpoints: {
      POST: 'Create a new user account',
    },
    requirements: {
      fields: ['name', 'email'],
      notes: 'Email must be a valid Gmail address (@gmail.com)',
    },
  });
}
