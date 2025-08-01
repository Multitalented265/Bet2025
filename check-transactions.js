const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    console.log('🔍 Checking recent transactions...');
    
    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${transactions.length} recent transactions:`);
    
    transactions.forEach((tx, index) => {
      console.log(`\n${index + 1}. Transaction ID: ${tx.id}`);
      console.log(`   Type: ${tx.type}`);
      console.log(`   Amount: ${tx.amount}`);
      console.log(`   Status: ${tx.status}`);
      console.log(`   TX Ref: ${tx.txRef}`);
      console.log(`   Date: ${tx.date}`);
      console.log(`   User: ${tx.user?.email || 'Unknown'}`);
    });
    
    // Check if any successful deposits exist
    const successfulDeposits = transactions.filter(tx => 
      tx.type === 'Deposit' && tx.status === 'completed'
    );
    
    console.log(`\n✅ Successful deposits: ${successfulDeposits.length}`);
    
    if (successfulDeposits.length === 0) {
      console.log('❌ No successful deposits found - webhooks may not be working');
    }
    
  } catch (error) {
    console.error('❌ Error checking transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactions(); 