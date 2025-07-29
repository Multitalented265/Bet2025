import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { WalletService } from '@/lib/wallet-service'

export async function GET(request: NextRequest) {
  console.log('🔍 ===== DEBUG ENDPOINT =====')
  
  try {
    // Get database stats
    const userCount = await prisma.user.count()
    const transactionCount = await prisma.transaction.count()
    
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    // Get user with email usherkamwendo@gmail.com
    const testUser = await prisma.user.findUnique({
      where: { email: 'usherkamwendo@gmail.com' }
    })
    
    console.log('📊 Debug data collected')
    
    return NextResponse.json({
      message: 'Debug endpoint active',
      timestamp: new Date().toISOString(),
      database: {
        users: userCount,
        transactions: transactionCount,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount.toString(),
          fee: t.fee.toString(),
          status: t.status,
          txRef: t.txRef,
          date: t.date,
          user: t.user
        }))
      },
      testUser: testUser ? {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        balance: testUser.balance.toString()
      } : null,
      environment: process.env.NODE_ENV || 'development'
    })
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 ===== DEBUG TEST TRANSACTION =====')
  
  try {
    const body = await request.json()
    const { userId, amount, txRef } = body
    
    if (!userId || !amount || !txRef) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, amount, txRef' 
      }, { status: 400 })
    }
    
    console.log('🧪 Testing transaction processing:', { userId, amount, txRef })
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    
    console.log('✅ User found:', { id: user.id, name: user.name, email: user.email, balance: user.balance.toString() })
    
    // Check if transaction already exists
    const existingTransaction = await WalletService.getTransactionByTxRef(txRef)
    if (existingTransaction) {
      return NextResponse.json({ 
        message: 'Transaction already exists',
        transaction: existingTransaction
      })
    }
    
    // Process test transaction
    const result = await WalletService.processDeposit(userId, amount, txRef, { test: true })
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    console.log('✅ Test transaction successful:', result)
    console.log('💰 Updated balance:', updatedUser?.balance.toString())
    
    return NextResponse.json({
      message: 'Test transaction successful',
      result,
      userBefore: {
        id: user.id,
        balance: user.balance.toString()
      },
      userAfter: {
        id: updatedUser?.id,
        balance: updatedUser?.balance.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ Debug test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 