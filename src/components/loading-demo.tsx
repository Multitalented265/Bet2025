"use client"

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { LoadingProgress, LoadingSpinner, LoadingOverlay, Progress } from './ui/loading'
import { useLoading } from '@/hooks/use-loading'

export const LoadingDemo = () => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading()

  const handleSimulateLoading = async () => {
    await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000))
        return "Loading completed!"
      },
      "Processing your request..."
    )
  }

  const handleShowOverlay = () => {
    startLoading("Loading overlay...")
    setTimeout(() => stopLoading(), 3000)
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Loading Components Demo</h1>
      
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Bar</CardTitle>
          <CardDescription>Determinate progress with custom styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={25} />
          <Progress value={50} />
          <Progress value={75} />
          <Progress value={100} />
        </CardContent>
      </Card>

      {/* Loading Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Progress</CardTitle>
          <CardDescription>Indeterminate progress with animation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoadingProgress size="sm" showText={true} text="Small loading..." />
          <LoadingProgress size="md" showText={true} text="Medium loading..." />
          <LoadingProgress size="lg" showText={true} text="Large loading..." />
        </CardContent>
      </Card>

      {/* Loading Spinner */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinner</CardTitle>
          <CardDescription>Spinning loader with different sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
            <LoadingSpinner size="xl" />
          </div>
          <LoadingSpinner size="md" showText={true} text="Loading with text..." />
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>Test the loading components with buttons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={handleSimulateLoading} disabled={isLoading}>
              {isLoading ? "Loading..." : "Simulate Loading"}
            </Button>
            <Button onClick={handleShowOverlay} variant="outline">
              Show Overlay
            </Button>
          </div>
          
          {isLoading && (
            <div className="mt-4">
              <LoadingProgress showText={true} text="Processing..." />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      <LoadingOverlay 
        show={isLoading} 
        variant="both" 
        size="lg" 
        text="Processing your request..."
      />
    </div>
  )
} 