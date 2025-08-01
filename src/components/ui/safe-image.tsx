"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
  fallbackText?: string
  fallbackClassName?: string
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className,
  priority = false,
  fallbackText,
  fallbackClassName
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  const handleError = () => {
    console.error('Image failed to load:', src);
    setImageError(true)
  }

  const handleLoad = () => {
    console.log('Image loaded successfully:', src);
    setImageLoaded(true)
  }

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground font-medium",
        fallbackClassName
      )}>
        {fallbackText || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  // Check if src is a base64 data URL
  const isBase64 = src.startsWith('data:image/');

  // If it's a base64 data URL, use a regular img tag instead of Next.js Image
  if (isBase64) {
    return (
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-200",
            !imageLoaded && "opacity-0",
            imageLoaded && "opacity-100",
            className
          )}
          onError={handleError}
          onLoad={handleLoad}
          // iOS-specific optimizations
          loading="lazy"
          decoding="async"
          // Add iOS-specific attributes
          {...(isIOS && { 
            style: { 
              objectFit: 'cover',
              objectPosition: 'center',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }
          })}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-200",
          !imageLoaded && "opacity-0",
          imageLoaded && "opacity-100",
          className
        )}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        // iOS-specific optimizations
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // Add iOS-specific styles to prevent layout shifts and improve performance
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          ...(isIOS && {
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTransform: 'translateZ(0)', // Force hardware acceleration
            transform: 'translateZ(0)'
          })
        }}
        // Add iOS-specific props
        {...(isIOS && {
          unoptimized: false, // Keep Next.js optimization for iOS
          quality: 85 // Slightly lower quality for better performance on iOS
        })}
      />
    </div>
  )
} 