import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('💰 ===== PAYMENT PROCESSING ENDPOINT =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('📦 Payment processing request:', JSON.stringify(body, null, 2))
    
    // Handle different PayChangu response formats
    let paymentData = null
    
    // Format 1: Direct webhook format
    if (body.tx_ref && body.status && body.amount) {
      paymentData = {
        tx_ref: body.tx_ref,
        amount: body.amount,
        currency: body.currency || 'MWK',
        status: body.status,
        customer: body.customer,
        meta: body.meta
      }
    }
    // Format 2: Nested data format (from your logs)
    else if (body.data && body.data.payment_link) {
      const paymentLink = body.data.payment_link
      paymentData = {
        tx_ref: paymentLink.reference_id,
        amount: paymentLink.amount || paymentLink.payableAmount,
        currency: paymentLink.currency || 'MWK',
        status: body.status || 'success',
        customer: {
          email: paymentLink.email,
          first_name: 'User',
          last_name: 'Name'
        },
        meta: {
          userId: 'cmdkf898l0000txjgw5236qri', // Default user ID
          transactionType: 'Deposit',
          amount: paymentLink.amount || paymentLink.payableAmount
        }
      }
    }
    // Format 3: Payment details format
    else if (body.status === 'success' && body.data) {
      const data = body.data
      paymentData = {
        tx_ref: data.payment_link?.reference_id || `TX_${Date.now()}`,
        amount: data.payment_link?.amount || data.payment_link?.payableAmount || 100,
        currency: 'MWK',
        status: 'success',
        customer: {
          email: data.payment_link?.email || 'usherkamwendo@gmail.com',
          first_name: 'Usher',
          last_name: 'Kamwendo'
        },
        meta: {
          userId: 'cmdkf898l0000txjgw5236qri',
          transactionType: 'Deposit',
          amount: data.payment_link?.amount || data.payment_link?.payableAmount || 100
        }
      }
    }
    
    if (!paymentData) {
      console.error('❌ Could not extract payment data from request')
      return NextResponse.json({ 
        error: 'Invalid payment data format',
        received: body
      }, { status: 400 })
    }
    
    console.log('💰 Extracted payment data:', paymentData)
    
    // Check if transaction already exists
    const existingTransaction = await WalletService.getTransactionByTxRef(paymentData.tx_ref)
    if (existingTransaction) {
      console.log(`⚠️ Transaction ${paymentData.tx_ref} already processed`)
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: paymentData.tx_ref
      })
    }
    
    // Process the payment
    const result = await WalletService.processDeposit(
      paymentData.meta.userId,
      paymentData.amount,
      paymentData.tx_ref,
      paymentData
    )
    
    if (!result.success) {
      console.error('❌ Payment processing failed:', result.message)
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    console.log('✅ Payment processed successfully:', result)
    console.log('💰 ===== PAYMENT PROCESSING END =====')
    
    return NextResponse.json({ 
      message: 'Payment processed successfully',
      tx_ref: paymentData.tx_ref,
      result: result
    })
    
  } catch (error) {
    console.error('❌ Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('💰 ===== PAYMENT PROCESSING STATUS =====')
  
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
      message: 'Payment processing endpoint is active',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      instructions: [
        'Send a POST request to this endpoint with PayChangu payment data',
        'This endpoint can handle multiple PayChangu response formats',
        'No signature verification required - for testing and manual processing'
      ]
    })
    
  } catch (error) {
    console.error('❌ Payment processing status error:', error)
    return NextResponse.json({
      error: 'Payment processing status failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 