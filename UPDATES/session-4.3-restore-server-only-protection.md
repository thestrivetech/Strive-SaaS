# Session 4.3: Restore Server-Only Protection

**Phase:** 4 - Quality & Optimization
**Priority:** 🟡 MEDIUM (security)
**Estimated Time:** 1-2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Investigate and restore `server-only` import protection to sensitive files.

**Issue:**
`server-only` imports were removed during build fixes.
Need to identify which files legitimately need server-only protection.

---

## 📋 TASK (CONDENSED)

**Files That Need `server-only`:**
1. Server Actions with database access
2. Files with API keys or environment secrets
3. Authentication utilities (session management)
4. Payment processing (Stripe operations)
5. Email sending utilities
6. Any file with SUPABASE_SERVICE_ROLE_KEY usage

**Pattern:**
```typescript
// At top of file:
import 'server-only';

// Rest of file with server-side code
import { prisma } from '@/lib/database/prisma';
export async function sensitiveOperation() {
  // Server-only code
}
```

**Investigation:**
```bash
# Find files that import prisma (likely server-only)
grep -r "from '@/lib/database/prisma'" (platform)/lib/ --include="*.ts"

# Find files with env variables
grep -r "process.env.SUPABASE_SERVICE_ROLE_KEY" (platform)/lib/

# Find server actions
grep -r "'use server'" (platform)/lib/
```

**Restoration Process:**
1. Identify all server-only candidates
2. Add `import 'server-only'` to each
3. Test build doesn't fail
4. Verify client can't import these files
5. Document why each file needs protection

**Verification:**
```bash
npm run build
# Should succeed

# Try importing server-only file in client component
# Should fail with clear error
```

**DO NOT report success unless:**
- All sensitive files protected
- Build succeeds
- No false positives (files that don't need it)
- Documentation updated

---

**Next:** Session 4.4 - Update Database Docs
