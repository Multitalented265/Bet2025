"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createPayChanguPaymentData, PayChanguCustomer } from '@/lib/paychangu'
import { useToast } from '@/hooks/use-toast'

// Extend Window interface without global declaration
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
}: PayChanguPaymentProps) {
  const { toast } = useToast()
  const scriptLoaded = useRef(false)
  const [isClient, setIsClient] = useState(false)
  const [paychanguConfig, setPaychanguConfig] = useState<any>(null)

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)
    
    // Fetch PayChangu configuration from server
    fetch('/api/paychangu/config')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Config fetch failed: ${response.status}`)
        }
        return response.json()
      })
      .then(config => {
        console.log('✅ PayChangu config loaded:', config)
        setPaychanguConfig(config)
      })
      .catch(error => {
        console.error('❌ Failed to load PayChangu config:', error)
        onError?.('Failed to load payment configuration')
      })
    
    // Ensure jQuery is loaded before PayChangu script
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      const loadPayChanguScript = () => {
        const script = document.createElement('script')
        script.src = 'https://in.paychangu.com/js/popup.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          console.log('✅ PayChangu script loaded successfully')
          // Wait a bit for the script to initialize
          setTimeout(() => {
            scriptLoaded.current = true
            console.log('✅ PayChangu script ready')
            console.log('🔍 PayChanguCheckout function available:', typeof (window as any).PaychanguCheckout)
            console.log('🔍 Window object keys:', Object.keys(window).filter(key => key.toLowerCase().includes('paychangu')))
            
            // Test if the function is callable
            if (typeof (window as any).PaychanguCheckout === 'function') {
              console.log('✅ PayChanguCheckout function is available and callable')
            } else {
              console.error('❌ PayChanguCheckout function is not available')
            }
          }, 1000)
        }
        script.onerror = (error) => {
          console.error('❌ Failed to load PayChangu script:', error)
          onError?.('Failed to load payment system')
        }
        document.head.appendChild(script)
      }

      // Check if jQuery is available
      if (typeof (window as any).$ === 'undefined') {
        // Load jQuery first
        const jqueryScript = document.createElement('script')
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
        jqueryScript.async = false // Load synchronously to ensure it's available
        // Add timeout to prevent infinite waiting
        const timeout = setTimeout(() => {
          console.error('jQuery loading timeout')
          onError?.('Failed to load payment system')
        }, 10000) // 10 second timeout
        
        jqueryScript.onload = () => {
          clearTimeout(timeout)
          console.log('jQuery loaded successfully')
          // Wait a bit to ensure jQuery is fully initialized
          setTimeout(() => {
            if (typeof (window as any).$ !== 'undefined') {
              console.log('jQuery is now available, loading PayChangu script...')
              loadPayChanguScript()
            } else {
              console.error('jQuery not available after loading')
              onError?.('Failed to load payment system')
            }
          }, 500) // Increased timeout for better reliability
        }
        
        jqueryScript.onerror = (error) => {
          clearTimeout(timeout)
          console.error('Failed to load jQuery:', error)
          onError?.('Failed to load payment system')
        }
        
        document.head.appendChild(jqueryScript)
      } else {
        // jQuery is already available
        console.log('jQuery already available, loading PayChangu script...')
        loadPayChanguScript()
      }
    }
  }, [onError])

  const handlePayment = () => {
    console.log('🔍 Payment button clicked')
    console.log('📋 Script loaded:', scriptLoaded.current)
    console.log('📋 PayChangu function available:', typeof (window as any).PaychanguCheckout)
    console.log('📋 jQuery available:', typeof (window as any).$)
    console.log('📋 PayChangu config loaded:', !!paychanguConfig)
    console.log('📋 Available window functions:', Object.keys(window).filter(key => key.toLowerCase().includes('paychangu')))
    
    // Check if PayChangu config is loaded
    if (!paychanguConfig) {
      toast({
        title: "Configuration Error",
        description: "Payment configuration is not loaded. Please try again.",
        variant: "destructive"
      })
      return
    }
    
    // Test session before proceeding
    fetch('/api/test-session')
      .then(response => {
        console.log('🔍 Session test response status:', response.status)
        if (!response.ok) {
          throw new Error(`Session test failed: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('✅ Session test successful:', data)
        proceedWithPayment()
      })
      .catch(error => {
        console.error('❌ Session test failed:', error)
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

    // Check if jQuery is available
    if (typeof (window as any).$ === 'undefined') {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please refresh the page and try again.",
        variant: "destructive"
      })
      return
    }

    // Validate PayChangu configuration
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

    try {
      // Create payment data with server-provided config
      const paymentData = {
        public_key: paychanguConfig.configuration.publicKey,
        tx_ref: 'TX_' + Math.floor((Math.random() * 1000000000) + 1),
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
      }

      console.log('🔍 Payment data:', paymentData)
      console.log('🔍 PaychanguCheckout function:', typeof (window as any).PaychanguCheckout)
      
      // Call PayChangu with proper error handling
      const paychanguFunction = (window as any).PaychanguCheckout
      
      if (typeof paychanguFunction === 'function') {
        console.log('🔍 Calling PayChangu function with data:', JSON.stringify(paymentData, null, 2))
        console.log('🔍 Public key being used:', paymentData.public_key)
        console.log('🔍 Amount being sent:', paymentData.amount)
        console.log('🔍 Currency being sent:', paymentData.currency)
        
        try {
          console.log('🔍 About to call PayChangu function...')
          
          // Make wrapper visible before calling PayChangu
          const wrapper = document.getElementById('wrapper')
          if (wrapper) {
            wrapper.style.display = 'block'
            console.log('✅ Made wrapper visible')
          }
          
          // Add error handling wrapper to capture API errors
          const originalFetch = window.fetch
          let apiError: { status: number; details: string } | null = null
          
          window.fetch = function(...args) {
            const [url, options] = args
            console.log('🔍 Intercepted fetch request:', { url, method: options?.method })
            
            // Log the request body if it's a POST request
            if (options?.body && typeof options.body === 'string') {
              try {
                const body = JSON.parse(options.body)
                console.log('🔍 Request body:', body)
              } catch (e) {
                console.log('🔍 Request body (raw):', options.body)
              }
            }
            
            return originalFetch.apply(this, args).then(response => {
              if (!response.ok) {
                console.error('❌ API Error Response:', {
                  status: response.status,
                  statusText: response.statusText,
                  url: url
                })
                
                // Handle 403 errors specifically
                if (response.status === 403) {
                  console.error('🚨 403 Forbidden Error - Authentication issue detected')
                  apiError = { status: 403, details: 'Authentication failed - Please log in again' }
                }
                
                // Try to get error details
                return response.text().then(text => {
                  console.error('❌ API Error Details:', text)
                  if (!apiError) {
                    apiError = { status: response.status, details: text }
                  }
                  throw new Error(`API Error: ${response.status} - ${text}`)
                })
              }
              return response
            })
          }
          
          // Try calling the function with a simpler approach
          console.log('🔍 About to call PayChangu with data:', paymentData)
          
          // Check if the function expects a callback
          if (paychanguFunction.length > 1) {
            // Function expects a callback
            console.log('🔍 Calling PayChangu with callback')
            paychanguFunction(paymentData, (response: any) => {
              console.log('🔍 PayChangu callback response:', response)
              if (response && response.error) {
                console.error('❌ PayChangu callback error:', response.error)
                apiError = { status: 400, details: response.error }
              }
            })
          } else {
            // Function doesn't expect a callback
            console.log('🔍 Calling PayChangu without callback')
            try {
              paychanguFunction(paymentData)
              console.log('✅ PayChangu function called successfully')
            } catch (callError) {
              console.error('❌ Error calling PayChangu function:', callError)
              apiError = { status: 500, details: callError instanceof Error ? callError.message : String(callError) }
            }
          }
          
          console.log('✅ PayChangu function called successfully')
          
          // Restore original fetch
          setTimeout(() => {
            window.fetch = originalFetch
          }, 1000)
          
          // Check if wrapper div exists and is visible
          setTimeout(() => {
            const wrapper = document.getElementById('wrapper')
            const iframe = wrapper?.querySelector('iframe')
            console.log('🔍 Wrapper div:', wrapper)
            console.log('🔍 Iframe found:', iframe)
            if (iframe) {
              console.log('✅ Iframe src:', iframe.src)
              console.log('✅ Iframe style:', iframe.style.cssText)
            } else {
              console.log('❌ No iframe found, PayChangu might not be working')
              console.log('📋 This could be due to:')
              console.log('1. Invalid public key')
              console.log('2. Network issues')
              console.log('3. PayChangu service issues')
              console.log('4. API endpoint issues')
              console.log('5. Authentication issues (403 error)')
              
              if (apiError) {
                console.error('❌ PayChangu API Error:', apiError)
                
                // Handle 403 errors specifically
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
                // Try alternative approach - direct redirect
                console.log('🔄 Trying alternative approach - direct redirect')
                const redirectUrl = `https://in.paychangu.com/pay?public_key=${paymentData.public_key}&tx_ref=${paymentData.tx_ref}&amount=${paymentData.amount}&currency=${paymentData.currency}&callback_url=${encodeURIComponent(paymentData.callback_url)}&return_url=${encodeURIComponent(paymentData.return_url)}&customer_email=${encodeURIComponent(paymentData.customer.email)}&customer_first_name=${encodeURIComponent(paymentData.customer.first_name)}&customer_last_name=${encodeURIComponent(paymentData.customer.last_name)}`
                
                console.log('🔗 Redirect URL:', redirectUrl)
                window.open(redirectUrl, '_blank', 'width=600,height=600')
                
                toast({
                  title: "Payment Redirect",
                  description: "Redirecting to PayChangu payment page...",
                })
              }
            }
          }, 3000)
          
          toast({
            title: "Payment Initiated",
            description: "PayChangu popup should open. If it doesn't, please check your browser's popup blocker.",
          })
        } catch (error) {
          console.error('❌ PayChangu API Error Details:', error)
          console.error('❌ Error calling PayChangu function:', error)
          
          // Check if it's a currency issue
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
        console.error('❌ PayChangu function not found. Available functions:', Object.keys(window).filter(key => key.toLowerCase().includes('paychangu')))
        throw new Error('PayChangu function not available')
      }
    } catch (error) {
      console.error('❌ Payment initialization error:', error)
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
      onError?.('Payment initialization failed')
    }
  }

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  return (
    <>
      {/* PayChangu styles to ensure proper popup display */}
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
      
      {/* PayChangu wrapper div - required for the popup */}
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