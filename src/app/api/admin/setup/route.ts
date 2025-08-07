import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: email.toLowerCase() }
    });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin account with this email already exists'
      }, { status: 409 });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin account
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Admin account created successfully:', admin.email);
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
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
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin accounts retrieved successfully',
      admins: admins
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error retrieving admin accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 