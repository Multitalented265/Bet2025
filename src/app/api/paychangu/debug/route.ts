import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { WalletService } from '@/lib/wallet-service'
import { verifyPayChanguSignature } from '@/lib/paychangu'
import { env } from '@/lib/env'
import crypto from 'crypto'

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
  console.log('🔍 ===== WEBHOOK DEBUG DIAGNOSTIC =====')
  
  try {
    const body = await request.json()
    
    // Check all possible signature headers
    const allHeaders = Object.fromEntries(request.headers.entries())
    const signatureHeaders = {
      'Signature': request.headers.get('Signature'),
      'X-PayChangu-Signature': request.headers.get('X-PayChangu-Signature'),
      'X-Signature': request.headers.get('X-Signature'),
      'X-Webhook-Signature': request.headers.get('X-Webhook-Signature'),
      'X-Hub-Signature': request.headers.get('X-Hub-Signature'),
      'X-Paychangu-Signature': request.headers.get('X-Paychangu-Signature'),
    }
    
    // Find the actual signature
    const actualSignature = Object.values(signatureHeaders).find(sig => sig)
    
    // Test signature verification with different data formats
    const testResults = {
      environment: process.env.NODE_ENV || 'development',
      secretKeyExists: !!env.PAYCHANGU_SECRET_KEY,
      secretKeyLength: env.PAYCHANGU_SECRET_KEY?.length || 0,
      secretKeyPrefix: env.PAYCHANGU_SECRET_KEY?.substring(0, 4) || 'N/A',
      allHeaders,
      signatureHeaders,
      actualSignature: actualSignature ? `${actualSignature.substring(0, 10)}...` : 'MISSING',
      bodyKeys: Object.keys(body),
      bodyStringified: JSON.stringify(body),
      bodyStringifiedLength: JSON.stringify(body).length,
    }
    
    // Test signature verification if we have a signature
    if (actualSignature && env.PAYCHANGU_SECRET_KEY) {
      try {
        // Test 1: Standard JSON.stringify
        const test1 = verifyPayChanguSignature(actualSignature, JSON.stringify(body), env.PAYCHANGU_SECRET_KEY)
        
        // Test 2: Compact JSON (no spaces)
        const test2 = verifyPayChanguSignature(actualSignature, JSON.stringify(body, null, 0), env.PAYCHANGU_SECRET_KEY)
        
        // Test 3: Raw body as string
        const test3 = verifyPayChanguSignature(actualSignature, body.toString(), env.PAYCHANGU_SECRET_KEY)
        
        // Test 4: Manual HMAC creation for comparison
        const manualSignature = crypto
          .createHmac('sha256', env.PAYCHANGU_SECRET_KEY)
          .update(JSON.stringify(body))
          .digest('hex')
        
        testResults.signatureTests = {
          test1_standardJSON: test1,
          test2_compactJSON: test2,
          test3_rawBody: test3,
          manualSignature: manualSignature,
          signatureMatchesManual: actualSignature === manualSignature,
          signatureLength: actualSignature.length,
          manualSignatureLength: manualSignature.length,
        }
      } catch (error) {
        testResults.signatureError = error.message
      }
    }
    
    console.log('🔍 Debug results:', testResults)
    
    return NextResponse.json({
      message: 'Webhook debug diagnostic completed',
      timestamp: new Date().toISOString(),
      results: testResults
    })
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error.message 
    }, { status: 500 })
  }
} 