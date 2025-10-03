# Scripts

Utility scripts for the Strive SaaS project.

## Available Scripts

### `generate-directory-map.js`

Generates comprehensive project directory structure maps in both text and JSON formats.

**Usage:**
```bash
node scripts/generate-directory-map.js
```

**Outputs:**
- `project-directory-map.txt` - Human-readable tree structure (root directory)
- `project-directory-map.json` - Machine-readable JSON format (root directory)

**Features:**
- 📁 Respects .gitignore patterns
- 🚫 Excludes node_modules, .next, build folders
- 📊 Shows file sizes and statistics
- 🎨 Uses emojis for file types
- 📈 Provides summary statistics

**Configuration:**
- Excluded directories: node_modules, .next, .vercel, .git, dist, build, .cache, .turbo, .claude, .serena
- Excluded files: .DS_Store, .env.local, package-lock.json, etc.
- Excluded extensions: .log, .lock

## Adding New Scripts

1. Create a new `.js` file in this directory
2. Add a shebang line: `#!/usr/bin/env node`
3. Document it in this README
4. Make it executable: `chmod +x scripts/your-script.js` (Unix/Mac)

## Notes

- All scripts run from the project root directory
- Scripts should be Node.js compatible (no TypeScript)
- Keep scripts focused and single-purpose
- Add error handling and helpful console output
