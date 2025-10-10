# Schema Migration Guide - Mock Data to Production

**Created:** 2025-10-10
**Purpose:** Step-by-step guide to migrate from mock data to production schema

---

## 📋 Overview

This guide will help you transition from the current mock data system to the new production-ready Prisma schema.

### What We Have:
- ✅ Complete schema mapping (`prisma/SCHEMA-MAPPING.md`)
- ✅ New production schema (`prisma/schema-ui-based.prisma`)
- ✅ Mock data infrastructure (`lib/data/`)
- ✅ UI pages using mock providers

### What We Need to Do:
1. Replace old schema with new schema
2. Create and apply migrations
3. Update providers from mock → Prisma
4. Test each module thoroughly
5. Deploy incrementally

---

## 🎯 Migration Strategy: Incremental by Module

**WHY INCREMENTAL?**
- Reduces risk of breaking the entire app
- Allows testing one module at a time
- Easy rollback if issues arise
- Can continue developing while migrating

**RECOMMENDED ORDER:**
1. Week 1: CRM Module (4 models)
2. Week 2: Transactions/Workspace (7 models)
3. Week 3: Marketplace + Content (9 models)
4. Week 4: Expense + REID (11 models)
5. Week 5: AI Hub + Supporting (7 models)

---

## 📝 Pre-Migration Checklist

Before starting ANY migration:

- [ ] **Backup current schema**
  ```bash
  cp (platform)/prisma/schema.prisma (platform)/prisma/backup-current-schema.prisma
  ```

- [ ] **Backup database** (if you have any real data)
  ```bash
  # From Supabase dashboard or CLI
  npx supabase db dump -f backup-$(date +%Y%m%d).sql
  ```

- [ ] **Commit all changes**
  ```bash
  git add .
  git commit -m "Pre-migration backup"
  git push
  ```

- [ ] **Ensure mock mode works**
  ```bash
  # Test that UI works with current mock setup
  cd (platform)
  npm run dev
  # Visit each module and verify it loads
  ```

- [ ] **Review schema mapping**
  ```bash
  # Read the mapping to understand what changes
  cat (platform)/prisma/SCHEMA-MAPPING.md
  ```

---

## 🚀 Phase 1: Schema Replacement

### Step 1: Replace Schema File

```bash
# Navigate to platform directory
cd (platform)

# Backup old schema (if not already done)
cp prisma/schema.prisma prisma/backup-old-massive-schema.prisma

# Replace with new UI-based schema
cp prisma/schema-ui-based.prisma prisma/schema.prisma
```

### Step 2: Generate Prisma Client

```bash
# Generate new Prisma client
npx prisma generate

# This creates types for all 41 models
```

### Step 3: Check for Type Errors

```bash
# Run TypeScript check
npx tsc --noEmit

# You'll see errors where code references old models
# This is expected! We'll fix them module by module
```

---

## 🔄 Phase 2: Module-by-Module Migration

### Module 1: CRM (Week 1)

**Models:** Contact, Lead, Customer, Deal

#### Step 1: Create Migration

```bash
# From (platform)/ directory
npm run db:migrate

# When prompted for name:
# "add-crm-models"

# This creates migration files in prisma/migrations/
```

#### Step 2: Update CRM Provider

Current file: `lib/data/providers/crm-provider.ts`

**BEFORE (Mock):**
```typescript
// lib/data/providers/crm-provider.ts
import { generateMockContacts } from '../mocks/crm';

export const contactsProvider = {
  async findMany(orgId: string) {
    if (dataConfig.useMocks) {
      return mockStore.filter(c => c.organization_id === orgId);
    }
    // Real implementation
    throw new Error('Not implemented');
  }
};
```

**AFTER (Prisma):**
```typescript
// lib/data/providers/crm-provider.ts
import { prisma } from '@/lib/database/prisma';
import { generateMockContacts } from '../mocks/crm';
import { dataConfig } from '../config';

export const contactsProvider = {
  async findMany(orgId: string) {
    if (dataConfig.useMocks) {
      // Keep mock logic during transition
      return mockStore.filter(c => c.organization_id === orgId);
    }

    // ✅ NEW: Real Prisma implementation
    return await prisma.contact.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' }
    });
  },

  async findById(id: string, orgId: string) {
    if (dataConfig.useMocks) {
      return mockStore.find(c => c.id === id && c.organization_id === orgId);
    }

    return await prisma.contact.findFirst({
      where: { id, organization_id: orgId }
    });
  },

  async create(data: any, orgId: string, userId: string) {
    if (dataConfig.useMocks) {
      const newContact = generateMockContact(orgId, data);
      mockStore.push(newContact);
      return newContact;
    }

    return await prisma.contact.create({
      data: {
        ...data,
        organization_id: orgId,
        user_id: userId
      }
    });
  },

  // ... similar for update, delete
};
```

