import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        destructive:
          "bg-[var(--destructive)] text-white focus-visible:ring-destructive/20 shadow-sm",
        outline:
          "border-[var(--border)] text-[var(--foreground)]",
        ghost: "text-[var(--foreground)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        // Premium variants
        premium: "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-md",
        success: "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20",
        warning: "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20",
        info: "bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/20",
        rose: "bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] border border-[var(--accent-rose)]/20",
        gold: "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20",
        glass: "bg-[var(--glass-bg)] backdrop-blur-sm border-[var(--glass-border)] text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
