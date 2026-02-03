"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstagramNav, InstagramNavBar } from "@/components/ui/InstagramNav";

// Types
interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  followers: number;
  following: number;
  posts: number;
  isVerified?: boolean;
  isBusiness?: boolean;
}

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption?: string;
  timestamp: string;
}

interface Highlight {
  id: string;
  title: string;
  imageUrl: string;
  isViewed?: boolean;
}

// Mock user data - would come from API in production
const mockUser: User = {
  id: "1",
  username: "johndoe",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/api/placeholder/150/150",
  bio: "Developer | Tech Enthusiast | Creating amazing apps",
  website: "johndoe.com",
  followers: 1234,
  following: 567,
  posts: 42,
  isVerified: true,
  isBusiness: true
};

const mockHighlights: Highlight[] = [
  { id: "1", title: "Travel", imageUrl: "/api/placeholder/100/100", isViewed: false },
  { id: "2", title: "Food", imageUrl: "/api/placeholder/100/100", isViewed: true },
  { id: "3", title: "Fitness", imageUrl: "/api/placeholder/100/100", isViewed: false },
  { id: "4", title: "Work", imageUrl: "/api/placeholder/100/100", isViewed: true },
  { id: "5", title: "Pets", imageUrl: "/api/placeholder/100/100", isViewed: false },
];

const mockPosts: Post[] = [
  { id: "1", imageUrl: "/api/placeholder/400/400", likes: 234, comments: 12, caption: "Beautiful sunset today! 🌅", timestamp: "2h" },
  { id: "2", imageUrl: "/api/placeholder/400/400", likes: 567, comments: 34, caption: "New project launch! 🚀", timestamp: "5h" },
  { id: "3", imageUrl: "/api/placeholder/400/400", likes: 890, comments: 56, caption: "Weekend vibes ✨", timestamp: "1d" },
  { id: "4", imageUrl: "/api/placeholder/400/400", likes: 123, comments: 8, caption: "Coffee time ☕", timestamp: "2d" },
  { id: "5", imageUrl: "/api/placeholder/400/400", likes: 456, comments: 23, caption: "Nature walk 🌿", timestamp: "3d" },
  { id: "6", imageUrl: "/api/placeholder/400/400", likes: 789, comments: 45, caption: "Team success! 🎉", timestamp: "4d" },
];

type TabType = "posts" | "reels" | "tagged";

export default function ProfilePage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="ig-profile-header">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="ig-avatar-large">
                <Avatar className="w-full h-full">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.username} />
                  <AvatarFallback className="text-3xl bg-secondary">
                    {mockUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Username & Actions */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="ig-text-title flex items-center gap-2">
                  {mockUser.username}
                  {mockUser.isVerified && (
                    <svg className="w-5 h-5 ig-verified" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    className={cn(
                      "px-6 font-semibold rounded-md",
                      isFollowing ? "bg-secondary text-foreground border border-border" : "bg-primary text-white"
                    )}
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button className="px-6 font-semibold rounded-md bg-secondary text-foreground border border-border">
                    Message
                  </Button>
                  <Button variant="ghost" className="p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <p className="ig-profile-stat-value">{mockUser.posts}</p>
                  <p className="ig-profile-stat-label">posts</p>
                </div>
                <div className="text-center cursor-pointer">
                  <p className="ig-profile-stat-value">{formatNumber(mockUser.followers)}</p>
                  <p className="ig-profile-stat-label">followers</p>
                </div>
                <div className="text-center cursor-pointer">
                  <p className="ig-profile-stat-value">{formatNumber(mockUser.following)}</p>
                  <p className="ig-profile-stat-label">following</p>
                </div>
              </div>

              {/* Bio */}
              <div className="ig-profile-bio">
                <p className="font-semibold">{mockUser.name}</p>
                <p>{mockUser.bio}</p>
                {mockUser.website && (
                  <a href={`https://${mockUser.website}`} className="text-ig-link font-semibold">
                    {mockUser.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="px-4 md:px-0 mb-4">
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {mockHighlights.map((highlight) => (
              <div key={highlight.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                <div className={cn(
                  "ig-highlight-circle",
                  highlight.isViewed ? "ig-highlight-circle-viewed" : "ig-highlight-circle-active"
                )}>
                  <div className="w-full h-full rounded-full bg-secondary overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={highlight.imageUrl} alt={highlight.title} />
                      <AvatarFallback>{highlight.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <p className="ig-highlight-label">{highlight.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons (Archived, etc.) */}
        <div className="px-4 md:px-0 mb-4">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-secondary border-border rounded-md">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Share Profile
            </Button>
            <Button variant="outline" className="flex-1 bg-secondary border-border rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Profile Tabs */}
        <div className="ig-profile-tabs">
          <button
            className={cn(
              "ig-profile-tab",
              activeTab === "posts" ? "ig-profile-tab-active" : "ig-profile-tab-inactive"
            )}
            onClick={() => setActiveTab("posts")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            className={cn(
              "ig-profile-tab",
              activeTab === "reels" ? "ig-profile-tab-active" : "ig-profile-tab-inactive"
            )}
            onClick={() => setActiveTab("reels")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </button>
          <button
            className={cn(
              "ig-profile-tab",
              activeTab === "tagged" ? "ig-profile-tab-active" : "ig-profile-tab-inactive"
            )}
            onClick={() => setActiveTab("tagged")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" && (
          <div className="ig-grid">
            {mockPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square group">
                <div className="absolute inset-0 bg-secondary">
                  {/* Placeholder for post image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-white">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                    </svg>
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "reels" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="ig-text-title mb-2">No Reels yet</p>
            <p className="ig-text-body text-muted-foreground max-w-xs">
              When you create Reels, they'll show up here.
            </p>
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="ig-text-title mb-2">No Tagged Photos</p>
            <p className="ig-text-body text-muted-foreground max-w-xs">
              When people tag you in photos, they'll appear here.
            </p>
          </div>
        )}
      </main>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
