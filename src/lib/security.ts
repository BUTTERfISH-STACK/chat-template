/**
 * Security Utilities Module
 * Provides secure OTP generation, hashing, validation, and rate limiting
 * Addresses security vulnerabilities in the authentication system
 */

import crypto from 'crypto';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SECURITY_CONFIG = {
  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  OTP_MAX_ATTEMPTS: 5,
  OTP_RETRY_DELAY_MS: 30 * 1000, // 30 seconds
  
  // Token Configuration
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 10,
  
  // Phone Number Configuration
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
} as const;

// ============================================================================
// OTP GENERATION AND VALIDATION
// ============================================================================

/**
 * Generate a cryptographically secure random OTP
 * Uses crypto.randomBytes for better security than Math.random()
 * @returns A 6-digit OTP as a string
 */
export function generateSecureOTP(): string {
  // Generate 4 random bytes (32 bits) to ensure uniform distribution
  const randomBytes = crypto.randomBytes(4);
  // Convert to a number and take modulo 1,000,000 to get 6 digits
  const otpNumber = randomBytes.readUInt32BE(0) % 1000000;
  // Pad with leading zeros to ensure 6 digits
  return otpNumber.toString().padStart(6, '0');
}

/**
 * Hash an OTP using SHA-256 with a salt
 * Prevents timing attacks and provides secure storage
 * @param otp - The OTP to hash
 * @param salt - Optional salt for additional security
 * @returns The hashed OTP as a hex string
 */
export function hashOTP(otp: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256');
  hash.update(actualSalt);
  hash.update(otp);
  return `${actualSalt}:${hash.digest('hex')}`;
}

/**
 * Verify an OTP against a stored hash
 * Uses constant-time comparison to prevent timing attacks
 * @param otp - The OTP to verify
 * @param storedHash - The stored hash (format: salt:hash)
 * @returns True if the OTP matches, false otherwise
 */
export function verifyOTP(otp: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) {
      return false;
    }
    
    const computedHash = hashOTP(otp, salt);
    const storedHashPart = computedHash.split(':')[1];
    
    // Use timing-safe comparison to prevent timing attacks
    return constantTimeCompare(storedHashPart, hash);
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal, false otherwise
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  
  let result = 0;
  for (let i = 0; i < aBuffer.length; i++) {
    result |= aBuffer[i] ^ bBuffer[i];
  }
  
  return result === 0;
}

// ============================================================================
// TOKEN GENERATION AND VALIDATION
// ============================================================================

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns A hex-encoded token
 */
export function generateSecureToken(length: number = SECURITY_CONFIG.TOKEN_LENGTH): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a session token with expiration
 * @returns An object containing the token and expiration timestamp
 */
export function generateSessionToken(): { token: string; expiresAt: number } {
  const token = generateSecureToken();
  const expiresAt = Date.now() + SECURITY_CONFIG.TOKEN_EXPIRY_MS;
  return { token, expiresAt };
}

/**
 * Verify if a session token is still valid
 * @param expiresAt - The expiration timestamp of the token
 * @returns True if the token is still valid, false otherwise
 */
export function isTokenValid(expiresAt: number): boolean {
  return Date.now() < expiresAt;
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validate a phone number format
 * Supports international formats with country codes
 * @param phoneNumber - The phone number to validate
 * @returns True if valid, false otherwise
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  
  // Remove all non-digit characters except +
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check length constraints
  if (normalized.length < SECURITY_CONFIG.PHONE_MIN_LENGTH || 
      normalized.length > SECURITY_CONFIG.PHONE_MAX_LENGTH) {
    return false;
  }
  
  // Validate format: must start with + followed by digits, or be all digits
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(normalized);
}

/**
 * Normalize a phone number to a consistent format
 * @param phoneNumber - The phone number to normalize
 * @returns The normalized phone number
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  return phoneNumber.replace(/[^\d+]/g, '');
}

/**
 * Validate OTP format
 * @param otp - The OTP to validate
 * @returns True if valid, false otherwise
 */
export function validateOTP(otp: string): boolean {
  if (!otp || typeof otp !== 'string') {
    return false;
  }
  
  // Must be exactly 6 digits
  return /^\d{6}$/.test(otp);
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input - The input to sanitize
 * @returns The sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Simple but effective email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

/**
 * In-memory rate limiter (use Redis in production)
 * Maps IP addresses to rate limit entries
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, phone number, etc.)
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // If no entry exists, create a new one
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(identifier, newEntry);
    
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: newEntry.resetAt,
    };
  }
  
  // Check if currently blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: entry.blockedUntil - now,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    // Block for the remainder of the window
    entry.blockedUntil = entry.resetAt;
    rateLimitStore.set(identifier, entry);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: entry.resetAt - now,
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(identifier, entry);
  
  return {
    allowed: true,
    remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier
 * @param identifier - The identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// ============================================================================
// SECURITY LOGGING
// ============================================================================

export enum SecurityEventType {
  OTP_GENERATED = 'OTP_GENERATED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  OTP_FAILED = 'OTP_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
}

interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  identifier?: string;
  details?: Record<string, any>;
}

/**
 * Log a security event
 * In production, send to a centralized logging service
 * @param event - The security event to log
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY]', JSON.stringify(logEntry, null, 2));
  }
  
  // In production, send to logging service (e.g., Sentry, Datadog)
  // TODO: Implement production logging
}

// ============================================================================
// COOKIE SECURITY
// ============================================================================

/**
 * Generate secure cookie options
 * @param maxAge - Maximum age in seconds
 * @returns Cookie options object
 */
export function getSecureCookieOptions(maxAge: number = 7 * 24 * 60 * 60): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Prevent CSRF
    path: '/',
    maxAge,
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const SecurityErrorCodes = {
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_ATTEMPTS_EXCEEDED: 'OTP_ATTEMPTS_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
} as const;

/**
 * Create a standardized error response
 * @param error - The error to format
 * @returns A formatted error object
 */
export function formatSecurityError(error: SecurityError): {
  error: string;
  code: string;
  statusCode: number;
} {
  return {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize security utilities
 * Sets up periodic cleanup of rate limits
 */
export function initializeSecurity(): void {
  // Clean up rate limits every 5 minutes
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
  
  console.log('[Security] Security utilities initialized');
}
