import { NextRequest, NextResponse } from 'next/server';
import { mockDb, generateId } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = Array.from(mockDb.users.values()).find((u: any) => u.id === decoded.userId);
    return user;
  } catch {
    return null;
  }
}

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    image: null,
    seller: 'TechStore',
    sellerId: 's1',
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation',
    stock: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Leather Messenger Bag',
    price: 149.99,
    image: null,
    seller: 'LuxuryLeather',
    sellerId: 's2',
    category: 'Accessories',
    description: 'Handcrafted genuine leather messenger bag',
    stock: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Smart Watch Pro',
    price: 399.99,
    image: null,
    seller: 'TechStore',
    sellerId: 's1',
    category: 'Electronics',
    description: 'Advanced smartwatch with health monitoring',
    stock: 20,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const storeId = searchParams.get('storeId');

    let products = [...mockProducts];

    // Also include products from mockDb
    const dbProducts = Array.from(mockDb.products.values());
    if (dbProducts.length > 0) {
      products = [...products, ...dbProducts];
    }

    if (category) {
      products = products.filter((p: any) => p.category === category);
    }

    if (storeId) {
      products = products.filter((p: any) => p.storeId === storeId);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description?.toLowerCase().includes(lowerSearch) ||
        p.seller.toLowerCase().includes(lowerSearch)
      );
    }

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, price, category, stock, storeId, image } = await request.json();

    if (!name || !price || !category || !storeId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, category, and storeId are required' },
        { status: 400 }
      );
    }

    // Verify user owns the store
    const store = Array.from(mockDb.stores.values()).find(
      (s: any) => s.id === storeId && s.ownerId === user.id
    );

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found or you do not own it' },
        { status: 403 }
      );
    }

    const product = {
      id: generateId(),
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: stock || 0,
      storeId,
      isActive: true,
      seller: store.name,
      sellerId: store.id,
      createdAt: new Date().toISOString(),
    };

    mockDb.products.set(product.id, product);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
