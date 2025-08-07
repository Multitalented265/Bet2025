import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window
const LOGIN_RATE_LIMIT_MAX = 5; // 5 login attempts per window

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || xRealIp || xForwardedFor?.split(',')[0] || 'unknown';
}

function getRateLimitKey(request: NextRequest): string {
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  
  // Create separate rate limit keys for different endpoints
  if (pathname === '/api/admin/login' && method === 'POST') {
    return `admin_login:${ip}`;
  }
  
  return `general:${ip}`;
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset the counter and start a new window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip rate limiting for certain paths
  const skipRateLimitPaths = [
    '/api/admin/clear-rate-limits',
    '/api/setup-admin',
    '/api/admin/setup',
    '/api/admin/login' // Skip rate limiting for admin login
  ];
  
  if (skipRateLimitPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Rate limiting for all requests
  const rateLimitKey = getRateLimitKey(request);
  const isLoginAttempt = pathname === '/api/admin/login' && request.method === 'POST';
  const maxRequests = isLoginAttempt ? LOGIN_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
  
  if (isRateLimited(rateLimitKey, maxRequests)) {
    const clientIP = getClientIP(request);
    console.log(`🚨 Rate limit exceeded for IP: ${clientIP} on path: ${pathname}`);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  
  // Get the token from the session
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/bets',
    '/wallet',
    '/profile',
    '/settings',
    '/support'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes handling with enhanced security
  if (pathname.startsWith('/admin')) {
    // Security: Block access to admin routes from non-admin IPs in production
    if (process.env.NODE_ENV === 'production') {
      const adminIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
      const clientIP = getClientIP(request);
      
      if (adminIPs.length > 0 && !adminIPs.includes(clientIP)) {
        console.log(`🚨 Unauthorized admin access attempt from IP: ${clientIP}`);
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }
    
    // Track admin login attempts
    if (pathname === '/admin/login' && request.method === 'POST') {
      // This will be handled by the login API endpoint
      return NextResponse.next();
    }
    
    // Track admin dashboard access
    if (pathname.startsWith('/admin/dashboard')) {
      // You can add additional tracking here if needed
      return NextResponse.next();
    }
  }
  
  // Security: Add security headers to all responses
  const response = NextResponse.next();
  
  // Add additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/bets/:path*',
    '/wallet/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/support/:path*',
    '/api/:path*',
  ],
}; 