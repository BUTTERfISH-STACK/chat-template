"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

// Mock user data
const mockUser = {
  username: "johndoe",
  name: "John Doe",
  avatar: "/api/placeholder/150/150",
};

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: string;
  onClick?: () => void;
}

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const accountSettings: SettingItem[] = [
    {
      id: "edit-profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Edit Profile",
      onClick: () => router.push("/profile/edit"),
    },
    {
      id: "change-password",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: "Change Password",
      onClick: () => router.push("/settings/password"),
    },
    {
      id: "two-factor",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: "Two-Factor Authentication",
      action: "Off",
      onClick: () => router.push("/settings/two-factor"),
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      id: "privacy",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: "Privacy and Security",
    },
    {
      id: "activity-status",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: "Activity Status",
      action: "On",
    },
  ];

  const preferencesSettings: SettingItem[] = [
    {
      id: "notifications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: "Notifications",
      description: "Manage your notification preferences",
      onClick: () => router.push("/settings/notifications"),
    },
    {
      id: "dark-mode",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      label: "Dark Mode",
      description: "Toggle dark theme",
    },
    {
      id: "language",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      label: "Language",
      action: "English",
      onClick: () => router.push("/settings/language"),
    },
  ];

  const moreSettings: SettingItem[] = [
    {
      id: "help",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Help",
    },
    {
      id: "about",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "About",
      description: "Version 1.0.0",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-16 z-10 bg-background border-b border-border px-4 py-3">
          <h1 className="text-lg font-bold text-center">Settings</h1>
        </header>

        {/* Profile Section */}
        <div className="border-b border-border">
          <Link 
            href="/profile"
            className="flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer"
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={mockUser.avatar} alt={mockUser.username} />
              <AvatarFallback>{mockUser.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{mockUser.username}</p>
              <p className="text-sm text-muted-foreground">{mockUser.name}</p>
            </div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Account Settings */}
        <div className="border-b border-border">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
          </div>
          {accountSettings.map((setting) => (
            <button
              key={setting.id}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer text-left"
              onClick={setting.onClick}
            >
              <div className="text-muted-foreground">{setting.icon}</div>
              <p className="flex-1 text-sm">{setting.label}</p>
              {setting.action && (
                <p className="text-sm text-muted-foreground">{setting.action}</p>
              )}
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Privacy Settings */}
        <div className="border-b border-border">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy</p>
          </div>
          {privacySettings.map((setting) => (
            <button
              key={setting.id}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer text-left"
              onClick={setting.onClick}
            >
              <div className="text-muted-foreground">{setting.icon}</div>
              <p className="flex-1 text-sm">{setting.label}</p>
              {setting.action && (
                <p className="text-sm text-muted-foreground">{setting.action}</p>
              )}
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Preferences Settings */}
        <div className="border-b border-border">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</p>
          </div>
          {preferencesSettings.map((setting) => (
            <button
              key={setting.id}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer text-left"
              onClick={setting.onClick}
            >
              <div className="text-muted-foreground">{setting.icon}</div>
              <div className="flex-1">
                <p className="text-sm">{setting.label}</p>
                {setting.description && (
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                )}
              </div>
              {setting.action && !setting.onClick && (
                <p className="text-sm text-muted-foreground">{setting.action}</p>
              )}
              {setting.onClick && (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {setting.id === "dark-mode" && (
                <div 
                  className={cn("ig-toggle", darkMode ? "ig-toggle-active" : "ig-toggle-inactive")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDarkMode(!darkMode);
                  }}
                >
                  <div className="ig-toggle-thumb" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* More Settings */}
        <div className="border-b border-border">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</p>
          </div>
          {moreSettings.map((setting) => (
            <button
              key={setting.id}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer text-left"
              onClick={setting.onClick}
            >
              <div className="text-muted-foreground">{setting.icon}</div>
              <div className="flex-1">
                <p className="text-sm">{setting.label}</p>
                {setting.description && (
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full text-primary hover:bg-secondary"
            onClick={() => router.push("/login")}
          >
            Log Out
          </Button>
        </div>

        {/* Version */}
        <div className="pb-8 text-center">
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

import { cn } from "@/lib/utils";
