"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "accent" | "primary"
  showText?: boolean
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", showText = false, text = "Loading..." }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12"
    }

    const variantClasses = {
      default: "border-primary",
      accent: "border-accent",
      primary: "border-primary"
    }

    return (
      <div ref={ref} className={cn("flex flex-col items-center justify-center", className)}>
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-t-transparent",
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {showText && (
          <div className="mt-3 text-center">
            <span className="text-sm text-muted-foreground animate-pulse">
              {text}
            </span>
          </div>
        )}
      </div>
    )
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner } 