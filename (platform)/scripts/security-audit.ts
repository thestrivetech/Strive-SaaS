/**
 * CRM Security Audit Script
 *
 * Performs comprehensive security checks:
 * 1. RLS policies on all CRM tables
 * 2. RBAC enforcement in Server Actions
 * 3. Zod validation in schemas
 * 4. No exposed secrets
 *
 * Usage: npx tsx scripts/security-audit.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AuditResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string[];
}

const results: AuditResult[] = [];

/**
 * Check if RLS policies exist for CRM tables
 */
async function auditRLSPolicies() {
  console.log('\n🔒 Auditing RLS Policies...\n');

  const crmTables = [
    'leads',
    'contacts',
    'deals',
    'listings',
    'activities',
    'appointments',
  ];

  try {
    // Query for tables with RLS enabled
    const tablesWithRLS = await prisma.$queryRaw<
      { tablename: string; rowsecurity: boolean }[]
    >`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = ANY(${crmTables}::text[]);
    `;

    const missingRLS = crmTables.filter((table) => {
      const found = tablesWithRLS.find((t) => t.tablename === table);
      return !found || !found.rowsecurity;
    });

    if (missingRLS.length === 0) {
      results.push({
        category: 'RLS Policies',
        status: 'PASS',
        message: 'All CRM tables have RLS enabled',
      });
    } else {
      results.push({
        category: 'RLS Policies',
        status: 'FAIL',
        message: 'Some CRM tables missing RLS',
        details: missingRLS,
      });
    }

    // Check for RLS policies
    const policies = await prisma.$queryRaw<
      { tablename: string; policyname: string }[]
    >`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = ANY(${crmTables}::text[]);
    `;

    const tablesWithoutPolicies = crmTables.filter((table) => {
      return !policies.some((p) => p.tablename === table);
    });

    if (tablesWithoutPolicies.length === 0) {
      results.push({
        category: 'RLS Policies',
        status: 'PASS',
        message: 'All CRM tables have RLS policies defined',
      });
    } else {
      results.push({
        category: 'RLS Policies',
        status: 'WARNING',
        message: 'Some tables missing RLS policies',
        details: tablesWithoutPolicies,
      });
    }
  } catch (error) {
    results.push({
      category: 'RLS Policies',
      status: 'FAIL',
      message: 'Failed to audit RLS policies',
      details: [String(error)],
    });
  }
}

/**
 * Check RBAC enforcement in Server Actions
 */
