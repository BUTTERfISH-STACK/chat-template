/**
 * State management utilities for the chat-template platform
 * Provides React hooks and context for managing application state
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type {
  User,
  Conversation,
  Message,
  Store,
  Product,
  Order,
  Review,
} from './types';
import {
  repositories,
  managers,
  cleanupExpiredData,
  isBrowser,
} from './storage-service';

// ============== CONTEXT TYPES ==============

interface AppState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Chat state
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  
  // Marketplace state
  stores: Store[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
}

interface AppActions {
  // User actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  
  // Chat actions
  loadConversations: () => void;
  setActiveConversation: (conversationId: string | null) => void;
  loadMessages: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  
  // Marketplace actions
  loadStores: () => void;
  loadProducts: (storeId?: string) => void;
  loadOrders: (userId?: string) => void;
  loadReviews: (productId?: string) => void;
  
  // Refresh actions
  refreshData: () => void;
  cleanupExpired: () => void;
}

interface AppContextType extends AppState, AppActions {}

// ============== CONTEXT ==============

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============== PROVIDER ==============

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // User state
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Marketplace state
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app state
  useEffect(() => {
    if (!isBrowser()) return;
    
    const initializeApp = () => {
      setIsLoading(true);
      
      try {
        // Load current user
        const user = managers.currentUser.get();
        setCurrentUserState(user);
        setIsAuthenticated(!!user);
        
        // Load active conversation
        const activeConvId = managers.activeConversation.get();
        setActiveConversationIdState(activeConvId);
        
        // Load initial data
        loadConversations();
        loadStores();
        loadProducts();
        
        if (user) {
          loadOrders(user.id);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
    
    // Cleanup expired data periodically
    const cleanupInterval = setInterval(() => {
      cleanupExpiredData();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
      managers.activeConversation.set(activeConversationId);
    } else {
      setMessages([]);
      managers.activeConversation.clear();
    }
  }, [activeConversationId]);

  // ============== USER ACTIONS ==============

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    setIsAuthenticated(!!user);
    
    if (user) {
      managers.currentUser.set(user);
      loadOrders(user.id);
    } else {
      managers.currentUser.clear();
      setOrders([]);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveConversationIdState(null);
    managers.authToken.clear();
    managers.refreshToken.clear();
    setMessages([]);
  }, []);

  // ============== CHAT ACTIONS ==============

  const loadConversations = useCallback(() => {
    if (!isBrowser()) return;
    
    try {
      const allConversations = repositories.conversation.getAll();
      setConversations(allConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    setActiveConversationIdState(conversationId);
  }, []);

  const loadMessages = useCallback((conversationId: string) => {
    if (!isBrowser()) return;
    
    try {
      const conversationMessages = repositories.message.findByConversationId(
        conversationId,
        { orderBy: { createdAt: 'asc' } }
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    
    // Update conversation in list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, updatedAt: message.createdAt }
          : conv
      )
    );
  }, []);

  // ============== MARKETPLACE ACTIONS ==============

  const loadStores = useCallback(() => {
    if (!isBrowser()) return;
    
    try {
      const allStores = repositories.store.getAll();
      setStores(allStores);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  }, []);

  const loadProducts = useCallback((storeId?: string) => {
    if (!isBrowser()) return;
    
    try {
      const allProducts = storeId
        ? repositories.product.findByStoreId(storeId)
        : repositories.product.getAll();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  const loadOrders = useCallback((userId?: string) => {
    if (!isBrowser()) return;
    
    try {
      const allOrders = userId
        ? repositories.order.findByUserId(userId)
        : repositories.order.getAll();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, []);

  const loadReviews = useCallback((productId?: string) => {
    if (!isBrowser()) return;
    
    try {
      const allReviews = productId
        ? repositories.review.findByProductId(productId)
        : repositories.review.getAll();
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }, []);

  // ============== REFRESH ACTIONS ==============

  const refreshData = useCallback(() => {
    loadConversations();
    loadStores();
    loadProducts();
    if (currentUser) {
      loadOrders(currentUser.id);
    }
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [currentUser, activeConversationId, loadConversations, loadStores, loadProducts, loadOrders, loadMessages]);

  const cleanupExpired = useCallback(() => {
    cleanupExpiredData();
  }, []);

  // ============== CONTEXT VALUE ==============

  const value: AppContextType = {
    // State
    currentUser,
    isAuthenticated,
    conversations,
    activeConversationId,
    messages,
    stores,
    products,
    orders,
    reviews,
    isLoading,
    isInitialized,
    
    // Actions
    setCurrentUser,
    logout,
    loadConversations,
    setActiveConversation,
    loadMessages,
    addMessage,
    loadStores,
    loadProducts,
    loadOrders,
    loadReviews,
    refreshData,
    cleanupExpired,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============== HOOK ==============

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

// ============== SPECIALIZED HOOKS ==============

/**
 * Hook for user authentication state
 */
