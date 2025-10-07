# Prisma vs Supabase: Decision Tree

**Purpose:** Guide for choosing the right client for database operations
**Updated:** 2025-10-07
**Audience:** Strive-SaaS platform developers

---

## Quick Decision Flowchart

```
                    Need Database Operation?
                              |
                              v
              ┌───────────────┴───────────────┐
              |                               |
         Need Auth?                    Need Database Query?
              |                               |
              v                               v
      ┌───────┴───────┐           ┌──────────┴──────────┐
      |               |           |                     |
   Login/         Session      Complex        Simple CRUD
   Signup          Check       Query          Operation
      |               |           |                     |
      v               v           v                     v
  SUPABASE       SUPABASE      PRISMA               PRISMA
   Auth            Auth          ORM                 ORM
      |               |           |                     |
      └───────────────┴───────────┴─────────────────────┘
                              |
                              v
              ┌───────────────┴───────────────┐
              |                               |
     Need File Storage?              Need Real-time Updates?
              |                               |
              v                               v
         SUPABASE                        SUPABASE
         Storage                         Realtime
              |                               |
              └───────────────┬───────────────┘
                              |
                              v
                      Both Can Coexist!
                      Use Together in
                      Hybrid Patterns
```

---

## Comparison Table

| Feature | Prisma | Supabase Client | Best For |
|---------|--------|----------------|----------|
| **Type Safety** | Excellent (generated types) | Good (manual types) | Prisma |
| **Schema Management** | Migrations + Schema file | Manual SQL | Prisma |
| **Complex Queries** | Advanced (relations, aggregations) | Basic (SQL escape hatch) | Prisma |
| **RLS Enforcement** | No (bypasses RLS) | Yes (respects RLS) | Supabase |
| **Authentication** | No | Yes (built-in) | Supabase |
| **File Storage** | No | Yes (buckets + RLS) | Supabase |
| **Real-time Subscriptions** | No | Yes (WebSocket) | Supabase |
| **Performance** | Fast (connection pooling) | Fast (HTTP/WebSocket) | Tie |
| **Learning Curve** | Moderate | Easy | Supabase |
| **Server Actions** | Perfect fit | Good fit | Prisma |
| **Client Components** | Can't use directly | Perfect fit | Supabase |
| **Database Migrations** | Built-in | Manual SQL | Prisma |
| **Transaction Support** | Full support | Limited | Prisma |

---

## Use Cases

### Use Prisma When...

1. **Server-Side Data Mutations (95% of cases)**
   ```typescript
   'use server';

   export async function createContact(input: ContactInput) {
     const user = await getCurrentUser();

     // Prisma for server actions
     return await prisma.contacts.create({
       data: {
         ...input,
         organization_id: user.organizationId,
       },
     });
   }
   ```

2. **Complex Queries with Relations**
   ```typescript
   const loops = await prisma.transaction_loops.findMany({
     where: {
       organization_id: orgId,
       status: 'ACTIVE',
     },
     include: {
       tasks: {
         where: { completed: false },
         orderBy: { due_date: 'asc' },
       },
       parties: {
         include: { contact: true },
       },
       documents: true,
     },
   });
   ```

3. **Database Transactions (Atomic Operations)**
   ```typescript
   await prisma.$transaction(async (tx) => {
     const loop = await tx.transaction_loops.create({ data: loopData });
     await tx.transaction_tasks.createMany({ data: defaultTasks });
     await tx.transaction_audit_logs.create({ data: auditLog });
     return loop;
   });
   ```

4. **Bulk Operations**
   ```typescript
   // Update many records atomically
   await prisma.contacts.updateMany({
     where: {
       organization_id: orgId,
       status: 'LEAD',
     },
     data: {
       status: 'CLIENT',
       updated_at: new Date(),
     },
   });
   ```

5. **Schema Migrations**
   ```bash
   # Prisma handles all schema changes
   npx prisma migrate dev --name add_contact_tags
   ```

6. **Aggregations and Analytics**
   ```typescript
   const stats = await prisma.contacts.groupBy({
     by: ['status'],
     _count: { id: true },
     _avg: { deal_value: true },
     where: { organization_id: orgId },
   });
   ```

---

### Use Supabase Client When...

1. **Authentication (Always)**
   ```typescript
   import { createSupabaseServerClient } from '@/lib/auth/auth-helpers';

   export async function signIn(email: string, password: string) {
     const supabase = await createSupabaseServerClient();

     // Supabase handles auth
     return await supabase.auth.signInWithPassword({
       email,
       password,
     });
   }
   ```

