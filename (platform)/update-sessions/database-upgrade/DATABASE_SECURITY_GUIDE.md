# Database Security & Patterns Guide

**Strive Tech SaaS Platform - Production Database Setup**

---

## 🎯 Overview

The Strive Tech platform uses **automatic tenant isolation** to prevent data leaks between organizations. All database queries are automatically filtered by `organizationId` using Prisma middleware.

### Key Features

✅ **Automatic Tenant Filtering** - No manual organizationId passing needed
✅ **Defense in Depth** - Middleware + RLS policies
✅ **Type-Safe** - Full TypeScript support
✅ **Error Handling** - Comprehensive error handling utilities
✅ **Performance Monitoring** - Built-in query monitoring and health checks
✅ **Production-Ready** - Optimized indexes and connection pooling

---

## 🔒 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────┐
│  Application Layer (Prisma Middleware) │  ← First Line of Defense
│  - Auto-inject organizationId filters  │
│  - Block queries without context       │
│  - Audit logging                       │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│   Database Layer (RLS Policies)        │  ← Second Line of Defense
│  - PostgreSQL Row Level Security       │
│  - Backup if middleware bypassed       │
└─────────────────┬───────────────────────┘
                  ▼
        ┌──────────────────┐
        │  Supabase PostgreSQL │
        └──────────────────┘
```

### How It Works

1. **Request arrives** with authenticated user
2. **Middleware extracts** organizationId from user session
3. **Tenant context set** automatically by `withTenantContext()`
4. **All Prisma queries** automatically filtered by organizationId
5. **RLS policies** provide backup filtering at database level

---

## 📝 Usage Patterns

### ✅ Correct Pattern (Automatic Filtering)

```typescript
import 'server-only';

import { withTenantContext } from '@/lib/database/utils';
import { prisma } from '@/lib/database/prisma';

/**
 * Get customers - automatically filtered by organization
 *
 * No need to pass organizationId - middleware handles it!
 */
export async function getCustomers() {
  return withTenantContext(async () => {
    // Automatically filtered by current user's organizationId
    return await prisma.customers.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  });
}
```

### ❌ Old Pattern (Manual Filtering) - Don't Use

```typescript
// ❌ OLD WAY - Redundant and error-prone
export async function getCustomers(organizationId: string) {
  return await prisma.customers.findMany({
    where: { organization_id: organizationId }, // Redundant!
    orderBy: { created_at: 'desc' },
  });
}
```

### Creating Records

```typescript
export async function createCustomer(data: CustomerInput) {
  return withTenantContext(async () => {
    // organizationId automatically injected by middleware
    return await prisma.customers.create({
      data: {
        name: data.name,
        email: data.email,
        // NO need to add organization_id - middleware does it!
      },
    });
  });
}
```

### Updating Records

```typescript
export async function updateCustomer(id: string, data: CustomerUpdateInput) {
  return withTenantContext(async () => {
    // Middleware ensures you can only update records in your org
    return await prisma.customers.update({
      where: { id }, // No organizationId needed!
      data,
    });
  });
}
```

### With Error Handling

```typescript
import { handleDatabaseError } from '@/lib/database/errors';

