# Session 2: Content Module - Backend & Validation

## Session Overview
**Goal:** Build the content management backend module with validation schemas, queries, and server actions.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** Session 1 (Database Schema)

## Objectives

1. ✅ Create content module structure
2. ✅ Implement Zod validation schemas
3. ✅ Build content queries (with RLS)
4. ✅ Create content server actions
5. ✅ Implement slug generation
6. ✅ Add content revision system
7. ✅ Build SEO optimization helpers
8. ✅ Add RBAC permission checks

## Module Structure

```
lib/modules/content/
├── content/
│   ├── index.ts          # Public API
│   ├── schemas.ts        # Zod validation
│   ├── queries.ts        # Data fetching
│   ├── actions.ts        # Server Actions
│   └── helpers.ts        # Utility functions
├── media/
│   ├── index.ts
│   ├── schemas.ts
│   ├── queries.ts
│   └── actions.ts
└── campaigns/
    ├── index.ts
    ├── schemas.ts
    ├── queries.ts
    └── actions.ts
```

## Implementation Steps

### 1. Content Schemas

**File:** `lib/modules/content/content/schemas.ts`

```typescript
import { z } from 'zod';
import { ContentType, ContentStatus } from '@prisma/client';

export const ContentItemSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  type: z.nativeEnum(ContentType),
  status: z.nativeEnum(ContentStatus).default('DRAFT'),
  language: z.string().default('en'),

  // SEO
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional(),

  // Media
  featuredImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).default([]),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),

  // Publishing
  scheduledFor: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),

  // Relations
  categoryId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export const UpdateContentSchema = ContentItemSchema.partial().extend({
  id: z.string().uuid(),
});

export const PublishContentSchema = z.object({
  id: z.string().uuid(),
  scheduledFor: z.coerce.date().optional(),
});

export const ContentFiltersSchema = z.object({
  status: z.nativeEnum(ContentStatus).optional(),
  type: z.nativeEnum(ContentType).optional(),
  categoryId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type ContentItemInput = z.infer<typeof ContentItemSchema>;
export type UpdateContentInput = z.infer<typeof UpdateContentSchema>;
export type PublishContentInput = z.infer<typeof PublishContentSchema>;
export type ContentFilters = z.infer<typeof ContentFiltersSchema>;
```

### 2. Content Queries

**File:** `lib/modules/content/content/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { ContentFilters } from './schemas';
import { cache } from 'react';

// Set RLS context helper
async function withContentContext<T>(callback: () => Promise<T>): Promise<T> {
  const session = await requireAuth();

  await prisma.$executeRaw`
    SET app.current_user_id = ${session.user.id};
    SET app.current_org_id = ${session.user.organizationId};
  `;

  return await callback();
}

// Get content items with filters
export const getContentItems = cache(async (filters?: ContentFilters) => {
  return withContentContext(async () => {
    const where: any = {
      organizationId: (await requireAuth()).user.organizationId,
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.authorId) where.authorId = filters.authorId;

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          slug: { in: filters.tags },
        },
      };
    }

    return await prisma.contentItem.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            revisions: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
});

// Get single content item
export const getContentItemById = cache(async (id: string) => {
  return withContentContext(async () => {
    return await prisma.contentItem.findFirst({
      where: {
        id,
        organizationId: (await requireAuth()).user.organizationId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: true,
        tags: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
        comments: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });
  });
});

// Get content by slug (for public viewing)
export const getContentBySlug = cache(async (slug: string, orgId: string) => {
  return await prisma.contentItem.findUnique({
    where: {
      slug_organizationId: {
        slug,
        organizationId: orgId,
      },
      status: 'PUBLISHED',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: true,
      tags: true,
    },
  });
});

// Get content stats
export const getContentStats = cache(async () => {
  return withContentContext(async () => {
    const session = await requireAuth();

    const [total, published, draft, scheduled] = await Promise.all([
      prisma.contentItem.count({
        where: { organizationId: session.user.organizationId },
      }),
      prisma.contentItem.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'PUBLISHED',
        },
      }),
      prisma.contentItem.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'DRAFT',
        },
      }),
      prisma.contentItem.count({
        where: {
          organizationId: session.user.organizationId,
          status: 'SCHEDULED',
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      scheduled,
    };
  });
});

// Get content count
export const getContentCount = cache(async (filters?: ContentFilters) => {
  return withContentContext(async () => {
    const where: any = {
      organizationId: (await requireAuth()).user.organizationId,
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.categoryId) where.categoryId = filters.categoryId;

    return await prisma.contentItem.count({ where });
  });
});
```

### 3. Content Actions

**File:** `lib/modules/content/content/actions.ts`

