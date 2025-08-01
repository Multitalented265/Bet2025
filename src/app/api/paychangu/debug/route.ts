import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  console.log('🔍 ===== WEBHOOK DEBUG STATUS =====')
  
  try {
    // Check environment variables
    const envStatus = {
      PAYCHANGU_WEBHOOK_URL: env.PAYCHANGU_WEBHOOK_URL,
      PAYCHANGU_CALLBACK_URL: env.PAYCHANGU_CALLBACK_URL,
      PAYCHANGU_RETURN_URL: env.PAYCHANGU_RETURN_URL,
      PAYCHANGU_PUBLIC_KEY: env.PAYCHANGU_PUBLIC_KEY ? 'SET' : 'MISSING',
      PAYCHANGU_SECRET_KEY: env.PAYCHANGU_SECRET_KEY ? 'SET' : 'MISSING',
      NEXTAUTH_URL: env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
    
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
    
    // Check webhook accessibility
    const webhookUrl = env.PAYCHANGU_WEBHOOK_URL
    const webhookAccessible = webhookUrl && webhookUrl.includes('onrender.com')
    
    console.log('📊 Debug status collected')
    
    return NextResponse.json({
      message: 'Webhook debug status',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: dbStatus,
      webhook: {
        url: webhookUrl,
        accessible: webhookAccessible,
        test_url: 'https://bet2025-2.onrender.com/api/paychangu/test-webhook'
      },
      instructions: [
        '1. Check if PayChangu is sending webhooks to the correct URL',
        '2. Verify the webhook signature is being sent correctly',
        '3. Check if the event_type is "api.charge.payment"',
        '4. Verify meta data contains userId and transactionType',
        '5. Test with the test webhook endpoint'
      ]
    })
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 ===== WEBHOOK DEBUG TEST =====')
  
  try {
    const body = await request.json()
    console.log('📦 Debug test body:', JSON.stringify(body, null, 2))
    
    // Simulate webhook processing steps
    const debugSteps = {
      step1: 'Body received and parsed',
      step2: body.tx_ref ? 'tx_ref found' : 'tx_ref missing',
      step3: body.status ? 'status found' : 'status missing',
      step4: body.event_type ? 'event_type found' : 'event_type missing',
      step5: body.meta ? 'meta found' : 'meta missing',
      step6: body.meta?.userId ? 'userId found' : 'userId missing',
      step7: body.meta?.transactionType ? 'transactionType found' : 'transactionType missing',
      step8: body.status === 'success' ? 'status is success' : 'status is not success',
      step9: body.event_type === 'api.charge.payment' ? 'correct event_type' : 'incorrect event_type'
    }
    
    return NextResponse.json({
      message: 'Debug test completed',
      timestamp: new Date().toISOString(),
      received_data: body,
      debug_steps: debugSteps,
      recommendations: Object.entries(debugSteps)
        .filter(([_, status]) => status.includes('missing') || status.includes('incorrect'))
        .map(([step, status]) => `Fix ${step}: ${status}`)
    })
    
  } catch (error) {
    console.error('❌ Debug test error:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 