import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'
import { createPayChanguTransfer, PayChanguTransferData, getPayChanguOperators, getPayChanguBanks } from '@/lib/paychangu'



export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    
    if (!session?.user?.id) {
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    
    const { 
      amount: amountString, 
      bank_uuid, 
      bank_account_number, 
      bank_account_name
    } = body
    
    // Convert amount to number to prevent string concatenation issues
    const amount = parseFloat(amountString)
    
    

    if (!amount || isNaN(amount) || amount <= 0) {
      
      return NextResponse.json({ 
        success: false,
        error: 'Invalid amount' 
      }, { status: 200 })
    }

    if (!bank_uuid || !bank_account_number || !bank_account_name) {
      
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: bank_uuid, bank_account_number, bank_account_name' 
      }, { status: 200 })
    }

    // Process withdrawal request (creates pending transaction and deducts balance)
    
    const result = await WalletService.processWithdrawal(session.user.id, amount)
    

    if (!result.success) {
      
      // Return 200 status for insufficient funds but with error message
      // This allows the frontend to handle the error gracefully
      return NextResponse.json({ 
        success: false,
        error: result.message 
      }, { status: 200 })
    }
    
    

    // Determine if this is mobile money or bank transfer
    // We need to fetch the operators and banks to determine the type
    const [operators, banks] = await Promise.all([
      getPayChanguOperators(),
      getPayChanguBanks()
    ]);
    
    
    
    // Check if the selected ID is a mobile money operator (compare with ref_id)
    const isMobileMoney = operators.some((op: unknown) => (op as Record<string, unknown>).ref_id === bank_uuid);
    
    // Check if the selected ID is a bank (compare with uuid)
    const isBank = banks.some((bank: unknown) => (bank as Record<string, unknown>).uuid === bank_uuid);
    
    
    
    // If neither mobile money nor bank is found, return error
    if (!isMobileMoney && !isBank) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid bank or mobile money operator selected. Please try again.',
        details: `Selected ID: ${bank_uuid} not found in available options.`
      }, { status: 200 })
    }
    
    // If user selected a bank but no banks are available, show error
    if (isBank && banks.length === 0) {
      
      return NextResponse.json({ 
        success: false,
        error: 'Bank transfers are not currently available. Please use mobile money options.',
        details: 'Your PayChangu account may not have bank transfer permissions enabled.'
      }, { status: 200 })
    }

    // Create PayChangu transfer data
    const transferData: PayChanguTransferData = {
      amount: result.withdrawnAmount!,
              currency: 'MWK',
      bank_account_number: isMobileMoney ? '' : bank_account_number, // Only for bank transfers
      bank_account_name,
      charge_id: result.txRef,
      email: session.user.email || '',
      first_name: session.user.name?.split(' ')[0] || '',
      last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
      // Set the appropriate field based on transfer type
      ...(isMobileMoney ? {
        mobile_money_operator_ref_id: bank_uuid,
        mobile: bank_account_number // Use mobile field for mobile money
      } : {
        bank_uuid: bank_uuid
      })
    }

    

    // Create PayChangu transfer
    
    const transferResult = await createPayChanguTransfer(transferData)
    

    if (!transferResult.success) {
      // If PayChangu transfer fails, we need to reverse the balance deduction
      console.error('❌ PayChangu transfer failed, reversing balance deduction')
      
      
      // Reverse the balance deduction
      await WalletService.reverseWithdrawal(session.user.id, amount, result.txRef!)
      
      return NextResponse.json({ 
        success: false,
        error: transferResult.message || 'Transfer failed',
        details: transferResult.error 
      }, { status: 200 })
    }

    // Since the transfer was successful, mark the transaction as completed
    
    await WalletService.completeWithdrawal(result.txRef!, transferResult)

    

    return NextResponse.json({
      success: true,
      message: 'Withdrawal completed successfully',
      tx_ref: result.txRef,
      transfer_id: transferResult.transfer_id,
      amount: result.withdrawnAmount,
      fee: result.fee,
      status: 'completed'
    })

  } catch (error) {
    console.error('❌ Withdrawal API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 