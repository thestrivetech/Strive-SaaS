# Hybrid Prisma + Supabase Patterns

**Purpose:** Real-world patterns combining Prisma and Supabase in the Strive platform
**Updated:** 2025-10-07
**Audience:** Strive-SaaS platform developers

---

## Overview

The Strive platform uses **both Prisma and Supabase** together in a hybrid architecture:

- **Prisma:** Database queries, schema management, type safety
- **Supabase:** Authentication, file storage, real-time subscriptions

This guide shows proven patterns from actual Strive platform code.

---

## Pattern 1: Server Action with Prisma

**Use Case:** 95% of data mutations (creates, updates, deletes)

**Real Example:** Creating a contact in the CRM module

```typescript
// lib/modules/crm/contacts/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageContacts } from '@/lib/auth/rbac';
import { hasOrgPermission } from '@/lib/auth/org-rbac';
import { canAccessFeature } from '@/lib/auth/subscription';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createContactSchema,
  type CreateContactInput,
} from './schemas';

/**
 * Create a new contact
 *
 * @security
 * - Requires SubscriptionTier: STARTER or higher
 * - Requires GlobalRole: USER or higher with CRM access
 * - Requires OrganizationRole: MEMBER or higher (contacts:write permission)
 */
export async function createContact(input: CreateContactInput) {
  // 1. Authenticate
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // 2. Check subscription tier
  if (!canAccessFeature(user.subscription_tier, 'crm')) {
    throw new Error('Upgrade to STARTER tier to access CRM features');
  }

  // 3. Check GlobalRole permissions
  if (!canAccessCRM(user.role) || !canManageContacts(user.role)) {
    throw new Error('Unauthorized: Insufficient global permissions');
  }

  // 4. Check OrganizationRole permissions
  const orgMember = user.organization_members?.[0];
  if (!orgMember || !hasOrgPermission(user.role, orgMember.role, 'contacts:write')) {
    throw new Error('Unauthorized: Insufficient organization permissions');
  }

  // 5. Validate input with Zod
  const validated = createContactSchema.parse(input);

  // 6. Execute database operation with tenant context
  return withTenantContext(async () => {
    try {
      const contact = await prisma.contacts.create({
        data: {
          ...validated,
          organization_id: user.organization_members[0].organization_id,
        },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });

      // 7. Revalidate Next.js cache
      revalidatePath('/crm/contacts');
      revalidatePath('/crm/dashboard');

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts] createContact failed:', dbError);
      throw new Error(`Failed to create contact: ${dbError.message}`);
    }
  });
}
```

**Key Principles:**
1. Use `'use server'` directive for Server Actions
2. Authenticate with `requireAuth()` or `getCurrentUser()`
3. Check subscription tier, global role, and organization role
4. Validate input with Zod schemas
5. ALWAYS set `organization_id` manually (Prisma bypasses RLS)
6. Use `withTenantContext()` to set RLS session variables
7. Handle errors gracefully with typed error handling
8. Revalidate Next.js cache paths after mutations

---

## Pattern 2: Transaction Management with Atomic Operations

**Use Case:** Creating a transaction loop with related records (atomic)

**Real Example:** Creating a transaction loop with default tasks

```typescript
// lib/modules/transactions/core/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { CreateLoopSchema } from './schemas';
import { hasTransactionPermission, requireTransactionAccess } from './permissions';

export async function createLoop(input: CreateLoopInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier
  requireTransactionAccess(user);

  // Check permission
  if (!hasTransactionPermission(user, 'CREATE_LOOPS')) {
    throw new Error('Unauthorized: No permission to create loops');
  }

  // Validate input
  const validated = CreateLoopSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Use Prisma transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create loop
    const loop = await tx.transaction_loops.create({
      data: {
        property_address: validated.propertyAddress,
        transaction_type: validated.transactionType,
        listing_price: validated.listingPrice,
        expected_closing: validated.expectedClosing,
        organization_id: organizationId,
        created_by: user.id,
        status: 'DRAFT',
        progress: 0,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    // 2. Create default tasks
    const defaultTasks = [
      { title: 'Initial Consultation', order: 1, category: 'PRE_LISTING' },
      { title: 'Property Inspection', order: 2, category: 'LISTING' },
      { title: 'Offer Review', order: 3, category: 'UNDER_CONTRACT' },
      { title: 'Final Walkthrough', order: 4, category: 'CLOSING' },
    ];

    await tx.transaction_tasks.createMany({
      data: defaultTasks.map((task) => ({
        ...task,
        loop_id: loop.id,
        organization_id: organizationId,
        status: 'PENDING',
        completed: false,
      })),
    });

    // 3. Create audit log
    await tx.transaction_audit_logs.create({
      data: {
        action: 'created',
        entity_type: 'loop',
        entity_id: loop.id,
        new_values: loop,
        user_id: user.id,
        organization_id: organizationId,
      },
    });

    return loop;
  });

  // Revalidate cache
  revalidatePath('/real-estate/workspace');

  return { success: true, loop: result };
}
```

