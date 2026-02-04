/**
 * Core type definitions for the chat-template platform
 * Local-first data persistence layer
 */

// ============== ENUMS ==============

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum OTPType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE'
}

// ============== USER TYPES ==============

export interface User {
  id: string;
  email: string;
  phone?: string;
  password: string; // Hashed password
  name: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  email: string;
  phone?: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export type UserUpdateInput = Partial<UserCreateInput & {
  isVerified?: boolean;
}>;

// ============== CONVERSATION TYPES ==============

export interface Conversation {
  id: string;
  name?: string;
  type: ConversationType;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  _participants?: string[]; // Internal array of participant IDs
}

export interface ConversationCreateInput {
  name?: string;
  type: ConversationType;
  avatar?: string;
  participantIds: string[];
}

export type ConversationUpdateInput = Partial<{
  name: string;
  avatar: string;
  participantIds: string[];
}>;

// ============== CONVERSATION PARTICIPANT TYPES ==============

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  lastReadAt?: string;
}

export interface ConversationParticipantCreateInput {
  userId: string;
  conversationId: string;
  lastReadAt?: string;
}

// ============== MESSAGE TYPES ==============

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCreateInput {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
}

export type MessageUpdateInput = Partial<{
  content: string;
  mediaUrl?: string;
}>;

// ============== STORE TYPES ==============

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCreateInput {
  ownerId: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
}

export type StoreUpdateInput = Partial<{
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  rating?: number;
  reviewCount?: number;
}>;

// ============== PRODUCT TYPES ==============

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateInput {
  storeId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

export type ProductUpdateInput = Partial<{
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
}>;

// ============== ORDER TYPES ==============

export interface Order {
  id: string;
  userId: string;
  productId: string;
  storeId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateInput {
  userId: string;
  productId: string;
  storeId: string;
  quantity: number;
  totalPrice: number;
  status?: OrderStatus;
}

export type OrderUpdateInput = Partial<{
  status: OrderStatus;
  quantity: number;
  totalPrice: number;
}>;

// ============== REVIEW TYPES ==============

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface ReviewCreateInput {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
}

// ============== OTP TYPES ==============

export interface OTP {
  id: string;
  userId: string;
  code: string;
  type: OTPType;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface OTPCreateInput {
  userId: string;
  code: string;
  type: OTPType;
  expiresAt: string;
}

// ============== SESSION TYPES ==============

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SessionCreateInput {
  userId: string;
  token: string;
  expiresAt: string;
}

// ============== STORAGE KEYS ==============

export const StorageKeys = {
  // LocalStorage keys (persistent)
  USERS: 'chat_users',
  CONVERSATIONS: 'chat_conversations',
  CONVERSATION_PARTICIPANTS: 'chat_conversation_participants',
  MESSAGES: 'chat_messages',
  STORES: 'chat_stores',
  PRODUCTS: 'chat_products',
  ORDERS: 'chat_orders',
  REVIEWS: 'chat_reviews',
  
  // SessionStorage keys (session-specific)
  SESSIONS: 'chat_sessions',
  OTps: 'chat_otps',
  CURRENT_USER: 'chat_current_user',
  ACTIVE_CONVERSATION: 'chat_active_conversation',
  
  // Cookie keys
  AUTH_TOKEN: 'chat_auth_token',
  REFRESH_TOKEN: 'chat_refresh_token',
  USER_PREFERENCES: 'chat_preferences',
} as const;

// ============== QUERY FILTERS ==============

export interface PaginationOptions {
  skip?: number;
  take?: number;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
}

export interface WhereClause {
  [key: string]: any;
}