#### Step 3: Update Backend Modules

Current location: `lib/modules/crm/`

**Update each file to use Prisma:**

`lib/modules/crm/contacts/queries.ts`:
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';

export async function getContacts() {
  const session = await requireAuth();

  return await prisma.contact.findMany({
    where: { organization_id: session.user.organizationId },
    orderBy: { created_at: 'desc' }
  });
}
```

`lib/modules/crm/contacts/actions.ts`:
```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { ContactSchema } from './schemas';

export async function createContact(data: any) {
  const session = await requireAuth();
  const validated = ContactSchema.parse(data);

  return await prisma.contact.create({
    data: {
      ...validated,
      organization_id: session.user.organizationId,
      user_id: session.user.id
    }
  });
}
```

#### Step 4: Disable Mock Mode for CRM

```typescript
// lib/data/config.ts
export const dataConfig = {
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',

  // ✅ NEW: Per-module mock control
  mockModules: {
    crm: false, // ✅ CRM now uses real database
    transactions: true, // Still using mocks
    marketplace: true,
    content: true,
    expenses: true,
    reid: true,
    aiHub: true,
  }
};
```

#### Step 5: Test CRM Module

```bash
# Start dev server
npm run dev

# Test CRM pages:
# 1. /real-estate/crm/dashboard
# 2. /real-estate/crm/contacts
# 3. /real-estate/crm/leads
# 4. /real-estate/crm/deals

# Create, read, update, delete operations
# Verify data persists in database
```

#### Step 6: Seed Initial Data (Optional)

```bash
# Create seed file
touch prisma/seeds/crm-seed.ts
```

```typescript
// prisma/seeds/crm-seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCRM() {
  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();

  if (!org || !user) {
    console.log('No org/user found. Run auth seed first.');
    return;
  }

  // Create sample contacts
  await prisma.contact.createMany({
    data: [
      {
        organization_id: org.id,
        user_id: user.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'Acme Corp'
      },
      // ... more contacts
    ]
  });

  console.log('CRM data seeded!');
}

seedCRM()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### Module 2: Transactions/Workspace (Week 2)

**Models:** Loop, Task, Document, Party, Signature, Listing, TransactionActivity

Follow same process as CRM:

1. **Create Migration:**
   ```bash
   npm run db:migrate
   # Name: "add-transaction-models"
   ```

2. **Update Provider:**
   - File: `lib/data/providers/transactions-provider.ts`
   - Replace mock logic with Prisma queries

3. **Update Backend Modules:**
   - `lib/modules/transactions/` files
   - Use Prisma instead of mock data

4. **Update Config:**
   ```typescript
   mockModules: {
     crm: false,
     transactions: false, // ✅ Now using real DB
     // ...
   }
   ```

5. **Test Workspace:**
   - `/real-estate/workspace/dashboard`
   - `/real-estate/workspace/[loopId]`
   - Create loop, add tasks, upload documents

---

### Module 3: Marketplace + Content (Week 3)

**Models:** Tool, Bundle, BundleTools, Purchase, Review, Cart, ContentItem, Campaign, EmailCampaign

1. **Create Migration:**
   ```bash
   npm run db:migrate
   # Name: "add-marketplace-and-content-models"
   ```

2. **Update Providers:**
   - `lib/data/providers/marketplace-provider.ts`
   - `lib/data/providers/content-provider.ts`
   - `lib/data/providers/campaigns-provider.ts`

3. **Seed Marketplace Tools:**
   ```typescript
   // Create default tools and bundles
   // These are global, not org-specific
   ```

4. **Test:**
   - `/real-estate/marketplace/dashboard`
   - `/real-estate/cms-marketing/dashboard`

---

### Module 4: Expense + REID (Week 4)

**Models:** Expense, ExpenseCategory, TaxEstimate, Receipt, TaxReport, MarketData, Demographics, ROISimulation, Alert, School, AIProfile

