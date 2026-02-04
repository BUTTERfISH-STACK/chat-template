/**
 * Local-first storage service using LocalStorage, SessionStorage, and Cookies
 * Provides CRUD operations for all entities in the chat-template platform
 */

import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  Conversation,
  ConversationCreateInput,
  ConversationUpdateInput,
  ConversationParticipant,
  ConversationParticipantCreateInput,
  Message,
  MessageCreateInput,
  MessageUpdateInput,
  Store,
  StoreCreateInput,
  StoreUpdateInput,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  Order,
  OrderCreateInput,
  OrderUpdateInput,
  Review,
  ReviewCreateInput,
  OTP,
  OTPCreateInput,
  Session,
  SessionCreateInput,
  StorageKeys,
  PaginationOptions,
  WhereClause,
} from './types';

// ============== UTILITY FUNCTIONS ==============

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(value: any): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

// ============== LOCAL STORAGE OPERATIONS ==============

/**
 * Get data from LocalStorage
 */
export function getFromLocalStorage<T>(key: string): T[] {
  if (!isBrowser()) return [];
  const value = localStorage.getItem(key);
  return safeJsonParse<T[]>(value, []);
}

/**
 * Set data to LocalStorage
 */
export function setToLocalStorage<T>(key: string, data: T[]): boolean {
  if (!isBrowser()) return false;
  const value = safeJsonStringify(data);
  if (!value) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} to LocalStorage:`, error);
    return false;
  }
}

/**
 * Remove data from LocalStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from LocalStorage:`, error);
    return false;
  }
}

/**
 * Clear all LocalStorage data
 */
export function clearLocalStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing LocalStorage:', error);
    return false;
  }
}

// ============== SESSION STORAGE OPERATIONS ==============

/**
 * Get data from SessionStorage
 */
export function getFromSessionStorage<T>(key: string): T[] {
  if (!isBrowser()) return [];
  const value = sessionStorage.getItem(key);
  return safeJsonParse<T[]>(value, []);
}

/**
 * Set data to SessionStorage
 */
export function setToSessionStorage<T>(key: string, data: T[]): boolean {
  if (!isBrowser()) return false;
  const value = safeJsonStringify(data);
  if (!value) return false;
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} to SessionStorage:`, error);
    return false;
  }
}

/**
 * Remove data from SessionStorage
 */
export function removeFromSessionStorage(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from SessionStorage:`, error);
    return false;
  }
}

/**
 * Clear all SessionStorage data
 */
export function clearSessionStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing SessionStorage:', error);
    return false;
  }
}

// ============== COOKIE OPERATIONS ==============

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, days: number = 7): boolean {
  if (!isBrowser()) return false;
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    return true;
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
    return false;
  }
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return null;
  }
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string): boolean {
  if (!isBrowser()) return false;
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    return true;
  } catch (error) {
    console.error(`Error removing cookie ${name}:`, error);
    return false;
  }
}

/**
 * Clear all cookies
 */
export function clearCookies(): boolean {
  if (!isBrowser()) return false;
  try {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    return true;
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return false;
  }
}

// ============== GENERIC CRUD OPERATIONS ==============

/**
 * Generic find operation with filtering and pagination
 */
export function find<T extends Record<string, any>>(
  items: T[],
  where?: WhereClause,
  options?: PaginationOptions
): T[] {
  let result = [...items];

  // Apply filters
  if (where) {
    result = result.filter((item) => {
      return Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested conditions
          if ('equals' in value) return item[key] === value.equals;
          if ('in' in value) return (value.in as any[]).includes(item[key]);
          if ('contains' in value) {
            const itemValue = String(item[key] ?? '');
            return itemValue.toLowerCase().includes(String(value.contains).toLowerCase());
          }
          if ('gt' in value) return item[key] > value.gt;
          if ('gte' in value) return item[key] >= value.gte;
          if ('lt' in value) return item[key] < value.lt;
          if ('lte' in value) return item[key] <= value.lte;
        }
        return item[key] === value;
      });
    });
  }

  // Apply sorting
  if (options?.orderBy) {
    const [sortKey, sortDirection] = Object.entries(options.orderBy)[0];
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply pagination
  if (options?.skip !== undefined || options?.take !== undefined) {
    const skip = options.skip ?? 0;
    const take = options.take ?? result.length;
    result = result.slice(skip, skip + take);
  }

  return result;
}

