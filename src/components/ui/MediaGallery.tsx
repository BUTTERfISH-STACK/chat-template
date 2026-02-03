"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

export type MediaItem = {
  id: string
  type: "image" | "video" | "document" | "audio"
  url: string
  thumbnail?: string
  name?: string
  size?: string
  duration?: string
  timestamp: string
  sender?: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  onMediaClick?: (media: MediaItem) => void
  maxItems?: number
  columns?: 3 | 4
}

export function MediaGallery({
  media,
  onMediaClick,
  maxItems = 9,
  columns = 3
}: MediaGalleryProps) {
  const [showAll, setShowAll] = useState(false)
  const displayMedia = showAll ? media : media.slice(0, maxItems)
  const remainingCount = media.length - maxItems

  const gridClass = columns === 3 ? "grid-cols-3" : "grid-cols-4"

  if (media.length === 0) {
    return (
      <div className="empty-state py-8">
        <div className="empty-state-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="empty-state-title">No media shared</p>
        <p className="empty-state-description">Photos, videos, and documents shared in this chat will appear here</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Media</h3>
        <button className="text-sm text-[var(--primary)] hover:underline">
          View All
        </button>
      </div>
      
      <div className={cn("media-gallery", gridClass)}>
        {displayMedia.map((item, index) => (
          <MediaItemComponent
            key={item.id}
            media={item}
            onClick={() => onMediaClick?.(item)}
            isLast={index === displayMedia.length - 1}
            showMore={remainingCount > 0 && !showAll && index === displayMedia.length - 1}
            moreCount={remainingCount}
            onShowMore={() => setShowAll(true)}
          />
        ))}
      </div>
    </div>
  )
}

interface MediaItemComponentProps {
  media: MediaItem
  onClick?: () => void
  isLast?: boolean
  showMore?: boolean
  moreCount?: number
  onShowMore?: () => void
}

function MediaItemComponent({
  media,
  onClick,
  showMore,
  moreCount,
  onShowMore
}: MediaItemComponentProps) {
  if (showMore) {
    return (
      <div
        className="media-item-more"
        onClick={onShowMore}
      >
        <span className="text-lg">+{moreCount}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className="media-item relative group"
    >
      {media.type === "video" ? (
        <div className="relative w-full h-full">
          {media.thumbnail ? (
            <img
              src={media.thumbnail}
              alt={media.name || "Video"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Video Duration */}
          {media.duration && (
            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-xs text-white">
              {media.duration}
            </div>
          )}
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      ) : media.type === "image" ? (
        <img
          src={media.url}
          alt={media.name || "Image"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : media.type === "audio" ? (
        <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      ) : (
        <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center p-2">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-[var(--muted-foreground)] truncate block max-w-full">
              {media.name || "Document"}
            </span>
          </div>
        </div>
      )}
    </button>
  )
}

interface MediaViewerProps {
  media: MediaItem
  onClose?: () => void
  onNext?: () => void
  onPrevious?: () => void
  showControls?: boolean
}

export function MediaViewer({
  media,
  onClose,
  onNext,
  onPrevious,
  showControls = true
}: MediaViewerProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Navigation */}
        {showControls && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 text-white hover:bg-white/10 rounded-full p-3 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 text-white hover:bg-white/10 rounded-full p-3 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Media */}
        <div className="max-w-full max-h-full p-4">
          {media.type === "image" ? (
            <img
              src={media.url}
              alt={media.name || "Media"}
              className="max-w-full max-h-full object-contain"
            />
          ) : media.type === "video" ? (
            <video
              src={media.url}
              controls
              className="max-w-full max-h-full"
              autoPlay
            />
          ) : (
            <div className="text-white text-center">
              <p>{media.name || "Document"}</p>
              <a
                href={media.url}
                download
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info Bar */}
      {media.name && (
        <div className="px-4 py-3 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-white text-sm">{media.name}</p>
          {media.size && (
            <p className="text-white/60 text-xs mt-1">{media.size}</p>
          )}
        </div>
      )}
    </div>
  )
}

interface DocumentListProps {
  documents: MediaItem[]
  onDocumentClick?: (doc: MediaItem) => void
}

export function DocumentList({ documents, onDocumentClick }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="empty-state py-8">
        <div className="empty-state-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="empty-state-title">No documents shared</p>
        <p className="empty-state-description">PDFs, files, and documents shared in this chat will appear here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onDocumentClick?.(doc)}
          className="w-full flex items-center gap-3 p-3 hover:bg-[var(--secondary)] transition-colors"
        >
          <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium text-[var(--foreground)] truncate">{doc.name}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              {doc.size && <span>{doc.size}</span>}
              <span>•</span>
              <span>{doc.timestamp}</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      ))}
    </div>
  )
}
