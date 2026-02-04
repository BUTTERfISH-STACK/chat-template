"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SideNav, TopNavBar } from "@/components/ui/SideNav";

interface TopHotUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: "artist" | "creator" | "store" | "business";
  verified: boolean;
  isAdminFeatured: boolean;
  pinnedRank: number | null;
  
  // Real metrics
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
  
  rankingScore: number;
  currentRank: number;
  
  storeName?: string;
  storeId?: string;
  storeRating?: number;
  storeProductCount?: number;
  
  badges: string[];
  ctaType: "book" | "shop" | "visit" | "follow";
}

interface TopHotResponse {
  success: boolean;
  data: {
    featured: TopHotUser;
    secondary: TopHotUser[];
    trending: TopHotUser[];
    totalCount: number;
    lastUpdated: string;
  };
}

// Badge configuration
const BADGE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  verified: { label: "Verified", icon: "✓", color: "bg-blue-500" },
  ceo: { label: "CEO / Founder", icon: "👑", color: "bg-amber-500" },
  topSeller: { label: "Top Seller", icon: "🏆", color: "bg-amber-600" },
  mostBooked: { label: "Most Booked", icon: "📅", color: "bg-emerald-500" },
  risingStar: { label: "Rising Star", icon: "⭐", color: "bg-violet-500" },
  elite: { label: "Elite", icon: "💎", color: "bg-cyan-500" },
};

// Format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

// Get CTA button config
const getCTALabel = (type: string): string => {
  switch (type) {
    case "book": return "Book Now";
    case "shop": return "Shop Now";
    case "visit": return "Visit Profile";
    case "follow": return "Follow";
    default: return "View Profile";
  }
};

