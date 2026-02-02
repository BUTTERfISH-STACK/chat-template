// Simplified WhatsApp OTP service for development
// This version works without actual WhatsApp connection

// Import unified functions from db.ts to ensure consistency
import { formatPhoneNumber } from '@/lib/db';

// In-memory OTP store (legacy - now uses db.ts otpStore)
// Kept for backward compatibility with existing code
const otpStore = new Map<string, { otp: string; attempts: number; createdAt: number }>();

// Configuration
const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes (longer for testing)
const MAX_ATTEMPTS = 10; // More attempts for testing

/**
 * Generate a random 6-digit OTP (internal helper)
 */
function generateRandomOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate and store OTP for a phone number (legacy wrapper)
 */
export function generateOTP(phoneNumber: string): string {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const otp = generateRandomOTP();
  
  otpStore.set(formattedPhone, {
    otp,
    attempts: 0,
    createdAt: Date.now(),
  });
  
  console.log(`[OTP] Generated for ${formattedPhone}: ${otp}`);
  return otp;
}

/**
 * Verify OTP for a phone number (legacy wrapper)
 */
export function verifyOTP(phoneNumber: string, inputOTP: string): boolean {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const stored = otpStore.get(formattedPhone);
  
  console.log(`[OTP] Verifying for ${formattedPhone}, input: ${inputOTP}, stored: ${stored?.otp}`);
  
  if (!stored) {
    console.log(`[OTP] No OTP found for ${formattedPhone}`);
    return false;
  }
  
  // Check if OTP expired (15 minutes)
  const age = Date.now() - stored.createdAt;
  if (age > OTP_EXPIRY_MS) {
    console.log(`[OTP] OTP expired for ${formattedPhone} (age: ${Math.round(age/1000)}s)`);
    otpStore.delete(formattedPhone);
    return false;
  }
  
  // Increment attempts
  stored.attempts++;
  
  if (stored.attempts > MAX_ATTEMPTS) {
    console.log(`[OTP] Too many attempts for ${formattedPhone}`);
    otpStore.delete(formattedPhone);
    return false;
  }
  
  if (stored.otp === inputOTP) {
    console.log(`[OTP] Valid OTP for ${formattedPhone}`);
    otpStore.delete(formattedPhone);
    return true;
  }
  
  console.log(`[OTP] Invalid OTP for ${formattedPhone}. Expected: ${stored.otp}, Got: ${inputOTP}`);
  return false;
}

/**
 * Send OTP (development mode - just generates and logs)
 * Now uses unified db.ts functions
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; otp?: string; message: string }> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  try {
    // Use the unified generateOTP function from db.ts
    // Note: This might cause duplicate storage, but verify uses db.ts functions
    const { generateAndStoreOTP } = await import('@/lib/db');
    const { code } = generateAndStoreOTP(phoneNumber);
    
    console.log(`[DEV] OTP for ${formattedPhone}: ${code}`);
    
    return {
      success: true,
      otp: code,
      message: `OTP generated for ${formattedPhone}. Valid for 15 minutes.`,
    };
  } catch (error: any) {
    console.error('[OTP] Failed to generate OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate OTP',
    };
  }
}

// Re-export formatPhoneNumber for backward compatibility
export { formatPhoneNumber };

// Stub functions for WhatsApp connection (not used in development mode)
export function initWhatsApp(): Promise<void> {
  return Promise.resolve();
}

export function getQRCode(): string | null {
  return null;
}

export function isWhatsAppConnected(): boolean {
  return false;
}

export function disconnectWhatsApp(): void {
  // No-op
}

/**
 * Clean up expired OTPs (can be called periodically)
 */
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now - data.createdAt > OTP_EXPIRY_MS) {
      otpStore.delete(phone);
      console.log(`[OTP] Cleaned up expired OTP for ${phone}`);
    }
  }
}
