import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { authenticateAdmin } from '@/lib/auth';
import { sanitizeInput, logSecurityEvent, SECURITY_EVENTS, isSuspiciousRequest } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Check for suspicious requests
    if (isSuspiciousRequest(request)) {
      logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Sanitize inputs
    const email = sanitizeInput(body.email || '');
    const password = sanitizeInput(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Extract IP address from request
    const headersList = await headers();
    const xForwardedFor = headersList.get('x-forwarded-for') || '';
    const xRealIp = headersList.get('x-real-ip') || '';
    const cfConnectingIp = headersList.get('cf-connecting-ip') || '';
    
    let ipAddress = cfConnectingIp || xRealIp || xForwardedFor.split(',')[0] || 'unknown';
    ipAddress = ipAddress.trim();

    // Use the authenticateAdmin function from auth.ts with IP address
    const result = await authenticateAdmin(email, password, ipAddress);

    if (result.success && result.sessionToken) {
      // Check if admin has 2FA enabled
      if (result.user.twoFactorEnabled) {
        logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
          email,
          ip: ipAddress,
          requires2FA: true
        });
        
        // Return response indicating 2FA is required
        return NextResponse.json({
          success: true,
          requires2FA: true,
          message: '2FA verification required',
          admin: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role
          }
        });
      }

      logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
        email,
        ip: ipAddress,
        adminId: result.user.id
      });

      // Create response with admin data (no 2FA required)
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        admin: result.user
      });

      // Set HTTP-only cookie with session token
      response.cookies.set('admin-session', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      return response;
    } else {
      logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
        email,
        ip: ipAddress,
        reason: result.message
      });

      return NextResponse.json(
        { success: false, message: result.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Admin login error:', error);
    logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Admin login endpoint' },
    { status: 200 }
  );
} 