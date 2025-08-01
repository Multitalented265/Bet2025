import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function middleware(request: NextRequest) {
  // Only check for banned IPs on admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('x-client-ip') || 'unknown';
    
    // Skip localhost and development IPs
    if (clientIP && !clientIP.includes('127.0.0.1') && !clientIP.includes('localhost') && clientIP !== 'unknown') {
      try {
        // Check if IP is banned
        const bannedIP = await prisma.bannedIP.findFirst({
          where: {
            ipAddress: clientIP,
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        });

        if (bannedIP) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Access denied. Your IP address has been banned.',
              reason: bannedIP.reason || 'No reason provided'
            },
            { status: 403 }
          );
        }
      } catch (error) {
        console.error('Error checking banned IPs:', error);
        // Continue with the request if there's an error checking banned IPs
      }
    }
    
    // Track admin login attempts
    if (request.nextUrl.pathname === '/admin/login' && request.method === 'POST') {
      // This will be handled by the login API endpoint
      return NextResponse.next();
    }
    
    // Track admin dashboard access
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      // You can add additional tracking here if needed
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}; 