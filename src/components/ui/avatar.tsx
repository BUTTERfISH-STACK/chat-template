"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "xs" | "sm" | "default" | "lg" | "xl"
}) {
  const sizeClasses = {
    xs: "size-6",
    sm: "size-8",
    default: "size-10",
    lg: "size-14",
    xl: "size-20"
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-[var(--secondary)] text-[var(--primary)] flex size-full items-center justify-center rounded-full text-sm font-medium group-data-[size=xs]/avatar:text-xs group-data-[size=sm]/avatar:text-sm group-data-[size=lg]/avatar:text-lg group-data-[size=xl]/avatar:text-2xl",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-[var(--primary)] text-[var(--primary-foreground)] ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
        "group-data-[size=xs]/avatar:size-2 group-data-[size=xs]/avatar:[&>svg]:hidden",
        "group-data-[size=sm]/avatar:size-2.5 group-data-[size=sm]/avatar:[&>svg]:size-2",
        "group-data-[size=default]/avatar:size-3 group-data-[size=default]/avatar:[&>svg]:size-2.5",
        "group-data-[size=lg]/avatar:size-4 group-data-[size=lg]/avatar:[&>svg]:size-3",
        "group-data-[size=xl]/avatar:size-5 group-data-[size=xl]/avatar:[&>svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-[var(--muted)] text-[var(--muted-foreground)] ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

// Premium Avatar with status ring
function AvatarWithStatus({
  className,
  status,
  statusSize = "sm",
  showRing = true,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  status?: "online" | "away" | "busy" | "offline"
  statusSize?: "sm" | "md" | "lg"
  showRing?: boolean
}) {
  const statusColors = {
    online: "bg-[var(--status-online)]",
    away: "bg-[var(--status-away)]",
    busy: "bg-[var(--status-busy)]",
    offline: "bg-[var(--status-offline)]"
  }

  const statusSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  }

  const statusRingSizes = {
    sm: "-inset-1",
    md: "-inset-1.5",
    lg: "-inset-2"
  }

  return (
    <div className="relative inline-block">
      <Avatar
        className={cn(
          showRing && status && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]",
          className
        )}
        {...props}
      />
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--card)]",
            statusColors[status],
            statusSizes[statusSize]
          )}
        />
      )}
      {status === "online" && showRing && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping bg-[var(--status-online)] opacity-75",
            statusRingSizes[statusSize]
          )}
        />
      )}
    </div>
  )
}

// Premium Avatar with gradient border
function AvatarPremium({
  className,
  gradientColor = "gold",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  gradientColor?: "gold" | "rose" | "blue"
}) {
  const gradients = {
    gold: "linear-gradient(135deg, var(--color-gold-500), var(--color-gold-600))",
    rose: "linear-gradient(135deg, #f43f5e, #e11d48)",
    blue: "linear-gradient(135deg, #3b82f6, #2563eb)"
  }

  return (
    <div className={cn("relative p-0.5 rounded-full", className)}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: gradients[gradientColor] }}
      />
      <Avatar className="bg-[var(--card)]" {...props} />
    </div>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  AvatarWithStatus,
  AvatarPremium
}
