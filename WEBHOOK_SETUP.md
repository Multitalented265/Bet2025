# PayChangu Webhook Setup Guide

## ✅ Current Status: WEBHOOK ENDPOINT IS READY

Your PayChangu webhook endpoint is **already fully functional** and configured to receive webhook data from PayChangu.

## 📍 Webhook Endpoint Details

**URL**: `https://bet2025-2.onrender.com/api/paychangu/webhook`
**Methods**: 
- `POST` - Receives webhook data from PayChangu
- `GET` - Handles user redirects and verification

## 🔧 Environment Configuration

Your environment variables have been updated to match your production deployment:

```env
NEXTAUTH_URL=https://bet2025-2.onrender.com
PAYCHANGU_WEBHOOK_URL=https://bet2025-2.onrender.com/api/paychangu/webhook
PAYCHANGU_CALLBACK_URL=https://bet2025-2.onrender.com/dashboard/wallet
PAYCHANGU_RETURN_URL=https://bet2025-2.onrender.com/dashboard/wallet
```

## 🧪 Testing Your Webhook

### 1. Test Configuration
Visit: `https://bet2025-2.onrender.com/api/paychangu/config`

This will verify your PayChangu configuration and environment variables.

### 2. Test Webhook Accessibility
Visit: `https://bet2025-2.onrender.com/api/paychangu/test-webhook`

This will test if your webhook endpoint is accessible and properly configured.

### 3. Test Webhook Processing
Send a POST request to: `https://bet2025-2.onrender.com/api/paychangu/test-webhook`

With a test payload to verify webhook processing.

## 🔄 How the Webhook Works

### POST Request (Webhook Data)
When PayChangu sends webhook data:

1. **Signature Verification** - Verifies the webhook signature for security
2. **Data Validation** - Validates the webhook data structure
3. **Duplicate Check** - Prevents processing the same transaction twice
4. **Payment Processing** - Processes deposits or withdrawals
5. **Database Update** - Updates user wallet balance
6. **Response** - Returns success/error response to PayChangu

### GET Request (User Redirects)
When users are redirected after payment:

1. **Parameter Extraction** - Gets `tx_ref` and `status` from URL
2. **Redirect Logic** - Redirects to appropriate wallet page
3. **Status Handling** - Shows success/failure message to user

## 📊 Webhook Data Structure

PayChangu sends webhook data in this format:

```json
{
  "tx_ref": "TX_123456789",
  "reference": "TX_123456789",
  "status": "success",
  "amount": 1000,
  "currency": "NGN",
  "event_type": "api.charge.payment",
  "customer": {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "meta": {
    "userId": "user_id_here",
    "transactionType": "Deposit",
    "amount": 1000
  }
}
```

## 🔐 Security Features

- **Signature Verification** - Validates webhook authenticity
- **Environment Checks** - Different security levels for dev/prod
- **Duplicate Prevention** - Prevents double-processing transactions
- **Error Handling** - Comprehensive error logging and responses

## 🚀 Deployment Status

Your webhook endpoint is **live and ready** at:
- **Production**: `https://bet2025-2.onrender.com/api/paychangu/webhook`
- **Test Endpoint**: `https://bet2025-2.onrender.com/api/paychangu/test-webhook`
- **Config Check**: `https://bet2025-2.onrender.com/api/paychangu/config`

## 📝 Next Steps

1. **Test the webhook** using the test endpoints above
2. **Configure PayChangu** to send webhooks to your endpoint
3. **Monitor logs** for webhook activity
4. **Verify transactions** are being processed correctly

## 🔍 Troubleshooting

If webhooks aren't working:

1. Check the test endpoints for configuration issues
2. Verify environment variables are set correctly
3. Check server logs for error messages
4. Ensure PayChangu is configured with the correct webhook URL

## 📞 Support

The webhook endpoint includes comprehensive logging. Check your server logs for detailed information about webhook processing. 