import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { clearAdminLoginAttempts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    
    
    // Clear in-memory rate limiting
    clearAdminLoginAttempts();
    
    // Clear all admin accounts
    const deleteAdmins = await prisma.admin.deleteMany({});
    
    
    // Clear all banned IPs
    const deleteBannedIPs = await prisma.bannedIP.deleteMany({});
    
    
    // Clear all admin sessions
    const deleteSessions = await prisma.adminSession.deleteMany({});
    
    
    // Clear all admin login logs
    const deleteLoginLogs = await prisma.adminLoginLog.deleteMany({});
    
    
    return NextResponse.json({
      success: true,
      message: 'All admin data cleared successfully',
      cleared: {
        inMemoryRateLimits: true,
        admins: deleteAdmins.count,
        bannedIPs: deleteBannedIPs.count,
        sessions: deleteSessions.count,
        loginLogs: deleteLoginLogs.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing admin data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear admin data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
