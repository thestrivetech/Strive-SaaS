# Script Usage Guide

## Generate Directory Map

Creates a complete map of the project directory structure.

### Quick Start

```bash
# From project root
node scripts/generate-directory-map.js
```

### What It Does

1. **Scans** the entire project directory
2. **Excludes** common build/dependency folders:
   - `node_modules/`
   - `.next/`
   - `.git/`
   - `build/`, `dist/`, `out/`
   - `.claude/`, `.serena/`

3. **Generates** two files in the **root directory**:
   - `project-directory-map.txt` - Human-readable tree
   - `project-directory-map.json` - Machine-readable data

### Output Example (TXT)

```
STRIVE SAAS - PROJECT DIRECTORY STRUCTURE
Generated: 2025-10-03T04:27:28.437Z
Root Path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS
================================================================================

├── 📁 app/ (600 files)
│   ├── 📁 components/ (120 files)
│   │   ├── 📁 ui/ (45 files)
│   │   │   ├── ⚛️ button.tsx (2.3 KB)
│   │   │   └── ⚛️ card.tsx (1.8 KB)
│   │   └── 📁 features/ (75 files)
│   └── 📁 lib/ (180 files)
├── 📁 scripts/ (2 files)
└── 📝 README.md (29.5 KB)

================================================================================
STATISTICS:
- Total Files: 1170
- Total Directories: 354
- Total Size: 25.6 MB
================================================================================
```

### Output Example (JSON)

```json
{
  "generated": "2025-10-03T04:27:28.432Z",
  "rootPath": "C:\\Users\\zochr\\Desktop\\GitHub\\Strive-SaaS",
  "tree": [
    {
      "name": "app",
      "path": "app",
      "isDirectory": true,
      "children": [...],
      "fileCount": 600
    }
  ],
  "stats": {
    "totalFiles": 1170,
    "totalDirs": 354,
    "totalSize": 26843545
  }
}
```

### When to Use

- **Documentation**: Share project structure with team
- **Analysis**: Understand codebase organization
- **Onboarding**: Help new developers navigate
- **Architecture Review**: See overall structure at a glance
- **Before Major Refactors**: Snapshot current state

### Customization

Edit `scripts/generate-directory-map.js` to modify:

- **EXCLUDE_DIRS**: Add/remove excluded directories
- **EXCLUDE_FILES**: Add/remove excluded files
- **EXCLUDE_EXTENSIONS**: Add/remove excluded file types
- **getFileEmoji()**: Change emoji mappings

### Troubleshooting

**Script fails with "Cannot find module"**
- Make sure you're running from project root
- Node.js must be installed

**Missing directories in output**
- Check if directory is in EXCLUDE_DIRS list
- Verify directory actually contains files

**File sizes incorrect**
- Script shows actual file sizes on disk
- Build artifacts may inflate sizes if not excluded

### Pro Tips

1. **Run after major changes** to update documentation
2. **Commit the output** to track structure changes
3. **Add to CI/CD** to auto-generate on deployment
4. **Compare outputs** to see what changed between branches
5. **Use JSON** for programmatic analysis

### Integration Ideas

```bash
# Add to package.json scripts
"scripts": {
  "map": "node scripts/generate-directory-map.js"
}

# Then run with
npm run map
```

```bash
# Git pre-commit hook
#!/bin/bash
node scripts/generate-directory-map.js
git add project-directory-map.*
```

### Related Files

- `scripts/generate-directory-map.js` - Main script
- `scripts/README.md` - Scripts overview
- `project-directory-map.txt` - Text output (root)
- `project-directory-map.json` - JSON output (root)
