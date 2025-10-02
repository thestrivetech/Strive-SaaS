#!/usr/bin/env node

/**
 * Comprehensive Authentication Test Script
 * Tests both database connections and authentication flow
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test credentials
const testEmail = 'jgramcoin@gmail.com'; // Updated to match your actual test user
const testPassword = 'TestPassword123!';

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnections() {
  console.log('🔐 Testing Authentication System\n');
  console.log('==========================================');
  console.log('\n1️⃣ Testing Database Connections...\n');

  try {
    // Test Prisma connection
    console.log('   Testing Prisma Database Connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Prisma connected! Found ${userCount} users in database`);

    // List users in Prisma
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        }
      });
      console.log('   📋 Users in Prisma database:');
      users.forEach(user => {
        console.log(`      - ${user.email} (${user.name || 'No name'}) - ${user.role}`);
      });
    }

    // Test Supabase Auth connection
    console.log('\n   Testing Supabase Auth Connection...');
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('   ❌ Supabase Auth error:', error.message);
      return false;
    }

    console.log(`   ✅ Supabase Auth connected! Found ${authUsers.users.length} auth users`);

    // List users in Supabase Auth
    if (authUsers.users.length > 0) {
      console.log('   📋 Users in Supabase Auth:');
      authUsers.users.forEach(user => {
        console.log(`      - ${user.email} (${user.user_metadata?.full_name || 'No name'}) - ${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);
      });
    }

    // Check for sync issues
    console.log('\n   Checking User Synchronization...');
    const prismaUsers = await prisma.user.findMany();
    const missingInAuth = prismaUsers.filter(prismaUser =>
      !authUsers.users.some(authUser => authUser.email === prismaUser.email)
    );

    if (missingInAuth.length > 0) {
      console.log('   ⚠️  Users in Prisma but not in Supabase Auth:');
      missingInAuth.forEach(user => {
        console.log(`      - ${user.email} (${user.name})`);
      });
      console.log('      💡 These users won\'t be able to log in until they\'re added to Supabase Auth');
      return false;
    } else {
      console.log('   ✅ All users are properly synchronized!');
      return true;
    }

  } catch (error) {
    console.error('   ❌ Database connection test failed:', error.message);
    return false;
  }
}

async function createTestAuthUser(email, password, name = 'Test User') {
  console.log(`\n🔐 Creating test user in Supabase Auth: ${email}`);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: name,
      }
    });

    if (error) {
      console.error('❌ Failed to create auth user:', error.message);
      return false;
    }

    console.log('✅ Successfully created auth user:', email);
    return true;
  } catch (error) {
    console.error('❌ Error creating auth user:', error.message);
    return false;
  }
}

async function testAuthFlow() {

  console.log('\n2️⃣ Testing API Authentication Flow...\n');

  // 1. Test login endpoint
  console.log('   Testing login endpoint...');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: [hidden]`);

  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('   ✅ Login successful!');
      console.log(`   User ID: ${data.user?.id}`);
      console.log(`   User Name: ${data.user?.name}`);
      console.log(`   User Role: ${data.user?.role}`);
    } else {
      const error = await loginResponse.json();
      console.log(`   ❌ Login failed: ${error.error}`);
      console.log('\n   Note: Please ensure a test user exists in Supabase with these credentials.');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 2. Test protected route
  console.log('\n   Testing protected route (dashboard)...');
  try {
    const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
      redirect: 'manual',
    });

    if (dashboardResponse.status === 307) {
      console.log('   ✅ Protected route correctly redirects to login when not authenticated');
    } else {
      console.log(`   ℹ️  Protected route returned status: ${dashboardResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n==========================================');
  console.log('✨ API Authentication flow test complete!\n');

  await prisma.$disconnect();
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'create-user' && args[1] && args[2]) {
    const email = args[1];
    const password = args[2];
    const name = args[3] || 'Test User';

    console.log('🔐 Creating user in Supabase Auth...\n');
    await createTestAuthUser(email, password, name);
    console.log('\n🧪 Running full authentication test...');
    await testDatabaseConnections();
    await testAuthFlow();
  } else if (args[0] === 'full-test') {
    await testDatabaseConnections();
    await testAuthFlow();
  } else {
    console.log('🔐 Comprehensive Authentication Test\n');
    console.log('Available commands:');
    console.log('  node scripts/test-auth.js                    - Run database connection test only');
    console.log('  node scripts/test-auth.js full-test          - Run complete authentication test');
    console.log('  node scripts/test-auth.js create-user <email> <password> [name] - Create auth user and test');
    console.log('\nExample:');
    console.log('  node scripts/test-auth.js create-user test@example.com MyPassword123! "John Doe"');
    console.log('\nRunning database connection test...\n');

    await testDatabaseConnections();

    console.log('\n💡 To test the full authentication flow, run:');
    console.log('   node scripts/test-auth.js full-test');
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDatabaseConnections, testAuthFlow, createTestAuthUser };