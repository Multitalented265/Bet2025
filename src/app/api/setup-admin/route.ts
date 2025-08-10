import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    
    
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: email.toLowerCase() }
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
    
    // Hash the admin password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin account
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || 'Administrator',
        role: 'admin',
        isActive: true
      }
    });
    
    
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        email: admin.email,
        name: admin.name
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
    // Get all admin accounts
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (admins.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin accounts found',
        admins: admins
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No admin accounts found'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking admin accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 