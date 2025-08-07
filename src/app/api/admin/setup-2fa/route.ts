import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin already has 2FA enabled
    const admin = await prisma.admin.findFirst({
      where: { 
        id: session.user.id,
        isActive: true 
      }
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    if (admin.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 })
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Mzunguko Admin (${admin.email})`,
      issuer: "Mzunguko",
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    // Store the secret temporarily (it will be confirmed when user verifies)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        twoFactorSecret: secret.base32,
        backupCodes: JSON.stringify(backupCodes)
      }
    })

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      secret: secret.base32,
      backupCodes
    })

  } catch (error) {
    console.error('Error in 2FA setup:', error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const secret = formData.get("secret") as string
    const verificationCode = formData.get("verificationCode") as string
    const backupCodes = JSON.parse(formData.get("backupCodes") as string)

    if (!secret || !verificationCode || !backupCodes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: verificationCode,
      window: 2 // Allow 2 time steps in case of slight time difference
    })

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Enable 2FA
    await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(backupCodes)
      }
    })

    // Update admin settings
    await prisma.adminSettings.update({
      where: { id: 1 },
      data: { enable2fa: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in 2FA verification:', error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
} 