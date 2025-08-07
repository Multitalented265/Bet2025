import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🏓 ===== PING ENDPOINT HIT =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 All Headers:', Object.fromEntries(request.headers.entries()))
  
  return NextResponse.json({ 
    message: 'Pong! Webhook endpoint is reachable',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    environment: process.env.NODE_ENV || 'development'
  })
}

export async function POST(request: NextRequest) {
  console.log('🏓 ===== PING POST ENDPOINT HIT =====')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌐 Request URL:', request.url)
  console.log('🔗 Request Method:', request.method)
  console.log('🔗 All Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.text()
    console.log('📦 Request body:', body)
    
    return NextResponse.json({ 
      message: 'Pong! Webhook POST endpoint is reachable',
      timestamp: new Date().toISOString(),
      receivedData: body,
      url: request.url,
      method: request.method,
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('❌ Ping POST error:', error)
    return NextResponse.json({ 
      error: 'Ping POST failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 