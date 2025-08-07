"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PaymentStatusProps {
  status: string
  txRef?: string
}

export function PaymentStatus({ status, txRef }: PaymentStatusProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  const isSuccess = status === 'success'

  return (
    <Card className={`border-2 ${isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {isSuccess ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600" />
          )}
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </h3>
            <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {isSuccess 
                ? `Your deposit has been processed successfully. Transaction ID: ${txRef || 'N/A'}`
                : 'There was an issue processing your payment. Please try again.'
              }
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 