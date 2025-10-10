const fs = require('fs');
const path = require('path');

const files = [
  'lib/modules/transactions/actions.ts',
  'lib/modules/transactions/index.ts',
  'lib/modules/settings/security/actions.ts',
  'lib/modules/settings/profile/actions.ts',
  'lib/modules/settings/organization/actions.ts',
  'lib/modules/settings/billing/actions.ts',
  'lib/modules/settings/index.ts',
  'lib/modules/content/campaigns/queries.ts',
  'lib/modules/content/content/queries.ts',
  'lib/modules/transactions/workflows/queries.ts',
  'lib/modules/transactions/workflows/index.ts',
  'lib/modules/transactions/workflows/actions.ts',
  'lib/modules/transactions/tasks/queries.ts',
  'lib/modules/transactions/tasks/index.ts',
  'lib/modules/transactions/tasks/actions.ts',
  'lib/modules/transactions/signatures/queries.ts',
  'lib/modules/transactions/signatures/index.ts',
  'lib/modules/transactions/signatures/actions.ts',
  'lib/modules/transactions/parties/queries.ts',
  'lib/modules/transactions/parties/index.ts',
  'lib/modules/transactions/parties/actions.ts',
  'lib/modules/transactions/milestones/index.ts',
  'lib/modules/transactions/milestones/calculator.ts',
  'lib/modules/transactions/listings/queries.ts',
  'lib/modules/transactions/listings/index.ts',
  'lib/modules/transactions/listings/actions.ts',
  'lib/modules/transactions/documents/queries.ts',
  'lib/modules/transactions/documents/index.ts',
  'lib/modules/transactions/documents/actions.ts',
  'lib/modules/transactions/core/queries.ts',
  'lib/modules/transactions/core/index.ts',
  'lib/modules/transactions/core/actions.ts',
  'lib/modules/tasks/queries.ts',
  'lib/modules/tasks/index.ts',
  'lib/modules/tasks/actions.ts',
  'lib/modules/reid/reports/queries.ts',
  'lib/modules/reid/reports/index.ts',
  'lib/modules/reid/reports/generator.ts',
  'lib/modules/reid/reports/actions.ts',
  'lib/modules/reid/preferences/index.ts',
  'lib/modules/reid/preferences/actions.ts',
  'lib/modules/reid/insights/queries.ts',
  'lib/modules/reid/insights/index.ts',
  'lib/modules/reid/insights/actions.ts',
  'lib/modules/reid/alerts/index.ts',
  'lib/modules/reid/alerts/actions.ts',
  'lib/modules/reid/ai/profile-generator.ts',
  'lib/modules/reid/ai/insights-analyzer.ts',
  'lib/modules/reid/ai/index.ts',
  'lib/modules/reid/ai/actions.ts',
  'lib/modules/projects/queries.ts',
  'lib/modules/projects/actions.ts',
  'lib/modules/organization/actions.ts',
  'lib/modules/onboarding/index.ts',
  'lib/modules/onboarding/actions.ts',
  'lib/modules/notifications/actions.ts',
  'lib/modules/marketplace/reviews/queries.ts',
  'lib/modules/marketplace/reviews/index.ts',
  'lib/modules/marketplace/reviews/actions.ts',
  'lib/modules/marketplace/queries.ts',
  'lib/modules/marketplace/index.ts',
  'lib/modules/marketplace/cart/actions.ts',
  'lib/modules/marketplace/actions.ts',
  'lib/modules/expenses/tax-estimates/index.ts',
  'lib/modules/expenses/tax-estimates/actions.ts',
  'lib/modules/expenses/reports/index.ts',
  'lib/modules/expenses/reports/actions.ts',
  'lib/modules/expenses/receipts/index.ts',
  'lib/modules/expenses/expenses/queries.ts',
  'lib/modules/expenses/expenses/index.ts',
  'lib/modules/expenses/expenses/actions.ts',
  'lib/modules/dashboard/widgets/actions.ts',
  'lib/modules/dashboard/quick-actions/actions.ts',
  'lib/modules/dashboard/metrics/actions.ts',
  'lib/modules/dashboard/index.ts',
  'lib/modules/dashboard/activities/actions.ts',
  'lib/modules/crm/leads/queries.ts',
  'lib/modules/crm/leads/index.ts',
  'lib/modules/crm/leads/actions.ts',
  'lib/modules/crm/index.ts',
  'lib/modules/crm/deals/queries.ts',
  'lib/modules/crm/deals/index.ts',
  'lib/modules/crm/deals/actions.ts',
  'lib/modules/crm/core/queries.ts',
  'lib/modules/crm/core/actions.ts',
  'lib/modules/crm/contacts/queries.ts',
  'lib/modules/crm/contacts/index.ts',
  'lib/modules/crm/contacts/actions.ts',
  'lib/modules/content/media/upload.ts',
  'lib/modules/content/media/queries.ts',
  'lib/modules/content/media/index.ts',
  'lib/modules/content/media/actions.ts',
  'lib/modules/content/content/index.ts',
  'lib/modules/content/content/actions.ts',
  'lib/modules/content/campaigns/index.ts',
  'lib/modules/content/campaigns/actions.ts',
  'lib/modules/attachments/index.ts',
  'lib/modules/attachments/actions.ts',
  'lib/modules/appointments/queries.ts',
  'lib/modules/appointments/index.ts',
  'lib/modules/appointments/actions.ts',
  'lib/modules/ai-hub/index.ts',
  'lib/modules/ai-garage/templates/queries.ts',
  'lib/modules/ai-garage/templates/index.ts',
  'lib/modules/ai-garage/templates/actions.ts',
  'lib/modules/ai-garage/orders/queries.ts',
  'lib/modules/ai-garage/orders/index.ts',
  'lib/modules/ai-garage/orders/actions.ts',
  'lib/modules/ai-garage/blueprints/queries.ts',
  'lib/modules/ai-garage/blueprints/actions.ts',
  'lib/modules/ai/index.ts',
  'lib/modules/ai/actions.ts',
  'lib/modules/admin/index.ts',
  'lib/modules/admin/actions.ts'
];

