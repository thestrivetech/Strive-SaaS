# Utility Scripts

This directory contains utility scripts for development, maintenance, deployment, and optimization tasks.

**Note:** Test files have been moved to `__tests__/` for better organization. See [Test Files](#test-files) section below.

## Scripts Overview

### Deployment & CI/CD

**Files:**
- `deploy-production.sh` - Production deployment automation
- `migrate-production.sh` - Database migration automation for production
- `pre-deploy-check.sh` - Pre-deployment validation checks
- `rollback.sh` - Rollback automation for failed deployments
- `run-tests.sh` - Test runner wrapper script
- `test-ci.sh` - CI/CD integration script

**Usage:**
```bash
# Pre-deployment check
./scripts/pre-deploy-check.sh

# Deploy to production
./scripts/deploy-production.sh

# Rollback if needed
./scripts/rollback.sh
```

---

### Database & Migrations

**Files:**
- `init-database.js` - Initialize database schema
- `migrate-roles-tiers.ts` - Data migration utility for roles and tiers
- `migration-config.example.json` - Example configuration for migrations
- `verify-database-config.ts` - Verify database configuration

**Usage:**
```bash
# Initialize database
node scripts/init-database.js

# Migrate roles and tiers
npx tsx scripts/migrate-roles-tiers.ts

# Verify database config
npx tsx scripts/verify-database-config.ts
```

---

### Security & Auditing

**Files:**
- `security-audit.ts` - Security scanning and audit utility

**Usage:**
```bash
npx tsx scripts/security-audit.ts
```

---

### Data Generation

**Files:**
- `generate-embeddings.ts` - Generate embeddings for AI/RAG system

**Usage:**
```bash
npx tsx scripts/generate-embeddings.ts
```

---

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

## Test Files

**Test files have been moved to `__tests__/` for better organization:**

- **Authentication Tests:** `__tests__/integration/auth/test-auth.js`
  - Comprehensive authentication flow testing
  - Database connection tests
  - Supabase auth integration tests

- **RLS Tests:** `__tests__/database/test-rls.ts`
  - Row Level Security policy testing
  - Multi-tenant isolation verification
  - Organization-based data filtering

- **Storage Tests:** `__tests__/storage/test-storage.ts`
  - File upload/download testing
  - Signed URL generation
  - Bucket RLS policy verification

- **Security Tests:** `__tests__/security/test-content-security-audit.ts`
  - Content security policy auditing
  - Security vulnerability scanning

- **Realtime Tests:** `__tests__/integration/realtime/test-realtime.ts`
  - Supabase realtime subscription testing
  - Live update verification for tasks, customers, projects

- **Notification Tests:** `__tests__/integration/notifications/test-notifications.ts`
  - Notification CRUD operations
  - Notification delivery testing

**Running Test Scripts:**
```bash
# Authentication tests
npx tsx __tests__/integration/auth/test-auth.js

# RLS policy tests
npx tsx __tests__/database/test-rls.ts

# Storage tests
npx tsx __tests__/storage/test-storage.ts

# Security audit
npx tsx __tests__/security/test-content-security-audit.ts

# Realtime subscription tests
npx tsx __tests__/integration/realtime/test-realtime.ts

# Notification tests
npx tsx __tests__/integration/notifications/test-notifications.ts
```

See `__tests__/README.md` for complete testing documentation.

---

## Common Tasks

### Run All Verification Scripts
```bash
# SEO validation
npx tsx scripts/validate-seo.ts

# Image optimization (requires sharp)
npx tsx scripts/image-optimization.ts

# Security audit
npx tsx scripts/security-audit.ts

# Database verification
npx tsx scripts/verify-database-config.ts
```

### Install Script Dependencies
```bash
# SEO validation
npm install jsdom @types/jsdom --save-dev

# Image optimization
npm install sharp imagemin imagemin-avif imagemin-webp imagemin-mozjpeg --save-dev
```

---

## Migration Notes

### Session 16 (2025-10-01)
**Files Moved from `/web`:**
- ✅ `validate-seo.ts` - Working, imports fixed
- ✅ `image-optimization.ts` - Working, paths updated
- ⚠️ `generate-email-previews.ts` - Deferred, needs refactoring

**Path Updates:**
- Old: `attached_assets` → New: `public/assets`
- Old: `client/src/assets/optimized` → New: `public/assets/optimized`
- Old: `../server/services/email` → New: TBD (not yet created)

### Session (2025-10-10)
**Test Files Moved to `__tests__/`:**
- `test-auth.js` → `__tests__/integration/auth/`
- `test-rls.ts` → `__tests__/database/`
- `test-storage.ts` → `__tests__/storage/`
- `test-content-security-audit.ts` → `__tests__/security/`
- `test-realtime.ts` → `__tests__/integration/realtime/`
- `test-notifications.ts` → `__tests__/integration/notifications/`

**Benefit:** Clear separation between production utility scripts and test files.

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

## Summary

**Production Scripts (18 files):**
- 6 deployment/CI scripts (.sh)
- 7 utility scripts (.ts/.js)
- 3 documentation files (.md, .json)
- 2 CI/CD integration scripts

**Test Scripts:** Moved to `__tests__/` (6 files relocated)

**Last Updated:** 2025-10-10
**Next Steps:** Refactor email preview script when email system is being actively developed
