# Mock Data Development Workflow

**Last Updated:** 2025-10-07
**Status:** Active Development Pattern

## 🎯 Philosophy: UI-First, Schema-Second

This document outlines the new development approach for the Strive Tech Platform:

1. **Build UI with mock data** - Focus on user experience and component design
2. **Iterate quickly** - No database migrations during UI development
3. **Discover real requirements** - Learn what data/fields you actually need
4. **Design schema from reality** - Build database schema based on proven UI needs

## 📦 What Was Changed

### Schema Reset (2025-10-07)

**Backup Location:** `prisma/backup-20251007/schema.prisma`
- Old schema: 3,345 lines, 83 models
- New schema: 88 lines, 3 models (User, Organization, OrganizationMember)

**Reason:** Original schema was overbloated - built database-first before understanding UI requirements.

### Mock Data Infrastructure

**New Structure:**
```
lib/data/
├── config.ts                    # Mock mode toggle & configuration
├── index.ts                     # Central exports
├── mocks/
│   ├── generators.ts           # Mock data generators (names, emails, etc.)
│   └── crm.ts                  # CRM mock data (contacts, leads, customers)
└── providers/
    └── crm-provider.ts         # Data provider (switches between mock/real)
```

**Environment Variables:**
```bash
# Enable mock mode
NEXT_PUBLIC_USE_MOCKS=true

# Optional: Configure mock behavior
NEXT_PUBLIC_MOCK_DELAY=100          # API delay simulation (ms)
NEXT_PUBLIC_MOCK_ERRORS=false       # Random errors for testing
NEXT_PUBLIC_MOCK_ERROR_RATE=0.1    # Error rate (0-1)
```

## 🚀 How to Use Mock Data

### Step 1: Enable Mock Mode

In `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCKS=true
```

### Step 2: Use Data Providers

**Old Way (Direct Prisma):**
```typescript
// ❌ Don't do this during UI development
import { prisma } from '@/lib/database/prisma';

const contacts = await prisma.contact.findMany({
  where: { organizationId }
});
```

**New Way (Data Provider):**
```typescript
// ✅ Do this instead
import { contactsProvider } from '@/lib/data';

const contacts = await contactsProvider.findMany(orgId);
```

### Step 3: Build Your UI

Focus on the UI/UX without worrying about database:

```typescript
// app/real-estate/crm/contacts/page.tsx
import { contactsProvider } from '@/lib/data';

export default async function ContactsPage() {
  const contacts = await contactsProvider.findMany('org-123');

  return (
    <div>
      {contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}
```

### Step 4: Create/Update/Delete Works Too

```typescript
'use server';

import { contactsProvider } from '@/lib/data';

export async function createContact(data: ContactInput) {
  // Works with both mock and real data
  const contact = await contactsProvider.create(data, orgId);
  return contact;
}

export async function updateContact(id: string, data: Partial<ContactInput>) {
  const contact = await contactsProvider.update(id, data, orgId);
  return contact;
}

export async function deleteContact(id: string) {
  await contactsProvider.delete(id, orgId);
}
```

## 📋 Current Mock Data Available

### CRM Module

**Contacts** (`contactsProvider`)
- 25 mock contacts per organization
- Fields: id, name, email, phone, company, role, tags, notes, timestamps

**Leads** (`leadsProvider`)
- 15 mock leads per organization
- Fields: id, name, email, phone, source, status, value, notes, timestamps

**Customers** (`customersProvider`)
- 30 mock customers per organization
- Fields: id, name, email, phone, company, address, lifetime_value, tags, timestamps

### Mock Data Features

- **Realistic names:** John Smith, Jane Doe, etc.
- **Valid emails:** Generates from names or random usernames
- **Phone numbers:** (555) 555-5555 format
- **Addresses:** Street, city, state, zip
- **Dates:** Random past/future dates
- **Currency:** Realistic dollar amounts
- **Tags/Categories:** Randomized from realistic options

## 🔧 Adding New Mock Data

### 1. Create Mock Type

```typescript
// lib/data/mocks/your-module.ts
export type MockYourEntity = {
  id: string;
  name: string;
  // ... other fields
  organization_id: string;
  created_at: Date;
  updated_at: Date;
};
```

### 2. Create Generator

```typescript
// lib/data/mocks/your-module.ts
import { generateId, randomName, randomPastDate } from './generators';

export function generateMockYourEntity(orgId: string): MockYourEntity {
  const createdAt = randomPastDate(90);

  return {
    id: generateId(),
    name: randomName(),
    organization_id: orgId,
    created_at: createdAt,
    updated_at: createdAt,
  };
}
```

### 3. Create Provider

```typescript
// lib/data/providers/your-provider.ts
import { dataConfig, simulateDelay } from '../config';
import { generateMockYourEntity, type MockYourEntity } from '../mocks/your-module';

let mockStore: MockYourEntity[] = [];

export const yourEntityProvider = {
  async findMany(orgId: string): Promise<MockYourEntity[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      return mockStore.filter(e => e.organization_id === orgId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet');
  },

  // ... create, update, delete methods
};
```

### 4. Export from Index

```typescript
// lib/data/index.ts
export { yourEntityProvider } from './providers/your-provider';
export type { MockYourEntity } from './mocks/your-module';
```

## 🎨 Development Workflow

### Phase 1: UI Development (CURRENT)

1. Enable mock mode: `NEXT_PUBLIC_USE_MOCKS=true`
2. Build UI components with mock data
3. Test user flows and interactions
4. Iterate quickly without database changes
5. **Document what data fields you actually need**

### Phase 2: Schema Design (FUTURE)