/**
 * Generic find unique operation
 */
export function findUnique<T extends Record<string, any>>(
  items: T[],
  where: WhereClause
): T | null {
  const results = find(items, where, { take: 1 });
  return results.length > 0 ? results[0] : null;
}

/**
 * Generic create operation
 */
export function create<T extends Record<string, any>>(
  items: T[],
  data: any
): T[] {
  const newItem = {
    ...data,
    id: generateId(),
    createdAt: data.createdAt ?? now(),
    updatedAt: data.updatedAt ?? now(),
  } as T;
  return [...items, newItem];
}

/**
 * Generic update operation
 */
export function update<T extends Record<string, any>>(
  items: T[],
  id: string,
  data: any
): T[] {
  return items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...data,
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: data.updatedAt ?? now(),
      } as T;
    }
    return item;
  });
}

/**
 * Generic delete operation
 */
export function remove<T extends Record<string, any>>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Generic count operation
 */
export function count<T extends Record<string, any>>(items: T[], where?: WhereClause): number {
  return find(items, where).length;
}

// ============== USER REPOSITORY ==============

const USERS_KEY = 'chat_users';

export const userRepository = {
  getAll: (): User[] => getFromLocalStorage<User>(USERS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): User[] => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    return find(users, where, options);
  },

  findUnique: (where: WhereClause): User | null => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    return findUnique(users, where);
  },

  findById: (id: string): User | null => {
    return userRepository.findUnique({ id });
  },

  findByEmail: (email: string): User | null => {
    return userRepository.findUnique({ email });
  },

  findByPhone: (phone: string): User | null => {
    return userRepository.findUnique({ phone });
  },

  create: (data: UserCreateInput): User => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    const newUsers = create(users, {
      ...data,
      isVerified: false,
    });
    setToLocalStorage(USERS_KEY, newUsers);
    return newUsers[newUsers.length - 1];
  },

  update: (id: string, data: UserUpdateInput): User | null => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    const updatedUsers = update(users, id, data);
    setToLocalStorage(USERS_KEY, updatedUsers);
    return updatedUsers.find((u) => u.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    const filteredUsers = remove(users, id);
    setToLocalStorage(USERS_KEY, filteredUsers);
    return users.length !== filteredUsers.length;
  },

  count: (where?: WhereClause): number => {
    const users = getFromLocalStorage<User>(USERS_KEY);
    return count(users, where);
  },
};

// ============== CONVERSATION REPOSITORY ==============

const CONVERSATIONS_KEY = 'chat_conversations';
const CONVERSATION_PARTICIPANTS_KEY = 'chat_conversation_participants';

