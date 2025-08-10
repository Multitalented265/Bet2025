import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  
  
  // Verify all required environment variables
  const config = {
    webhookUrl: env.PAYCHANGU_WEBHOOK_URL,
    callbackUrl: env.PAYCHANGU_CALLBACK_URL,
    returnUrl: env.PAYCHANGU_RETURN_URL,
    publicKey: env.PAYCHANGU_PUBLIC_KEY,
    secretKey: env.PAYCHANGU_SECRET_KEY ? 'SET' : 'MISSING',
    nextAuthUrl: env.NEXTAUTH_URL,
    environment: process.env.NODE_ENV || 'development'
  }

  // Validate configuration
  const validation = {
    webhookUrlValid: Boolean(config.webhookUrl && config.webhookUrl.includes('/api/paychangu/webhook')),
    callbackUrlValid: Boolean(config.callbackUrl && config.callbackUrl.includes('/dashboard/wallet')),
    returnUrlValid: Boolean(config.returnUrl && config.returnUrl.includes('/dashboard/wallet')),
    publicKeyValid: Boolean(config.publicKey && config.publicKey.startsWith('pub-')),
    secretKeyValid: config.secretKey === 'SET',
    nextAuthUrlValid: Boolean(config.nextAuthUrl && config.nextAuthUrl.startsWith('https://')),
    allValid: true
  }

  // Check if any validation failed
  Object.values(validation).forEach(valid => {
    if (valid === false) {
      validation.allValid = false
    }
  })

  

  return NextResponse.json({
    message: validation.allValid ? 'PayChangu configuration is valid' : 'PayChangu configuration has issues',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    configuration: {
      webhookUrl: config.webhookUrl,
      callbackUrl: config.callbackUrl,
      returnUrl: config.returnUrl,
      publicKey: config.publicKey, // Return the actual public key value
      secretKey: config.secretKey,
      nextAuthUrl: config.nextAuthUrl
    },
    validation: validation,
    status: validation.allValid ? 'OK' : 'ERROR'
  })
} 