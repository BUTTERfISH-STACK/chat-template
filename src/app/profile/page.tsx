"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SideNav, TopNavBar } from "@/components/ui/SideNav";
import { useAuth } from "@/lib/auth-context";

// Post interface
interface Post {
  id: string;
  type: string;
  aspectRatio: "square" | "portrait" | "landscape";
  likes: number;
  comments: number;
}

// Stats interface
interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);

  // Determine if this is the user's own profile
  useEffect(() => {
    if (user) {
      setIsOwnProfile(true);
      // In a real app, you would check if the profile ID matches the current user
    }
  }, [user]);

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get aspect ratio class
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      default:
        return "aspect-square";
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
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
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <header className="vellon-card-section">
            {/* Profile Info - Desktop */}
            <div className="hidden md:flex items-start gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-32 h-32 rounded-xl">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {user && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--accent-green)] rounded-full border-2 border-[var(--card)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
                    {user?.name || "Guest User"}
                  </h1>
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <>
                        <Link href="/settings">
                          <Button className="vellon-btn vellon-btn-secondary px-6">
                            Edit Profile
                          </Button>
                        </Link>
                        <Link href="/settings?tab=privacy">
                          <Button variant="outline" className="vellon-btn px-6">
                            Privacy
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Button
                          className={cn(
                            "vellon-btn px-6",
                            isFollowing ? "vellon-btn-secondary" : "vellon-btn-primary"
                          )}
                          onClick={() => setIsFollowing(!isFollowing)}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button variant="outline" className="vellon-btn">
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mb-4">
                  <button className="text-center hover:opacity-75 transition-opacity">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatNumber(stats.posts)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">posts</p>
                  </button>
                  <button className="text-center hover:opacity-75 transition-opacity">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatNumber(stats.followers)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">followers</p>
                  </button>
                  <button className="text-center hover:opacity-75 transition-opacity">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatNumber(stats.following)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">following</p>
                  </button>
                </div>

                {/* Bio */}
                <div>
                  <p className="font-medium text-[var(--foreground)]">{user?.name || ""}</p>
                  <p className="text-sm text-[var(--foreground)] mt-1 whitespace-pre-wrap">
                    {user?.bio || "No bio yet"}
                  </p>
                  {user?.email && (
                    <a
                      href={`mailto:${user.email}`}
                      className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
                    >
                      {user.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info - Mobile */}
            <div className="md:hidden">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-20 h-20 rounded-xl">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="text-xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-xl font-display font-bold text-[var(--foreground)]">
                    {user?.name || "Guest User"}
                  </h1>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    @{user?.name?.toLowerCase().replace(/\s+/g, "") || "username"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--foreground)] mb-4 whitespace-pre-wrap">
                {user?.bio || "No bio yet"}
              </p>

              <div className="flex items-center justify-around mb-4">
                <button className="text-center hover:opacity-75 transition-opacity">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {formatNumber(stats.posts)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">posts</p>
                </button>
                <button className="text-center hover:opacity-75 transition-opacity">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {formatNumber(stats.followers)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">followers</p>
                </button>
                <button className="text-center hover:opacity-75 transition-opacity">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {formatNumber(stats.following)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">following</p>
                </button>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Link href="/settings" className="flex-1">
                      <Button className="w-full vellon-btn vellon-btn-secondary">
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/settings?tab=privacy" className="flex-1">
                      <Button variant="outline" className="w-full vellon-btn">
                        Privacy
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      className={cn("flex-1 vellon-btn", isFollowing ? "vellon-btn-secondary" : "vellon-btn-primary")}
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="flex-1 vellon-btn">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Highlights */}
          <div className="vellon-card-section">
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {/* Highlights will be loaded from API - placeholder for now */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">New</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border)]">
            <div className="flex">
              <button
                className={cn(
                  "flex-1 flex items-center justify-center py-4 border-b-2 transition-colors",
                  activeTab === "posts"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                onClick={() => setActiveTab("posts")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                className={cn(
                  "flex-1 flex items-center justify-center py-4 border-b-2 transition-colors",
                  activeTab === "saved"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                onClick={() => setActiveTab("saved")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                className={cn(
                  "flex-1 flex items-center justify-center py-4 border-b-2 transition-colors",
                  activeTab === "tagged"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                onClick={() => setActiveTab("tagged")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="p-2">
            {posts.length === 0 ? (
              <div className="vellon-empty py-12">
                <div className="vellon-empty-icon">
                  <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="vellon-empty-title">
                  {activeTab === "posts" ? "No posts yet" : activeTab === "saved" ? "No saved posts" : "No tagged posts"}
                </p>
                <p className="vellon-empty-description">
                  {activeTab === "posts" 
                    ? "When you share posts, they'll appear here." 
                    : activeTab === "saved" 
                    ? "Save posts to view them here." 
                    : "When people tag you, it'll appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className={cn(
                      "relative bg-[var(--secondary)] overflow-hidden cursor-pointer group animate-fade-in",
                      getAspectRatioClass(post.aspectRatio)
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-[var(--muted-foreground)]/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-sm font-medium">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium">{post.comments}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
