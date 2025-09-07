import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative will-change-transform",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.22),0_12px_34px_-10px_rgba(99,102,241,0.5)] active:shadow-[0_0_0_4px_rgba(99,102,241,0.28),0_16px_40px_-10px_rgba(99,102,241,0.65)]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:shadow-[0_0_0_2px_rgba(244,63,94,0.15),0_8px_24px_-8px_rgba(244,63,94,0.35)] active:shadow-[0_0_0_3px_rgba(244,63,94,0.2),0_8px_28px_-6px_rgba(244,63,94,0.5)]",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_12px_32px_-12px_rgba(99,102,241,0.45)] active:shadow-[0_0_0_4px_rgba(99,102,241,0.24),0_16px_40px_-10px_rgba(99,102,241,0.6)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_12px_32px_-12px_rgba(99,102,241,0.45)] active:shadow-[0_0_0_4px_rgba(99,102,241,0.24),0_16px_40px_-10px_rgba(99,102,241,0.6)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_10px_26px_-10px_rgba(99,102,241,0.4)] active:shadow-[0_0_0_4px_rgba(99,102,241,0.24),0_14px_36px_-10px_rgba(99,102,241,0.55)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