1. Review all UI components
2. List all data fields used across the app
3. Design minimal schema based on real requirements
4. Add models incrementally as needed
5. Keep schema lean - only add what you're using

### Phase 3: Real Database Integration (FUTURE)

1. Finalize Prisma schema
2. Create migrations
3. Update providers to use real Prisma queries:

```typescript
export const contactsProvider = {
  async findMany(orgId: string): Promise<Contact[]> {
    if (dataConfig.useMocks) {
      // ... mock logic
    }

    // Real implementation
    return await prisma.contact.findMany({
      where: { organization_id: orgId }
    });
  },
};
```

4. Toggle mock mode off: `NEXT_PUBLIC_USE_MOCKS=false`
5. Test with real database

### Phase 4: Gradual Migration

You can migrate module-by-module:
- CRM uses real database (`contactsProvider` → Prisma)
- Transactions still uses mocks
- Projects still uses mocks
- etc.

Each provider handles its own mock/real toggle independently.

## ⚙️ Mock Data Configuration

### Basic Setup (.env.local)

```bash
# Enable mock mode
NEXT_PUBLIC_USE_MOCKS=true
```

### Advanced Configuration

```bash
# Simulate slow API (500ms delay)
NEXT_PUBLIC_MOCK_DELAY=500

# Enable random errors for testing error states
NEXT_PUBLIC_MOCK_ERRORS=true
NEXT_PUBLIC_MOCK_ERROR_RATE=0.2  # 20% of requests fail
```

### Programmatic Access

```typescript
import { dataConfig, simulateDelay, maybeThrowError } from '@/lib/data';

// Check if in mock mode
if (dataConfig.useMocks) {
  console.log('Using mock data');
}

// Manually simulate delay
await simulateDelay(200); // 200ms delay

// Manually trigger potential error
maybeThrowError('Custom error message');
```

## 🧪 Testing with Mock Data

### Benefits for Testing

1. **No database setup required** - Tests run instantly
2. **Predictable data** - Same mock data every time
3. **Isolated tests** - No shared state between tests
4. **Fast CI/CD** - No database migrations in CI

### Example Test

```typescript
// __tests__/crm/contacts.test.ts
import { contactsProvider } from '@/lib/data';

// Mock mode is automatically enabled in tests
describe('Contact Management', () => {
  it('should fetch contacts for organization', async () => {
    const contacts = await contactsProvider.findMany('org-123');

    expect(contacts).toHaveLength(25); // Default mock count
    expect(contacts[0]).toHaveProperty('name');
    expect(contacts[0]).toHaveProperty('email');
  });

  it('should create new contact', async () => {
    const newContact = await contactsProvider.create({
      name: 'Test User',
      email: 'test@example.com',
      organization_id: 'org-123',
    }, 'org-123');

    expect(newContact).toHaveProperty('id');
    expect(newContact.name).toBe('Test User');
  });
});
```

## 🔄 Switching Between Mock and Real Data

Toggle is environment-based, so you can:

**Development:** Use mocks for UI work
```bash
# .env.local
NEXT_PUBLIC_USE_MOCKS=true
```

**Testing:** Use mocks for fast tests
```bash
# .env.test
NEXT_PUBLIC_USE_MOCKS=true
```

**Production:** Use real database
```bash
# .env.production
NEXT_PUBLIC_USE_MOCKS=false
```

## 📊 Mock Data Storage

**Important:** Mock data is stored **in-memory** only.

- Data persists during dev server session
- Data resets when you restart `npm run dev`
- Perfect for UI development
- Not suitable for production

When you create/update/delete mock data, it only affects the in-memory store until server restart.

## 🎯 Best Practices

### DO:

✅ Use mock data during UI development
✅ Focus on UX first, schema second
✅ Document required fields as you build UI
✅ Keep mock data realistic (use generators)
✅ Test edge cases with mock configuration
✅ Gradually migrate to real database per module

### DON'T:

❌ Build entire schema before testing UI
❌ Skip mock mode and go straight to database
❌ Hardcode mock data in components
❌ Mix direct Prisma calls with providers
❌ Deploy to production with mocks enabled
❌ Assume mock data structure = final schema

## 🚨 Common Pitfalls

### "My data keeps disappearing!"

Mock data is in-memory. It resets on server restart. This is intentional for development.

### "TypeError: provider.findMany is not a function"

Make sure you're importing from `@/lib/data`, not from the mock files directly:

```typescript
// ❌ Wrong
import { generateMockContact } from '@/lib/data/mocks/crm';

// ✅ Correct
import { contactsProvider } from '@/lib/data';
```

### "Mock mode isn't working"

Check your `.env.local`:
1. Variable must be `NEXT_PUBLIC_USE_MOCKS` (public prefix required)
2. Value must be string `"true"` not boolean
3. Restart dev server after changing env vars

## 📚 Next Steps

1. ✅ **Schema reset complete** - Minimal schema (User, Organization)
2. ✅ **Mock infrastructure ready** - CRM providers available
3. ⏳ **Build UI modules** - Start with CRM, then expand
4. ⏳ **Document requirements** - Track what fields you actually need
5. ⏳ **Design final schema** - Build based on proven UI needs
6. ⏳ **Migrate to real DB** - Module by module, when ready

## 🔗 Related Files

- Schema: `prisma/schema.prisma` (minimal)
- Backup: `prisma/backup-20251007/schema.prisma` (old schema)
- Config: `lib/data/config.ts`
- Providers: `lib/data/providers/`
- Mocks: `lib/data/mocks/`
- Env: `.env.example` (see MOCK DATA section)

---

**Remember:** The goal is to build a great product, not a great database schema. Focus on the UI first, let the data model emerge from real requirements.
