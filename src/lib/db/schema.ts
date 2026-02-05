// Drizzle ORM Database Schema
// Using SQLite with better-sqlite3

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { SQL } from 'drizzle-orm';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  phoneNumber: text('phone_number').unique().notNull(),
  name: text('name'),
  email: text('email'),
  avatar: text('avatar'),
  bio: text('bio'),
  password: text('password'),
  authToken: text('auth_token'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
});

// Conversations table
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  name: text('name'),
  type: text('type').default('DIRECT'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
});

// Conversation participants table
export const conversationParticipants = sqliteTable('conversation_participants', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }),
});

// Messages table
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  type: text('type').default('TEXT'),
  mediaUrl: text('media_url'),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Stores table
export const stores = sqliteTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logo: text('logo'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address'),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: real('rating').default(0),
  totalSales: integer('total_sales').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
});

// Products table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  image: text('image'),
  category: text('category').notNull(),
  stock: integer('stock').default(0),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
});

// Orders table
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  status: text('status').default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdateFn(() => new Date()),
});

// Order items table
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
});

// Reviews table
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Type exports for use in API routes
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type MessageType = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type StoreType = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type ProductType = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type OrderType = typeof orders.$inferSelect;
export type OrderItemType = typeof orderItems.$inferInsert;
