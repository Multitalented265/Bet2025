# Test webhook with the exact data format from the logs
$webhookData = @{
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

$jsonData = $webhookData | ConvertTo-Json -Depth 5

Write-Host "Testing webhook with data:"
Write-Host $jsonData

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "https://bet2025-2.onrender.com/api/paychangu/process-payment" -Method POST -Body $jsonData -Headers $headers
    Write-Host "Response Status: $($response.StatusCode)"
    Write-Host "Response Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
} 