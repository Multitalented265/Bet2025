import { NextRequest, NextResponse } from 'next/server'
import { WalletService } from '@/lib/wallet-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK DEBUG =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('📦 Test webhook body:', body)
    
    // Extract test data
    const { userId, amount, txRef, testType = 'Deposit' } = body
    
    if (!userId || !amount || !txRef) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, amount, txRef' 
      }, { status: 400 })
    }
    
    console.log('🧪 Test webhook processing:', { userId, amount, txRef, testType })
    
    // Check if transaction already exists
    const existingTransaction = await WalletService.getTransactionByTxRef(txRef)
    if (existingTransaction) {
      console.log('⚠️ Test transaction already exists:', existingTransaction)
      return NextResponse.json({ 
        message: 'Transaction already processed',
        tx_ref: txRef,
        existing: existingTransaction
      })
    }
    
    // Process the test transaction
    if (testType === 'Deposit') {
      console.log('💰 Processing test deposit...')
      
      const result = await WalletService.processDeposit(
        userId,
        amount,
        txRef,
        { test: true, ...body }
      )
      
      if (!result.success) {
        console.error('❌ Test deposit failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }
      
      console.log('✅ Test deposit successful:', result)
      return NextResponse.json({ 
        message: 'Test deposit processed successfully',
        result
      })
      
    } else if (testType === 'Withdrawal') {
      console.log('💸 Processing test withdrawal...')
      
      const result = await WalletService.completeWithdrawal(txRef, body)
      
      if (!result.success) {
        console.error('❌ Test withdrawal failed:', result.message)
        return NextResponse.json({ error: result.message }, { status: 400 })
      }
      
      console.log('✅ Test withdrawal successful:', result)
      return NextResponse.json({ 
        message: 'Test withdrawal processed successfully',
        result
      })
    }
    
    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK STATUS =====')
  
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const transactionCount = await prisma.transaction.count()
    
    console.log('📊 Database status:', { userCount, transactionCount })
    
  return NextResponse.json({
      message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
      database: {
        users: userCount,
        transactions: transactionCount
      },
      environment: process.env.NODE_ENV || 'development'
    })
    
  } catch (error) {
    console.error('❌ Test webhook status error:', error)
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 