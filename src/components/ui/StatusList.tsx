"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"

interface StatusItem {
  id: string
  name: string
  avatar?: string
  timestamp: string
  isViewed?: boolean
  hasMedia?: boolean
  mediaUrl?: string
}

interface StatusListProps {
  statuses: StatusItem[]
  onStatusClick?: (statusId: string) => void
  onAddStatus?: () => void
}

export function StatusList({ statuses, onStatusClick, onAddStatus }: StatusListProps) {
  return (
    <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
      {/* My Status */}
      <div className="flex flex-col items-center gap-1 min-w-[4rem]">
        <button
          onClick={onAddStatus}
          className="status-circle w-16 h-16 relative group"
        >
          <div className="status-circle-inner w-full h-full flex items-center justify-center bg-[var(--card)]">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] text-xl font-semibold">
                +
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center border-2 border-[var(--card)]">
            <svg className="w-3 h-3 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </button>
        <span className="text-xs text-[var(--muted-foreground)]">My Status</span>
      </div>

      {/* Other Statuses */}
      {statuses.map((status) => (
        <div key={status.id} className="flex flex-col items-center gap-1 min-w-[4rem]">
          <button
            onClick={() => onStatusClick?.(status.id)}
            className={cn(
              "status-circle w-16 h-16 relative",
              status.isViewed && "status-circle-viewed"
            )}
          >
            <div className={cn(
              "status-circle-inner w-full h-full flex items-center justify-center bg-[var(--card)]",
              !status.isViewed && "ring-2 ring-[var(--primary)]"
            )}>
              {status.mediaUrl ? (
                <img
                  src={status.mediaUrl}
                  alt={status.name}
                  className="status-circle-image w-full h-full"
                />
              ) : (
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] text-xl font-semibold">
                    {status.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
            {!status.isViewed && (
              <div className="absolute inset-0 rounded-full ring-2 ring-[var(--primary)] opacity-50" />
            )}
          </button>
          <span className="text-xs text-[var(--muted-foreground)] max-w-[4rem] truncate">
            {status.name}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {status.timestamp}
          </span>
        </div>
      ))}
    </div>
  )
}

interface StatusViewerProps {
  status: StatusItem
  onClose?: () => void
  onNext?: () => void
  onPrevious?: () => void
  progress?: number
}

export function StatusViewer({
  status,
  onClose,
  onNext,
  onPrevious,
  progress = 100
}: StatusViewerProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="flex gap-1 p-2">
        <div className="flex-1 h-1 bg-[var(--muted-foreground)] rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2">
        <button onClick={onClose} className="back-button">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Avatar className="w-10 h-10">
          <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] font-semibold">
            {status.name.charAt(0).toUpperCase()}
          </div>
        </Avatar>
        <div>
          <p className="font-medium text-white">{status.name}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{status.timestamp}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {status.mediaUrl ? (
          <img
            src={status.mediaUrl}
            alt={status.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center p-8">
            <p className="text-center text-white">{status.name}'s status</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="absolute inset-y-0 left-0 w-1/3" onClick={onPrevious} />
      <div className="absolute inset-y-0 right-0 w-1/3" onClick={onNext} />
    </div>
  )
}