```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canAccessContent, canPublishContent } from '@/lib/auth/rbac';
import { canAccessFeature } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
import {
  ContentItemSchema,
  UpdateContentSchema,
  PublishContentSchema,
  type ContentItemInput,
  type UpdateContentInput,
  type PublishContentInput,
} from './schemas';
import { generateUniqueSlug } from './helpers';

// Create content item
export async function createContentItem(input: ContentItemInput) {
  const session = await requireAuth();

  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }

  if (!canAccessFeature(session.user, 'content')) {
    throw new Error('Upgrade required: Content features not available in your plan');
  }

  const validated = ContentItemSchema.parse(input);

  // Generate unique slug
  const slug = await generateUniqueSlug(
    validated.slug,
    session.user.organizationId
  );

  const content = await prisma.contentItem.create({
    data: {
      ...validated,
      slug,
      organizationId: session.user.organizationId,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      category: true,
      tags: true,
    },
  });

  revalidatePath('/content');
  return content;
}

// Update content item
export async function updateContentItem(input: UpdateContentInput) {
  const session = await requireAuth();

  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const validated = UpdateContentSchema.parse(input);
  const { id, ...updateData } = validated;

  // Verify ownership/access
  const existing = await prisma.contentItem.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!existing) {
    throw new Error('Content not found');
  }

  // Create revision before update
  await prisma.contentRevision.create({
    data: {
      contentId: id,
      title: existing.title,
      contentBody: existing.content,
      excerpt: existing.excerpt,
      version: (await getNextRevisionVersion(id)),
      createdBy: session.user.id,
    },
  });

  // Update content
  const updated = await prisma.contentItem.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      category: true,
      tags: true,
    },
  });

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  return updated;
}

// Publish content
export async function publishContent(input: PublishContentInput) {
  const session = await requireAuth();

  if (!canPublishContent(session.user)) {
    throw new Error('Unauthorized: Content publishing permission required');
  }

  const validated = PublishContentSchema.parse(input);

  const content = await prisma.contentItem.findFirst({
    where: {
      id: validated.id,
      organizationId: session.user.organizationId,
    },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (validated.scheduledFor) {
    updateData.status = 'SCHEDULED';
    updateData.scheduledFor = validated.scheduledFor;
  } else {
    updateData.status = 'PUBLISHED';
    updateData.publishedAt = new Date();
  }

  const published = await prisma.contentItem.update({
    where: { id: validated.id },
    data: updateData,
  });

  revalidatePath('/content');
  revalidatePath(`/content/${validated.id}`);
  return published;
}

// Unpublish content
export async function unpublishContent(id: string) {
  const session = await requireAuth();

  if (!canPublishContent(session.user)) {
    throw new Error('Unauthorized: Content publishing permission required');
  }

  const content = await prisma.contentItem.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  const updated = await prisma.contentItem.update({
    where: { id },
    data: {
      status: 'DRAFT',
      publishedAt: null,
    },
  });

  revalidatePath('/content');
  revalidatePath(`/content/${id}`);
  return updated;
}

// Delete content
export async function deleteContent(id: string) {
  const session = await requireAuth();

  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized');
  }

  const content = await prisma.contentItem.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  await prisma.contentItem.delete({
    where: { id },
  });

  revalidatePath('/content');
  return { success: true };
}

// Helper: Get next revision version
async function getNextRevisionVersion(contentId: string): Promise<number> {
  const latestRevision = await prisma.contentRevision.findFirst({
    where: { contentId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  return (latestRevision?.version || 0) + 1;
}
```

### 4. Content Helpers

**File:** `lib/modules/content/content/helpers.ts`

```typescript
import { prisma } from '@/lib/database/prisma';

// Generate unique slug
export async function generateUniqueSlug(
  baseSlug: string,
  organizationId: string
): Promise<string> {
  let slug = baseSlug.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let counter = 1;
  let uniqueSlug = slug;

  while (await isSlugTaken(uniqueSlug, organizationId)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

// Check if slug is taken
async function isSlugTaken(
  slug: string,
  organizationId: string
): Promise<boolean> {
  const existing = await prisma.contentItem.findUnique({
    where: {
      slug_organizationId: {
        slug,
        organizationId,
      },
    },
  });

  return !!existing;
}

// Generate SEO-friendly excerpt
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');

  // Trim to max length at word boundary
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const trimmed = plainText.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');

  return trimmed.substring(0, lastSpace) + '...';
}

// Extract keywords from content
export function extractKeywords(content: string, count: number = 10): string[] {
  // Simple keyword extraction (in production, use NLP library)
  const words = content
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 4); // Only words > 4 chars

  // Count word frequency
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency and return top N
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

// Validate SEO optimization
export function validateSEO(content: {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  content: string;
}) {
  const issues: string[] = [];

  // Title checks
  if (!content.metaTitle && content.title.length > 60) {
    issues.push('Title exceeds 60 characters');
  }

  if (content.metaTitle && content.metaTitle.length > 60) {
    issues.push('Meta title exceeds 60 characters');
  }

  // Meta description checks
  if (!content.metaDescription) {
    issues.push('Meta description is missing');
  } else if (content.metaDescription.length > 160) {
    issues.push('Meta description exceeds 160 characters');
  }

  // Keywords check
  if (content.keywords.length === 0) {
    issues.push('No keywords defined');
  }

  // Content length check
  const wordCount = content.content.split(/\s+/).length;
  if (wordCount < 300) {
    issues.push('Content is too short (minimum 300 words recommended)');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
```