export const conversationRepository = {
  getAll: (): Conversation[] => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
    return conversations.map((conv) => ({
      ...conv,
      participants: participants.filter((p) => p.conversationId === conv.id),
    }));
  },

  find: (where?: WhereClause, options?: PaginationOptions): Conversation[] => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
    const filtered = find(conversations, where, options);
    return filtered.map((conv) => ({
      ...conv,
      participants: participants.filter((p) => p.conversationId === conv.id),
    }));
  },

  findUnique: (where: WhereClause): Conversation | null => {
    const results = conversationRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Conversation | null => {
    return conversationRepository.findUnique({ id });
  },

  findByUserId: (userId: string): Conversation[] => {
    const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
    const userParticipantIds = participants.filter((p) => p.userId === userId).map((p) => p.conversationId);
    return conversationRepository.find({ id: { in: userParticipantIds } });
  },

  create: (data: ConversationCreateInput): Conversation => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
    
    const newConversations = create(conversations, {
      name: data.name,
      type: data.type,
      avatar: data.avatar,
      participants: [],
      _participants: data.participantIds,
    });
    
    const conversationId = newConversations[newConversations.length - 1].id;
    
    const newParticipants: ConversationParticipant[] = data.participantIds.map((userId) => ({
      id: generateId(),
      userId,
      conversationId,
      joinedAt: now(),
    }));
    
    setToLocalStorage(CONVERSATIONS_KEY, newConversations);
    setToSessionStorage(CONVERSATION_PARTICIPANTS_KEY, [...participants, ...newParticipants]);
    
    return {
      ...newConversations[newConversations.length - 1],
      participants: newParticipants,
    };
  },

  update: (id: string, data: ConversationUpdateInput): Conversation | null => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const updatedConversations = update(conversations, id, data);
    setToLocalStorage(CONVERSATIONS_KEY, updatedConversations);
    
    if (data.participantIds) {
      const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
      const existingParticipants = participants.filter((p) => p.conversationId === id);
      const existingUserIds = existingParticipants.map((p) => p.userId);
      
      const toAdd = data.participantIds.filter((uid) => !existingUserIds.includes(uid));
      const toRemove = existingParticipants.filter((p) => !data.participantIds!.includes(p.userId));
      
      const newParticipants: ConversationParticipant[] = toAdd.map((userId) => ({
        id: generateId(),
        userId,
        conversationId: id,
        joinedAt: now(),
      }));
      
      const updatedParticipants = [
        ...participants.filter((p) => !toRemove.some((tr) => tr.id === p.id)),
        ...newParticipants,
      ];
      
      setToSessionStorage(CONVERSATION_PARTICIPANTS_KEY, updatedParticipants);
    }
    
    return conversationRepository.findById(id);
  },

  delete: (id: string): boolean => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const participants = getFromLocalStorage<ConversationParticipant>(CONVERSATION_PARTICIPANTS_KEY);
    
    const filteredConversations = remove(conversations, id);
    const filteredParticipants = participants.filter((p) => p.conversationId !== id);
    
    setToLocalStorage(CONVERSATIONS_KEY, filteredConversations);
    setToSessionStorage(CONVERSATION_PARTICIPANTS_KEY, filteredParticipants);
    
    return conversations.length !== filteredConversations.length;
  },

  count: (where?: WhereClause): number => {
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    return count(conversations, where);
  },
};

// ============== MESSAGE REPOSITORY ==============

const MESSAGES_KEY = 'chat_messages';

