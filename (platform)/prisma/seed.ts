import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Production Database Seeding Script
 *
 * Seeds initial data for production environment:
 * - Default admin user (optional)
 * - Default organization
 * - System configuration
 *
 * IMPORTANT: This script is idempotent - safe to run multiple times
 * Uses upsert to avoid duplicates
 *
 * Usage:
 * ```bash
 * npm run db:seed
 * # OR
 * npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * ```
 */
async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('');

  // Seed 1: Default System Organization (Optional)
  console.log('📦 Seeding default organization...');

  const defaultOrg = await prisma.organizations.upsert({
    where: { id: 'system-default' },
    update: {}, // Don't update if exists
    create: {
      id: 'system-default',
      name: 'Strive Tech',
      slug: 'strive-tech',
      subscription_status: 'ACTIVE',
      description: 'System default organization for Strive Tech platform',
      // Add other required fields based on your schema
    },
  });

  console.log('  ✅ Organization created/verified:', defaultOrg.name);
  console.log('');

  // Seed 2: Default Admin User (Optional - only if needed)
  // IMPORTANT: Change email and create actual user via Supabase Auth
  // This is a placeholder example
  console.log('👤 Seeding admin user...');

  // Note: Actual user creation should happen via Supabase Auth
  // This only creates the User record in database
  // You'll need to create the actual auth user in Supabase first

  // Uncomment and modify if you need a system admin:
  /*
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@strivetech.ai' },
    update: {}, // Don't update if exists
    create: {
      email: 'admin@strivetech.ai',
      name: 'System Administrator',
      globalRole: 'ADMIN',
      emailVerified: true,
      // Note: Supabase auth handles password, not stored here
      // You must create this user in Supabase Auth first
    },
  });

  console.log('  ✅ Admin user created/verified:', adminUser.email);

  // Create organization membership
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: defaultOrg.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: defaultOrg.id,
      role: 'OWNER',
    },
  });

  console.log('  ✅ Admin membership created');
  */

  console.log('');
  console.log('⚠️  Note: Admin user seeding commented out');
  console.log('  Create admin via Supabase Dashboard → Authentication → Add User');
  console.log('');

  // Seed 3: Sample AI Tools (Optional)
  console.log('🤖 Seeding AI tools catalog...');

  const tools = [
    {
      id: 'tool-doc-gen',
      name: 'Document Generator',
      description: 'Generate professional documents using AI',
      toolType: 'AUTOMATION' as const,
      is_active: true,
      required_tier: 'FREE' as const,
    },
    {
      id: 'tool-data-analyzer',
      name: 'Data Analyzer',
      description: 'Analyze and visualize data with AI insights',
      toolType: 'ANALYSIS' as const,
      is_active: true,
      required_tier: 'PRO' as const,
    },
    {
      id: 'tool-email-assistant',
      name: 'Email Assistant',
      description: 'Draft professional emails with AI',
      toolType: 'CHATBOT' as const,
      is_active: true,
      required_tier: 'FREE' as const,
    },
  ];

  for (const tool of tools) {
    await prisma.ai_tools.upsert({
      where: { id: tool.id },
      update: {}, // Don't update if exists
      create: tool,
    });
    console.log(`  ✅ Tool: ${tool.name}`);
  }

  console.log('');

  // Success
  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  • Organizations: 1 (default)`);
  console.log(`  • Admin Users: 0 (create manually in Supabase)`);
  console.log(`  • AI Tools: ${tools.length}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Create admin user in Supabase Dashboard');
  console.log('  2. Verify organization in database: npx prisma studio');
  console.log('  3. Test application functionality');
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
