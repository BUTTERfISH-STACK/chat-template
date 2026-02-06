"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SideNav, TopNavBar } from "@/components/ui/SideNav"

// Types for conversations (matching API response)
interface Conversation {
  id: string
  name: string | null
  participantCount: number
  lastMessage: string | null
  lastMessageAt: string | null
  createdAt: string
  participants: Array<{ id: string; name: string; email: string }>
}

interface User {
  id: string
  name: string
  email: string
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [error, setError] = useState("")

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json()
        if (data.success && data.profile) {
          setUser({
            id: data.profile.userId,
            name: data.profile.name,
            email: data.profile.email,
          })
        } else {
          router.push("/login")
        }
      } catch {
        router.push("/login")
      }
    }
    fetchUser()
  }, [router])

  // Fetch conversations from API
  useEffect(() => {
    if (!user) return

    async function fetchConversations() {
      try {
        const res = await fetch("/api/chat/conversations")
        const data = await res.json()
        if (data.success && data.conversations) {
          setConversations(data.conversations)
        }
      } catch (err) {
        setError("Failed to load conversations")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConversations()
  }, [user])

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return ""
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
                  {conversations.length} conversations
                </p>
              </div>
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
          </header>

          {/* Error state */}
          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Conversations List */}
          <div className="divide-y divide-[var(--border)]">
            {conversations.map((conversation, index) => {
              // Get other participant name
              const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
              const displayName = otherParticipant?.name || conversation.name || "Unknown"

              return (
                <div
                  key={conversation.id}
                  className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => router.push(`/chat/${conversation.id}`)}
                >
                  {/* Avatar */}
                  <Avatar className="w-14 h-14 rounded-lg">
                    <AvatarFallback className="font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Conversation content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate text-[var(--foreground)]">
                        {displayName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {conversations.length === 0 && !error && (
            <div className="vellon-empty">
              <div className="vellon-empty-icon">
                <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="vellon-empty-title">No conversations yet</p>
              <p className="vellon-empty-description">
                Start a chat with your contacts!
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