export const messageRepository = {
  getAll: (): Message[] => getFromLocalStorage<Message>(MESSAGES_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Message[] => {
    const messages = getFromLocalStorage<Message>(MESSAGES_KEY);
    return find(messages, where, options);
  },

  findUnique: (where: WhereClause): Message | null => {
    const results = messageRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Message | null => {
    return messageRepository.findUnique({ id });
  },

  findByConversationId: (conversationId: string, options?: PaginationOptions): Message[] => {
    return messageRepository.find({ conversationId }, options);
  },

  create: (data: MessageCreateInput): Message => {
    const messages = getFromLocalStorage<Message>(MESSAGES_KEY);
    const newMessages = create(messages, data);
    setToLocalStorage(MESSAGES_KEY, newMessages);
    
    // Update conversation's updatedAt timestamp
    const conversations = getFromLocalStorage<Conversation>(CONVERSATIONS_KEY);
    const updatedConversations = update(conversations, data.conversationId, {});
    setToLocalStorage(CONVERSATIONS_KEY, updatedConversations);
    
    return newMessages[newMessages.length - 1];
  },

  update: (id: string, data: MessageUpdateInput): Message | null => {
    const messages = getFromLocalStorage<Message>(MESSAGES_KEY);
    const updatedMessages = update(messages, id, data);
    setToLocalStorage(MESSAGES_KEY, updatedMessages);
    return updatedMessages.find((m) => m.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const messages = getFromLocalStorage<Message>(MESSAGES_KEY);
    const filteredMessages = remove(messages, id);
    setToLocalStorage(MESSAGES_KEY, filteredMessages);
    return messages.length !== filteredMessages.length;
  },

  count: (where?: WhereClause): number => {
    const messages = getFromLocalStorage<Message>(MESSAGES_KEY);
    return count(messages, where);
  },
};

// ============== STORE REPOSITORY ==============

const STORES_KEY = 'chat_stores';

export const storeRepository = {
  getAll: (): Store[] => getFromLocalStorage<Store>(STORES_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Store[] => {
    const stores = getFromLocalStorage<Store>(STORES_KEY);
    return find(stores, where, options);
  },

  findUnique: (where: WhereClause): Store | null => {
    const results = storeRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Store | null => {
    return storeRepository.findUnique({ id });
  },

  findByOwnerId: (ownerId: string): Store[] => {
    return storeRepository.find({ ownerId });
  },

  create: (data: StoreCreateInput): Store => {
    const stores = getFromLocalStorage<Store>(STORES_KEY);
    const newStores = create(stores, {
      ...data,
      rating: 0,
      reviewCount: 0,
    });
    setToLocalStorage(STORES_KEY, newStores);
    return newStores[newStores.length - 1];
  },

  update: (id: string, data: StoreUpdateInput): Store | null => {
    const stores = getFromLocalStorage<Store>(STORES_KEY);
    const updatedStores = update(stores, id, data);
    setToLocalStorage(STORES_KEY, updatedStores);
    return updatedStores.find((s) => s.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const stores = getFromLocalStorage<Store>(STORES_KEY);
    const filteredStores = remove(stores, id);
    setToLocalStorage(STORES_KEY, filteredStores);
    return stores.length !== filteredStores.length;
  },

  count: (where?: WhereClause): number => {
    const stores = getFromLocalStorage<Store>(STORES_KEY);
    return count(stores, where);
  },
};

// ============== PRODUCT REPOSITORY ==============

const PRODUCTS_KEY = 'chat_products';

export const productRepository = {
  getAll: (): Product[] => getFromLocalStorage<Product>(PRODUCTS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Product[] => {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    return find(products, where, options);
  },

  findUnique: (where: WhereClause): Product | null => {
    const results = productRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Product | null => {
    return productRepository.findUnique({ id });
  },

  findByStoreId: (storeId: string, options?: PaginationOptions): Product[] => {
    return productRepository.find({ storeId }, options);
  },

  findByCategory: (category: string, options?: PaginationOptions): Product[] => {
    return productRepository.find({ category }, options);
  },

  create: (data: ProductCreateInput): Product => {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    const newProducts = create(products, {
      ...data,
      rating: 0,
      reviewCount: 0,
    });
    setToLocalStorage(PRODUCTS_KEY, newProducts);
    return newProducts[newProducts.length - 1];
  },

  update: (id: string, data: ProductUpdateInput): Product | null => {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    const updatedProducts = update(products, id, data);
    setToLocalStorage(PRODUCTS_KEY, updatedProducts);
    return updatedProducts.find((p) => p.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    const filteredProducts = remove(products, id);
    setToLocalStorage(PRODUCTS_KEY, filteredProducts);
    return products.length !== filteredProducts.length;
  },

  count: (where?: WhereClause): number => {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    return count(products, where);
  },
};

// ============== ORDER REPOSITORY ==============

const ORDERS_KEY = 'chat_orders';

export const orderRepository = {
  getAll: (): Order[] => getFromLocalStorage<Order>(ORDERS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Order[] => {
    const orders = getFromLocalStorage<Order>(ORDERS_KEY);
    return find(orders, where, options);
  },

  findUnique: (where: WhereClause): Order | null => {
    const results = orderRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Order | null => {
    return orderRepository.findUnique({ id });
  },

  findByUserId: (userId: string, options?: PaginationOptions): Order[] => {
    return orderRepository.find({ userId }, options);
  },

  findByStoreId: (storeId: string, options?: PaginationOptions): Order[] => {
    return orderRepository.find({ storeId }, options);
  },

  create: (data: OrderCreateInput): Order => {
    const orders = getFromLocalStorage<Order>(ORDERS_KEY);
    const newOrders = create(orders, {
      ...data,
      status: data.status ?? OrderStatus.PENDING,
    });
    setToLocalStorage(ORDERS_KEY, newOrders);
    return newOrders[newOrders.length - 1];
  },

  update: (id: string, data: OrderUpdateInput): Order | null => {
    const orders = getFromLocalStorage<Order>(ORDERS_KEY);
    const updatedOrders = update(orders, id, data);
    setToLocalStorage(ORDERS_KEY, updatedOrders);
    return updatedOrders.find((o) => o.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const orders = getFromLocalStorage<Order>(ORDERS_KEY);
    const filteredOrders = remove(orders, id);
    setToLocalStorage(ORDERS_KEY, filteredOrders);
    return orders.length !== filteredOrders.length;
  },

  count: (where?: WhereClause): number => {
    const orders = getFromLocalStorage<Order>(ORDERS_KEY);
    return count(orders, where);
  },
};

// ============== REVIEW REPOSITORY ==============

const REVIEWS_KEY = 'chat_reviews';

export const reviewRepository = {
  getAll: (): Review[] => getFromLocalStorage<Review>(REVIEWS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Review[] => {
    const reviews = getFromLocalStorage<Review>(REVIEWS_KEY);
    return find(reviews, where, options);
  },

  findUnique: (where: WhereClause): Review | null => {
    const results = reviewRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Review | null => {
    return reviewRepository.findUnique({ id });
  },

  findByProductId: (productId: string, options?: PaginationOptions): Review[] => {
    return reviewRepository.find({ productId }, options);
  },

  findByUserId: (userId: string, options?: PaginationOptions): Review[] => {
    return reviewRepository.find({ userId }, options);
  },

  create: (data: ReviewCreateInput): Review => {
    const reviews = getFromLocalStorage<Review>(REVIEWS_KEY);
    const newReviews = create(reviews, data);
    setToLocalStorage(REVIEWS_KEY, newReviews);
    
    // Update product rating
    const productReviews = reviewRepository.findByProductId(data.productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    productRepository.update(data.productId, { rating: avgRating, reviewCount: productReviews.length });
    
    return newReviews[newReviews.length - 1];
  },

  delete: (id: string): boolean => {
    const reviews = getFromLocalStorage<Review>(REVIEWS_KEY);
    const review = reviews.find((r) => r.id === id);
    const filteredReviews = remove(reviews, id);
    setToLocalStorage(REVIEWS_KEY, filteredReviews);
    
    if (review) {
      const productReviews = reviewRepository.findByProductId(review.productId);
      const avgRating = productReviews.length > 0 
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
        : 0;
      productRepository.update(review.productId, { rating: avgRating, reviewCount: productReviews.length });
    }
    
    return reviews.length !== filteredReviews.length;
  },

  count: (where?: WhereClause): number => {
    const reviews = getFromLocalStorage<Review>(REVIEWS_KEY);
    return count(reviews, where);
  },
};

// ============== OTP REPOSITORY ==============

const OTPS_KEY = 'chat_otps';

export const otpRepository = {
  getAll: (): OTP[] => getFromSessionStorage<OTP>(OTPS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): OTP[] => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    return find(otps, where, options);
  },

  findUnique: (where: WhereClause): OTP | null => {
    const results = otpRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): OTP | null => {
    return otpRepository.findUnique({ id });
  },

  findByUserId: (userId: string): OTP[] => {
    return otpRepository.find({ userId });
  },

  findValid: (userId: string, code: string, type: string): OTP | null => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    const now = new Date();
    return otps.find(
      (otp) => 
        otp.userId === userId && 
        otp.code === code && 
        otp.type === type && 
        !otp.used && 
        new Date(otp.expiresAt) > now
    ) ?? null;
  },

  create: (data: OTPCreateInput): OTP => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    const newOtps = create(otps, {
      ...data,
      used: false,
    });
    setToSessionStorage(OTPS_KEY, newOtps);
    return newOtps[newOtps.length - 1];
  },

  markAsUsed: (id: string): OTP | null => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    const updatedOtps = update(otps, id, { used: true });
    setToSessionStorage(OTPS_KEY, updatedOtps);
    return updatedOtps.find((o) => o.id === id) ?? null;
  },

  delete: (id: string): boolean => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    const filteredOtps = remove(otps, id);
    setToSessionStorage(OTPS_KEY, filteredOtps);
    return otps.length !== filteredOtps.length;
  },

  cleanupExpired: (): number => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    const now = new Date();
    const validOtps = otps.filter((otp) => new Date(otp.expiresAt) > now);
    setToSessionStorage(OTPS_KEY, validOtps);
    return otps.length - validOtps.length;
  },

  count: (where?: WhereClause): number => {
    const otps = getFromSessionStorage<OTP>(OTPS_KEY);
    return count(otps, where);
  },
};

// ============== SESSION REPOSITORY ==============

const SESSIONS_KEY = 'chat_sessions';

export const sessionRepository = {
  getAll: (): Session[] => getFromSessionStorage<Session>(SESSIONS_KEY),

  find: (where?: WhereClause, options?: PaginationOptions): Session[] => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    return find(sessions, where, options);
  },

  findUnique: (where: WhereClause): Session | null => {
    const results = sessionRepository.find(where, { take: 1 });
    return results.length > 0 ? results[0] : null;
  },

  findById: (id: string): Session | null => {
    return sessionRepository.findUnique({ id });
  },

  findByToken: (token: string): Session | null => {
    return sessionRepository.findUnique({ token });
  },

  findByUserId: (userId: string): Session[] => {
    return sessionRepository.find({ userId });
  },

  create: (data: SessionCreateInput): Session => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    const newSessions = create(sessions, data);
    setToSessionStorage(SESSIONS_KEY, newSessions);
    return newSessions[newSessions.length - 1];
  },

  delete: (id: string): boolean => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    const filteredSessions = remove(sessions, id);
    setToSessionStorage(SESSIONS_KEY, filteredSessions);
    return sessions.length !== filteredSessions.length;
  },

  deleteByToken: (token: string): boolean => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    const filteredSessions = sessions.filter((s) => s.token !== token);
    setToSessionStorage(SESSIONS_KEY, filteredSessions);
    return sessions.length !== filteredSessions.length;
  },

  cleanupExpired: (): number => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    const now = new Date();
    const validSessions = sessions.filter((session) => new Date(session.expiresAt) > now);
    setToSessionStorage(SESSIONS_KEY, validSessions);
    return sessions.length - validSessions.length;
  },

  count: (where?: WhereClause): number => {
    const sessions = getFromSessionStorage<Session>(SESSIONS_KEY);
    return count(sessions, where);
  },
};

// ============== CURRENT USER MANAGEMENT ==============

const CURRENT_USER_KEY = 'chat_current_user';

export const currentUserManager = {
  get: (): User | null => {
    if (!isBrowser()) return null;
    const value = localStorage.getItem(CURRENT_USER_KEY);
    return safeJsonParse<User>(value, null);
  },

  set: (user: User): boolean => {
    if (!isBrowser()) return false;
    const value = safeJsonStringify(user);
    if (!value) return false;
    try {
      localStorage.setItem(CURRENT_USER_KEY, value);
      return true;
    } catch (error) {
      console.error('Error setting current user:', error);
      return false;
    }
  },

  clear: (): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing current user:', error);
      return false;
    }
  },
};

// ============== ACTIVE CONVERSATION MANAGEMENT ==============

const ACTIVE_CONVERSATION_KEY = 'chat_active_conversation';

export const activeConversationManager = {
  get: (): string | null => {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  },

  set: (conversationId: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
      return true;
    } catch (error) {
      console.error('Error setting active conversation:', error);
      return false;
    }
  },

  clear: (): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing active conversation:', error);
      return false;
    }
  },
};

