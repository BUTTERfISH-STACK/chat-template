import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { products, stores, users } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, desc, like, or } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

// Types
interface StoreType {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  phone: string;
  email: string;
  address: string | null;
  ownerId: string;
  rating: number;
  totalSales: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  stock: number;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserType {
  id: string;
  phoneNumber: string;
  name: string | null;
  avatar: string | null;
  email: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest): Promise<UserType | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)
      .get() as UserType | undefined;
    return user || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const storeId = searchParams.get('storeId');

    // Get all products
    const allProducts = db.select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .all() as ProductType[];

    // Get all stores for lookup
    const allStores = db.select()
      .from(stores)
      .all() as StoreType[];
    const storeMap = new Map<string, StoreType>(allStores.map((s: StoreType) => [s.id, s]));

    let filteredProducts = allProducts;

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter((p: ProductType) => 
        p.category === category
      );
    }

    // Filter by storeId
    if (storeId) {
      filteredProducts = filteredProducts.filter((p: ProductType) => 
        p.storeId === storeId
      );
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: ProductType) => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    const formattedProducts = filteredProducts.map((p: ProductType) => {
      const store = storeMap.get(p.storeId);
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        seller: store?.name || 'Unknown',
        sellerId: p.storeId,
        category: p.category,
        description: p.description,
        stock: p.stock,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
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
    const store = db.select()
      .from(stores)
      .where(and(eq(stores.id, storeId), eq(stores.ownerId, user.id)))
      .limit(1)
      .get() as StoreType | undefined;

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found or you do not own it' },
        { status: 403 }
      );
    }

    // Create product with Drizzle
    const now = new Date();
    const productId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const product = db.insert(products).values({
      id: productId,
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: stock || 0,
      storeId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).returning().get() as ProductType;

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        seller: store.name,
        sellerId: store.id,
        category: product.category,
        description: product.description,
        stock: product.stock,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// Helper function for AND conditions
function and(...conditions: any[]) {
  return conditions.reduce((acc, cond) => {
    if (cond) return { ...acc, ...cond };
    return acc;
  }, {});
}
