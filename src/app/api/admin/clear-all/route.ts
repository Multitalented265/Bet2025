import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️  Clearing all admin accounts...');
    
    // Delete all existing admin accounts
    const deleteResult = await prisma.admin.deleteMany({});
    
    console.log(`✅ Deleted ${deleteResult.count} admin accounts`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} admin accounts`,
      deletedCount: deleteResult.count
    });
    
  } catch (error) {
    console.error('❌ Error clearing admin accounts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear admin accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      }, { status: 400 });
    }

    // Clear all existing admin accounts first
    await prisma.admin.deleteMany({});
    console.log('🗑️  Cleared all existing admin accounts');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the main admin account
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Main admin account created successfully:', admin.email);
    
    return NextResponse.json({
      success: true,
      message: 'Main admin account created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating main admin account:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create main admin account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
