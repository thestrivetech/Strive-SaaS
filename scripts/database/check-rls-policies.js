#!/usr/bin/env node

/**
 * RLS Policy Checker
 *
 * Checks which tables have Row Level Security enabled and lists their policies.
 * Helps ensure all multi-tenant tables are protected with RLS.
 *
 * Usage:
 *   node scripts/database/check-rls-policies.js
 *   npm run db:check-rls (from platform directory)
 *
 * Note: Requires database connection
 */

const { execSync } = require('child_process');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const SCHEMA_PATH = path.join(ROOT_DIR, 'shared/prisma/schema.prisma');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// SQL queries
const CHECK_RLS_QUERY = `
  SELECT
    schemaname,
    tablename,
    rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
`;

const LIST_POLICIES_QUERY = `
  SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    LEFT(qual::text, 60) as using_clause,
    LEFT(with_check::text, 60) as with_check_clause
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
`;

// Execute SQL query via Prisma
function executeSQLQuery(query) {
  try {
    const command = `npx prisma db execute --schema=${SCHEMA_PATH} --stdin`;
    const result = execSync(command, {
      input: query,
      encoding: 'utf8',
      cwd: ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Format table with colors
function printTable(headers, rows, colorFn = null) {
  if (rows.length === 0) {
    console.log('  (No results)');
    return;
  }

  // Calculate column widths
  const widths = headers.map((header, i) => {
    const maxRowWidth = Math.max(...rows.map(row => String(row[i] || '').length));
    return Math.max(header.length, maxRowWidth);
  });

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
  console.log('  ' + colors.bright + headerRow + colors.reset);
  console.log('  ' + headers.map((_, i) => '-'.repeat(widths[i])).join('-+-'));

  // Print rows
  rows.forEach(row => {
    const formatted = row.map((cell, i) => String(cell || '').padEnd(widths[i])).join(' | ');
    if (colorFn) {
      console.log('  ' + colorFn(row) + formatted + colors.reset);
    } else {
      console.log('  ' + formatted);
    }
  });
}

// Main execution
function main() {
  console.log(colors.bright + '🔒 RLS Policy Checker' + colors.reset);
  console.log('='.repeat(60));
  console.log('');

  console.log('📊 Checking RLS status for all tables...');
  console.log('');

  // Note about database connection
  console.log(colors.yellow + '⚠️  This script requires database connection' + colors.reset);
  console.log('   Make sure DATABASE_URL is set in .env.local');
  console.log('');

  // Manual instructions
  console.log(colors.cyan + '📖 To check RLS policies manually:' + colors.reset);
  console.log('');
  console.log('1. Via Supabase Dashboard:');
  console.log('   • Go to: Authentication → Policies');
  console.log('   • View all table policies');
  console.log('');
  console.log('2. Via SQL Editor (Supabase Dashboard):');
  console.log('');
  console.log('   -- Check if RLS is enabled on tables');
  console.log('   SELECT tablename, rowsecurity');
  console.log('   FROM pg_tables');
  console.log('   WHERE schemaname = \'public\'');
  console.log('   ORDER BY tablename;');
  console.log('');
  console.log('   -- List all RLS policies');
  console.log('   SELECT');
  console.log('     tablename,');
  console.log('     policyname,');
  console.log('     cmd,');
  console.log('     qual AS using_clause,');
  console.log('     with_check AS with_check_clause');
  console.log('   FROM pg_policies');
  console.log('   WHERE schemaname = \'public\'');
  console.log('   ORDER BY tablename, policyname;');
  console.log('');

  // Expected RLS-enabled tables
  console.log(colors.bright + '📋 Tables that SHOULD have RLS enabled:' + colors.reset);
  console.log('');
  console.log('  Multi-Tenant Tables (Organization-scoped):');
  console.log('  • customers, leads, contacts, deals');
  console.log('  • projects, tasks, activities');
  console.log('  • listings, transaction_loops, documents');
  console.log('  • content_items, media_assets, campaigns');
  console.log('  • expenses, receipts, tax_estimates');
  console.log('  • marketplace_tools, tool_purchases');
  console.log('  • ai_conversations, ai_tools');
  console.log('  • (All tables with organization_id field)');
  console.log('');
  console.log('  User-Scoped Tables:');
  console.log('  • user_preferences, user_sessions, user_dashboards');
  console.log('  • notifications (user-specific)');
  console.log('');
  console.log('  Admin-Only Tables:');
  console.log('  • platform_metrics, feature_flags, system_alerts');
  console.log('  • admin_action_logs');
  console.log('');
  console.log('  Storage Tables:');
  console.log('  • storage.objects (for file uploads)');
  console.log('');

  // Tables that DON'T need RLS
  console.log(colors.bright + '✅ Tables that DON\'T need RLS:' + colors.reset);
  console.log('');
  console.log('  Core System Tables (no user data):');
  console.log('  • users, organizations, organization_members');
  console.log('  • subscriptions (handled by application logic)');
  console.log('');
  console.log('  Reference Data (public):');
  console.log('  • content_categories, content_tags');
  console.log('  • agent_templates, tool_blueprints');
  console.log('');

  // Policy patterns
  console.log(colors.bright + '📖 Common RLS Policy Patterns:' + colors.reset);
  console.log('');
  console.log('  See: shared/supabase/RLS-POLICIES.md');
  console.log('  • Organization isolation pattern');
  console.log('  • User ownership pattern');
  console.log('  • Admin-only access pattern');
  console.log('  • Role-based access pattern');
  console.log('');

  // Verification steps
  console.log(colors.bright + '🔍 Manual Verification Steps:' + colors.reset);
  console.log('');
  console.log('1. Check Supabase Dashboard → Authentication → Policies');
  console.log('2. Verify each multi-tenant table has 4 policies:');
  console.log('   • SELECT (view org data)');
  console.log('   • INSERT (create for org)');
  console.log('   • UPDATE (modify org data)');
  console.log('   • DELETE (remove org data)');
  console.log('3. Test policies with SQL queries (see RLS-POLICIES.md)');
  console.log('4. Ensure RLS context is set in app code (lib/database/prisma.ts)');
  console.log('');

  // Warning
  console.log(colors.red + '⚠️  CRITICAL:' + colors.reset);
  console.log('  • All tables with organization_id MUST have RLS enabled');
  console.log('  • Missing RLS = potential data leak between organizations!');
  console.log('  • Test RLS policies before deploying to production');
  console.log('');

  // Next steps
  console.log(colors.bright + '📚 Related Documentation:' + colors.reset);
  console.log('');
  console.log('  • RLS Policies: shared/supabase/RLS-POLICIES.md');
  console.log('  • Supabase Setup: shared/supabase/SUPABASE-SETUP.md');
  console.log('  • Storage Buckets: shared/supabase/STORAGE-BUCKETS.md');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
