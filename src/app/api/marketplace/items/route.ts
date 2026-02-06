/**
 * Marketplace Items API Routes
 * GET /api/marketplace/items - List all items
 * POST /api/marketplace/items - Create a new item
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { marketplaceItems, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/sessionManager';
import { generateUUID } from '@/lib/db/schema';

interface MarketplaceItemResponse {
  success: boolean;
  items?: Array<{
    id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    createdAt: string;
  }>;
  error?: string;
}

export async function GET(): Promise<NextResponse<MarketplaceItemResponse>> {
  try {
    // Get all items
    const items = await db
      .select({
        id: marketplaceItems.id,
        sellerId: marketplaceItems.sellerId,
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        price: marketplaceItems.price,
        imageUrl: marketplaceItems.imageUrl,
        createdAt: marketplaceItems.createdAt,
      })
      .from(marketplaceItems)
      .orderBy(desc(marketplaceItems.createdAt));

    // Get seller names
    const itemsWithSellers = await Promise.all(
      items.map(async (item) => {
        const seller = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, item.sellerId))
          .limit(1);

        return {
          ...item,
          sellerName: seller.length > 0 ? seller[0].name! : 'Unknown',
        };
      })
    );

    return NextResponse.json({
      success: true,
      items: itemsWithSellers,
    });
  } catch (error: any) {
    console.error('Get marketplace items error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get marketplace items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<MarketplaceItemResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, imageUrl } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title and price are required' },
        { status: 400 }
      );
    }

    const itemId = generateUUID();
    await db.insert(marketplaceItems).values({
      id: itemId,
      sellerId: userId,
      title,
      description: description || null,
      price: parseFloat(price),
      imageUrl: imageUrl || null,
    });

    return NextResponse.json({
      success: true,
      items: [{
        id: itemId,
        sellerId: userId,
        sellerName: '',
        title,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
      }],
    });
  } catch (error: any) {
    console.error('Create marketplace item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create marketplace item' },
      { status: 500 }
    );
  }
}
