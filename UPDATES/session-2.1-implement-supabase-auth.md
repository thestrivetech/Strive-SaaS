# Session 2.1: Implement Supabase Authentication

**Phase:** 2 - MVP Deployment
**Priority:** 🔴 CRITICAL
**Estimated Time:** 4 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Implement complete Supabase authentication system to replace removed localhost bypass.

**Current State:**
- ❌ Localhost auth bypass removed (security fix)
- ❌ No real authentication implemented
- ❌ Users cannot access platform

**Target State:**
- ✅ Supabase Auth configured
- ✅ Signup/Login pages functional
- ✅ Session management working
- ✅ Protected routes enforced
- ✅ User creation synced to Prisma

---

## 📋 TASK FOR AGENT

```markdown
IMPLEMENT SUPABASE AUTHENTICATION in (platform) project

**Context:**
The platform previously had localhost authentication bypass (removed for security).
Now we need full Supabase Auth integration following the documented architecture.

**Reference Documentation:**
Read these files FIRST before implementing:
- (platform)/AUTH-ONBOARDING-GUIDE.md - Implementation guide
- (platform)/AUTH-ARCHITECTURE.md - Technical flow
- (platform)/lib/auth/auth-helpers.ts - Existing auth utilities
- (platform)/lib/middleware/auth.ts - Middleware patterns

**Architecture Pattern (from docs):**
```
Supabase Auth (passwords, sessions, tokens)
    ↓
getCurrentUser() checks Prisma
    ↓
User not in DB? → Lazy sync from Supabase
    ↓
No organization? → Redirect to /onboarding/organization
    ↓
Onboarding complete → Dashboard access
```

**Requirements:**

1. **Supabase Configuration:**
   - Verify environment variables in .env.local:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
   - Configure Supabase client in lib/auth/supabase.ts (if not exists)
   - Set up cookie-based session management

2. **Authentication Pages:**

   **Create/Update: app/(auth)/signup/page.tsx**
   - Email/password signup form
   - Input validation (Zod schema)
   - Error handling
   - Redirect to /onboarding after successful signup
   - "Already have account?" link to login

   **Create/Update: app/(auth)/login/page.tsx**
   - Email/password login form
   - Error handling
   - Redirect to dashboard after login
   - "Don't have account?" link to signup
   - "Forgot password?" link

   **Create/Update: app/(auth)/forgot-password/page.tsx**
   - Password reset request form
   - Email verification

3. **Session Management:**

   **Update: lib/auth/auth-helpers.ts**
   - `getCurrentUser()` function:
     - Check Supabase session
     - Lazy sync user to Prisma if missing
     - Return user with organization data

   - `requireAuth()` function:
     - Get current user
     - Redirect to /login if not authenticated
     - Return session data

   **Update: lib/middleware/auth.ts**
   - Protect all routes except /login, /signup, /forgot-password
   - Check Supabase session validity
   - Redirect unauthenticated users to /login

4. **User Synchronization (Lazy Sync):**

   **Create: lib/auth/sync-user.ts**
   ```typescript
   export async function syncUserFromSupabase(supabaseUser) {
     // Check if user exists in Prisma
     let user = await prisma.user.findUnique({
       where: { auth_id: supabaseUser.id }
     });

     // If not exists, create from Supabase data
     if (!user) {
       user = await prisma.user.create({
         data: {
           auth_id: supabaseUser.id,
           email: supabaseUser.email,
           full_name: supabaseUser.user_metadata.full_name,
           // ... other fields
         }
       });
     }

     return user;
   }
   ```

5. **Onboarding Flow:**

   **Create/Update: app/(auth)/onboarding/organization/page.tsx**
   - Organization creation form
   - Industry selection (Real Estate, Healthcare, Legal)
   - Subscription tier selection
   - Create organization + link user as OWNER

   **Update: lib/auth/auth-helpers.ts**
   - Check if user has organization
   - Redirect to /onboarding/organization if missing

6. **Logout Functionality:**

   **Create: app/api/auth/logout/route.ts**
   - Clear Supabase session
   - Clear cookies
   - Redirect to /login

7. **Security Requirements:**

   **Input Validation:**
   ```typescript
   const SignupSchema = z.object({
     email: z.string().email(),
     password: z.string().min(8).max(100),
     full_name: z.string().min(1).max(100),
   });
   ```

   **RBAC:**
   - Default new users to GlobalRole: USER
   - Default organization role: OWNER (for creator)
   - Default subscription tier: STARTER (or FREE for demo)

   **Multi-Tenancy:**
   - Ensure organization_id set for all new users
   - Filter all queries by organizationId

8. **Verification (REQUIRED):**
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
   # Test complete flow:
   # 1. Visit http://localhost:3000/signup
   # 2. Create new account
   # 3. Complete onboarding
   # 4. Access dashboard
   # 5. Logout
   # 6. Login again
   # 7. Verify session persists
   ```

