import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db";

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

// Badge definitions with real criteria
const BADGE_DEFINITIONS = {
  verified: { 
    name: "Verified", 
    criteria: (user: TopHotUser) => user.verified,
    icon: "✓",
    color: "blue"
  },
  ceo: { 
    name: "CEO / Founder", 
    criteria: () => false, // Admin assigned
    icon: "👑",
    color: "gold"
  },
  topSeller: { 
    name: "Top Seller", 
    criteria: (user: TopHotUser) => user.totalSales >= 100 || user.rankingScore >= 1000,
    icon: "🏆",
    color: "amber"
  },
  mostBooked: { 
    name: "Most Booked", 
    criteria: (user: TopHotUser) => user.totalBookings >= 50,
    icon: "📅",
    color: "emerald"
  },
  risingStar: { 
    name: "Rising Star", 
    criteria: (user: TopHotUser) => {
      // Growing quickly: more bookings in last 7 days than previous period
      const recentRate = user.bookingsLast7Days / 7;
      const previousRate = (user.bookingsLast30Days - user.bookingsLast7Days) / 23;
      return recentRate > previousRate * 1.5 && user.totalBookings >= 5;
    },
    icon: "⭐",
    color: "violet"
  },
  elite: { 
    name: "Elite", 
    criteria: (user: TopHotUser) => user.rankingScore >= 5000,
    icon: "💎",
    color: "cyan"
  },
};

// Calculate ranking score based on real metrics
function calculateRankingScore(user: TopHotUser): number {
  let score = 0;
  
  // Weighted scoring based on engagement signals
  score += user.followerCount * 0.5;           // Followers weighted less
  score += user.totalBookings * 10;              // Bookings important
  score += user.bookingsLast30Days * 2;          // Recent bookings
  score += user.totalSales * 5;                  // Sales important
  score += user.salesLast30Days * 1.5;           // Recent sales
  score += user.revenueLast30Days * 0.01;        // Revenue consideration
  score += user.profileVisits * 0.1;             // Traffic
  score += user.contentLikes * 0.2;               // Content engagement
  score += user.contentComments * 0.5;            // Comments weighted higher
  score += user.contentShares * 1;                // Shares weighted highest
  
  return Math.round(score);
}

// Get badges for a user based on real criteria
function getBadges(user: TopHotUser): string[] {
  const badges: string[] = [];
  
  for (const [key, definition] of Object.entries(BADGE_DEFINITIONS)) {
    if (definition.criteria(user)) {
      badges.push(key);
    }
  }
  
  return badges;
}

