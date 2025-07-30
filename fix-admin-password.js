const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Find the admin user
    const admin = await prisma.admin.findFirst({
      where: { email: process.env.ADMIN_EMAIL || 'admin@bet2025.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin not found. Please run the setup-admin API first.');
      return;
    }
    
    console.log('📋 Found admin:', {
      email: admin.email,
      name: admin.name,
      hasPassword: !!admin.password
    });
    
    // Check if password is already hashed
    const isHashed = admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$');
    
    if (isHashed) {
      console.log('✅ Admin password is already hashed correctly.');
      return;
    }
    
    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    // Update the admin password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password has been hashed and updated successfully!');
    console.log('🔑 You can now login with the credentials from your .env file:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Load environment variables
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

fixAdminPassword(); 