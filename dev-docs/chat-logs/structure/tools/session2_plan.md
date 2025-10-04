# Tool Architecture Implementation - Session 2 Plan

**Previous Session:** [Session 1 Summary](./session1_summary.md)
**Status:** Ready to Execute (Updated for new tiers & module distinction)
**Estimated Duration:** 8-11 hours
**Prerequisites:** ✅ All Session 1 tasks complete

---

## 🚨 CRITICAL: Read First

**MODULES vs TOOLS:**
- **MODULES** = Core platform (lib/modules/) - CRM, Projects, AI, Tasks
  - DO NOT migrate these to tools marketplace
  - Always included per tier
  - Part of base platform

- **TOOLS** = Marketplace add-ons (lib/tools/) - ROI Calc, Invoice Gen, etc.
  - Can be purchased separately
  - ONLY these go in marketplace
  - May integrate into modules

**Tiers:** Starter | Growth | Elite | Custom | Enterprise (all pricing TBD)

**See:** [CRITICAL-DISTINCTIONS.md](./CRITICAL-DISTINCTIONS.md)

---

## 🎯 Session 2 Objectives

Complete the tool marketplace implementation with:
1. ✅ Data layer and business logic (Prisma integration)
2. ✅ UI implementation (pages and components)
3. ✅ Comprehensive testing (80%+ coverage)
4. ✅ Quality validation (lint, types, build)
5. ✅ Documentation updates

---

## 📋 Phase 2: Data Layer & Business Logic

### Task 2.1: Create Tool Management Module
**Location:** `app/lib/modules/tools/`
**Priority:** CRITICAL
**Estimated Time:** 1.5 hours

#### Files to Create:

**1. `lib/modules/tools/schemas.ts`**
```typescript
import { z } from 'zod';

export const EnableToolSchema = z.object({
  organizationId: z.string().uuid(),
  toolId: z.string(),
  industry: z.string(),
  settings: z.record(z.unknown()).optional(),
});

export const DisableToolSchema = z.object({
  organizationId: z.string().uuid(),
  toolId: z.string(),
  industry: z.string(),
});

export const UpdateToolConfigSchema = z.object({
  organizationId: z.string().uuid(),
  toolId: z.string(),
  industry: z.string(),
  settings: z.record(z.unknown()),
});

export const GetToolConfigSchema = z.object({
  organizationId: z.string().uuid(),
  toolId: z.string(),
});
```

