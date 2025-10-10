const fs = require('fs');
const path = require('path');

const files = [
  'lib/modules/ai-garage/orders/actions.ts',
  'lib/modules/ai-garage/orders/index.ts',
  'lib/modules/ai-garage/templates/actions.ts',
  'lib/modules/ai-garage/templates/index.ts',
  'lib/modules/appointments/actions.ts',
  'lib/modules/appointments/index.ts',
  'lib/modules/attachments/actions.ts',
  'lib/modules/attachments/index.ts',
  'lib/modules/content/campaigns/actions.ts',
  'lib/modules/content/campaigns/index.ts',
  'lib/modules/content/content/actions.ts',
  'lib/modules/content/content/index.ts',
  'lib/modules/content/media/actions.ts',
  'lib/modules/content/media/index.ts',
  'lib/modules/crm/contacts/actions.ts',
  'lib/modules/crm/contacts/index.ts',
  'lib/modules/crm/core/actions.ts',
  'lib/modules/crm/deals/actions.ts',
  'lib/modules/crm/deals/index.ts',
  'lib/modules/crm/leads/actions.ts',
  'lib/modules/crm/leads/index.ts',
  'lib/modules/expenses/reports/index.ts',
  'lib/modules/expenses/tax-estimates/index.ts',
  'lib/modules/marketplace/actions.ts',
  'lib/modules/marketplace/cart/actions.ts',
  'lib/modules/marketplace/index.ts',
  'lib/modules/marketplace/reviews/actions.ts',
  'lib/modules/marketplace/reviews/index.ts',
  'lib/modules/notifications/actions.ts',
  'lib/modules/onboarding/actions.ts',
  'lib/modules/onboarding/index.ts',
  'lib/modules/organization/actions.ts',
  'lib/modules/projects/actions.ts',
  'lib/modules/reid/ai/actions.ts',
  'lib/modules/reid/ai/index.ts',
  'lib/modules/reid/alerts/index.ts',
  'lib/modules/reid/insights/index.ts',
  'lib/modules/reid/reports/index.ts',
  'lib/modules/settings/billing/actions.ts',
  'lib/modules/settings/index.ts',
  'lib/modules/settings/organization/actions.ts',
  'lib/modules/settings/profile/actions.ts',
  'lib/modules/settings/security/actions.ts',
  'lib/modules/tasks/actions.ts',
  'lib/modules/transactions/actions.ts',
  'lib/modules/transactions/core/index.ts',
  'lib/modules/transactions/documents/index.ts',
  'lib/modules/transactions/listings/actions.ts',
  'lib/modules/transactions/listings/index.ts',
  'lib/modules/transactions/milestones/index.ts',
  'lib/modules/transactions/parties/index.ts',
  'lib/modules/transactions/signatures/actions.ts',
  'lib/modules/transactions/signatures/index.ts',
  'lib/modules/transactions/tasks/index.ts',
  'lib/modules/transactions/workflows/actions.ts',
  'lib/modules/workflows/index.ts'
];

let fixed = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix broken import blocks with type declarations
  // Pattern: import { ...schemas... type declarations... (missing })
  // Replace with: type declarations
  let lines = content.split('\n');
  let newLines = [];
  let inBrokenImport = false;
  let typeDeclarations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is start of broken import
    if (line.match(/^import\s*\{/) && !line.includes('}')) {
      // Look ahead to find type declarations before next comment or export
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^(\/\*\*|export|$)/)) {
        if (lines[j].match(/type\s+\w+/)) {
          const typeMatch = lines[j].match(/type\s+(\w+)/);
          if (typeMatch) {
            typeDeclarations.push(typeMatch[1]);
          }
        }
        j++;
      }

      if (typeDeclarations.length > 0) {
        // Add type declarations
        typeDeclarations.forEach(typeName => {
          newLines.push(`type ${typeName} = any;`);
        });
        inBrokenImport = true;
        i = j - 1; // Skip to the line before comment/export
        typeDeclarations = [];
        continue;
      }
    }

    // Skip schema-related exports
    if (line.match(/export\s+\{[^}]*Schema[^}]*\}\s+from.*schemas/)) {
      continue;
    }
    if (line.match(/export\s+type\s+\{[^}]+\}\s+from.*schemas/)) {
      continue;
    }
    if (line.match(/export\s+\*\s+from.*schemas/)) {
      continue;
    }

    // Add the line if we're not skipping it
    if (!inBrokenImport || !line.match(/^\s*(type|Schema)/)) {
      newLines.push(line);
    }

    if (inBrokenImport && line.match(/^(\/\*\*|export)/)) {
      inBrokenImport = false;
    }
  }

  content = newLines.join('\n');

  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`✅ ${file}`);
  }
});

console.log(`\nFixed ${fixed} files`);
