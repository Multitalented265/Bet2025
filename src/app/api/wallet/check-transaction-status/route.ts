import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const txRef = searchParams.get('tx_ref')
    const action = searchParams.get('action') // 'check' or 'fix_stuck'

    

    if (action === 'fix_stuck') {
      // Check and fix stuck pending transactions
      
      await WalletService.checkStuckPendingTransactions()
      
      return NextResponse.json({
        success: true,
        message: 'Stuck transaction check completed'
      })
    }

    if (!txRef) {
      return NextResponse.json({ 
        success: false,
        error: 'Transaction reference (tx_ref) is required' 
      }, { status: 200 })
    }

    // Get transaction status
    const status = await WalletService.getTransactionStatus(txRef)
    
    

    return NextResponse.json({
      success: true,
      tx_ref: txRef,
      status: status
    })

  } catch (error) {
    console.error('❌ Transaction status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 