import { NextResponse } from "next/server";

// Types for Top Hot data
export interface TopHotUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: "artist" | "creator" | "store" | "business";
  verified: boolean;
  isAdminFeatured: boolean;
  pinnedRank: number | null;
    
  // Real metrics (from database)
  followerCount: number;
  totalBookings: number;
  bookingsLast7Days: number;
  bookingsLast30Days: number;
  totalSales: number;
  salesLast7Days: number;
  salesLast30Days: number;
  revenue: number;
  revenueLast30Days: number;
  profileVisits: number;
  contentLikes: number;
  contentComments: number;
  contentShares: number;
    
  // Computed ranking score
  rankingScore: number;
  currentRank: number;
    
  // Store info (if applicable)
  storeName?: string;
  storeId?: string;
  storeRating?: number;
  storeProductCount?: number;
    
  // Badges (based on real criteria)
  badges: string[];
    
  // CTA
  ctaType: "book" | "shop" | "visit" | "follow";
}

export async function GET() {
  try {
    // Return empty data structure instead of mock data
    // In production, this would query real database tables
    
    return NextResponse.json({
      success: true,
      data: {
        featured: null,
        secondary: [],
        trending: [],
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Top Hot API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Top Hot data" },
      { status: 500 }
    );
  }
}
