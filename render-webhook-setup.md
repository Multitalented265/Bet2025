# Render Webhook Setup Guide for PayChangu

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables Setup
Make sure these are set in your Render dashboard:

```bash
# Required for Render deployment
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your-secret-key

# PayChangu Configuration
PAYCHANGU_PUBLIC_KEY=pub-test-your-public-key
PAYCHANGU_SECRET_KEY=sec-test-your-secret-key

# Render-specific URLs (will be auto-generated)
PAYCHANGU_WEBHOOK_URL=https://your-app-name.onrender.com/api/paychangu/webhook
PAYCHANGU_CALLBACK_URL=https://your-app-name.onrender.com/dashboard/wallet
PAYCHANGU_RETURN_URL=https://your-app-name.onrender.com/dashboard/wallet

# Admin credentials
ADMIN_EMAIL=admin@bet2025.com
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_ADMIN_EMAIL=admin@bet2025.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

### 2. Database Migration
After deployment, run:
```bash
npx prisma migrate deploy
```

## 🔧 Webhook Configuration

### PayChangu Dashboard Setup
1. Log into your PayChangu dashboard
2. Go to Settings → Webhooks
3. Add your webhook URL: `https://your-app-name.onrender.com/api/paychangu/webhook`
4. Select events: `api.charge.payment`
5. Save the webhook configuration

### Webhook Security
Your webhook handler includes:
- ✅ HMAC signature verification
- ✅ Request validation
- ✅ Duplicate transaction prevention
- ✅ Comprehensive logging
- ✅ Error handling

## 🧪 Testing Your Webhooks

### 1. Test Webhook Endpoint
```bash
# Test webhook endpoint is accessible
curl -X GET https://your-app-name.onrender.com/api/paychangu/webhook

# Expected response:
{
  "message": "PayChangu webhook endpoint is active",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "security": "Enhanced signature verification enabled",
  "environment": "production"
}
```

### 2. Test Payment Flow
1. Create a test payment in your app
2. Complete the payment on PayChangu
3. Check Render logs for webhook processing
4. Verify user balance is updated

### 3. Monitor Webhook Logs
In your Render dashboard:
1. Go to your web service
2. Click on "Logs"
3. Look for webhook processing messages

## 🔍 Debugging Webhooks

### Common Issues & Solutions

#### 1. Webhook Not Receiving
```bash
# Check if webhook URL is accessible
curl -X POST https://your-app-name.onrender.com/api/paychangu/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### 2. Signature Verification Failing
- Verify `PAYCHANGU_SECRET_KEY` is correct
- Check if using test vs production keys
- Ensure webhook URL matches exactly

#### 3. Database Connection Issues
```bash
# Check database connection
npx prisma db push
npx prisma generate
```

#### 4. Environment Variables Missing
Check Render dashboard → Environment → Environment Variables

## 📊 Monitoring & Logging

### Webhook Logs to Watch For
```
✅ SUCCESS INDICATORS:
🔔 ===== WEBHOOK REQUEST RECEIVED =====
✅ Successfully parsed JSON body
🔐 Webhook signature verification: { isValid: true }
✅ Webhook processing payment
✅ Transaction TX_123456789 is new, proceeding with processing...
✅ Webhook: Deposit processed successfully for tx_ref: TX_123456789
🎉 Webhook processing completed successfully for tx_ref: TX_123456789

❌ ERROR INDICATORS:
❌ Failed to parse request body
❌ SECURITY ALERT: Invalid or missing webhook signature in production
❌ Invalid webhook data
❌ User not found by email
❌ Database error finding user
```

### Render Log Monitoring
1. **Real-time logs**: Render dashboard → Logs
2. **Error tracking**: Look for ❌ symbols
3. **Performance**: Monitor response times
4. **Security**: Check signature verification logs

## 🛡️ Security Best Practices

### 1. Signature Verification
- Always verify webhook signatures in production
- Use constant-time comparison
- Log verification attempts

### 2. Environment Variables
- Never commit secrets to Git
- Use Render's environment variable system
- Rotate keys regularly

### 3. Database Security
- Use connection pooling
- Implement proper error handling
- Validate all input data

### 4. Rate Limiting
Consider implementing rate limiting for webhook endpoints:
```typescript
// Add to your webhook route
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 🚀 Production Deployment Checklist

### Before Going Live:
- [ ] Test webhook signature verification
- [ ] Verify database migrations
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring and alerts
- [ ] Configure error notifications
- [ ] Test with small amounts first
- [ ] Verify all environment variables
- [ ] Check SSL certificate is valid
- [ ] Test webhook retry mechanism

### Post-Deployment:
- [ ] Monitor webhook logs for 24 hours
- [ ] Verify successful payments are processed
- [ ] Check failed payments are handled
- [ ] Test webhook retry scenarios
- [ ] Monitor database performance
- [ ] Set up backup procedures

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Add custom domain in Render dashboard
2. Update webhook URLs to use custom domain
3. Update PayChangu webhook configuration
4. Test webhook functionality

### SSL Certificate
- Render provides automatic SSL certificates
- Ensure your domain is properly configured
- Test HTTPS webhook delivery

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_transactions_tx_ref ON "Transaction"(txRef);
CREATE INDEX idx_transactions_user_id ON "Transaction"(userId);
CREATE INDEX idx_bets_user_id ON "Bet"(userId);
```

## 📞 Support Resources

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### PayChangu Support
- Documentation: https://developer.paychangu.com
- API Reference: https://developer.paychangu.com/docs
- Support: Contact PayChangu support team

### Your Application
- Webhook endpoint: `/api/paychangu/webhook`
- Callback URL: `/dashboard/wallet`
- Admin panel: `/admin`

## 🎯 Success Metrics

Track these metrics to ensure webhook health:
- ✅ Webhook delivery success rate: >99%
- ✅ Payment processing success rate: >95%
- ✅ Average response time: <2 seconds
- ✅ Error rate: <1%
- ✅ Database connection stability: 100%

Your webhook setup is now ready for production! 🚀 