import { NextRequest, NextResponse } from 'next/server'
import { getPayChanguBanks, getPayChanguOperators } from '@/lib/paychangu'

export async function GET(request: NextRequest) {
  try {
    

    // Fetch banks and operators from PayChangu
    const [banks, operators] = await Promise.all([
      getPayChanguBanks(),
      getPayChanguOperators()
    ]);

    

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
    
    
    const body = await request.text()

    // Fetch banks and operators from PayChangu
    const [banks, operators] = await Promise.all([
      getPayChanguBanks(),
      getPayChanguOperators()
    ]);

    

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