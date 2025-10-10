const fs = require('fs');
const path = require('path');

const files = [
  'lib/modules/ai-garage/blueprints/actions.ts',
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
  'lib/modules/tasks/index.ts',
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
  'lib/modules/transactions/workflows/index.ts'
];

let fixed = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skip: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern 1: Fix broken import blocks
  // Find "import {\n...type declarations...EOF or export"
  content = content.replace(/import\s*\{[\s\S]*?(type\s+\w+.*?;[\s\S]*?)(?=\/\*\*|export|$)/g, (match) => {
    // Extract type declarations
    const types = [];
    const typePattern = /type\s+(\w+Input)\s*[,;]/g;
    let typeMatch;
    while ((typeMatch = typePattern.exec(match)) !== null) {
      types.push(typeMatch[1]);
    }

    if (types.length > 0) {
      return types.map(t => `type ${t} = any;`).join('\n') + '\n\n';
    }
    return '';
  });

  // Pattern 2: Fix standalone broken exports in index files
  content = content.replace(/export\s+\{[\s\S]*?type\s+.*?(?=\/\/|export\s+type\s+\{|export\s+\{[^}]*\}|$)/g, (match) => {
    if (match.includes('from')) {
      return ''; // Remove exports from schemas
    }
    return match; // Keep other exports
  });

  // Pattern 3: Clean up any remaining orphaned type exports from schemas
  content = content.replace(/export\s+type\s+\{[^}]+\}\s+from\s+['"]\.[^'"]*schemas['"];?\s*/g, '');
  content = content.replace(/export\s+\{[^}]*Schema[^}]*\}\s+from\s+['"]\.[^'"]*schemas['"];?\s*/g, '');

  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\nFixed ${fixed} files`);