function auditRBAC() {
  console.log('\n🛡️  Auditing RBAC Enforcement...\n');

  const moduleDirs = [
    'lib/modules/leads',
    'lib/modules/contacts',
    'lib/modules/deals',
    'lib/modules/listings',
    'lib/modules/appointments',
  ];

  let totalActions = 0;
  const actionsWithoutRBAC: string[] = [];

  moduleDirs.forEach((dir) => {
    const actionsPath = path.join(process.cwd(), dir, 'actions.ts');

    if (!fs.existsSync(actionsPath)) {
      return;
    }

    const content = fs.readFileSync(actionsPath, 'utf-8');

    // Look for exported functions
    const functionMatches = content.matchAll(
      /export async function (\w+)\(/g
    );

    for (const match of functionMatches) {
      totalActions++;
      const functionName = match[1];

      // Check if function has RBAC checks
      const hasCanAccessCRM = /canAccessCRM\(/.test(content);
      const hasCanManage = /canManage\w+\(/.test(content);
      const hasRequireAuth = /requireAuth\(/.test(content);

      if (!hasRequireAuth) {
        actionsWithoutRBAC.push(`${dir}/actions.ts:${functionName} - Missing requireAuth()`);
      }

      if (!hasCanAccessCRM && !hasCanManage) {
        actionsWithoutRBAC.push(`${dir}/actions.ts:${functionName} - Missing RBAC check`);
      }
    }
  });

  if (actionsWithoutRBAC.length === 0) {
    results.push({
      category: 'RBAC Enforcement',
      status: 'PASS',
      message: `All ${totalActions} Server Actions have RBAC checks`,
    });
  } else {
    results.push({
      category: 'RBAC Enforcement',
      status: 'FAIL',
      message: 'Some Server Actions missing RBAC',
      details: actionsWithoutRBAC,
    });
  }
}

/**
 * Check Zod validation in schemas
 */
function auditInputValidation() {
  console.log('\n✅ Auditing Input Validation...\n');

  const moduleDirs = [
    'lib/modules/leads',
    'lib/modules/contacts',
    'lib/modules/deals',
    'lib/modules/listings',
    'lib/modules/appointments',
  ];

  const modulesWithoutSchemas: string[] = [];
  const actionsWithoutValidation: string[] = [];

  moduleDirs.forEach((dir) => {
    const schemasPath = path.join(process.cwd(), dir, 'schemas.ts');
    const actionsPath = path.join(process.cwd(), dir, 'actions.ts');

    // Check if schemas file exists
    if (!fs.existsSync(schemasPath)) {
      modulesWithoutSchemas.push(dir);
      return;
    }

    const schemasContent = fs.readFileSync(schemasPath, 'utf-8');

    // Check if schemas use Zod
    const hasZod = /import.*from ['"]zod['"]/.test(schemasContent);
    if (!hasZod) {
      modulesWithoutSchemas.push(`${dir} - Not using Zod`);
      return;
    }

    // Check if actions validate input
    if (fs.existsSync(actionsPath)) {
      const actionsContent = fs.readFileSync(actionsPath, 'utf-8');

      const hasParse = /\.parse\(/.test(actionsContent);
      const hasSafeParse = /\.safeParse\(/.test(actionsContent);

      if (!hasParse && !hasSafeParse) {
        actionsWithoutValidation.push(`${dir}/actions.ts - No Zod validation`);
      }
    }
  });

  if (modulesWithoutSchemas.length === 0 && actionsWithoutValidation.length === 0) {
    results.push({
      category: 'Input Validation',
      status: 'PASS',
      message: 'All modules have Zod validation',
    });
  } else {
    results.push({
      category: 'Input Validation',
      status: 'FAIL',
      message: 'Some modules missing validation',
      details: [...modulesWithoutSchemas, ...actionsWithoutValidation],
    });
  }
}

/**
 * Check for exposed secrets
 */
function auditSecrets() {
  console.log('\n🔑 Auditing Secrets Exposure...\n');

  const exposedSecrets: string[] = [];

  // Check client-side files for secrets
  const clientDirs = [
    'app',
    'components',
  ];

  const secretPatterns = [
    /SUPABASE_SERVICE_ROLE_KEY/,
    /STRIPE_SECRET_KEY/,
    /DATABASE_URL/,
    /DOCUMENT_ENCRYPTION_KEY/,
    /PRIVATE_KEY/,
    /SECRET/,
  ];

  function scanDirectory(dir: string) {
    const fullPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(fullPath)) {
      return;
    }

    const files = fs.readdirSync(fullPath, { withFileTypes: true });

    files.forEach((file) => {
      if (file.isDirectory()) {
        scanDirectory(path.join(dir, file.name));
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const filePath = path.join(dir, file.name);
        const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');

        // Skip server-only files
        if (content.includes("'server-only'") || content.includes('"server-only"')) {
          return;
        }

        secretPatterns.forEach((pattern) => {
          if (pattern.test(content)) {
            exposedSecrets.push(`${filePath} - Potential secret exposure: ${pattern.source}`);
          }
        });
      }
    });
  }

  clientDirs.forEach(scanDirectory);

  if (exposedSecrets.length === 0) {
    results.push({
      category: 'Secrets Exposure',
      status: 'PASS',
      message: 'No secrets found in client-side code',
    });
  } else {
    results.push({
      category: 'Secrets Exposure',
      status: 'WARNING',
      message: 'Potential secret exposure detected',
      details: exposedSecrets,
    });
  }
}

/**
 * Print audit results
 */
function printResults() {
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('🔐 CRM SECURITY AUDIT RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warnings = results.filter((r) => r.status === 'WARNING').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.category}: ${result.message}`);

    if (result.details && result.details.length > 0) {
      result.details.forEach((detail) => {
        console.log(`   - ${detail}`);
      });
    }

    console.log('');
  });

  console.log('───────────────────────────────────────────────────────');
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Exit with error if any failed
  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Main audit function
 */
async function runAudit() {
  console.log('Starting CRM Security Audit...');

  await auditRLSPolicies();
  auditRBAC();
  auditInputValidation();
  auditSecrets();

  printResults();

  await prisma.$disconnect();
}

// Run audit
runAudit().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