1. **Create Migration:**
   ```bash
   npm run db:migrate
   # Name: "add-expense-and-reid-models"
   ```

2. **Update Providers:**
   - `lib/data/providers/expenses-provider.ts`
   - `lib/data/providers/reid-provider.ts`

3. **Seed Market Data:**
   ```typescript
   // Seed market data for major metros
   // This data is shared across all orgs
   ```

4. **Test:**
   - `/real-estate/expense-tax/dashboard`
   - `/real-estate/reid/dashboard`

---

### Module 5: AI Hub + Supporting (Week 5)

**Models:** Conversation, Message, Automation, AIUsage, Appointment, Activity, Widget

1. **Create Migration:**
   ```bash
   npm run db:migrate
   # Name: "add-ai-hub-and-supporting-models"
   ```

2. **Update Providers:**
   - `lib/data/providers/ai-hub-provider.ts`
   - `lib/data/providers/appointments-provider.ts`
   - `lib/data/providers/activities-provider.ts`
   - `lib/data/providers/dashboard-provider.ts`

3. **Test:**
   - `/real-estate/ai-hub/dashboard`
   - Appointments in CRM
   - Activity logs

4. **Final Integration Test:**
   - Test all modules end-to-end
   - Verify cross-module relationships work
   - Check performance with real data

---

## 🧪 Testing Checklist (Per Module)

For EACH module you migrate:

### Functional Testing
- [ ] **Read operations work**
  - List pages load correctly
  - Detail pages show data
  - Search/filter functions work

- [ ] **Create operations work**
  - Forms submit successfully
  - Data appears in database
  - UI updates correctly

- [ ] **Update operations work**
  - Edit forms pre-populate
  - Changes persist
  - Optimistic UI updates work

- [ ] **Delete operations work**
  - Confirmation dialogs appear
  - Data removed from database
  - UI updates correctly

### Data Integrity
- [ ] **Multi-tenancy isolation**
  ```bash
  # Test: Switch orgs, verify no data leaks
  ```

- [ ] **Relationships work**
  ```bash
  # Test: Related data loads correctly
  # Example: Loop → Tasks, Documents, Parties
  ```

- [ ] **Cascading deletes**
  ```bash
  # Test: Delete parent, verify children deleted
  # Example: Delete Loop → Tasks, Documents deleted
  ```

### Performance
- [ ] **Page load times < 2s**
  ```bash
  # Use Chrome DevTools Network tab
  ```

- [ ] **Query performance**
  ```sql
  -- Check slow queries in Supabase dashboard
  -- Add indexes if needed
  ```

- [ ] **N+1 query prevention**
  ```typescript
  // Use Prisma's include for eager loading
  await prisma.loop.findMany({
    include: { tasks: true, documents: true }
  });
  ```

---

## 🔧 Common Migration Issues & Solutions

### Issue 1: Type Mismatches

**Problem:** Mock data types don't match Prisma types

**Solution:**
```typescript
// Before (Mock)
type MockContact = {
  created_at: Date; // JavaScript Date
}

// After (Prisma)
type Contact = {
  created_at: Date; // Prisma Date (same, but different source)
}

// Fix: Update type imports
import { Contact } from '@prisma/client';
// Instead of importing from mock types
```

### Issue 2: Missing Fields

**Problem:** UI uses fields not in new schema

**Solution:**
1. Check if field is actually needed
2. If yes, add to schema:
   ```prisma
   model Contact {
     // ... existing fields
     missing_field String? // Add new field
   }
   ```
3. Create migration:
   ```bash
   npm run db:migrate
   # Name: "add-missing-field-to-contact"
   ```

### Issue 3: Decimal vs Number

**Problem:** Mock uses `number`, Prisma uses `Decimal`

**Solution:**
```typescript
// Import Decimal from Prisma
import { Prisma } from '@prisma/client';

// Convert when needed
const price = new Prisma.Decimal(100.50);

// Display in UI
const displayPrice = price.toNumber();
```

### Issue 4: Enum Value Changes

**Problem:** Mock enum values differ from schema enums

**Solution:**
```typescript
// Update enum values in schema to match mock
enum LeadStatus {
  NEW_LEAD      // ✅ Match mock exactly
  // Not: NEW   // ❌ Don't change mock names
}
```

### Issue 5: Relations Breaking

**Problem:** Relationships not loading

