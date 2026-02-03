"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusList } from "@/components/ui/StatusList"
import { ContactList, ContactStatus } from "@/components/ui/ContactList"
import { MediaGallery, DocumentList } from "@/components/ui/MediaGallery"

// Types
interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  bio?: string
  status?: "online" | "away" | "busy" | "offline"
  statusText?: string
  lastSeen?: string
  isVerified?: boolean
  isBusiness?: boolean
}

interface Message {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  status: "sent" | "delivered" | "read"
}

interface MediaItem {
  id: string
  type: "image" | "video" | "document"
  url: string
  name?: string
  size?: string
  thumbnail?: string
  duration?: string
  timestamp: string
}

const tabs: Tab[] = [
  {
    id: "chats",
    label: "Chats",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: "status",
    label: "Status",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    id: "calls",
    label: "Calls",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
]

// Mock data
const mockUser: User = {
  id: "1",
  name: "John Doe",
  phone: "+1 234 567 8900",
  email: "john.doe@example.com",
  bio: "Premium user • Available for business inquiries",
  status: "online",
  statusText: "online",
  isVerified: true,
  isBusiness: true
}

const mockStatuses = [
  { id: "1", name: "My Status", timestamp: "Just now", isViewed: false },
  { id: "2", name: "Sarah Johnson", timestamp: "2 hours ago", isViewed: true, mediaUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
  { id: "3", name: "Mike Brown", timestamp: "5 hours ago", isViewed: true },
  { id: "4", name: "Emily Davis", timestamp: "Yesterday", isViewed: true, mediaUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" },
  { id: "5", name: "David Wilson", timestamp: "2 days ago", isViewed: true }
]

const mockContacts = [
  { id: "1", name: "Alice Smith", phone: "+1 234 567 8901", status: "online" as ContactStatus, statusText: "online" },
  { id: "2", name: "Bob Johnson", phone: "+1 234 567 8902", status: "away" as ContactStatus, statusText: "Last seen 5 min ago" },
  { id: "3", name: "Carol White", phone: "+1 234 567 8903", status: "busy" as ContactStatus, statusText: "In a meeting" },
  { id: "4", name: "Dan Brown", phone: "+1 234 567 8904", status: "offline" as ContactStatus, lastSeen: "Last seen 2 hours ago" },
  { id: "5", name: "Eve Davis", phone: "+1 234 567 8905", status: "online" as ContactStatus, isVerified: true, statusText: "online" },
  { id: "6", name: "Frank Miller", phone: "+1 234 567 8906", status: "online" as ContactStatus, isBusiness: true, statusText: "online" }
]

const mockMessages: Message[] = [
  { id: "1", content: "Hey, how are you?", timestamp: "2024-01-15T10:30:00", isOwn: false, status: "read" },
  { id: "2", content: "I'm doing great, thanks for asking!", timestamp: "2024-01-15T10:31:00", isOwn: true, status: "read" },
  { id: "3", content: "Would you like to meet up later?", timestamp: "2024-01-15T10:32:00", isOwn: false, status: "read" },
  { id: "4", content: "Sure! Let's meet at the cafe at 3 PM", timestamp: "2024-01-15T10:33:00", isOwn: true, status: "read" },
  { id: "5", content: "Perfect, see you then! ☕", timestamp: "2024-01-15T10:34:00", isOwn: false, status: "read" }
]

const mockMedia: MediaItem[] = [
  { id: "1", type: "image", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", timestamp: "2024-01-10" },
  { id: "2", type: "image", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", timestamp: "2024-01-10" },
  { id: "3", type: "image", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400", timestamp: "2024-01-09" },
  { id: "4", type: "image", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400", timestamp: "2024-01-08" },
  { id: "5", type: "video", url: "", thumbnail: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400", duration: "0:30", timestamp: "2024-01-07" },
  { id: "6", type: "image", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", timestamp: "2024-01-06" },
  { id: "7", type: "image", url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400", timestamp: "2024-01-05" },
  { id: "8", type: "image", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400", timestamp: "2024-01-04" },
  { id: "9", type: "image", url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400", timestamp: "2024-01-03" }
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [darkMode, setDarkMode] = useState(true)

  const renderChatsTab = () => (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Status List */}
      <StatusList
        statuses={mockStatuses}
        onStatusClick={(id) => console.log("View status:", id)}
        onAddStatus={() => console.log("Add status")}
      />
      
      <div className="divider" />
      
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="search-bar">
          <svg className="search-bar-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar-input"
          />
        </div>
      </div>
      
      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <ContactList
          contacts={mockContacts}
          onContactClick={(id) => router.push(`/chat/${id}`)}
          showPhone={false}
          showStatus={true}
        />
      </div>
    </div>
  )

  const renderStatusTab = () => (
    <div className="flex-1 overflow-hidden flex flex-col">
      <StatusList
        statuses={mockStatuses}
        onStatusClick={(id) => console.log("View status:", id)}
        onAddStatus={() => console.log("Add status")}
      />
      
      <div className="divider" />
      
      {/* Recent Updates */}
      <div className="px-4 py-2">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Recent Updates
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ContactList
          contacts={mockContacts.filter(c => c.status === "online" || c.status === "away")}
          onContactClick={(id) => console.log("View status:", id)}
          showStatus={true}
          showPhone={false}
        />
      </div>
    </div>
  )

  const renderCallsTab = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <p className="empty-state-title">No calls yet</p>
        <p className="empty-state-description">
          Your call history will appear here. Start a call from a chat to see it here.
        </p>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          <Avatar className="w-full h-full">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="w-full h-full bg-[var(--secondary)] text-[var(--primary)] text-2xl font-semibold">
              {mockUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <h1 className="profile-name flex items-center gap-2 justify-center">
          {mockUser.name}
          {mockUser.isVerified && (
            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </h1>
        {mockUser.statusText && (
          <p className="profile-status">{mockUser.statusText}</p>
        )}
        {mockUser.bio && (
          <p className="profile-bio">{mockUser.bio}</p>
        )}
      </div>

      {/* Account Section */}
      <div className="contact-info-section">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Account</h3>
        </div>
        
        <div className="contact-info-item">
          <div className="contact-info-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="contact-info-content">
            <p className="contact-info-label">Phone</p>
            <p className="contact-info-value">{mockUser.phone}</p>
          </div>
        </div>

        <div className="contact-info-item">
          <div className="contact-info-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="contact-info-content">
            <p className="contact-info-label">Email</p>
            <p className="contact-info-value">{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Preferences Section */}
      <div className="contact-info-section">
        <h3 className="section-title">Preferences</h3>
        
        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Dark Mode</p>
            <p className="settings-description">Use dark theme across the app</p>
          </div>
          <div
            className={cn("toggle-switch", darkMode && "active")}
            onClick={() => setDarkMode(!darkMode)}
          />
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Notifications</p>
            <p className="settings-description">Receive message notifications</p>
          </div>
          <div className="toggle-switch active" />
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Media Auto-Download</p>
            <p className="settings-description">Automatically download images and videos</p>
          </div>
          <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="divider" />

      {/* Privacy Section */}
      <div className="contact-info-section">
        <h3 className="section-title">Privacy</h3>
        
        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Privacy Settings</p>
            <p className="settings-description">Manage who can see your info</p>
          </div>
          <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Two-Step Verification</p>
            <p className="settings-description">Add an extra layer of security</p>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
            Enabled
          </span>
        </div>
      </div>

      <div className="divider" />

      {/* Help Section */}
      <div className="contact-info-section">
        <h3 className="section-title">Help</h3>
        
        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">Help Center</p>
            <p className="settings-description">FAQs and support</p>
          </div>
          <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="settings-item">
          <div className="settings-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="settings-content">
            <p className="settings-label">About</p>
            <p className="settings-description">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="chat-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-[var(--foreground)]">
            {activeTab === "chats" && "Chats"}
            {activeTab === "status" && "Status"}
            {activeTab === "calls" && "Calls"}
            {activeTab === "settings" && "Settings"}
          </h1>
          <div className="flex-1" />
          <button className="action-button p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="action-button p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "chats" && renderChatsTab()}
        {activeTab === "status" && renderStatusTab()}
        {activeTab === "calls" && renderCallsTab()}
        {activeTab === "settings" && renderSettingsTab()}
      </main>

      {/* Footer Navigation */}
      <footer className="chat-footer flex-shrink-0">
        <div className="flex items-center justify-around">
          <a href="/chat" className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </a>
          <a href="/marketplace" className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </a>
          <a href="/profile" className="sidebar-item-active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
          <a href="/settings" className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button className="fab">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
