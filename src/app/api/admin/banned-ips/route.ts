import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET - Get all banned IPs
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bannedIPs = await prisma.bannedIP.findMany({
      where: { isActive: true },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { bannedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      bannedIPs
    });

  } catch (error) {
    console.error('Error fetching banned IPs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch banned IPs' },
      { status: 500 }
    );
  }
}

// POST - Ban an IP address
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { ipAddress, reason, expiresAt } = await request.json();

    if (!ipAddress) {
      return NextResponse.json(
        { success: false, message: 'IP address is required' },
        { status: 400 }
      );
    }

    // Check if IP is already banned
    const existingBan = await prisma.bannedIP.findUnique({
      where: { ipAddress }
    });

    if (existingBan && existingBan.isActive) {
      return NextResponse.json(
        { success: false, message: 'IP address is already banned' },
        { status: 400 }
      );
    }

    // Create or update the ban
    const bannedIP = await prisma.bannedIP.upsert({
      where: { ipAddress },
      update: {
        reason,
        bannedBy: session.user.id,
        bannedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      },
      create: {
        ipAddress,
        reason,
        bannedBy: session.user.id,
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
      message: 'IP address banned successfully',
      bannedIP
    });

  } catch (error) {
    console.error('Error banning IP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to ban IP address' },
      { status: 500 }
    );
  }
} 