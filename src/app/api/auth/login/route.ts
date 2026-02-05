/**
 * Secure Authentication API - Phone and Email-based login with OTP verification
 * Uses local SQLite database for user storage with comprehensive security measures
 * 
 * Security Features:
 * - Cryptographically secure OTP generation
 * - Hashed OTP storage with salt
 * - Rate limiting to prevent brute force attacks
 * - Constant-time comparison to prevent timing attacks
 * - Comprehensive input validation
 * - Security event logging
 * - Support for both SMS and Email OTP
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateSecureOTP,
  hashOTP,
  verifyOTP,
  generateSessionToken,
  isTokenValid,
  validatePhoneNumber,
  normalizePhoneNumber,
  validateOTP,
  sanitizeInput,
  checkRateLimit,
  resetRateLimit,
  logSecurityEvent,
  SecurityEventType,
  SecurityError,
  SecurityErrorCodes,
  formatSecurityError,
  SECURITY_CONFIG,
  validateEmail,
} from '@/lib/security';

// ============================================================================
// TYPES
// ============================================================================

interface UserResult {
  id: string;
  phoneNumber: string;
  email?: string;
  name: string | null;
  avatar: string | null;
}

interface OTPEntry {
  hashedOTP: string;
  expiresAt: number;
  attempts: number;
  lastAttemptAt: number;
  type: 'phone' | 'email';
}

interface SessionEntry {
  userId: string;
  expiresAt: number;
  createdAt: number;
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

const otpStore = new Map<string, OTPEntry>();
const sessionStore = new Map<string, SessionEntry>();

// ============================================================================
// EMAIL OTP SIMULATION (Development Mode)
// ============================================================================

/**
 * Simulate sending email OTP - logs to console in development
 * In production, integrate with Nodemailer or other email service
 */
