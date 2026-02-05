import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (userId) {
      where.ownerId = userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get stores from Prisma
    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedStores = stores.map((store) => ({
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
      productCount: store._count.products,
      createdAt: store.createdAt.toISOString(),
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
    const existingStore = await prisma.store.findFirst({
      where: { ownerId: user.id },
    });

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      );
    }

    // Create store with Prisma
    const store = await prisma.store.create({
      data: {
        name,
        description,
        logo,
        phone,
        email,
        address,
        ownerId: user.id,
      },
    });

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
        createdAt: store.createdAt.toISOString(),
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
