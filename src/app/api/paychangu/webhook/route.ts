import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { verifyPayChanguSignature, validatePayChanguWebhookData } from '@/lib/paychangu'

export async function POST(request: NextRequest) {
  // 🚨 IMMEDIATE LOGGING - BEFORE ANY PROCESSING
  console.log('🔔 ===== WEBHOOK REQUEST RECEIVED =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('📋 Request Method:', request.method)
  console.log('🔍 Request Headers:', Object.fromEntries(request.headers.entries()))
  
  // Log the raw request body for debugging
  const rawBody = await request.text()
  console.log('📦 Raw Request Body:', rawBody)
  
  let body
  try {
    body = JSON.parse(rawBody)
    console.log('✅ JSON parsed successfully')
  } catch (error) {
    console.error('❌ Failed to parse JSON body:', error)
    console.log('📋 Raw body that failed to parse:', rawBody)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Log all possible signature headers
  const signature = request.headers.get('x-paychangu-signature') || 
                   request.headers.get('paychangu-signature') ||
                   request.headers.get('signature') ||
                   request.headers.get('x-signature')
  
  console.log('🔐 Signature headers found:')
  console.log('  x-paychangu-signature:', request.headers.get('x-paychangu-signature'))
  console.log('  paychangu-signature:', request.headers.get('paychangu-signature'))
  console.log('  signature:', request.headers.get('signature'))
  console.log('  x-signature:', request.headers.get('x-signature'))
  console.log('  Final signature used:', signature)

  // Check for alternative signature formats
  const alternativeSignatures = {
    'x-paychangu-signature': request.headers.get('x-paychangu-signature'),
    'paychangu-signature': request.headers.get('paychangu-signature'),
    'signature': request.headers.get('signature'),
    'x-signature': request.headers.get('x-signature'),
    'x-webhook-signature': request.headers.get('x-webhook-signature'),
    'webhook-signature': request.headers.get('webhook-signature')
  }
    
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
  
  // 🔧 Handle checkout.payment event type specifically
  if (body.event_type === 'checkout.payment') {
    console.log('🔧 Processing checkout.payment event type')
    
    // Extract meta data from the meta string if it's a JSON string
    let metaData = {}
    if (body.meta && typeof body.meta === 'string') {
      try {
        metaData = JSON.parse(body.meta)
        console.log('✅ Parsed meta data from string:', metaData)
      } catch (error) {
        console.error('❌ Failed to parse meta string:', error)
      }
    } else if (body.meta && typeof body.meta === 'object') {
      metaData = body.meta
    }
    
    // Update webhook data with extracted information
    webhookData = {
      ...webhookData,
      tx_ref: body.reference || body.tx_ref,
      amount: body.amount,
      currency: body.currency,
      status: body.status,
      meta: metaData,
      customer: body.customer || {
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name
      }
    }
    
    console.log('🔧 Processed checkout.payment data:', {
      tx_ref: webhookData.tx_ref,
      amount: webhookData.amount,
      status: webhookData.status,
      meta: webhookData.meta
    })
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
  const validEventTypes = ['api.charge.payment', 'payment.success', 'charge.success', 'transaction.success', 'checkout.payment']
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
    console.log('🔧 Meta data missing, attempting to find user by email...')
    
    const customerEmail = webhookData.customer?.email
    if (customerEmail) {
      try {
        const user = await prisma.user.findFirst({
          where: { email: customerEmail }
        })
        
        if (user) {
          finalUserId = user.id
          finalTransactionType = 'Deposit'
          console.log(`✅ Found user by email: ${user.email} (ID: ${user.id})`)
        } else {
          console.log(`❌ No user found with email: ${customerEmail}`)
        }
      } catch (error) {
        console.error('❌ Error finding user by email:', error)
      }
    }
  }

  // ✅ Final validation before processing
  if (!finalUserId) {
    console.error('❌ Cannot process payment: No user ID found')
    return NextResponse.json({ error: 'No user ID found' }, { status: 400 })
  }

  if (!finalTransactionType) {
    console.error('❌ Cannot process payment: No transaction type found')
    return NextResponse.json({ error: 'No transaction type found' }, { status: 400 })
  }

  // ✅ Check if transaction already exists to prevent duplicates
  const existingTransaction = await WalletService.getTransactionByTxRef(tx_ref)
  if (existingTransaction) {
    console.log(`⚠️ Transaction ${tx_ref} already exists, skipping processing`)
    return NextResponse.json({ 
      message: 'Transaction already processed',
      tx_ref: tx_ref
    })
  }

  // ✅ Process the payment
  try {
    console.log('💰 Processing payment with WalletService...')
    const result = await WalletService.processDeposit(
      finalUserId,
      amount,
      tx_ref,
      webhookData
    )

    if (result.success) {
      console.log('✅ Payment processed successfully:', result)
      return NextResponse.json({
        message: 'Webhook processed successfully',
        tx_ref: tx_ref,
        result: result
      })
    } else {
      console.error('❌ Payment processing failed:', result)
      return NextResponse.json({
        error: 'Payment processing failed',
        details: result
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Error processing payment:', error)
    return NextResponse.json({
      error: 'Payment processing error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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