async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    // In development, just log the OTP
    console.log(`\n=== Email OTP ===`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`=============\n`);
    
    logSecurityEvent({
      type: SecurityEventType.OTP_GENERATED,
      timestamp: Date.now(),
      identifier: email,
      details: { maskedEmail: email.slice(0, 3) + '***' + email.slice(-3) },
    });
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function createOrGetUser(
  phoneNumber?: string, 
  email?: string
): Promise<UserResult> {
  try {
    const dbPath = process.env.DATABASE_PATH || './data/database.db';
    const Database = (await import('better-sqlite3')).default;
    const sqlite = new Database(dbPath);

    // Try to find user by phone first
    let existingUser = phoneNumber 
      ? sqlite.prepare('SELECT * FROM users WHERE phone_number = ?').get(phoneNumber) as any
      : null;

    // Try to find user by email
    if (!existingUser && email) {
      existingUser = sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    }

    if (existingUser) {
      return {
        id: existingUser.id,
        phoneNumber: existingUser.phone_number,
        email: existingUser.email,
        name: existingUser.name,
        avatar: existingUser.avatar,
      };
    }

    // Create new user
    const userId = generateId();
    const now = Date.now();
    const displayName = phoneNumber 
      ? `User ${phoneNumber.slice(-4)}`
      : email 
        ? `User ${email.split('@')[0].slice(0, 4)}`
        : 'User';

    sqlite.prepare(`
      INSERT INTO users (id, phone_number, email, name, avatar, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, phoneNumber || null, email || null, displayName, null, 1, now, now);

    logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      timestamp: Date.now(),
      identifier: phoneNumber || email || 'unknown',
      details: { action: 'user_created', userId },
    });

    return {
      id: userId,
      phoneNumber: phoneNumber || '',
      email: email,
      name: displayName,
      avatar: null,
    };
  } catch (error) {
    console.error('Database error:', error);
    throw new SecurityError(
      'Failed to create or retrieve user',
      SecurityErrorCodes.INVALID_TOKEN,
      500
    );
  }
}

async function sendSMSOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    console.log(`[SMS] OTP for ${phoneNumber}: ${otp}`);
    
    logSecurityEvent({
      type: SecurityEventType.OTP_GENERATED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { maskedPhone: phoneNumber.slice(0, -4) + '****' },
    });
    
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

// ============================================================================
// OTP HANDLERS - PHONE
// ============================================================================

async function handleSendPhoneOTP(
  phoneNumber: string,
  request: NextRequest
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check IP rate limit
  const ipRateLimit = checkRateLimit(`otp:phone:${ip}`);
  if (!ipRateLimit.allowed) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      identifier: ip,
      details: { endpoint: 'sendPhoneOTP', retryAfter: ipRateLimit.retryAfter },
    });

    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((ipRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: { 'Retry-After': Math.ceil((ipRateLimit.retryAfter || 0) / 1000).toString() },
      }
    );
  }

  // Check phone rate limit
  const phoneRateLimit = checkRateLimit(`otp:phone:${phoneNumber}`);
  if (!phoneRateLimit.allowed) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { endpoint: 'sendPhoneOTP', retryAfter: phoneRateLimit.retryAfter },
    });

    return NextResponse.json(
      {
        error: 'Too many OTP requests for this phone number. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((phoneRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: { 'Retry-After': Math.ceil((phoneRateLimit.retryAfter || 0) / 1000).toString() },
      }
    );
  }

  const otp = generateSecureOTP();
  const expiresAt = Date.now() + SECURITY_CONFIG.OTP_EXPIRY_MS;
  const hashedOTP = hashOTP(otp);

  otpStore.set(phoneNumber, {
    hashedOTP,
    expiresAt,
    attempts: 0,
    lastAttemptAt: 0,
    type: 'phone',
  });

  const sent = await sendSMSOTP(phoneNumber, otp);
  
  if (!sent) {
    otpStore.delete(phoneNumber);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'OTP sent successfully',
    method: 'phone',
    expiresIn: SECURITY_CONFIG.OTP_EXPIRY_MS / 1000,
    ...(process.env.NODE_ENV === 'development' && { debugOtp: otp }),
  });
}

// ============================================================================
// OTP HANDLERS - EMAIL
// ============================================================================

async function handleSendEmailOTP(
  email: string,
  request: NextRequest
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check IP rate limit
  const ipRateLimit = checkRateLimit(`otp:email:${ip}`);
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((ipRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: { 'Retry-After': Math.ceil((ipRateLimit.retryAfter || 0) / 1000).toString() },
      }
    );
  }

  // Generate OTP
  const otp = generateSecureOTP();
  const expiresAt = Date.now() + SECURITY_CONFIG.OTP_EXPIRY_MS;
  const hashedOTP = hashOTP(otp);

  // Store OTP
  otpStore.set(email, {
    hashedOTP,
    expiresAt,
    attempts: 0,
    lastAttemptAt: 0,
    type: 'email',
  });

  // Send email OTP
  const sent = await sendEmailOTP(email, otp);
  
  if (!sent) {
    otpStore.delete(email);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'OTP sent successfully',
    method: 'email',
    expiresIn: SECURITY_CONFIG.OTP_EXPIRY_MS / 1000,
    ...(process.env.NODE_ENV === 'development' && { debugOtp: otp }),
  });
}

// ============================================================================
// VERIFICATION HANDLERS
// ============================================================================

async function handleVerifyOTP(
  identifier: string,
  otp: string,
  type: 'phone' | 'email',
  request: NextRequest
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check IP rate limit
  const ipRateLimit = checkRateLimit(`verify:${type}:${ip}`);
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many verification attempts. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((ipRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: { 'Retry-After': Math.ceil((ipRateLimit.retryAfter || 0) / 1000).toString() },
      }
    );
  }

  // Get stored OTP data
  const storedData = otpStore.get(identifier);
  
  if (!storedData) {
    return NextResponse.json(
      {
        error: 'OTP not sent or expired. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_EXPIRED,
      },
      { status: 400 }
    );
  }

  // Verify the type matches
  if (storedData.type !== type) {
    return NextResponse.json(
      {
        error: 'Invalid OTP request type. Please start over.',
      },
      { status: 400 }
    );
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(identifier);
    resetRateLimit(`otp:${type}:${identifier}`);
    
    return NextResponse.json(
      {
        error: 'OTP expired. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_EXPIRED,
      },
      { status: 400 }
    );
  }

  if (storedData.attempts >= SECURITY_CONFIG.OTP_MAX_ATTEMPTS) {
    otpStore.delete(identifier);
    resetRateLimit(`otp:${type}:${identifier}`);
    
    return NextResponse.json(
      {
        error: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_ATTEMPTS_EXCEEDED,
      },
      { status: 400 }
    );
  }

  const isValid = verifyOTP(otp, storedData.hashedOTP);
  storedData.attempts++;
  storedData.lastAttemptAt = Date.now();
  otpStore.set(identifier, storedData);

  if (!isValid) {
    const remainingAttempts = SECURITY_CONFIG.OTP_MAX_ATTEMPTS - storedData.attempts;
    
    return NextResponse.json(
      {
        error: 'Invalid OTP',
        code: SecurityErrorCodes.INVALID_OTP,
        remainingAttempts,
      },
      { status: 400 }
    );
  }

  // OTP verified
  otpStore.delete(identifier);
  resetRateLimit(`otp:${type}:${identifier}`);

  // Create or get user
  const user = type === 'phone' 
    ? await createOrGetUser(identifier)
    : await createOrGetUser(undefined, identifier);
    
  const { token, expiresAt } = generateSessionToken();

  sessionStore.set(token, {
    userId: user.id,
    expiresAt,
    createdAt: Date.now(),
  });

  logSecurityEvent({
    type: SecurityEventType.OTP_VERIFIED,
    timestamp: Date.now(),
    identifier,
    details: { userId: user.id },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    token,
    expiresIn: SECURITY_CONFIG.TOKEN_EXPIRY_MS / 1000,
  });
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, otp, action } = body;

    // Handle OTP send
    if (action === 'send') {
      if (phoneNumber) {
        const sanitizedPhone = sanitizeInput(phoneNumber);
        
        if (!validatePhoneNumber(sanitizedPhone)) {
          return NextResponse.json(
            {
              error: 'Please enter a valid phone number',
              code: SecurityErrorCodes.INVALID_PHONE_NUMBER,
            },
            { status: 400 }
          );
        }

        const normalizedPhone = normalizePhoneNumber(sanitizedPhone);
        return await handleSendPhoneOTP(normalizedPhone, request);
      }

      if (email) {
        const sanitizedEmail = sanitizeInput(email);
        
        if (!validateEmail(sanitizedEmail)) {
          return NextResponse.json(
            { error: 'Please enter a valid email address' },
            { status: 400 }
          );
        }

        return await handleSendEmailOTP(sanitizedEmail, request);
      }

      return NextResponse.json(
        { error: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    // Handle OTP verify
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json(
          {
            error: 'OTP is required',
            code: SecurityErrorCodes.INVALID_OTP,
          },
          { status: 400 }
        );
      }

      const sanitizedOTP = sanitizeInput(otp);
      
      if (!validateOTP(sanitizedOTP)) {
        return NextResponse.json(
          {
            error: 'Please enter a valid 6-digit OTP',
            code: SecurityErrorCodes.INVALID_OTP,
          },
          { status: 400 }
        );
      }

      // Verify with phone
      if (phoneNumber) {
        const sanitizedPhone = sanitizeInput(phoneNumber);
        if (!validatePhoneNumber(sanitizedPhone)) {
          return NextResponse.json(
            { error: 'Invalid phone number' },
            { status: 400 }
          );
        }
        const normalizedPhone = normalizePhoneNumber(sanitizedPhone);
        return await handleVerifyOTP(normalizedPhone, sanitizedOTP, 'phone', request);
      }

      // Verify with email
      if (email) {
        const sanitizedEmail = sanitizeInput(email);
        if (!validateEmail(sanitizedEmail)) {
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );
        }
        return await handleVerifyOTP(sanitizedEmail, sanitizedOTP, 'email', request);
      }

      return NextResponse.json(
        { error: 'Phone number or email is required for verification' },
        { status: 400 }
      );
    }

    // Default: send OTP (backward compatibility)
    if (phoneNumber) {
      const sanitizedPhone = sanitizeInput(phoneNumber);
      
      if (!validatePhoneNumber(sanitizedPhone)) {
        return NextResponse.json(
          {
            error: 'Please enter a valid phone number',
            code: SecurityErrorCodes.INVALID_PHONE_NUMBER,
          },
          { status: 400 }
        );
      }

      const normalizedPhone = normalizePhoneNumber(sanitizedPhone);
      return await handleSendPhoneOTP(normalizedPhone, request);
    }

    return NextResponse.json(
      { error: 'Phone number or email is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof SecurityError) {
      return NextResponse.json(
        formatSecurityError(error),
        { status: error.statusCode }
      );
    }

    logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      timestamp: Date.now(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json(
      {
        error: 'An error occurred during login. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
