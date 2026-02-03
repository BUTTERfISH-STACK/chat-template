"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Mock user data
const mockUser = {
  name: "John Doe",
  phone: "+1 234 567 8900",
  email: "john.doe@example.com",
  bio: "Premium user • Available for business inquiries",
  isVerified: true,
  isBusiness: true
}

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoDownload, setAutoDownload] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="chat-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="back-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Settings</h1>
        </div>
      </header>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            <Avatar className="w-full h-full">
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
          <p className="profile-status">{mockUser.phone}</p>
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
            <div
              className={cn("toggle-switch", notifications && "active")}
              onClick={() => setNotifications(!notifications)}
            />
          </div>

          <div className="settings-item">
            <div className="settings-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="settings-content">
              <p className="settings-label">Media Auto-Download</p>
              <p className="settings-description">Automatically download images and videos</p>
            </div>
            <div
              className={cn("toggle-switch", autoDownload && "active")}
              onClick={() => setAutoDownload(!autoDownload)}
            />
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
          <a href="/profile" className="sidebar-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
          <a href="/settings" className="sidebar-item-active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}
