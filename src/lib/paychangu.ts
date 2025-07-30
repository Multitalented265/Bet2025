// Remove the env import and use process.env directly
// import { env } from "@/lib/env";

export interface PayChanguCustomer {
  email: string;
  first_name: string;
  last_name: string;
}

export interface PayChanguPaymentData {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  callback_url: string; // ✅ For successful payments - redirect user to wallet page
  return_url: string; // ✅ For failed/cancelled payments - redirect user to wallet page
  webhook_url: string; // ✅ For server-to-server webhook notifications
  customer: PayChanguCustomer;
  customization: {
    title: string;
    description: string;
  };
  meta: {
    userId: string;
    transactionType: 'Deposit' | 'Withdrawal';
    amount: number;
  };
  payment_method?: string;
  country?: string;
  webhook_secret?: string; // Webhook secret for verification
  webhook_events?: string[]; // Specific webhook events to listen for
}

// Export URL getters for use in other parts of the application
export function getPayChanguCallbackUrl(): string {
  return process.env.PAYCHANGU_CALLBACK_URL!;
}

export function getPayChanguReturnUrl(): string {
  return process.env.PAYCHANGU_RETURN_URL!;
}

export function getPayChanguWebhookUrl(): string {
  return process.env.PAYCHANGU_WEBHOOK_URL!;
}

// ✅ Render-specific URL helpers
export function getRenderBaseUrl(): string {
  // For Render deployment, use the environment variable or construct from request
  return process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'https://bet2025-2.onrender.com';
}

export function getRenderWebhookUrl(): string {
  const baseUrl = getRenderBaseUrl();
  return `${baseUrl}/api/paychangu/webhook`;
}

export function getRenderCallbackUrl(): string {
  const baseUrl = getRenderBaseUrl();
  return `${baseUrl}/dashboard/wallet`;
}

export function getRenderReturnUrl(): string {
  const baseUrl = getRenderBaseUrl();
  return `${baseUrl}/dashboard/wallet`;
}

export interface PayChanguCallbackData {
  tx_ref: string;
  status: 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  event_type: string;
  customer: PayChanguCustomer;
  meta: {
    userId: string;
    transactionType: 'Deposit' | 'Withdrawal';
    amount: number;
  };
}

export function generateTransactionReference(): string {
  return 'TX_' + Math.floor((Math.random() * 1000000000) + 1);
}

export function createPayChanguPaymentData(
  amount: number,
  customer: PayChanguCustomer,
  userId: string,
  transactionType: 'Deposit' | 'Withdrawal'
): PayChanguPaymentData {
  // 🔍 COMPREHENSIVE DEBUG LOGGING
  console.log('🔍 ===== PAYCHANGU CONFIGURATION DEBUG =====')
  console.log('📋 Environment Variables Check:')
  console.log('  PAYCHANGU_PUBLIC_KEY:', process.env.PAYCHANGU_PUBLIC_KEY ? '✅ SET' : '❌ MISSING')
  console.log('  PAYCHANGU_SECRET_KEY:', process.env.PAYCHANGU_SECRET_KEY ? '✅ SET' : '❌ MISSING')
  console.log('  PAYCHANGU_CALLBACK_URL:', process.env.PAYCHANGU_CALLBACK_URL || '❌ NOT SET')
  console.log('  PAYCHANGU_RETURN_URL:', process.env.PAYCHANGU_RETURN_URL || '❌ NOT SET')
  console.log('  PAYCHANGU_WEBHOOK_URL:', process.env.PAYCHANGU_WEBHOOK_URL || '❌ NOT SET')
  console.log('  NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ NOT SET')
  console.log('  RENDER_EXTERNAL_URL:', process.env.RENDER_EXTERNAL_URL || '❌ NOT SET')
  
  // ✅ Use Render-optimized URLs
  const webhookUrl = process.env.PAYCHANGU_WEBHOOK_URL || getRenderWebhookUrl()
  const callbackUrl = process.env.PAYCHANGU_CALLBACK_URL || getRenderCallbackUrl()
  const returnUrl = process.env.PAYCHANGU_RETURN_URL || getRenderReturnUrl()
  
  console.log('🔗 URL Configuration:')
  console.log('  Callback URL (successful payment redirect):', callbackUrl)
  console.log('  Return URL (failed/cancelled payment redirect):', returnUrl)
  console.log('  Webhook URL (server callback):', webhookUrl)
  
  // 🚨 RENDER DEPLOYMENT CHECKS
  console.log('🚨 Render Deployment Checks:')
  if (process.env.NODE_ENV === 'production') {
    console.log('  ✅ Production environment detected')
    if (!process.env.PAYCHANGU_SECRET_KEY?.startsWith('sec-')) {
      console.log('  ❌ PayChangu secret key not properly configured for production')
    }
    if (!webhookUrl.includes('onrender.com') && !webhookUrl.includes('your-domain.com')) {
      console.log('  ⚠️  Webhook URL may not be accessible from PayChangu servers')
    }
  } else {
    console.log('  📝 Development environment - using test keys')
  }
  
  console.log('📊 Payment Data Being Sent to PayChangu:')
  console.log('  Amount:', amount)
  console.log('  Currency: MWK')
  console.log('  Customer:', customer.email)
  console.log('  Transaction Type:', transactionType)
  console.log('  User ID:', userId)
  console.log('🔍 ===== END DEBUG =====')
  
  const paymentData = {
    public_key: process.env.PAYCHANGU_PUBLIC_KEY!,
    tx_ref: generateTransactionReference(),
    amount: amount,
    currency: "MWK",
    callback_url: callbackUrl, // ✅ For successful payments - redirect user to wallet page
    return_url: returnUrl, // ✅ For failed/cancelled payments - redirect user to wallet page
    webhook_url: webhookUrl, // ✅ For server-to-server webhook notifications
    customer,
    customization: {
      title: `${transactionType} - Bet2025`,
      description: `${transactionType} funds to your Bet2025 wallet`,
    },
    meta: {
      userId,
      transactionType,
      amount,
    },
    // Add additional fields that might be required for webhook delivery
    country: "MW", // Malawi country code
    payment_method: "mobile_money", // Specify payment method
    // Add webhook-specific parameters
    webhook_secret: process.env.PAYCHANGU_SECRET_KEY, // Include webhook secret
    webhook_events: ["payment.success", "payment.failed"], // Specify webhook events
  };

  // 🔍 DEBUG: Log the exact URLs being sent to PayChangu
  console.log('🔍 PayChangu Payment Data URLs:')
  console.log('  callback_url (successful payment redirect):', paymentData.callback_url)
  console.log('  return_url (failed/cancelled payment redirect):', paymentData.return_url)
  console.log('  webhook_url (server-to-server notifications):', paymentData.webhook_url)
  console.log('  All URLs are now included in payment request')

  return paymentData;
}

