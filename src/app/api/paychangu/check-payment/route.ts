import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🔍 ===== PAYMENT STATUS CHECK =====')
  
  try {
    const body = await request.json()
    const { txRef, userId } = body
    
    if (!txRef) {
      return NextResponse.json({ error: 'Missing txRef' }, { status: 400 })
    }
    
    console.log('🔍 Checking payment status for:', { txRef, userId })
    
    // Check if transaction already exists in our database
    const existingTransaction = await WalletService.getTransactionByTxRef(txRef)
    
    if (existingTransaction) {
      console.log('✅ Transaction already processed:', existingTransaction)
      return NextResponse.json({
        message: 'Transaction already processed',
        transaction: existingTransaction,
        status: 'completed'
      })
    }
    
    // If no transaction exists, we need to check with PayChangu
    // For now, we'll simulate a successful payment check
    // In a real implementation, you would call PayChangu's API to check payment status
    
    console.log('⚠️ Transaction not found in database, checking with PayChangu...')
    
    // Simulate PayChangu API call to check payment status
    // Replace this with actual PayChangu API call
    const paymentStatus = {
      status: 'success',
      amount: 1700,
      currency: 'MWK',
      tx_ref: txRef
    }
    
    if (paymentStatus.status === 'success') {
      console.log('✅ Payment confirmed by PayChangu, processing...')
      
      // Process the payment
      const result = await WalletService.processDeposit(
        userId || 'cmdkf898l0000txjgw5236qri',
        paymentStatus.amount,
        txRef,
        paymentStatus
      )
      
      if (!result.success) {
        console.error('❌ Payment processing failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }
      
      console.log('✅ Payment processed successfully:', result)
      
      return NextResponse.json({
        message: 'Payment processed successfully',
        result,
        status: 'completed'
      })
    } else {
      console.log('❌ Payment not successful:', paymentStatus.status)
      return NextResponse.json({
        message: 'Payment not successful',
        status: paymentStatus.status
      })
    }
    
  } catch (error) {
    console.error('❌ Payment status check error:', error)
    return NextResponse.json({ 
      error: 'Payment status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const txRef = searchParams.get('tx_ref')
  const userId = searchParams.get('user_id')
  
  if (!txRef) {
    return NextResponse.json({ error: 'Missing tx_ref parameter' }, { status: 400 })
  }
  
  console.log('🔍 GET payment status check for:', { txRef, userId })
  
  try {
    const existingTransaction = await WalletService.getTransactionByTxRef(txRef)
    
    if (existingTransaction) {
      return NextResponse.json({
        message: 'Transaction found',
        transaction: existingTransaction,
        status: 'completed'
      })
    } else {
      return NextResponse.json({
        message: 'Transaction not found',
        status: 'pending'
      })
    }
  } catch (error) {
    console.error('❌ Payment status check error:', error)
    return NextResponse.json({ error: 'Payment status check failed' }, { status: 500 })
  }
} 