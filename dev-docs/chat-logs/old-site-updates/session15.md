# Session 15: Web Directory Cleanup & Archive

**Branch:** feature/single-app-migration
**Prerequisites:** Session 14 complete (deployment docs created)
**Estimated Time:** 1-2 hours
**Status:** ✅ COMPLETED (2025-10-01)

---

# User reminder: Please make sure that the tasks that you do, files you move or create don't already exist. If this is the case, just update the existing files or folders to take into account what you're doing. - Be diligent to make sure no redundancies are created and that things are done properly.

## 🎯 Primary Goals

1. **Move attached assets** to proper locations (3.1MB)
2. **Migrate useful scripts** to main app
3. **Delete legacy files** that are no longer needed
4. **Archive remaining content** for reference
5. **Update documentation** to reflect new structure

---

## 📋 Session Prerequisites Check

- [x] Session 14 is complete (deployment docs created)
- [x] Web migration 100% complete (31/31 pages)
- [x] All pages tested and working
- [ ] Branch checked out: `feature/single-app-migration`
- [ ] Dev server tested (no errors)
- [ ] Previous changes committed (by user)

---

## 🚀 SESSION 15 START PROMPT

```
I want to clean up the /web directory and move assets to their proper locations.

Please read the following files in order:
1. /Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md - Project rules
2. /Users/grant/Documents/GitHub/Strive-SaaS/app/MIGRATION_SESSIONS.md - Migration progress
3. /Users/grant/Documents/GitHub/Strive-SaaS/chat-logs/old-site-updates/session14_summary.md - Previous session
4. /Users/grant/Documents/GitHub/Strive-SaaS/chat-logs/old-site-updates/session15.md - This file

The web migration is complete, but the old /web directory still contains:
- attached_assets/ (3.1MB) - images, PDFs, email templates
- scripts/ (44KB) - 4 utility scripts
- Legacy files (client/, api/, config files) that need deletion

Follow the detailed plan in session15.md to organize and clean up the directory structure.
```

---

## Part 1: Analyze Current State (10 min)

### Step 1.1: Inventory web/ Directory

**Check what's in each subdirectory:**
```bash
# Full inventory
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/

# Check each subdirectory
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/attached_assets/
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/scripts/
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/client/
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/api/
ls -lah /Users/grant/Documents/GitHub/Strive-SaaS/app/web/email-previews/
```

**Document findings:**
- What files are actually being used?
- What can be safely deleted?
- What needs to be moved?

---

## Part 2: Move Attached Assets (30 min)

### Step 2.1: Create Target Directories

```bash
# Create organized asset structure in /public
mkdir -p /Users/grant/Documents/GitHub/Strive-SaaS/app/public/assets/logos
mkdir -p /Users/grant/Documents/GitHub/Strive-SaaS/app/public/assets/headshots
mkdir -p /Users/grant/Documents/GitHub/Strive-SaaS/app/public/assets/favicons
mkdir -p /Users/grant/Documents/GitHub/Strive-SaaS/app/public/assets/email-templates
```

### Step 2.2: Move Images & Assets

**Logos:**
```bash
# Move from web/attached_assets/ to public/assets/logos/
mv web/attached_assets/ST-Transparent.png public/assets/logos/
mv web/attached_assets/strive_logo.webp public/assets/logos/
mv web/attached_assets/triangle_logo_final.webp public/assets/logos/
mv web/attached_assets/STRIVE_Orange_Text_Transparent_1483\ x\ 320px.webp public/assets/logos/
```

**Headshots:**
```bash
# Move team member photos
mv web/attached_assets/headshots/* public/assets/headshots/
```

**Favicons:**
```bash
# Move favicon files
mv web/attached_assets/favicon_io/* public/assets/favicons/
```

**Email Templates:**
```bash
# Move email-related files
mv web/attached_assets/email-templates/* public/assets/email-templates/
```

**PDF Generator Files:**
```bash
# Move to lib/ directory (these are code files)
mv web/attached_assets/professional-brochure.tsx lib/pdf/professional-brochure.tsx
mv web/attached_assets/pdf-generator.ts lib/pdf/pdf-generator-legacy.ts
```

### Step 2.3: Verify Moves

```bash
# Check new structure
ls -lah public/assets/logos/
ls -lah public/assets/headshots/
ls -lah public/assets/favicons/
ls -lah public/assets/email-templates/
ls -lah lib/pdf/
```

---

## Part 3: Migrate Useful Scripts (20 min)

### Step 3.1: Create Scripts Directory

```bash
# Create main scripts directory if doesn't exist
mkdir -p /Users/grant/Documents/GitHub/Strive-SaaS/app/scripts
```

