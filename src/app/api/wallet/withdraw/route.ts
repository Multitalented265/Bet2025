import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'
import { createPayChanguPaymentData } from '@/lib/paychangu'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Process withdrawal request
    const result = await WalletService.processWithdrawal(session.user.id, amount)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // Create PayChangu withdrawal data
    const customer = {
      email: session.user.email || '',
      first_name: session.user.name?.split(' ')[0] || '',
      last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
    }

    const paychanguData = createPayChanguPaymentData(
      result.withdrawnAmount!,
      customer,
      session.user.id,
      'Withdrawal'
    )

    // Update the transaction reference to match the one from WalletService
    paychanguData.tx_ref = result.txRef!

    console.log(`Withdrawal request created: User ${session.user.id}, Amount: ${amount}, TX: ${result.txRef}`)

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request created successfully',
      tx_ref: result.txRef,
      amount: result.withdrawnAmount,
      fee: result.fee,
      paychangu_data: paychanguData
    })

  } catch (error) {
    console.error('Withdrawal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 