import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for webhook logs (in production, use a database)
let webhookLogs: Array<{
  id: string
  timestamp: string
  method: string
  headers: Record<string, string>
  body: unknown
  status: number
  response: unknown
}> = []

export async function POST(request: NextRequest) {
  const logId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const timestamp = new Date().toISOString()
  
  console.log(`🔔 ===== WEBHOOK MONITOR RECEIVED [${logId}] =====`)
  console.log(`📅 Timestamp: ${timestamp}`)
  console.log(`🌐 Request URL: ${request.url}`)
  console.log(`📋 Request Method: ${request.method}`)
  
  // Capture all headers
  const headers = Object.fromEntries(request.headers.entries())
  console.log(`🔍 All Headers:`, JSON.stringify(headers, null, 2))
  
  // Capture raw body
  const rawBody = await request.text()
  console.log(`📦 Raw Body: ${rawBody}`)
  
  let body
  try {
    body = JSON.parse(rawBody)
    console.log(`✅ JSON parsed successfully`)
  } catch (error) {
    console.error(`❌ JSON parse error: ${error}`)
    body = { rawText: rawBody }
  }
  
  // Log the webhook
  const webhookLog = {
    id: logId,
    timestamp,
    method: request.method,
    headers,
    body,
    status: 200,
    response: { message: 'Webhook received by monitor' }
  }
  
  webhookLogs.push(webhookLog)
  
  // Keep only last 100 logs
  if (webhookLogs.length > 100) {
    webhookLogs = webhookLogs.slice(-100)
  }
  
  console.log(`✅ Webhook logged with ID: ${logId}`)
  console.log(`📊 Total webhooks logged: ${webhookLogs.length}`)
  
  return NextResponse.json({
    message: 'Webhook received by monitor',
    logId,
    timestamp,
    totalLogs: webhookLogs.length
  })
}

export async function GET(request: NextRequest) {
  console.log('🔍 Webhook monitor dashboard accessed')
  
  return NextResponse.json({
    message: 'Webhook Monitor Dashboard',
    timestamp: new Date().toISOString(),
    totalLogs: webhookLogs.length,
    recentLogs: webhookLogs.slice(-10).map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      method: log.method,
      hasBody: !!log.body,
      bodyKeys: log.body ? Object.keys(log.body) : []
    })),
    endpoint: '/api/paychangu/webhook-monitor',
    instructions: 'Send POST requests to this endpoint to monitor webhook delivery'
  })
} 