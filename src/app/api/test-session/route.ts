import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing session...')
    
    const session = await getSession()
    
    console.log('📋 Session data:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    })
    
    if (!session?.user?.id) {
      console.log('❌ No valid session found')
      return NextResponse.json({ 
        error: 'Unauthorized - No valid session',
        status: 401,
        sessionExists: false
      }, { status: 401 })
    }
    
    console.log('✅ Valid session found')
    return NextResponse.json({
      message: 'Session is valid',
      status: 200,
      sessionExists: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    })
    
  } catch (error) {
    console.error('❌ Session test error:', error)
    return NextResponse.json({
      error: 'Session test failed',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 