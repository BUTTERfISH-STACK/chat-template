"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

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
    imageUrl: "/api/placeholder/600/600",
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
    likes: 890,
    comments: 45,
    caption: "Sunset perfection 🌅",
    timestamp: "1d",
    isLiked: false,
    isSaved: false,
  },
];

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Stories */}
        <div className="border-b border-border">
          <div className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                <div className={story.isViewed ? "ig-story-viewed" : "ig-story-ring"}>
                  <div className="w-[64px] h-[64px] rounded-full p-[2px] bg-background">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={story.avatar} alt={story.username} />
                      <AvatarFallback>{story.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <p className="text-xs max-w-[70px] truncate">{story.isOwn ? "Your story" : story.username}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="pb-4">
          {posts.map((post) => (
            <article key={post.id} className="ig-post-card mb-4">
              {/* Post Header */}
              <div className="ig-post-header">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.avatar} alt={post.username} />
                    <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${post.username}`} className="font-semibold text-sm hover:underline">
                      {post.username}
                    </Link>
                    {post.location && (
                      <p className="text-xs text-muted-foreground">{post.location}</p>
                    )}
                  </div>
                </div>
                <button className="ig-icon-button">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>

              {/* Post Image */}
              <div 
                className="aspect-square bg-secondary cursor-pointer"
                onDoubleClick={() => toggleLike(post.id)}
              >
                {/* Placeholder for post image */}
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Post Actions */}
              <div className="ig-post-actions">
                <div className="flex items-center gap-4">
                  <button 
                    className="ig-icon-button p-0"
                    onClick={() => toggleLike(post.id)}
                  >
                    <svg 
                      className={cn("w-6 h-6", likedPosts.has(post.id) || post.isLiked ? "fill-red-500 text-red-500" : "text-foreground")} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <button className="ig-icon-button p-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="ig-icon-button p-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                <button 
                  className="ig-icon-button p-0 ml-auto"
                  onClick={() => toggleSave(post.id)}
                >
                  <svg 
                    className={cn("w-6 h-6", savedPosts.has(post.id) || post.isSaved ? "fill-black text-black" : "text-foreground")} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Post Footer */}
              <div className="ig-post-footer pt-0">
                <p className="font-semibold text-sm mb-1">{formatNumber(post.likes)} likes</p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">{post.username}</span> {post.caption}
                </p>
                <button className="text-sm text-muted-foreground hover:underline">
                  View all {post.comments} comments
                </button>
                <p className="text-xs text-muted-foreground mt-1">{post.timestamp} ago</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

import { cn } from "@/lib/utils";
