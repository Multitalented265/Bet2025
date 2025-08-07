import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, email, password, name } = body;

    // Validate required fields
    if (!adminId) {
      return NextResponse.json({
        success: false,
        message: 'Admin ID is required'
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin account not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (email && email !== existingAdmin.email) {
      // Check if new email already exists
      const emailExists = await prisma.admin.findFirst({
        where: { 
          email: email.toLowerCase(),
          id: { not: adminId }
        }
      });

      if (emailExists) {
        return NextResponse.json({
          success: false,
          message: 'Email already exists'
        }, { status: 409 });
      }

      updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (name) {
      updateData.name = name;
    }

    // Update admin account
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData
    });

    console.log('✅ Admin account updated successfully:', updatedAdmin.email);

    return NextResponse.json({
      success: true,
      message: 'Admin account updated successfully',
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: updatedAdmin.role
      }
    });

  } catch (error) {
    console.error('❌ Error updating admin account:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update admin account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json({
        success: false,
        message: 'Admin ID is required'
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin account not found'
      }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.admin.update({
      where: { id: adminId },
      data: { isActive: false }
    });

    console.log('✅ Admin account deactivated successfully:', existingAdmin.email);

    return NextResponse.json({
      success: true,
      message: 'Admin account deactivated successfully'
    });

  } catch (error) {
    console.error('❌ Error deactivating admin account:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to deactivate admin account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 