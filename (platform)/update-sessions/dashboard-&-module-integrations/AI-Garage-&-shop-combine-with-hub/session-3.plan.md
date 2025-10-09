# Session 3: Agent Templates & Marketplace - Backend

## Session Overview
**Goal:** Implement agent templates module with marketplace functionality, ratings, and public/system templates.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1, 2

## Objectives

1. ✅ Create agent templates module (schemas, queries, actions)
2. ✅ Implement template marketplace with filtering
3. ✅ Add template review and rating system
4. ✅ Create system vs user template logic
5. ✅ Implement template usage tracking
6. ✅ Add RBAC for template management
7. ✅ Create API routes

## Module Structure

```
lib/modules/ai-garage/templates/
├── index.ts           # Public API exports
├── schemas.ts         # Zod validation schemas
├── queries.ts         # Data fetching functions
├── actions.ts         # Server Actions
└── utils.ts           # Template utilities
```

## Key Features

### 1. Template Types
- **System Templates:** Built-in templates (is_system=true) accessible across all orgs
- **Public Templates:** User-created templates shared publicly (is_public=true)
- **Private Templates:** Org-specific templates (is_public=false)

### 2. Template Categories
- Sales, Support, Analysis, Content, Automation, Research

### 3. Rating & Review System
- 1-5 star ratings
- Written reviews
- Average rating calculation
- Usage count tracking

## Implementation Steps

### Step 1: Create Schemas

**File:** `lib/modules/ai-garage/templates/schemas.ts`

```typescript
import { z } from 'zod';
import { AgentCategory } from '@prisma/client';

export const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.nativeEnum(AgentCategory),
  avatar: z.string().url().optional(),

  personality_config: z.record(z.string(), z.any()),
  model_config: z.record(z.string(), z.any()),
  tools_config: z.record(z.string(), z.any()),
  memory_config: z.record(z.string(), z.any()),

  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  use_cases: z.array(z.string()).default([]),

  is_public: z.boolean().default(false),
  organization_id: z.string().uuid().optional(),
});

export const templateFiltersSchema = z.object({
  category: z.nativeEnum(AgentCategory).optional(),
  is_public: z.boolean().optional(),
  is_system: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  min_rating: z.number().min(1).max(5).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export const createReviewSchema = z.object({
  template_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
  organization_id: z.string().uuid(),
});
```

### Step 2: Create Queries

**File:** `lib/modules/ai-garage/templates/queries.ts`

```typescript
import 'server-only';
import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';

export async function getTemplates(filters?: TemplateFilters) {
  return withTenantContext(async () => {
    const where: any = {};

    // Show system templates + org templates + public templates
    where.OR = [
      { is_system: true },
      { is_public: true },
      { organization_id: currentOrgId },
    ];

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.agent_templates.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatar_url: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { usage_count: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
}

export async function getTemplateById(id: string) {
  return withTenantContext(async () => {
    return await prisma.agent_templates.findFirst({
      where: {
        id,
        OR: [
          { is_system: true },
          { is_public: true },
          { organization_id: currentOrgId },
        ],
      },
      include: {
        creator: { select: { id: true, name: true, avatar_url: true } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, avatar_url: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  });
}
```

### Step 3: Create Actions

**File:** `lib/modules/ai-garage/templates/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage, canManageAIGarage } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';

export async function createTemplate(input: CreateTemplateInput) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createTemplateSchema.parse(input);

  return withTenantContext(async () => {
    const template = await prisma.agent_templates.create({
      data: {
        ...validated,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/ai-garage/templates');
    return template;
  });
}

export async function createReview(input: CreateReviewInput) {
  const session = await requireAuth();

  if (!canAccessAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createReviewSchema.parse(input);

  return withTenantContext(async () => {
    const review = await prisma.template_reviews.create({
      data: {
        ...validated,
        reviewer_id: session.user.id,
      },
    });

    // Update template average rating
    await updateTemplateRating(validated.template_id);

    revalidatePath(`/ai-garage/templates/${validated.template_id}`);
    return review;
  });
}

async function updateTemplateRating(templateId: string) {
  const reviews = await prisma.template_reviews.findMany({
    where: { template_id: templateId },
    select: { rating: true },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  await prisma.agent_templates.update({
    where: { id: templateId },
    data: { rating: avgRating },
  });
}

export async function incrementTemplateUsage(templateId: string) {
  return withTenantContext(async () => {
    await prisma.agent_templates.update({
      where: { id: templateId },
      data: { usage_count: { increment: 1 } },
    });
  });
}
```

### Step 4: Create Utilities

**File:** `lib/modules/ai-garage/templates/utils.ts`

```typescript
export function calculateTemplatePopularity(
  usageCount: number,
  rating: number | null
): boolean {
  return usageCount > 10 && (rating || 0) >= 4.0;
}

export function getTemplateIcon(category: AgentCategory): string {
  const icons = {
    SALES: '💼',
    SUPPORT: '🎧',
    ANALYSIS: '📊',
    CONTENT: '📝',
    AUTOMATION: '⚙️',
    RESEARCH: '🔬',
  };
  return icons[category] || '🤖';
}
```

### Step 5: Create API Routes

**File:** `app/api/v1/ai-garage/templates/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getTemplates } from '@/lib/modules/ai-garage/templates';
import { canAccessAIGarage } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canAccessAIGarage(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const templates = await getTemplates({
      category: searchParams.get('category') as any,
      search: searchParams.get('search') || undefined,
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
```

## Success Criteria

- [x] Templates module structure created
- [x] All schemas implemented
- [x] Query functions with public/system template logic
- [x] Server Actions with RBAC
- [x] Review and rating system functional
- [x] Usage tracking implemented
- [x] API routes created

## Files Created

- ✅ `lib/modules/ai-garage/templates/index.ts`
- ✅ `lib/modules/ai-garage/templates/schemas.ts`
- ✅ `lib/modules/ai-garage/templates/queries.ts`
- ✅ `lib/modules/ai-garage/templates/actions.ts`
- ✅ `lib/modules/ai-garage/templates/utils.ts`
- ✅ `app/api/v1/ai-garage/templates/route.ts`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Tool Blueprints Module**
2. ✅ Template marketplace backend ready
3. ✅ Can build template gallery UI

---

**Session 3 Complete:** ✅ Agent Templates module fully implemented
