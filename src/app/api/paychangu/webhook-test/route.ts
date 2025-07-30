import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔔 ===== WEBHOOK TEST ENDPOINT RECEIVED =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('📋 Request Method:', request.method)
  
  // Log ALL headers
  const headers = Object.fromEntries(request.headers.entries())
  console.log('🔍 ALL Request Headers:', JSON.stringify(headers, null, 2))
  
  // Log the raw request body
  const rawBody = await request.text()
  console.log('📦 Raw Request Body:', rawBody)
  
  let body
  try {
    body = JSON.parse(rawBody)
    console.log('✅ JSON parsed successfully')
    console.log('📋 Parsed Body:', JSON.stringify(body, null, 2))
  } catch (error) {
    console.error('❌ Failed to parse JSON body:', error)
    console.log('📋 Raw body that failed to parse:', rawBody)
    return NextResponse.json({ 
      error: 'Invalid JSON body',
      received: rawBody
    }, { status: 400 })
  }

  // Log everything about the request
  console.log('🔍 Request Analysis:')
  console.log('  - User Agent:', request.headers.get('user-agent'))
  console.log('  - Content Type:', request.headers.get('content-type'))
  console.log('  - Content Length:', request.headers.get('content-length'))
  console.log('  - Origin:', request.headers.get('origin'))
  console.log('  - Referer:', request.headers.get('referer'))
  console.log('  - Host:', request.headers.get('host'))
  
  // Check for PayChangu specific headers
  const paychanguHeaders = {
    'x-paychangu-signature': request.headers.get('x-paychangu-signature'),
    'paychangu-signature': request.headers.get('paychangu-signature'),
    'signature': request.headers.get('signature'),
    'x-signature': request.headers.get('x-signature'),
    'x-webhook-signature': request.headers.get('x-webhook-signature'),
    'webhook-signature': request.headers.get('webhook-signature'),
    'x-paychangu-event': request.headers.get('x-paychangu-event'),
    'paychangu-event': request.headers.get('paychangu-event')
  }
  
  console.log('🔐 PayChangu Headers Found:', paychanguHeaders)
  
  // Log the body structure
  console.log('📊 Body Structure Analysis:')
  console.log('  - Keys present:', Object.keys(body))
  console.log('  - Has status:', 'status' in body)
  console.log('  - Has tx_ref:', 'tx_ref' in body)
  console.log('  - Has reference:', 'reference' in body)
  console.log('  - Has data:', 'data' in body)
  console.log('  - Has customer:', 'customer' in body)
  console.log('  - Has meta:', 'meta' in body)
  
  if (body.data) {
    console.log('  - Data keys:', Object.keys(body.data))
    if (body.data.payment_link) {
      console.log('  - Payment link keys:', Object.keys(body.data.payment_link))
    }
  }
  
  // Always return success for testing
  console.log('✅ Webhook test endpoint processed successfully')
  
  return NextResponse.json({
    message: 'Webhook test received successfully',
    timestamp: new Date().toISOString(),
    received: {
      headers: headers,
      body: body,
      bodyKeys: Object.keys(body)
    }
  })
}

export async function GET(request: NextRequest) {
  console.log('🔔 ===== WEBHOOK TEST ENDPOINT GET REQUEST =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('📋 Request Method:', request.method)
  
  return NextResponse.json({
    message: 'Webhook test endpoint is accessible',
    timestamp: new Date().toISOString(),
    endpoint: '/api/paychangu/webhook-test',
    instructions: 'Send POST requests to this endpoint to test webhook delivery'
  })
} 