import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Find the admin user
    const admin = await prisma.admin.findFirst({
      where: { email: process.env.ADMIN_EMAIL! }
    });
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found. Please run the setup-admin API first.'
      }, { status: 404 });
    }
    
    console.log('📋 Found admin:', {
      email: admin.email,
      name: admin.name,
      hasPassword: !!admin.password
    });
    
    // Check if password is already hashed
    const isHashed = admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$');
    
    if (isHashed) {
      return NextResponse.json({
        success: true,
        message: 'Admin password is already hashed correctly.',
        admin: {
          email: admin.email,
          name: admin.name
        }
      });
    }
    
    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    // Update the admin password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password has been hashed and updated successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Admin password has been hashed and updated successfully!',
      admin: {
        email: admin.email,
        name: admin.name
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fix admin password',
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
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found'
      }, { status: 404 });
    }
    
    const isHashed = admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$');
    
    return NextResponse.json({
      success: true,
      message: isHashed ? 'Password is hashed' : 'Password needs to be hashed',
      admin: {
        email: admin.email,
        name: admin.name,
        isPasswordHashed: isHashed
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking admin password',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 