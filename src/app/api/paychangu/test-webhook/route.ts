import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK CALLED =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 All Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const bodyText = await request.text()
    console.log('📦 Raw Body:', bodyText)
    
    let body
    if (bodyText) {
      try {
        body = JSON.parse(bodyText)
        console.log('✅ Parsed JSON:', JSON.stringify(body, null, 2))
      } catch (e) {
        console.log('❌ Failed to parse JSON:', e)
        body = { raw: bodyText }
      }
    } else {
      console.log('⚠️ Empty body')
      body = {}
    }
    
    console.log('🎯 Test webhook received data:', {
      tx_ref: body.tx_ref,
      status: body.status,
      amount: body.amount,
      customer_email: body.customer?.email,
      has_meta: !!body.meta
    })
    
    return NextResponse.json({ 
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      received_data: body
    })
    
  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ 
      error: 'Test webhook error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 ===== TEST WEBHOOK GET CALLED =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  
  return NextResponse.json({ 
    message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 