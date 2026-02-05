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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const storeId = searchParams.get('storeId');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { store: { name: { contains: search } } },
      ];
    }

    // Get products from Prisma
    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.store.name,
      sellerId: product.store.id,
      category: product.category,
      description: product.description,
      stock: product.stock,
      createdAt: product.createdAt.toISOString(),
    }));

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
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Store not found or you do not own it' },
        { status: 403 }
      );
    }

    // Create product with Prisma
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        stock: stock || 0,
        storeId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        seller: product.store.name,
        sellerId: product.store.id,
        category: product.category,
        description: product.description,
        stock: product.stock,
        createdAt: product.createdAt.toISOString(),
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
