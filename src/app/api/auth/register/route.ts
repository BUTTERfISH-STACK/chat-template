/**
 * Enhanced Registration API Route
 * Complete registration system with validation, security, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';
import { validateRegistrationData, getUserFriendlyError } from '@/lib/validators/registrationValidator';
import { checkRateLimit, resetRateLimit } from '@/lib/security';
import { hashOTP, generateSecureOTP, storeOTP } from '@/services/emailVerificationService';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REGISTRATION_RATE_LIMIT = 5; // Max registrations per window
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RegisterRequest {
  phoneNumber: string;
  email?: string;
  name: string;
  password: string;
  confirmPassword?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    phoneNumber: string;
    email?: string;
    name: string;
  };
  requiresVerification?: boolean;
  verificationId?: string;
  errors?: Array<{ field: string; message: string; code: string }>;
  retryAfter?: number;
}

/**
 * Hash password using SHA-256 with salt
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
    return hash === computedHash;
  } catch {
    return false;
  }
}

/**
 * Generate JWT-like token
 */
function generateToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
    iat: Date.now(),
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * Validate request content type
 */
function validateContentType(request: NextRequest): { valid: boolean; response?: NextResponse } {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid content type. Use application/json' },
        { status: 415 }
      ),
    };
  }
  return { valid: true };
}

/**
 * Check for duplicate accounts
 */
async function checkDuplicateAccounts(phoneNumber: string, email?: string) {
  const conditions = [eq(users.phoneNumber, phoneNumber)];
  if (email) {
    conditions.push(eq(users.email, email));
  }
  
  const existingUsers = await db
    .select()
    .from(users)
    .where(or(...conditions))
    .limit(1);
  
  if (existingUsers.length > 0) {
    const existing = existingUsers[0];
    if (existing.phoneNumber === phoneNumber) {
      return { duplicate: true, field: 'phoneNumber', message: 'An account with this phone number already exists' };
    }
    if (email && existing.email === email) {
      return { duplicate: true, field: 'email', message: 'An account with this email already exists' };
    }
  }
  
  return { duplicate: false };
}

/**
 * Handle registration POST request
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomBytes(8).toString('hex');
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  console.log(`[${requestId}] Registration attempt from IP: ${clientIP}`);
  
  try {
    // Validate content type
    const contentTypeCheck = validateContentType(request);
    if (!contentTypeCheck.valid) {
      return contentTypeCheck.response!;
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(`register:${clientIP}`);
    if (!rateLimit.allowed) {
      console.log(`[${requestId}] Rate limit exceeded for IP: ${clientIP}`);
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
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body`);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' } as RegisterResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    const validationResult = validateRegistrationData({
      phoneNumber: body.phoneNumber || '',
      email: body.email,
      name: body.name || '',
      password: body.password || '',
      confirmPassword: body.confirmPassword,
    });

    if (!validationResult.isValid) {
      console.log(`[${requestId}] Validation failed:`, validationResult.errors);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Please fix the errors below',
          errors: validationResult.errors.map(e => ({
            field: e.field,
            message: getUserFriendlyError(e),
            code: e.code,
          })),
        } as RegisterResponse,
        { status: 400 }
      );
    }

    const { sanitizedData } = validationResult;
    
    // Check for duplicate accounts
    const duplicateCheck = await checkDuplicateAccounts(
      sanitizedData!.phoneNumber,
      sanitizedData!.email
    );
    
    if (duplicateCheck.duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: duplicateCheck.message,
          errors: [{
            field: duplicateCheck.field!,
            message: duplicateCheck.message,
            code: 'DUPLICATE_ACCOUNT',
          }],
        } as RegisterResponse,
        { status: 409 }
      );
    }

    // Generate user ID
    const userId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Hash password
    const hashedPassword = hashPassword(sanitizedData!.password);
    
    // Generate auth token
    const authToken = generateToken();

    // Store OTP for email verification if email provided
    let verificationId: string | undefined;
    if (sanitizedData!.email) {
      const otp = generateSecureOTP();
      verificationId = crypto.randomBytes(16).toString('hex');
      storeOTP(sanitizedData!.email!, otp, verificationId);
      console.log(`[${requestId}] OTP generated for email: ${sanitizedData!.email}`);
    }

    // Create user in database
    try {
      await db.insert(users).values({
        id: userId,
        phoneNumber: sanitizedData!.phoneNumber,
        name: sanitizedData!.name,
        email: sanitizedData!.email || null,
        password: hashedPassword,
        authToken: authToken,
        isVerified: !verificationId, // Verified if no email, otherwise pending
      });
    } catch (dbError: any) {
      console.error(`[${requestId}] Database error:`, dbError.message);
      
      // Handle specific database errors
      if (dbError.code === 'SQLITE_CONSTRAINT') {
        return NextResponse.json(
          {
            success: false,
            message: 'An account with this information already exists',
            errors: [{
              field: 'general',
              message: 'Please try logging in instead',
              code: 'DUPLICATE',
            }],
          } as RegisterResponse,
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Registration failed due to a server error. Please try again.' } as RegisterResponse,
        { status: 500 }
      );
    }

    // Reset rate limit on successful registration
    resetRateLimit(`register:${clientIP}`);
    
    console.log(`[${requestId}] User registered successfully: ${userId}`);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: verificationId 
        ? 'Account created! Please verify your email.' 
        : 'Account created successfully!',
      token: authToken,
      user: {
        id: userId,
        phoneNumber: sanitizedData!.phoneNumber,
        email: sanitizedData!.email,
        name: sanitizedData!.name,
      },
      requiresVerification: !!verificationId,
      verificationId: verificationId,
    } as RegisterResponse);

    // Set auth cookie
    response.cookies.set('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

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
    endpoints: {
      POST: 'Create a new user account',
    },
    requirements: {
      fields: ['phoneNumber', 'name', 'password'],
      optional: ['email', 'confirmPassword'],
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      },
    },
  });
}
