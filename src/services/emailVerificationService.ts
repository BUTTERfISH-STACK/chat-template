/**
 * Email Verification Service
 * Handles OTP generation, storage, and verification for email verification
 */

import crypto from 'crypto';

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_MINUTES = 15;

// In-memory OTP store (use Redis in production)
interface OTPEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastAttempt: number;
  identifier: string;
}

const otpStore = new Map<string, OTPEntry>();

// Verification tokens store
interface VerificationToken {
  token: string;
  email: string;
  userId: string;
  expiresAt: number;
}

const verificationTokens = new Map<string, VerificationToken>();

/**
 * Generate a cryptographically secure OTP
 * @returns A 6-digit OTP string
 */
export function generateSecureOTP(): string {
  const randomBytes = crypto.randomBytes(4);
  const otpNumber = randomBytes.readUInt32BE(0) % 1000000;
  return otpNumber.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Generate a secure verification token
 * @returns A secure random token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash an OTP for secure storage
 * @param otp - The OTP to hash
 * @returns Hashed OTP with salt
 */
export function hashOTP(otp: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(otp + salt).digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify an OTP against a stored hash using constant-time comparison
 * @param otp - The OTP to verify
 * @param storedHash - The stored hash (format: salt:hash)
 * @returns True if OTP matches, false otherwise
 */
export function verifyOTPHash(otp: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) {
      return false;
    }

    const computedHash = crypto.createHash('sha256').update(otp + salt).digest('hex');
    
    const buf1 = Buffer.from(computedHash, 'hex');
    const buf2 = Buffer.from(hash, 'hex');
    
    if (buf1.length !== buf2.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(buf1, buf2);
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
}

/**
 * Store OTP for an identifier (email or phone)
 * @param identifier - The email or phone number
 * @param otp - The OTP to store
 * @param userId - The user ID associated with this OTP
 * @returns The OTP entry
 */
export function storeOTP(identifier: string, otp: string, userId: string): OTPEntry {
  const entry: OTPEntry = {
    otp: hashOTP(otp),
    expiresAt: Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000),
    attempts: 0,
    lastAttempt: Date.now(),
    identifier,
  };

  otpStore.set(identifier, entry);
  otpStore.set(`user:${userId}`, entry);
  
  return entry;
}

/**
 * Verify an OTP for an identifier
 * @param identifier - The email or phone number
 * @param userId - The user ID
 * @param providedOTP - The OTP provided by the user
 * @returns Verification result with success status and message
 */
export function verifyOTP(identifier: string, userId: string, providedOTP: string): {
  success: boolean;
  message: string;
  remainingAttempts: number;
  expired: boolean;
} {
  const entry = otpStore.get(identifier) || otpStore.get(`user:${userId}`);
  
  if (!entry) {
    return {
      success: false,
      message: 'No OTP found. Please request a new verification code.',
      remainingAttempts: 0,
      expired: true,
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(identifier);
    otpStore.delete(`user:${userId}`);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
      remainingAttempts: 0,
      expired: true,
    };
  }

  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    const cooldownRemaining = Math.ceil((entry.lastAttempt + (OTP_COOLDOWN_MINUTES * 60 * 1000) - Date.now()) / 1000);
    if (cooldownRemaining > 0) {
      return {
        success: false,
        message: `Too many failed attempts. Please wait ${cooldownRemaining} seconds before trying again.`,
        remainingAttempts: 0,
        expired: false,
      };
    }
    entry.attempts = 0;
  }

  entry.attempts++;
  entry.lastAttempt = Date.now();

  if (verifyOTPHash(providedOTP, entry.otp)) {
    otpStore.delete(identifier);
    otpStore.delete(`user:${userId}`);
    return {
      success: true,
      message: 'Verification successful!',
      remainingAttempts: OTP_MAX_ATTEMPTS - entry.attempts,
      expired: false,
    };
  }

  return {
    success: false,
    message: 'Invalid verification code. Please try again.',
    remainingAttempts: OTP_MAX_ATTEMPTS - entry.attempts,
    expired: false,
  };
}

/**
 * Store a verification token for email verification
 * @param email - The email to verify
 * @param userId - The user ID
 * @returns The verification token
 */
export function storeVerificationToken(email: string, userId: string): string {
  const token = generateVerificationToken();
  const entry: VerificationToken = {
    token,
    email,
    userId,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
  };

  verificationTokens.set(token, entry);
  return token;
}

/**
 * Verify a verification token
 * @param token - The verification token
 * @returns Verification result
 */
export function verifyVerificationToken(token: string): {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
} {
  const entry = verificationTokens.get(token);

  if (!entry) {
    return {
      success: false,
      message: 'Invalid verification token.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    verificationTokens.delete(token);
    return {
      success: false,
      message: 'Verification token has expired.',
    };
  }

  return {
    success: true,
    message: 'Verification successful!',
    userId: entry.userId,
    email: entry.email,
  };
}

/**
 * Clean up expired OTP entries
 */
export function cleanupExpiredOTPs(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(key);
      cleaned++;
    }
  }

  for (const [key, entry] of verificationTokens.entries()) {
    if (now > entry.expiresAt) {
      verificationTokens.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get OTP status for an identifier
 */
export function getOTPStatus(identifier: string): {
  exists: boolean;
  expired: boolean;
  remainingAttempts: number;
  expiresAt?: number;
} {
  const entry = otpStore.get(identifier);
  
  if (!entry) {
    return {
      exists: false,
      expired: false,
      remainingAttempts: OTP_MAX_ATTEMPTS,
    };
  }

  const expired = Date.now() > entry.expiresAt;
  const remainingAttempts = expired ? OTP_MAX_ATTEMPTS : Math.max(0, OTP_MAX_ATTEMPTS - entry.attempts);

  return {
    exists: true,
    expired,
    remainingAttempts,
    expiresAt: entry.expiresAt,
  };
}

/**
 * Cancel/delete an OTP for an identifier
 */
export function cancelOTP(identifier: string, userId: string): void {
  otpStore.delete(identifier);
  otpStore.delete(`user:${userId}`);
}

/**
 * Initialize cleanup interval
 */
export function initializeOTPService(): void {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
  console.log('[EmailVerification] Service initialized');
}

export default {
  generateSecureOTP,
  generateVerificationToken,
  hashOTP,
  verifyOTPHash,
  storeOTP,
  verifyOTP,
  storeVerificationToken,
  verifyVerificationToken,
  cleanupExpiredOTPs,
  getOTPStatus,
  cancelOTP,
  initializeOTPService,
};
