import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify user session
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return PayChangu configuration (only public key, keep secret key server-side)
    return NextResponse.json({
      publicKey: process.env.PAYCHANGU_PUBLIC_KEY,
      callbackUrl: process.env.PAYCHANGU_CALLBACK_URL,
      returnUrl: process.env.PAYCHANGU_RETURN_URL,
      webhookUrl: process.env.PAYCHANGU_WEBHOOK_URL,
      environment: process.env.NODE_ENV
    })
    
  } catch (error) {
    console.error('PayChangu config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 