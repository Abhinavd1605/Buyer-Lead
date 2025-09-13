import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "lg" | "icon"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClasses = "btn"
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      ghost: "btn-ghost"
    }
    const sizeClasses = {
      default: "",
      lg: "btn-lg",
      icon: "btn-icon"
    }
    
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].filter(Boolean).join(" ")
    
    return (
      <Comp
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }