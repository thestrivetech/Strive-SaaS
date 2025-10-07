#!/usr/bin/env node

/**
 * Schema Sync Checker
 *
 * Detects schema drift between local schema and database.
 * Helps ensure schema.prisma matches actual database structure.
 *
 * Usage:
 *   node scripts/database/check-schema-sync.js
 *   npm run db:sync (from platform directory)
 *
 * Note: Requires database connection
 */

const { execSync } = require('child_process');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const SCHEMA_PATH = path.join(ROOT_DIR, '(platform)/prisma/schema.prisma');

// Check database sync
function checkSync() {
  try {
    console.log('🔍 Checking schema sync with database...');
    console.log('');

    // Run prisma migrate status
    const result = execSync(
      `npx prisma migrate status --schema=${SCHEMA_PATH}`,
      {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );

    console.log(result);
    return { synced: true, output: result };
  } catch (error) {
    const output = error.stderr || error.stdout || error.message;
    return { synced: false, output };
  }
}

// Main execution
function main() {
  console.log('🔄 Schema Sync Checker');
  console.log('======================');
  console.log('');

  const { synced, output } = checkSync();

  if (synced) {
    console.log('✅ Schema is in sync with database');
    console.log('');
    console.log('All migrations have been applied.');
    console.log('No pending changes detected.');
  } else {
    console.log('⚠️  Schema drift detected!');
    console.log('');
    console.log(output);
    console.log('');
    console.log('Possible causes:');
    console.log('   • Unapplied migrations');
    console.log('   • Schema changes not migrated');
    console.log('   • Manual database changes');
    console.log('');
    console.log('To fix:');
    console.log('');
    console.log('   1. Check migration status: npm run db:status');
    console.log('   2. Create migration if needed: npm run db:migrate');
    console.log('   3. Apply migrations: Use Claude or Supabase dashboard');
    console.log('   4. Regenerate Prisma client: npx prisma generate');
  }

  console.log('');
  console.log('📚 Documentation:');
  console.log('   Schema reference: (platform)/prisma/SCHEMA-QUICK-REF.md');
  console.log('   Migration guide: (platform)/prisma/README.md');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkSync };
