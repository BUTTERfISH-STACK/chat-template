"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

// Types
interface DirectMessage {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
  hasStory?: boolean;
}

const messages: DirectMessage[] = [
  {
    id: "1",
    username: "sarah_j",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Hey! How are you?",
    timestamp: "2m",
    unreadCount: 2,
    isOnline: true,
    hasStory: true,
  },
  {
    id: "2",
    username: "mike_t",
    avatar: "/api/placeholder/64/64",
    lastMessage: "See you tomorrow!",
    timestamp: "1h",
    unreadCount: 0,
    isOnline: false,
    hasStory: false,
  },
  {
    id: "3",
    username: "emily_d",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Thanks for the help!",
    timestamp: "3h",
    unreadCount: 0,
    isOnline: true,
    hasStory: true,
  },
  {
    id: "4",
    username: "david_w",
    avatar: "/api/placeholder/64/64",
    lastMessage: "👍",
    timestamp: "1d",
    unreadCount: 0,
    isOnline: false,
    hasStory: false,
  },
  {
    id: "5",
    username: "lisa_m",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Can't wait!",
    timestamp: "2d",
    unreadCount: 1,
    isOnline: true,
    hasStory: false,
  },
  {
    id: "6",
    username: "james_k",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Let me know when you're free",
    timestamp: "3d",
    unreadCount: 0,
    isOnline: false,
    hasStory: true,
  },
  {
    id: "7",
    username: "anna_p",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Sounds good!",
    timestamp: "5d",
    unreadCount: 0,
    isOnline: true,
    hasStory: false,
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter((msg) =>
    msg.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-16 z-10 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/placeholder/32/32" alt="Your profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="font-semibold">johndoe</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="px-4 py-2 border-b border-border">
          <div className="ig-search-bar">
            <svg className="ig-search-bar-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ig-search-bar-input"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y divide-border">
          {filteredMessages.map((message) => (
            <Link
              key={message.id}
              href={`/chat/${message.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer"
            >
              {/* Avatar with story ring */}
              <div className={message.hasStory ? "ig-story-ring" : "ig-avatar"}>
                <div className={message.hasStory ? "w-14 h-14 rounded-full p-[2px] bg-background" : ""}>
                  <Avatar className="w-full h-full">
                    <AvatarImage src={message.avatar} alt={message.username} />
                    <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm truncate">{message.username}</p>
                  <div className="flex items-center gap-2">
                    {message.isOnline && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                    <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm truncate flex-1",
                    message.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {message.lastMessage}
                  </p>
                  {message.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                      {message.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state if no results */}
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

import { cn } from "@/lib/utils";
