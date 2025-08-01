import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WalletService } from '@/lib/wallet-service'
import { createPayChanguTransfer, PayChanguTransferData, getPayChanguOperators, getPayChanguBanks } from '@/lib/paychangu'



export async function POST(request: NextRequest) {
  console.log('🚀 === WITHDRAWAL API CALL STARTED ===')
  try {
    const session = await getSession()
    console.log(`🔍 Session check: User ID = ${session?.user?.id ? '✅ Found' : '❌ Not found'}`)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No valid session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Request body received:', JSON.stringify(body, null, 2))
    
    const { 
      amount: amountString, 
      bank_uuid, 
      bank_account_number, 
      bank_account_name
    } = body
    
    // Convert amount to number to prevent string concatenation issues
    const amount = parseFloat(amountString)
    
    console.log(`🔍 Request parameters:`)
    console.log(`  - Amount (original): ${amountString}`)
    console.log(`  - Amount (converted): ${amount}`)
    console.log(`  - Amount type: ${typeof amount}`)
    console.log(`  - Bank UUID: ${bank_uuid}`)
    console.log(`  - Account Number: ${bank_account_number}`)
    console.log(`  - Account Name: ${bank_account_name}`)

    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('❌ Validation failed: Invalid amount')
      console.log(`  - Amount provided: ${amount}`)
      console.log(`  - Is NaN: ${isNaN(amount)}`)
      console.log(`  - Is <= 0: ${amount <= 0}`)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid amount' 
      }, { status: 200 })
    }

    if (!bank_uuid || !bank_account_number || !bank_account_name) {
      console.log('❌ Validation failed: Missing required fields')
      console.log(`  - bank_uuid: ${bank_uuid ? '✅ Present' : '❌ Missing'}`)
      console.log(`  - bank_account_number: ${bank_account_number ? '✅ Present' : '❌ Missing'}`)
      console.log(`  - bank_account_name: ${bank_account_name ? '✅ Present' : '❌ Missing'}`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: bank_uuid, bank_account_number, bank_account_name' 
      }, { status: 200 })
    }

    // Process withdrawal request (creates pending transaction and deducts balance)
    console.log(`🔍 Processing withdrawal for user ${session.user.id}, amount: ${amount}`)
    const result = await WalletService.processWithdrawal(session.user.id, amount)
    console.log(`🔍 Withdrawal result:`, JSON.stringify(result, null, 2))

    if (!result.success) {
      console.log(`❌ Withdrawal failed: ${result.message}`)
      console.log(`📤 Returning 200 status with error message`)
      // Return 200 status for insufficient funds but with error message
      // This allows the frontend to handle the error gracefully
      return NextResponse.json({ 
        success: false,
        error: result.message 
      }, { status: 200 })
    }
    
    console.log(`✅ Withdrawal processing successful: TX Ref = ${result.txRef}`)

    // Determine if this is mobile money or bank transfer
    // We need to fetch the operators and banks to determine the type
    const [operators, banks] = await Promise.all([
      getPayChanguOperators(),
      getPayChanguBanks()
    ]);
    
    console.log(`🔍 Checking transfer type: bank_uuid=${bank_uuid}`)
    console.log(`🔍 Available operators:`, operators.map(op => ({ name: op.name, ref_id: op.ref_id })))
    console.log(`🔍 Available banks:`, banks.map(bank => ({ name: bank.name, uuid: bank.uuid })))
    
    // Check if the selected ID is a mobile money operator (compare with ref_id)
    const isMobileMoney = operators.some((op: unknown) => (op as Record<string, unknown>).ref_id === bank_uuid);
    
    // Check if the selected ID is a bank (compare with uuid)
    const isBank = banks.some((bank: unknown) => (bank as Record<string, unknown>).uuid === bank_uuid);
    
    console.log(`🔍 Transfer type check: isMobileMoney=${isMobileMoney}, isBank=${isBank}`)
    
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
      console.log('❌ Bank transfers not available')
      console.log(`📤 Returning 200 status with bank availability error`)
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

    console.log(`💰 Creating PayChangu transfer data:`)
    console.log(`  - Transfer type: ${isMobileMoney ? 'Mobile Money' : 'Bank Transfer'}`)
    console.log(`  - Amount: ${result.withdrawnAmount}`)
          console.log(`  - Currency: MWK`)
    console.log(`  - Bank UUID: ${bank_uuid}`)
    console.log(`  - Account Number: ${bank_account_number}`)
    console.log(`  - Account Name: ${bank_account_name}`)
    console.log(`  - Charge ID: ${result.txRef}`)
    console.log(`  - Email: ${session.user.email || 'N/A'}`)
    console.log(`  - Name: ${session.user.name || 'N/A'}`)
    console.log(`💰 Initiating PayChangu transfer for withdrawal: User ${session.user.id}, Amount: ${amount}, TX: ${result.txRef}, Type: ${isMobileMoney ? 'Mobile Money' : 'Bank Transfer'}`)

    // Create PayChangu transfer
    console.log(`🔄 Calling createPayChanguTransfer...`)
    const transferResult = await createPayChanguTransfer(transferData)
    console.log(`🔍 PayChangu transfer result:`, JSON.stringify(transferResult, null, 2))

    if (!transferResult.success) {
      // If PayChangu transfer fails, we need to reverse the balance deduction
      console.error('❌ PayChangu transfer failed, reversing balance deduction')
      console.log(`📤 Returning 200 status with transfer failure error`)
      
      // Reverse the balance deduction
      await WalletService.reverseWithdrawal(session.user.id, amount, result.txRef!)
      
      return NextResponse.json({ 
        success: false,
        error: transferResult.message || 'Transfer failed',
        details: transferResult.error 
      }, { status: 200 })
    }

    // Since the transfer was successful, mark the transaction as completed
    console.log(`🔄 Marking transaction as completed since transfer was successful`)
    await WalletService.completeWithdrawal(result.txRef!, transferResult)

    console.log(`✅ PayChangu transfer completed successfully: Transfer ID: ${transferResult.transfer_id}`)
    console.log(`📤 Returning 200 status with success response`)

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
    console.log(`📤 Returning 500 status with internal server error`)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 