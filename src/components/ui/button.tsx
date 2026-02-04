import * as React from "react"

import { cn } from "@/lib/utils"

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium" | "glass" | "success" | "warning"
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "sm-icon"
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 cursor-pointer"
  
  const variants = {
    default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)] shadow-sm hover:shadow-md",
    destructive: "bg-[var(--destructive)] text-white hover:bg-[var(--destructive)] shadow-sm hover:shadow-md",
    outline: "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--primary)]/50",
    secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]",
    ghost: "hover:bg-[var(--secondary)] text-[var(--foreground)]",
    link: "text-[var(--primary)] underline-offset-4 hover:underline",
    // Premium variants
    premium: "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-md hover:shadow-lg hover:from-[var(--primary-dark)] hover:to-[var(--primary)]",
    glass: "bg-[var(--glass-bg)] backdrop-blur-sm border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--glass-bg)]/80",
    success: "bg-[var(--success)] text-white shadow-sm hover:shadow-md",
    warning: "bg-[var(--warning)] text-white shadow-sm hover:shadow-md",
  }
  
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-6 text-base",
    xl: "h-12 px-8 text-base",
    icon: "h-10 w-10",
    "sm-icon": "h-8 w-8",
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}

export { Button }
