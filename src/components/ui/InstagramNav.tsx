"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const defaultNavItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.1l-10 9V22h6v-7h8v7h6V11.1l-10-9z" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Messages",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Create",
    icon: (
      <div className="ig-create-button">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

interface InstagramNavProps {
  items?: NavItem[];
  className?: string;
}

export function InstagramNav({ items = defaultNavItems, className }: InstagramNavProps) {
  const pathname = usePathname();
  const [isProfileActive, setIsProfileActive] = useState(false);

  // Check if the profile item should show active state (for nested profile routes)
  const isProfileRoute = pathname.startsWith("/profile") || pathname.startsWith("/settings");

  return (
    <>
      {/* Desktop/Tablet Header */}
      <header className={cn(
        "hidden md:flex fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 items-center justify-between px-4 lg:px-8",
        className
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <svg className="h-8 w-auto" viewBox="0 0 200 50" fill="none">
            <text x="0" y="38" fontFamily="inherit" fontSize="28" fontWeight="bold" fill="currentColor">
              Vellon X
            </text>
          </svg>
        </Link>

        {/* Search Bar */}
        <div className="ig-search-bar hidden lg:flex w-64">
          <svg className="ig-search-bar-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="ig-search-bar-input"
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "ig-nav-item",
                (item.href === "/profile" && isProfileRoute) || pathname === item.href
                  ? "ig-nav-item-active"
                  : "ig-nav-item-inactive"
              )}
            >
              {item.href === "/profile" && (item.href === "/profile" && isProfileRoute) ? (
                <div className="relative">
                  <Avatar className="ig-avatar-small">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="text-xs">P</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </div>
              ) : (
                item.icon
              )}
            </Link>
          ))}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50 flex items-center justify-around px-2 md:hidden",
        className
      )}>
        {items.map((item, index) => {
          const isActive = (item.href === "/profile" && isProfileRoute) || pathname === item.href;
          
          // Center create button
          if (index === 2) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center -mt-4"
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "ig-nav-item",
                isActive ? "ig-nav-item-active" : "ig-nav-item-inactive"
              )}
            >
              {item.href === "/profile" && isActive ? (
                <div className="relative">
                  <Avatar className="ig-avatar-small">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="text-xs">P</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </div>
              ) : (
                item.icon
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function InstagramNavBar({ className }: { className?: string }) {
  return <InstagramNav className={className} />;
}
