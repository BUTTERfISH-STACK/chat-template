"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SideNav, TopNavBar } from "@/components/ui/SideNav"
import { chatAPI } from "@/lib/api"

// Types for conversations (matching API response)
interface Conversation {
  id: string
  name?: string
  avatar?: string
  status?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline?: boolean
  isTyping?: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Fetch conversations from API
  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchConversations() {
      try {
        const data = await chatAPI.getConversations()
        setConversations(data as Conversation[])
      } catch (err) {
        setError("Failed to load conversations")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConversations()
  }, [isAuthenticated])

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (conv.name?.toLowerCase().includes(searchLower) ?? false) ||
      conv.lastMessage.toLowerCase().includes(searchLower)
    )
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    )
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
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
                  Messages
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {filteredConversations.length} conversations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-[var(--secondary)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-[var(--secondary)]"
                  onClick={() => router.push("/chat/new")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="vellon-search">
              <svg className="vellon-search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vellon-search-input"
              />
            </div>
          </header>

          {/* Error state */}
          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Conversations List */}
          <div className="divide-y divide-[var(--border)]">
            {filteredConversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer animate-slide-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => router.push(`/chat/${conversation.id}`)}
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-14 h-14 rounded-lg">
                    <AvatarImage src={conversation.avatar} alt={conversation.name || 'Unknown'} />
                    <AvatarFallback className="font-medium">
                      {(conversation.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--accent-green)] rounded-full border-2 border-[var(--card)]" />
                  )}
                </div>

                {/* Conversation content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-semibold text-sm truncate text-[var(--foreground)]">
                        {conversation.name || 'Unknown'}
                      </p>
                      {conversation.isTyping && (
                        <span className="text-xs text-[var(--primary)] animate-pulse-soft">
                          typing...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatTimestamp(conversation.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm truncate flex-1",
                        conversation.unreadCount > 0
                          ? "font-medium text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount === 0 && (
                      <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredConversations.length === 0 && !error && (
            <div className="vellon-empty">
              <div className="vellon-empty-icon">
                <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="vellon-empty-title">No conversations found</p>
              <p className="vellon-empty-description">
                Start a new chat to connect with friends and sellers!
              </p>
              <Button
                className="mt-4 vellon-btn-primary"
                onClick={() => router.push("/chat/new")}
              >
                New Message
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