let processedCount = 0;
let errorCount = 0;
const changes = [];

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Skip - File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileChanges = [];

    // 1. Remove import lines with 'schemas'
    const importLines = content.split('\n');
    const filteredLines = importLines.filter((line, index) => {
      if (line.match(/from\s+['"]\.[^'"]*schemas['"]/)) {
        fileChanges.push(`Line ${index + 1}: Removed import - ${line.trim()}`);
        return false;
      }
      return true;
    });
    content = filteredLines.join('\n');

    // 2. Replace .parse() calls with direct assignment
    const parsePattern = /const\s+(\w+)\s+=\s+(\w+)\.parse\(([^)]+)\);/g;
    let match;
    while ((match = parsePattern.exec(content)) !== null) {
      const varName = match[1];
      const paramName = match[3];
      const replacement = `const ${varName} = ${paramName};`;
      content = content.replace(match[0], replacement);
      fileChanges.push(`Replaced: ${match[0].trim()} -> ${replacement}`);
    }

    // 3. Remove safeParse validation
    const safeParsePattern = /const\s+result\s+=\s+\w+\.safeParse\([^)]+\);[\s\S]*?if\s*\(\s*!result\.success\s*\)[^}]*}/g;
    content = content.replace(safeParsePattern, (match) => {
      fileChanges.push(`Removed safeParse validation block`);
      return '';
    });

    // 4. Remove schema exports from index.ts files
    if (file.endsWith('index.ts')) {
      const exportLines = content.split('\n');
      const filteredExports = exportLines.filter((line, index) => {
        if (line.match(/export\s+\{[^}]*Schema[^}]*\}\s+from\s+['"]\.[^'"]*schemas['"]/)) {
          fileChanges.push(`Line ${index + 1}: Removed schema export - ${line.trim()}`);
          return false;
        }
        if (line.match(/export\s+\*\s+from\s+['"]\.[^'"]*schemas['"]/)) {
          fileChanges.push(`Line ${index + 1}: Removed export * from schemas`);
          return false;
        }
        if (line.match(/export\s+type\s+\{[^}]*Input[^}]*\}\s+from\s+['"]\.[^'"]*schemas['"]/)) {
          fileChanges.push(`Line ${index + 1}: Removed type export from schemas`);
          return false;
        }
        return true;
      });
      content = filteredExports.join('\n');
    }

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      processedCount++;
      changes.push({
        file,
        changes: fileChanges
      });
      console.log(`✅ ${file} (${fileChanges.length} changes)`);
    }

  } catch (error) {
    errorCount++;
    console.error(`❌ Error: ${file} - ${error.message}`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Processed: ${processedCount}`);
console.log(`Errors: ${errorCount}`);
console.log(`Total: ${files.length}`);

const report = changes.map(c => {
  return `\n${c.file}\n${c.changes.map(ch => `  - ${ch}`).join('\n')}`;
}).join('\n');

fs.writeFileSync('schema-removal-report.txt', `SCHEMA REMOVAL REPORT\n=====================${report}`, 'utf8');
console.log(`Report: schema-removal-report.txt`);
