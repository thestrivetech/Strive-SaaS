# Data Providers

**Provider Pattern** - Abstraction layer between business logic and database operations.

## Purpose

Providers separate data access logic from business logic, making the codebase:
- **Testable** - Mock providers instead of Prisma
- **Maintainable** - Single place for data access patterns
- **Flexible** - Easy to swap ORMs or add caching
- **Consistent** - Standardized interface across all modules

## Structure

```
lib/data/providers/
├── reid/                    # REID Analytics module providers
│   ├── market-reports.ts
│   ├── neighborhood-insights.ts
│   └── ai-profiles.ts
├── expense-tax/             # Expense & Tax module providers
│   └── tax-reports.ts
└── [module]/                # Other module providers
```

## Provider Interface

Each provider exports an object with standardized methods:

```typescript
export const entityProvider = {
  // READ
  findMany: async (orgId: string, filters?: Filters) => {...},
  findById: async (id: string, orgId: string) => {...},

  // WRITE
  create: async (data: CreateInput, orgId: string) => {...},
  update: async (id: string, data: UpdateInput, orgId: string) => {...},
  delete: async (id: string, orgId: string) => {...},

  // SEED (Development/Testing)
  seed: async (orgId: string) => {...},  // Populate with sample data

  // CUSTOM
  // Add domain-specific methods as needed
};
```

## Usage

```typescript
// In module queries/actions
import { marketReportsProvider } from '@/lib/data/providers/reid/market-reports';

export async function getMarketReports(filters?: ReportFilters) {
  const session = await requireAuth();
  return await marketReportsProvider.findMany(
    session.user.organizationId,
    filters
  );
}
```

## Testing

```typescript
import { marketReportsProvider } from '@/lib/data/providers/reid/market-reports';

// Mock the provider
jest.mock('@/lib/data/providers/reid/market-reports');

test('getMarketReports returns filtered results', async () => {
  marketReportsProvider.findMany.mockResolvedValue([...]);
  const result = await getMarketReports({ status: 'PUBLISHED' });
  expect(result).toHaveLength(5);
});
```

## Migration from Seeds

Previous seed scripts (`prisma/seeds/`) have been migrated to providers:

| Old Seed File | New Provider |
|---------------|--------------|
| `market-reports-seed.ts` | `reid/market-reports.ts` |
| `neighborhood-insights-seed.ts` | `reid/neighborhood-insights.ts` |
| `reid-ai-profiles-seed.ts` | `reid/ai-profiles.ts` |
| `tax-reports-seed.ts` | `expense-tax/tax-reports.ts` |

Seed data is now available via `provider.seed(orgId)` method for development/testing.

## Benefits

1. **Centralized Data Access** - All database queries in one place per entity
2. **Automatic Tenant Isolation** - Providers handle `organizationId` filtering
3. **Reusable Patterns** - Common query patterns (pagination, filtering) standardized
4. **Easy Testing** - Mock at provider level, not Prisma level
5. **Future-Proof** - Can add caching, analytics, or swap ORMs without touching business logic

## See Also

- `(platform)/CLAUDE.md` - Platform standards
- `(platform)/lib/modules/` - Business logic using providers