**DO NOT report success unless:**
- Signup flow works end-to-end
- Login flow works end-to-end
- Logout works correctly
- Session persists across page refreshes
- Users synced to Prisma database
- Organization creation works
- Protected routes enforce authentication
- All verification commands pass
- Manual testing completed successfully

**Return Format:**
## ✅ EXECUTION REPORT

**Files Created/Modified:**
- app/(auth)/signup/page.tsx - [lines]
- app/(auth)/login/page.tsx - [lines]
- lib/auth/supabase.ts - [lines]
- lib/auth/sync-user.ts - [lines]
- [complete list]

**Authentication Flow:**
1. User signs up → Supabase creates auth user
2. Lazy sync → Prisma user created
3. Onboarding → Organization created
4. Login → Session established
5. Protected routes → Middleware enforces

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
✅ Signup works - User created in Supabase + Prisma
✅ Onboarding works - Organization created
✅ Login works - Session established
✅ Protected routes work - Redirects to login
✅ Logout works - Session cleared
✅ Session persistence works - Survives refresh
```

**Database Changes:**
- Users created: [count]
- Organizations created: [count]
- Test accounts: [list emails for cleanup]

**Issues Found:** NONE / [list any remaining issues]
```

---

## 🔒 SECURITY REQUIREMENTS

**Authentication:**
- Use httpOnly cookies for session tokens
- Never expose SUPABASE_SERVICE_ROLE_KEY to client
- Hash passwords (Supabase handles this)
- Implement rate limiting on auth endpoints

**Multi-Tenancy:**
- Every user must have organizationId
- Filter all queries by organizationId
- RLS policies must be active

**RBAC:**
- Assign default roles (GlobalRole: USER, OrgRole: OWNER for creator)
- Check roles before granting dashboard access
- No hardcoded permissions

**Input Validation:**
- Use Zod schemas for all forms
- Sanitize email inputs
- Enforce password requirements (min 8 chars)

---

## 🧪 VERIFICATION CHECKLIST

Agent must provide proof of:
- [ ] TypeScript check passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual testing completed (7 test cases)
- [ ] Signup creates user in both Supabase + Prisma
- [ ] Login establishes valid session
- [ ] Logout clears session
- [ ] Protected routes redirect unauthenticated users
- [ ] Session persists across page refreshes

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Complete authentication flow functional
- All manual tests pass
- No TypeScript/ESLint errors
- Documentation updated (if needed)
- Test accounts noted for cleanup
- Agent provides complete verification outputs

---

## 🚨 COMMON PITFALLS

**Avoid:**
- ❌ Exposing service role key to client
- ❌ Not syncing users to Prisma
- ❌ Missing organization creation in onboarding
- ❌ Hardcoding roles or permissions
- ❌ Not handling session expiration
- ❌ Missing CSRF protection

**Best Practices:**
- ✅ Use Supabase for auth, Prisma for app data
- ✅ Lazy sync users (don't pre-create)
- ✅ Always redirect after auth actions
- ✅ Clear error messages for users
- ✅ Log auth events for debugging

---

## 🚨 FAILURE RECOVERY

**If agent reports issues:**

**Issue: Supabase connection fails**
→ Check environment variables
→ Verify Supabase project is active
→ Test connection with supabase client

**Issue: Users not syncing to Prisma**
→ Check DATABASE_URL is correct
→ Verify Prisma schema has auth_id field
→ Test Prisma connection independently

**Issue: Session not persisting**
→ Check cookie configuration
→ Verify httpOnly flag set
→ Test in incognito mode (avoid cache)

**Max attempts:** 3 (auth is critical, may need manual debugging)

---

## 📚 REFERENCE FILES

**Must Read Before Starting:**
- `(platform)/AUTH-ONBOARDING-GUIDE.md`
- `(platform)/AUTH-ARCHITECTURE.md`
- `(platform)/lib/auth/auth-helpers.ts`

**Example Patterns:**
- Existing auth utilities in `lib/auth/`
- Middleware patterns in `lib/middleware/`

---

**Created:** 2025-10-10
**Dependencies:** Phase 1 complete
**Next Session:** 2.2 - Disable Incomplete Modules
