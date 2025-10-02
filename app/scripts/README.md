# Utility Scripts

This directory contains utility scripts for development, maintenance, and optimization tasks.

## Scripts Overview

### 📧 Email Preview Generation
**File:** `generate-email-previews.ts`
**Status:** ⚠️ **DISABLED** (Deferred to future session)
**Reason:** Requires refactoring for Next.js - old Express email system was removed

**What it does:**
- Generates static HTML previews for 8 email template types
- Creates visual testing pages for email design review
- Mock data preserved for future implementation

**Refactoring Options:**
1. React Email (@react-email/components) - Modern, Next.js-friendly (60-90 min)
2. Minimal HTML templates - Quick but less maintainable (30-45 min)
3. Nodemailer with handlebars - Traditional approach (45-60 min)

**TODO (Future Session):**
- Choose email template solution
- Create email templates in `/lib/email/templates/`
- Update script to use new system
- Test HTML generation

**Related Documentation:** Session 16 summary

---

### 🔍 SEO Validation
**File:** `validate-seo.ts`
**Status:** ✅ **Working**
**Last Verified:** Session 16 (2025-10-01)

**Usage:**
```bash
npx tsx scripts/validate-seo.ts
```

**What it does:**
- Validates SEO configuration for all pages
- Checks title length (30-60 chars)
- Checks description length (120-160 chars)
- Validates keyword count (5-15 keywords)
- Verifies robots.txt and sitemap.xml existence
- Generates comprehensive SEO health report

**Output:**
- Console report with scores and issues
- Overall SEO health score (0-100)

**Page SEO Score:** 100/100 (all pages passing)

---

### 🖼️ Image Optimization
**File:** `image-optimization.ts`
**Status:** ✅ **Working** (Paths updated in Session 16)
**Last Updated:** Session 16 (2025-10-01)

**Usage:**
```bash
npx tsx scripts/image-optimization.ts
```

**What it does:**
- Converts images to modern formats (AVIF, WebP, JPEG)
- Generates responsive variants for different viewport sizes
- Creates blur placeholders for progressive loading
- Generates TypeScript manifest for image imports

**Input Directory:** `public/assets/`
**Output Directory:** `public/assets/optimized/`

**Features:**
- Multiple format support (AVIF, WebP, JPEG, PNG)
- Responsive breakpoints (320w, 640w, 1024w, 1920w)
- Automatic quality optimization per format
- Image manifest generation (JSON + TypeScript)
- Helper functions for srcset generation

**Dependencies:**
- sharp - Image processing
- imagemin-* - Format-specific optimization

**Path Updates (Session 16):**
- ✅ Fixed `attached_assets` → `public/assets`
- ✅ Fixed output path for Next.js structure

---

### 📁 Directory Mapper
**File:** `directory-mapper.ts`
**Status:** ✅ **Working**
**Last Verified:** Session 16 (2025-10-01)

**Usage:**
```bash
npx tsx scripts/directory-mapper.ts
```

**What it does:**
- Maps entire project directory structure
- Generates visual tree representation
- Provides project statistics
- Identifies largest files
- Counts file types

**Output Files:**
- `project-directory-map.txt` - Human-readable tree
- `project-directory-map.json` - Machine-readable structure

**Ignores:**
- node_modules
- .git
- .next
- dist/build
- log files
- lock files

**Current Stats (Session 16):**
- 431 files
- 149 directories
- Generated in ~17ms

---

## Common Tasks

### Run All Verification Scripts
```bash
# SEO validation
npx tsx scripts/validate-seo.ts

# Directory mapping
npx tsx scripts/directory-mapper.ts

# Image optimization (requires sharp)
npx tsx scripts/image-optimization.ts
```

### Install Script Dependencies
```bash
# SEO validation
npm install jsdom @types/jsdom --save-dev

# Image optimization
npm install sharp imagemin imagemin-avif imagemin-webp imagemin-mozjpeg --save-dev
```

---

## Migration Notes (Session 16)

**Files Moved from `/web`:**
- ✅ `validate-seo.ts` - Working, imports fixed
- ✅ `image-optimization.ts` - Working, paths updated
- ✅ `directory-mapper.ts` - Working, no changes needed
- ⚠️ `generate-email-previews.ts` - Deferred, needs refactoring

**Path Updates:**
- Old: `attached_assets` → New: `public/assets`
- Old: `client/src/assets/optimized` → New: `public/assets/optimized`
- Old: `../server/services/email` → New: TBD (not yet created)

---

## Development

### Adding New Scripts

1. Create script in `/scripts` directory
2. Add shebang: `#!/usr/bin/env tsx`
3. Use TypeScript for type safety
4. Add to this README with status
5. Test with `npx tsx scripts/[script-name].ts`

### Script Standards

- ✅ Use TypeScript
- ✅ Include error handling
- ✅ Provide console feedback
- ✅ Generate output files when appropriate
- ✅ Document dependencies
- ✅ Use proper path resolution (avoid hardcoded paths)

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Install tsx if not present
npm install -g tsx

# Or use npx
npx tsx scripts/[script-name].ts
```

### Path resolution errors
- Ensure you're running from project root (`/app`)
- Check paths in scripts point to correct Next.js structure
- Verify old `/web` references are updated

### Missing dependencies
```bash
# Check what's needed for each script
npm list [package-name]

# Install if missing
npm install [package-name] --save-dev
```

---

**Last Updated:** Session 16 (2025-10-01)
**Next Steps:** Refactor email preview script when email system is being actively developed
