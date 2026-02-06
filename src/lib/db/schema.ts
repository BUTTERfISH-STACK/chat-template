/**
 * Vellon X - Complete Database Schema
 * Open-source social + marketplace platform
 * Using SQLite with Drizzle ORM
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

// ============================================================================
// UTILITIES
// ============================================================================

/** Generate UUID v4 */
export function generateUUID(): string {
  return randomUUID();
}

/** Current timestamp in ISO format */
export function now(): string {
  return new Date().toISOString();
}

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  sessionToken: text('session_token').unique(),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// PROFILES TABLE
// ============================================================================

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  avatarUrl: text('avatar_url'),
  statusMessage: text('status_message'),
  lastSeen: text('last_seen').default(now()),
  updatedAt: text('updated_at').default(now()),
});

// ============================================================================
// CONVERSATIONS TABLE
// ============================================================================

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  name: text('name'),
  createdAt: text('created_at').default(now()),
  updatedAt: text('updated_at').default(now()),
});

// ============================================================================
// CONVERSATION PARTICIPANTS TABLE
// ============================================================================

export const conversationParticipants = sqliteTable('conversation_participants', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: text('joined_at').default(now()),
  lastReadAt: text('last_read_at'),
});

// ============================================================================
// MESSAGES TABLE
// ============================================================================

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// MARKETPLACE ITEMS TABLE
// ============================================================================

export const marketplaceItems = sqliteTable('marketplace_items', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  sellerId: text('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(now()),
  updatedAt: text('updated_at').default(now()),
});

// ============================================================================
// MARKETPLACE ORDERS TABLE
// ============================================================================

export const marketplaceOrders = sqliteTable('marketplace_orders', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  buyerId: text('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  total: real('total').notNull(),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// MARKETPLACE ORDER ITEMS TABLE
// ============================================================================

export const marketplaceOrderItems = sqliteTable('marketplace_order_items', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  orderId: text('order_id').notNull().references(() => marketplaceOrders.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull().references(() => marketplaceItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: real('price_at_purchase').notNull(),
});

// ============================================================================
// MARKETPLACE REVIEWS TABLE
// ============================================================================

export const marketplaceReviews = sqliteTable('marketplace_reviews', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  itemId: text('item_id').notNull().references(() => marketplaceItems.id, { onDelete: 'cascade' }),
  reviewerId: text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// CONTACTS TABLE
// ============================================================================

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contactId: text('contact_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// NOTIFICATIONS TABLE (Optional)
// ============================================================================

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => generateUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(now()),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
