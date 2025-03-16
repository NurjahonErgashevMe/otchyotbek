import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variant === "default" &&
            "bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90",
          variant === "destructive" &&
            "bg-red-500 text-gray-50 shadow-sm hover:bg-red-500/90",
          variant === "outline" &&
            "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900",
          variant === "ghost" &&
            "hover:bg-gray-100 hover:text-gray-900",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-10 rounded-md px-8",
          size === "icon" && "h-9 w-9",
          className
        )}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