**2. `lib/modules/tools/actions.ts`**
```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  getToolById,
  checkToolAccess,
  enableTool as enableToolLifecycle,
  disableTool as disableToolLifecycle,
  configureTool as configureToolLifecycle,
} from '@/lib/tools';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { EnableToolSchema, DisableToolSchema, UpdateToolConfigSchema } from './schemas';

/**
 * Enable a tool for an organization
 */
export async function enableToolForOrganization(
  data: z.infer<typeof EnableToolSchema>
) {
  // Validate input
  const validated = EnableToolSchema.parse(data);
  const { organizationId, toolId, industry, settings = {} } = validated;

  // Get current user and verify permissions
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's subscription tier
  const userTier = user.subscriptionTier || 'FREE';

  // Count currently enabled tools
  const enabledCount = await prisma.organizationToolConfig.count({
    where: { organizationId, enabled: true },
  });

  // Check access
  const access = await checkToolAccess({
    toolId,
    industry,
    userTier,
    enabledToolsCount: enabledCount,
  });

  if (!access.hasAccess) {
    throw new Error(`Access denied: ${access.reason}`);
  }

  // Get the tool
  const tool = await getToolById(toolId, industry);
  if (!tool) {
    throw new Error('Tool not found');
  }

  // Run lifecycle hook
  const result = await enableToolLifecycle({
    tool,
    organizationId,
    settings,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to enable tool');
  }

  // Create or update database record
  await prisma.organizationToolConfig.upsert({
    where: {
      organizationId_toolId: { organizationId, toolId },
    },
    create: {
      organizationId,
      toolId,
      industry,
      enabled: true,
      settings,
      enabledAt: new Date(),
    },
    update: {
      enabled: true,
      settings,
      enabledAt: new Date(),
      disabledAt: null,
    },
  });

  revalidatePath('/tools');
  return { success: true };
}

/**
 * Disable a tool for an organization
 */
export async function disableToolForOrganization(
  data: z.infer<typeof DisableToolSchema>
) {
  const validated = DisableToolSchema.parse(data);
  const { organizationId, toolId, industry } = validated;

  // Get current user and verify permissions
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Get the tool
  const tool = await getToolById(toolId, industry);
  if (!tool) {
    throw new Error('Tool not found');
  }

  // Run lifecycle hook
  const result = await disableToolLifecycle({ tool, organizationId });

  if (!result.success) {
    throw new Error(result.error || 'Failed to disable tool');
  }

  // Update database
  await prisma.organizationToolConfig.update({
    where: {
      organizationId_toolId: { organizationId, toolId },
    },
    data: {
      enabled: false,
      disabledAt: new Date(),
    },
  });

  revalidatePath('/tools');
  return { success: true };
}

/**
 * Update tool configuration
 */
export async function updateToolConfiguration(
  data: z.infer<typeof UpdateToolConfigSchema>
) {
  const validated = UpdateToolConfigSchema.parse(data);
  const { organizationId, toolId, industry, settings } = validated;

  // Get current user and verify permissions
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Get the tool
  const tool = await getToolById(toolId, industry);
  if (!tool) {
    throw new Error('Tool not found');
  }

  // Run lifecycle hook
  const result = await configureToolLifecycle({
    tool,
    organizationId,
    settings,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to configure tool');
  }

  // Update database
  await prisma.organizationToolConfig.update({
    where: {
      organizationId_toolId: { organizationId, toolId },
    },
    data: { settings },
  });

  revalidatePath(`/tools/${industry}/${toolId}`);
  return { success: true };
}
```

**3. `lib/modules/tools/queries.ts`**
```typescript
import { prisma } from '@/lib/prisma';
import { getToolById, getAllTools } from '@/lib/tools';
import type { OrganizationToolConfig } from '@prisma/client';
import type { ToolWithIndustry } from '@/lib/tools';

/**
 * Get all enabled tools for an organization
 */
export async function getEnabledTools(
  organizationId: string
): Promise<Array<ToolWithIndustry & { config: OrganizationToolConfig }>> {
  const configs = await prisma.organizationToolConfig.findMany({
    where: { organizationId, enabled: true },
  });

  const tools = await Promise.all(
    configs.map(async (config) => {
      const tool = await getToolById(config.toolId, config.industry);
      if (!tool) return null;
      return { ...tool, industry: config.industry, config };
    })
  );

  return tools.filter((t): t is NonNullable<typeof t> => t !== null);
}

/**
 * Get tool configuration for an organization
 */
export async function getToolConfig(
  organizationId: string,
  toolId: string
): Promise<OrganizationToolConfig | null> {
  return await prisma.organizationToolConfig.findUnique({
    where: {
      organizationId_toolId: { organizationId, toolId },
    },
  });
}

/**
 * Get all available tools with their enabled status
 */
export async function getAvailableTools(organizationId: string): Promise<
  Array<
    ToolWithIndustry & {
      enabled: boolean;
      config?: OrganizationToolConfig;
    }
  >
> {
  const allTools = await getAllTools();
  const configs = await prisma.organizationToolConfig.findMany({
    where: { organizationId },
  });

  const configMap = new Map(configs.map((c) => [c.toolId, c]));

  return allTools.map((tool) => {
    const config = configMap.get(tool.metadata.id);
    return {
      ...tool,
      enabled: config?.enabled || false,
      config,
    };
  });
}

/**
 * Check if a tool is enabled for an organization
 */
export async function isToolEnabled(
  organizationId: string,
  toolId: string
): Promise<boolean> {
  const config = await prisma.organizationToolConfig.findUnique({
    where: {
      organizationId_toolId: { organizationId, toolId },
    },
  });

  return config?.enabled || false;
}
```

