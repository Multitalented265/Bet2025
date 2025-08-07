import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguBanks, getPayChanguOperators } from '@/lib/paychangu'

export async function GET(request: NextRequest) {
  try {
    console.log('🏦 ===== BANKS ENDPOINT HIT =====')
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🌐 Request URL:', request.url)
    console.log('🔗 Request Method:', request.method)

    // Fetch banks and operators from PayChangu
    const [banks, operators] = await Promise.all([
      getPayChanguBanks(),
      getPayChanguOperators()
    ]);

    console.log('💰 Banks fetched:', banks.length)
    console.log('💰 Operators fetched:', operators.length)

    return NextResponse.json({
      success: true,
      data: {
        banks,
        operators
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('❌ Banks endpoint error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch banks and operators',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏦 ===== BANKS POST ENDPOINT HIT =====')
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🌐 Request URL:', request.url)
    console.log('🔗 Request Method:', request.method)
    
    const body = await request.text()
    console.log('📦 Request body:', body)

    // Fetch banks and operators from PayChangu
    const [banks, operators] = await Promise.all([
      getPayChanguBanks(),
      getPayChanguOperators()
    ]);

    console.log('💰 Banks fetched:', banks.length)
    console.log('💰 Operators fetched:', operators.length)

    return NextResponse.json({
      success: true,
      data: {
        banks,
        operators
      },
      receivedData: body,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('❌ Banks POST endpoint error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch banks and operators',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 