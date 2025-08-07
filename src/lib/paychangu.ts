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
              title: `${transactionType} - Mzunguko`,
        description: `${transactionType} funds to your Mzunguko wallet`,
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
export function validatePayChanguWebhookData(data: Record<string, unknown>): {
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
  if (data.data && typeof data.data === 'object' && data.data !== null) {
    const nestedData = data.data as Record<string, unknown>;
    if (nestedData.payment_link && typeof nestedData.payment_link === 'object' && nestedData.payment_link !== null) {
      const paymentLink = nestedData.payment_link as Record<string, unknown>;
      if (paymentLink.reference_id) {
        console.log('✅ Found reference_id in nested data structure')
      }
      if (paymentLink.amount || paymentLink.payableAmount) {
        console.log('✅ Found amount in nested data structure')
      }
    }
  }
  
  // Make event_type optional - some PayChangu webhooks might not include it
  if (!data.event_type) {
    console.log('⚠️ No event_type provided in webhook data');
  }
  
  // Check meta data - but allow missing meta data if customer email is present
  if (!data.meta) {
    // Only require meta data if no customer email is provided
    if (data.customer && typeof data.customer === 'object' && data.customer !== null) {
      const customer = data.customer as Record<string, unknown>;
      if (!customer.email) {
        errors.push('Missing meta data and no customer email provided');
      }
    } else {
      errors.push('Missing meta data and no customer email provided');
    }
  } else {
    const meta = data.meta as Record<string, unknown>;
    if (!meta.userId) errors.push('Missing userId in meta');
    if (!meta.transactionType) errors.push('Missing transactionType in meta');
    if (!meta.amount) errors.push('Missing amount in meta');
  }
  
  // ✅ Validate event type - allow multiple valid event types
  const validEventTypes = ['api.charge.payment', 'payment.success', 'charge.success', 'transaction.success']
  if (data.event_type && typeof data.event_type === 'string' && !validEventTypes.includes(data.event_type)) {
    errors.push(`Invalid event_type: ${data.event_type}, expected one of: ${validEventTypes.join(', ')}`);
  }
  
  // Validate status values
  const validStatuses = ['success', 'failed', 'cancelled'];
  if (data.status && typeof data.status === 'string' && !validStatuses.includes(data.status)) {
    errors.push(`Invalid status: ${data.status}`);
  }
  
  // Validate transaction types
  const validTypes = ['Deposit', 'Withdrawal'];
  if (data.meta && typeof data.meta === 'object' && data.meta !== null) {
    const meta = data.meta as Record<string, unknown>;
    if (meta.transactionType && typeof meta.transactionType === 'string' && !validTypes.includes(meta.transactionType)) {
      errors.push(`Invalid transaction type: ${meta.transactionType}`);
    }
  }
  
  // Validate amount consistency - but be more flexible
  if (data.amount && data.meta && typeof data.meta === 'object' && data.meta !== null) {
    const meta = data.meta as Record<string, unknown>;
    if (meta.amount && data.amount !== meta.amount) {
      console.log(`⚠️ Amount mismatch: webhook=${data.amount}, meta=${meta.amount}`);
      // Don't treat this as an error, just log it
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 

export interface PayChanguTransferData {
  amount: number;
  currency: string;
  bank_uuid?: string; // For bank transfers
  bank_account_number?: string; // Bank account number (only for bank transfers)
  bank_account_name: string;
  charge_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  mobile_money_operator_ref_id?: string; // Required for mobile money transfers
  mobile?: string; // Mobile number for mobile money transfers
  payout_method?: 'bank_transfer' | 'mobile_money';
}

export interface PayChanguTransferResponse {
  success: boolean;
  message: string;
  transfer_id?: string;
  status?: string;
  error?: string;
  ref_id?: string; // PayChangu uses ref_id for transfer identification
}

export interface PayChanguBank {
  uuid: string;
  name: string;
  type: 'bank' | 'mobile_money';
  country: string;
}

export interface PayChanguOperator {
  ref_id: string;
  name: string;
  type: 'mobile_money';
  country: string;
}

/**
 * Get available banks and mobile money operators from PayChangu
 * Updated according to PayChangu documentation: https://developer.paychangu.com/reference/get-banks
 */
export async function getPayChanguBanks(): Promise<PayChanguBank[]> {
  try {
    console.log('🔍 Fetching PayChangu banks...')
    console.log('🔗 Endpoint: https://api.paychangu.com/direct-charge/payouts/supported-banks?currency=MWK')
    
    const response = await fetch('https://api.paychangu.com/direct-charge/payouts/supported-banks?currency=MWK', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`🔍 PayChangu banks response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('⚠️ PayChangu banks endpoint returned 403 Forbidden. This might mean:');
        console.warn('   - Your account doesn\'t have bank transfer permissions');
        console.warn('   - Bank transfers are not enabled for your account');
        console.warn('   - You need to contact PayChangu support to enable bank transfers');
        console.warn('   - Falling back to mobile money only');
        return [];
      }
      if (response.status === 401) {
        console.error('❌ Authentication failed - check your PAYCHANGU_SECRET_KEY');
        return [];
      }
      console.error(`❌ Failed to fetch banks: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch banks: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('💰 PayChangu banks response:', JSON.stringify(data, null, 2));
    
    // Handle different response structures based on PayChangu documentation
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ Found ${data.data.length} banks in data.data`)
      return data.data.map((bank: any) => ({
        uuid: bank.uuid || bank.ref_id,
        name: bank.name,
        type: 'bank' as const,
        country: bank.country || 'MW'
      }));
    } else if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} banks in direct array`)
      return data.map((bank: any) => ({
        uuid: bank.uuid || bank.ref_id,
        name: bank.name,
        type: 'bank' as const,
        country: bank.country || 'MW'
      }));
    } else if (data.banks && Array.isArray(data.banks)) {
      console.log(`✅ Found ${data.banks.length} banks in data.banks`)
      return data.banks.map((bank: any) => ({
        uuid: bank.uuid || bank.ref_id,
        name: bank.name,
        type: 'bank' as const,
        country: bank.country || 'MW'
      }));
    }
    
    console.log('⚠️ No banks found in response')
    return [];
  } catch (error) {
    console.error('Error fetching PayChangu banks:', error);
    console.warn('⚠️ Returning empty banks array. Bank transfers may not be available.');
    return [];
  }
}

/**
 * Get mobile money operators from PayChangu
 * Updated according to PayChangu documentation: https://developer.paychangu.com/reference/get-operator
 */
export async function getPayChanguOperators(): Promise<PayChanguOperator[]> {
  try {
    console.log('🔍 Fetching PayChangu mobile money operators...')
    console.log('🔗 Endpoint: https://api.paychangu.com/mobile-money/')
    
    const response = await fetch('https://api.paychangu.com/mobile-money/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`🔍 PayChangu operators response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      if (response.status === 403) {
        console.warn('⚠️ PayChangu operators endpoint returned 403 Forbidden. This might mean:');
        console.warn('   - Your account doesn\'t have mobile money permissions');
        console.warn('   - Mobile money transfers are not enabled for your account');
        console.warn('   - You need to contact PayChangu support to enable mobile money');
        return [];
      }
      if (response.status === 401) {
        console.error('❌ Authentication failed - check your PAYCHANGU_SECRET_KEY');
        return [];
      }
      console.error(`❌ Failed to fetch operators: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch operators: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('💰 PayChangu operators response:', JSON.stringify(data, null, 2));
    
    // Handle different response structures based on PayChangu documentation
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ Found ${data.data.length} operators in data.data`)
      return data.data.map((operator: any) => ({
        ref_id: operator.ref_id || operator.uuid,
        name: operator.name,
        type: 'mobile_money' as const,
        country: operator.country || 'MW'
      }));
    } else if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} operators in direct array`)
      return data.map((operator: any) => ({
        ref_id: operator.ref_id || operator.uuid,
        name: operator.name,
        type: 'mobile_money' as const,
        country: operator.country || 'MW'
      }));
    } else if (data.operators && Array.isArray(data.operators)) {
      console.log(`✅ Found ${data.operators.length} operators in data.operators`)
      return data.operators.map((operator: any) => ({
        ref_id: operator.ref_id || operator.uuid,
        name: operator.name,
        type: 'mobile_money' as const,
        country: operator.country || 'MW'
      }));
    }
    
    console.log('⚠️ No operators found in response')
    return [];
  } catch (error) {
    console.error('Error fetching PayChangu operators:', error);
    return [];
  }
}

/**
 * Create a PayChangu mobile money transfer (withdrawal)
 * Updated according to PayChangu documentation: https://developer.paychangu.com/docs/mobile-money
 */
export async function createPayChanguMobileMoneyTransfer(
  transferData: PayChanguTransferData
): Promise<PayChanguTransferResponse> {
  try {
    console.log('💰 Creating PayChangu mobile money transfer:', transferData);

    const response = await fetch('https://api.paychangu.com/mobile-money/payouts/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        mobile_money_operator_ref_id: transferData.mobile_money_operator_ref_id,
        mobile: transferData.mobile,
        amount: transferData.amount.toString(),
        charge_id: transferData.charge_id
      })
    });

    const data = await response.json();
    console.log('💰 PayChangu mobile money transfer response:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Mobile money transfer failed',
        error: data.error || 'Unknown error'
      };
    }

    // Handle the response structure according to PayChangu documentation
    const transferInfo = data.data || data;
    return {
      success: true,
      message: 'Mobile money transfer initiated successfully',
      transfer_id: transferInfo.ref_id || transferInfo.trans_id,
      ref_id: transferInfo.ref_id,
      status: transferInfo.status
    };
  } catch (error) {
    console.error('Error creating PayChangu mobile money transfer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Mobile money transfer failed',
      error: 'Network error'
    };
  }
}

/**
 * Create a PayChangu bank transfer (withdrawal)
 */
export async function createPayChanguBankTransfer(
  transferData: PayChanguTransferData
): Promise<PayChanguTransferResponse> {
  try {
    console.log('💰 Creating PayChangu bank transfer:', transferData);

    const response = await fetch('https://api.paychangu.com/direct-charge/payouts/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payout_method: 'bank_transfer',
        bank_uuid: transferData.bank_uuid,
        amount: transferData.amount.toString(),
        charge_id: transferData.charge_id,
        bank_account_name: transferData.bank_account_name,
        bank_account_number: transferData.bank_account_number,
        email: transferData.email,
        first_name: transferData.first_name,
        last_name: transferData.last_name
      })
    });

    const data = await response.json();
    console.log('💰 PayChangu bank transfer response:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Bank transfer failed',
        error: data.error || 'Unknown error'
      };
    }

    // Handle the nested transaction structure in bank transfer response
    const transaction = data.data?.transaction || data.transaction || data;
    return {
      success: true,
      message: 'Bank transfer initiated successfully',
      transfer_id: transaction.ref_id || transaction.transfer_id,
      ref_id: transaction.ref_id,
      status: transaction.status
    };
  } catch (error) {
    console.error('Error creating PayChangu bank transfer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bank transfer failed',
      error: 'Network error'
    };
  }
}

/**
 * Create a PayChangu transfer (withdrawal) - Updated to use correct endpoints
 */
export async function createPayChanguTransfer(
  transferData: PayChanguTransferData
): Promise<PayChanguTransferResponse> {
  // Determine if this is a mobile money or bank transfer
  const isMobileMoney = transferData.mobile_money_operator_ref_id || 
                       transferData.bank_uuid?.includes('money') || 
                       transferData.bank_uuid?.includes('mpamba');

  if (isMobileMoney) {
    return createPayChanguMobileMoneyTransfer(transferData);
  } else {
    return createPayChanguBankTransfer(transferData);
  }
}

/**
 * Verify a PayChangu transfer status
 * Note: This endpoint may need to be updated based on PayChangu's actual API
 */
export async function verifyPayChanguTransfer(transferId: string): Promise<PayChanguTransferResponse> {
  try {
    // Try the mobile money payout details endpoint first
    const response = await fetch(`https://api.paychangu.com/mobile-money/payouts/${transferId}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
    const data = await response.json();
      console.log('💰 PayChangu mobile money transfer verification response:', data);

      return {
        success: true,
        message: 'Mobile money transfer verification successful',
        transfer_id: data.data?.ref_id || data.ref_id,
        status: data.data?.status || data.status
      };
    }

    // If mobile money endpoint fails, try bank payout details
    const bankResponse = await fetch(`https://api.paychangu.com/direct-charge/payouts/${transferId}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (bankResponse.ok) {
      const data = await bankResponse.json();
      console.log('💰 PayChangu bank transfer verification response:', data);

      return {
        success: true,
        message: 'Bank transfer verification successful',
        transfer_id: data.data?.ref_id || data.ref_id,
        status: data.data?.status || data.status
      };
    }

    return {
      success: false,
      message: 'Transfer verification failed',
      error: 'Transfer not found'
    };
  } catch (error) {
    console.error('Error verifying PayChangu transfer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Transfer verification failed',
      error: 'Network error'
    };
  }
} 

/**
 * Get single charge details from PayChangu
 */
export async function getPayChanguChargeDetails(chargeId: string): Promise<unknown> {
  try {
    const response = await fetch(`https://api.paychangu.com/mobile-money/payments/${chargeId}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charge details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('💰 PayChangu charge details response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching PayChangu charge details:', error);
    throw error;
  }
} 