**4. `lib/modules/tools/index.ts`**
```typescript
// Re-export everything for convenient imports
export * from './actions';
export * from './queries';
export * from './schemas';
```

---

### Task 2.2: Migrate Hardcoded Tools
**Priority:** HIGH
**Estimated Time:** 2 hours

#### Tools to Migrate from `app/(platform)/tools/page.tsx`:

1. **ROI Calculator** → `lib/tools/shared/roi-calculator/`
2. **Invoice Generator** → `lib/tools/shared/invoice-generator/`
3. **Email Templates** → `lib/tools/shared/email-templates/`
4. **Meeting Scheduler** → `lib/tools/shared/meeting-scheduler/`
5. **Link Shortener** → `lib/tools/shared/link-shortener/`
6. **QR Generator** → `lib/tools/shared/qr-generator/`
7. **Image Optimizer** → `lib/tools/shared/image-optimizer/`
8. **Data Export** → `lib/tools/shared/data-export/`
9. **Time Tracker** → `lib/tools/shared/time-tracker/`
10. **Analytics Dashboard** → `lib/tools/shared/analytics-dashboard/`

#### For Each Tool, Create:

```
lib/tools/shared/{tool-name}/
├── index.ts           # Tool definition
├── types.ts           # TypeScript types
├── schemas.ts         # Zod schemas
└── config.ts          # Settings (if needed)
```

#### Example: ROI Calculator

**`lib/tools/shared/roi-calculator/index.ts`:**
```typescript
import type { Tool } from '../../types';

export const tool: Tool = {
  metadata: {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Calculate return on investment',
    icon: 'Calculator',
    industry: 'shared',
    category: 'financial',
    tier: 'BASIC',
    implementation: 'nextjs',
    basePrice: 0,
    requiredTier: 'BASIC',
    version: '1.0.0',
    status: 'coming-soon',
    tags: ['roi', 'finance', 'calculator'],
  },
};
```

#### Update `registry/loaders.ts`:
```typescript
export async function loadSharedTools(): Promise<Record<string, Tool>> {
  const { tool as crmBasic } = await import('../shared/crm-basic');
  const { tool as roiCalculator } = await import('../shared/roi-calculator');
  const { tool as invoiceGenerator } = await import('../shared/invoice-generator');
  // ... import all 10 tools

  return {
    'crm-basic': crmBasic,
    'roi-calculator': roiCalculator,
    'invoice-generator': invoiceGenerator,
    // ... register all tools
  };
}
```

---

## 📋 Phase 3: UI Implementation

### Task 3.1: Refactor Main Tools Page
**Location:** `app/(platform)/tools/page.tsx`
**Priority:** HIGH
**Estimated Time:** 1 hour

**Replace hardcoded tools with registry:**
```typescript
import { getAllTools } from '@/lib/tools';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getEnabledTools } from '@/lib/modules/tools';
import { ToolGrid } from '@/components/features/tools/ToolGrid';

export default async function ToolsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const userOrg = user.organizationMembers[0];
  if (!userOrg) redirect('/onboarding');

  // Get all available tools
  const allTools = await getAllTools();

  // Get enabled tools for this org
  const enabledTools = await getEnabledTools(userOrg.organizationId);
  const enabledToolIds = new Set(enabledTools.map(t => t.metadata.id));

  // Filter by user tier
  const userTier = user.subscriptionTier || 'FREE';
  const availableTools = allTools.filter(tool =>
    hasRequiredTier(userTier, tool.metadata.requiredTier || tool.metadata.tier)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Business Tools
          </h1>
          <p className="text-muted-foreground">
            Powerful tools to streamline your workflow
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Your Plan</p>
          <p className="text-2xl font-bold text-primary">{userTier}</p>
          <p className="text-xs text-muted-foreground">
            {enabledTools.length} / {getToolLimit(userTier)} tools enabled
          </p>
        </div>
      </div>

      <ToolGrid
        tools={availableTools}
        enabledToolIds={enabledToolIds}
        organizationId={userOrg.organizationId}
        userTier={userTier}
      />
    </div>
  );
}
```

