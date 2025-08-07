import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { clearAdminLoginAttempts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing all admin data...');
    
    // Clear in-memory rate limiting
    clearAdminLoginAttempts();
    
    // Clear all admin accounts
    const deleteAdmins = await prisma.admin.deleteMany({});
    console.log(`✅ Deleted ${deleteAdmins.count} admin accounts`);
    
    // Clear all banned IPs
    const deleteBannedIPs = await prisma.bannedIP.deleteMany({});
    console.log(`✅ Deleted ${deleteBannedIPs.count} banned IP addresses`);
    
    // Clear all admin sessions
    const deleteSessions = await prisma.adminSession.deleteMany({});
    console.log(`✅ Deleted ${deleteSessions.count} admin sessions`);
    
    // Clear all admin login logs
    const deleteLoginLogs = await prisma.adminLoginLog.deleteMany({});
    console.log(`✅ Deleted ${deleteLoginLogs.count} admin login logs`);
    
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
