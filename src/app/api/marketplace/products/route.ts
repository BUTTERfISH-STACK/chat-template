import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { marketplaceItems, stores, users } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, desc } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

// Types based on actual schema
interface ProductType {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
  updatedAt: string;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  sessionToken: string | null;
  createdAt: string;
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
    const search = searchParams.get('search');
    const storeId = searchParams.get('storeId');

    // Get all products
    let allProducts: ProductType[];
    if (storeId) {
      allProducts = db.select()
        .from(marketplaceItems)
        .where(eq(marketplaceItems.sellerId, storeId))
        .all() as ProductType[];
    } else {
      allProducts = db.select()
        .from(marketplaceItems)
        .orderBy(desc(marketplaceItems.createdAt))
        .all() as ProductType[];
    }

    // Get all stores for lookup
    const allStores = db.select()
      .from(stores)
      .all() as StoreType[];
    const storeMap = new Map<string, StoreType>(allStores.map((s: StoreType) => [s.id, s]));

    let filteredProducts = allProducts;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter((p: ProductType) => 
        p.title.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    const formattedProducts = filteredProducts.map((p: ProductType) => {
      const store = storeMap.get(p.sellerId);
      return {
        id: p.id,
        name: p.title,
        price: p.price,
        image: p.imageUrl,
        seller: store?.name || 'Unknown',
        sellerId: p.sellerId,
        description: p.description,
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

    const { title, description, price, storeId, imageUrl } = await request.json();

    if (!title || !price || !storeId) {
      return NextResponse.json(
        { success: false, error: 'Title, price, and storeId are required' },
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
    const now = new Date().toISOString();
    const productId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const product = db.insert(marketplaceItems).values({
      id: productId,
      sellerId: storeId,
      title,
      description,
      price: parseFloat(price as string),
      imageUrl,
      createdAt: now,
      updatedAt: now,
    }).returning().get() as ProductType;

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.imageUrl,
        seller: store.name,
        sellerId: store.id,
        description: product.description,
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
