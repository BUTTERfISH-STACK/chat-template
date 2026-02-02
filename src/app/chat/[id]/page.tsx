"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Message } from "@/components/ui/Message";
import { ChatInput } from "@/components/ui/ChatInput";

interface MessageType {
  id: string;
  chatId: string;
  author: string;
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  status: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversation data
  const mockConversation: Conversation = {
    id: conversationId,
    name: "John Doe",
    status: "online",
  };

  // Mock messages
  const mockMessages: MessageType[] = [
    {
      id: "1",
      chatId: conversationId,
      author: "John Doe",
      content: "Hey, how are you doing?",
      timestamp: "12:34 PM",
      isOwnMessage: false,
      status: "read",
    },
    {
      id: "2",
      chatId: conversationId,
      author: "You",
      content: "I'm doing great, thanks for asking! How about you?",
      timestamp: "12:35 PM",
      isOwnMessage: true,
      status: "read",
    },
    {
      id: "3",
      chatId: conversationId,
      author: "John Doe",
      content: "Pretty good! Just working on some projects.",
      timestamp: "12:36 PM",
      isOwnMessage: false,
      status: "read",
    },
    {
      id: "4",
      chatId: conversationId,
      author: "John Doe",
      content: "By the way, did you see the new marketplace features?",
      timestamp: "12:36 PM",
      isOwnMessage: false,
      status: "read",
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setConversation(mockConversation);
      setMessages(mockMessages);
      setIsLoading(false);
    }, 500);
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsSending(true);

    // Simulate sending message
    setTimeout(() => {
      const newMessage: MessageType = {
        id: Date.now().toString(),
        chatId: conversationId,
        author: "You",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwnMessage: true,
        status: "sent",
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");
      setIsSending(false);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="chat-header flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                <div className="h-3 w-16 bg-secondary/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="chat-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-semibold">
                {conversation?.name.charAt(0).toUpperCase()}
              </div>
              {conversation?.status === "online" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{conversation?.name}</h1>
              <p className="text-xs text-muted-foreground">
                {conversation?.status === "online" ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        
        {messages.map((message) => (
          <Message
            key={message.id}
            id={message.id}
            author={message.author}
            content={message.content}
            timestamp={message.timestamp}
            isOwnMessage={message.isOwnMessage}
            status={message.status}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <ChatInput
        value={inputValue}
        placeholder="Type a message..."
        onSend={handleSendMessage}
        onValueChange={setInputValue}
      />
    </div>
  );
}
