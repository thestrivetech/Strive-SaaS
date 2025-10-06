#!/usr/bin/env node

/**
 * Migration Status Checker
 *
 * Shows status of Prisma migrations and schema changes.
 * Helps identify pending migrations and schema drift.
 *
 * Usage:
 *   node scripts/database/migration-status.js
 *   npm run db:status (from platform directory)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'shared/prisma/migrations');
const SCHEMA_PATH = path.join(ROOT_DIR, 'shared/prisma/schema.prisma');

// Get all migration directories
function getMigrations() {
  try {
    const dirs = fs.readdirSync(MIGRATIONS_DIR)
      .filter(name => {
        const fullPath = path.join(MIGRATIONS_DIR, name);
        return fs.statSync(fullPath).isDirectory() && name !== 'migration_lock.toml';
      })
      .sort();
    return dirs;
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error.message);
    return [];
  }
}

// Parse migration name to extract timestamp and description
function parseMigrationName(name) {
  const match = name.match(/^(\d+)_(.+)$/);
  if (match) {
    const timestamp = match[1];
    const description = match[2].replace(/_/g, ' ');
    const date = new Date(
      parseInt(timestamp.slice(0, 4)),     // year
      parseInt(timestamp.slice(4, 6)) - 1, // month (0-indexed)
      parseInt(timestamp.slice(6, 8)),     // day
      parseInt(timestamp.slice(8, 10)),    // hour
      parseInt(timestamp.slice(10, 12)),   // minute
      parseInt(timestamp.slice(12, 14))    // second
    );
    return { timestamp, description, date };
  }
  return { timestamp: null, description: name, date: null };
}

// Check if there are pending schema changes
function checkPendingChanges() {
  try {
    // Run prisma migrate status (output to stderr, so we need to capture it)
    execSync(
      `npx prisma migrate status --schema=${SCHEMA_PATH}`,
      {
        cwd: ROOT_DIR,
        stdio: 'pipe',
        encoding: 'utf8'
      }
    );
    return { hasPending: false };
  } catch (error) {
    // Prisma exits with non-zero if there are pending changes
    const output = error.stderr || error.stdout || '';
    const hasPending = output.includes('following migration(s)') ||
                      output.includes('database schema is not in sync') ||
                      output.includes('drift');
    return { hasPending, output };
  }
}

// Main execution
function main() {
  console.log('📊 Migration Status');
  console.log('===================');
  console.log('');

  // Get migrations
  const migrations = getMigrations();

  if (migrations.length === 0) {
    console.log('ℹ️  No migrations found');
    console.log('');
    console.log('   This is a new schema. Create your first migration:');
    console.log('   npm run db:migrate');
    console.log('');
    return;
  }

  // Display migration history
  console.log(`📜 Migration History (${migrations.length} total):`);
  console.log('');

  migrations.forEach((name, index) => {
    const { description, date } = parseMigrationName(name);
    const dateStr = date ? date.toISOString().split('T')[0] : 'unknown';
    const number = String(index + 1).padStart(3, ' ');
    console.log(`   ${number}. ${dateStr} - ${description}`);
  });

  console.log('');

  // Show latest migration
  const latest = migrations[migrations.length - 1];
  const { description, date } = parseMigrationName(latest);
  console.log('🕐 Latest Migration:');
  console.log(`   ${description}`);
  console.log(`   ${date ? date.toLocaleString() : 'Unknown date'}`);
  console.log('');

  // Check for pending changes
  console.log('🔍 Checking for pending changes...');
  const { hasPending, output } = checkPendingChanges();

  if (hasPending) {
    console.log('⚠️  WARNING: Pending schema changes detected!');
    console.log('');
    console.log('Your schema has changes that need to be migrated:');
    console.log('');
    console.log('   1. Review changes: git diff shared/prisma/schema.prisma');
    console.log('   2. Create migration: npm run db:migrate');
    console.log('   3. Apply to database: Use Claude or Supabase dashboard');
    console.log('');
  } else {
    console.log('✅ No pending changes - schema is in sync');
    console.log('');
  }

  // Quick stats
  console.log('📈 Quick Stats:');
  console.log(`   Total migrations: ${migrations.length}`);
  console.log(`   Schema file: ${SCHEMA_PATH}`);
  console.log(`   Migrations dir: ${MIGRATIONS_DIR}`);
  console.log('');

  // Next steps
  console.log('💡 Common Commands:');
  console.log('');
  console.log('   Check schema:     npm run db:status');
  console.log('   Create migration: npm run db:migrate');
  console.log('   View schema docs: cat shared/prisma/SCHEMA-QUICK-REF.md');
  console.log('   Update docs:      npm run db:docs');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getMigrations, parseMigrationName, checkPendingChanges };
