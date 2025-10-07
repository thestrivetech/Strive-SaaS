/**
 * Security Audit Tool
 *
 * Performs comprehensive security checks on the CRM implementation:
 * - RLS (Row Level Security) policies
 * - RBAC (Role-Based Access Control) enforcement
 * - Exposed secrets detection
 * - Input validation coverage
 * - Multi-tenancy enforcement
 */

import { prisma } from '@/lib/database/prisma';

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'rls' | 'rbac' | 'secrets' | 'validation' | 'multi-tenancy';
  message: string;
  recommendation: string;
}

export interface AuditResult {
  passed: boolean;
  score: number; // 0-100
  issues: SecurityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * CRM tables that MUST have RLS policies
 */
const CRM_TABLES = [
  'leads',
  'contacts',
  'deals',
  'listings',
  'activities',
  'appointments',
] as const;

/**
 * Run comprehensive security audit
 */
export async function performSecurityAudit(): Promise<AuditResult> {
  const issues: SecurityIssue[] = [];

  // 1. Check RLS policies
  const rlsIssues = await checkRLSPolicies();
  issues.push(...rlsIssues);

  // 2. Check for exposed secrets
  const secretsIssues = checkExposedSecrets();
  issues.push(...secretsIssues);

  // 3. Check RBAC implementation
  const rbacIssues = await checkRBACImplementation();
  issues.push(...rbacIssues);

  // 4. Check input validation
  const validationIssues = checkInputValidation();
  issues.push(...validationIssues);

  // 5. Check multi-tenancy enforcement
  const multiTenancyIssues = await checkMultiTenancy();
  issues.push(...multiTenancyIssues);

  // Calculate summary
  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  // Calculate score (100 - deductions)
  const deductions =
    (summary.critical * 25) +
    (summary.high * 10) +
    (summary.medium * 5) +
    (summary.low * 2);

  const score = Math.max(0, 100 - deductions);
  const passed = summary.critical === 0 && summary.high === 0;

  return {
    passed,
    score,
    issues,
    summary,
  };
}

/**
 * Check that RLS policies exist on all CRM tables
 */
async function checkRLSPolicies(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  try {
    // Check each table for RLS enabled
    for (const table of CRM_TABLES) {
      const result = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
        SELECT rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = ${table}
      `;

      if (result.length === 0) {
        issues.push({
          severity: 'high',
          category: 'rls',
          message: `Table '${table}' does not exist`,
          recommendation: `Create the '${table}' table with proper schema`,
        });
        continue;
      }

      if (!result[0].rowsecurity) {
        issues.push({
          severity: 'critical',
          category: 'rls',
          message: `RLS not enabled on table '${table}'`,
          recommendation: `Run: ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
        });
      }

      // Check for policies
      const policies = await prisma.$queryRaw<Array<{ policyname: string }>>`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = ${table}
      `;

      if (policies.length === 0) {
        issues.push({
          severity: 'critical',
          category: 'rls',
          message: `No RLS policies found for table '${table}'`,
          recommendation: `Create RLS policies for tenant isolation on '${table}'`,
        });
      }
    }
  } catch (error) {
    issues.push({
      severity: 'high',
      category: 'rls',
      message: `Failed to check RLS policies: ${error}`,
      recommendation: 'Verify database connection and permissions',
    });
  }

  return issues;
}

/**
 * Check for exposed secrets in client-side code
 */
function checkExposedSecrets(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // This runs in Node.js (server-side), so we can't directly check window
  // Instead, we check environment variables that should NOT be exposed

  const dangerousEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL',
    'DOCUMENT_ENCRYPTION_KEY',
  ];

  for (const envVar of dangerousEnvVars) {
    // Check if it's exposed to client (starts with NEXT_PUBLIC_)
    if (process.env[`NEXT_PUBLIC_${envVar}`]) {
      issues.push({
        severity: 'critical',
        category: 'secrets',
        message: `CRITICAL: ${envVar} is exposed to client as NEXT_PUBLIC_${envVar}`,
        recommendation: `Remove NEXT_PUBLIC_ prefix from ${envVar}. This secret must ONLY be server-side.`,
      });
    }

    // Check if it exists (should exist in .env.local)
    if (!process.env[envVar]) {
      issues.push({
        severity: 'medium',
        category: 'secrets',
        message: `${envVar} not found in environment`,
        recommendation: `Add ${envVar} to your .env.local file`,
      });
    }
  }

  return issues;
}

/**
 * Check RBAC enforcement in Server Actions
 */