// ============== AUTH TOKEN MANAGEMENT (COOKIES) ==============

export const authTokenManager = {
  get: (): string | null => {
    return getCookie('chat_auth_token');
  },

  set: (token: string, days: number = 7): boolean => {
    return setCookie('chat_auth_token', token, days);
  },

  clear: (): boolean => {
    return removeCookie('chat_auth_token');
  },
};

export const refreshTokenManager = {
  get: (): string | null => {
    return getCookie('chat_refresh_token');
  },

  set: (token: string, days: number = 30): boolean => {
    return setCookie('chat_refresh_token', token, days);
  },

  clear: (): boolean => {
    return removeCookie('chat_refresh_token');
  },
};

// ============== STORAGE CLEANUP ==============

/**
 * Clear all application data
 */
export function clearAllData(): boolean {
  if (!isBrowser()) return false;
  try {
    clearLocalStorage();
    clearSessionStorage();
    clearCookies();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

/**
 * Clear expired OTPs and sessions
 */
export function cleanupExpiredData(): { otps: number; sessions: number } {
  const otps = otpRepository.cleanupExpired();
  const sessions = sessionRepository.cleanupExpired();
  return { otps, sessions };
}

// ============== EXPORT ALL REPOSITORIES ==============

export const repositories = {
  user: userRepository,
  conversation: conversationRepository,
  message: messageRepository,
  store: storeRepository,
  product: productRepository,
  order: orderRepository,
  review: reviewRepository,
  otp: otpRepository,
  session: sessionRepository,
};

export const managers = {
  currentUser: currentUserManager,
  activeConversation: activeConversationManager,
  authToken: authTokenManager,
  refreshToken: refreshTokenManager,
};