import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK DEBUG =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.json()
    console.log('📦 Test webhook body:', JSON.stringify(body, null, 2))
    
    // Simulate a successful PayChangu webhook response
    const testWebhookData = {
      tx_ref: body.tx_ref || 'TEST_TX_' + Date.now(),
      reference: body.reference || body.tx_ref || 'TEST_TX_' + Date.now(),
      status: 'success',
      amount: body.amount || 100,
      currency: 'MWK',
      event_type: 'api.charge.payment',
      customer: {
        email: body.customer?.email || 'test@example.com',
        first_name: body.customer?.first_name || 'Test',
        last_name: body.customer?.last_name || 'User'
      },
      meta: {
        userId: body.meta?.userId || 'cmdkf898l0000txjgw5236qri',
        transactionType: 'Deposit',
        amount: body.amount || 100
      }
    }
    
    console.log('🧪 Processing test webhook with data:', testWebhookData)
    
    // Check if transaction already exists
    const existingTransaction = await WalletService.getTransactionByTxRef(testWebhookData.tx_ref)
    if (existingTransaction) {
      console.log(`⚠️ Test webhook: Transaction ${testWebhookData.tx_ref} already exists`)
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: testWebhookData.tx_ref
      })
    }
    
    // Process the test webhook
    const result = await WalletService.processDeposit(
      testWebhookData.meta.userId,
      testWebhookData.amount,
      testWebhookData.tx_ref,
      testWebhookData
    )
    
    if (!result.success) {
      console.error('❌ Test webhook processing failed:', result.message)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    console.log('✅ Test webhook processed successfully:', result)
    console.log('🧪 ===== TEST WEBHOOK DEBUG END =====')
    
    return NextResponse.json({ 
      message: 'Test webhook processed successfully',
      tx_ref: testWebhookData.tx_ref,
      result: result
    })
    
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json(
      { error: 'Test webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK GET REQUEST =====')
  
  // Return webhook status and configuration
  return NextResponse.json({
    message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
    webhook_url: 'https://bet2025-2.onrender.com/api/paychangu/webhook',
    test_url: 'https://bet2025-2.onrender.com/api/paychangu/test-webhook',
    instructions: [
      'Send a POST request to this endpoint with payment data',
      'Include tx_ref, amount, customer, and meta fields',
      'This will simulate a PayChangu webhook and process the payment'
    ]
  })
} 