### 5. Module Public API

**File:** `lib/modules/content/content/index.ts`

```typescript
// Schemas
export {
  ContentItemSchema,
  UpdateContentSchema,
  PublishContentSchema,
  ContentFiltersSchema,
} from './schemas';

export type {
  ContentItemInput,
  UpdateContentInput,
  PublishContentInput,
  ContentFilters,
} from './schemas';

// Queries
export {
  getContentItems,
  getContentItemById,
  getContentBySlug,
  getContentStats,
  getContentCount,
} from './queries';

// Actions
export {
  createContentItem,
  updateContentItem,
  publishContent,
  unpublishContent,
  deleteContent,
} from './actions';

// Helpers
export {
  generateUniqueSlug,
  generateExcerpt,
  extractKeywords,
  validateSEO,
} from './helpers';

// Types from Prisma
export type { ContentItem, ContentType, ContentStatus } from '@prisma/client';
```

### 6. RBAC Permissions

**Update `lib/auth/rbac.ts`:**

```typescript
// Content Management Permissions
export function canAccessContent(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

export function canCreateContent(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canPublishContent(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canDeleteContent(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

// Feature access by subscription tier
export function getContentLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { content: 0, media: 0, campaigns: 0 },
    STARTER: { content: 0, media: 0, campaigns: 0 },
    GROWTH: { content: 100, media: 500, campaigns: 5 },
    ELITE: { content: -1, media: -1, campaigns: -1 }, // Unlimited
  };

  return limits[tier];
}
```

## Success Criteria

- [x] Content module structure created
- [x] All Zod schemas implemented with validation
- [x] Content queries with RLS context
- [x] Server actions with RBAC checks
- [x] Slug generation working (unique per org)
- [x] Revision system tracks changes
- [x] SEO helpers functional
- [x] Multi-tenancy enforced
- [x] Input validation comprehensive
- [x] Error handling robust

## Testing

**Create test file:** `__tests__/modules/content/content.test.ts`

```typescript
import { createContentItem, publishContent } from '@/lib/modules/content/content';
import { generateUniqueSlug, validateSEO } from '@/lib/modules/content/content/helpers';

describe('Content Module', () => {
  it('should create content for current org only', async () => {
    const content = await createContentItem({
      title: 'Test Article',
      slug: 'test-article',
      content: 'Content body',
      type: 'ARTICLE',
      keywords: ['test'],
      organizationId: 'org-123',
    });

    expect(content.organizationId).toBe('org-123');
  });

  it('should generate unique slugs', async () => {
    const slug1 = await generateUniqueSlug('test-slug', 'org-123');
    const slug2 = await generateUniqueSlug('test-slug', 'org-123');

    expect(slug1).toBe('test-slug');
    expect(slug2).toBe('test-slug-1');
  });

  it('should validate SEO', () => {
    const result = validateSEO({
      title: 'Test Article',
      metaTitle: 'Test Article - Great Content',
      metaDescription: 'This is a great test article about testing.',
      keywords: ['test', 'article'],
      content: 'This is the content. '.repeat(100), // 300+ words
    });

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
```

## Files Created

- ✅ `lib/modules/content/content/schemas.ts`
- ✅ `lib/modules/content/content/queries.ts`
- ✅ `lib/modules/content/content/actions.ts`
- ✅ `lib/modules/content/content/helpers.ts`
- ✅ `lib/modules/content/content/index.ts`
- ✅ `lib/auth/rbac.ts` (updated)
- ✅ `__tests__/modules/content/content.test.ts`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Media Library - Upload & Management**
2. ✅ Content backend complete
3. ✅ Ready to build media management
4. ✅ Content creation and publishing functional

---

**Session 2 Complete:** ✅ Content module backend with validation and RBAC
