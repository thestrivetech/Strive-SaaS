# Session 4: Contacts Module - Complete Integration

## Session Overview
**Goal:** Implement the complete contacts module including backend, UI, and communication tracking.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-3

## Objectives

1. ✅ Create contacts module backend (schemas, queries, actions)
2. ✅ Implement contact components and pages
3. ✅ Add communication tracking features
4. ✅ Implement contact-to-lead conversion
5. ✅ Create contact detail view with full history
6. ✅ Add import/export functionality

## Module Structure

```
lib/modules/contacts/
├── index.ts
├── schemas.ts
├── queries.ts
└── actions.ts

components/(platform)/crm/contacts/
├── contact-card.tsx
├── contact-form-dialog.tsx
├── contact-actions-menu.tsx
├── contact-detail-view.tsx
├── contact-communications.tsx
└── contact-filters.tsx
```

## Key Implementation Steps

### 1. Contacts Backend Module

**schemas.ts** - Similar to leads with contact-specific fields:
```typescript
export const createContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  type: z.nativeEnum(ContactType).default('PROSPECT'),
  status: z.nativeEnum(ContactStatus).default('ACTIVE'),
  linkedin_url: z.string().url().optional(),
  twitter_url: z.string().url().optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'text']).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.any()).optional(),
  organization_id: z.string().uuid(),
  assigned_to_id: z.string().uuid().optional(),
});
```

**queries.ts** - Contact fetching with relations:
```typescript
export async function getContacts(filters?: ContactFilters) {
  return withTenantContext(async () => {
    return await prisma.contacts.findMany({
      where: buildWhereClause(filters),
      include: {
        assigned_to: { select: { id: true, name: true, avatar_url: true } },
        activities: { orderBy: { created_at: 'desc' }, take: 10 },
        deals: { where: { status: 'ACTIVE' } },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
}

export async function getContactWithFullHistory(contactId: string) {
  return withTenantContext(async () => {
    return await prisma.contacts.findFirst({
      where: { id: contactId },
      include: {
        assigned_to: true,
        activities: {
          include: { created_by: true },
          orderBy: { created_at: 'desc' },
        },
        deals: { include: { assigned_to: true } },
        appointments: { orderBy: { start_time: 'desc' } },
      },
    });
  });
}
```

**actions.ts** - Contact CRUD with communication logging:
```typescript
export async function createContact(input: CreateContactInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createContactSchema.parse(input);

  return withTenantContext(async () => {
    const contact = await prisma.contacts.create({
      data: {
        ...validated,
        organization_id: session.user.organizationId,
      },
    });

    revalidatePath('/crm/contacts');
    return contact;
  });
}

export async function logCommunication(contactId: string, data: {
  type: ActivityType;
  title: string;
  description?: string;
  outcome?: string;
}) {
  const session = await requireAuth();

  return withTenantContext(async () => {
    const activity = await prisma.activities.create({
      data: {
        ...data,
        contact_id: contactId,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    // Update last_contact_at on contact
    await prisma.contacts.update({
      where: { id: contactId },
      data: { last_contact_at: new Date() },
    });

    revalidatePath(`/crm/contacts/${contactId}`);
    return activity;
  });
}
```

### 2. Contact Components

**contact-card.tsx** - Similar to LeadCard but with contact-specific data
**contact-form-dialog.tsx** - Form for creating/editing contacts
**contact-detail-view.tsx** - Full contact profile with timeline
**contact-communications.tsx** - Activity log with communication history

### 3. Contact Pages

**app/(platform)/crm/contacts/page.tsx** - Contact list with filtering
**app/(platform)/crm/contacts/[id]/page.tsx** - Contact detail page

### 4. Communication Tracking

- Log calls, emails, meetings
- Track communication frequency
- Show last contact date
- Display communication timeline
- Filter contacts by communication activity

### 5. Advanced Features

- Import contacts from CSV
- Export contacts to CSV
- Bulk operations (assign, tag, delete)
- Contact scoring based on engagement
- Duplicate detection and merging

## Success Criteria

- [x] Contacts module backend complete
- [x] Contact UI components functional
- [x] Communication tracking working
- [x] Contact detail view with full history
- [x] Import/export functionality
- [x] Responsive and accessible UI
- [x] Multi-tenancy enforced
- [x] RBAC permissions checked

## Files Created

- ✅ `lib/modules/contacts/*` (4 files)
- ✅ `components/(platform)/crm/contacts/*` (6+ files)
- ✅ `app/(platform)/crm/contacts/page.tsx`
- ✅ `app/(platform)/crm/contacts/[id]/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 5: Deals Pipeline - Backend & Kanban UI**
2. ✅ Contacts module complete
3. ✅ Communication tracking functional
4. ✅ Ready to build deals pipeline

---

**Session 4 Complete:** ✅ Contacts module fully implemented
