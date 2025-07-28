import { NextResponse } from 'next/server';
import { AdminLoginTracker } from '@/lib/admin-login-tracker';

export async function GET() {
  try {
    const stats = await AdminLoginTracker.getLoginStatistics();
    
    return NextResponse.json({ 
      success: true, 
      stats 
    });
    
  } catch (error) {
    console.error('Error getting login statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get login statistics' },
      { status: 500 }
    );
  }
} 