2. **File Storage Operations**
   ```typescript
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
   );

   // Upload file to Supabase Storage
   const { data, error } = await supabase.storage
     .from('documents')
     .upload(`${orgId}/${fileName}`, file, {
       contentType: mimeType,
       upsert: false,
     });
   ```

3. **Real-time Data Subscriptions**
   ```typescript
   'use client';

   export function ActivityFeed() {
     const supabase = createClient();

     useEffect(() => {
       const channel = supabase
         .channel('activity-feed')
         .on('postgres_changes', {
           event: 'INSERT',
           schema: 'public',
           table: 'activity_logs',
         }, (payload) => {
           console.log('New activity:', payload.new);
         })
         .subscribe();

       return () => { channel.unsubscribe(); };
     }, []);
   }
   ```

4. **Client-Side Data Fetching (with RLS)**
   ```typescript
   'use client';

   // When you need RLS protection on client
   const { data: contacts } = await supabase
     .from('contacts')
     .select('*')
     .eq('organization_id', orgId);
   // RLS automatically filters by user's org
   ```

5. **OAuth and Social Auth**
   ```typescript
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${origin}/auth/callback`,
     },
   });
   ```

---

## Security Considerations

### CRITICAL: Prisma Bypasses RLS

**Problem:** Prisma uses a service-level connection that bypasses Row Level Security

**Solution:** ALWAYS filter by organization_id manually

```typescript
// ❌ WRONG - Leaks data across organizations
const contacts = await prisma.contacts.findMany();
// Returns ALL contacts from ALL organizations!

// ✅ CORRECT - Manually filter by org
const contacts = await prisma.contacts.findMany({
  where: {
    organization_id: user.organizationId, // CRITICAL!
  },
});
```

**Best Practice:**
```typescript
// Create a wrapper that enforces org filtering
export async function withTenantContext<T>(
  callback: () => Promise<T>
): Promise<T> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Set RLS context (if using RLS with Prisma)
  await prisma.$executeRaw`
    SET app.current_user_id = ${user.id};
    SET app.current_org_id = ${user.organizationId};
  `;

  return await callback();
}

// Usage
return withTenantContext(async () => {
  return prisma.contacts.findMany(); // Auto-filtered by RLS
});
```

---

### Supabase Service Role Key

**Warning:** Service role key bypasses ALL RLS policies

```typescript
// ⚠️ DANGER - Only use on server!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS!
);

// ✅ SAFE - Use anon key on client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Respects RLS
);
```

**Use Service Role Key ONLY for:**
- Server-side file uploads
- Admin operations
- Background jobs
- System-level operations

**NEVER:**
- Expose service role key to client
- Use in client components
- Commit to version control
- Log or print in error messages

---

## Performance Implications

### Prisma Performance

**Strengths:**
- Connection pooling (handles load well)
- Query optimization (efficient SQL generation)
- N+1 query prevention (use `include` properly)
- Prepared statements (safe from SQL injection)

**Watch Out For:**
```typescript
// ❌ BAD - N+1 query problem
const loops = await prisma.transaction_loops.findMany();
for (const loop of loops) {
  const tasks = await prisma.transaction_tasks.findMany({
    where: { loop_id: loop.id }
  });
}

// ✅ GOOD - Single query with relations
const loops = await prisma.transaction_loops.findMany({
  include: { tasks: true }
});
```

---

### Supabase Performance

**Strengths:**
- Real-time subscriptions (no polling needed)
- CDN-backed storage (fast file delivery)
- RLS at database level (secure by default)

**Watch Out For:**
```typescript
// ❌ BAD - Over-fetching data
const { data } = await supabase
  .from('contacts')
  .select('*'); // Gets ALL columns

// ✅ GOOD - Select only needed columns
const { data } = await supabase
  .from('contacts')
  .select('id, name, email, phone');
```

---

## Multi-Tenancy Guidance

### The Challenge

Strive-SaaS is **multi-tenant** - multiple organizations share the same database.

**Goal:** Ensure Organization A cannot see Organization B's data.

---

### Multi-Tenancy with Prisma

**Pattern:** Manual filtering + RLS context

```typescript
export async function getContacts() {
  const user = await getCurrentUser();

  // ALWAYS include organization_id filter
  return await prisma.contacts.findMany({
    where: {
      organization_id: user.organizationId, // CRITICAL!
    },
  });
}