export default function TopHotPage() {
  const [data, setData] = useState<TopHotResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopHot = async () => {
      try {
        const response = await fetch("/api/tophot");
        const result: TopHotResponse = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError("Failed to load Top Hot data");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopHot();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <SideNav />
        <TopNavBar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="vellon-loader vellon-loader-lg" />
            <p className="text-[var(--muted-foreground)]">Loading Top Hot...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <SideNav />
        <TopNavBar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="vellon-empty">
            <div className="vellon-empty-icon">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="vellon-empty-title">{error || "Failed to load"}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Side Navigation */}
      <SideNav />

      {/* Mobile Top Navigation */}
      <div className="md:hidden">
        <TopNavBar />
      </div>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl">🔥</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-warm">
                Top Hot
              </h1>
            </div>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Discover the most active creators, artists, and micro-stores on Vellon.
              Rankings based on real engagement and performance data.
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </header>

          {/* #1 Featured Profile */}
          {data.featured && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏆</span>
                <h2 className="text-xl font-bold">#1 Featured</h2>
              </div>
              
              <FeaturedProfile user={data.featured} />
            </section>
          )}

          {/* #2-5 Secondary Featured */}
          {data.secondary.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌟</span>
                <h2 className="text-xl font-bold">Trending Now</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.secondary.map((user) => (
                  <SecondaryProfile key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}

          {/* #6+ Scrollable Trending List */}
          {data.trending.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📈</span>
                <h2 className="text-xl font-bold">All Trending</h2>
              </div>
              
              <div className="space-y-3">
                {data.trending.map((user) => (
                  <TrendingCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

// Featured Profile Card (#1)
function FeaturedProfile({ user }: { user: TopHotUser }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--muted)] border border-[var(--card-border)] shadow-2xl">
      {/* Animated gradient border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)] opacity-20 animate-gradient" />
      
      <div className="relative p-6 md:p-8">
        {/* Rank Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-4xl">🥇</span>
          <span className="text-2xl font-bold text-gradient-warm">#1</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar with glow */}
          <div className="relative mx-auto md:mx-0 w-32 h-32 md:w-40 md:h-40">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)] animate-pulse-soft" />
            <div className="absolute inset-1 rounded-full bg-[var(--card)]" />
            <Avatar className="w-full h-full rounded-full border-4 border-[var(--card)] relative z-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <h3 className="text-2xl md:text-3xl font-bold">{user.displayName}</h3>
              <span className="text-lg">@{user.username}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              {user.badges.map((badge) => {
                const config = BADGE_CONFIG[badge];
                if (!config) return null;
                return (
                  <span
                    key={badge}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium text-white",
                      config.color
                    )}
                  >
                    {config.icon} {config.label}
                  </span>
                );
              })}
            </div>

            <p className="text-[var(--muted-foreground)] mb-4 max-w-lg mx-auto md:mx-0">
              {user.bio}
            </p>

            {/* Real Metrics */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <Metric value={formatNumber(user.followerCount)} label="Followers" />
              <Metric value={formatNumber(user.totalBookings)} label="Bookings" />
              {user.totalSales > 0 && (
                <Metric value={formatNumber(user.totalSales)} label="Sales" />
              )}
              <Metric value={formatNumber(user.contentLikes)} label="Likes" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Button variant="premium" size="lg">
                {getCTALabel(user.ctaType)}
              </Button>
              <Button variant="outline" size="lg">
                View Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Store info if applicable */}
        {user.storeName && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{user.storeName}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {user.storeProductCount} products • ⭐ {user.storeRating}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Secondary Profile Card (#2-5)
function SecondaryProfile({ user }: { user: TopHotUser }) {
  return (
    <Card variant="premium" className="p-4 hover:shadow-lg transition-all duration-300 group">
      {/* Rank */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gradient-warm">#{user.currentRank}</span>
        {user.currentRank === 2 && <span className="text-xl">🥈</span>}
        {user.currentRank === 3 && <span className="text-xl">🥉</span>}
        {user.currentRank > 3 && <span className="text-lg">🔥</span>}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <Avatar className="w-20 h-20 rounded-full">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          {user.badges.includes("verified") && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-3">
        <h4 className="font-semibold">{user.displayName}</h4>
        <p className="text-sm text-[var(--muted-foreground)]">@{user.username}</p>
      </div>

      {/* Key Metrics */}
      <div className="flex justify-center gap-4 mb-4 text-sm">
        <div>
          <p className="font-semibold">{formatNumber(user.followerCount)}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Followers</p>
        </div>
        <div>
          <p className="font-semibold">{formatNumber(user.totalBookings)}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Bookings</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-1 mb-4">
        {user.badges.slice(0, 2).map((badge) => {
          const config = BADGE_CONFIG[badge];
          if (!config) return null;
          return (
            <span
              key={badge}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium text-white",
                config.color
              )}
            >
              {config.icon}
            </span>
          );
        })}
      </div>

      {/* CTA */}
      <Button variant="premium" className="w-full" size="sm">
        {getCTALabel(user.ctaType)}
      </Button>
    </Card>
  );
}

// Trending List Card (#6+)
function TrendingCard({ user }: { user: TopHotUser }) {
  return (
    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
      {/* Rank */}
      <div className="w-8 text-center">
        <span className="text-lg font-bold text-[var(--muted-foreground)]">
          #{user.currentRank}
        </span>
      </div>

      {/* Avatar */}
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.avatar} alt={user.displayName} />
        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{user.displayName}</h4>
          {user.badges.includes("verified") && (
            <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
              ✓
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">@{user.username}</p>
      </div>

      {/* Key Metrics */}
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold">{formatNumber(user.followerCount)}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{formatNumber(user.totalBookings)}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Bookings</p>
        </div>
        {user.totalSales > 0 && (
          <div className="text-center">
            <p className="font-semibold">{formatNumber(user.totalSales)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Sales</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="group-hover:bg-[var(--secondary)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </Button>
        <Button variant="outline" size="sm">
          {getCTALabel(user.ctaType)}
        </Button>
      </div>
    </Card>
  );
}

// Metric component
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}
