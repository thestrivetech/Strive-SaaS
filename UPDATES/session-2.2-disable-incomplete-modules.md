# Session 2.2: Hide/Disable Incomplete Modules

**Phase:** 2 - MVP Deployment
**Priority:** 🟡 HIGH
**Estimated Time:** 1 hour
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Hide navigation links and disable routes for incomplete modules to prevent users from accessing broken pages.

**Modules to Disable:**
- ❌ Marketplace (no database schema)
- ❌ REID Analytics (no database schema)
- ❌ Expense-Tax (no database schema)
- ❌ CMS Campaigns (partial schema, broken)

**Modules to Keep:**
- ✅ CRM (complete with schema)
- ✅ Transactions/Workspace (complete with schema)
- ✅ AI Hub (basic skeleton)
- ✅ Dashboard

---

## 📋 TASK FOR AGENT

```markdown
HIDE INCOMPLETE MODULES from navigation and routes in (platform) project

**Context:**
MVP deployment includes only CRM and Transactions modules.
Four modules lack database schemas and will fail if accessed.
Hide these from users until Phase 3 implementation.

**Requirements:**

1. **Find Navigation Components:**
   ```bash
   cd (platform)

   # Find all navigation components
   grep -r "marketplace\|REID\|expense\|tax" app/ components/ --include="*.tsx" -i

   # Common locations:
   # - components/layouts/Sidebar.tsx
   # - components/layouts/Navigation.tsx
   # - app/real-estate/layout.tsx
   # - components/real-estate/RealEstateNav.tsx
   ```

2. **Update Navigation Links:**

   **Pattern to find:**
   ```tsx
   // Links to hide:
   <Link href="/real-estate/marketplace">Marketplace</Link>
   <Link href="/real-estate/rei-analytics">REID Analytics</Link>
   <Link href="/real-estate/expense-tax">Expense & Tax</Link>
   <Link href="/real-estate/cms-marketing/campaigns">Campaigns</Link>
   ```

   **Solution Options:**

   **Option A: Comment Out (Temporary)**
   ```tsx
   {/* PHASE 3: Marketplace module
   <Link href="/real-estate/marketplace">
     Marketplace
   </Link>
   */}
   ```

   **Option B: Conditional Rendering (Better)**
   ```tsx
   const ENABLED_MODULES = {
     crm: true,
     workspace: true,
     aiHub: true,
     marketplace: false,  // Phase 3
     reidAnalytics: false, // Phase 3
     expenseTax: false,    // Phase 3
     campaigns: false,     // Phase 3
   };

   {ENABLED_MODULES.marketplace && (
     <Link href="/real-estate/marketplace">Marketplace</Link>
   )}
   ```

   **Option C: Feature Flag (Best - Future-proof)**
   ```tsx
   // lib/config/features.ts
   export const FEATURE_FLAGS = {
     MARKETPLACE: false,
     REID_ANALYTICS: false,
     EXPENSE_TAX: false,
     CMS_CAMPAIGNS: false,
   };

   // In component:
   import { FEATURE_FLAGS } from '@/lib/config/features';

   {FEATURE_FLAGS.MARKETPLACE && (
     <Link href="/real-estate/marketplace">Marketplace</Link>
   )}
   ```

   **Choose Option C** for best maintainability.

3. **Add "Coming Soon" Badges (Optional):**
   ```tsx
   <div className="relative">
     <Link
       href="#"
       className="opacity-50 cursor-not-allowed"
       onClick={(e) => e.preventDefault()}
     >
       Marketplace
       <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
         Coming Soon
       </span>
     </Link>
   </div>
   ```

4. **Protect Routes with Middleware:**

   **Update: lib/middleware/auth.ts** (or create lib/middleware/features.ts)
   ```typescript
   import { FEATURE_FLAGS } from '@/lib/config/features';

   export function checkFeatureAccess(pathname: string) {
     if (pathname.includes('/marketplace') && !FEATURE_FLAGS.MARKETPLACE) {
       return '/real-estate/dashboard'; // Redirect to dashboard
     }
     if (pathname.includes('/rei-analytics') && !FEATURE_FLAGS.REID_ANALYTICS) {
       return '/real-estate/dashboard';
     }
     if (pathname.includes('/expense-tax') && !FEATURE_FLAGS.EXPENSE_TAX) {
       return '/real-estate/dashboard';
     }
     // Allow access
     return null;
   }
   ```

5. **Update Route Handlers:**

   **Add to: app/real-estate/marketplace/*/page.tsx** (if exists)
   ```tsx
   import { redirect } from 'next/navigation';
   import { FEATURE_FLAGS } from '@/lib/config/features';

   export default function MarketplacePage() {
     if (!FEATURE_FLAGS.MARKETPLACE) {
       redirect('/real-estate/dashboard');
     }
     // ... rest of component
   }
   ```

6. **Files to Update:**
   - `lib/config/features.ts` - Feature flags (CREATE)
   - `components/layouts/Sidebar.tsx` - Hide nav links
   - `components/layouts/Navigation.tsx` - Hide nav links (if exists)
   - `app/real-estate/layout.tsx` - Hide nav sections (if present)
   - `lib/middleware/auth.ts` - Add feature check (UPDATE)
   - Route pages - Add redirect checks (UPDATE existing pages)

7. **Verification (REQUIRED):**
   ```bash
   cd (platform)

   # TypeScript check
   npx tsc --noEmit

   # Linting
   npm run lint

   # Build
   npm run build

   # Manual testing
   npm run dev

   # Test scenarios:
   # 1. Check navigation - no links to disabled modules
   # 2. Try direct URL access to /real-estate/marketplace
   #    → Should redirect to dashboard
   # 3. Try all disabled module URLs
   #    → All should redirect or show 404
   # 4. Verify enabled modules still work:
   #    → /real-estate/crm
   #    → /real-estate/workspace
   #    → /real-estate/dashboard
   ```

**DO NOT report success unless:**
- All navigation components updated
- Feature flags system implemented
- Routes protected with redirects
- No broken links visible
- Manual testing confirms all disabled modules inaccessible
- All enabled modules still work
- All verification commands pass

**Return Format:**
## ✅ EXECUTION REPORT

**Feature Flags Created:**
```typescript
// lib/config/features.ts
export const FEATURE_FLAGS = {
  MARKETPLACE: false,
  REID_ANALYTICS: false,
  EXPENSE_TAX: false,
  CMS_CAMPAIGNS: false,
};
```

**Files Modified:**
- lib/config/features.ts - [lines] (CREATED)
- components/layouts/Sidebar.tsx - [lines]
- lib/middleware/auth.ts - [lines]
- [complete list]

**Navigation Changes:**
- Removed/hidden [count] links to disabled modules
- Added [count] "Coming Soon" badges (if applicable)
- Protected [count] routes with redirects

**Verification Results:**
```
[Paste ACTUAL command outputs]

