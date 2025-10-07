#!/usr/bin/env node

/**
 * Migration Creator
 *
 * Interactive CLI for creating Prisma migrations.
 * Simplifies the migration workflow and ensures consistency.
 *
 * Usage:
 *   node scripts/database/create-migration.js
 *   npm run db:migrate (from platform directory)
 *
 * Workflow:
 *   1. Prompts for migration name
 *   2. Generates migration SQL using Prisma
 *   3. Shows migration preview
 *   4. Updates schema documentation
 */

const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const SCHEMA_PATH = path.join(ROOT_DIR, '(platform)/prisma/schema.prisma');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt helper
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Execute command with output
function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error };
  }
}

// Main execution
async function main() {
  console.log('🔧 Prisma Migration Creator');
  console.log('===========================');
  console.log('');

  // Prompt for migration name
  console.log('📝 Enter migration name (snake_case, e.g., add_user_fields):');
  const migrationName = await prompt('   > ');

  if (!migrationName) {
    console.log('❌ Migration name is required');
    rl.close();
    process.exit(1);
  }

  // Validate name format (snake_case)
  if (!/^[a-z][a-z0-9_]*$/.test(migrationName)) {
    console.log('❌ Migration name must be in snake_case (lowercase, underscores only)');
    console.log('   Example: add_user_fields, create_products_table');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('🔍 Checking for schema changes...');
  console.log('');

  // Create migration
  console.log('📦 Creating migration...');
  console.log(`   Command: npx prisma migrate dev --name ${migrationName} --schema=${SCHEMA_PATH}`);
  console.log('');

  const result = exec(
    `npx prisma migrate dev --name ${migrationName} --schema=${SCHEMA_PATH}`,
    { cwd: ROOT_DIR }
  );

  if (!result.success) {
    console.log('');
    console.log('❌ Migration creation failed');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('✅ Migration created successfully!');
  console.log('');

  // Regenerate schema documentation
  console.log('📚 Updating schema documentation...');
  const docsResult = exec(
    `node ${path.join(__dirname, 'generate-schema-docs.js')}`,
    { stdio: 'pipe' }
  );

  if (docsResult.success) {
    console.log('✅ Schema documentation updated');
  } else {
    console.log('⚠️  Warning: Schema documentation update failed');
    console.log('   Run manually: npm run db:docs');
  }

  console.log('');
  console.log('📋 Next Steps:');
  console.log('');
  console.log('   1. Review migration: (platform)/prisma/migrations/<timestamp>_' + migrationName);
  console.log('   2. Test locally: npm run dev (ensure app works)');
  console.log('   3. Apply to production: Use MCP tool or npm run db:apply');
  console.log('   4. Commit: git add "(platform)/prisma" && git commit');
  console.log('');

  rl.close();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}
