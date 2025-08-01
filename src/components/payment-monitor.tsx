"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react'

interface PaymentMonitorProps {
  txRef: string
  amount: number
  onComplete?: (status: 'success' | 'failed') => void
  onTimeout?: () => void
}

export function PaymentMonitor({ txRef, amount, onComplete, onTimeout }: PaymentMonitorProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'timeout'>('processing')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1
        
        // Check for timeout after 2 minutes
        if (newTime >= 120 && status === 'processing') {
          setStatus('timeout')
          onTimeout?.()
          return newTime
        }
        
        return newTime
      })
    }, 1000)

    // Check payment status every 10 seconds
    const statusInterval = setInterval(async () => {
      if (status === 'processing') {
        try {
          const response = await fetch(`/api/paychangu/check-payment?tx_ref=${txRef}`)
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'success') {
              setStatus('success')
              onComplete?.('success')
            } else if (data.status === 'failed') {
              setStatus('failed')
              onComplete?.('failed')
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        }
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(statusInterval)
    }
  }, [txRef, status, onComplete, onTimeout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing your payment...'
      case 'success':
        return 'Payment successful!'
      case 'failed':
        return 'Payment failed'
      case 'timeout':
        return 'Payment timeout'
      default:
        return 'Processing your payment...'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'timeout':
        return <AlertCircle className="h-6 w-6 text-orange-600" />
      default:
        return <Clock className="h-6 w-6 text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'timeout':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {getStatusMessage()}
            </h3>
            <p className="text-sm text-gray-600">
              Transaction ID: {txRef}
            </p>
            <p className="text-sm text-gray-600">
              Amount: MWK {amount.toLocaleString()}
            </p>
            {status === 'processing' && (
              <p className="text-sm text-gray-600">
                Time elapsed: {formatTime(timeElapsed)}
              </p>
            )}
            
            {status === 'processing' && timeElapsed > 30 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Live Mode Payment:</strong> Mobile money payments may take 30-60 seconds. 
                  Please check your phone for SMS prompts and enter your PIN when prompted.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-yellow-700 p-0 h-auto mt-2"
                >
                  {showHelp ? 'Hide Help' : 'Show Help'}
                </Button>
                
                {showHelp && (
                  <div className="mt-2 text-xs text-yellow-700">
                    <p>• Check your phone for SMS from your mobile money provider</p>
                    <p>• Enter your PIN when prompted</p>
                    <p>• Wait for confirmation SMS</p>
                    <p>• Payment will be processed automatically</p>
                  </div>
                )}
              </div>
            )}
            
            {status === 'timeout' && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  <strong>Payment Timeout:</strong> The payment is taking longer than expected. 
                  This could be due to network issues or mobile money provider delays.
                </p>
                <div className="mt-2 space-y-1 text-xs text-orange-700">
                  <p>• Check if you received an SMS from your mobile money provider</p>
                  <p>• Try refreshing the page and checking your wallet balance</p>
                  <p>• Contact support if the issue persists</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 