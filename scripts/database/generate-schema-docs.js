#!/usr/bin/env node

/**
 * Schema Documentation Generator
 *
 * Parses Prisma schema and generates human-readable documentation files.
 * This prevents expensive MCP tool calls (18k+ tokens) by providing local
 * schema reference files that can be read directly (~500 tokens).
 *
 * Usage:
 *   node scripts/database/generate-schema-docs.js
 *   npm run db:docs (from platform directory)
 *
 * Generates:
 *   - SCHEMA-QUICK-REF.md - Models & enums only (~50 lines)
 *   - SCHEMA-MODELS.md - All models with fields (~500 lines)
 *   - SCHEMA-ENUMS.md - All enums with values (~200 lines)
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const SCHEMA_PATH = path.join(ROOT_DIR, '(platform)/prisma/schema.prisma');
const OUTPUT_DIR = path.join(ROOT_DIR, '(platform)/prisma');

// Read schema file
function readSchema() {
  try {
    return fs.readFileSync(SCHEMA_PATH, 'utf8');
  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
    process.exit(1);
  }
}

// Parse models from schema
function parseModels(schemaContent) {
  const models = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;

  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    // Parse fields
    const fields = [];
    const fieldLines = modelBody.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//') && !line.startsWith('@@'));

    for (const line of fieldLines) {
      const fieldMatch = line.match(/^(\w+)\s+(.+?)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        fields.push({ name: fieldName, type: fieldType });
      }
    }

    models.push({ name: modelName, fields });
  }

  return models;
}

// Parse enums from schema
function parseEnums(schemaContent) {
  const enums = [];
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;

  let match;
  while ((match = enumRegex.exec(schemaContent)) !== null) {
    const enumName = match[1];
    const enumBody = match[2];

    // Parse values
    const values = enumBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(line => line.split(/\s+/)[0]);

    enums.push({ name: enumName, values });
  }

  return enums;
}

// Generate Quick Reference file
function generateQuickRef(models, enums) {
  const lines = [
    '# Prisma Schema - Quick Reference',
    '',
    '**Generated:** ' + new Date().toISOString(),
    '**Source:** `(platform)/prisma/schema.prisma`',
    '',
    '> 🎯 **Purpose:** Lightning-fast schema reference to avoid expensive MCP calls',
    '> - Use this for: "What tables exist?", "What enums are available?"',
    '> - For field details, see: `SCHEMA-MODELS.md`',
    '> - For enum values, see: `SCHEMA-ENUMS.md`',
    '',
    '---',
    '',
    `## 📊 Statistics`,
    '',
    `- **Models:** ${models.length}`,
    `- **Enums:** ${enums.length}`,
    `- **Total:** ${models.length + enums.length} types`,
    '',
    '---',
    '',
    '## 📋 Models (' + models.length + ')',
    '',
  ];

  // Sort models alphabetically
  const sortedModels = [...models].sort((a, b) => a.name.localeCompare(b.name));

  // Group models by category (based on naming patterns)
  const categories = {
    'Core': [],
    'CRM': [],
    'Transactions': [],
    'Content & CMS': [],
    'AI': [],
    'Analytics': [],
    'Marketplace': [],
    'Admin': [],
    'Dashboard': [],
    'Other': []
  };

  sortedModels.forEach(model => {
    const name = model.name;
    if (['users', 'organizations', 'organization_members', 'subscriptions'].includes(name)) {
      categories['Core'].push(name);
    } else if (name.includes('customer') || name.includes('lead') || name.includes('contact') || name.includes('deal')) {
      categories['CRM'].push(name);
    } else if (name.includes('transaction') || name.includes('loop') || name.includes('document') || name.includes('signature') || name.includes('listing')) {
      categories['Transactions'].push(name);
    } else if (name.includes('content') || name.includes('campaign') || name.includes('media') || name.includes('social') || name.includes('email')) {
      categories['Content & CMS'].push(name);
    } else if (name.includes('ai_') || name.includes('conversation')) {
      categories['AI'].push(name);
    } else if (name.includes('analytics') || name.includes('metric') || name.includes('goal') || name.includes('web_vital') || name.includes('page_view')) {
      categories['Analytics'].push(name);
    } else if (name.includes('marketplace') || name.includes('tool') || name.includes('bundle') || name.includes('cart')) {
      categories['Marketplace'].push(name);
    } else if (name.includes('admin') || name.includes('onboarding') || name.includes('platform_') || name.includes('feature_flag') || name.includes('system_alert')) {
      categories['Admin'].push(name);
    } else if (name.includes('dashboard') || name.includes('widget') || name.includes('activity_feed') || name.includes('quick_action')) {
      categories['Dashboard'].push(name);
    } else {
      categories['Other'].push(name);
    }
  });

  // Output categorized models
  for (const [category, models] of Object.entries(categories)) {
    if (models.length > 0) {
      lines.push(`### ${category} (${models.length})`);
      lines.push('```');
      models.forEach(name => lines.push(name));
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('## 🏷️ Enums (' + enums.length + ')');
  lines.push('');
  lines.push('```');
  enums.forEach(e => lines.push(e.name));
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 📖 See Also');
  lines.push('');
  lines.push('- **Field Details:** `SCHEMA-MODELS.md` - All models with fields and types');
  lines.push('- **Enum Values:** `SCHEMA-ENUMS.md` - All enums with possible values');
  lines.push('- **Full Schema:** `schema.prisma` - Complete Prisma schema definition');

  return lines.join('\n');
}

// Generate Models documentation
function generateModelsDoc(models) {
  const lines = [
    '# Prisma Schema - Models Documentation',
    '',
    '**Generated:** ' + new Date().toISOString(),
    '**Source:** `(platform)/prisma/schema.prisma`',
    '',
    '> 📚 **Purpose:** Detailed model field reference',
    '> - Use this when you need to know: "What fields does X have?"',
    '> - For quick lookup, see: `SCHEMA-QUICK-REF.md`',
    '',
    `**Total Models:** ${models.length}`,
    '',
    '---',
    ''
  ];

  // Sort models alphabetically
  const sortedModels = [...models].sort((a, b) => a.name.localeCompare(b.name));

  sortedModels.forEach(model => {
    lines.push(`## ${model.name}`);
    lines.push('');
    lines.push('| Field | Type |');
    lines.push('|-------|------|');

    model.fields.forEach(field => {
      // Escape pipes in field types
      const escapedType = field.type.replace(/\|/g, '\\|');
      lines.push(`| ${field.name} | ${escapedType} |`);
    });

    lines.push('');
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

// Generate Enums documentation
function generateEnumsDoc(enums) {
  const lines = [
    '# Prisma Schema - Enums Documentation',
    '',
    '**Generated:** ' + new Date().toISOString(),
    '**Source:** `(platform)/prisma/schema.prisma`',
    '',
    '> 🏷️ **Purpose:** Complete enum values reference',
    '> - Use this when you need to know: "What are the valid values for X enum?"',
    '> - For quick lookup, see: `SCHEMA-QUICK-REF.md`',
    '',
    `**Total Enums:** ${enums.length}`,
    '',
    '---',
    ''
  ];

  // Sort enums alphabetically
  const sortedEnums = [...enums].sort((a, b) => a.name.localeCompare(b.name));

  sortedEnums.forEach(enumObj => {
    lines.push(`## ${enumObj.name}`);
    lines.push('');
    lines.push('```typescript');
    enumObj.values.forEach(value => {
      lines.push(value);
    });
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

// Write file with error handling
function writeFile(filename, content) {
  const filepath = path.join(OUTPUT_DIR, filename);
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Generated: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filename}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('📖 Prisma Schema Documentation Generator');
  console.log('========================================');
  console.log('');

  // Read and parse schema
  console.log('📂 Reading schema file...');
  const schemaContent = readSchema();

  console.log('🔍 Parsing models and enums...');
  const models = parseModels(schemaContent);
  const enums = parseEnums(schemaContent);

  console.log(`   Found ${models.length} models`);
  console.log(`   Found ${enums.length} enums`);
  console.log('');

  // Generate documentation files
  console.log('📝 Generating documentation files...');
  const quickRef = generateQuickRef(models, enums);
  const modelsDoc = generateModelsDoc(models);
  const enumsDoc = generateEnumsDoc(enums);

  // Write files
  console.log('');
  const success = [
    writeFile('SCHEMA-QUICK-REF.md', quickRef),
    writeFile('SCHEMA-MODELS.md', modelsDoc),
    writeFile('SCHEMA-ENUMS.md', enumsDoc)
  ].every(Boolean);

  console.log('');
  if (success) {
    console.log('✨ Documentation generated successfully!');
    console.log('');
    console.log('📍 Files created in: (platform)/prisma/');
    console.log('   - SCHEMA-QUICK-REF.md  (Quick reference)');
    console.log('   - SCHEMA-MODELS.md     (Model details)');
    console.log('   - SCHEMA-ENUMS.md      (Enum values)');
  } else {
    console.log('⚠️  Some files failed to generate');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseModels, parseEnums };
