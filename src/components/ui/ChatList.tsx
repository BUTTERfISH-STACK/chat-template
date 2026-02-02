import { cn } from "@/lib/utils"
import { Avatar, AvatarBadge } from "./avatar"
import { Badge } from "./badge"

interface ChatItem {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  status?: "online" | "offline" | "away"
}

interface ChatListProps {
  chats: ChatItem[]
  onChatSelect: (chatId: string) => void
}

export function ChatList({ chats, onChatSelect }: ChatListProps) {
  return (
    <ul className="space-y-1">
      {chats.map((chat) => (
        <li
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className="chat-list-item"
        >
          <Avatar className="w-10 h-10 shrink-0 border border-primary/20">
            <div className="w-full h-full bg-secondary flex items-center justify-center text-primary font-semibold">
              {chat.name.charAt(0).toUpperCase()}
            </div>
            {chat.status === "online" && (
              <AvatarBadge>
                <Badge variant="default" className="w-2.5 h-2.5 bg-primary border-0" />
              </AvatarBadge>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0 ml-3">
            <div className="flex items-center justify-between">
              <span className="chat-list-name text-foreground">{chat.name}</span>
              <span className="chat-list-timestamp">{chat.timestamp}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="chat-list-message">{chat.lastMessage}</p>
              {chat.unreadCount && chat.unreadCount > 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground ml-2">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
