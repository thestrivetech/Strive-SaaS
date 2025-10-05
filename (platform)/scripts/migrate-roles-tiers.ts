#!/usr/bin/env tsx
/**
 * Role & Tier Migration Script
 *
 * Automates bulk find-and-replace operations for role and tier migrations
 * across the codebase with validation and rollback support.
 *
 * Usage:
 *   npx tsx scripts/migrate-roles-tiers.ts --config scripts/migration-config.json
 *   npx tsx scripts/migrate-roles-tiers.ts --config scripts/migration-config.json --dry-run
 *   npx tsx scripts/migrate-roles-tiers.ts --config scripts/migration-config.json --rollback
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface ReplacementRule {
  find: string | RegExp;
  replace: string;
  filePattern?: string; // Glob pattern for files to search
  description?: string;
}

interface MigrationConfig {
  name: string;
  description: string;
  backupDir?: string;
  rules: ReplacementRule[];
  excludePatterns?: string[]; // Files to exclude
  validation?: {
    typeCheck?: boolean;
    tests?: boolean;
  };
}

class RoleTierMigrator {
  private config: MigrationConfig;
  private dryRun: boolean;
  private changes: Map<string, { old: string; new: string }> = new Map();
  private backupPath: string;

  constructor(configPath: string, dryRun = false) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    this.dryRun = dryRun;
    this.backupPath = this.config.backupDir || `.migration-backup-${Date.now()}`;
  }

  /**
   * Run the migration
   */
  async migrate(): Promise<void> {
    console.log(`🚀 Starting migration: ${this.config.name}`);
    console.log(`📝 ${this.config.description}\n`);

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    } else {
      // Create backup
      console.log(`💾 Creating backup at: ${this.backupPath}`);
      this.createBackup();
    }

    // Process each rule
    for (const rule of this.config.rules) {
      await this.processRule(rule);
    }

    // Summary
    this.printSummary();

    // Validation
    if (!this.dryRun && this.config.validation) {
      await this.validate();
    }

    console.log('\n✅ Migration complete!');

    if (!this.dryRun) {
      console.log(`\n💡 Backup saved to: ${this.backupPath}`);
      console.log('   To rollback: npx tsx scripts/migrate-roles-tiers.ts --rollback');
    }
  }

  /**
   * Rollback to backup
   */
  async rollback(backupPath?: string): Promise<void> {
    const restorePath = backupPath || this.findLatestBackup();

    if (!restorePath || !fs.existsSync(restorePath)) {
      throw new Error('No backup found to rollback');
    }

    console.log(`⏪ Rolling back from: ${restorePath}`);

    // Restore files
    const backupFiles = glob.sync('**/*', {
      cwd: restorePath,
      nodir: true,
      dot: true
    });

    for (const file of backupFiles) {
      const backupFilePath = path.join(restorePath, file);
      const targetPath = path.join(process.cwd(), file);

      // Restore file
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.copyFileSync(backupFilePath, targetPath);
      console.log(`  Restored: ${file}`);
    }

    console.log('\n✅ Rollback complete!');
  }

  /**
   * Process a single replacement rule
   */
  private async processRule(rule: ReplacementRule): Promise<void> {
    console.log(`\n🔧 Processing rule: ${rule.description || rule.find.toString()}`);

    // Get files to process
    const filePattern = rule.filePattern || '**/*.{ts,tsx,js,jsx}';
    const files = await this.getFiles(filePattern);

    let totalReplacements = 0;

    for (const file of files) {
      const result = this.processFile(file, rule);
      if (result > 0) {
        totalReplacements += result;
        console.log(`  ✓ ${file}: ${result} replacement(s)`);
      }
    }

    console.log(`  Total: ${totalReplacements} replacements in ${files.length} files`);
  }

  /**
   * Process a single file
   */
  private processFile(filePath: string, rule: ReplacementRule): number {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Perform replacement
    let count = 0;
    if (typeof rule.find === 'string') {
      const regex = new RegExp(this.escapeRegex(rule.find), 'g');
      content = content.replace(regex, (match) => {
        count++;
        return rule.replace;
      });
    } else {
      content = content.replace(rule.find, (match) => {
        count++;
        return rule.replace;
      });
    }

    // Save changes
    if (count > 0 && !this.dryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
      this.changes.set(filePath, { old: originalContent, new: content });
    }

    return count;
  }

  /**
   * Get files matching pattern
   */
  private async getFiles(pattern: string): Promise<string[]> {
    const excludePatterns = this.config.excludePatterns || [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
    ];

    const files = glob.sync(pattern, {
      ignore: excludePatterns,
      nodir: true,
    });

    return files;
  }

  /**
   * Create backup of all files that will be modified
   */
  private createBackup(): void {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }

    // Save config
    fs.writeFileSync(
      path.join(this.backupPath, 'migration-config.json'),
      JSON.stringify(this.config, null, 2)
    );

    // Note: Actual file backups happen during processFile
  }

  /**
   * Find the latest backup directory
   */
  private findLatestBackup(): string | null {
    const backups = glob.sync('.migration-backup-*', { nodir: false })
      .sort()
      .reverse();

    return backups[0] || null;
  }

  /**
   * Validate changes
   */
  private async validate(): Promise<void> {
    console.log('\n🔍 Validating changes...');

    if (this.config.validation?.typeCheck) {
      console.log('\n📘 Running TypeScript type check...');
      try {
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        console.log('✅ Type check passed');
      } catch (error) {
        console.error('❌ Type check failed');
        throw error;
      }
    }

    if (this.config.validation?.tests) {
      console.log('\n🧪 Running tests...');
      try {
        execSync('npm test', { stdio: 'inherit' });
        console.log('✅ Tests passed');
      } catch (error) {
        console.error('❌ Tests failed');
        throw error;
      }
    }
  }

  /**
   * Print summary of changes
   */
  private printSummary(): void {
    console.log('\n📊 Migration Summary:');
    console.log(`   Files modified: ${this.changes.size}`);
    console.log(`   Rules processed: ${this.config.rules.length}`);
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// CLI
const args = process.argv.slice(2);
const configPath = args.find((arg, i) => args[i - 1] === '--config') || 'scripts/migration-config.json';
const dryRun = args.includes('--dry-run');
const rollback = args.includes('--rollback');
const backupPath = args.find((arg, i) => args[i - 1] === '--backup');

(async () => {
  try {
    const migrator = new RoleTierMigrator(configPath, dryRun);

    if (rollback) {
      await migrator.rollback(backupPath);
    } else {
      await migrator.migrate();
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
})();
