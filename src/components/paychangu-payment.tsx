"use client"

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PayChanguCustomer } from '@/lib/paychangu'
import { useToast } from '@/hooks/use-toast'

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
        onError?.('Failed to load payment configuration')
      })
    
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      const loadPayChanguScript = () => {
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
          onError?.('Failed to load payment system')
        }
        document.head.appendChild(script)
      }

      if (typeof (window as any).$ === 'undefined') {
        const jqueryScript = document.createElement('script')
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
        jqueryScript.async = false
        
        const timeout = setTimeout(() => {
          onError?.('Failed to load payment system')
        }, 10000)
        
        jqueryScript.onload = () => {
          clearTimeout(timeout)
          setTimeout(() => {
            if (typeof (window as any).$ !== 'undefined') {
              loadPayChanguScript()
            } else {
              onError?.('Failed to load payment system')
            }
          }, 500)
        }
        
        jqueryScript.onerror = (error) => {
          clearTimeout(timeout)
          onError?.('Failed to load payment system')
        }
        
        document.head.appendChild(jqueryScript)
      } else {
        loadPayChanguScript()
      }
    }
  }, [onError])

  const handlePayment = () => {
    if (!paychanguConfig) {
      toast({
        title: "Configuration Error",
        description: "Payment configuration is not loaded. Please try again.",
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
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue with payment.",
          variant: "destructive"
        })
        return
      })
  }

  const proceedWithPayment = () => {
    if (!scriptLoaded.current) {
      toast({
        title: "Payment System Loading",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      })
      return
    }

    if (typeof (window as any).PaychanguCheckout !== 'function') {
      toast({
        title: "Payment Error",
        description: "Payment system is not available. Please try again later.",
        variant: "destructive"
      })
      return
    }

    if (typeof (window as any).$ === 'undefined') {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please refresh the page and try again.",
        variant: "destructive"
      })
      return
    }

    if (!paychanguConfig || !paychanguConfig.configuration) {
      toast({
        title: "Configuration Error",
        description: "Payment configuration is not loaded. Please refresh the page and try again.",
        variant: "destructive"
      })
      return
    }

    if (!paychanguConfig.configuration.publicKey) {
      toast({
        title: "Configuration Error",
        description: "Payment public key is not configured. Please contact support.",
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
          title: `${transactionType} - Bet2025`,
          description: `${transactionType} funds to your Bet2025 wallet`,
        },
        meta: {
          userId,
          transactionType,
          amount,
        },
        country: "MW",
        payment_method: "mobile_money",
        timeout: isLiveMode ? 120000 : 60000,
      }

      const paychanguFunction = (window as any).PaychanguCheckout
      
      if (typeof paychanguFunction === 'function') {
        try {
          const wrapper = document.getElementById('wrapper')
          if (wrapper) {
            wrapper.style.display = 'block'
          }
          
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
          
          if (paychanguFunction.length > 1) {
            paychanguFunction(paymentData, (response: any) => {
              if (response && response.error) {
                apiError = { status: 400, details: response.error }
              }
            })
          } else {
            try {
              paychanguFunction(paymentData)
            } catch (callError) {
              apiError = { status: 500, details: callError instanceof Error ? callError.message : String(callError) }
            }
          }
          
          if (isLiveMode) {
            toast({
              title: "Payment Initiated",
              description: "Please check your phone for SMS prompts. Mobile money payments may take 30-60 seconds to process.",
            })
          } else {
            toast({
              title: "Payment Initiated",
              description: "PayChangu popup should open. If it doesn't, please check your browser's popup blocker.",
            })
          }
          
          setTimeout(() => {
            window.fetch = originalFetch
          }, 1000)
          
          setTimeout(() => {
            const wrapper = document.getElementById('wrapper')
            const iframe = wrapper?.querySelector('iframe')
            
            if (!iframe && apiError) {
              if (apiError.status === 403) {
                toast({
                  title: "Authentication Error",
                  description: "Please log in again to continue with payment.",
                  variant: "destructive"
                })
              } else {
                toast({
                  title: "Payment Error",
                  description: `API Error: ${apiError.status} - ${apiError.details}`,
                  variant: "destructive"
                })
              }
            } else {
              if (isLiveMode) {
                const redirectUrl = `https://in.paychangu.com/pay?public_key=${paymentData.public_key}&tx_ref=${paymentData.tx_ref}&amount=${paymentData.amount}&currency=${paymentData.currency}&callback_url=${encodeURIComponent(paymentData.callback_url)}&return_url=${encodeURIComponent(paymentData.return_url)}&customer_email=${encodeURIComponent(paymentData.customer.email)}&customer_first_name=${encodeURIComponent(paymentData.customer.first_name)}&customer_last_name=${encodeURIComponent(paymentData.customer.last_name)}&country=MW&payment_method=mobile_money`
                
                window.open(redirectUrl, '_blank', 'width=600,height=600')
                
                toast({
                  title: "Payment Redirect",
                  description: "Redirecting to PayChangu payment page. Please check your phone for SMS prompts.",
                })
              } else {
                const redirectUrl = `https://in.paychangu.com/pay?public_key=${paymentData.public_key}&tx_ref=${paymentData.tx_ref}&amount=${paymentData.amount}&currency=${paymentData.currency}&callback_url=${encodeURIComponent(paymentData.callback_url)}&return_url=${encodeURIComponent(paymentData.return_url)}&customer_email=${encodeURIComponent(paymentData.customer.email)}&customer_first_name=${encodeURIComponent(paymentData.customer.first_name)}&customer_last_name=${encodeURIComponent(paymentData.customer.last_name)}`
                
                window.open(redirectUrl, '_blank', 'width=600,height=600')
                
                toast({
                  title: "Payment Redirect",
                  description: "Redirecting to PayChangu payment page...",
                })
              }
            }
          }, isLiveMode ? 5000 : 3000)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('currency') || errorMessage.includes('MWK')) {
            toast({
              title: "Currency Not Supported",
              description: "MWK currency may not be supported. Please contact support.",
              variant: "destructive"
            })
          } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
            toast({
              title: "Authentication Error",
              description: "Please log in again to continue with payment.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Payment Error",
              description: "Failed to initialize payment. Please check your configuration.",
              variant: "destructive"
            })
          }
          throw error
        }
      } else {
        throw new Error('PayChangu function not available')
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
      onError?.('Payment initialization failed')
    }
  }

  if (!isClient) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          #wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
          }
          
          #wrapper iframe {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 90vw !important;
            height: 90vh !important;
            border: none !important;
            z-index: 10000 !important;
            border-radius: 8px !important;
          }
        `
      }} />
      
      <div 
        id="wrapper" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'none'
        }}
      ></div>
      
      <Button
        onClick={handlePayment}
        disabled={disabled || !scriptLoaded.current}
        className="w-full"
      >
        {children || `Proceed to Pay Changu`}
      </Button>
    </>
  )
} 