### Step 3.2: Move & Review Scripts

**Script 1: directory-mapper.ts**
```bash
# Move to main scripts
mv web/scripts/directory-mapper.ts scripts/directory-mapper.ts
```
- **Purpose:** Maps project directory structure
- **Keep:** Yes, useful for documentation

**Script 2: validate-seo.ts**
```bash
mv web/scripts/validate-seo.ts scripts/validate-seo.ts
```
- **Purpose:** Validates SEO meta tags
- **Keep:** Yes, useful for testing

**Script 3: generate-email-previews.ts**
```bash
mv web/scripts/generate-email-previews.ts scripts/generate-email-previews.ts
```
- **Purpose:** Generates email template previews
- **Keep:** Yes, useful for email development

**Script 4: image-optimization.ts**
```bash
mv web/scripts/image-optimization.ts scripts/image-optimization.ts
```
- **Purpose:** Optimizes images
- **Keep:** Yes, useful for asset optimization

### Step 3.3: Update Script Imports

**Check each script for paths that need updating:**
```bash
# Read and identify import issues
grep -r "import.*from.*'\.\./'" scripts/

# Update as needed (example):
# Before: import { ... } from '../lib/...'
# After: import { ... } from '@/lib/...'
```

---

## Part 4: Delete Legacy Files (15 min)

### Step 4.1: Delete Old Client Directory

```bash
# Contains only index.html and old public assets
rm -rf web/client/
```

**Verification:**
- Check no other files reference web/client/

### Step 4.2: Delete Old API Routes

```bash
# Old Vite serverless functions (replaced by Next.js API routes)
rm -rf web/api/
```

**Verification:**
- Check contact.ts, newsletter.ts, request.ts logic exists in Next.js API routes

### Step 4.3: Delete Generated Email Previews

```bash
# Can be regenerated with generate-email-previews.ts
rm -rf web/email-previews/
```

### Step 4.4: Delete Old Supabase Config

```bash
# Old config already in main app
rm -rf web/supabase/
```

### Step 4.5: Delete Duplicate Config Files

```bash
# Root web/ config files (duplicates of main app)
cd web/
rm -f package.json
rm -f tailwind.config.ts
rm -f tsconfig.json
rm -f components.json
rm -f postcss.config.js
rm -f .env.example
rm -f .gitignore
rm -f .npmrc
rm -f README.md
```

### Step 4.6: Delete Old Public Directory

```bash
# Already copied sitemap.xml and robots.txt to main public/
rm -rf web/public/
```

---

## Part 5: Archive Remaining Content (10 min)

### Step 5.1: Check What's Left

```bash
ls -la web/
```

**Expected remaining:**
- `attached_assets/` - Should be empty or have a few leftover files
- `brochure-standalone.html` - Standalone brochure file
- Any other miscellaneous files

### Step 5.2: Create Archive Directory (Optional)

```bash
# If there are files worth keeping for reference
mkdir -p archive/web-legacy/
mv web/attached_assets/brochure-standalone.html archive/web-legacy/
mv web/attached_assets/BROCHURE_README.md archive/web-legacy/
mv web/attached_assets/email-info.md archive/web-legacy/
```

### Step 5.3: Final Cleanup

```bash
# Remove now-empty directories
rmdir web/attached_assets/email-templates/ 2>/dev/null || true
rmdir web/attached_assets/headshots/ 2>/dev/null || true
rmdir web/attached_assets/favicon_io/ 2>/dev/null || true
rmdir web/attached_assets/ 2>/dev/null || true
rmdir web/scripts/ 2>/dev/null || true
```

---

## Part 6: Update Documentation (15 min)

### Step 6.1: Update MIGRATION_SESSIONS.md

Add Session 15 completion:
```markdown
### Session 15: Web Directory Cleanup ✅ (2025-09-30)
- Moved attached_assets to /public/assets/ (3.1MB)
- Migrated 4 utility scripts to /scripts/
- Deleted legacy files: client/, api/, email-previews/, supabase/
- Deleted duplicate config files
- Cleaned up web/ directory structure
- Status: Directory cleanup complete
```

### Step 6.2: Update Asset References (if needed)

**Check for hardcoded paths:**
```bash
# Search for old asset paths
grep -r "web/attached_assets" app/
grep -r "attached_assets" app/

# Update to new paths:
# Before: /web/attached_assets/strive_logo.webp
# After: /assets/logos/strive_logo.webp
```

### Step 6.3: Update README (if exists)