**Key Principles:**
1. Use `prisma.$transaction()` for atomic operations
2. All operations succeed or all fail (no partial state)
3. Create related records in single transaction
4. Audit logs for compliance tracking
5. Always include `organization_id` in all records

---

## Pattern 3: File Upload with Storage + Database

**Use Case:** Document upload to Supabase Storage with metadata in Prisma

**Real Example:** Transaction document upload

```typescript
// lib/modules/transactions/documents/actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { encryptDocument } from '@/lib/storage/encryption';

export async function uploadTransactionDocument(
  loopId: string,
  file: File,
  documentType: string
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's org
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // 1. Create Supabase client (server-side with service role)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS (server only)
  );

  // 2. Read file buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // 3. Encrypt document (for sensitive files)
  const encrypted = encryptDocument(fileBuffer);

  // 4. Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${organizationId}/transactions/${loopId}/${timestamp}-${sanitizedName}`;

  // 5. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, encrypted, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 6. Generate signed URL (temporary access)
  const { data: urlData } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  // 7. Store metadata in Prisma database
  const document = await prisma.transaction_documents.create({
    data: {
      loop_id: loopId,
      file_path: uploadData.path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      document_type: documentType,
      is_encrypted: true,
      organization_id: organizationId,
      uploaded_by: user.id,
    },
  });

  // 8. Create audit log
  await prisma.transaction_audit_logs.create({
    data: {
      action: 'uploaded_document',
      entity_type: 'document',
      entity_id: document.id,
      new_values: { file_name: file.name, document_type: documentType },
      user_id: user.id,
      organization_id: organizationId,
    },
  });

  return {
    document,
    signedUrl: urlData?.signedUrl,
  };
}
```

**Key Principles:**
1. Supabase Storage for file bytes
2. Prisma for file metadata
3. Encrypt sensitive documents
4. Use service role key (server-side only)
5. Generate signed URLs for temporary access
6. Include organization_id in storage path (namespace isolation)
7. Audit trail for compliance

---

## Pattern 4: Authentication Flow (Supabase Auth + Prisma Sync)

**Use Case:** User login with lazy sync to Prisma database

**Real Example:** Authentication helpers

```typescript
// lib/auth/auth-helpers.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';

/**
 * Create Supabase server client
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: unknown) {
          cookieStore.set({ name, value, ...(options as Record<string, unknown>) });
        },
        remove(name: string, options: unknown) {
          cookieStore.set({ name, value: '', ...(options as Record<string, unknown>) });
        },
      },
    }
  );
};

/**
 * Get current Supabase session
 */
export const getSession = async () => {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
};

/**
 * Get current user from Prisma database (with lazy sync)
 */
