import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const result = await logoutAdmin();

    if (result.success) {
      // Clear admin session cookie
      const cookieStore = await cookies();
      cookieStore.delete('admin-session');

      return NextResponse.json({
        success: true,
        message: 'Admin logout successful'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Logout failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Admin logout endpoint' },
    { status: 200 }
  );
} 