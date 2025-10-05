# Session 4: Tool Blueprints & Visual Builder - Backend

## Session Overview
**Goal:** Implement tool blueprints module with visual programming components, connections, and configuration system.

**Duration:** 3 hours
**Complexity:** High
**Dependencies:** Session 1, 2, 3

## Objectives

1. ✅ Create tool blueprints module
2. ✅ Implement component/connection schemas
3. ✅ Add blueprint versioning
4. ✅ Create blueprint marketplace with categories
5. ✅ Implement blueprint cloning functionality
6. ✅ Add usage tracking

## Module Structure

```
lib/modules/ai-garage/blueprints/
├── index.ts
├── schemas.ts
├── queries.ts
└── actions.ts
```

## Implementation Steps

### Schemas (`lib/modules/ai-garage/blueprints/schemas.ts`)

```typescript
import { z } from 'zod';
import { ToolCategory, ComplexityLevel } from '@prisma/client';

export const createBlueprintSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.nativeEnum(ToolCategory),

  // Visual programming data
  components: z.record(z.string(), z.any()),
  connections: z.record(z.string(), z.any()),
  configuration: z.record(z.string(), z.any()),

  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  tags: z.array(z.string()).default([]),
  complexity: z.nativeEnum(ComplexityLevel),
  is_public: z.boolean().default(false),
  organization_id: z.string().uuid(),
});
```

### Queries (`lib/modules/ai-garage/blueprints/queries.ts`)

```typescript
import 'server-only';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';

export async function getBlueprints(filters?: any) {
  return withTenantContext(async () => {
    return await prisma.tool_blueprints.findMany({
      where: {
        OR: [
          { is_public: true },
          { organization_id: currentOrgId },
        ],
        ...(filters?.category && { category: filters.category }),
      },
      include: {
        creator: { select: { id: true, name: true, avatar_url: true } },
      },
      orderBy: { usage_count: 'desc' },
    });
  });
}
```

### Actions (`lib/modules/ai-garage/blueprints/actions.ts`)

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canManageAIGarage } from '@/lib/auth/rbac';

export async function createBlueprint(input: CreateBlueprintInput) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createBlueprintSchema.parse(input);

  return withTenantContext(async () => {
    const blueprint = await prisma.tool_blueprints.create({
      data: {
        ...validated,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/ai-garage/tool-forge');
    return blueprint;
  });
}

export async function cloneBlueprint(blueprintId: string) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  return withTenantContext(async () => {
    const original = await prisma.tool_blueprints.findFirst({
      where: { id: blueprintId },
    });

    if (!original) throw new Error('Blueprint not found');

    const { id, created_at, updated_at, usage_count, ...cloneData } = original;

    const clone = await prisma.tool_blueprints.create({
      data: {
        ...cloneData,
        name: `${original.name} (Copy)`,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/ai-garage/tool-forge');
    return clone;
  });
}
```

## Success Criteria

- [x] Blueprints module created
- [x] Component/connection schemas implemented
- [x] Versioning system in place
- [x] Cloning functionality working
- [x] Public/private blueprints supported

## Files Created

- ✅ `lib/modules/ai-garage/blueprints/index.ts`
- ✅ `lib/modules/ai-garage/blueprints/schemas.ts`
- ✅ `lib/modules/ai-garage/blueprints/queries.ts`
- ✅ `lib/modules/ai-garage/blueprints/actions.ts`

## Next Steps

✅ Proceed to **Session 5: Dashboard & Project Grid UI**

---

**Session 4 Complete:** ✅ Tool Blueprints module implemented
