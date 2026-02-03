// Mock database for development - no Prisma required
// OTP functionality has been removed

/**
 * Format phone number consistently - removes non-digits and adds + prefix
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export const mockDb = {
  // Users
  users: new Map<string, any>(),
  
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
