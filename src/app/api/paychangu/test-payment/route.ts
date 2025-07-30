import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🧪 ===== TEST PAYMENT PROCESSING =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('📦 Test payment body:', JSON.stringify(body, null, 2))
    
    // Simulate a successful PayChangu payment
    const testPaymentData = {
      tx_ref: body.data?.payment_link?.reference_id || 'TEST_TX_' + Date.now(),
      amount: body.data?.payment_link?.amount || body.data?.payment_link?.payableAmount || 100,
      currency: 'MWK',
      status: 'success',
      event_type: 'api.charge.payment',
      customer: {
        email: body.data?.payment_link?.email || 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      },
      meta: {
        userId: 'cmdkf898l0000txjgw5236qri',
        transactionType: 'Deposit',
        amount: body.data?.payment_link?.amount || body.data?.payment_link?.payableAmount || 100
      }
    }
    
    console.log('🧪 Processing test payment with data:', testPaymentData)
    
    // Check if transaction already exists
    const existingTransaction = await WalletService.getTransactionByTxRef(testPaymentData.tx_ref)
    if (existingTransaction) {
      console.log(`⚠️ Test payment: Transaction ${testPaymentData.tx_ref} already exists`)
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: testPaymentData.tx_ref
      })
    }
    
    // Process the test payment
    const result = await WalletService.processDeposit(
      testPaymentData.meta.userId,
      testPaymentData.amount,
      testPaymentData.tx_ref,
      testPaymentData
    )
    
    if (!result.success) {
      console.error('❌ Test payment processing failed:', result.message)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    console.log('✅ Test payment processed successfully:', result)
    console.log('🧪 ===== TEST PAYMENT PROCESSING END =====')
    
    return NextResponse.json({ 
      message: 'Test payment processed successfully',
      tx_ref: testPaymentData.tx_ref,
      result: result
    })
    
  } catch (error) {
    console.error('❌ Test payment error:', error)
    return NextResponse.json(
      { error: 'Test payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 ===== TEST PAYMENT STATUS =====')
  
  try {
    // Check database status
    const dbStatus = {
      users: await prisma.user.count(),
      transactions: await prisma.transaction.count(),
      recentTransactions: await prisma.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { user: { select: { email: true, name: true } } }
      })
    }
    
    return NextResponse.json({
      message: 'Test payment endpoint is active',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      instructions: [
        'Send a POST request to this endpoint with PayChangu payment data',
        'This will process the payment without signature verification',
        'Use this for testing payment processing logic'
      ]
    })
    
  } catch (error) {
    console.error('❌ Test payment status error:', error)
    return NextResponse.json({
      error: 'Test payment status failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 