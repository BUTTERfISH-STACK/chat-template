"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sidebar, BottomNavBar } from "@/components/ui/Sidebar"
import { ChatList, ChatListHeader, SearchBar } from "@/components/ui/ChatList"
import { Message, DateSeparator, MessageSkeleton } from "@/components/ui/Message"
import { ChatInput, TypingIndicator } from "@/components/ui/ChatInput"
import { MediaViewer } from "@/components/ui/MediaGallery"

interface Chat {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
  status?: "online" | "offline" | "away"
  isGroup?: boolean
  isMuted?: boolean
  isPinned?: boolean
}

interface Message {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  author?: string
  authorAvatar?: string
  isGroup?: boolean
  media?: {
    type: "image" | "video"
    url: string
    thumbnail?: string
  }
  reactions?: { emoji: string; count: number; isByUser: boolean }[]
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Hey, how are you doing?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    status: "online",
    isPinned: true
  },
  {
    id: "2",
    name: "Work Group",
    lastMessage: "Don't forget the meeting at 3 PM",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
    isGroup: true,
    isMuted: true
  },
  {
    id: "3",
    name: "Mike Brown",
    lastMessage: "See you tomorrow!",
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
    status: "away"
  },
  {
    id: "4",
    name: "Emily Davis",
    lastMessage: "Thanks for your help!",
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    status: "online"
  },
  {
    id: "5",
    name: "David Wilson",
    lastMessage: "The project looks great",
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
    status: "offline"
  }
]

const mockMessages: Message[] = [
  { id: "1", content: "Hey Sarah! I'm doing great, thanks for asking! 😊", timestamp: "2024-01-15T10:30:00", isOwn: true, status: "read" },
  { id: "2", content: "That's good to hear! How's the new project going?", timestamp: "2024-01-15T10:32:00", isOwn: false, status: "read", author: "Sarah", isGroup: false },
  { id: "3", content: "It's going really well! We're almost done with the first phase.", timestamp: "2024-01-15T10:33:00", isOwn: true, status: "read" },
  { id: "4", content: "Awesome! We should celebrate when it's complete 🎉", timestamp: "2024-01-15T10:34:00", isOwn: false, status: "read", author: "Sarah", isGroup: false },
  { id: "5", content: "Definitely! Maybe we can go out for dinner?", timestamp: "2024-01-15T10:35:00", isOwn: true, status: "read" },
  { id: "6", content: "Sounds like a plan! How about Friday?", timestamp: "2024-01-15T10:36:00", isOwn: false, status: "read", author: "Sarah", isGroup: false },
  { id: "7", content: "Friday works perfectly for me!", timestamp: "2024-01-15T10:37:00", isOwn: true, status: "read" }
]

export default function ChatPage() {
  const router = useRouter()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = mockChats.find(c => c.id === activeChat)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (activeChat && !inputValue) {
      const timer = setTimeout(() => {
        setIsTyping(true)
        setTypingUsers(["Sarah"])
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
      setTypingUsers([])
    }
  }, [activeChat, inputValue])

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sending"
    }
    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: "sent" } : m
        )
      )
    }, 1000)

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: "delivered" } : m
        )
      )
    }, 2000)
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    setMessages(mockMessages)
  }

  const handleBack = () => {
    setActiveChat(null)
  }

  if (activeChat && currentChat) {
    return (
      <div className="flex flex-col h-screen bg-[var(--background)]">
        {/* Chat Header */}
        <header className="chat-header flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="back-button">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
              <AvatarFallback className="bg-[var(--secondary)] text-[var(--primary)]">
                {currentChat.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[var(--foreground)] truncate">
                {currentChat.name}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentChat.status === "online" ? "online" : currentChat.isGroup ? "Group" : "Last seen recently"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="action-button p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="action-button p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="action-button p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 space-y-2">
          <DateSeparator date={new Date().toISOString()} />
          
          {messages.map((message) => (
            <Message
              key={message.id}
              id={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isOwnMessage={message.isOwn}
              status={message.status}
              author={message.author}
              authorAvatar={message.authorAvatar}
              isGroup={message.isGroup}
              media={message.media}
              onMessageClick={() => message.media && setSelectedMedia(message)}
            />
          ))}

          {isTyping && (
            <TypingIndicator names={typingUsers} />
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInput
            value={inputValue}
            onSend={handleSendMessage}
            onValueChange={setInputValue}
            onAttach={() => console.log("Attach")}
            onImageClick={() => console.log("Image")}
            onAudioClick={() => console.log("Audio")}
          />
        </div>

        {/* Media Viewer */}
        {selectedMedia && selectedMedia.media && (
          <MediaViewer
            media={{
              id: selectedMedia.id,
              type: selectedMedia.media.type,
              url: selectedMedia.media.url,
              thumbnail: selectedMedia.media.thumbnail,
              timestamp: selectedMedia.timestamp
            }}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatListHeader
          title="Chats"
          onSearchClick={() => setIsSearchActive(true)}
        />

        {/* Search Bar */}
        {isSearchActive && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClose={() => {
              setIsSearchActive(false)
              setSearchQuery("")
            }}
          />
        )}

        {/* Chat List */}
        <main className="flex-1 overflow-y-auto">
          <ChatList
            chats={mockChats}
            onChatSelect={handleSelectChat}
            searchQuery={searchQuery}
          />
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar />
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => console.log("New chat")}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
