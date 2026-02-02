// Simplified WhatsApp OTP service for development
// This version works without actual WhatsApp connection

// In-memory OTP store
const otpStore = new Map<string, { otp: string; attempts: number; createdAt: number }>();

// Configuration
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

/**
 * Format phone number consistently (add + prefix if missing)
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Generate a random 6-digit OTP (internal helper)
 */
function generateRandomOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate and store OTP for a phone number
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
 * Verify OTP for a phone number
 */
export function verifyOTP(phoneNumber: string, inputOTP: string): boolean {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const stored = otpStore.get(formattedPhone);
  
  if (!stored) {
    console.log(`[OTP] No OTP found for ${formattedPhone}`);
    return false;
  }
  
  // Check if OTP expired (5 minutes)
  if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
    console.log(`[OTP] OTP expired for ${formattedPhone}`);
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
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; otp?: string; message: string }> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  try {
    // Generate OTP
    const otp = generateOTP(phoneNumber);
    
    console.log(`[DEV] OTP for ${formattedPhone}: ${otp}`);
    
    return {
      success: true,
      otp,
      message: 'OTP generated successfully. In development mode, check server console for OTP.',
    };
  } catch (error: any) {
    console.error('[OTP] Failed to generate OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate OTP',
    };
  }
}

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
