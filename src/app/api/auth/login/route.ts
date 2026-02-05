/**
 * Secure Authentication API - Phone-based login with OTP verification
 * Uses local SQLite database for user storage with comprehensive security measures
 * 
 * Security Features:
 * - Cryptographically secure OTP generation
 * - Hashed OTP storage with salt
 * - Rate limiting to prevent brute force attacks
 * - Constant-time comparison to prevent timing attacks
 * - Comprehensive input validation
 * - Security event logging
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
} from '@/lib/security';

// ============================================================================
// TYPES
// ============================================================================

interface UserResult {
  id: string;
  phoneNumber: string;
  name: string | null;
  avatar: string | null;
}

interface OTPEntry {
  hashedOTP: string;
  expiresAt: number;
  attempts: number;
  lastAttemptAt: number;
}

interface SessionEntry {
  userId: string;
  expiresAt: number;
  createdAt: number;
}

// ============================================================================
// IN-MEMORY STORAGE (Use Redis in production)
// ============================================================================

/**
 * OTP storage with hashed values and attempt tracking
 * In production, use Redis with proper persistence
 */
const otpStore = new Map<string, OTPEntry>();

/**
 * Session storage for token validation
 * In production, use Redis or a database
 */
const sessionStore = new Map<string, SessionEntry>();

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Generate a unique user ID
 * @returns A unique user ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create or get user from SQLite database
 * @param phoneNumber - The normalized phone number
 * @returns The user object
 * @throws Error if database operation fails
 */