---

### Task 3.2: Create Dynamic Routes
**Priority:** HIGH
**Estimated Time:** 2 hours

#### 1. Industry Tools Page
**`app/(platform)/tools/[industry]/page.tsx`:**
```typescript
import { notFound, redirect } from 'next/navigation';
import { getToolsByIndustry, INDUSTRY_META } from '@/lib/tools';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getEnabledTools } from '@/lib/modules/tools';
import { ToolGrid } from '@/components/features/tools/ToolGrid';

export async function generateStaticParams() {
  return Object.keys(INDUSTRY_META).map(industry => ({
    industry,
  }));
}

export default async function IndustryToolsPage({
  params,
}: {
  params: { industry: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const userOrg = user.organizationMembers[0];
  if (!userOrg) redirect('/onboarding');

  // Validate industry
  if (!INDUSTRY_META[params.industry as Industry]) {
    notFound();
  }

  const tools = await getToolsByIndustry(params.industry as Industry);
  const enabledTools = await getEnabledTools(userOrg.organizationId);
  const enabledToolIds = new Set(enabledTools.map(t => t.metadata.id));

  const industryInfo = INDUSTRY_META[params.industry as Industry];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{industryInfo.name} Tools</h1>
        <p className="text-muted-foreground">{industryInfo.description}</p>
      </div>

      <ToolGrid
        tools={tools.map(t => ({ ...t, industry: params.industry }))}
        enabledToolIds={enabledToolIds}
        organizationId={userOrg.organizationId}
        userTier={user.subscriptionTier || 'FREE'}
      />
    </div>
  );
}
```

#### 2. Tool Detail Page
**`app/(platform)/tools/[industry]/[toolId]/page.tsx`:**
```typescript
import { notFound, redirect } from 'next/navigation';
import { getToolById } from '@/lib/tools';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getToolConfig } from '@/lib/modules/tools';
import { ToolDetail } from '@/components/features/tools/ToolDetail';

export default async function ToolDetailPage({
  params,
}: {
  params: { industry: string; toolId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const userOrg = user.organizationMembers[0];
  if (!userOrg) redirect('/onboarding');

  const tool = await getToolById(params.toolId, params.industry as Industry);
  if (!tool) notFound();

  const config = await getToolConfig(userOrg.organizationId, params.toolId);

  return (
    <ToolDetail
      tool={{ ...tool, industry: params.industry as Industry }}
      config={config}
      organizationId={userOrg.organizationId}
      userTier={user.subscriptionTier || 'FREE'}
    />
  );
}
```

---

### Task 3.3: Create UI Components
**Priority:** HIGH
**Estimated Time:** 2 hours

#### Create: `components/features/tools/ToolGrid.tsx`
```typescript
'use client';

import { ToolCard } from './ToolCard';
import type { ToolWithIndustry, ToolTier } from '@/lib/tools';

interface ToolGridProps {
  tools: ToolWithIndustry[];
  enabledToolIds: Set<string>;
  organizationId: string;
  userTier: ToolTier;
}

export function ToolGrid({
  tools,
  enabledToolIds,
  organizationId,
  userTier,
}: ToolGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.metadata.id}
          tool={tool}
          enabled={enabledToolIds.has(tool.metadata.id)}
          organizationId={organizationId}
          userTier={userTier}
        />
      ))}
    </div>
  );
}
```

