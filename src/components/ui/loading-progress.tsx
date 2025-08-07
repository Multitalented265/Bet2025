"use client"

import * as React from "react"
import { Progress } from "./progress"
import { cn } from "@/lib/utils"

interface LoadingProgressProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "accent" | "primary"
  showText?: boolean
  text?: string
}

const LoadingProgress = React.forwardRef<HTMLDivElement, LoadingProgressProps>(
  ({ className, size = "md", variant = "default", showText = false, text = "Loading..." }, ref) => {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            return 0
          }
          return prevProgress + 10
        })
      }, 200)

      return () => {
        clearInterval(timer)
      }
    }, [])

    const sizeClasses = {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
      xl: "h-8"
    }

    const variantClasses = {
      default: "bg-gradient-to-r from-primary to-accent",
      accent: "bg-gradient-to-r from-accent to-primary",
      primary: "bg-gradient-to-r from-primary via-accent to-primary"
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <Progress
          value={progress}
          className={cn(sizeClasses[size])}
        />
        {showText && (
          <div className="mt-2 text-center">
            <span className="text-sm text-muted-foreground animate-pulse">
              {text}
            </span>
          </div>
        )}
      </div>
    )
  }
)

LoadingProgress.displayName = "LoadingProgress"

export { LoadingProgress } 