Document new asset locations:
```markdown
## Asset Organization

- **Logos:** `/public/assets/logos/`
- **Headshots:** `/public/assets/headshots/`
- **Favicons:** `/public/assets/favicons/`
- **Email Templates:** `/public/assets/email-templates/`
- **Scripts:** `/scripts/`
```

---

## ✅ Success Criteria

**Directory Structure:**
- [ ] `web/attached_assets/` deleted or empty
- [ ] `web/client/` deleted
- [ ] `web/api/` deleted
- [ ] `web/email-previews/` deleted
- [ ] `web/supabase/` deleted
- [ ] `web/public/` deleted
- [ ] `web/scripts/` deleted or empty
- [ ] All root config files in `web/` deleted

**New Locations:**
- [ ] Assets moved to `/public/assets/*`
- [ ] Scripts moved to `/scripts/`
- [ ] PDF generators moved to `/lib/pdf/`

**Testing:**
- [ ] Dev server starts without errors
- [ ] No broken asset references
- [ ] All images load correctly
- [ ] Scripts run without import errors

**Documentation:**
- [ ] MIGRATION_SESSIONS.md updated
- [ ] session15_summary.md created
- [ ] Asset paths documented

---

## 📊 Expected File Structure After Session

```
app/
├── public/
│   ├── assets/
│   │   ├── logos/
│   │   │   ├── ST-Transparent.png
│   │   │   ├── strive_logo.webp
│   │   │   ├── triangle_logo_final.webp
│   │   │   └── STRIVE_Orange_Text_Transparent_1483 x 320px.webp
│   │   ├── headshots/
│   │   │   ├── Garrett-Headshot.webp
│   │   │   ├── Jeff-Headshot.webp
│   │   │   └── Grant-Headshot.webp
│   │   ├── favicons/
│   │   │   └── [favicon files]
│   │   └── email-templates/
│   │       └── [email template files]
│   ├── sitemap.xml
│   └── robots.txt
├── scripts/
│   ├── directory-mapper.ts
│   ├── validate-seo.ts
│   ├── generate-email-previews.ts
│   └── image-optimization.ts
├── lib/
│   └── pdf/
│       ├── professional-brochure.tsx
│       └── pdf-generator-legacy.ts
└── web/
    └── [potentially empty or archived]
```

---

## ⚠️ Important Notes

### Asset Path Migration:
- **OLD:** `/web/attached_assets/strive_logo.webp`
- **NEW:** `/assets/logos/strive_logo.webp`
- Update any hardcoded references in components

### Script Imports:
- Scripts moved from `web/scripts/` to `scripts/`
- Update any relative imports to use `@/` alias
- Test scripts after moving

### Backup Before Deleting:
- Consider creating a backup/archive before deleting
- Keep brochure files and READMEs in archive/
- Can always restore from git if needed

---

## 🐛 Potential Issues & Solutions

### Issue 1: Broken Image References
**Symptom:** Images don't load after moving
**Cause:** Hardcoded paths in components
**Solution:**
```bash
# Find all image references
grep -r "attached_assets" app/
grep -r "web/" app/ | grep -E '\.(png|webp|jpg|svg)'

# Update paths in components
```

### Issue 2: Script Import Errors
**Symptom:** Scripts fail with "module not found"
**Cause:** Relative imports broken after moving
**Solution:**
```typescript
// Update imports
// Before: import { ... } from '../lib/...'
// After: import { ... } from '@/lib/...'
```

### Issue 3: PDF Generator Issues
**Symptom:** PDF generation fails
**Cause:** PDF generator files moved to new location
**Solution:**
- Update imports in components that use PDF generation
- Test PDF generation functionality

### Issue 4: Email Template Issues
**Symptom:** Emails don't render correctly
**Cause:** Email template paths changed
**Solution:**
- Update email service to point to new template locations
- Test email generation

---

## 🎯 Time Breakdown

| Task | Estimated Time |
|------|---------------|
| Part 1: Analyze current state | 10 min |
| Part 2: Move attached assets | 30 min |
| Part 3: Migrate scripts | 20 min |
| Part 4: Delete legacy files | 15 min |
| Part 5: Archive remaining | 10 min |
| Part 6: Update documentation | 15 min |
| **Total** | **1.5 hours** |

---

## 📝 Post-Session Checklist

- [ ] All assets moved to `/public/assets/`
- [ ] All scripts moved to `/scripts/`
- [ ] Legacy directories deleted
- [ ] No broken references (test in dev server)
- [ ] Documentation updated
- [ ] session15_summary.md created
- [ ] session16.md created (next steps)
- [ ] Git changes ready for commit (by user)

---

**Status:** 📝 Ready to start when user commits Session 14 changes
