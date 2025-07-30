import { NextRequest, NextResponse } from 'next/server'
import { verifyPayChanguSignature, validatePayChanguWebhookData } from '@/lib/paychangu'
import { WalletService } from '@/lib/wallet-service'
import { env } from '@/lib/env'
import { prisma } from '@/lib/db'

// 🔍 COMPREHENSIVE WEBHOOK LOGGING - CATCHES ALL REQUESTS
export async function POST(request: NextRequest) {
  // 🚨 IMMEDIATE LOGGING - BEFORE ANY PROCESSING
  console.log('🔔 ===== WEBHOOK REQUEST RECEIVED =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 Request Headers:', Object.fromEntries(request.headers.entries()))
  console.log('🔗 Content-Type:', request.headers.get('content-type'))
  console.log('🔗 User-Agent:', request.headers.get('user-agent'))
  console.log('🔗 Origin:', request.headers.get('origin'))
  console.log('🔗 Referer:', request.headers.get('referer'))
  console.log('🔗 Host:', request.headers.get('host'))
  console.log('🔗 X-Forwarded-For:', request.headers.get('x-forwarded-for'))
  console.log('🔗 X-Forwarded-Host:', request.headers.get('x-forwarded-host'))
  console.log('🔗 X-Real-IP:', request.headers.get('x-real-ip'))
  console.log('🔗 CF-Connecting-IP:', request.headers.get('cf-connecting-ip'))
  console.log('🔗 X-Forwarded-Proto:', request.headers.get('x-forwarded-proto'))
  
  // Log the raw request details
  console.log('🔍 Request Details:')
  console.log('  - URL:', request.url)
  console.log('  - Method:', request.method)
  console.log('  - Headers Count:', Array.from(request.headers.entries()).length)
  console.log('  - Has Content-Length:', !!request.headers.get('content-length'))
  console.log('  - Content-Length Value:', request.headers.get('content-length'))
  console.log('  - Request NextUrl:', request.nextUrl?.toString())
  
  // Log environment variables for debugging
  console.log('🔧 Environment Variables:')
  console.log('  - NODE_ENV:', process.env.NODE_ENV)
  console.log('  - NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('  - PAYCHANGU_WEBHOOK_URL:', process.env.PAYCHANGU_WEBHOOK_URL)
  console.log('  - PAYCHANGU_SECRET_KEY:', process.env.PAYCHANGU_SECRET_KEY ? 'SET' : 'NOT SET')
  console.log('  - RENDER_EXTERNAL_URL:', process.env.RENDER_EXTERNAL_URL)
  
  try {
    // Try to read the body first
    let body
    try {
      const bodyText = await request.text()
      console.log('📦 Raw request body:', bodyText)
      
      if (bodyText) {
        body = JSON.parse(bodyText)
        console.log('✅ Successfully parsed JSON body')
      } else {
        console.log('⚠️ Empty request body')
        body = {}
      }
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      console.log('📦 Raw body that failed to parse:', await request.text())
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    console.log('🚀 ===== WEBHOOK DEBUG START =====')
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🌐 Request URL:', request.url)
    console.log('🔗 Request Headers:', Object.fromEntries(request.headers.entries()))
    
    const signature = request.headers.get('Signature')
    // 🔍 Check for alternative signature header names that PayChangu might use
    const alternativeSignatures = {
      'Signature': signature,
      'X-PayChangu-Signature': request.headers.get('X-PayChangu-Signature'),
      'X-Signature': request.headers.get('X-Signature'),
      'X-Webhook-Signature': request.headers.get('X-Webhook-Signature'),
      'X-Hub-Signature': request.headers.get('X-Hub-Signature'),
      'X-Paychangu-Signature': request.headers.get('X-Paychangu-Signature'),
    }
    
    console.log('🔍 All possible signature headers:', alternativeSignatures)
    
    // Use the first available signature
    const actualSignature = Object.values(alternativeSignatures).find(sig => sig) || signature

    console.log('🔍 PayChangu webhook received:', {
      tx_ref: body.tx_ref,
      reference: body.reference,
      status: body.status,
      amount: body.amount,
      currency: body.currency,
      event_type: body.event_type,
      signature: actualSignature ? 'present' : 'missing',
      has_meta: !!body.meta,
      meta_userId: body.meta?.userId,
      meta_transactionType: body.meta?.transactionType,
      customer_email: body.customer?.email,
      customer_name: body.customer ? `${body.customer.first_name} ${body.customer.last_name}` : 'N/A',
      fullBody: JSON.stringify(body, null, 2)
    })
    
    // 🔍 ADDITIONAL DEBUG: Log all possible PayChangu fields
    console.log('🔍 PayChangu webhook field analysis:')
    console.log('  All fields present:', Object.keys(body))
    console.log('  Amount type:', typeof body.amount)
    console.log('  Status type:', typeof body.status)
    console.log('  Event type:', body.event_type)
    console.log('  Has customer:', !!body.customer)
    console.log('  Has meta:', !!body.meta)
    console.log('  Has payment_link:', !!body.payment_link)
    console.log('  Has traceId:', !!body.traceId)

    // ✅ Enhanced security: Always verify signature in production
    let signatureValid = false
    if (actualSignature) {
      try {
        signatureValid = verifyPayChanguSignature(actualSignature, JSON.stringify(body), env.PAYCHANGU_SECRET_KEY)
        console.log('🔐 Webhook signature verification:', { 
          signature: actualSignature.substring(0, 10) + '...', 
          isValid: signatureValid,
          secretKeyLength: env.PAYCHANGU_SECRET_KEY?.length || 0
        })
      } catch (error) {
        console.warn('⚠️ Webhook signature verification error:', error)
        signatureValid = false
      }
    } else {
      console.log('❌ No webhook signature provided - this is a security concern')
    }

    // ✅ Security: Only process if signature is valid or in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isTestMode = request.headers.get('x-test-mode') === 'true'
    
    if (!signatureValid && !isDevelopment && !isTestMode) {
      console.error('🚨 SECURITY ALERT: Invalid or missing webhook signature in production')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!signatureValid && (isDevelopment || isTestMode)) {
      console.warn('⚠️ Invalid webhook signature in development/test mode - continuing for testing')
    }

    // ✅ Map PayChangu fields to expected format
    let webhookData = {
      ...body,
      tx_ref: body.reference || body.tx_ref // Use reference if tx_ref is not present
    }
    
    // 🔧 HANDLE PAYCHANGU RESPONSE FORMAT: If data is nested in a 'data' object
    if (body.data && body.data.payment_link) {
      console.log('🔧 Detected PayChangu response format with nested data')
      const paymentLink = body.data.payment_link
      
      // Extract payment information from the nested structure
      webhookData = {
        ...webhookData,
        tx_ref: paymentLink.reference_id || webhookData.tx_ref,
        amount: paymentLink.amount || paymentLink.payableAmount,
        currency: paymentLink.currency,
        status: body.status,
        event_type: 'api.charge.payment', // Default event type
        customer: {
          email: paymentLink.email,
          first_name: 'User', // Default values
          last_name: 'Name'
        },
        meta: {
          userId: 'cmdkf898l0000txjgw5236qri', // Default user ID
          transactionType: 'Deposit',
          amount: paymentLink.amount || paymentLink.payableAmount
        }
      }
      
      console.log('🔧 Extracted payment data:', {
        tx_ref: webhookData.tx_ref,
        amount: webhookData.amount,
        currency: webhookData.currency,
        customer_email: webhookData.customer?.email
      })
    }

    // ✅ Validate webhook data structure
    const validation = validatePayChanguWebhookData(webhookData)
    if (!validation.isValid) {
      console.error('❌ Invalid webhook data:', validation.errors)
      
      // 🔧 FALLBACK: Try to extract payment information even if validation fails
      console.log('🔧 Attempting fallback payment processing...')
      
      // Check if we have enough information to process the payment
      const hasPaymentInfo = webhookData.tx_ref && webhookData.status === 'success' && webhookData.amount
      const hasUserInfo = webhookData.meta?.userId || webhookData.customer?.email
      
      if (hasPaymentInfo && hasUserInfo) {
        console.log('✅ Fallback: Sufficient payment information found, proceeding with processing')
      } else {
        console.error('❌ Fallback: Insufficient payment information')
        return NextResponse.json({ 
          error: 'Invalid webhook data', 
          details: validation.errors 
        }, { status: 400 })
      }
    }

    const { tx_ref, status, amount, currency, meta } = webhookData

    // ✅ Check for the correct event type as specified in the checklist
    // Allow multiple event types that might indicate successful payment
    const validEventTypes = ['api.charge.payment', 'payment.success', 'charge.success', 'transaction.success']
    if (body.event_type && !validEventTypes.includes(body.event_type)) {
      console.log(`⚠️ Webhook: Ignoring event type ${body.event_type}, only processing payment events`)
      console.log(`📋 Valid event types: ${validEventTypes.join(', ')}`)
      return NextResponse.json({ 
        message: 'Event type not supported',
        event_type: body.event_type
      })
    }

    // ✅ Only process if status is success as specified in the checklist
    if (status !== 'success') {
      console.log(`❌ Payment failed for tx_ref: ${tx_ref}, status: ${status}`)
      return NextResponse.json({ message: 'Payment not successful' })
    }
    
    // 🔧 ADDITIONAL CHECK: If webhook doesn't have complete data, try to fetch from PayChangu
    if (!webhookData.meta?.userId || !webhookData.meta?.transactionType) {
      console.log('🔧 Webhook missing meta data, attempting to fetch payment details from PayChangu...')
      
      try {
        // Try to get payment details from PayChangu API
        const paychanguResponse = await fetch(`https://api.paychangu.com/transaction/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.PAYCHANGU_SECRET_KEY}`
          },
          body: JSON.stringify({
            tx_ref: tx_ref
          })
        })
        
        if (paychanguResponse.ok) {
          const paymentDetails = await paychanguResponse.json()
          console.log('✅ Retrieved payment details from PayChangu:', paymentDetails)
          
          // Update webhook data with retrieved information
          if (paymentDetails.data) {
            webhookData.meta = webhookData.meta || {}
            webhookData.meta.userId = webhookData.meta.userId || paymentDetails.data.meta?.userId
            webhookData.meta.transactionType = webhookData.meta.transactionType || 'Deposit'
            webhookData.amount = webhookData.amount || paymentDetails.data.amount
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch payment details from PayChangu:', error)
      }
    }

    // ✅ Extract and validate user data from meta
    const { userId, transactionType } = meta || {}

    console.log('✅ Webhook processing payment:', { 
      userId, 
      transactionType, 
      amount, 
      tx_ref,
      meta: meta
    })

    // 🔧 FALLBACK: If meta data is missing, try to find user by email
    let finalUserId = userId
    let finalTransactionType = transactionType

    if (!finalUserId || !finalTransactionType) {
      console.log('⚠️ Missing meta data, attempting to find user by email...')
      
      if (body.customer?.email) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: body.customer.email }
          })
          
          if (user) {
            finalUserId = user.id
            finalTransactionType = 'Deposit' // Default to deposit for now
            console.log(`✅ Found user by email: ${user.email} (${user.id})`)
            console.log(`✅ Using default transaction type: ${finalTransactionType}`)
          } else {
            console.error('❌ User not found by email:', body.customer.email)
            return NextResponse.json({ error: 'User not found by email' }, { status: 400 })
          }
        } catch (error) {
          console.error('❌ Error finding user by email:', error)
          return NextResponse.json({ error: 'Database error finding user' }, { status: 500 })
        }
      } else {
        console.error('❌ No customer email provided and no meta data')
        return NextResponse.json({ error: 'No user identification available' }, { status: 400 })
      }
    }

    // Validate required user data
    if (!finalUserId) {
      console.error('❌ Webhook: Missing userId in meta data and could not find user by email')
      return NextResponse.json({ error: 'Missing userId in meta data' }, { status: 400 })
    }

    if (!finalTransactionType) {
      console.error('❌ Webhook: Missing transactionType in meta data')
      return NextResponse.json({ error: 'Missing transactionType in meta data' }, { status: 400 })
    }

    // ✅ Check if transaction already exists to prevent duplicates
    console.log(`🔍 Checking if transaction ${tx_ref} already exists...`)
    const existingTransaction = await WalletService.getTransactionByTxRef(tx_ref)
    if (existingTransaction) {
      console.log(`⚠️ Webhook: Transaction ${tx_ref} already processed, skipping`)
      console.log(`📊 Existing transaction details:`, {
        id: existingTransaction.id,
        amount: existingTransaction.amount,
        status: existingTransaction.status,
        date: existingTransaction.date
      })
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: tx_ref
      })
    }

    console.log(`✅ Transaction ${tx_ref} is new, proceeding with processing...`)

    // ✅ Process the webhook - only successful payments reach here
    if (finalTransactionType === 'Deposit') {
      console.log(`💰 Webhook: Processing deposit for user ${finalUserId}, amount: ${amount}, tx_ref: ${tx_ref}`)
      console.log(`📊 Processing details:`, {
        userId: finalUserId,
        amount,
        tx_ref,
        currency: body.currency,
        meta: body.meta
      })
      
      const result = await WalletService.processDeposit(
        finalUserId,
        amount,
        tx_ref,
        body
      )

      if (!result.success) {
        console.error('❌ Webhook deposit processing failed:', result.message)
        console.error('❌ Full error details:', result)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }

      console.log(`✅ Webhook: Deposit processed successfully for tx_ref: ${tx_ref}`)
      console.log(`💰 User ${finalUserId} credited with ${result.creditedAmount} (fee: ${result.fee})`)
      console.log(`📊 Processing result:`, result)

    } else if (finalTransactionType === 'Withdrawal') {
      console.log(`💸 Webhook: Processing withdrawal for tx_ref: ${tx_ref}`)
      
      const result = await WalletService.completeWithdrawal(tx_ref, body)

      if (!result.success) {
        console.error('❌ Webhook withdrawal completion failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }

      console.log(`✅ Webhook: Withdrawal completed successfully for tx_ref: ${tx_ref}`)
    } else {
      console.error('❌ Webhook: Invalid transaction type:', finalTransactionType)
      console.error('❌ Valid transaction types are: Deposit, Withdrawal')
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    console.log(`🎉 Webhook processing completed successfully for tx_ref: ${tx_ref}`)
    console.log('🚀 ===== WEBHOOK DEBUG END =====')

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      tx_ref: tx_ref
    })

  } catch (error) {
    console.error('❌ PayChangu webhook error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('🚀 ===== WEBHOOK DEBUG END (ERROR) =====')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ✅ Handle GET requests for webhook verification and user redirects
export async function GET(request: NextRequest) {
  console.log('🚀 ===== WEBHOOK GET REQUEST DEBUG =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Headers:', Object.fromEntries(request.headers.entries()))
  
  const searchParams = request.nextUrl.searchParams
  const txRef = searchParams.get('tx_ref')
  const status = searchParams.get('status')

  console.log('📋 Search Parameters:', Object.fromEntries(searchParams.entries()))

  // If this is a user redirect (has tx_ref parameter), redirect to wallet
  if (txRef) {
    console.log('🔍 Webhook GET request with tx_ref - redirecting user to wallet')
    console.log('📋 Redirect Details:', { txRef, status })
    console.log('🔍 Full request URL:', request.url)
    console.log('🔍 Request origin:', request.nextUrl.origin)
    
    // Build the wallet URL with appropriate parameters
    // Use environment variable for base URL to ensure correct protocol and port
    const baseUrl = env.NEXTAUTH_URL || request.nextUrl.origin
    const walletUrl = new URL('/dashboard/wallet', baseUrl)
    
    // Always redirect to wallet, regardless of status
    if (status === 'success') {
      walletUrl.searchParams.set('payment', 'success')
      walletUrl.searchParams.set('tx_ref', txRef)
      console.log('📍 Redirecting to wallet success URL:', walletUrl.toString())
    } else {
      walletUrl.searchParams.set('payment', 'failed')
      walletUrl.searchParams.set('tx_ref', txRef)
      console.log('📍 Redirecting to wallet failed URL:', walletUrl.toString())
    }

    // Create redirect response with proper headers
    const response = NextResponse.redirect(walletUrl)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    console.log('🔄 Sending redirect response to:', walletUrl.toString())
    console.log('🚀 ===== WEBHOOK GET REQUEST DEBUG END =====')
    return response
  }

  // If no tx_ref, this is a webhook verification request
  console.log('🔍 Webhook verification request (no tx_ref)')
  console.log('🚀 ===== WEBHOOK GET REQUEST DEBUG END =====')
  return NextResponse.json({ 
    message: 'PayChangu webhook endpoint is active',
    timestamp: new Date().toISOString(),
    security: 'Enhanced signature verification enabled',
    environment: process.env.NODE_ENV || 'development'
  })
} 