export function useAuth() {
  const { currentUser, isAuthenticated, setCurrentUser, logout } = useAppContext();
  
  return {
    user: currentUser,
    isAuthenticated,
    login: setCurrentUser,
    logout,
  };
}

/**
 * Hook for chat functionality
 */
export function useChat() {
  const {
    conversations,
    activeConversationId,
    messages,
    loadConversations,
    setActiveConversation,
    loadMessages,
    addMessage,
  } = useAppContext();
  
  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;
  
  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    loadConversations,
    setActiveConversation,
    loadMessages,
    addMessage,
  };
}

/**
 * Hook for marketplace functionality
 */
export function useMarketplace() {
  const {
    stores,
    products,
    orders,
    reviews,
    loadStores,
    loadProducts,
    loadOrders,
    loadReviews,
  } = useAppContext();
  
  return {
    stores,
    products,
    orders,
    reviews,
    loadStores,
    loadProducts,
    loadOrders,
    loadReviews,
  };
}

/**
 * Hook for loading state
 */
export function useLoading() {
  const { isLoading, isInitialized } = useAppContext();
  
  return {
    isLoading,
    isInitialized,
  };
}

// ============== EVENT LISTENERS ==============

/**
 * Hook to listen for storage changes across tabs
 */
export function useStorageSyncListener() {
  const { refreshData } = useAppContext();
  
  useEffect(() => {
    if (!isBrowser()) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('chat_')) {
        refreshData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);
}

/**
 * Hook to listen for visibility changes and refresh data
 */
export function useVisibilityRefresh() {
  const { refreshData } = useAppContext();
  
  useEffect(() => {
    if (!isBrowser()) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);
}

// ============== UTILITY HOOKS ==============

/**
 * Hook to get a user by ID
 */
export function useUserById(userId: string | null | undefined) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (!userId || !isBrowser()) {
      setUser(null);
      return;
    }
    
    const foundUser = repositories.user.findById(userId);
    setUser(foundUser);
  }, [userId]);
  
  return user;
}

/**
 * Hook to get a conversation by ID
 */
export function useConversationById(conversationId: string | null | undefined) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
  useEffect(() => {
    if (!conversationId || !isBrowser()) {
      setConversation(null);
      return;
    }
    
    const foundConversation = repositories.conversation.findById(conversationId);
    setConversation(foundConversation);
  }, [conversationId]);
  
  return conversation;
}

/**
 * Hook to get a store by ID
 */
export function useStoreById(storeId: string | null | undefined) {
  const [store, setStore] = useState<Store | null>(null);
  
  useEffect(() => {
    if (!storeId || !isBrowser()) {
      setStore(null);
      return;
    }
    
    const foundStore = repositories.store.findById(storeId);
    setStore(foundStore);
  }, [storeId]);
  
  return store;
}

/**
 * Hook to get a product by ID
 */
export function useProductById(productId: string | null | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    if (!productId || !isBrowser()) {
      setProduct(null);
      return;
    }
    
    const foundProduct = repositories.product.findById(productId);
    setProduct(foundProduct);
  }, [productId]);
  
  return product;
}

/**
 * Hook to get reviews for a product
 */
export function useProductReviews(productId: string | null | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    if (!productId || !isBrowser()) {
      setReviews([]);
      return;
    }
    
    const productReviews = repositories.review.findByProductId(productId);
    setReviews(productReviews);
  }, [productId]);
  
  return reviews;
}

/**
 * Hook to get orders for a user
 */
export function useUserOrders(userId: string | null | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (!userId || !isBrowser()) {
      setOrders([]);
      return;
    }
    
    const userOrders = repositories.order.findByUserId(userId);
    setOrders(userOrders);
  }, [userId]);
  
  return orders;
}

/**
 * Hook to get products for a store
 */
export function useStoreProducts(storeId: string | null | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (!storeId || !isBrowser()) {
      setProducts([]);
      return;
    }
    
    const storeProducts = repositories.product.findByStoreId(storeId);
    setProducts(storeProducts);
  }, [storeId]);
  
  return products;
}

/**
 * Hook to get conversations for a user
 */
export function useUserConversations(userId: string | null | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  useEffect(() => {
    if (!userId || !isBrowser()) {
      setConversations([]);
      return;
    }
    
    const userConversations = repositories.conversation.findByUserId(userId);
    setConversations(userConversations);
  }, [userId]);
  
  return conversations;
}

// ============== EXPORTS ==============

export { AppContext };
export type { AppContextType, AppState, AppActions, AppProviderProps };