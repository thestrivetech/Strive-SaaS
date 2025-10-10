/**
 * Test Script: Content Security Audit
 *
 * Runs the ContentPilot security audit and displays results
 *
 * Usage:
 *   npx tsx scripts/test-content-security-audit.ts
 */

import { auditContentSecurity, formatAuditReport } from '../../lib/security/content-audit';

async function main() {
  console.log('🔒 Running ContentPilot Security Audit...\n');

  try {
    const result = await auditContentSecurity();

    // Display formatted report
    console.log(formatAuditReport(result));

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Audit failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();