export const getCurrentUser = async () => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  try {
    // Try to find user in Prisma database
    let user = await prisma.users.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        organization_members: {
          include: {
            organizations: {
              include: {
                subscriptions: true,
              },
            },
          },
        },
      },
    });

    // Lazy sync: If user authenticated with Supabase but not in our DB, create them
    if (!user) {
      user = await prisma.users.create({
        data: {
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
        },
        include: {
          organization_members: {
            include: {
              organizations: {
                include: {
                  subscriptions: true,
                },
              },
            },
          },
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
};

/**
 * Require authentication (redirect if not authenticated)
 */
export const requireAuth = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!user.organization_members || user.organization_members.length === 0) {
    redirect('/onboarding/organization');
  }

  return user;
};

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // User sync happens lazily in getCurrentUser() when needed
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name?: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  // User sync happens lazily in getCurrentUser() when needed
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }

  redirect('/login');
}
```

**Key Principles:**
1. Supabase Auth for authentication (passwords, sessions, tokens)
2. Prisma for user application data (profiles, preferences, org membership)
3. Lazy sync: Create Prisma user on first authenticated request
4. Single source of truth: Supabase for auth, Prisma for data
5. No password storage in Prisma (Supabase handles it)
6. Session cookies managed by Supabase (@supabase/ssr)

---

## Pattern 5: Real-time Activity Feed

**Use Case:** Live updates for organization activity

**Real Example:** Activity feed with real-time subscriptions

```typescript
// components/real-estate/workspace/ActivityFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem } from './ActivityItem';

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  organization_id: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export function ActivityFeed({
  organizationId,
  initialActivities
}: {
  organizationId: string;
  initialActivities: Activity[];
}) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new activities for this organization
    const channel = supabase
      .channel(`activities:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transaction_audit_logs',
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          console.log('New activity:', payload.new);

          // Fetch user data for the activity (Prisma would do this on server)
          const { data: user } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', payload.new.user_id)
            .single();

          const newActivity = {
            ...payload.new,
            user,
          } as Activity;

          setActivities((prev) => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [organizationId, supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Server Component (initial data):**

```typescript
// app/real-estate/workspace/dashboard/page.tsx
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { ActivityFeed } from '@/components/real-estate/workspace/ActivityFeed';

export default async function WorkspaceDashboard() {
  const user = await requireAuth();
  const orgId = user.organization_members[0].organization_id;

  // Fetch initial activities with Prisma (server-side)
  const initialActivities = await prisma.transaction_audit_logs.findMany({
    where: {
      organization_id: orgId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 50,
  });

  return (
    <div>
      <h1>Workspace Dashboard</h1>
      <ActivityFeed
        organizationId={orgId}
        initialActivities={initialActivities}
      />
    </div>
  );
}
```

**Key Principles:**
1. Server Component fetches initial data with Prisma
2. Client Component subscribes to real-time updates with Supabase
3. Filter subscriptions by organization_id
4. Optimistic updates (add to state immediately)
5. Unsubscribe on component unmount
6. Type safety with TypeScript interfaces

---

## Pattern 6: Bulk Operations with Progress Tracking

**Use Case:** Bulk update contacts with status updates

**Real Example:** Bulk assign contacts to user

```typescript
// lib/modules/crm/contacts/actions.ts
'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { BulkAssignContactsSchema } from './schemas';

export async function bulkAssignContacts(input: BulkAssignContactsInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = BulkAssignContactsSchema.parse(input);
  const orgId = user.organization_members[0].organization_id;

  // Verify all contacts belong to user's organization
  const contacts = await prisma.contacts.findMany({
    where: {
      id: { in: validated.contactIds },
      organization_id: orgId,
    },
    select: { id: true },
  });

  if (contacts.length !== validated.contactIds.length) {
    throw new Error('Some contacts not found or access denied');
  }

  // Verify assignee exists in organization
  const assignee = await prisma.organization_members.findFirst({
    where: {
      user_id: validated.assignToUserId,
      organization_id: orgId,
    },
  });

  if (!assignee) {
    throw new Error('Assignee not found in organization');
  }

  // Bulk update contacts
  const result = await prisma.contacts.updateMany({
    where: {
      id: { in: validated.contactIds },
      organization_id: orgId, // Extra safety check
    },
    data: {
      assigned_to_id: validated.assignToUserId,
      updated_at: new Date(),
    },
  });

  // Create audit log for each contact
  await prisma.transaction_audit_logs.createMany({
    data: validated.contactIds.map((contactId) => ({
      action: 'bulk_assigned',
      entity_type: 'contact',
      entity_id: contactId,
      new_values: { assigned_to_id: validated.assignToUserId },
      user_id: user.id,
      organization_id: orgId,
    })),
  });

  return {
    success: true,
    updated: result.count,
  };
}
```

**Key Principles:**
1. Verify all records belong to user's organization FIRST
2. Use `updateMany` for bulk operations (efficient)
3. Create audit logs for compliance
4. Return count of updated records
5. Atomic operations (all succeed or all fail)

---

## Pattern 7: Complex Query with Aggregations

**Use Case:** Dashboard metrics with aggregations

**Real Example:** CRM dashboard statistics

```typescript
// lib/modules/crm/queries.ts
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';

export async function getCRMDashboardMetrics() {
  const user = await requireAuth();
  const orgId = user.organization_members[0].organization_id;

  // Run multiple queries in parallel
  const [
    totalContacts,
    contactsByStatus,
    recentContacts,
    dealStats,
    upcomingFollowUps,
  ] = await Promise.all([
    // Total contacts
    prisma.contacts.count({
      where: { organization_id: orgId },
    }),

    // Contacts grouped by status
    prisma.contacts.groupBy({
      by: ['status'],
      where: { organization_id: orgId },
      _count: { id: true },
    }),

    // Recent contacts (last 7 days)
    prisma.contacts.count({
      where: {
        organization_id: orgId,
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Deal statistics
    prisma.deals.aggregate({
      where: { organization_id: orgId },
      _sum: { value: true },
      _avg: { value: true },
      _count: { id: true },
    }),

    // Upcoming follow-ups (next 7 days)
    prisma.contacts.findMany({
      where: {
        organization_id: orgId,
        next_follow_up: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        name: true,
        next_follow_up: true,
        assigned_to: {
          select: { name: true, email: true },
        },
      },
      orderBy: { next_follow_up: 'asc' },
      take: 10,
    }),
  ]);

  return {
    totalContacts,
    contactsByStatus,
    recentContacts,
    dealStats,
    upcomingFollowUps,
  };
}
```

**Key Principles:**
1. Use `Promise.all()` for parallel queries (performance)
2. Use `groupBy()` for aggregations
3. Use `aggregate()` for statistics
4. Always filter by `organization_id`
5. Return structured data for UI consumption

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting organization_id

```typescript
// ❌ WRONG - Data leak!
const contacts = await prisma.contacts.findMany();
// Returns ALL contacts from ALL organizations

// ✅ CORRECT
const contacts = await prisma.contacts.findMany({
  where: { organization_id: user.organizationId },
});
```

### Mistake 2: Using Supabase service role on client

```typescript
// ❌ WRONG - Security vulnerability!
'use client';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Exposed to client!
);

// ✅ CORRECT
'use client';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Safe for client
);
```

### Mistake 3: N+1 Query Problem

```typescript
// ❌ WRONG - N+1 queries
const loops = await prisma.transaction_loops.findMany();
for (const loop of loops) {
  const tasks = await prisma.transaction_tasks.findMany({
    where: { loop_id: loop.id },
  });
}

// ✅ CORRECT - Single query with include
const loops = await prisma.transaction_loops.findMany({
  include: {
    tasks: true,
  },
});
```

### Mistake 4: Missing error handling

```typescript
// ❌ WRONG - Unhandled errors
export async function createContact(input: ContactInput) {
  const contact = await prisma.contacts.create({ data: input });
  return contact;
}

// ✅ CORRECT - Proper error handling
export async function createContact(input: ContactInput) {
  try {
    const validated = ContactSchema.parse(input);
    const contact = await prisma.contacts.create({ data: validated });
    return contact;
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[CRM] createContact failed:', dbError);
    throw new Error(`Failed to create contact: ${dbError.message}`);
  }
}
```

---

## Summary

**Hybrid Architecture Benefits:**
- Type safety (Prisma generated types)
- Authentication (Supabase Auth)
- File storage (Supabase Storage)
- Real-time updates (Supabase Realtime)
- Complex queries (Prisma ORM)
- Multi-tenancy (RLS + manual filtering)

**Key Takeaway:** Use the right tool for each job - Prisma for data operations, Supabase for platform features.

---

**Related Documentation:**
- [Decision Tree](./PRISMA-SUPABASE-DECISION-TREE.md) - When to use what
- [Testing RLS](./TESTING-RLS.md) - Test multi-tenancy
- [Supabase Setup](./SUPABASE-SETUP.md) - Configuration
- [RLS Policies](./RLS-POLICIES.md) - Security policies

---

**Last Updated:** 2025-10-07
**Version:** 1.0