#### Create: `components/features/tools/ToolCard.tsx`
```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { hasRequiredTier, formatPrice } from '@/lib/tools';
import type { ToolWithIndustry, ToolTier } from '@/lib/tools';

interface ToolCardProps {
  tool: ToolWithIndustry;
  enabled: boolean;
  organizationId: string;
  userTier: ToolTier;
}

export function ToolCard({ tool, enabled, organizationId, userTier }: ToolCardProps) {
  const hasAccess = hasRequiredTier(
    userTier,
    tool.metadata.requiredTier || tool.metadata.tier
  );

  const Icon = require('lucide-react')[tool.metadata.icon];

  return (
    <Card className={!hasAccess ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Enabled' : tool.metadata.status}
            </Badge>
            {tool.metadata.basePrice > 0 && (
              <Badge variant="outline">
                {formatPrice(tool.metadata.basePrice)}/mo
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{tool.metadata.name}</CardTitle>
        <CardDescription>{tool.metadata.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {tool.metadata.category}
          </Badge>
          {hasAccess ? (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/tools/${tool.industry}/${tool.metadata.id}`}>
                {enabled ? 'Manage' : 'View'}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Create: `components/features/tools/ToolDetail.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { enableToolForOrganization, disableToolForOrganization } from '@/lib/modules/tools';
import { hasRequiredTier } from '@/lib/tools';
import type { ToolWithIndustry, ToolTier, OrganizationToolConfig } from '@/lib/tools';

interface ToolDetailProps {
  tool: ToolWithIndustry;
  config: OrganizationToolConfig | null;
  organizationId: string;
  userTier: ToolTier;
}

export function ToolDetail({ tool, config, organizationId, userTier }: ToolDetailProps) {
  const [loading, setLoading] = useState(false);
  const enabled = config?.enabled || false;

  const hasAccess = hasRequiredTier(
    userTier,
    tool.metadata.requiredTier || tool.metadata.tier
  );

  async function handleToggle() {
    setLoading(true);
    try {
      if (enabled) {
        await disableToolForOrganization({
          organizationId,
          toolId: tool.metadata.id,
          industry: tool.industry,
        });
      } else {
        await enableToolForOrganization({
          organizationId,
          toolId: tool.metadata.id,
          industry: tool.industry,
        });
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to toggle tool');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{tool.metadata.name}</CardTitle>
              <CardDescription>{tool.metadata.description}</CardDescription>
            </div>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tool.metadata.longDescription && (
            <p className="text-sm text-muted-foreground">
              {tool.metadata.longDescription}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleToggle}
              disabled={loading || !hasAccess}
            >
              {loading ? 'Loading...' : enabled ? 'Disable Tool' : 'Enable Tool'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📋 Phase 4: Testing & Quality

### Task 4.1: Write Tests
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours

#### Test Files to Create:

**1. `__tests__/lib/tools/registry.test.ts`:**
```typescript
import { describe, it, expect } from '@jest/globals';
import {
  getToolsByIndustry,
  findToolById,
  filterTools,
  sortTools,
  searchTools,
  validateToolDependencies,
} from '@/lib/tools/registry';

