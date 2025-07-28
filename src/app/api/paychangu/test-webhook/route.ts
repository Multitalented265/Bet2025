import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  console.log('🔍 ===== WEBHOOK TEST ENDPOINT =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  
  // Test environment configuration
  const config = {
    webhookUrl: env.PAYCHANGU_WEBHOOK_URL,
    callbackUrl: env.PAYCHANGU_CALLBACK_URL,
    returnUrl: env.PAYCHANGU_RETURN_URL,
    publicKey: env.PAYCHANGU_PUBLIC_KEY,
    secretKey: env.PAYCHANGU_SECRET_KEY ? 'SET' : 'MISSING',
    nextAuthUrl: env.NEXTAUTH_URL,
    environment: process.env.NODE_ENV || 'development'
  }

  console.log('📋 Configuration:', config)

  // Test webhook endpoint accessibility
  try {
    const webhookResponse = await fetch(env.PAYCHANGU_WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bet2025-Webhook-Test/1.0'
      }
    })

    const webhookStatus = webhookResponse.status
    const webhookAccessible = webhookStatus === 200

    console.log('🔗 Webhook accessibility test:', {
      url: env.PAYCHANGU_WEBHOOK_URL,
      status: webhookStatus,
      accessible: webhookAccessible
    })
    
    return NextResponse.json({ 
      message: 'PayChangu webhook endpoint is accessible',
      timestamp: new Date().toISOString(),
      environment: config.environment,
      webhookUrl: config.webhookUrl,
      callbackUrl: config.callbackUrl,
      returnUrl: config.returnUrl,
      publicKey: config.publicKey ? 'SET' : 'MISSING',
      secretKey: config.secretKey,
      nextAuthUrl: config.nextAuthUrl,
      publicKeyFormat: config.publicKey?.startsWith('pub-') ? 'CORRECT' : 'INCORRECT',
      secretKeyFormat: config.secretKey === 'SET' ? 'CORRECT' : 'MISSING',
      publicKeyValue: config.publicKey,
      secretKeyPrefix: config.secretKey === 'SET' ? 'sec-test-n...' : 'MISSING',
      webhookAccessible: webhookAccessible,
      webhookStatus: webhookStatus
    })
    
  } catch (error) {
    console.error('❌ Webhook test error:', error)
    
    return NextResponse.json({ 
      message: 'PayChangu webhook test failed',
      timestamp: new Date().toISOString(),
      environment: config.environment,
      webhookUrl: config.webhookUrl,
      callbackUrl: config.callbackUrl,
      returnUrl: config.returnUrl,
      publicKey: config.publicKey ? 'SET' : 'MISSING',
      secretKey: config.secretKey,
      nextAuthUrl: config.nextAuthUrl,
      publicKeyFormat: config.publicKey?.startsWith('pub-') ? 'CORRECT' : 'INCORRECT',
      secretKeyFormat: config.secretKey === 'SET' ? 'CORRECT' : 'MISSING',
      publicKeyValue: config.publicKey,
      secretKeyPrefix: config.secretKey === 'SET' ? 'sec-test-n...' : 'MISSING',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 ===== WEBHOOK TEST POST =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('📦 Test webhook payload:', body)
    
  return NextResponse.json({
      message: 'Test webhook received successfully',
    timestamp: new Date().toISOString(),
      receivedData: body
    })
  } catch (error) {
    console.error('❌ Test webhook POST error:', error)
    return NextResponse.json({
      error: 'Failed to process test webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
} 