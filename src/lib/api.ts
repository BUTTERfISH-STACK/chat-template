// API client for the Vellon Chat application
// All API calls should use these functions for consistency

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }
  return { 'Content-Type': 'application/json' };
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
}

export interface Message {
  id: string;
  chatId: string;
  author: string;
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  status: "sent" | "delivered" | "read";
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  sellerId: string;
  category: string;
  description: string;
  stock: number;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  logo?: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  totalSales: number;
  productCount: number;
  createdAt: string;
}

export const chatAPI = {
  getConversations: async (): Promise<Chat[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    const data = await response.json();
    return data.conversations;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages?conversationId=${conversationId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.messages;
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data.message;
  },

  createConversation: async (participantId: string): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participantId }),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    const data = await response.json();
    return data.conversation;
  },
};

export const marketplaceAPI = {
  getProducts: async (params?: { category?: string; search?: string; storeId?: string }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.storeId) searchParams.set('storeId', params.storeId);
    
    const response = await fetch(`${API_BASE_URL}/api/marketplace/products?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.products;
  },

  getProduct: async (productId: string): Promise<Product | null> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/products/${productId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },

  getStores: async (params?: { search?: string; userId?: string }): Promise<Store[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.userId) searchParams.set('userId', params.userId);
    
    const response = await fetch(`${API_BASE_URL}/api/marketplace/stores?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stores');
    const data = await response.json();
    return data.stores;
  },

  createStore: async (storeData: Partial<Store>): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    if (!response.ok) throw new Error('Failed to create store');
    return response.json();
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },
};

export const authAPI = {
  login: async (phoneNumber: string): Promise<{ success: boolean; token: string; user: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  logout: async (): Promise<void> => {
    // Server-side logout is handled by clearing cookies
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },
};
