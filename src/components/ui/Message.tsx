import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { Badge } from "./badge"

interface MessageProps {
  id: string
  author: string
  content: string
  timestamp: string
  isOwnMessage?: boolean
  isRead?: boolean
  status?: "sent" | "delivered" | "read"
}

export function Message({ id, author, content, timestamp, isOwnMessage = false, isRead = false, status = "sent" }: MessageProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-3",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 shrink-0 border border-primary/20">
          <div className="w-full h-full bg-secondary flex items-center justify-center text-primary text-sm font-semibold">
            {author.charAt(0).toUpperCase()}
          </div>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0 max-w-[70%]">
        <div
          className={cn(
            "flex items-center space-x-2 rounded-2xl p-3",
            isOwnMessage
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-secondary text-foreground"
          )}
        >
          <div className="flex-1 min-w-0">
            {!isOwnMessage && (
              <p className="text-xs font-medium text-primary mb-1">{author}</p>
            )}
            <p className="text-sm">{content}</p>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <time className="text-xs opacity-70">{timestamp}</time>
            {isOwnMessage && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  status === "read" ? "bg-primary/20 text-primary-foreground" : "opacity-70"
                )}
              >
                {status === "read" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {status === "delivered" && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status === "sent" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
