const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetUserBalance() {
  try {
    console.log('🔍 Checking current user balances...');
    
    // Get all users and their current balances
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true
      }
    });

    console.log('\n📊 Current user balances:');
    users.forEach(user => {
      console.log(`- ${user.name || user.email}: ${user.balance} MWK`);
    });

    // Reset all user balances to 0
    console.log('\n🔄 Resetting all user balances to 0...');
    await prisma.user.updateMany({
      data: {
        balance: 0
      }
    });

    console.log('✅ All user balances have been reset to 0');

    // Clear all transactions (optional - uncomment if you want to clear transactions too)
    /*
    console.log('\n🗑️ Clearing all transactions...');
    await prisma.transaction.deleteMany({});
    console.log('✅ All transactions have been cleared');
    */

    console.log('\n📊 Updated user balances:');
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true
      }
    });

    updatedUsers.forEach(user => {
      console.log(`- ${user.name || user.email}: ${user.balance} MWK`);
    });

    console.log('\n🎉 Balance reset completed successfully!');
    console.log('💡 You may need to restart your application to clear any cached data.');

  } catch (error) {
    console.error('❌ Error resetting balances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserBalance(); 