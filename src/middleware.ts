import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For now, we'll let the API routes handle banned IP checking
    // This prevents the Prisma browser environment error
    
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