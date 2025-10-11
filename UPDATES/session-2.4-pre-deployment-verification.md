# Session 2.4: Pre-Deployment Verification

**Phase:** 2 - MVP Deployment
**Priority:** 🔴 CRITICAL
**Estimated Time:** 1-2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Perform comprehensive pre-deployment checks to ensure MVP is ready for production deployment to Vercel.

**Scope:**
- ✅ Build verification
- ✅ Authentication testing
- ✅ CRM module end-to-end
- ✅ Transactions module end-to-end
- ✅ Performance audit
- ✅ Security checklist
- ✅ Environment variables

**This is the FINAL gate before deploying to production.**

---

## 📋 TASK FOR AGENT

```markdown
COMPLETE PRE-DEPLOYMENT VERIFICATION for MVP (platform) deployment

**Context:**
This is the final quality gate before deploying to Vercel.
Every check MUST pass before deployment can proceed.

**Requirements:**

## 1. BUILD VERIFICATION

```bash
cd (platform)

# Clean build (no cache)
rm -rf .next
npm run build

# Verify output:
# ✅ Build completed successfully
# ✅ Zero errors
# ✅ Zero warnings (or acceptable warnings noted)
# ✅ Bundle size reasonable (<500kb initial load)
```

**Expected Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB         XXX kB
├ ○ /real-estate/crm/contacts           XXX kB         XXX kB
├ ○ /real-estate/workspace              XXX kB         XXX kB
└ ○ ...
```

**Blockers:**
- Build fails → Go back to Session 1.1
- TypeScript errors → Go back to Session 1.2
- Bundle size >1MB → Investigate code splitting

---

## 2. TYPESCRIPT & LINTING

```bash
cd (platform)

# TypeScript check
npx tsc --noEmit
# Expected: No errors found

# ESLint check
npm run lint
# Expected: ✓ No ESLint errors (warnings OK for now)
```

**Blockers:**
- TypeScript errors → Fix immediately
- ESLint errors → Go back to Session 1.2

---

## 3. TEST SUITE

```bash
cd (platform)

# Run all tests
npm test

# CRM module coverage
npm test -- --coverage --collectCoverageFrom='lib/modules/crm/**/*.{ts,tsx}'

# Transactions module coverage
npm test -- --coverage --collectCoverageFrom='lib/modules/transactions/**/*.{ts,tsx}'
```

**Expected:**
- ✅ All tests passing
- ✅ CRM coverage ≥80%
- ✅ Transactions coverage ≥80%

**Blockers:**
- Tests failing → Go back to Session 2.3
- Coverage <80% → Add missing tests

---

## 4. AUTHENTICATION FLOW (Manual Testing)

```bash
npm run dev
# Server running on http://localhost:3000
```

**Test Scenarios:**

**Scenario 1: New User Signup**
1. Visit http://localhost:3000/signup
2. Fill form: email, password, full name
3. Submit signup
4. ✅ User created in Supabase
5. ✅ User synced to Prisma
6. ✅ Redirect to /onboarding/organization

**Scenario 2: Organization Onboarding**
1. Fill organization form
2. Select industry (Real Estate)
3. Select tier (STARTER)
4. Submit
5. ✅ Organization created
6. ✅ User linked as OWNER
7. ✅ Redirect to /real-estate/dashboard

**Scenario 3: Login**
1. Visit http://localhost:3000/login
2. Enter credentials from Scenario 1
3. Submit
4. ✅ Session established
5. ✅ Redirect to dashboard

**Scenario 4: Protected Routes**
1. Logout
2. Try accessing /real-estate/crm/contacts directly
3. ✅ Redirect to /login
4. Login again
5. ✅ Access granted to protected route

**Scenario 5: Session Persistence**
1. Login
2. Refresh page
3. ✅ Session maintained (no logout)
4. Close browser
5. Open browser, visit site
6. ✅ Session restored (or re-login required)

**Scenario 6: Logout**
1. Click logout button
2. ✅ Session cleared
3. ✅ Redirect to /login
4. Try accessing protected route
5. ✅ Redirect to /login

**Blockers:**
- Any scenario fails → Go back to Session 2.1

---

## 5. CRM MODULE END-TO-END

**Scenario 1: Contacts**
1. Login as test user
2. Navigate to /real-estate/crm/contacts
3. ✅ Page loads without errors
4. Create new contact
5. ✅ Contact created and appears in list
6. Edit contact
7. ✅ Changes saved
8. Delete contact
9. ✅ Contact removed from list

