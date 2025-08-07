import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current balance
    const balance = await WalletService.getUserBalance(session.user.id)
    
    // Get user's recent transactions
    const transactions = await WalletService.getUserTransactions(session.user.id, 50)

    return NextResponse.json({
      balance,
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount.toString()),
        fee: parseFloat(tx.fee.toString()),
        status: tx.status,
        date: tx.date,
        txRef: tx.txRef
      }))
    })

  } catch (error) {
    console.error('Wallet data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 