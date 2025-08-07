import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// PATCH - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update all unread notifications to read
    const result = await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
} 