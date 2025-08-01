"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"
import { LoadingProgress } from "./loading-progress"

interface LoadingOverlayProps {
  className?: string
  show?: boolean
  variant?: "spinner" | "progress" | "both"
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  backdrop?: boolean
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    show = true, 
    variant = "spinner", 
    size = "md", 
    text = "Loading...",
    backdrop = true 
  }, ref) => {
    if (!show) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          backdrop && "bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-4 p-6 rounded-lg bg-card/90 border border-border shadow-lg">
          {variant === "spinner" && (
            <LoadingSpinner
              size={size}
              showText={true}
              text={text}
            />
          )}
          {variant === "progress" && (
            <LoadingProgress
              size={size}
              showText={true}
              text={text}
            />
          )}
          {variant === "both" && (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size={size} />
              <LoadingProgress size={size} showText={true} text={text} />
            </div>
          )}
        </div>
      </div>
    )
  }
)

LoadingOverlay.displayName = "LoadingOverlay"

export { LoadingOverlay } 