npx tsc --noEmit:
[output]

npm run lint:
[output]

npm run build:
[output]

Manual Testing Results:
✅ Navigation shows only enabled modules
✅ Direct URL to /real-estate/marketplace → redirects to dashboard
✅ Direct URL to /real-estate/rei-analytics → redirects to dashboard
✅ Direct URL to /real-estate/expense-tax → redirects to dashboard
✅ CRM module still accessible
✅ Workspace module still accessible
✅ Dashboard still accessible
```

**Issues Found:** NONE / [list any remaining issues]
```

---

## 🔒 SECURITY REQUIREMENTS

**Access Control:**
- Don't rely solely on hiding links (users can type URLs)
- Implement server-side route protection
- Use middleware for redirects (not just client-side checks)

**No Breaking Changes:**
- Preserve all existing functionality for enabled modules
- Don't delete code, only disable/hide it

---

## 🧪 VERIFICATION CHECKLIST

Agent must provide proof of:
- [ ] TypeScript check passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual testing completed (7 test cases)
- [ ] Navigation clean (no disabled module links)
- [ ] Routes protected (redirect to dashboard)
- [ ] Enabled modules still functional

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Feature flags system implemented
- Navigation updated (no disabled module links)
- Routes protected with redirects
- Manual testing confirms protection works
- No functionality lost for enabled modules
- Agent provides complete verification outputs

---

## 🚨 COMMON PITFALLS

**Avoid:**
- ❌ Only hiding links (users can still access via URL)
- ❌ Deleting code instead of disabling
- ❌ Breaking existing modules while hiding others
- ❌ Not testing direct URL access
- ❌ Client-side only protection (easy to bypass)

**Best Practices:**
- ✅ Use feature flags for easy re-enabling in Phase 3
- ✅ Server-side route protection (middleware)
- ✅ Keep code intact for future use
- ✅ Test all access methods (nav, direct URL, bookmarks)
- ✅ Clear comments for why features are disabled

---

## 🚨 FAILURE RECOVERY

**If agent reports issues:**

**Issue: Can't find navigation components**
→ Search for "sidebar", "nav", "menu" in components/
→ Check app/real-estate/layout.tsx
→ Look for Link components with href patterns

**Issue: Middleware not redirecting**
→ Check middleware file location (root or lib/)
→ Verify middleware.ts config in next.config.js
→ Test with console.log to confirm execution

**Issue: Build breaks after changes**
→ Check TypeScript errors for unused imports
→ Verify feature flag exports
→ Test incremental changes

**Max attempts:** 2

---

**Created:** 2025-10-10
**Dependencies:** Phase 1 complete
**Next Session:** 2.3 - Fix Test Suite
