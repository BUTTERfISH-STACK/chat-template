// Mock database for development - no Prisma required
// This file provides mock data for all database operations

// OTP storage with consistent phone number formatting
const otpStore = new Map<string, { code: string; expiresAt: Date; used: boolean; createdAt: number }>();

/**
 * Format phone number consistently - removes non-digits and adds + prefix
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Generate and store OTP for a phone number
 */
export function generateAndStoreOTP(phoneNumber: string): { code: string; expiresAt: Date } {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  otpStore.set(formattedPhone, {
    code,
    expiresAt,
    used: false,
    createdAt: Date.now(),
  });
  
  console.log(`[OTP] Generated for ${formattedPhone}: ${code}`);
  return { code, expiresAt };
}

/**
 * Verify OTP for a phone number
 */
export function verifyOTP(phoneNumber: string, inputCode: string): { valid: boolean; error?: string } {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const record = otpStore.get(formattedPhone);
  
  if (!record) {
    return { valid: false, error: 'OTP not found or expired' };
  }
  
  if (record.used) {
    return { valid: false, error: 'OTP has already been used' };
  }
  
  if (new Date() > record.expiresAt) {
    otpStore.delete(formattedPhone);
    return { valid: false, error: 'OTP has expired' };
  }
  
  if (record.code !== inputCode) {
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // Mark as used
  record.used = true;
  return { valid: true };
}

/**
 * Get OTP record for debugging
 */
export function getOTP(phoneNumber: string): string | null {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const record = otpStore.get(formattedPhone);
  if (record && !record.used && new Date() < record.expiresAt) {
    return record.code;
  }
  return null;
}

export const mockDb = {
  // Users
  users: new Map<string, any>(),
  
  // OTP codes (legacy - use otpStore functions instead)
  otps: otpStore,
  
  // Conversations
  conversations: new Map<string, any>(),
  conversationParticipants: new Map<string, any>(),
  
  // Messages
  messages: new Map<string, any>(),
  
  // Stores
  stores: new Map<string, any>(),
  
  // Products
  products: new Map<string, any>(),
  
  // Orders
  orders: new Map<string, any>(),
  orderItems: new Map<string, any>(),
  
  // Reviews
  reviews: new Map<string, any>(),
};

// Helper to generate IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default mockDb;