async function checkRBACImplementation(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  // Note: This is a static check. In a real implementation, you would
  // use AST parsing to analyze source files for permission checks.
  // For now, we'll do basic checks.

  const serverActionFiles = [
    'lib/modules/crm/leads/actions.ts',
    'lib/modules/crm/contacts/actions.ts',
    'lib/modules/crm/deals/actions.ts',
    'lib/modules/crm/listings/actions.ts',
  ];

  // Placeholder for actual file content analysis
  // In production, you would use @typescript-eslint/parser or similar
  // to parse files and check for permission checks

  issues.push({
    severity: 'low',
    category: 'rbac',
    message: 'RBAC checks should be verified manually in Server Actions',
    recommendation: 'Review all Server Actions to ensure they call canAccessCRM() and appropriate permission checks',
  });

  return issues;
}

/**
 * Check input validation coverage
 */
function checkInputValidation(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Note: This is a placeholder. In a real implementation, you would
  // analyze schema files to ensure all inputs are validated with Zod.

  const schemaFiles = [
    'lib/modules/crm/leads/schemas.ts',
    'lib/modules/crm/contacts/schemas.ts',
    'lib/modules/crm/deals/schemas.ts',
    'lib/modules/crm/listings/schemas.ts',
  ];

  // Placeholder check
  issues.push({
    severity: 'low',
    category: 'validation',
    message: 'Input validation should be verified manually',
    recommendation: 'Ensure all Server Actions use Zod schemas to validate input before database operations',
  });

  return issues;
}

/**
 * Check multi-tenancy enforcement
 */
async function checkMultiTenancy(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  try {
    // Check that all CRM tables have organization_id column
    for (const table of CRM_TABLES) {
      const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = 'organization_id'
      `;

      if (columns.length === 0) {
        issues.push({
          severity: 'critical',
          category: 'multi-tenancy',
          message: `Table '${table}' missing organization_id column`,
          recommendation: `Add organization_id column to '${table}' for tenant isolation`,
        });
      }
    }

    // Check for indexes on organization_id (performance)
    for (const table of CRM_TABLES) {
      const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = ${table}
        AND indexdef LIKE '%organization_id%'
      `;

      if (indexes.length === 0) {
        issues.push({
          severity: 'medium',
          category: 'multi-tenancy',
          message: `No index on organization_id for table '${table}'`,
          recommendation: `Create index: CREATE INDEX CONCURRENTLY idx_${table}_org_id ON ${table}(organization_id);`,
        });
      }
    }
  } catch (error) {
    issues.push({
      severity: 'high',
      category: 'multi-tenancy',
      message: `Failed to check multi-tenancy: ${error}`,
      recommendation: 'Verify database connection and schema',
    });
  }

  return issues;
}

/**
 * Generate human-readable audit report
 */
export function generateAuditReport(result: AuditResult): string {
  const { passed, score, issues, summary } = result;

  let report = '=====================================\n';
  report += '   SECURITY AUDIT REPORT\n';
  report += '=====================================\n\n';

  report += `Overall Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `Security Score: ${score}/100\n\n`;

  report += 'Summary:\n';
  report += `---------\n`;
  report += `Critical Issues: ${summary.critical}\n`;
  report += `High Issues:     ${summary.high}\n`;
  report += `Medium Issues:   ${summary.medium}\n`;
  report += `Low Issues:      ${summary.low}\n\n`;

  if (issues.length > 0) {
    report += 'Issues Found:\n';
    report += '-------------\n\n';

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical');
    const high = issues.filter(i => i.severity === 'high');
    const medium = issues.filter(i => i.severity === 'medium');
    const low = issues.filter(i => i.severity === 'low');

    const printIssues = (severity: string, issueList: SecurityIssue[]) => {
      if (issueList.length > 0) {
        report += `${severity.toUpperCase()} SEVERITY:\n`;
        issueList.forEach((issue, idx) => {
          report += `${idx + 1}. [${issue.category}] ${issue.message}\n`;
          report += `   → ${issue.recommendation}\n\n`;
        });
      }
    };

    printIssues('critical', critical);
    printIssues('high', high);
    printIssues('medium', medium);
    printIssues('low', low);
  } else {
    report += '✅ No security issues found!\n\n';
  }

  report += '=====================================\n';
  return report;
}

/**
 * Run audit and print report
 */
export async function runAudit(): Promise<void> {
  console.log('Running security audit...\n');

  const result = await performSecurityAudit();
  const report = generateAuditReport(result);

  console.log(report);

  // Exit with error code if failed
  if (!result.passed) {
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  runAudit()
    .then(() => {
      console.log('Audit complete.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Audit failed:', error);
      process.exit(1);
    });
}
