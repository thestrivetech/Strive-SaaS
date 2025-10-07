#!/usr/bin/env node

/**
 * Migration Applier
 *
 * Helps apply Prisma migrations to Supabase.
 * Provides SQL and instructions for applying migrations.
 *
 * Usage:
 *   node scripts/database/apply-migration.js
 *   npm run db:apply (from platform directory)
 *
 * Note: Actual migration application requires Supabase MCP tool
 *       This script provides the SQL and instructions
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const MIGRATIONS_DIR = path.join(ROOT_DIR, '(platform)/prisma/migrations');

// Get all migration directories
function getMigrations() {
  try {
    const dirs = fs.readdirSync(MIGRATIONS_DIR)
      .filter(name => {
        const fullPath = path.join(MIGRATIONS_DIR, name);
        return fs.statSync(fullPath).isDirectory();
      })
      .sort();
    return dirs;
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error.message);
    return [];
  }
}

// Read migration SQL
function readMigrationSQL(migrationDir) {
  const sqlPath = path.join(MIGRATIONS_DIR, migrationDir, 'migration.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Get latest migration
function getLatestMigration() {
  const migrations = getMigrations();
  return migrations.length > 0 ? migrations[migrations.length - 1] : null;
}

// Main execution
function main() {
  console.log('🚀 Prisma Migration Applier');
  console.log('============================');
  console.log('');

  const migrations = getMigrations();

  if (migrations.length === 0) {
    console.log('ℹ️  No migrations found');
    console.log('');
    console.log('   Create a migration first:');
    console.log('   npm run db:migrate');
    console.log('');
    return;
  }

  const latest = getLatestMigration();
  console.log(`📊 Total migrations: ${migrations.length}`);
  console.log(`📝 Latest migration: ${latest}`);
  console.log('');

  // Read latest migration SQL
  const sql = readMigrationSQL(latest);

  if (!sql) {
    console.log('❌ Could not read migration SQL');
    console.log(`   Expected: ${path.join(MIGRATIONS_DIR, latest, 'migration.sql')}`);
    return;
  }

  console.log('📄 Migration SQL:');
  console.log('━'.repeat(60));
  console.log(sql);
  console.log('━'.repeat(60));
  console.log('');

  console.log('⚠️  IMPORTANT: Migration Application');
  console.log('');
  console.log('To apply this migration to Supabase, use ONE of these methods:');
  console.log('');
  console.log('Option 1: Using Claude Code (Recommended)');
  console.log('─────────────────────────────────────────');
  console.log('Ask Claude to apply the migration using the Supabase MCP tool:');
  console.log('');
  console.log('   "Apply the latest migration to Supabase production"');
  console.log('');
  console.log('Claude will use: mcp__supabase-production__apply_migration');
  console.log('');
  console.log('Option 2: Manual Application via Supabase Dashboard');
  console.log('────────────────────────────────────────────────────');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to: SQL Editor');
  console.log('4. Paste the SQL above');
  console.log('5. Click "Run"');
  console.log('');
  console.log('Option 3: Using Prisma Deploy (Production)');
  console.log('───────────────────────────────────────────');
  console.log('   npx prisma migrate deploy --schema="(platform)/prisma/schema.prisma"');
  console.log('');
  console.log('⚠️  WARNING: Option 3 should only be used in production environments');
  console.log('');

  console.log('✅ After applying migration:');
  console.log('');
  console.log('   1. Verify tables created: Ask Claude to list tables');
  console.log('   2. Test application: npm run dev');
  console.log('   3. Update docs: npm run db:docs');
  console.log('   4. Commit migration: git add "(platform)/prisma/migrations"');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getMigrations, getLatestMigration, readMigrationSQL };
