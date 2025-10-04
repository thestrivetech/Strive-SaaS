#!/usr/bin/env node
/**
 * Generate Project Directory Map
 *
 * Creates comprehensive directory structure maps in both text and JSON formats.
 * Respects .gitignore rules and excludes common build/dependency folders.
 *
 * Usage: node scripts/generate-directory-map.js
 * Output:
 *   - project-directory-map.txt (root directory)
 *   - project-directory-map.json (root directory)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_TXT = path.join(ROOT_DIR, 'project-directory-map.txt');

// Directories to always exclude
const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.vercel',
  '.git',
  'dist',
  'build',
  'out',
  '.cache',
  'coverage',
  '.turbo',
  '.claude',
  '.serena',
]);

// Files to always exclude
const EXCLUDE_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
  '.env',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

// File extensions to exclude
const EXCLUDE_EXTENSIONS = new Set([
  '.log',
  '.lock',
]);

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if path should be excluded
 */
function shouldExclude(itemPath, isDirectory) {
  const name = path.basename(itemPath);

  // Check exclude lists
  if (isDirectory && EXCLUDE_DIRS.has(name)) return true;
  if (!isDirectory && EXCLUDE_FILES.has(name)) return true;

  // Check extensions
  const ext = path.extname(name);
  if (EXCLUDE_EXTENSIONS.has(ext)) return true;

  // Exclude hidden files (except .gitignore, .env.example)
  if (name.startsWith('.') && !['gitignore', '.env.example'].includes(name)) {
    return true;
  }

  return false;
}

/**
 * Get emoji for file type
 */
function getFileEmoji(fileName) {
  const ext = path.extname(fileName).toLowerCase();

  const emojiMap = {
    // Code
    '.ts': '📘',
    '.tsx': '⚛️',
    '.js': '📜',
    '.jsx': '⚛️',
    '.mjs': '📜',
    '.json': '📋',

    // Styles
    '.css': '🎨',
    '.scss': '🎨',
    '.sass': '🎨',

    // Config
    '.yml': '⚙️',
    '.yaml': '⚙️',
    '.toml': '⚙️',
    '.env': '🔐',

    // Documentation
    '.md': '📝',
    '.mdx': '📝',
    '.txt': '📄',

    // Data
    '.sql': '🗄️',
    '.prisma': '🗄️',

    // Media
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.gif': '🖼️',
    '.svg': '🎨',
    '.ico': '🖼️',
  };

  return emojiMap[ext] || '📄';
}

// ============================================================================
// Directory Scanning
// ============================================================================

/**
 * Recursively scan directory and build tree structure
 */
function scanDirectory(dirPath, relativePath = '', depth = 0) {
  const items = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    // Sort: directories first, then files, both alphabetically
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      // Skip excluded items
      if (shouldExclude(fullPath, entry.isDirectory())) {
        continue;
      }

      const item = {
        name: entry.name,
        path: relPath,
        isDirectory: entry.isDirectory(),
      };

      if (entry.isDirectory()) {
        // Recursively scan subdirectory
        item.children = scanDirectory(fullPath, relPath, depth + 1);
        item.fileCount = countFiles(item.children);
      } else {
        // Get file stats
        try {
          const stats = fs.statSync(fullPath);
          item.size = stats.size;
          item.formattedSize = formatSize(stats.size);
          item.modified = stats.mtime;
        } catch (err) {
          // File may have been deleted or is inaccessible
          continue;
        }
      }

      items.push(item);
    }
  } catch (err) {
    console.error(`Error scanning ${dirPath}:`, err.message);
  }

  return items;
}

/**
 * Count total files in tree
 */
function countFiles(items) {
  let count = 0;
  for (const item of items) {
    if (item.isDirectory) {
      count += countFiles(item.children);
    } else {
      count++;
    }
  }
  return count;
}

// ============================================================================
// Output Generators
// ============================================================================

/**
 * Generate text-based tree structure
 */
function generateTextTree(items, prefix = '', isLast = true) {
  let output = '';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isLastItem = i === items.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    const extension = isLastItem ? '    ' : '│   ';

    if (item.isDirectory) {
      output += `${prefix}${connector}📁 ${item.name}/`;
      if (item.fileCount > 0) {
        output += ` (${item.fileCount} files)`;
      }
      output += '\n';

      // Recursively add children
      if (item.children && item.children.length > 0) {
        output += generateTextTree(item.children, prefix + extension, isLastItem);
      }
    } else {
      const emoji = getFileEmoji(item.name);
      output += `${prefix}${connector}${emoji} ${item.name} (${item.formattedSize})\n`;
    }
  }

  return output;
}

/**
 * Generate header for text output
 */
function generateTextHeader() {
  const now = new Date().toISOString();
  return `STRIVE SAAS - PROJECT DIRECTORY STRUCTURE
Generated: ${now}
Root Path: ${ROOT_DIR}
${'='.repeat(80)}

`;
}

/**
 * Generate footer with statistics
 */
function generateTextFooter(tree) {
  const stats = calculateStats(tree);
  return `
${'='.repeat(80)}
STATISTICS:
- Total Files: ${stats.totalFiles}
- Total Directories: ${stats.totalDirs}
- Total Size: ${formatSize(stats.totalSize)}
${'='.repeat(80)}
`;
}

/**
 * Calculate tree statistics
 */
function calculateStats(items) {
  let totalFiles = 0;
  let totalDirs = 0;
  let totalSize = 0;

  for (const item of items) {
    if (item.isDirectory) {
      totalDirs++;
      const childStats = calculateStats(item.children);
      totalFiles += childStats.totalFiles;
      totalDirs += childStats.totalDirs;
      totalSize += childStats.totalSize;
    } else {
      totalFiles++;
      totalSize += item.size || 0;
    }
  }

  return { totalFiles, totalDirs, totalSize };
}

// ============================================================================
// Main
// ============================================================================

function main() {
  console.log('🔍 Scanning project directory...');
  console.log(`📂 Root: ${ROOT_DIR}`);

  // Scan directory tree
  const tree = scanDirectory(ROOT_DIR, '');

  // Generate JSON output
  console.log('\n📝 Generating JSON map...');
  const jsonData = {
    generated: new Date().toISOString(),
    rootPath: ROOT_DIR,
    tree: tree,
    stats: calculateStats(tree),
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`✅ Created: ${OUTPUT_JSON}`);

  // Generate text output
  console.log('\n📝 Generating text map...');
  const textOutput =
    generateTextHeader() +
    generateTextTree(tree) +
    generateTextFooter(tree);

  fs.writeFileSync(OUTPUT_TXT, textOutput, 'utf-8');
  console.log(`✅ Created: ${OUTPUT_TXT}`);

  // Display summary
  const stats = calculateStats(tree);
  console.log('\n📊 Summary:');
  console.log(`   Files: ${stats.totalFiles}`);
  console.log(`   Directories: ${stats.totalDirs}`);
  console.log(`   Total Size: ${formatSize(stats.totalSize)}`);
  console.log('\n✨ Done!\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateTextTree, calculateStats };
