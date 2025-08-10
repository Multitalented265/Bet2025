import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tx_ref, status } = body

    

    if (!tx_ref || !status) {
      return NextResponse.json({ 
        success: false,
        error: 'Transaction reference (tx_ref) and status are required' 
      }, { status: 200 })
    }

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return NextResponse.json({ 
        success: false,
        error: 'Status must be one of: pending, completed, failed' 
      }, { status: 200 })
    }

    // Get current transaction status
    const currentStatus = await WalletService.getTransactionStatus(tx_ref)
    

    if (status === 'completed' && currentStatus === 'pending') {
      // Complete the withdrawal
      const result = await WalletService.completeWithdrawal(tx_ref, {})
      
      if (result.success) {
        
        return NextResponse.json({
          success: true,
          message: 'Transaction status updated to completed',
          tx_ref,
          status: 'completed'
        })
      } else {
        
        return NextResponse.json({
          success: false,
          error: result.message
        }, { status: 200 })
      }
    } else {
      
      return NextResponse.json({
        success: false,
        error: `Cannot update status from ${currentStatus} to ${status}`
      }, { status: 200 })
    }

  } catch (error) {
    console.error('❌ Transaction status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 