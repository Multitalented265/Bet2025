const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { PrismaClient } = require('@prisma/client');

console.log('🔧 Environment check:');
console.log('Current directory:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin in database...');
    
    const admin = await prisma.admin.findFirst({
      where: { email: 'admin@bet2025.com' }
    });
    
    if (admin) {
      console.log('✅ Admin found:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        isActive: admin.isActive,
        passwordLength: admin.password.length,
        passwordStartsWith: admin.password.substring(0, 10) + '...'
      });
    } else {
      console.log('❌ Admin not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin(); 