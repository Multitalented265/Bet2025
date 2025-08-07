import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import speakeasy from "speakeasy"
import { generateSecureToken } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode, backupCode } = await request.json()

    if (!email || (!verificationCode && !backupCode)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    if (!admin.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA not enabled for this account" }, { status: 400 })
    }

    let isValid = false

    if (backupCode) {
      // Verify backup code
      const backupCodes = JSON.parse(admin.backupCodes || '[]')
      const codeIndex = backupCodes.indexOf(backupCode)
      
      if (codeIndex !== -1) {
        // Remove the used backup code
        backupCodes.splice(codeIndex, 1)
        await prisma.admin.update({
          where: { id: admin.id },
          data: { backupCodes: JSON.stringify(backupCodes) }
        })
        isValid = true
      }
    } else if (verificationCode) {
      // Verify TOTP code
      isValid = speakeasy.totp.verify({
        secret: admin.twoFactorSecret!,
        encoding: 'base32',
        token: verificationCode,
        window: 2 // Allow 2 time steps in case of slight time difference
      })
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Create admin session after successful 2FA verification
    const sessionToken = generateSecureToken(64);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.adminSession.create({
      data: {
        sessionToken,
        adminId: admin.id,
        expires
      }
    });

    // Create response with admin data
    const response = NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

    // Set HTTP-only cookie with session token
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error in 2FA verification:', error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
} 