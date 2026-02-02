export interface Chat {
  id: string
  name: string
  avatar?: string
  status?: "online" | "offline" | "away"
}

export interface Message {
  id: string
  chatId: string
  author: string
  content: string
  timestamp: string
  isOwnMessage: boolean
  status: "sent" | "delivered" | "read"
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  seller: string
  sellerId: string
  category: string
  description: string
  stock: number
  createdAt: string
}

export interface Store {
  id: string
  name: string
  description: string
  ownerId: string
  logo?: string
  phone: string
  email: string
  address: string
  rating: number
  totalSales: number
  productCount: number
  createdAt: string
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "John Doe",
    status: "online"
  },
  {
    id: "2",
    name: "Jane Smith",
    status: "offline"
  },
  {
    id: "3",
    name: "Work Group",
    status: "online"
  },
  {
    id: "4",
    name: "Sarah Johnson",
    status: "away"
  },
  {
    id: "5",
    name: "Mike Brown",
    status: "online"
  }
]

const mockMessages: Message[] = [
  {
    id: "1",
    chatId: "1",
    author: "John Doe",
    content: "Hey, how are you?",
    timestamp: "12:34 PM",
    isOwnMessage: false,
    status: "read"
  },
  {
    id: "2",
    chatId: "1",
    author: "You",
    content: "I'm good, thanks! How about you?",
    timestamp: "12:35 PM",
    isOwnMessage: true,
    status: "read"
  },
  {
    id: "3",
    chatId: "1",
    author: "John Doe",
    content: "Doing well! Just wanted to check in.",
    timestamp: "12:36 PM",
    isOwnMessage: false,
    status: "read"
  },
  {
    id: "4",
    chatId: "2",
    author: "Jane Smith",
    content: "I'll be there in 10 minutes",
    timestamp: "11:22 AM",
    isOwnMessage: false,
    status: "delivered"
  },
  {
    id: "5",
    chatId: "3",
    author: "You",
    content: "Don't forget the meeting at 3 PM",
    timestamp: "9:15 AM",
    isOwnMessage: true,
    status: "sent"
  },
  {
    id: "6",
    chatId: "3",
    author: "Mike Brown",
    content: "Thanks for the reminder!",
    timestamp: "9:16 AM",
    isOwnMessage: false,
    status: "read"
  }
]

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "/api/placeholder/200/200",
    seller: "TechStore",
    sellerId: "s1",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation",
    stock: 15,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Leather Messenger Bag",
    price: 149.99,
    image: "/api/placeholder/200/200",
    seller: "LuxuryLeather",
    sellerId: "s2",
    category: "Accessories",
    description: "Handcrafted genuine leather messenger bag",
    stock: 8,
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    name: "Smart Watch Pro",
    price: 399.99,
    image: "/api/placeholder/200/200",
    seller: "TechStore",
    sellerId: "s1",
    category: "Electronics",
    description: "Advanced smartwatch with health monitoring",
    stock: 20,
    createdAt: "2024-01-20"
  }
]

const mockStores: Store[] = [
  {
    id: "s1",
    name: "TechStore",
    description: "Your one-stop shop for premium electronics",
    ownerId: "u1",
    phone: "+27 82 123 4567",
    email: "contact@techstore.com",
    address: "123 Tech Street, Johannesburg",
    rating: 4.8,
    totalSales: 1250,
    productCount: 45,
    createdAt: "2023-06-15"
  },
  {
    id: "s2",
    name: "LuxuryLeather",
    description: "Handcrafted leather goods of premium quality",
    ownerId: "u2",
    phone: "+27 83 987 6543",
    email: "info@luxuryleather.com",
    address: "456 Artisan Avenue, Cape Town",
    rating: 4.9,
    totalSales: 890,
    productCount: 32,
    createdAt: "2023-08-20"
  }
]

export const chatAPI = {
  getChats: async (): Promise<Chat[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockChats
  },

  getChatMessages: async (chatId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockMessages.filter(message => message.chatId === chatId)
  },

  sendMessage: async (chatId: string, content: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      author: "You",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: true,
      status: "sent"
    }
    return newMessage
  },

  markAsRead: async (chatId: string, messageId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log(`Marked message ${messageId} as read in chat ${chatId}`)
  }
}

export const marketplaceAPI = {
  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProducts
  },

  getProduct: async (productId: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProducts.find(p => p.id === productId)
  },

  getStores: async (): Promise<Store[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockStores
  },

  getStore: async (storeId: string): Promise<Store | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockStores.find(s => s.id === storeId)
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const lowerQuery = query.toLowerCase()
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.seller.toLowerCase().includes(lowerQuery)
    )
  },

  createStore: async (storeData: Partial<Store>): Promise<Store> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newStore: Store = {
      id: `s${Date.now()}`,
      name: storeData.name || "New Store",
      description: storeData.description || "",
      ownerId: "currentUser",
      phone: storeData.phone || "",
      email: storeData.email || "",
      address: storeData.address || "",
      rating: 0,
      totalSales: 0,
      productCount: 0,
      createdAt: new Date().toISOString()
    }
    return newStore
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: productData.name || "New Product",
      price: productData.price || 0,
      image: productData.image || "/api/placeholder/200/200",
      seller: productData.seller || "Unknown",
      sellerId: productData.sellerId || "s1",
      category: productData.category || "Uncategorized",
      description: productData.description || "",
      stock: productData.stock || 0,
      createdAt: new Date().toISOString()
    }
    return newProduct
  }
}

export const authAPI = {
  sendOTP: async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`OTP sent to ${phoneNumber}`)
    return { success: true, message: "OTP sent successfully" }
  },

  verifyOTP: async (phoneNumber: string, otp: string): Promise<{ success: boolean; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Simulate OTP verification
    if (otp === "123456") {
      return { success: true, token: "mock-jwt-token" }
    }
    return { success: false, token: "" }
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log("User logged out")
  }
}