**Scenario 2: Leads**
1. Navigate to /real-estate/crm/leads
2. Create new lead
3. ✅ Lead created
4. Convert lead to customer
5. ✅ Customer created, lead archived

**Scenario 3: Customers**
1. Navigate to /real-estate/crm/customers
2. View customer details
3. ✅ Data displays correctly
4. Update customer info
5. ✅ Changes saved

**Scenario 4: Deals**
1. Navigate to /real-estate/crm/deals
2. Create new deal
3. ✅ Deal created
4. Move deal through pipeline stages
5. ✅ Stage changes reflect in UI

**Blockers:**
- Any CRUD operation fails → Check database schema
- Multi-tenancy broken → Check organizationId filtering
- RBAC issues → Check permission middleware

---

## 6. TRANSACTIONS/WORKSPACE MODULE END-TO-END

**Scenario 1: Tasks**
1. Navigate to /real-estate/workspace
2. Create new task
3. ✅ Task created
4. Assign task to user
5. ✅ Assignment saved
6. Complete task
7. ✅ Status updated

**Scenario 2: Milestones**
1. View transaction milestones
2. ✅ Milestones display correctly
3. Update milestone status
4. ✅ Status saved
5. Check milestone notifications
6. ✅ Notifications sent (if implemented)

**Scenario 3: Listings**
1. Navigate to listings
2. Create new listing
3. ✅ Listing created
4. Upload listing photos (if implemented)
5. ✅ Photos saved
6. Update listing details
7. ✅ Changes saved

**Blockers:**
- Any feature fails → Check module implementation
- File uploads fail → Check Supabase storage configuration

---

## 7. DISABLED MODULES VERIFICATION

**Test:**
1. Check navigation
2. ✅ No links to Marketplace, REID, Expense-Tax, Campaigns
3. Try direct URL: http://localhost:3000/real-estate/marketplace
4. ✅ Redirect to dashboard (not 404, not crash)
5. Try all disabled module URLs
6. ✅ All redirect gracefully

**Blockers:**
- Disabled modules still visible → Go back to Session 2.2
- Direct access causes errors → Add route protection

---

## 8. MOBILE RESPONSIVENESS

**Test on:**
- Mobile (375px width)
- Tablet (768px width)
- Desktop (1024px+ width)

**Key Pages:**
- Dashboard
- CRM contacts list
- CRM contact detail
- Workspace tasks
- Login/signup forms

**Checks:**
- ✅ No horizontal scroll
- ✅ Navigation usable on mobile
- ✅ Forms readable and functional
- ✅ Tables/lists responsive (stack or scroll)

**Blockers:**
- Major layout breaks → Fix responsive styles

---

## 9. PERFORMANCE AUDIT

```bash
# Build for production
npm run build

# Start production server
npm start

# Use browser DevTools:
# 1. Lighthouse audit (Desktop + Mobile)
# 2. Network tab (check bundle sizes)
# 3. Performance tab (check load times)
```

**Targets:**
- Performance score: ≥80
- Accessibility score: ≥90
- Best Practices score: ≥90
- SEO score: ≥80
- First Contentful Paint: <2s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s

**Acceptable Deviations:**
- Performance 70-79: Note issues, don't block
- Below 70: Investigate and fix

**Blockers:**
- Critical performance issues (score <60)
- Accessibility violations preventing use

---

## 10. SECURITY CHECKLIST

**Code Review:**
- [ ] No SUPABASE_SERVICE_ROLE_KEY in client code
- [ ] No STRIPE_SECRET_KEY in client code
- [ ] No hardcoded passwords or API keys
- [ ] All Server Actions have auth checks
- [ ] All database queries filter by organizationId
- [ ] Input validation with Zod on all forms
- [ ] No SQL injection vulnerabilities (use Prisma ORM)
- [ ] No XSS vulnerabilities (no dangerouslySetInnerHTML with user content)
- [ ] CSRF protection enabled (Next.js default)
- [ ] File upload validation (if implemented)

**Environment Variables:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify required variables:
grep -E "DATABASE_URL|SUPABASE|NEXTAUTH" .env.local

# ✅ All required variables present
# ✅ No secrets committed to git
# ✅ .env.local in .gitignore
```

**Blockers:**
- Any secret exposed → Remove immediately, rotate keys
- Missing environment variables → Document in deployment guide

---

## 11. DATABASE VERIFICATION

```bash
# Check RLS policies active
npx prisma studio

