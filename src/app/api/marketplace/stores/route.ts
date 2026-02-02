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

// Mock stores data
const mockStores = [
  {
    id: 's1',
    name: 'TechStore',
    description: 'Your one-stop shop for premium electronics',
    ownerId: 'u1',
    logo: null,
    phone: '+27 82 123 4567',
    email: 'contact@techstore.com',
    address: '123 Tech Street, Johannesburg',
    rating: 4.8,
    totalSales: 1250,
    productCount: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's2',
    name: 'LuxuryLeather',
    description: 'Handcrafted leather goods of premium quality',
    ownerId: 'u2',
    logo: null,
    phone: '+27 83 987 6543',
    email: 'info@luxuryleather.com',
    address: '456 Artisan Avenue, Cape Town',
    rating: 4.9,
    totalSales: 890,
    productCount: 32,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    let stores = [...mockStores];

    // Also include stores from mockDb
    const dbStores = Array.from(mockDb.stores.values());
    if (dbStores.length > 0) {
      stores = [...stores, ...dbStores];
    }

    if (userId) {
      stores = stores.filter((s: any) => s.ownerId === userId);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      stores = stores.filter((s: any) =>
        s.name.toLowerCase().includes(lowerSearch) ||
        s.description?.toLowerCase().includes(lowerSearch)
      );
    }

    return NextResponse.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
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

    const { name, description, phone, email, address, logo } = await request.json();

    if (!name || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, and email are required' },
        { status: 400 }
      );
    }

    // Check if user already has a store
    const existingStore = Array.from(mockDb.stores.values()).find(
      (s: any) => s.ownerId === user.id
    );

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      );
    }

    const store = {
      id: generateId(),
      name,
      description,
      logo,
      phone,
      email,
      address,
      ownerId: user.id,
      rating: 0,
      totalSales: 0,
      productCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockDb.stores.set(store.id, store);

    return NextResponse.json({
      success: true,
      store,
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
