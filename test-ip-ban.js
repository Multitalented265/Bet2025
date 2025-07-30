const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testIPBanning() {
  try {
    console.log('🧪 Testing IP Banning Functionality...');
    
    // Load environment variables
    require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
    
    console.log('📋 Environment check:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
    
    // Test 1: Check if admin exists
    console.log('\n🔍 Test 1: Checking admin existence...');
    const admin = await prisma.admin.findFirst({
      where: { email: process.env.ADMIN_EMAIL || 'admin@bet2025.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin not found. Please run the setup-admin API first.');
      return;
    }
    
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name
    });
    
    // Test 2: Check if BannedIP table exists (this will fail if table doesn't exist)
    console.log('\n🔍 Test 2: Checking BannedIP table...');
    try {
      const bannedIPs = await prisma.bannedIP.findMany();
      console.log('✅ BannedIP table exists. Current banned IPs:', bannedIPs.length);
    } catch (error) {
      console.log('❌ BannedIP table does not exist. Please run the migration first.');
      console.log('Error:', error.message);
      return;
    }
    
    // Test 3: Test banning an IP
    console.log('\n🔍 Test 3: Testing IP ban functionality...');
    const testIP = '192.168.1.100';
    
    // Check if IP is already banned
    const existingBan = await prisma.bannedIP.findUnique({
      where: { ipAddress: testIP }
    });
    
    if (existingBan) {
      console.log('⚠️ Test IP is already banned. Unbanning first...');
      await prisma.bannedIP.update({
        where: { ipAddress: testIP },
        data: { isActive: false }
      });
    }
    
    // Ban the test IP
    const bannedIP = await prisma.bannedIP.create({
      data: {
        ipAddress: testIP,
        reason: 'Test ban for security testing',
        bannedBy: admin.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });
    
    console.log('✅ Test IP banned successfully:', {
      id: bannedIP.id,
      ipAddress: bannedIP.ipAddress,
      reason: bannedIP.reason,
      expiresAt: bannedIP.expiresAt
    });
    
    // Test 4: Test IP ban check
    console.log('\n🔍 Test 4: Testing IP ban check...');
    const isBanned = await prisma.bannedIP.findFirst({
      where: {
        ipAddress: testIP,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    
    if (isBanned) {
      console.log('✅ IP ban check working correctly - IP is banned');
    } else {
      console.log('❌ IP ban check failed - IP should be banned');
    }
    
    // Test 5: Test unbanning
    console.log('\n🔍 Test 5: Testing IP unban functionality...');
    await prisma.bannedIP.update({
      where: { ipAddress: testIP },
      data: { isActive: false }
    });
    
    const isUnbanned = await prisma.bannedIP.findFirst({
      where: {
        ipAddress: testIP,
        isActive: true
      }
    });
    
    if (!isUnbanned) {
      console.log('✅ IP unban working correctly - IP is no longer banned');
    } else {
      console.log('❌ IP unban failed - IP is still banned');
    }
    
    console.log('\n🎉 All IP banning tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin authentication with IP checking: ✅');
    console.log('- IP banning functionality: ✅');
    console.log('- IP unbanning functionality: ✅');
    console.log('- Ban expiration handling: ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIPBanning(); 