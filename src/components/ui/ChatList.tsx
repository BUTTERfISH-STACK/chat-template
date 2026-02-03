"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

export type ChatStatus = "online" | "offline" | "away" | "busy"

interface ChatItem {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
  status?: ChatStatus
  isMuted?: boolean
  isPinned?: boolean
  isGroup?: boolean
  groupIcon?: string
  groupMembers?: number
  isBusiness?: boolean
  hasMedia?: boolean
  mediaType?: "image" | "video" | "audio" | "document"
  mediaCount?: number
  lastMediaThumbnail?: string
}

interface ChatListProps {
  chats: ChatItem[]
  onChatSelect: (chatId: string) => void
  selectedId?: string
  searchQuery?: string
}

export function ChatList({ chats, onChatSelect, selectedId, searchQuery }: ChatListProps) {
  const filteredChats = searchQuery
    ? chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats

  const pinnedChats = filteredChats.filter(chat => chat.isPinned)
  const regularChats = filteredChats.filter(chat => !chat.isPinned)

  return (
    <ul className="space-y-1">
      {/* Pinned chats section */}
      {pinnedChats.length > 0 && (
        <>
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Pinned
            </span>
          </div>
          {pinnedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedId === chat.id}
              onClick={() => onChatSelect(chat.id)}
            />
          ))}
          <div className="divider" />
        </>
      )}

      {/* Regular chats */}
      {regularChats.length > 0 ? (
        regularChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isSelected={selectedId === chat.id}
            onClick={() => onChatSelect(chat.id)}
          />
        ))
      ) : (
        <div className="empty-state py-12">
          <div className="empty-state-icon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="empty-state-title">No conversations yet</p>
          <p className="empty-state-description">
            {searchQuery
              ? "No chats found for your search"
              : "Start a new conversation to see it here"}
          </p>
        </div>
      )}
    </ul>
  )
}

interface ChatListItemProps {
  chat: ChatItem
  isSelected?: boolean
  onClick?: () => void
}

function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const getMediaIcon = () => {
    switch (chat.mediaType) {
      case "image":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case "video":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case "audio":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case "document":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <li
      className={cn(
        "chat-list-item",
        isSelected && "active"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-12 h-12">
          {chat.avatar ? (
            <AvatarImage src={chat.avatar} alt={chat.name} />
          ) : chat.isGroup ? (
            <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : (
            <AvatarFallback className="bg-[var(--secondary)] text-[var(--primary)] text-lg font-semibold">
              {chat.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Online status indicator */}
        {chat.status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[var(--card)]",
              chat.status === "online" && "bg-[var(--status-online)]",
              chat.status === "away" && "bg-[var(--status-away)]",
              chat.status === "busy" && "bg-[var(--status-busy)]",
              chat.status === "offline" && "bg-[var(--status-offline)]"
            )}
          />
        )}

        {/* Pin indicator */}
        {chat.isPinned && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[var(--card)]">
            <svg className="w-2.5 h-2.5 text-[var(--primary-foreground)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <span className="chat-list-name truncate">{chat.name}</span>
            {chat.isBusiness && (
              <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {chat.isMuted ? (
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : null}
            <span className="chat-list-timestamp">{formatTime(chat.lastMessageTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {/* Media indicator or mute icon */}
            {chat.hasMedia ? (
              <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                {getMediaIcon()}
                {chat.mediaCount && chat.mediaCount > 1 && (
                  <span className="text-xs">{chat.mediaCount}</span>
                )}
              </span>
            ) : null}
            <p className={cn(
              "chat-list-message",
              chat.unreadCount && "font-medium text-[var(--foreground)]"
            )}>
              {chat.lastMessage}
            </p>
          </div>
          
          {/* Unread badge */}
          {chat.unreadCount && chat.unreadCount > 0 ? (
            <span className="chat-list-badge">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}

interface ChatListHeaderProps {
  title: string
  onSearchClick?: () => void
  onMenuClick?: () => void
}

export function ChatListHeader({ title, onSearchClick, onMenuClick }: ChatListHeaderProps) {
  return (
    <header className="chat-header flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>
        <div className="flex-1" />
        <button
          onClick={onSearchClick}
          className="action-button p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          onClick={onMenuClick}
          className="action-button p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </header>
  )
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClose?: () => void
  placeholder?: string
}

export function SearchBar({ value, onChange, onClose, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-bar-input"
          autoFocus
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
