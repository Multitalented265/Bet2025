import { NextRequest, NextResponse } from 'next/server'
import { verifyPayChanguSignature, PayChanguCallbackData, validatePayChanguWebhookData } from '@/lib/paychangu'
import { WalletService } from '@/lib/wallet-service'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('Signature')

    // Enhanced security: Always verify signature in production
    let signatureValid = false
    if (signature) {
      try {
        signatureValid = verifyPayChanguSignature(signature, JSON.stringify(body), env.PAYCHANGU_SECRET_KEY)
        
      } catch (error) {
       
        signatureValid = false
      }
    }

    // Security: Only process if signature is valid or in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!signatureValid && !isDevelopment) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // ✅ Map PayChangu fields to expected format
    const callbackData = {
      ...body,
      tx_ref: body.reference || body.tx_ref // Use reference if tx_ref is not present
    }

    // Validate webhook data structure
    const validation = validatePayChanguWebhookData(callbackData)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid webhook data', 
        details: validation.errors 
      }, { status: 400 })
    }

    // Only process successful payments
    if (callbackData.status !== 'success') {
      
      return NextResponse.json({ message: 'Payment not successful' })
    }

    // Extract and validate user data from meta
    const { userId, transactionType, amount } = callbackData.meta || {}

    // Validate required meta data
    if (!userId) {
      console.error('❌ Missing userId in meta data')
      return NextResponse.json({ error: 'Missing userId in meta data' }, { status: 400 })
    }

    if (!transactionType) {
      console.error('❌ Missing transactionType in meta data')
      return NextResponse.json({ error: 'Missing transactionType in meta data' }, { status: 400 })
    }

    // Check if transaction already exists to prevent duplicates
    const existingTransaction = await WalletService.getTransactionByTxRef(callbackData.tx_ref)
    if (existingTransaction) {
      
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: callbackData.tx_ref
      })
    }

    // Process the payment using WalletService
    if (transactionType === 'Deposit') {
      
      
      const result = await WalletService.processDeposit(
        userId,
        amount,
        callbackData.tx_ref,
        callbackData
      )

      if (!result.success) {
        console.error('❌ Deposit processing failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }

      

      return NextResponse.json({ 
        message: 'Deposit processed successfully',
        tx_ref: callbackData.tx_ref,
        credited_amount: result.creditedAmount,
        fee: result.fee
      })
    } else if (transactionType === 'Withdrawal') {
      
      
      try {
        const result = await WalletService.completeWithdrawal(
          callbackData.tx_ref,
          callbackData
        )

        if (!result.success) {
          console.error('❌ Withdrawal completion failed:', result.message)
          return NextResponse.json({ error: result.message }, { status: 400 })
        }

        

        return NextResponse.json({ 
          message: 'Withdrawal completed successfully',
          tx_ref: callbackData.tx_ref,
          withdrawn_amount: result.withdrawnAmount,
          fee: result.fee
        })
      } catch (error) {
        console.error('❌ Error in withdrawal completion:', error)
        return NextResponse.json({ 
          error: 'Withdrawal completion failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      console.error('❌ Invalid transaction type:', transactionType)
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ PayChangu callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle return URL redirects - this is what PayChangu calls after payment
  const searchParams = request.nextUrl.searchParams
  const txRef = searchParams.get('tx_ref')
  const status = searchParams.get('status')

  // 🔍 COMPREHENSIVE REDIRECT DEBUG LOGGING
  
  
  // Check if this is the expected URL pattern
  

  // Build the wallet URL with appropriate parameters
  // Use environment variable for base URL to ensure correct protocol and port
  const baseUrl = env.NEXTAUTH_URL || request.nextUrl.origin
  const walletUrl = new URL('/dashboard/wallet', baseUrl)
  
  // Always redirect to wallet, regardless of status
  if (status === 'success') {
    walletUrl.searchParams.set('payment', 'success')
    walletUrl.searchParams.set('tx_ref', txRef || '')
    
  } else {
    walletUrl.searchParams.set('payment', 'failed')
    walletUrl.searchParams.set('tx_ref', txRef || '')
    
  }

  // Create redirect response with proper headers
  const response = NextResponse.redirect(walletUrl)
  
  // Set proper headers for redirect
  response.headers.set('Location', walletUrl.toString())
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  
  
  
  return response
} 