// Generate mock data with real metrics (simulating database queries)
function generateMockData(): TopHotUser[] {
  const users: TopHotUser[] = [
    {
      id: "user_1",
      username: "sarah_j",
      displayName: "Sarah Johnson",
      avatar: "/api/placeholder/200/200",
      bio: "Professional makeup artist & beauty educator",
      role: "artist",
      verified: true,
      isAdminFeatured: true,
      pinnedRank: 1,
      
      // Real metrics (from database)
      followerCount: 45200,
      totalBookings: 892,
      bookingsLast7Days: 23,
      bookingsLast30Days: 78,
      totalSales: 156,
      salesLast7Days: 12,
      salesLast30Days: 34,
      revenue: 125600,
      revenueLast30Days: 8900,
      profileVisits: 125000,
      contentLikes: 89000,
      contentComments: 4500,
      contentShares: 2300,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "book",
    },
    {
      id: "user_2",
      username: "mike_t",
      displayName: "Mike Thompson",
      avatar: "/api/placeholder/200/200",
      bio: "Photographer capturing life's beautiful moments",
      role: "creator",
      verified: true,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 32100,
      totalBookings: 567,
      bookingsLast7Days: 15,
      bookingsLast30Days: 45,
      totalSales: 89,
      salesLast7Days: 5,
      salesLast30Days: 18,
      revenue: 78000,
      revenueLast30Days: 5600,
      profileVisits: 89000,
      contentLikes: 67000,
      contentComments: 3200,
      contentShares: 1800,
      
      rankingScore: 0,
      currentRank: 0,
      
      storeName: "Mike's Photography",
      storeId: "store_1",
      storeRating: 4.9,
      storeProductCount: 15,
      
      badges: [],
      ctaType: "shop",
    },
    {
      id: "user_3",
      username: "emily_d",
      displayName: "Emily Davis",
      avatar: "/api/placeholder/200/200",
      bio: "Dance instructor | Choreographer | Performer",
      role: "artist",
      verified: false,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 28900,
      totalBookings: 445,
      bookingsLast7Days: 18,
      bookingsLast30Days: 52,
      totalSales: 0,
      salesLast7Days: 0,
      salesLast30Days: 0,
      revenue: 45000,
      revenueLast30Days: 4200,
      profileVisits: 67000,
      contentLikes: 78000,
      contentComments: 5600,
      contentShares: 3400,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "book",
    },
    {
      id: "user_4",
      username: "david_w",
      displayName: "David Wilson",
      avatar: "/api/placeholder/200/200",
      bio: "Custom furniture maker & interior designer",
      role: "store",
      verified: true,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 15600,
      totalBookings: 0,
      bookingsLast7Days: 0,
      bookingsLast30Days: 0,
      totalSales: 456,
      salesLast7Days: 18,
      salesLast30Days: 67,
      revenue: 89000,
      revenueLast30Days: 12500,
      profileVisits: 45000,
      contentLikes: 23000,
      contentComments: 890,
      contentShares: 1200,
      
      storeName: "Wilson Woodworks",
      storeId: "store_2",
      storeRating: 4.8,
      storeProductCount: 42,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "shop",
    },
    {
      id: "user_5",
      username: "lisa_m",
      displayName: "Lisa Martinez",
      avatar: "/api/placeholder/200/200",
      bio: "Personal trainer & wellness coach",
      role: "creator",
      verified: true,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 52300,
      totalBookings: 1234,
      bookingsLast7Days: 34,
      bookingsLast30Days: 112,
      totalSales: 234,
      salesLast7Days: 8,
      salesLast30Days: 28,
      revenue: 156000,
      revenueLast30Days: 14000,
      profileVisits: 178000,
      contentLikes: 125000,
      contentComments: 7800,
      contentShares: 4500,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "book",
    },
    {
      id: "user_6",
      username: "james_k",
      displayName: "James Kim",
      avatar: "/api/placeholder/200/200",
      bio: "Music producer & sound engineer",
      role: "creator",
      verified: false,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 18700,
      totalBookings: 234,
      bookingsLast7Days: 8,
      bookingsLast30Days: 28,
      totalSales: 67,
      salesLast7Days: 3,
      salesLast30Days: 12,
      revenue: 34000,
      revenueLast30Days: 3200,
      profileVisits: 45000,
      contentLikes: 34000,
      contentComments: 2100,
      contentShares: 890,
      
      rankingScore: 0,
      currentRank: 0,
      
      storeName: "Studio K Beats",
      storeId: "store_3",
      storeRating: 4.7,
      storeProductCount: 23,
      
      badges: [],
      ctaType: "shop",
    },
    {
      id: "user_7",
      username: "anna_p",
      displayName: "Anna Peterson",
      avatar: "/api/placeholder/200/200",
      bio: "Event planner & decorator extraordinaire",
      role: "business",
      verified: true,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 8900,
      totalBookings: 567,
      bookingsLast7Days: 12,
      bookingsLast30Days: 45,
      totalSales: 0,
      salesLast7Days: 0,
      salesLast30Days: 0,
      revenue: 234000,
      revenueLast30Days: 18000,
      profileVisits: 34000,
      contentLikes: 12000,
      contentComments: 560,
      contentShares: 340,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "book",
    },
    {
      id: "user_8",
      username: "alex_r",
      displayName: "Alex Rodriguez",
      avatar: "/api/placeholder/200/200",
      bio: "Catering & meal prep services",
      role: "store",
      verified: false,
      isAdminFeatured: false,
      pinnedRank: null,
      
      followerCount: 6700,
      totalBookings: 0,
      bookingsLast7Days: 0,
      bookingsLast30Days: 0,
      totalSales: 890,
      salesLast7Days: 25,
      salesLast30Days: 95,
      revenue: 45000,
      revenueLast30Days: 4800,
      profileVisits: 23000,
      contentLikes: 8900,
      contentComments: 340,
      contentShares: 560,
      
      storeName: "Alex's Kitchen",
      storeId: "store_4",
      storeRating: 4.6,
      storeProductCount: 67,
      
      rankingScore: 0,
      currentRank: 0,
      
      badges: [],
      ctaType: "shop",
    },
  ];
  
  // Calculate scores and assign ranks
  users.forEach(user => {
    user.rankingScore = calculateRankingScore(user);
    user.badges = getBadges(user);
  });
  
  // Sort by ranking score (descending)
  users.sort((a, b) => b.rankingScore - a.rankingScore);
  
  // Assign ranks
  users.forEach((user, index) => {
    user.currentRank = index + 1;
  });
  
  // Apply admin featured/pinned adjustments
  // Admin can pin a user to a specific rank, but we still show real scores
  const pinnedUsers = users.filter(u => u.isAdminFeatured && u.pinnedRank !== null);
  pinnedUsers.forEach(pinnedUser => {
    // Remove from current position
    const currentIndex = users.findIndex(u => u.id === pinnedUser.id);
    if (currentIndex > -1) {
      users.splice(currentIndex, 1);
    }
    // Insert at pinned position (adjusting for 0-indexed)
    const insertIndex = Math.min(Math.max((pinnedUser.pinnedRank || 1) - 1, 0), users.length);
    users.splice(insertIndex, 0, pinnedUser);
    
    // Recalculate ranks after adjustment
    users.forEach((u, i) => {
      u.currentRank = i + 1;
    });
  });
  
  return users;
}

export async function GET() {
  try {
    // In production, this would query real database tables:
    // - users table for profile data
    // - followers table for follower counts
    // - bookings table for booking metrics
    // - store_orders table for sales data
    // - transactions table for revenue
    // - engagement_logs for content engagement
    
    // For now, use mock data that simulates real metrics
    const users = generateMockData();
    
    // Separate into ranking tiers
    const featured = users[0]; // #1
    const secondary = users.slice(1, 5); // #2-5
    const trending = users.slice(5); // #6+
    
    return NextResponse.json({
      success: true,
      data: {
        featured,
        secondary,
        trending,
        totalCount: users.length,
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
