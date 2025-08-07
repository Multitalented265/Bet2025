import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { clearAdminLoginAttempts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing rate limits and banned IPs...');
    
    // Clear in-memory rate limiting
    clearAdminLoginAttempts();
    
    // Clear all banned IPs
    const deleteBannedIPs = await prisma.bannedIP.deleteMany({});
    console.log(`✅ Deleted ${deleteBannedIPs.count} banned IP addresses`);
    
    // Clear all admin sessions (this will log out all admins)
    const deleteSessions = await prisma.adminSession.deleteMany({});
    console.log(`✅ Deleted ${deleteSessions.count} admin sessions`);
    
    // Clear all admin login logs (optional - for privacy)
    const deleteLoginLogs = await prisma.adminLoginLog.deleteMany({});
    console.log(`✅ Deleted ${deleteLoginLogs.count} admin login logs`);
    
    return NextResponse.json({
      success: true,
      message: 'Rate limits and security data cleared successfully',
      cleared: {
        inMemoryRateLimits: true,
        bannedIPs: deleteBannedIPs.count,
        sessions: deleteSessions.count,
        loginLogs: deleteLoginLogs.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear rate limits',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
