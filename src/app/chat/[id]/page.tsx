"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types
interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "document";
  mediaUrl?: string;
}

interface Conversation {
  id: string;
  phoneNumber: string;
  name?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  messages: Message[];
}

// Mock conversation data
const mockConversations: Record<string, Conversation> = {
  "1": {
    id: "1",
    phoneNumber: "+1234567890",
    name: "Alice Smith",
    avatar: "/api/placeholder/64/64",
    isOnline: true,
    lastSeen: "Online now",
    messages: [
      { id: "1", content: "Hi there! 👋", timestamp: "10:00 AM", isOwn: false, status: "read", type: "text" },
      { id: "2", content: "Hello! How are you?", timestamp: "10:02 AM", isOwn: true, status: "read", type: "text" },
      { id: "3", content: "I'm doing great, thanks for asking!", timestamp: "10:05 AM", isOwn: false, status: "read", type: "text" },
      { id: "4", content: "Are you free to chat later?", timestamp: "10:10 AM", isOwn: false, status: "read", type: "text" },
      { id: "5", content: "Yes, definitely! What time works for you?", timestamp: "10:15 AM", isOwn: true, status: "read", type: "text" },
      { id: "6", content: "How about 3 PM?", timestamp: "10:20 AM", isOwn: false, status: "read", type: "text" },
      { id: "7", content: "Perfect! See you then! 🎉", timestamp: "10:25 AM", isOwn: true, status: "read", type: "text" },
    ],
  },
  "2": {
    id: "2",
    phoneNumber: "+1987654321",
    name: "Bob Johnson",
    avatar: "/api/placeholder/64/64",
    isOnline: false,
    lastSeen: "Last seen today at 9:45 AM",
    messages: [
      { id: "1", content: "Are we still meeting tomorrow?", timestamp: "9:30 AM", isOwn: true, status: "read", type: "text" },
      { id: "2", content: "Yes, definitely! What time works for you?", timestamp: "9:35 AM", isOwn: false, status: "read", type: "text" },
      { id: "3", content: "How about 2 PM?", timestamp: "9:40 AM", isOwn: true, status: "read", type: "text" },
      { id: "4", content: "Perfect! See you then!", timestamp: "9:42 AM", isOwn: false, status: "read", type: "text" },
      { id: "5", content: "See you tomorrow! 👋", timestamp: "9:45 AM", isOwn: false, status: "read", type: "text" },
    ],
  },
};

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = params?.id as string;
  const conversation = mockConversations[conversationId] || mockConversations["1"];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages
  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      status: "sent",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    // Simulate read receipt
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 2000);

    // Simulate reply
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thanks for your message! I'll get back to you soon.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: false,
          status: "read",
          type: "text",
        };
        setMessages((prev) => [...prev, replyMessage]);
      }, 1500);
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center px-4">
        <button onClick={() => router.back()} className="mr-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.avatar} alt={conversation.name || conversation.phoneNumber} />
              <AvatarFallback>
                {(conversation.name || conversation.phoneNumber).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <p className="font-semibold">{conversation.name || conversation.phoneNumber}</p>
            <p className="text-xs text-muted-foreground">
              {conversation.isOnline ? "Online" : conversation.lastSeen}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Chat Background */}
      <div className="fixed inset-0 -z-10 pt-16 bg-background">
        <div className="absolute inset-0 opacity-5" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '30px 30px'
             }} 
        />
      </div>

      {/* Messages */}
      <main className="flex-1 pt-16 pb-20 px-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-2">
          {messages.map((msg, index) => {
            const showDate = index === 0 || 
              new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
            
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 relative animate-fade-in",
                    msg.isOwn
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.type === "text" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Media</span>
                    </div>
                  )}
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    msg.isOwn ? "justify-end" : "justify-start"
                  )}>
                    <span className={cn(
                      "text-[10px]",
                      msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.isOwn && (
                      <div className="flex items-center gap-0.5">
                        {msg.status === "sent" && (
                          <svg className="w-3 h-3 text-primary-foreground/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                        {msg.status === "delivered" && (
                          <>
                            <svg className="w-3 h-3 text-primary-foreground/70" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            <svg className="w-3 h-3 text-primary-foreground/70" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </>
                        )}
                        {msg.status === "read" && (
                          <>
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 bg-secondary rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {message.trim() ? (
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" onClick={sendMessage}>
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
