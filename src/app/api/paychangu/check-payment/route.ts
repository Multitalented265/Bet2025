import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const txRef = searchParams.get('tx_ref')

  if (!txRef) {
    return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 })
  }

  try {
    // Check if transaction exists in our database
    const transaction = await prisma.transaction.findFirst({
      where: { txRef: txRef }
    })

    if (transaction) {
      return NextResponse.json({
        status: transaction.status,
        amount: transaction.amount,
        date: transaction.date
      })
    }

    // If not in our database, try to check with PayChangu API
    try {
      const response = await fetch('https://api.paychangu.com/transaction/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.PAYCHANGU_SECRET_KEY}`
        },
        body: JSON.stringify({
          tx_ref: txRef
        })
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          status: data.status || 'unknown',
          amount: data.amount,
          currency: data.currency,
          message: data.message
        })
      } else {
        return NextResponse.json({
          status: 'unknown',
          message: 'Transaction not found or still processing'
        })
      }
    } catch (error) {
      console.error('Error checking PayChangu API:', error)
      return NextResponse.json({
        status: 'unknown',
        message: 'Unable to verify transaction status'
      })
    }
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 