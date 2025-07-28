import { PrismaClient } from '@prisma/client'
import { addTransaction, getUserById, invalidateUserCache } from './data'

const prisma = new PrismaClient()

export interface WalletTransaction {
  userId: string
  type: 'Deposit' | 'Withdrawal' | 'Winnings'
  amount: number
  fee: number
  txRef: string
  status: 'pending' | 'completed' | 'failed'
  paychanguResponse?: any
}

export interface DepositResult {
  success: boolean
  message: string
  txRef?: string
  creditedAmount?: number
  fee?: number
}

export interface WithdrawalResult {
  success: boolean
  message: string
  txRef?: string
  withdrawnAmount?: number
  fee?: number
}

export class WalletService {
  private static readonly DEPOSIT_FEE_RATE = 0.025 // 2.5%
  private static readonly WITHDRAWAL_FEE_RATE = 0.025 // 2.5%

  /**
   * Calculate fee for a given amount
   */
  static calculateFee(amount: number, type: 'Deposit' | 'Withdrawal'): number {
    const feeRate = type === 'Deposit' ? this.DEPOSIT_FEE_RATE : this.WITHDRAWAL_FEE_RATE
    return Math.round(amount * feeRate * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Process a deposit from PayChangu
   */
  static async processDeposit(
    userId: string,
    paychanguAmount: number,
    txRef: string,
    paychanguResponse?: any
  ): Promise<DepositResult> {
    try {
      // Start database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Get user
        const user = await tx.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          throw new Error('User not found')
        }

        // Calculate fee and credited amount
        const fee = this.calculateFee(paychanguAmount, 'Deposit')
        const creditedAmount = paychanguAmount - fee

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'Deposit',
            amount: paychanguAmount,
            fee,
            txRef,
            status: 'completed',
            date: new Date()
          }
        })

        // Update user balance
        const newBalance = parseFloat(user.balance.toString()) + creditedAmount
        await tx.user.update({
          where: { id: userId },
          data: { balance: newBalance }
        })

        return {
          success: true,
          message: 'Deposit processed successfully',
          txRef,
          creditedAmount,
          fee
        }
      })

      // Invalidate user cache to ensure fresh balance data
      await invalidateUserCache(userId)

      console.log(`Deposit processed: User ${userId}, Amount: ${paychanguAmount}, Fee: ${result.fee}, Credited: ${result.creditedAmount}`)
      return result

    } catch (error) {
      console.error('Deposit processing error:', error)
      
      // Log failed transaction
      await this.logFailedTransaction({
        userId,
        type: 'Deposit',
        amount: paychanguAmount,
        fee: this.calculateFee(paychanguAmount, 'Deposit'),
        txRef,
        status: 'failed',
        paychanguResponse
      })

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deposit processing failed'
      }
    }
  }

  /**
   * Process a withdrawal request
   */
  static async processWithdrawal(
    userId: string,
    requestedAmount: number
  ): Promise<WithdrawalResult> {
    try {
      // Start database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Get user
        const user = await tx.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          throw new Error('User not found')
        }

        const currentBalance = parseFloat(user.balance.toString())
        const fee = this.calculateFee(requestedAmount, 'Withdrawal')
        const totalDeducted = requestedAmount + fee

        // Check if user has sufficient balance
        if (currentBalance < totalDeducted) {
          throw new Error('Insufficient balance')
        }

        // Generate transaction reference
        const txRef = `TX_${Math.floor(Math.random() * 1000000000) + 1}`

        // Create pending transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'Withdrawal',
            amount: requestedAmount,
            fee,
            txRef,
            status: 'pending',
            date: new Date()
          }
        })

        // Deduct from user balance
        const newBalance = currentBalance - totalDeducted
        await tx.user.update({
          where: { id: userId },
          data: { balance: newBalance }
        })

        return {
          success: true,
          message: 'Withdrawal request created',
          txRef,
          withdrawnAmount: requestedAmount,
          fee
        }
      })

      // Invalidate user cache to ensure fresh balance data
      await invalidateUserCache(userId)

      console.log(`Withdrawal request created: User ${userId}, Amount: ${requestedAmount}, Fee: ${result.fee}`)
      return result

    } catch (error) {
      console.error('Withdrawal processing error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Withdrawal processing failed'
      }
    }
  }

  /**
   * Complete a withdrawal after PayChangu processes it
   */
  static async completeWithdrawal(
    txRef: string,
    paychanguResponse?: any
  ): Promise<WithdrawalResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Find the pending transaction
        const transaction = await tx.transaction.findFirst({
          where: { txRef, type: 'Withdrawal', status: 'pending' }
        })

        if (!transaction) {
          throw new Error('Pending withdrawal transaction not found')
        }

        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'completed' }
        })

        return {
          success: true,
          message: 'Withdrawal completed successfully',
          txRef,
          withdrawnAmount: parseFloat(transaction.amount.toString()),
          fee: parseFloat(transaction.fee.toString())
        }
      })

      console.log(`Withdrawal completed: TX ${txRef}`)
      return result

    } catch (error) {
      console.error('Withdrawal completion error:', error)
      
      // Get transaction details for better error logging
      try {
        const transaction = await prisma.transaction.findFirst({
          where: { txRef, type: 'Withdrawal' }
        })
        
        if (transaction) {
          await this.logFailedTransaction({
            userId: transaction.userId,
            type: 'Withdrawal',
            amount: parseFloat(transaction.amount.toString()),
            fee: parseFloat(transaction.fee.toString()),
            txRef,
            status: 'failed',
            paychanguResponse
          })
        }
      } catch (logError) {
        console.error('Failed to log withdrawal error:', logError)
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Withdrawal completion failed'
      }
    }
  }

  /**
   * Log failed transactions
   */
  static async logFailedTransaction(transaction: WalletTransaction): Promise<void> {
    try {
      await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          fee: transaction.fee,
          txRef: transaction.txRef,
          status: 'failed',
          date: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to log failed transaction:', error)
    }
  }

  /**
   * Get user's wallet balance
   */
  static async getUserBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    return user ? parseFloat(user.balance.toString()) : 0
  }

  /**
   * Get transaction by transaction reference
   */
  static async getTransactionByTxRef(txRef: string): Promise<any | null> {
    return await prisma.transaction.findFirst({
      where: { txRef }
    })
  }

  /**
   * Get user's transaction history
   */
  static async getUserTransactions(userId: string, limit = 50): Promise<any[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Get all transactions (for admin)
   */
  static async getAllTransactions(limit = 50): Promise<any[]> {
    return await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  }

  /**
   * Get total fees collected
   */
  static async getTotalFees(): Promise<{ depositFees: number; withdrawalFees: number; total: number }> {
    const [depositFees, withdrawalFees] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'Deposit', status: 'completed' },
        _sum: { fee: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'Withdrawal', status: 'completed' },
        _sum: { fee: true }
      })
    ])

    const depositFeesTotal = parseFloat(depositFees._sum.fee?.toString() || '0')
    const withdrawalFeesTotal = parseFloat(withdrawalFees._sum.fee?.toString() || '0')

    return {
      depositFees: depositFeesTotal,
      withdrawalFees: withdrawalFeesTotal,
      total: depositFeesTotal + withdrawalFeesTotal
    }
  }

  /**
   * Sync user balance with PayChangu (for reconciliation)
   */
  static async syncUserBalance(userId: string, paychanguBalance: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { balance: paychanguBalance }
    })
  }
} 