"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestUpdateImages() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const updateImages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/update-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        alert('Images updated successfully! Please refresh the dashboard to see the changes.')
      } else {
        alert('Failed to update images: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating images:', error)
      alert('Error updating images. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Candidate Images</CardTitle>
          <CardDescription>
            This will update all candidate images with valid placeholder images from Picsum Photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={updateImages} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Updating Images...' : 'Update All Candidate Images'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 