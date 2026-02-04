/**
 * Local-first data persistence layer for the chat-template platform
 * 
 * This module provides a complete data persistence solution using:
 * - LocalStorage for persistent data (users, conversations, messages, stores, products, orders, reviews)
 * - SessionStorage for session-specific data (OTPs, sessions)
 * - Cookies for authentication tokens
 * 
 * No external database required - everything runs client-side!
 */

// ============== TYPES ==============

export type {
  // User types
  User,
  UserCreateInput,
  UserUpdateInput,
  
  // Conversation types
  Conversation,
  ConversationCreateInput,
  ConversationUpdateInput,
  
  // ConversationParticipant types
  ConversationParticipant,
  ConversationParticipantCreateInput,
  
  // Message types
  Message,
  MessageCreateInput,
  MessageUpdateInput,
  
  // Store types
  Store,
  StoreCreateInput,
  StoreUpdateInput,
  
  // Product types
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  
  // Order types
  Order,
  OrderCreateInput,
  OrderUpdateInput,
  
  // Review types
  Review,
  ReviewCreateInput,
  
  // OTP types
  OTP,
  OTPCreateInput,
  
  // Session types
  Session,
  SessionCreateInput,
  
  // Query types
  PaginationOptions,
  WhereClause,
} from './types';

export {
  // Enums
  ConversationType,
  MessageType,
  OrderStatus,
  OTPType,
  
  // Storage keys
  StorageKeys,
} from './types';

// ============== STORAGE SERVICE ==============

export {
  // Utility functions
  generateId,
  now,
  isBrowser,
  safeJsonParse,
  safeJsonStringify,
  
  // LocalStorage operations
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
  
  // SessionStorage operations
  getFromSessionStorage,
  setToSessionStorage,
  removeFromSessionStorage,
  clearSessionStorage,
  
  // Cookie operations
  setCookie,
  getCookie,
  removeCookie,
  clearCookies,
  
  // Generic CRUD operations
  find,
  findUnique,
  create,
  update,
  remove,
  count,
  
  // Repositories
  repositories,
  userRepository,
  conversationRepository,
  messageRepository,
  storeRepository,
  productRepository,
  orderRepository,
  reviewRepository,
  otpRepository,
  sessionRepository,
  
  // Managers
  managers,
  currentUserManager,
  activeConversationManager,
  authTokenManager,
  refreshTokenManager,
  
  // Cleanup functions
  clearAllData,
  cleanupExpiredData,
} from './storage-service';

// ============== STATE MANAGEMENT ==============

export {
  // Context and Provider
  AppProvider,
  AppContext,
  
  // Main hook
  useAppContext,
  
  // Specialized hooks
  useAuth,
  useChat,
  useMarketplace,
  useLoading,
  
  // Event listener hooks
  useStorageSyncListener,
  useVisibilityRefresh,
  
  // Utility hooks
  useUserById,
  useConversationById,
  useStoreById,
  useProductById,
  useProductReviews,
  useUserOrders,
  useStoreProducts,
  useUserConversations,
} from './state-manager';

export type {
  AppContextType,
  AppState,
  AppActions,
  AppProviderProps,
} from './state-manager';

// ============== USAGE EXAMPLES ==============

/**
 * Basic Usage Examples:
 * 
 * ```tsx
 * // 1. Wrap your app with the AppProvider
 * import { AppProvider } from '@/lib/storage';
 * 
 * export default function RootLayout({ children }) {
 *   return <AppProvider>{children}</AppProvider>;
 * }
 * 
 * // 2. Use the storage service directly
 * import { repositories, generateId } from '@/lib/storage';
 * 
 * // Create a user
 * const user = repositories.user.create({
 *   email: 'user@example.com',
 *   password: 'hashedPassword',
 *   name: 'John Doe',
 * });
 * 
 * // Find users
 * const users = repositories.user.find({ isVerified: true });
 * 
 * // 3. Use React hooks in components
 * import { useAuth, useChat } from '@/lib/storage';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   const { conversations, activeConversation, messages } = useChat();
 *   
 *   // ... component logic
 * }
 * 
 * // 4. Use utility hooks
 * import { useUserById, useProductById } from '@/lib/storage';
 * 
 * function UserProfile({ userId }) {
 *   const user = useUserById(userId);
 *   // ...
 * }
 * ```
 */