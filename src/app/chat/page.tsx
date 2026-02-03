"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

// Types for conversations
interface Conversation {
  id: string;
  phoneNumber: string;
  name?: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
  isTyping?: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "document";
  mediaUrl?: string;
}

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: "1",
    phoneNumber: "+1234567890",
    name: "Alice Smith",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Hey! How are you doing?",
    timestamp: "10:30 AM",
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: "1", content: "Hi there!", timestamp: "10:00 AM", isOwn: false, status: "read", type: "text" },
      { id: "2", content: "Hello! I'm doing great, thanks!", timestamp: "10:02 AM", isOwn: true, status: "read", type: "text" },
      { id: "3", content: "Hey! How are you doing?", timestamp: "10:30 AM", isOwn: false, status: "read", type: "text" },
    ],
  },
  {
    id: "2",
    phoneNumber: "+1987654321",
    name: "Bob Johnson",
    avatar: "/api/placeholder/64/64",
    lastMessage: "See you tomorrow! 👋",
    timestamp: "9:45 AM",
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    messages: [
      { id: "1", content: "Are we still meeting tomorrow?", timestamp: "9:30 AM", isOwn: true, status: "read", type: "text" },
      { id: "2", content: "Yes, definitely! What time works for you?", timestamp: "9:35 AM", isOwn: false, status: "read", type: "text" },
      { id: "3", content: "How about 2 PM?", timestamp: "9:40 AM", isOwn: true, status: "read", type: "text" },
      { id: "4", content: "Perfect! See you then!", timestamp: "9:42 AM", isOwn: false, status: "read", type: "text" },
      { id: "5", content: "See you tomorrow! 👋", timestamp: "9:45 AM", isOwn: false, status: "read", type: "text" },
    ],
  },
  {
    id: "3",
    phoneNumber: "+1555123456",
    name: "Carol White",
    avatar: "/api/placeholder/64/64",
    lastMessage: "The project looks amazing! 🎉",
    timestamp: "Yesterday",
    unreadCount: 1,
    isOnline: true,
    messages: [
      { id: "1", content: "I just finished the new design", timestamp: "Yesterday", isOwn: false, status: "delivered", type: "text" },
      { id: "2", content: "Let me take a look", timestamp: "Yesterday", isOwn: true, status: "read", type: "text" },
      { id: "3", content: "The project looks amazing! 🎉", timestamp: "Yesterday", isOwn: false, status: "read", type: "text" },
    ],
  },
  {
    id: "4",
    phoneNumber: "+1999888777",
    name: "David Brown",
    avatar: "/api/placeholder/64/64",
    lastMessage: "Thanks for the help!",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: "1", content: "Can you help me with something?", timestamp: "Yesterday", isOwn: false, status: "read", type: "text" },
      { id: "2", content: "Sure, what do you need?", timestamp: "Yesterday", isOwn: true, status: "read", type: "text" },
      { id: "3", content: "Thanks for the help!", timestamp: "Yesterday", isOwn: false, status: "read", type: "text" },
    ],
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (conv.name?.toLowerCase().includes(searchLower) ?? false) ||
      conv.phoneNumber.includes(searchLower) ||
      conv.lastMessage.toLowerCase().includes(searchLower)
    );
  });

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-16 z-10 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/chat/new")}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Search */}
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
        </header>

        {/* Conversations List */}
        <div className="divide-y divide-border">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer"
              onClick={() => router.push(`/chat/${conversation.id}`)}
            >
              {/* Avatar with online indicator */}
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={conversation.avatar} alt={conversation.name || conversation.phoneNumber} />
                  <AvatarFallback>
                    {(conversation.name || conversation.phoneNumber).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                )}
              </div>

              {/* Conversation content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {conversation.name || conversation.phoneNumber}
                    </p>
                    {conversation.isTyping && (
                      <span className="text-xs text-primary">typing...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{conversation.unreadCount}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{formatTimestamp(conversation.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-sm truncate flex-1",
                    conversation.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start a new chat to connect!</p>
          </div>
        )}
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
