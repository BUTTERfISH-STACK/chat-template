import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"

interface ChatInputProps {
  value: string
  placeholder: string
  onSend: (message: string) => void
  onValueChange: (value: string) => void
}

export function ChatInput({ value, placeholder, onSend, onValueChange }: ChatInputProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border-t border-border">
      <div className="flex gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex-1 input-premium"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (value.trim()) {
              onSend(value.trim())
            }
          }
        }}
      />
      
      <Button
        disabled={!value.trim()}
        onClick={() => {
          if (value.trim()) {
            onSend(value.trim())
          }
        }}
        className={cn(
          "h-10 w-10 p-0",
          value.trim() ? "btn-gold" : "bg-secondary text-muted-foreground"
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </Button>
    </div>
  )
}
