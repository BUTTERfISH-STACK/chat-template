import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { stores, users } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, desc } from 'drizzle-orm';

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
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    // Get stores from Drizzle
    const allStores = db.select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .orderBy(desc(stores.createdAt))
      .all() as StoreType[];

    // Get all users for owner info
    const allUsers = db.select()
      .from(users)
      .all() as UserType[];
    const userMap = new Map<string, UserType>(allUsers.map((u: UserType) => [u.id, u]));

    let filteredStores = allStores;

    // Filter by userId if provided
    if (userId) {
      filteredStores = filteredStores.filter((s: StoreType) => s.ownerId === userId);
    }

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStores = filteredStores.filter((s: StoreType) => 
        s.name.toLowerCase().includes(searchLower) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      );
    }

    const formattedStores = filteredStores.map((s: StoreType) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      ownerId: s.ownerId,
      logo: s.logo,
      phone: s.phone,
      email: s.email,
      address: s.address,
      rating: s.rating,
      totalSales: s.totalSales,
      productCount: 0,
      createdAt: s.createdAt,
    }));

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
      .get() as StoreType | undefined;

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      );
    }

    // Create store with Drizzle
    const now = new Date();
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
    }).returning().get() as StoreType;

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
