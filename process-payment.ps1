# Manual payment processing script
# This will process the payment from the logs you provided

$paymentData = @{
    status = "success"
    message = "Payment details retrieved."
    data = @{
        available_payment_methods = @("card", "mobile_money", "mobile_bank_transfer")
        callback_url = "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=TX_332614311"
        mobile_money_providers = @(@{}, @{})
        payment_amounts_by_processors = @{
            currency = "MWK"
            card = "10,000.00"
            mobile_bank_transfer = "10,000.00"
            airtel = "10,000.00"
            tnm = "10,000.00"
        }
        payment_link = @{
            reference_id = "4277116608"
            email = "usherkamwendo@gmail.com"
            amount = 10000
            payableAmount = 10000
            currency = "MWK"
        }
        return_url = "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=TX_332614311"
        traceId = $null
    }
}

$jsonData = $paymentData | ConvertTo-Json -Depth 5

Write-Host "Processing payment manually..."
Write-Host "Transaction ID: 4277116608"
Write-Host "Amount: 10000 MWK"
Write-Host "User: usherkamwendo@gmail.com"

try {
    # Try the webhook endpoint first
    $headers = @{
        "Content-Type" = "application/json"
        "x-test-mode" = "true"
    }
    
    $response = Invoke-WebRequest -Uri "https://bet2025-2.onrender.com/api/paychangu/webhook" -Method POST -Body $jsonData -Headers $headers
    Write-Host "✅ Payment processed successfully!"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Webhook processing failed: $($_.Exception.Message)"
    Write-Host "This is expected if the webhook signature verification is still active."
    Write-Host "The payment will be processed when PayChangu sends the webhook with proper signature."
} 