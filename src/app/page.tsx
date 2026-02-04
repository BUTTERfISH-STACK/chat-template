"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SideNav, TopNavBar } from "@/components/ui/SideNav";

// Types
interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed?: boolean;
  isOwn?: boolean;
}

interface Post {
  id: string;
  username: string;
  avatar: string;
  location?: string;
  imageUrl: string;
  aspectRatio: "square" | "portrait" | "landscape";
  likes: number;
  comments: number;
  caption: string;
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
}

const stories: Story[] = [
  { id: "1", username: "Your story", avatar: "/api/placeholder/64/64", isOwn: true },
  { id: "2", username: "sarah_j", avatar: "/api/placeholder/64/64", isViewed: true },
  { id: "3", username: "mike_t", avatar: "/api/placeholder/64/64" },
  { id: "4", username: "emily_d", avatar: "/api/placeholder/64/64", isViewed: true },
  { id: "5", username: "david_w", avatar: "/api/placeholder/64/64" },
  { id: "6", username: "lisa_m", avatar: "/api/placeholder/64/64" },
  { id: "7", username: "james_k", avatar: "/api/placeholder/64/64", isViewed: true },
  { id: "8", username: "anna_p", avatar: "/api/placeholder/64/64" },
];

const posts: Post[] = [
  {
    id: "1",
    username: "sarah_j",
    avatar: "/api/placeholder/64/64",
    location: "New York City",
    imageUrl: "/api/placeholder/600/600",
    aspectRatio: "portrait",
    likes: 1234,
    comments: 56,
    caption: "Exploring the city that never sleeps! 🗽 #NYC #Travel",
    timestamp: "2h",
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    username: "mike_t",
    avatar: "/api/placeholder/64/64",
    location: "Coffee Shop",
    imageUrl: "/api/placeholder/600/450",
    aspectRatio: "landscape",
    likes: 567,
    comments: 23,
    caption: "Best Monday morning vibes ☕",
    timestamp: "5h",
    isLiked: true,
    isSaved: true,
  },
  {
    id: "3",
    username: "emily_d",
    avatar: "/api/placeholder/64/64",
    imageUrl: "/api/placeholder/600/600",
    aspectRatio: "square",
    likes: 890,
    comments: 45,
    caption: "Sunset perfection 🌅",
    timestamp: "1d",
    isLiked: false,
    isSaved: false,
  },
  {
    id: "4",
    username: "travel_diaries",
    avatar: "/api/placeholder/64/64",
    location: "Tokyo, Japan",
    imageUrl: "/api/placeholder/600/750",
    aspectRatio: "portrait",
    likes: 2345,
    comments: 89,
    caption: "Neon nights in Tokyo 🌃✨ #Japan #Travel",
    timestamp: "2d",
    isLiked: true,
    isSaved: true,
  },
];

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(["2", "4"]));
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set(["2", "4"]));

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
        <div className="max-w-2xl mx-auto">
          {/* Stories Section - Horizontal Scroll */}
          <section className="border-b border-[var(--border)] py-5 px-4 md:px-6">
            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--secondary)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      Y
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  Your story
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.05s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-[var(--border)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      S
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  sarah_j
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      M
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  mike_t
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.15s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-[var(--border)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      E
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  emily_d
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      D
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  david_w
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.25s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      L
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  lisa_m
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-[var(--border)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      J
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  james_k
                </p>
              </div>
              <div
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: "0.35s" }}
              >
                <div
                  className="w-18 h-18 rounded-full p-[2.5px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-gold)] to-[var(--accent-rose)]"
                >
                  <div
                    className="w-full h-full rounded-full bg-[var(--card)] p-1"
                    style={{ background: "var(--card)" }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[var(--primary)] font-semibold text-sm shadow-sm"
                      style={{ background: "var(--secondary)", fontSize: "1.35rem" }}
                    >
                      A
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] truncate text-center max-w-[70px] group-hover:text-[var(--foreground)] transition-colors">
                  anna_p
                </p>
              </div>
            </div>
          </section>

          {/* Posts Feed */}
          <section className="py-6 px-3 md:px-4">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="vellon-card mb-8 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Post Header */}
                <header className="vellon-post-header">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-lg shadow-sm">
                      <AvatarImage src={post.avatar} alt={post.username} />
                      <AvatarFallback>
                        {post.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/profile/${post.username}`}
                        className="font-medium text-sm hover:text-[var(--primary)] transition-colors"
                      >
                        {post.username}
                      </Link>
                      {post.location && (
                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {post.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                    <svg
                      className="w-5 h-5 text-[var(--muted-foreground)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </header>

                {/* Post Media - Varying Aspect Ratios */}
                <div
                  className={cn(
                    "bg-[var(--secondary)] cursor-pointer relative overflow-hidden transition-transform duration-500",
                    getAspectRatioClass(post.aspectRatio)
                  )}
                  onDoubleClick={() => toggleLike(post.id)}
                >
                  {/* Placeholder for post image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-[var(--muted-foreground)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="vellon-post-actions pt-4">
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-all duration-200 active:scale-90"
                      onClick={() => toggleLike(post.id)}
                    >
                      <svg
                        className={cn(
                          "w-6 h-6 transition-all duration-200 hover:scale-110",
                          likedPosts.has(post.id) || post.isLiked
                            ? "fill-[var(--primary)] text-[var(--primary)]"
                            : "text-[var(--foreground)]"
                        )}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                    <button className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                      <svg
                        className="w-6 h-6 text-[var(--foreground)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                    <button className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                      <svg
                        className="w-6 h-6 text-[var(--foreground)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors ml-auto"
                    onClick={() => toggleSave(post.id)}
                  >
                    <svg
                      className={cn(
                        "w-6 h-6 transition-all duration-200",
                        savedPosts.has(post.id) || post.isSaved
                          ? "fill-[var(--accent-gold)] text-[var(--accent-gold)]"
                          : "text-[var(--foreground)]"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Post Footer */}
                <footer className="vellon-post-footer">
                  <p className="font-medium text-sm mb-2">
                    {formatNumber(post.likes)} likes
                  </p>
                  <p className="text-sm mb-3 leading-relaxed">
                    <span className="font-medium">{post.username}</span>{" "}
                    {post.caption}
                  </p>
                  <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-2">
                    View all {post.comments} comments
                  </button>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                    {post.timestamp} ago
                  </p>
                </footer>
              </article>
            ))}

            {/* Load More */}
            <div className="flex justify-center py-8">
              <button className="vellon-btn vellon-btn-outline vellon-btn-md px-6">
                Load More
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
