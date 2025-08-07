import { NextRequest, NextResponse } from 'next/server';
import { handleAdminForgotPassword } from '@/actions/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    if (typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const result = await handleAdminForgotPassword(email.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin forgot password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while processing your request' 
      },
      { status: 500 }
    );
  }
} 