import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.store.name,
      sellerId: product.store.id,
      category: product.category,
      description: product.description || '',
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
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found or you do not own it' },
        { status: 403 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: stock || 0,
        storeId,
        image,
      },
    });

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
        description: product.description || '',
        stock: product.stock,
        createdAt: product.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
