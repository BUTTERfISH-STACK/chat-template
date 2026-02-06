import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { stores, users } from '@/lib/db/schema';
import { Store, User } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, desc } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest): Promise<User | null> {
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
      .get() as User | undefined;
    return user || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    // Get stores from Drizzle
    let allStores: Store[];
    if (userId) {
      allStores = db.select()
        .from(stores)
        .where(eq(stores.ownerId, userId))
        .all() as Store[];
    } else {
      allStores = db.select()
        .from(stores)
        .where(eq(stores.isActive, true))
        .orderBy(desc(stores.createdAt))
        .all() as Store[];
    }

    // Get all users for owner info
    const allUsers = db.select()
      .from(users)
      .all() as User[];
    const userMap = new Map<string, User>(allUsers.map((u: User) => [u.id, u]));

    let filteredStores = allStores;

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStores = filteredStores.filter((s: Store) => 
        s.name.toLowerCase().includes(searchLower) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      );
    }

    const formattedStores = filteredStores.map((s: Store) => {
      const owner = userMap.get(s.ownerId);
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        ownerId: s.ownerId,
        ownerName: owner?.name || 'Unknown',
        logo: s.logo,
        phone: s.phone,
        email: s.email,
        address: s.address,
        rating: s.rating,
        totalSales: s.totalSales,
        productCount: 0,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      stores: formattedStores,
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stores' },
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

    const { name, description, phone, email, address, logo } = await request.json();

    if (!name || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, and email are required' },
        { status: 400 }
      );
    }

    // Check if user already has a store
    const existingStore = db.select()
      .from(stores)
      .where(eq(stores.ownerId, user.id))
      .limit(1)
      .get() as Store | undefined;

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      );
    }

    // Create store with Drizzle
    const now = new Date().toISOString();
    const storeId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const store = db.insert(stores).values({
      id: storeId,
      name,
      description,
      logo,
      phone,
      email,
      address,
      ownerId: user.id,
      rating: 0,
      totalSales: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).returning().get() as Store;

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        description: store.description,
        ownerId: store.ownerId,
        logo: store.logo,
        phone: store.phone,
        email: store.email,
        address: store.address,
        rating: store.rating,
        totalSales: store.totalSales,
        productCount: 0,
        createdAt: store.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    );
  }
}
