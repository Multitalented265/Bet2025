import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Check for admin session cookie specifically
    const adminSessionCookie = cookieStore.get('admin-session');
    
    // Try to get admin session
    const session = await getAdminSession();
    
    return NextResponse.json({
      success: true,
      debug: {
        allCookies: allCookies.map(c => ({ name: c.name, value: c.value ? 'present' : 'empty' })),
        adminSessionCookie: adminSessionCookie ? 'present' : 'not found',
        sessionResult: session ? 'found' : 'null',
        sessionDetails: session ? {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name
        } : null
      }
    });
  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 