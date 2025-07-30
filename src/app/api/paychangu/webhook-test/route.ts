import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔔 ===== WEBHOOK TEST ENDPOINT HIT =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 All Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    // Try to read the body
    const bodyText = await request.text()
    console.log('📦 Raw request body:', bodyText)
    
    let body = {}
    if (bodyText) {
      try {
        body = JSON.parse(bodyText)
        console.log('✅ Successfully parsed JSON body')
      } catch (parseError) {
        console.log('⚠️ Failed to parse JSON, treating as text')
        body = { rawText: bodyText }
      }
    } else {
      console.log('⚠️ Empty request body')
    }
    
    console.log('📋 Parsed body:', body)
    
    // Log all possible signature headers
    const signatureHeaders = {
      'Signature': request.headers.get('Signature'),
      'X-PayChangu-Signature': request.headers.get('X-PayChangu-Signature'),
      'X-Signature': request.headers.get('X-Signature'),
      'X-Webhook-Signature': request.headers.get('X-Webhook-Signature'),
      'X-Hub-Signature': request.headers.get('X-Hub-Signature'),
      'X-Paychangu-Signature': request.headers.get('X-Paychangu-Signature'),
    }
    
    console.log('🔍 Signature headers found:', signatureHeaders)
    
    console.log('✅ Webhook test endpoint working correctly')
    console.log('🚀 ===== WEBHOOK TEST ENDPOINT END =====')
    
    return NextResponse.json({ 
      message: 'Webhook test endpoint working',
      timestamp: new Date().toISOString(),
      receivedData: body,
      headers: Object.fromEntries(request.headers.entries())
    })
    
  } catch (error) {
    console.error('❌ Webhook test error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('🚀 ===== WEBHOOK TEST ENDPOINT END (ERROR) =====')
    
    return NextResponse.json({ 
      error: 'Webhook test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('🔔 ===== WEBHOOK TEST GET REQUEST =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 All Headers:', Object.fromEntries(request.headers.entries()))
  
  console.log('✅ Webhook test GET endpoint working')
  console.log('🚀 ===== WEBHOOK TEST GET END =====')
  
  return NextResponse.json({ 
    message: 'Webhook test GET endpoint working',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })
} 