export async function getCustomerById(id: string) {
  return withTenantContext(async () => {
    try {
      return await prisma.customers.findFirst({
        where: { id },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Customers] Get by ID failed:', dbError);
      throw error;
    }
  });
}
```

---

## 🛡️ Security Best Practices

### 1. Always Use withTenantContext

```typescript
// ✅ CORRECT
export async function getData() {
  return withTenantContext(async () => {
    return await prisma.customers.findMany();
  });
}

// ❌ WRONG - No tenant context!
export async function getData() {
  return await prisma.customers.findMany(); // Will throw error!
}
```

### 2. Never Bypass Middleware

```typescript
// ❌ DANGEROUS - Bypasses tenant isolation
const customers = await prisma.$queryRaw`
  SELECT * FROM customers
`; // No tenant filtering!

// ✅ SAFE - Use Prisma queries (middleware applies)
const customers = await prisma.customers.findMany();
```

### 3. Validate User Permissions

```typescript
import { requirePermission } from '@/lib/auth/rbac';

export async function deleteCustomer(id: string) {
  return withTenantContext(async () => {
    // Check RBAC permissions BEFORE database operation
    await requirePermission('canManageCustomers');

    return await prisma.customers.delete({
      where: { id },
    });
  });
}
```

### 4. Handle Errors Properly

```typescript
import { handleDatabaseError, DatabaseErrorType } from '@/lib/database/errors';

try {
  await createCustomer(data);
} catch (error) {
  const dbError = handleDatabaseError(error);

  if (dbError.type === DatabaseErrorType.UNIQUE_CONSTRAINT) {
    return { error: 'Customer with this email already exists' };
  }

  if (dbError.type === DatabaseErrorType.CONNECTION) {
    return { error: 'Database unavailable. Please try again.' };
  }

  return { error: dbError.message };
}
```

---

## 🔧 Advanced Patterns

### Pagination

```typescript
import { paginate } from '@/lib/database/utils';

export async function getCustomersPaginated(page: number) {
  return withTenantContext(async () => {
    return await paginate(prisma.customers, {
      page,
      pageSize: 50,
      orderBy: { created_at: 'desc' },
    });
  });
}

// Returns:
// {
//   data: Customer[],
//   pagination: {
//     page: 1,
//     pageSize: 50,
//     total: 1234,
//     totalPages: 25,
//     hasNext: true,
//     hasPrevious: false
//   }
// }
```

### Transactions

```typescript
import { transaction } from '@/lib/database/utils';

export async function createProjectWithTasks(projectData, tasksData) {
  return withTenantContext(async () => {
    const [project, tasks] = await transaction([
      prisma.projects.create({ data: projectData }),
      prisma.tasks.createMany({ data: tasksData }),
    ]);

    return { project, tasks };
  });
}
```

### Bulk Operations

```typescript
import { bulkCreate } from '@/lib/database/utils';

export async function importCustomers(customersData: CustomerInput[]) {
  return withTenantContext(async () => {
    const count = await bulkCreate(
      prisma.customers,
      customersData,
      true // skipDuplicates
    );

    return { imported: count };
  });
}
```

---

## 📊 Performance Optimization

### Use Indexes Wisely

All critical indexes are already created. Check them:

```sql
-- View indexes on customers table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'customers';
```

### Monitor Slow Queries

Queries >100ms in development or >1s in production are logged automatically.

```typescript
// Check slow queries (requires pg_stat_statements extension)
import { getSlowQueries } from '@/lib/database/monitoring';

const slowQueries = await getSlowQueries(10);
slowQueries.forEach(({ query, avg_time, calls }) => {
  console.log(`${query}: ${avg_time}ms (${calls} calls)`);
});
```

### Check Database Health

```typescript
import { getDatabaseHealth } from '@/lib/database/monitoring';

const health = await getDatabaseHealth();

if (!health.healthy) {
  console.error('Database issues:', health.issues);
}
```

---

## 🧪 Testing

### Test Tenant Isolation

```typescript
// __tests__/database/tenant-isolation.test.ts
import { setTenantContext } from '@/lib/database/prisma-middleware';

it('should not access other organization data', async () => {
  setTenantContext({ organizationId: 'org-1', userId: 'user-1' });

  const customers = await prisma.customers.findMany();

  // All customers should belong to org-1
  customers.forEach((customer) => {
    expect(customer.organization_id).toBe('org-1');
  });
});
```

### Run Tests

```bash
npm test __tests__/database/
```

---

## 🚨 Common Issues & Solutions

### Issue: "Tenant context required" Error

**Cause:** Query made without setting tenant context

**Solution:**
```typescript
// Wrap query in withTenantContext
return withTenantContext(async () => {
  return await prisma.customers.findMany();
});
```

### Issue: Slow Queries

**Cause:** Missing indexes or N+1 queries

**Solution:**
```typescript
// Add indexes (already done for common patterns)
// Use include to avoid N+1 queries
const customers = await prisma.customers.findMany({
  include: {
    projects: true, // ✅ Single query with join
  },
});

// ❌ N+1 query pattern
for (const customer of customers) {
  const projects = await prisma.projects.findMany({
    where: { customer_id: customer.id },
  });
}
```

### Issue: Connection Pool Exhausted

**Cause:** Too many concurrent connections

**Solution:**
```typescript
// Check pool status
import { getConnectionPoolStatus } from '@/lib/database/prisma';

const status = getConnectionPoolStatus();
console.log('Available connections:', status.available);

// Optimize connection pooling in .env
DATABASE_URL="...?connection_limit=10&pool_timeout=20"
```

---

## 📚 API Reference

### Core Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `withTenantContext()` | Execute query with auto tenant filtering | `withTenantContext(async () => prisma.customers.findMany())` |
| `setTenantContext()` | Manually set tenant context | `setTenantContext({ organizationId, userId })` |
| `handleDatabaseError()` | Convert Prisma errors to user-friendly messages | `handleDatabaseError(error)` |
| `retryOnTransientError()` | Retry failed queries | `retryOnTransientError(() => query())` |

### Utility Functions

| Function | Purpose |
|----------|---------|
| `paginate()` | Paginate results with metadata |
| `bulkCreate()` | Bulk insert records |
| `transaction()` | Execute multiple operations atomically |
| `findOrCreate()` | Find existing or create new record |
| `recordExists()` | Check if record exists |

### Monitoring Functions

| Function | Purpose |
|----------|---------|
| `getDatabaseHealth()` | Check database connection health |
| `getSlowQueries()` | Get slow queries (requires pg_stat_statements) |
| `getIndexUsage()` | Check index usage statistics |
| `getTableSizes()` | Get table storage sizes |

---

## 🎓 Migration Guide

### Updating Existing Modules

**Before:**
```typescript
export async function getCustomers(organizationId: string) {
  return await prisma.customer.findMany({
    where: { organizationId },
  });
}
```

**After:**
```typescript
import { withTenantContext } from '@/lib/database/utils';

export async function getCustomers() {
  return withTenantContext(async () => {
    return await prisma.customers.findMany();
  });
}
```

### Update Function Calls

**Before:**
```typescript
const customers = await getCustomers(user.organizationId);
```

**After:**
```typescript
const customers = await getCustomers(); // No orgId needed!
```

---

## ✅ Production Checklist

- [x] Prisma schema generated from database
- [x] Tenant isolation middleware active
- [x] RLS policies enabled as backup
- [x] Performance indexes created
- [x] Error handling implemented
- [x] Query monitoring active
- [x] Connection pooling optimized
- [x] Security tests written
- [ ] Environment variables validated (run validation script)
- [ ] Module migrations completed (update remaining modules)

---

## 📞 Support

### Troubleshooting Steps

1. Check database connection: `await getDatabaseHealth()`
2. Verify tenant context is set: `getCurrentTenantContext()`
3. Check Prisma logs in development mode
4. Review slow query logs
5. Verify RLS policies are enabled

### Common Commands

```bash
# Generate Prisma client
cd shared/prisma && npx prisma generate

# Run migrations
cd shared/prisma && npx prisma migrate deploy

# View database
npx prisma studio

# Run database tests
npm test __tests__/database/
```

---

**Last Updated:** 2025-01-04
**Version:** 1.0.0
**Status:** ✅ Production Ready