// Alternative: Use RLS context (if RLS policies enabled)
await withTenantContext(async () => {
  // RLS context set, queries auto-filter
  return prisma.contacts.findMany();
});
```

**Checklist:**
- [ ] All queries filter by `organization_id`
- [ ] All mutations set `organization_id` explicitly
- [ ] RLS context set before queries (if using RLS)
- [ ] Test with multiple organizations
- [ ] Verify no data leaks in logs

---

### Multi-Tenancy with Supabase

**Pattern:** RLS policies (automatic filtering)

```sql
-- RLS policy on contacts table
CREATE POLICY "org_isolation" ON contacts
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()::text
    )
  );
```

```typescript
'use client';

// Supabase client respects RLS automatically
const { data: contacts } = await supabase
  .from('contacts')
  .select('*');
// Only returns current user's org contacts (RLS filters)
```

**Checklist:**
- [ ] RLS enabled on all multi-tenant tables
- [ ] RLS policies created (SELECT, INSERT, UPDATE, DELETE)
- [ ] Test RLS with different users
- [ ] Use anon key (not service role) for client queries
- [ ] Verify RLS blocks cross-org access

---

## Code Examples

### Example 1: Creating a Contact (Prisma Server Action)

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { CreateContactSchema } from './schemas';

export async function createContact(input: unknown) {
  // 1. Authenticate
  const user = await requireAuth();

  // 2. Validate input
  const validated = CreateContactSchema.parse(input);

  // 3. Prisma mutation (server-side, bypasses RLS)
  return await prisma.contacts.create({
    data: {
      ...validated,
      organization_id: user.organizationId, // CRITICAL!
    },
  });
}
```

---

### Example 2: File Upload (Supabase Storage)

```typescript
'use server';

import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth/auth-helpers';

export async function uploadDocument(
  file: File,
  loopId: string
) {
  const user = await requireAuth();

  // Use service role key (server-side only)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fileName = `${user.organizationId}/${loopId}/${file.name}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Store metadata in database (Prisma)
  await prisma.transaction_documents.create({
    data: {
      loop_id: loopId,
      file_path: data.path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      organization_id: user.organizationId,
      uploaded_by: user.id,
    },
  });

  return data;
}
```

---

### Example 3: Real-time Activity Feed (Supabase + Prisma Hybrid)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ActivityFeed({ orgId }: { orgId: string }) {
  const [activities, setActivities] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch (could use Server Component instead)
    async function loadActivities() {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);

      setActivities(data || []);
    }

    loadActivities();

    // Real-time subscription
    const channel = supabase
      .channel(`activities:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `organization_id=eq.${orgId}`,
      }, (payload) => {
        setActivities((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [orgId]);

  return (
    <div>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
```

---

## Quick Reference

### When to Use What

| Operation | Use Prisma | Use Supabase | Notes |
|-----------|------------|--------------|-------|
| Create record | ✅ | ⚠️ | Prisma preferred for type safety |
| Read records | ✅ | ✅ | Prisma for server, Supabase for client |
| Update record | ✅ | ⚠️ | Prisma preferred for type safety |
| Delete record | ✅ | ⚠️ | Prisma preferred for type safety |
| Login/Signup | ❌ | ✅ | Only Supabase has auth |
| Upload file | ❌ | ✅ | Only Supabase has storage |
| Real-time updates | ❌ | ✅ | Only Supabase has realtime |
| Complex joins | ✅ | ❌ | Prisma has better query builder |
| Transactions | ✅ | ❌ | Prisma has full transaction support |
| Schema migrations | ✅ | ❌ | Prisma manages schema |

---

## Summary

**Default Choice:** Use **Prisma** for all database operations in Server Actions (95% of cases)

**Use Supabase for:**
- Authentication (100% of auth)
- File storage (100% of uploads)
- Real-time features (100% of subscriptions)
- Client-side queries with RLS protection (rare cases)

**Remember:**
- Prisma = Type-safe ORM for server-side operations
- Supabase = Platform with auth, storage, and realtime
- Both can coexist in the same application
- Use the right tool for the job

---

**Related Documentation:**
- [Hybrid Patterns Guide](./HYBRID-PATTERNS.md) - Real-world examples
- [Testing RLS](./TESTING-RLS.md) - How to test RLS policies
- [Supabase Setup](./SUPABASE-SETUP.md) - Configuration guide
- [RLS Policies](./RLS-POLICIES.md) - Complete RLS reference

---

**Last Updated:** 2025-10-07
**Version:** 1.0
