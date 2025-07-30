import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// DELETE - Unban an IP address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Find the banned IP
    const bannedIP = await prisma.bannedIP.findUnique({
      where: { id }
    });

    if (!bannedIP) {
      return NextResponse.json(
        { success: false, message: 'Banned IP not found' },
        { status: 404 }
      );
    }

    // Deactivate the ban
    await prisma.bannedIP.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`IP ${bannedIP.ipAddress} unbanned by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'IP address unbanned successfully'
    });

  } catch (error) {
    console.error('Error unbanning IP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to unban IP address' },
      { status: 500 }
    );
  }
}

// PATCH - Update ban details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { reason, expiresAt } = await request.json();

    // Update the ban
    const bannedIP = await prisma.bannedIP.update({
      where: { id },
      data: {
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ban updated successfully',
      bannedIP
    });

  } catch (error) {
    console.error('Error updating ban:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update ban' },
      { status: 500 }
    );
  }
} 