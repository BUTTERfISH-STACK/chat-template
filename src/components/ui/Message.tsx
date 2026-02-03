"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"

interface MessageProps {
  id: string
  content: string
  timestamp: string
  isOwnMessage?: boolean
  status?: MessageStatus
  author?: string
  authorAvatar?: string
  isGroup?: boolean
  showAuthor?: boolean
  reactions?: Reaction[]
  isReply?: boolean
  replyTo?: {
    id: string
    content: string
    author: string
  }
  media?: {
    type: "image" | "video" | "audio" | "document"
    url: string
    thumbnail?: string
    name?: string
    size?: string
    duration?: string
  }
  onReplyClick?: () => void
  onReactionClick?: (emoji: string) => void
  onMessageClick?: () => void
}

interface Reaction {
  emoji: string
  count: number
  users?: string[]
  isByUser?: boolean
}

export function Message({
  id,
  content,
  timestamp,
  isOwnMessage = false,
  status = "sent",
  author,
  authorAvatar,
  isGroup = false,
  showAuthor = !isOwnMessage,
  reactions = [],
  isReply = false,
  replyTo,
  media,
  onReplyClick,
  onReactionClick,
  onMessageClick
}: MessageProps) {
  const formatTime = (time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderStatusIcon = () => {
    if (status === "sending") {
      return (
        <svg className="w-4 h-4 text-[var(--muted-foreground)] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )
    }

    if (status === "failed") {
      return (
        <svg className="w-4 h-4 text-[var(--destructive)]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }

    if (status === "sent") {
      return (
        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      )
    }

    if (status === "delivered") {
      return (
        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.259 4.377A5.003 5.003 0 0014.12 3H6a5.003 5.003 0 00-4.863 6.377 6 6 0 011.146.216v2.999a1 1 0 001.553.894l3.236-1.618a1 1 0 001.342 0l3.236 1.618a1 1 0 00.553-.894v-2.999a6.003 6.003 0 01-2.303-1.366l-.001-.612z" />
        </svg>
      )
    }

    // Read status
    return (
      <div className="read-receipt-double">
        <svg className="read-check" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <svg className="read-check read-check-read -ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-4 py-1",
        isOwnMessage && "flex-row-reverse",
        onMessageClick && "cursor-pointer"
      )}
      onClick={onMessageClick}
    >
      {/* Avatar for group messages */}
      {isGroup && !isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          {authorAvatar ? (
            <AvatarImage src={authorAvatar} alt={author} />
          ) : (
            <AvatarFallback className="bg-[var(--secondary)] text-[var(--primary)] text-sm">
              {author?.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[70%] min-w-[120px]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Author name for group */}
        {isGroup && showAuthor && author && (
          <span className="text-xs font-medium text-[var(--primary)] mb-1 ml-1">
            {author}
          </span>
        )}

        {/* Reply indicator */}
        {isReply && replyTo && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReplyClick?.()
            }}
            className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] transition-colors"
          >
            <div className="w-1 h-4 bg-[var(--primary)] rounded-full" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--primary)] truncate">
                {replyTo.author}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                {replyTo.content}
              </p>
            </div>
          </button>
        )}

        {/* Media content */}
        {media && (
          <div
            className={cn(
              "overflow-hidden rounded-xl mb-1",
              isOwnMessage ? "bg-[var(--primary)]/20" : "bg-[var(--secondary)]"
            )}
          >
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name || "Image"}
                className="max-w-[250px] rounded-xl"
              />
            ) : media.type === "video" ? (
              <div className="relative">
                {media.thumbnail && (
                  <img
                    src={media.thumbnail}
                    alt={media.name || "Video"}
                    className="max-w-[250px] rounded-xl"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                {media.duration && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                    {media.duration}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 min-w-[200px]">
                <div className="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{media.name}</p>
                  {media.size && (
                    <p className="text-xs text-[var(--muted-foreground)]">{media.size}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {content && (
          <div
            className={cn(
              "px-4 py-2 rounded-2xl",
              isOwnMessage
                ? "message-bubble-own"
                : isGroup
                  ? "message-bubble-group"
                  : "message-bubble-other"
            )}
          >
            <p className="message-text">{content}</p>
          </div>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  onReactionClick?.(reaction.emoji)
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
                  reaction.isByUser
                    ? "bg-[var(--primary)]/20 border border-[var(--primary)]"
                    : "bg-[var(--secondary)] hover:bg-[var(--accent)]"
                )}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className={cn(
                    "font-medium",
                    reaction.isByUser ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                  )}>
                    {reaction.count}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--accent)] transition-colors"
            >
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-0.5 px-1",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="message-timestamp">{formatTime(timestamp)}</span>
          {isOwnMessage && renderStatusIcon()}
        </div>
      </div>
    </div>
  )
}

interface DateSeparatorProps {
  date: string
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-[var(--border)]" />
      <span className="text-xs text-[var(--muted-foreground)] font-medium">
        {formatDate(date)}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  )
}

interface MessageSkeletonProps {
  count?: number
}

export function MessageSkeleton({ count = 1 }: MessageSkeletonProps) {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
      <div className="space-y-2">
        <div className="h-8 skeleton rounded-2xl w-48" />
        <div className="h-4 skeleton rounded w-24" />
      </div>
    </div>
  )
}