# Verify:
# 1. Organizations table has data
# 2. Users linked to organizations
# 3. CRM data exists (contacts, leads, customers)
# 4. Transactions data exists (tasks, milestones)
```

**RLS Check:**
```bash
# Run SQL to verify RLS enabled
npx prisma db execute --stdin <<EOF
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
EOF

# Expected: All multi-tenant tables show rowsecurity = true
```

**Blockers:**
- RLS not enabled → Critical security issue, fix before deploy
- Schema mismatch → Run migrations

---

## 12. VERCEL DEPLOYMENT READINESS

**Environment Variables for Vercel:**
Prepare list of required variables:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DOCUMENT_ENCRYPTION_KEY=hex_string_64_chars
NEXTAUTH_SECRET=random_secret
NEXTAUTH_URL=https://yourdomain.com
```

**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`
**Node Version:** 18.x or 20.x

**Blockers:**
- Missing required environment variables → Document them
- Build command fails → Fix build errors

---

## VERIFICATION (REQUIRED)

```bash
cd (platform)

# 1. Clean build
rm -rf .next && npm run build

# 2. TypeScript
npx tsc --noEmit

# 3. Linting
npm run lint

# 4. Tests
npm test

# 5. Production server test
npm start
# Visit http://localhost:3000 and test all scenarios
```

**DO NOT report success unless:**
- ✅ Build succeeds with zero errors
- ✅ All TypeScript checks pass
- ✅ All ESLint checks pass
- ✅ All tests passing (80%+ coverage)
- ✅ All authentication scenarios pass
- ✅ All CRM scenarios pass
- ✅ All Transactions scenarios pass
- ✅ All disabled modules hidden/protected
- ✅ Mobile responsiveness acceptable
- ✅ Performance targets met (or noted)
- ✅ Security checklist complete
- ✅ Database verified
- ✅ Environment variables documented

**Return Format:**
## ✅ EXECUTION REPORT

### BUILD VERIFICATION
```
npm run build output:
[paste actual output showing success]

Bundle Size Analysis:
- Initial Load JS: XXX kB
- Total Page Count: XX
- Largest Route: XXX kB
```

### CODE QUALITY
```
npx tsc --noEmit: ✅ PASS
npm run lint: ✅ PASS (X warnings acceptable)
npm test: ✅ PASS (XXX/XXX tests)
```

### MANUAL TESTING RESULTS

**Authentication: ✅ PASS**
- Signup: ✅
- Onboarding: ✅
- Login: ✅
- Protected Routes: ✅
- Session Persistence: ✅
- Logout: ✅

**CRM Module: ✅ PASS**
- Contacts CRUD: ✅
- Leads CRUD: ✅
- Customers CRUD: ✅
- Deals Pipeline: ✅

**Transactions Module: ✅ PASS**
- Tasks CRUD: ✅
- Milestones: ✅
- Listings: ✅

**Disabled Modules: ✅ PASS**
- Navigation hidden: ✅
- Direct access blocked: ✅

### PERFORMANCE AUDIT
```
Lighthouse Scores (Desktop):
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

Core Web Vitals:
- FCP: X.XXs
- LCP: X.XXs
- TTI: X.XXs
```

### SECURITY CHECKLIST
```
✅ No secrets in client code
✅ All Server Actions protected
✅ Multi-tenancy filtering active
✅ Input validation present
✅ RLS policies enabled
✅ Environment variables documented
```

### DEPLOYMENT READINESS

**Required Environment Variables:**
```
[List all variables needed for Vercel]
```

**Vercel Configuration:**
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
- Node Version: 18.x

**Issues Found:** NONE / [list any remaining issues]

**RECOMMENDATION:** ✅ READY FOR DEPLOYMENT / ❌ NEEDS FIXES
```

---

## 🚨 BLOCKING ISSUES

**If ANY of these fail, DO NOT deploy:**
- Build failures
- TypeScript errors
- Critical security issues (exposed secrets, no RLS, no auth checks)
- Authentication not working
- CRM module broken
- Transactions module broken
- Performance score <60
- Accessibility violations

**Can deploy with:**
- ESLint warnings (Phase 4 will fix)
- Performance score 70-79 (document for improvement)
- Minor UI issues (document for later fix)

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- All verification commands pass
- All manual test scenarios pass
- Performance acceptable
- Security checklist complete
- Environment variables documented
- Agent provides COMPLETE verification report
- Clear deployment recommendation (READY vs NEEDS FIXES)

---

**Created:** 2025-10-10
**Dependencies:** All Phase 2 sessions complete
**Next Phase:** Deploy to Vercel OR Phase 3 (Full Feature Set)
