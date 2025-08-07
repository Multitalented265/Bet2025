const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Direct database reset for admin authentication...');
  console.log('Admin Email: admin@mzunguko.com');
  console.log('Admin Password: AdminSecure2025!@#');
  console.log('');

  try {
    // Step 1: Clear all rate limiting data
    console.log('🔧 Step 1: Clearing rate limiting data...');
    
    const deleteBannedIPs = await prisma.bannedIP.deleteMany({});
    console.log(`✅ Deleted ${deleteBannedIPs.count} banned IP addresses`);
    
    const deleteSessions = await prisma.adminSession.deleteMany({});
    console.log(`✅ Deleted ${deleteSessions.count} admin sessions`);
    
    const deleteLoginLogs = await prisma.adminLoginLog.deleteMany({});
    console.log(`✅ Deleted ${deleteLoginLogs.count} admin login logs`);
    
    console.log('✅ Rate limiting data cleared successfully!');

    // Step 2: Clear all admin accounts
    console.log('\n🔧 Step 2: Clearing all admin accounts...');
    const deleteAdmins = await prisma.admin.deleteMany({});
    console.log(`✅ Deleted ${deleteAdmins.count} admin accounts`);

    // Step 3: Create the main admin account
    console.log('\n🔧 Step 3: Creating main admin account...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('AdminSecure2025!@#', 10);
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@mzunguko.com',
        password: hashedPassword,
        name: 'Main Administrator',
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Main admin account created successfully!');
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin Email: ${admin.email}`);
    console.log(`Admin Name: ${admin.name}`);

    // Step 4: Test the admin account
    console.log('\n🔧 Step 4: Testing admin account...');
    
    const testAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@mzunguko.com' }
    });
    
    if (testAdmin) {
      console.log('✅ Admin account found in database');
      console.log('✅ Admin account is active:', testAdmin.isActive);
      console.log('✅ Admin role is correct:', testAdmin.role);
    } else {
      console.log('❌ Admin account not found in database');
    }

    console.log('\n🎉 SUCCESS! Database reset completed.');
    console.log('');
    console.log('🔐 Main Admin Account:');
    console.log('Email: admin@mzunguko.com');
    console.log('Password: AdminSecure2025!@#');
    console.log('Login URL: https://bet2025-2-saau.onrender.com/admin-auth/login');
    console.log('');
    console.log('📋 What was cleared:');
    console.log(`- ${deleteBannedIPs.count} banned IP addresses`);
    console.log(`- ${deleteSessions.count} admin sessions`);
    console.log(`- ${deleteLoginLogs.count} admin login logs`);
    console.log(`- ${deleteAdmins.count} old admin accounts`);
    console.log('');
    console.log('⏳ Wait 2-3 minutes for the deployment to restart, then try logging in.');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 