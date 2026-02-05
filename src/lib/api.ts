// API client for the Vellon Chat application
// All API calls should use these functions for consistency

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth headers from cookies
function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    // Get token from cookies
    const cookies = document.cookie.split(';');
    const authTokenCookie = cookies.find(c => c.trim().startsWith('authToken='));
    const token = authTokenCookie ? authTokenCookie.split('=')[1] : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }
  return { 'Content-Type': 'application/json' };
}

// Helper to safely parse JSON response
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || 'Unknown error' };
  }
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
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch conversations');
    }
    return data.conversations || [];
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages?conversationId=${conversationId}`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch messages');
    }
    return data.messages || [];
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, content }),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }
    return data.message;
  },

  createConversation: async (participantId: string): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participantId }),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create conversation');
    }
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
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    return data.products || [];
  },

  getProduct: async (productId: string): Promise<Product | null> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/products/${productId}`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 404) return null;
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch product');
    }
    return data;
  },

  getStores: async (params?: { search?: string; userId?: string }): Promise<Store[]> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.userId) searchParams.set('userId', params.userId);
    
    const response = await fetch(`${API_BASE_URL}/api/marketplace/stores?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stores');
    }
    return data.stores || [];
  },

  createStore: async (storeData: Partial<Store>): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create store');
    }
    return data;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create product');
    }
    return data;
  },
};

export const authAPI = {
  login: async (phoneNumber: string, password: string): Promise<{ success: boolean; token: string; user: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password }),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  register: async (data: { phoneNumber: string; email?: string; name: string; password: string }): Promise<{ success: boolean; token: string; user: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await safeJsonParse(response);
    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }
    return result;
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      // Clear all auth-related data
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
  },
};
