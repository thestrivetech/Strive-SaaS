const fs = require('fs');
const path = require('path');

// All index.ts files with broken export blocks
const files = [
  'lib/modules/ai-garage/templates/index.ts',
  'lib/modules/appointments/index.ts',
  'lib/modules/attachments/index.ts',
  'lib/modules/content/campaigns/index.ts',
  'lib/modules/content/content/index.ts',
  'lib/modules/content/media/index.ts',
  'lib/modules/crm/contacts/index.ts',
  'lib/modules/crm/deals/index.ts',
  'lib/modules/crm/leads/index.ts',
  'lib/modules/expenses/reports/index.ts',
  'lib/modules/expenses/tax-estimates/index.ts',
  'lib/modules/marketplace/index.ts',
  'lib/modules/marketplace/reviews/index.ts',
  'lib/modules/onboarding/index.ts',
  'lib/modules/reid/ai/index.ts',
  'lib/modules/reid/alerts/index.ts',
  'lib/modules/reid/insights/index.ts',
  'lib/modules/reid/reports/index.ts',
  'lib/modules/settings/index.ts',
  'lib/modules/transactions/core/index.ts',
  'lib/modules/transactions/documents/index.ts',
  'lib/modules/transactions/listings/index.ts',
  'lib/modules/transactions/milestones/index.ts',
  'lib/modules/transactions/parties/index.ts',
  'lib/modules/transactions/signatures/index.ts',
  'lib/modules/transactions/tasks/index.ts',
  'lib/modules/transactions/workflows/index.ts'
];

let fixed = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove all schema exports
  // Pattern: export { ...Schema... } from './schemas'
  content = content.replace(/export\s*\{[^}]*Schema[^}]*\}\s*from\s*['"]\.[^'"]*schemas['"];?\s*/g, '');

  // Remove type exports from schemas
  content = content.replace(/export\s+type\s*\{[^}]*\}\s*from\s*['"]\.[^'"]*schemas['"];?\s*/g, '');

  // Fix broken export blocks (missing closing brace before next export)
  // Replace patterns like: "type Name,\n\nexport {" with just "export {"
  content = content.replace(/type\s+\w+[,\s]*\n\s*export\s*\{/g, '\nexport {');

  // Remove standalone type lines that are orphaned
  content = content.replace(/^\s*type\s+\w+[,;\s]*$/gm, '');

  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`✅ ${file}`);
  }
});

console.log(`\nFixed ${fixed} index files`);