import crypto from 'crypto';

/**
 * Enhanced PayChangu signature verification with security measures
 * Based on PayChangu documentation: https://developer.paychangu.com/docs/inline-popup
 */
export function verifyPayChanguSignature(
  signature: string,
  data: string,
  secretKey: string
): boolean {
  try {
    // Security checks
    if (!signature || !data || !secretKey) {
      console.warn('⚠️ Missing required parameters for signature verification')
      return false
    }

    // Validate signature format (should be hex string)
    if (!/^[a-fA-F0-9]+$/.test(signature)) {
      console.warn('⚠️ Invalid signature format')
      return false
    }

    // Validate secret key format
    if (!secretKey.startsWith('sec-')) {
      console.warn('⚠️ Invalid secret key format')
      return false
    }

    // Create expected signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('hex');
    
    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    console.log('🔐 Signature verification details:', {
      signatureLength: signature.length,
      expectedLength: expectedSignature.length,
      isValid,
      secretKeyPrefix: secretKey.substring(0, 4),
      environment: process.env.NODE_ENV || 'development'
    })

    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

/**
 * Validate PayChangu webhook data structure
 */
export function validatePayChanguWebhookData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check required fields - accept either tx_ref or reference
  if (!data.tx_ref && !data.reference) errors.push('Missing tx_ref or reference');
  if (!data.status) errors.push('Missing status');
  if (!data.amount) errors.push('Missing amount');
  if (!data.currency) errors.push('Missing currency');
  
  // 🔧 Handle PayChangu response format with nested data
  if (data.data && data.data.payment_link) {
    const paymentLink = data.data.payment_link
    if (paymentLink.reference_id) {
      console.log('✅ Found reference_id in nested data structure')
    }
    if (paymentLink.amount || paymentLink.payableAmount) {
      console.log('✅ Found amount in nested data structure')
    }
  }
  
  // Make event_type optional - some PayChangu webhooks might not include it
  if (!data.event_type) {
    console.log('⚠️ No event_type provided in webhook data');
  }
  
  // Check meta data - but allow missing meta data if customer email is present
  if (!data.meta) {
    // Only require meta data if no customer email is provided
    if (!data.customer?.email) {
      errors.push('Missing meta data and no customer email provided');
    }
  } else {
    if (!data.meta.userId) errors.push('Missing userId in meta');
    if (!data.meta.transactionType) errors.push('Missing transactionType in meta');
    if (!data.meta.amount) errors.push('Missing amount in meta');
  }
  
  // ✅ Validate event type - allow multiple valid event types
  const validEventTypes = ['api.charge.payment', 'payment.success', 'charge.success', 'transaction.success']
  if (data.event_type && !validEventTypes.includes(data.event_type)) {
    errors.push(`Invalid event_type: ${data.event_type}, expected one of: ${validEventTypes.join(', ')}`);
  }
  
  // Validate status values
  const validStatuses = ['success', 'failed', 'cancelled'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Invalid status: ${data.status}`);
  }
  
  // Validate transaction types
  const validTypes = ['Deposit', 'Withdrawal'];
  if (data.meta?.transactionType && !validTypes.includes(data.meta.transactionType)) {
    errors.push(`Invalid transaction type: ${data.meta.transactionType}`);
  }
  
  // Validate amount consistency - but be more flexible
  if (data.amount && data.meta?.amount && data.amount !== data.meta.amount) {
    console.log(`⚠️ Amount mismatch: webhook=${data.amount}, meta=${data.meta.amount}`);
    // Don't treat this as an error, just log it
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 