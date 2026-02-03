"use client"

import { cn } from "@/lib/utils"
import { useState, useRef, useCallback } from "react"

interface ChatInputProps {
  value: string
  placeholder?: string
  onSend: (message: string, type?: "text" | "image" | "audio") => void
  onValueChange: (value: string) => void
  onAttach?: () => void
  onImageClick?: () => void
  onAudioClick?: () => void
  disabled?: false
  isRecording?: boolean
  recordingDuration?: number
}

export function ChatInput({
  value,
  placeholder = "Type a message...",
  onSend,
  onValueChange,
  onAttach,
  onImageClick,
  onAudioClick,
  disabled = false,
  isRecording = false,
  recordingDuration = 0
}: ChatInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSend(value.trim())
      }
    }
  }

  const handleSend = useCallback(() => {
    if (value.trim()) {
      onSend(value.trim())
    }
  }, [value, onSend])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="chat-input-container">
      {/* Attachment Button */}
      <button
        onClick={onAttach}
        className="action-button p-2"
        disabled={disabled || isRecording}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      {/* Image Button */}
      <button
        onClick={onImageClick}
        className="action-button p-2"
        disabled={disabled || isRecording}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Audio Button */}
      <button
        onClick={onAudioClick}
        className={cn(
          "action-button p-2",
          isRecording && "bg-[var(--destructive)] text-white animate-pulse"
        )}
        disabled={disabled}
      >
        {isRecording ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Text Input */}
      <div className="flex-1 relative">
        {isRecording ? (
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-[var(--destructive)] flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse" />
              Recording...
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              {formatDuration(recordingDuration)}
            </span>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="chat-input-field resize-none"
            style={{
              height: "auto",
              minHeight: "40px",
              maxHeight: "120px"
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = Math.min(target.scrollHeight, 120) + "px"
            }}
          />
        )}
      </div>

      {/* Send / Record Button */}
      {isRecording ? (
        <button
          className="action-button action-button-primary p-2"
          onClick={() => onSend("", "audio")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      ) : (
        <button
          disabled={!value.trim() || disabled}
          onClick={handleSend}
          className={cn(
            "action-button action-button-primary p-2",
            (!value.trim() || disabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface TypingIndicatorProps {
  names: string[]
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null

  const text = names.length === 1
    ? `${names[0]} is typing...`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing...`
      : "Several people are typing..."

  return (
    <div className="typing-indicator items-center">
      <div className="flex gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-xs text-[var(--muted-foreground)] ml-2">
        {text}
      </span>
    </div>
  )
}

interface MessageInputProps {
  onSend: (message: string) => void
  placeholder?: string
}

export function MessageInput({ onSend, placeholder }: MessageInputProps) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (value.trim()) {
      onSend(value.trim())
      setValue("")
    }
  }

  return (
    <ChatInput
      value={value}
      onSend={handleSend}
      onValueChange={setValue}
      placeholder={placeholder}
    />
  )
}
