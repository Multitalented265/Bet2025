"use client"

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PayChanguCustomer } from '@/lib/paychangu'
import { useToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/utils'

interface Window {
  PaychanguCheckout?: (config: any) => void;
  $?: any;
}

interface PayChanguPaymentProps {
  amount: number;
  customer: PayChanguCustomer;
  userId: string;
  transactionType: 'Deposit' | 'Withdrawal';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PayChanguPayment({
  amount,
  customer,
  userId,
  transactionType,
  onSuccess,
  onError,
  disabled = false,
  children
}: PayChanguPaymentProps): JSX.Element {
  const { toast } = useToast()
  const scriptLoaded = useRef(false)
  const scriptRetryCount = useRef(0)
  const [isClient, setIsClient] = useState(false)
  const [paychanguConfig, setPaychanguConfig] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    
    fetch('/api/paychangu/config')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Config fetch failed: ${response.status}`)
        }
        return response.json()
      })
      .then(config => {
        setPaychanguConfig(config)
      })
      .catch(error => {
        const userFriendlyMessage = handleError('Failed to load payment configuration');
        onError?.(userFriendlyMessage)
      })
    
    // Load PayChangu script
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      
      const loadPayChanguScript = () => {
        
        // Test if the script URL is accessible
        fetch('https://in.paychangu.com/js/popup.js', { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Script URL not accessible: ${response.status}`)
            }
          })
          .catch(error => {
          })
        
        const script = document.createElement('script')
        script.src = 'https://in.paychangu.com/js/popup.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          setTimeout(() => {
            scriptLoaded.current = true
          }, 1000)
        }
        script.onerror = (error) => {
          
          // Retry mechanism
          if (scriptRetryCount.current < 3) {
            scriptRetryCount.current++
            setTimeout(() => {
              loadPayChanguScript()
            }, 2000)
          } else {
            const userFriendlyMessage = handleError('Failed to load payment system after multiple attempts');
            onError?.(userFriendlyMessage)
          }
        }
        document.head.appendChild(script)
      }

      if (typeof (window as any).$ === 'undefined') {
        const jqueryScript = document.createElement('script')
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
        jqueryScript.async = false
        
        const timeout = setTimeout(() => {
          const userFriendlyMessage = handleError('Failed to load payment system');
          onError?.(userFriendlyMessage)
        }, 10000)
        
        jqueryScript.onload = () => {
          clearTimeout(timeout)
          setTimeout(() => {
            if (typeof (window as any).$ !== 'undefined') {
              loadPayChanguScript()
            } else {
              const userFriendlyMessage = handleError('Failed to load payment system');
              onError?.(userFriendlyMessage)
            }
          }, 500)
        }
        
        jqueryScript.onerror = (error) => {
          clearTimeout(timeout)
          const userFriendlyMessage = handleError('Failed to load payment system');
          onError?.(userFriendlyMessage)
        }
        
        document.head.appendChild(jqueryScript)
      } else {
        loadPayChanguScript()
      }
    } else {
    }
    
    // Cleanup function to restore body styles when component unmounts
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.documentElement.style.overflow = ''
    }
  }, [onError])

  const handlePayment = () => {
    if (!paychanguConfig) {
      const userFriendlyMessage = handleError('Payment configuration is not loaded');
      toast({
        title: "Configuration Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }
    
    fetch('/api/test-session')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Session test failed: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        proceedWithPayment()
      })
      .catch(error => {
        const userFriendlyMessage = handleError('Please log in again to continue with payment');
        toast({
          title: "Authentication Error",
          description: userFriendlyMessage,
          variant: "destructive"
        })
        return
      })
  }

  const proceedWithPayment = () => {
    
    if (!scriptLoaded.current) {
      const userFriendlyMessage = handleError('Payment system is still loading');
      toast({
        title: "Payment System Loading",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }

    if (typeof (window as any).PaychanguCheckout !== 'function') {
      const userFriendlyMessage = handleError('Payment system is not available');
      toast({
        title: "Payment Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }

    if (typeof (window as any).$ === 'undefined') {
      const userFriendlyMessage = handleError('Payment system is not ready');
      toast({
        title: "Payment Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }

    if (!paychanguConfig || !paychanguConfig.configuration) {
      const userFriendlyMessage = handleError('Payment configuration is not loaded');
      toast({
        title: "Configuration Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }
    
    // Validate configuration structure

    if (!paychanguConfig.configuration.publicKey) {
      const userFriendlyMessage = handleError('Payment public key is not configured');
      toast({
        title: "Configuration Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
      return
    }

    const isLiveMode = paychanguConfig.configuration.publicKey.startsWith('pub-live-')

    try {
      const txRef = 'TX_' + Math.floor((Math.random() * 1000000000) + 1)
      
      const paymentData = {
        public_key: paychanguConfig.configuration.publicKey,
        tx_ref: txRef,
        amount: amount,
        currency: "MWK",
        callback_url: paychanguConfig.configuration.callbackUrl,
        return_url: paychanguConfig.configuration.returnUrl,
        webhook_url: paychanguConfig.configuration.webhookUrl,
        customer,
        customization: {
                  title: `${transactionType} - Mzunguko`,
        description: `${transactionType} funds to your Mzunguko wallet`,
        logo: "https://mzunguko.com/logo.png", // Add your logo URL
        },
        meta: {
          userId,
          transactionType,
          amount,
        },
        country: "MW",
        payment_method: "mobile_money",
        timeout: isLiveMode ? 120000 : 60000,
        
        // Validate payment data
        // Full screen configuration for all devices
        modal: {
          position: "center",
          width: "100vw",
          height: "100vh", 
          fullscreen: true,
          responsive: true,
          closeOnEscape: false,
          closeOnOverlayClick: false,
          // Enhanced fullscreen configuration
          maxWidth: "100vw",
          maxHeight: "100vh",
          overflow: "visible",
          // Additional properties for better fullscreen support
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          margin: "0",
          padding: "0",
          border: "none",
          borderRadius: "0"
        }
      }

      const paychanguFunction = (window as any).PaychanguCheckout
      
      if (typeof paychanguFunction === 'function') {
        try {
          // Create wrapper element for PayChangu (required by the library)
          const wrapper = document.getElementById('wrapper')
          if (wrapper) {
            wrapper.style.display = 'block'
            wrapper.style.position = 'fixed'
            wrapper.style.top = '0'
            wrapper.style.left = '0'
            wrapper.style.width = '100vw'
            wrapper.style.height = '100vh'
            wrapper.style.zIndex = '9999'
            wrapper.style.overflow = 'visible'
          }
          
          // Ensure body and html are configured for full screen
          document.body.style.overflow = 'hidden'
          document.body.style.position = 'fixed'
          document.body.style.width = '100vw'
          document.body.style.height = '100vh'
          document.documentElement.style.overflow = 'hidden'
          
          const originalFetch = window.fetch
          let apiError: { status: number; details: string } | null = null
          
          window.fetch = function(...args) {
            const [url, options] = args
            
            return originalFetch.apply(this, args).then(response => {
              if (!response.ok) {
                if (response.status === 403) {
                  apiError = { status: 403, details: 'Authentication failed - Please log in again' }
                }
                
                return response.text().then(text => {
                  if (!apiError) {
                    apiError = { status: response.status, details: text }
                  }
                  throw new Error(`API Error: ${response.status} - ${text}`)
                })
              }
              return response
            })
          }
          
          // Add timeout to prevent hanging
          const paymentTimeout = setTimeout(() => {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
            document.body.style.height = ''
            document.documentElement.style.overflow = ''
            
            const userFriendlyMessage = handleError('Payment popup did not appear. Please try again.');
            toast({
              title: "Payment Timeout",
              description: userFriendlyMessage,
              variant: "destructive"
            })
          }, 10000) // 10 second timeout
          
          if (paychanguFunction.length > 1) {
            paychanguFunction(paymentData, (response: any) => {
              clearTimeout(paymentTimeout)
              if (response && response.error) {
                apiError = { status: 400, details: response.error }
              }
            })
          } else {
            try {
              paychanguFunction(paymentData)
              
              // Clear timeout after successful call
              setTimeout(() => {
                clearTimeout(paymentTimeout)
              }, 2000)
            } catch (error) {
              clearTimeout(paymentTimeout)
              const userFriendlyMessage = handleError(error as Error);
              toast({
                title: "Payment Error",
                description: userFriendlyMessage,
                variant: "destructive"
              })
            }
          }
          
          // Restore original fetch after a delay
          setTimeout(() => {
            window.fetch = originalFetch
          }, 5000)
          
        } catch (error) {
          // Restore body styles
          document.body.style.overflow = ''
          document.body.style.position = ''
          document.body.style.width = ''
          document.body.style.height = ''
          document.documentElement.style.overflow = ''
          
          const userFriendlyMessage = handleError(error as Error);
          toast({
            title: "Payment Error",
            description: userFriendlyMessage,
            variant: "destructive"
          })
        }
      } else {
        // Restore body styles
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.documentElement.style.overflow = ''
        
        const userFriendlyMessage = handleError('Payment function is not available');
        toast({
          title: "Payment Error",
          description: userFriendlyMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      // Restore body styles
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.documentElement.style.overflow = ''
      
      const userFriendlyMessage = handleError(error as Error);
      toast({
        title: "Payment Error",
        description: userFriendlyMessage,
        variant: "destructive"
      })
    }
  }

  if (!isClient) {
    return <div>Loading payment system...</div>
  }

  return (
    <div>
      <Button
        onClick={handlePayment}
        disabled={disabled || !paychanguConfig}
        className="w-full"
      >
        {children || `Proceed with ${transactionType}`}
      </Button>
      
      {/* Wrapper div for PayChangu (required by the library) */}
      <div 
        id="wrapper" 
        style={{ 
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          overflow: 'visible',
          margin: 0,
          padding: 0,
          border: 'none'
        }}
      ></div>
    </div>
  )
} 