**Solution:**
```typescript
// Use Prisma's include
const loop = await prisma.loop.findUnique({
  where: { id },
  include: {
    tasks: true,
    documents: true,
    parties: true
  }
});

// Or use select for specific fields
const loop = await prisma.loop.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    tasks: {
      select: {
        id: true,
        title: true,
        status: true
      }
    }
  }
});
```

---

## 📊 Migration Progress Tracking

Use this template to track your progress:

```markdown
# Migration Progress

## Week 1: CRM Module
- [x] Schema migration created
- [x] Providers updated
- [x] Backend modules updated
- [x] Mock mode disabled
- [x] Contacts tested
- [x] Leads tested
- [x] Customers tested
- [x] Deals tested
- [x] Integration tests passed

## Week 2: Transactions
- [ ] Schema migration created
- [ ] Providers updated
- [ ] Backend modules updated
- [ ] Mock mode disabled
- [ ] Loops tested
- [ ] Tasks tested
- [ ] Documents tested
- [ ] ... etc

... (continue for all modules)
```

---

## 🚨 Rollback Plan

If something goes wrong:

### Quick Rollback (Same Session)

```bash
# 1. Restore old schema
cp prisma/backup-current-schema.prisma prisma/schema.prisma

# 2. Regenerate client
npx prisma generate

# 3. Restart dev server
npm run dev
```

### Full Rollback (After Migration)

```bash
# 1. Revert migration
npx prisma migrate reset

# 2. Restore schema
cp prisma/backup-current-schema.prisma prisma/schema.prisma

# 3. Regenerate client
npx prisma generate

# 4. Restore database (if needed)
psql -U postgres -d your_db < backup-YYYYMMDD.sql
```

### Git Rollback

```bash
# Find commit before migration
git log --oneline

# Revert to that commit
git reset --hard <commit-hash>

# Or create revert commit
git revert <commit-hash>
```

---

## ✅ Post-Migration Checklist

After ALL modules are migrated:

- [ ] **Remove mock data infrastructure**
  ```bash
  # Optional: Keep for reference or remove
  rm -rf lib/data/mocks/
  # Keep providers as they now use Prisma
  ```

- [ ] **Update environment variables**
  ```bash
  # Remove NEXT_PUBLIC_USE_MOCKS from .env.local
  # It's no longer needed
  ```

- [ ] **Run final tests**
  ```bash
  npm test -- --coverage
  # Ensure 80%+ coverage maintained
  ```

- [ ] **Performance audit**
  ```bash
  npm run build
  # Check bundle size
  # Optimize if needed
  ```

- [ ] **Documentation update**
  - Update README with real DB setup
  - Remove mock data references
  - Add schema documentation

- [ ] **Deploy to staging**
  ```bash
  # Deploy to Vercel staging
  vercel --prod=false
  # Test thoroughly
  ```

- [ ] **Deploy to production**
  ```bash
  # Run migrations
  npm run db:migrate -- --prod

  # Deploy
  vercel --prod
  ```

---

## 📚 Additional Resources

### Prisma Documentation
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Internal Documentation
- `SCHEMA-MAPPING.md` - Complete field mapping
- `lib/database/docs/` - Database guides
- `CLAUDE.md` - Platform standards

### Helper Scripts
- `npm run db:migrate` - Create migration
- `npm run db:status` - Check migration status
- `npm run db:docs` - Update schema docs
- `npm run db:sync` - Check for schema drift

---

## 🎯 Success Criteria

Migration is complete when:

✅ All 41 models are in production database
✅ All modules use Prisma instead of mocks
✅ All tests pass (80%+ coverage)
✅ No TypeScript errors
✅ Performance meets targets (<2s page loads)
✅ Multi-tenancy isolation verified
✅ Production deployment successful

---

## 💡 Tips for Success

1. **Go slow** - One module per week is fine
2. **Test thoroughly** - Don't rush to next module
3. **Keep mock fallback** - Useful during transition
4. **Document issues** - Track problems for future reference
5. **Pair program** - Complex migrations benefit from two sets of eyes
6. **Use Prisma Studio** - Great for debugging data issues
   ```bash
   npx prisma studio
   ```

7. **Monitor production** - Watch for errors after deployment
8. **Have rollback ready** - Always have a way back

---

**Remember:** The goal isn't speed—it's a stable, working production system. Take your time, test thoroughly, and celebrate each module completion! 🎉

**Next Step:** Start with Phase 1 (Schema Replacement) when you're ready to begin the migration.