async function createOrGetUser(phoneNumber: string): Promise<UserResult> {
  try {
    const dbPath = process.env.DATABASE_PATH || './data/database.db';
    const Database = (await import('better-sqlite3')).default;
    const sqlite = new Database(dbPath);

    // Check if user exists
    const stmt = sqlite.prepare('SELECT * FROM users WHERE phone_number = ?');
    const existingUser = stmt.get(phoneNumber) as {
      id: string;
      phone_number: string;
      name: string | null;
      avatar: string | null;
    } | undefined;

    if (existingUser) {
      return {
        id: existingUser.id,
        phoneNumber: existingUser.phone_number,
        name: existingUser.name,
        avatar: existingUser.avatar,
      };
    }

    // Create new user
    const userId = generateId();
    const now = Date.now();
    const displayName = `User ${phoneNumber.slice(-4)}`;

    sqlite.prepare(`
      INSERT INTO users (id, phone_number, name, avatar, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, phoneNumber, displayName, null, 1, now, now);

    logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { action: 'user_created', userId },
    });

    return {
      id: userId,
      phoneNumber,
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

/**
 * Send OTP via SMS (simulated - integrate with SMS service in production)
 * @param phoneNumber - The phone number to send OTP to
 * @param otp - The OTP to send
 * @returns True if sent successfully
 */
async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // In production, integrate with Twilio, WhatsApp Business API, etc.
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
// REQUEST HANDLERS
// ============================================================================

/**
 * Handle OTP request (send OTP to phone number)
 * @param phoneNumber - The phone number
 * @param request - The Next.js request object
 * @returns Response with success status
 */
async function handleSendOTP(
  phoneNumber: string,
  request: NextRequest
): Promise<NextResponse> {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check rate limit for IP
  const ipRateLimit = checkRateLimit(`otp:${ip}`);
  if (!ipRateLimit.allowed) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      identifier: ip,
      details: { endpoint: 'sendOTP', retryAfter: ipRateLimit.retryAfter },
    });

    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((ipRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((ipRateLimit.retryAfter || 0) / 1000).toString(),
        },
      }
    );
  }

  // Check rate limit for phone number
  const phoneRateLimit = checkRateLimit(`otp:${phoneNumber}`);
  if (!phoneRateLimit.allowed) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { endpoint: 'sendOTP', retryAfter: phoneRateLimit.retryAfter },
    });

    return NextResponse.json(
      {
        error: 'Too many OTP requests for this phone number. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((phoneRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((phoneRateLimit.retryAfter || 0) / 1000).toString(),
        },
      }
    );
  }

  // Generate secure OTP
  const otp = generateSecureOTP();
  const expiresAt = Date.now() + SECURITY_CONFIG.OTP_EXPIRY_MS;

  // Hash OTP with salt for secure storage
  const hashedOTP = hashOTP(otp);

  // Store hashed OTP
  otpStore.set(phoneNumber, {
    hashedOTP,
    expiresAt,
    attempts: 0,
    lastAttemptAt: 0,
  });

  // Send OTP via SMS
  const sent = await sendOTP(phoneNumber, otp);
  
  if (!sent) {
    otpStore.delete(phoneNumber);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }

  // Return success (include OTP only in development)
  return NextResponse.json({
    success: true,
    message: 'OTP sent successfully',
    expiresIn: SECURITY_CONFIG.OTP_EXPIRY_MS / 1000, // seconds
    // Only in development - remove in production
    ...(process.env.NODE_ENV === 'development' && { debugOtp: otp }),
  });
}

/**
 * Handle OTP verification
 * @param phoneNumber - The phone number
 * @param otp - The OTP to verify
 * @param request - The Next.js request object
 * @returns Response with user data and session token
 */
async function handleVerifyOTP(
  phoneNumber: string,
  otp: string,
  request: NextRequest
): Promise<NextResponse> {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check rate limit for IP
  const ipRateLimit = checkRateLimit(`verify:${ip}`);
  if (!ipRateLimit.allowed) {
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      identifier: ip,
      details: { endpoint: 'verifyOTP', retryAfter: ipRateLimit.retryAfter },
    });

    return NextResponse.json(
      {
        error: 'Too many verification attempts. Please try again later.',
        code: SecurityErrorCodes.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil((ipRateLimit.retryAfter || 0) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((ipRateLimit.retryAfter || 0) / 1000).toString(),
        },
      }
    );
  }

  // Get stored OTP data
  const storedData = otpStore.get(phoneNumber);
  
  if (!storedData) {
    logSecurityEvent({
      type: SecurityEventType.OTP_FAILED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { reason: 'otp_not_found' },
    });

    return NextResponse.json(
      {
        error: 'OTP not sent or expired. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_EXPIRED,
      },
      { status: 400 }
    );
  }

  // Check if OTP is expired
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(phoneNumber);
    resetRateLimit(`otp:${phoneNumber}`);
    
    logSecurityEvent({
      type: SecurityEventType.OTP_FAILED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { reason: 'otp_expired' },
    });

    return NextResponse.json(
      {
        error: 'OTP expired. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_EXPIRED,
      },
      { status: 400 }
    );
  }

  // Check if too many attempts
  if (storedData.attempts >= SECURITY_CONFIG.OTP_MAX_ATTEMPTS) {
    otpStore.delete(phoneNumber);
    resetRateLimit(`otp:${phoneNumber}`);
    
    logSecurityEvent({
      type: SecurityEventType.OTP_FAILED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { reason: 'max_attempts_exceeded' },
    });

    return NextResponse.json(
      {
        error: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        code: SecurityErrorCodes.OTP_ATTEMPTS_EXCEEDED,
      },
      { status: 400 }
    );
  }

  // Verify OTP using constant-time comparison
  const isValid = verifyOTP(otp, storedData.hashedOTP);
  
  // Increment attempt counter
  storedData.attempts++;
  storedData.lastAttemptAt = Date.now();
  otpStore.set(phoneNumber, storedData);

  if (!isValid) {
    logSecurityEvent({
      type: SecurityEventType.OTP_FAILED,
      timestamp: Date.now(),
      identifier: phoneNumber,
      details: { 
        reason: 'invalid_otp',
        attempt: storedData.attempts,
        maxAttempts: SECURITY_CONFIG.OTP_MAX_ATTEMPTS,
      },
    });

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

  // OTP verified - clear OTP store
  otpStore.delete(phoneNumber);
  resetRateLimit(`otp:${phoneNumber}`);

  // Create or get user from database
  const user = await createOrGetUser(phoneNumber);

  // Generate session token
  const { token, expiresAt } = generateSessionToken();

  // Store session
  sessionStore.set(token, {
    userId: user.id,
    expiresAt,
    createdAt: Date.now(),
  });

  logSecurityEvent({
    type: SecurityEventType.OTP_VERIFIED,
    timestamp: Date.now(),
    identifier: phoneNumber,
    details: { userId: user.id },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      avatar: user.avatar,
    },
    token,
    expiresIn: SECURITY_CONFIG.TOKEN_EXPIRY_MS / 1000, // seconds
  });
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

/**
 * POST /api/auth/login - Handle OTP send and verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp, action } = body;

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        {
          error: 'Phone number is required',
          code: SecurityErrorCodes.INVALID_PHONE_NUMBER,
        },
        { status: 400 }
      );
    }

    // Sanitize and validate phone number
    const sanitizedPhone = sanitizeInput(phoneNumber);
    
    if (!validatePhoneNumber(sanitizedPhone)) {
      logSecurityEvent({
        type: SecurityEventType.INVALID_INPUT,
        timestamp: Date.now(),
        identifier: sanitizedPhone,
        details: { reason: 'invalid_phone_format' },
      });

      return NextResponse.json(
        {
          error: 'Please enter a valid phone number',
          code: SecurityErrorCodes.INVALID_PHONE_NUMBER,
        },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(sanitizedPhone);

    // Route to appropriate handler
    if (action === 'verify') {
      // Validate OTP
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
        logSecurityEvent({
          type: SecurityEventType.INVALID_INPUT,
          timestamp: Date.now(),
          identifier: normalizedPhone,
          details: { reason: 'invalid_otp_format' },
        });

        return NextResponse.json(
          {
            error: 'Please enter a valid 6-digit OTP',
            code: SecurityErrorCodes.INVALID_OTP,
          },
          { status: 400 }
        );
      }

      return await handleVerifyOTP(normalizedPhone, sanitizedOTP, request);
    } else {
      // Default action: send OTP
      return await handleSendOTP(normalizedPhone, request);
    }
  } catch (error) {
    console.error('Login error:', error);

    // Handle security errors
    if (error instanceof SecurityError) {
      return NextResponse.json(
        formatSecurityError(error),
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
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
