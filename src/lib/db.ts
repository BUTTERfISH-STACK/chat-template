// Mock database for development - no Prisma required
// This file provides mock data for all database operations

export const mockDb = {
  // Users
  users: new Map<string, any>(),
  
  // OTP codes
  otps: new Map<string, { code: string; expiresAt: Date; used: boolean }>(),
  
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
