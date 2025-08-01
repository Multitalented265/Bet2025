import { NextRequest, NextResponse } from 'next/server';
import { AdminLoginTracker } from '@/lib/admin-login-tracker';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Extract client information
    const clientInfo = AdminLoginTracker.extractClientInfo(headersList);
    
    // Get location information
    const locationInfo = await AdminLoginTracker.getLocationFromIP(clientInfo.ipAddress || '');
    
    // Combine all information
    const loginData = {
      ...body,
      ...clientInfo,
      ...locationInfo,
      loginTime: new Date(),
      deviceFingerprint: AdminLoginTracker.generateDeviceFingerprint(
        clientInfo.userAgent || '',
        body.screenResolution
      )
    };
    
    // Log the login attempt
    await AdminLoginTracker.logAdminLogin(loginData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login tracked successfully',
      sessionId: loginData.sessionId
    });
    
  } catch (error) {
    console.error('Error tracking admin login:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track login' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const logs = await AdminLoginTracker.getAdminLoginHistory(adminId || undefined, limit);
    
    return NextResponse.json({ 
      success: true, 
      logs 
    });
    
  } catch (error) {
    console.error('Error getting admin login history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get login history' },
      { status: 500 }
    );
  }
} 