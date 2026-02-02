"use client";

import { useState } from "react";
import { ChatList as ChatListComponent } from "@/components/ui/ChatList"

interface ChatItem {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  status?: "online" | "offline" | "away"
}

export default function ChatListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const chats: ChatItem[] = [
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      timestamp: "12:34 PM",
      unreadCount: 2,
      status: "online"
    },
    {
      id: "2",
      name: "Jane Smith",
      lastMessage: "I'll be there in 10 minutes",
      timestamp: "11:22 AM",
      status: "offline"
    },
    {
      id: "3",
      name: "Work Group",
      lastMessage: "Don't forget the meeting at 3 PM",
      timestamp: "9:15 AM",
      unreadCount: 1
    },
    {
      id: "4",
      name: "Sarah Johnson",
      lastMessage: "Thanks for your help!",
      timestamp: "Yesterday",
      status: "online"
    },
    {
      id: "5",
      name: "Mike Brown",
      lastMessage: "See you tomorrow",
      timestamp: "Yesterday",
      status: "away"
    }
  ]

  const handleChatSelect = (chatId: string) => {
    // Navigate to chat room
    console.log(`Navigating to chat: ${chatId}`)
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="chat-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border bg-background">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto p-4">
        {filteredChats.length > 0 ? (
          <ChatListComponent chats={filteredChats} onChatSelect={handleChatSelect} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="chat-footer flex-shrink-0">
        <div className="flex items-center justify-around">
          <a href="/chat" className="sidebar-item-active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </a>
          <a href="/marketplace" className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </a>
          <button className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}
