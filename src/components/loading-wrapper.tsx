"use client"

import React, { Suspense } from 'react'
import { LoadingOverlay } from './ui/loading-overlay'

interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showOverlay?: boolean
  overlayText?: string
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingOverlay 
      show={true} 
      variant="spinner" 
      size="lg" 
      text="Loading..." 
      backdrop={false}
    />
  </div>
)

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  fallback = <DefaultFallback />,
  showOverlay = false,
  overlayText = "Loading..."
}) => {
  return (
    <>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
      {showOverlay && (
        <LoadingOverlay 
          show={showOverlay} 
          variant="spinner" 
          size="lg" 
          text={overlayText}
        />
      )}
    </>
  )
} 