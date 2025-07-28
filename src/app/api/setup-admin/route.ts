import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up admin account...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: process.env.ADMIN_EMAIL! }
    });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }
    
    // Create default admin account
    const admin = await prisma.admin.create({
      data: {
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!, // Change this in production!
        name: 'Administrator',
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Admin account created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
              admin: {
          email: admin.email,
          name: admin.name,
          password: process.env.ADMIN_PASSWORD! // Only show in development
        }
    });
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create admin account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst({
      where: { email: process.env.ADMIN_EMAIL! }
    });
    
    if (admin) {
      return NextResponse.json({
        success: true,
        message: 'Admin account exists',
        admin: {
          email: admin.email,
          name: admin.name
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Admin account not found'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking admin account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 