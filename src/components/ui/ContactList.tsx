"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

export type ContactStatus = "online" | "offline" | "away" | "busy"

interface Contact {
  id: string
  name: string
  phone?: string
  avatar?: string
  status?: ContactStatus
  statusText?: string
  lastSeen?: string
  isVerified?: boolean
  isBusiness?: boolean
}

interface ContactListProps {
  contacts: Contact[]
  onContactClick?: (contactId: string) => void
  selectedId?: string
  showStatus?: boolean
  showPhone?: boolean
}

export function ContactList({
  contacts,
  onContactClick,
  selectedId,
  showStatus = true,
  showPhone = false
}: ContactListProps) {
  return (
    <ul className="space-y-1">
      {contacts.map((contact) => (
        <li
          key={contact.id}
          onClick={() => onContactClick?.(contact.id)}
          className={cn(
            "chat-list-item",
            selectedId === contact.id && "active"
          )}
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              {contact.avatar ? (
                <AvatarImage src={contact.avatar} alt={contact.name} />
              ) : (
                <AvatarFallback className="bg-[var(--secondary)] text-[var(--primary)] text-lg font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            {/* Online Status Indicator */}
            {showStatus && contact.status && (
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[var(--card)]",
                  contact.status === "online" && "bg-[var(--status-online)]",
                  contact.status === "away" && "bg-[var(--status-away)]",
                  contact.status === "busy" && "bg-[var(--status-busy)]",
                  contact.status === "offline" && "bg-[var(--status-offline)]"
                )}
              />
            )}
            
            {/* Business Badge */}
            {contact.isBusiness && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[var(--card)]">
                <svg className="w-2.5 h-2.5 text-[var(--primary-foreground)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 ml-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <span className="chat-list-name truncate">{contact.name}</span>
                {contact.isVerified && (
                  <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {showPhone && contact.phone ? (
                <p className="chat-list-message">{contact.phone}</p>
              ) : contact.statusText ? (
                <p className="chat-list-message">{contact.statusText}</p>
              ) : contact.lastSeen ? (
                <p className="chat-list-message">{contact.lastSeen}</p>
              ) : (
                <p className="chat-list-message">Tap to chat</p>
              )}
              
              {/* Status Text */}
              {showStatus && contact.status && (
                <span
                  className={cn(
                    "text-xs",
                    contact.status === "online" && "text-[var(--status-online)]",
                    contact.status === "away" && "text-[var(--status-away)]",
                    contact.status === "busy" && "text-[var(--status-busy)]",
                    contact.status === "offline" && "text-[var(--muted-foreground)]"
                  )}
                >
                  {contact.status === "online" ? "Online" : contact.statusText || contact.lastSeen}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

interface ContactGroupProps {
  letter: string
  contacts: Contact[]
  onContactClick?: (contactId: string) => void
  selectedId?: string
}

export function ContactGroup({ letter, contacts, onContactClick, selectedId }: ContactGroupProps) {
  return (
    <div className="mb-4">
      <div className="px-4 py-1 bg-[var(--secondary)] text-xs font-semibold text-[var(--muted-foreground)]">
        {letter}
      </div>
      <ContactList
        contacts={contacts}
        onContactClick={onContactClick}
        selectedId={selectedId}
      />
    </div>
  )
}

interface AlphabetIndexProps {
  letters: string[]
  onLetterClick?: (letter: string) => void
}

export function AlphabetIndex({ letters, onLetterClick }: AlphabetIndexProps) {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 p-2 hidden lg:flex flex-col gap-0.5">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick?.(letter)}
          className="w-6 h-6 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--secondary)] rounded transition-colors"
        >
          {letter}
        </button>
      ))}
    </div>
  )
}
