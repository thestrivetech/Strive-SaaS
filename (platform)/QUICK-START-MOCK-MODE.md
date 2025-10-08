# Quick Start: Mock Data Mode

**Get up and running with mock data in 2 minutes**

## 1. Enable Mock Mode

Edit your `.env.local`:

```bash
# Add this line
NEXT_PUBLIC_USE_MOCKS=true
```

If you don't have `.env.local`, copy from `.env.example`:
```bash
cp .env.example .env.local
```

## 2. Start Development

```bash
npm run dev
```

## 3. Use Mock Data in Your Code

### Server Components

```typescript
// app/real-estate/crm/contacts/page.tsx
import { contactsProvider } from '@/lib/data';

export default async function ContactsPage() {
  // Automatically uses mock data when NEXT_PUBLIC_USE_MOCKS=true
  const contacts = await contactsProvider.findMany('your-org-id');

  return (
    <div>
      <h1>Contacts ({contacts.length})</h1>
      {contacts.map(contact => (
        <div key={contact.id}>
          <p>{contact.name}</p>
          <p>{contact.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### Server Actions

```typescript
// app/real-estate/crm/contacts/actions.ts
'use server';

import { contactsProvider } from '@/lib/data';

export async function createContact(formData: FormData) {
  const contact = await contactsProvider.create({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: null,
    role: null,
    tags: [],
    notes: null,
    organization_id: 'your-org-id',
  }, 'your-org-id');

  return contact;
}
```

## 4. Available Mock Data

### CRM Module

- **Contacts:** `contactsProvider`
  - 25 mock contacts per organization
  - Fields: name, email, phone, company, role, tags, notes

- **Leads:** `leadsProvider`
  - 15 mock leads per organization
  - Fields: name, email, phone, source, status, value, notes

- **Customers:** `customersProvider`
  - 30 mock customers per organization
  - Fields: name, email, phone, company, address, lifetime_value, tags

### Example

```typescript
import { contactsProvider, leadsProvider, customersProvider } from '@/lib/data';

// Get all contacts
const contacts = await contactsProvider.findMany('org-id');

// Get single contact
const contact = await contactsProvider.findById('contact-id', 'org-id');

// Create contact
const newContact = await contactsProvider.create({...}, 'org-id');

// Update contact
const updated = await contactsProvider.update('contact-id', {...}, 'org-id');

// Delete contact
await contactsProvider.delete('contact-id', 'org-id');
```

## 5. Switch to Real Database (Later)

When you're ready to use the real database:

1. Design your schema in `prisma/schema.prisma`
2. Run migrations: `npm run db:migrate`
3. Update providers to use Prisma queries
4. Disable mock mode: `NEXT_PUBLIC_USE_MOCKS=false`

## That's It!

You're now developing with mock data. Focus on building great UI, discover your real data requirements, then design the perfect schema later.

---

**Full Documentation:** See `MOCK-DATA-WORKFLOW.md` for complete details
