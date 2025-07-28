import { NextRequest, NextResponse } from 'next/server'
import { verifyPayChanguSignature, PayChanguCallbackData, validatePayChanguWebhookData } from '@/lib/paychangu'
import { WalletService } from '@/lib/wallet-service'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 ===== CALLBACK DEBUG START =====')
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🌐 Request URL:', request.url)
    console.log('🔗 Request Headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    const signature = request.headers.get('Signature')

    console.log('🔍 PayChangu callback received:', {
      tx_ref: body.tx_ref,
      reference: body.reference,
      status: body.status,
      amount: body.amount,
      currency: body.currency,
      event_type: body.event_type,
      signature: signature ? 'present' : 'missing',
      has_meta: !!body.meta,
      meta_userId: body.meta?.userId,
      meta_transactionType: body.meta?.transactionType,
      fullBody: JSON.stringify(body, null, 2)
    })

    // Enhanced security: Always verify signature in production
    let signatureValid = false
    if (signature) {
      try {
        signatureValid = verifyPayChanguSignature(signature, JSON.stringify(body), env.PAYCHANGU_SECRET_KEY)
        console.log('🔐 Signature verification:', { 
          signature: signature.substring(0, 10) + '...', 
          isValid: signatureValid,
          secretKeyLength: env.PAYCHANGU_SECRET_KEY?.length || 0
        })
      } catch (error) {
        console.warn('⚠️ Signature verification error:', error)
        signatureValid = false
      }
    } else {
      console.log('❌ No signature provided - this is a security concern')
    }

    // Security: Only process if signature is valid or in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!signatureValid && !isDevelopment) {
      console.error('🚨 SECURITY ALERT: Invalid or missing signature in production')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!signatureValid && isDevelopment) {
      console.warn('⚠️ Invalid signature in development mode - continuing for testing')
    }

    // ✅ Map PayChangu fields to expected format
    const callbackData = {
      ...body,
      tx_ref: body.reference || body.tx_ref // Use reference if tx_ref is not present
    }

    // Validate webhook data structure
    const validation = validatePayChanguWebhookData(callbackData)
    if (!validation.isValid) {
      console.error('❌ Invalid webhook data:', validation.errors)
      return NextResponse.json({ 
        error: 'Invalid webhook data', 
        details: validation.errors 
      }, { status: 400 })
    }

    // Only process successful payments
    if (callbackData.status !== 'success') {
      console.log(`❌ Payment failed for tx_ref: ${callbackData.tx_ref}, status: ${callbackData.status}`)
      return NextResponse.json({ message: 'Payment not successful' })
    }

    // Extract and validate user data from meta
    const { userId, transactionType, amount } = callbackData.meta || {}

    console.log('✅ Processing payment:', { 
      userId, 
      transactionType, 
      amount, 
      tx_ref: callbackData.tx_ref,
      meta: callbackData.meta
    })

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
      console.log(`⚠️ Transaction ${callbackData.tx_ref} already processed, skipping`)
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: callbackData.tx_ref
      })
    }

    // Process the payment using WalletService
    if (transactionType === 'Deposit') {
      console.log(`💰 Processing deposit for user ${userId}, amount: ${amount}, tx_ref: ${callbackData.tx_ref}`)
      
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

      console.log(`✅ Deposit processed successfully for tx_ref: ${callbackData.tx_ref}`)
      console.log(`💰 User ${userId} credited with ${result.creditedAmount} (fee: ${result.fee})`)

      return NextResponse.json({ 
        message: 'Deposit processed successfully',
        tx_ref: callbackData.tx_ref,
        credited_amount: result.creditedAmount,
        fee: result.fee
      })
    } else if (transactionType === 'Withdrawal') {
      console.log(`💸 Processing withdrawal for tx_ref: ${callbackData.tx_ref}`)
      
      const result = await WalletService.completeWithdrawal(
        callbackData.tx_ref,
        callbackData
      )

      if (!result.success) {
        console.error('❌ Withdrawal completion failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }

      console.log(`✅ Withdrawal completed successfully for tx_ref: ${callbackData.tx_ref}`)

      return NextResponse.json({ 
        message: 'Withdrawal completed successfully',
        tx_ref: callbackData.tx_ref,
        withdrawn_amount: result.withdrawnAmount,
        fee: result.fee
      })
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
  console.log('🔍 ===== PAYCHANGU REDIRECT DEBUG =====')
  console.log('📋 Incoming Request Details:')
  console.log('  Full URL:', request.url)
  console.log('  Origin:', request.nextUrl.origin)
  console.log('  Pathname:', request.nextUrl.pathname)
  console.log('  Search Params:', Object.fromEntries(searchParams.entries()))
  console.log('  tx_ref:', txRef)
  console.log('  status:', status)
  
  // Check if this is the expected URL pattern
  console.log('🚨 URL Analysis:')
  if (request.url.includes('localhost/api/paychangu/callback')) {
          console.log('  ❌ PayChangu is redirecting to wrong URL (has port 9002)')
      console.log('  Expected: http://localhost/api/paychangu/callback')
    console.log('  Actual: http://localhost/api/paychangu/callback')
      } else if (request.url.includes('localhost/api/paychangu/callback')) {
    console.log('  ✅ PayChangu is redirecting to correct URL')
  } else {
    console.log('  ⚠️ Unexpected URL pattern:', request.url)
  }

  // Build the wallet URL with appropriate parameters
  // Use environment variable for base URL to ensure correct protocol and port
  const baseUrl = env.NEXTAUTH_URL || request.nextUrl.origin
  const walletUrl = new URL('/dashboard/wallet', baseUrl)
  
  // Always redirect to wallet, regardless of status
  if (status === 'success') {
    walletUrl.searchParams.set('payment', 'success')
    walletUrl.searchParams.set('tx_ref', txRef || '')
    console.log('📍 Redirecting to wallet success URL:', walletUrl.toString())
  } else {
    walletUrl.searchParams.set('payment', 'failed')
    walletUrl.searchParams.set('tx_ref', txRef || '')
    console.log('📍 Redirecting to wallet failed URL:', walletUrl.toString())
  }

  // Create redirect response with proper headers
  const response = NextResponse.redirect(walletUrl)
  
  // Set proper headers for redirect
  response.headers.set('Location', walletUrl.toString())
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  
  console.log('🔄 Sending redirect response to:', walletUrl.toString())
  console.log('🔍 ===== END REDIRECT DEBUG =====')
  
  return response
} 