describe('Tool Registry', () => {
  describe('getToolsByIndustry', () => {
    it('should load shared tools', async () => {
      const tools = await getToolsByIndustry('shared');
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should return empty array for industry with no tools', async () => {
      const tools = await getToolsByIndustry('construction');
      expect(tools).toEqual([]);
    });
  });

  describe('findToolById', () => {
    it('should find crm-basic tool', async () => {
      const tool = await findToolById('crm-basic');
      expect(tool).toBeDefined();
      expect(tool?.metadata.id).toBe('crm-basic');
      expect(tool?.industry).toBe('shared');
    });

    it('should return undefined for non-existent tool', async () => {
      const tool = await findToolById('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('filterTools', () => {
    it('should filter by industry', async () => {
      const allTools = await getAllTools();
      const filtered = filterTools(allTools, { industry: 'shared' });
      expect(filtered.every(t => t.industry === 'shared')).toBe(true);
    });

    it('should filter by tier', async () => {
      const allTools = await getAllTools();
      const filtered = filterTools(allTools, { tier: 'FREE' });
      expect(filtered.every(t => t.metadata.tier === 'FREE')).toBe(true);
    });

    it('should search by query', async () => {
      const allTools = await getAllTools();
      const filtered = filterTools(allTools, { searchQuery: 'crm' });
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('sortTools', () => {
    it('should sort by name ascending', async () => {
      const allTools = await getAllTools();
      const sorted = sortTools(allTools, 'name', 'asc');
      const names = sorted.map(t => t.metadata.name);
      expect(names).toEqual([...names].sort());
    });

    it('should sort by price descending', async () => {
      const allTools = await getAllTools();
      const sorted = sortTools(allTools, 'price', 'desc');
      const prices = sorted.map(t => t.metadata.basePrice);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i - 1]).toBeGreaterThanOrEqual(prices[i]);
      }
    });
  });
});
```

**2. `__tests__/lib/tools/manager.test.ts`:**
```typescript
import { describe, it, expect } from '@jest/globals';
import {
  checkToolAccess,
  validateToolSettings,
  getDefaultToolSettings,
} from '@/lib/tools/manager';
import { getToolById } from '@/lib/tools/registry';

describe('Tool Manager', () => {
  describe('checkToolAccess', () => {
    it('should grant access when tier is sufficient', async () => {
      const result = await checkToolAccess({
        toolId: 'crm-basic',
        industry: 'shared',
        userTier: 'BASIC',
        enabledToolsCount: 0,
      });
      expect(result.hasAccess).toBe(true);
    });

    it('should deny access when tier is insufficient', async () => {
      const result = await checkToolAccess({
        toolId: 'roi-calculator', // Requires BASIC
        industry: 'shared',
        userTier: 'FREE',
        enabledToolsCount: 0,
      });
      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('tier-required');
    });

    it('should deny access when tool limit reached', async () => {
      const result = await checkToolAccess({
        toolId: 'crm-basic',
        industry: 'shared',
        userTier: 'BASIC',
        enabledToolsCount: 3, // BASIC allows 3 tools
      });
      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('limit-reached');
    });
  });

  describe('validateToolSettings', () => {
    it('should validate correct settings', async () => {
      const tool = await getToolById('crm-basic', 'shared');
      expect(tool).toBeDefined();

      const result = validateToolSettings(tool!, {
        autoAssignLeads: true,
        leadScoring: false,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid settings', async () => {
      const tool = await getToolById('crm-basic', 'shared');
      expect(tool).toBeDefined();

      const result = validateToolSettings(tool!, {
        autoAssignLeads: 'invalid', // Should be boolean
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
```

**3. `__tests__/lib/modules/tools/actions.test.ts`:**
```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  enableToolForOrganization,
  disableToolForOrganization,
  updateToolConfiguration,
} from '@/lib/modules/tools/actions';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/prisma');

describe('Tool Actions', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('enableToolForOrganization', () => {
    it('should enable a tool successfully', async () => {
      // Mock user
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-1',
        subscriptionTier: 'BASIC',
        organizationMembers: [{ organizationId: 'org-1' }],
      });

      // Mock Prisma
      (prisma.organizationToolConfig.count as jest.Mock).mockResolvedValue(0);
      (prisma.organizationToolConfig.upsert as jest.Mock).mockResolvedValue({
        id: 'config-1',
      });

      const result = await enableToolForOrganization({
        organizationId: 'org-1',
        toolId: 'crm-basic',
        industry: 'shared',
      });

      expect(result.success).toBe(true);
    });

    it('should reject when access is denied', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-1',
        subscriptionTier: 'FREE',
        organizationMembers: [{ organizationId: 'org-1' }],
      });

      await expect(
        enableToolForOrganization({
          organizationId: 'org-1',
          toolId: 'roi-calculator', // Requires BASIC
          industry: 'shared',
        })
      ).rejects.toThrow('Access denied');
    });
  });
});
```

---

### Task 4.2: Run Quality Checks
**Priority:** CRITICAL
**Estimated Time:** 30 minutes

```bash
# 1. Lint check
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Run tests with coverage
npm test -- --coverage

# 4. Build check
npm run build
```

**Required Pass Criteria:**
- ✅ Zero lint errors
- ✅ Zero TypeScript errors
- ✅ 80%+ test coverage
- ✅ Build succeeds

---

### Task 4.3: Database Migration
**Priority:** HIGH
**Estimated Time:** 15 minutes

```bash
# Connect to database and run migration
cd app
npx prisma migrate dev --name add_tool_management_tables

# Verify tables
npx prisma studio
```

**Verify:**
- ✅ `organization_tool_configs` table created
- ✅ Indexes created
- ✅ Relation to `organizations` works

---

## 📋 Phase 5: Documentation

### Task 5.1: Create Architecture Documentation
**Priority:** MEDIUM
**Estimated Time:** 1 hour

**Create: `docs/architecture/tool-system.md`:**
- Architecture overview
- Design decisions
- How to create new tools
- Registry patterns
- Testing guidelines

**Create: `docs/api/tools-api.md`:**
- API reference for all exported functions
- Usage examples
- Type definitions
- Common patterns

---

## ✅ Session 2 Completion Checklist

### Phase 2: Data Layer
- [ ] Create `lib/modules/tools/schemas.ts`
- [ ] Create `lib/modules/tools/actions.ts`
- [ ] Create `lib/modules/tools/queries.ts`
- [ ] Create `lib/modules/tools/index.ts`
- [ ] Migrate all 10 hardcoded tools
- [ ] Update `registry/loaders.ts` with all tools
- [ ] Test Server Actions work

### Phase 3: UI
- [ ] Refactor main tools page
- [ ] Create industry tools page
- [ ] Create tool detail page
- [ ] Create ToolGrid component
- [ ] Create ToolCard component
- [ ] Create ToolDetail component
- [ ] Test all pages render correctly

### Phase 4: Testing
- [ ] Write registry tests
- [ ] Write manager tests
- [ ] Write action tests
- [ ] Achieve 80%+ coverage
- [ ] Pass lint checks
- [ ] Pass type checks
- [ ] Pass build
- [ ] Run database migration

### Phase 5: Documentation
- [ ] Create architecture docs
- [ ] Create API reference
- [ ] Update README if needed
- [ ] Add inline JSDoc where missing

---

## 🚀 Quick Start Commands

```bash
# Create module structure
mkdir -p app/lib/modules/tools

# Create component structure
mkdir -p app/components/features/tools

# Create test structure
mkdir -p app/__tests__/lib/tools
mkdir -p app/__tests__/lib/modules/tools

# Run tests
npm test -- --watch

# Check coverage
npm test -- --coverage

# Run all quality checks
npm run lint && npx tsc --noEmit && npm test && npm run build
```

---

## 📊 Success Metrics

**Must Achieve:**
- ✅ All 10 tools migrated and working
- ✅ 80%+ test coverage
- ✅ Zero lint/type errors
- ✅ Build succeeds
- ✅ All pages accessible
- ✅ Enable/disable functionality works

**Nice to Have:**
- ✅ 90%+ test coverage
- ✅ Performance benchmarks
- ✅ E2E tests
- ✅ Comprehensive documentation

---

## 🔗 References

- [Session 1 Summary](./session1_summary.md)
- [Tools Guide](./tools-guide.md)
- [CLAUDE.md](../../../CLAUDE.md)
- [Prisma Schema](../../../app/prisma/schema.prisma)

---

**Ready to Execute!**
*Estimated Total Time: 8-11 hours*
*All prerequisites met ✅*
