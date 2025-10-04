# Session 2: Leads Module - Backend & API

## Session Overview
**Goal:** Implement the complete backend infrastructure for the Leads module including schemas, queries, server actions, and RBAC permissions.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1 (Database Foundation)

## Objectives

1. ✅ Create leads module structure (schemas, queries, actions)
2. ✅ Implement Zod validation schemas for leads
3. ✅ Create data query functions with proper filtering
4. ✅ Implement Server Actions for CRUD operations
5. ✅ Add RBAC permissions for leads access
6. ✅ Create API routes for leads data
7. ✅ Add comprehensive error handling
8. ✅ Write unit tests for module

## Prerequisites

- [x] Session 1 completed (database schema in place)
- [x] leads table exists with RLS policies
- [x] Platform auth system functional
- [x] Understanding of module architecture

## Module Structure

```
lib/modules/leads/
├── index.ts           # Public API exports
├── schemas.ts         # Zod validation schemas
├── queries.ts         # Data fetching functions
├── actions.ts         # Server Actions (mutations)
└── types.ts           # TypeScript type definitions
```

## Step-by-Step Implementation

### Step 1: Create Module Directory

```bash
mkdir -p "(platform)/lib/modules/leads"
```

### Step 2: Create Validation Schemas

**File:** `lib/modules/leads/schemas.ts`

```typescript
import { z } from 'zod';
import { LeadSource, LeadStatus, LeadScore } from '@prisma/client';

/**
 * Lead Creation Schema
 *
 * Validates all input when creating a new lead
 * Multi-tenant: organizationId required
 */
export const createLeadSchema = z.object({
  // Required fields
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  // Contact info (optional but recommended)
  email: z.union([
    z.string().email('Invalid email address'),
    z.literal('')
  ]).optional().transform(val => val === '' ? undefined : val),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),

  // Lead classification
  source: z.nativeEnum(LeadSource).default('WEBSITE'),
  status: z.nativeEnum(LeadStatus).default('NEW_LEAD'),
  score: z.nativeEnum(LeadScore).default('COLD'),
  score_value: z.number().int().min(0).max(100).default(0),

  // Lead details
  budget: z.number().positive().optional(),
  timeline: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.any()).optional(),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Lead Update Schema
 * All fields optional except ID
 */
export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Lead Filters Schema
 * For querying/filtering leads
 */
export const leadFiltersSchema = z.object({
  // Status filters
  status: z.union([
    z.nativeEnum(LeadStatus),
    z.array(z.nativeEnum(LeadStatus))
  ]).optional(),

  // Source filters
  source: z.union([
    z.nativeEnum(LeadSource),
    z.array(z.nativeEnum(LeadSource))
  ]).optional(),

  // Score filters
  score: z.union([
    z.nativeEnum(LeadScore),
    z.array(z.nativeEnum(LeadScore))
  ]).optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Tags filter
  tags: z.array(z.string()).optional(),

  // Date range filters
  created_from: z.coerce.date().optional(),
  created_to: z.coerce.date().optional(),
  last_contact_from: z.coerce.date().optional(),
  last_contact_to: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'name', 'score_value', 'last_contact_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Lead Score Update Schema
 * For updating lead score
 */
export const updateLeadScoreSchema = z.object({
  id: z.string().uuid(),
  score: z.nativeEnum(LeadScore),
  score_value: z.number().int().min(0).max(100),
});

/**
 * Lead Status Update Schema
 * For pipeline stage changes
 */
export const updateLeadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(LeadStatus),
  notes: z.string().max(1000).optional(), // Optional note about status change
});

/**
 * Bulk Lead Assignment Schema
 * For assigning multiple leads to an agent
 */
export const bulkAssignLeadsSchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1).max(100),
  assigned_to_id: z.string().uuid(),
});

// Export types
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
export type UpdateLeadScoreInput = z.infer<typeof updateLeadScoreSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type BulkAssignLeadsInput = z.infer<typeof bulkAssignLeadsSchema>;
```

### Step 3: Create Data Query Functions

**File:** `lib/modules/leads/queries.ts`

```typescript
import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { leads, Prisma } from '@prisma/client';
import type { LeadFilters } from './schemas';

/**
 * Leads Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 * No need to manually pass organizationId - it's injected automatically
 *
 * @see lib/database/prisma-middleware.ts
 */

type LeadWithAssignee = Prisma.leadsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;

type LeadWithDetails = Prisma.leadsGetPayload<{
  include: {
    assigned_to: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    activities: {
      include: {
        created_by: {
          select: { id: true; name: true; avatar_url: true };
        };
      };
      orderBy: { created_at: 'desc' };
    };
    deals: {
      include: {
        assigned_to: {
          select: { id: true; name: true };
        };
      };
    };
  };
}>;

/**
 * Get leads with filters
 *
 * Automatically filtered by current user's organization
 *
 * @param filters - Optional filters
 * @returns List of leads
 *
 * @example
 * ```typescript
 * const leads = await getLeads({ status: 'NEW_LEAD', limit: 50 });
 * ```
 */
export async function getLeads(
  filters?: LeadFilters
): Promise<LeadWithAssignee[]> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.leadsWhereInput = {};

      // Status filter (single or array)
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      // Source filter (single or array)
      if (filters?.source) {
        where.source = Array.isArray(filters.source)
          ? { in: filters.source }
          : filters.source;
      }

      // Score filter (single or array)
      if (filters?.score) {
        where.score = Array.isArray(filters.score)
          ? { in: filters.score }
          : filters.score;
      }

      // Assignment filter
      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }

      // Search across name, email, company, phone
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Tags filter (has any of the provided tags)
      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      // Date range filters
      if (filters?.created_from || filters?.created_to) {
        where.created_at = {};
        if (filters.created_from) {
          where.created_at.gte = filters.created_from;
        }
        if (filters.created_to) {
          where.created_at.lte = filters.created_to;
        }
      }

      if (filters?.last_contact_from || filters?.last_contact_to) {
        where.last_contact_at = {};
        if (filters.last_contact_from) {
          where.last_contact_at.gte = filters.last_contact_from;
        }
        if (filters.last_contact_to) {
          where.last_contact_at.lte = filters.last_contact_to;
        }
      }

      // Sorting
      const orderBy: Prisma.leadsOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        orderBy.created_at = 'desc'; // Default sort
      }

      return await prisma.leads.findMany({
        where,
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
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeads failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead count with filters
 *
 * @param filters - Optional filters
 * @returns Count of leads
 */
export async function getLeadsCount(filters?: LeadFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.leadsWhereInput = {};

      // Apply same filters as getLeads (simplified)
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters?.source) {
        where.source = Array.isArray(filters.source)
          ? { in: filters.source }
          : filters.source;
      }

      if (filters?.score) {
        where.score = Array.isArray(filters.score)
          ? { in: filters.score }
          : filters.score;
      }

      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      return await prisma.leads.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadsCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead by ID with full details
 *
 * @param leadId - Lead ID
 * @returns Lead with details or null
 */
export async function getLeadById(
  leadId: string
): Promise<LeadWithDetails | null> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findFirst({
        where: { id: leadId },
        include: {
          assigned_to: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          activities: {
            include: {
              created_by: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
            },
            orderBy: { created_at: 'desc' },
            take: 50, // Limit activities
          },
          deals: {
            include: {
              assigned_to: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get lead statistics
 *
 * @returns Lead stats by status and score
 */
export async function getLeadStats() {
  return withTenantContext(async () => {
    try {
      const [
        totalLeads,
        newLeads,
        qualifiedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
      ] = await Promise.all([
        prisma.leads.count(),
        prisma.leads.count({ where: { status: 'NEW_LEAD' } }),
        prisma.leads.count({ where: { status: 'QUALIFIED' } }),
        prisma.leads.count({ where: { score: 'HOT' } }),
        prisma.leads.count({ where: { score: 'WARM' } }),
        prisma.leads.count({ where: { score: 'COLD' } }),
      ]);

      return {
        totalLeads,
        newLeads,
        qualifiedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Search leads by name, email, company
 *
 * @param query - Search query
 * @param limit - Max results
 * @returns Matching leads
 */
export async function searchLeads(
  query: string,
  limit = 10
): Promise<leads[]> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] searchLeads failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get leads assigned to a user
 *
 * @param userId - User ID
 * @returns Leads assigned to user
 */
export async function getLeadsByAssignee(
  userId: string
): Promise<LeadWithAssignee[]> {
  return withTenantContext(async () => {
    try {
      return await prisma.leads.findMany({
        where: { assigned_to_id: userId },
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
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Queries] getLeadsByAssignee failed:', dbError);
      throw error;
    }
  });
}
```

### Step 4: Create Server Actions

**File:** `lib/modules/leads/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessCRM, canManageLeads } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadScoreSchema,
  updateLeadStatusSchema,
  bulkAssignLeadsSchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type UpdateLeadScoreInput,
  type UpdateLeadStatusInput,
  type BulkAssignLeadsInput,
} from './schemas';

/**
 * Create a new lead
 *
 * RBAC: Requires CRM access + lead creation permission
 *
 * @param input - Lead data
 * @returns Created lead
 */
export async function createLead(input: CreateLeadInput) {
  const session = await requireAuth();

  // Check RBAC permissions
  if (!canAccessCRM(session.user) || !canManageLeads(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions to create leads');
  }

  // Validate input
  const validated = createLeadSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.create({
        data: {
          ...validated,
          organization_id: session.user.organizationId,
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

      // Revalidate leads page
      revalidatePath('/crm/leads');
      revalidatePath('/crm/dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] createLead failed:', dbError);
      throw new Error('Failed to create lead');
    }
  });
}

/**
 * Update an existing lead
 *
 * @param input - Updated lead data
 * @returns Updated lead
 */
export async function updateLead(input: UpdateLeadInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user) || !canManageLeads(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions to update leads');
  }

  const validated = updateLeadSchema.parse(input);
  const { id, ...updateData } = validated;

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id },
        data: updateData,
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

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${id}`);
      revalidatePath('/crm/dashboard');

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] updateLead failed:', dbError);
      throw new Error('Failed to update lead');
    }
  });
}

/**
 * Delete a lead
 *
 * @param leadId - Lead ID
 */
export async function deleteLead(leadId: string) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user) || !canManageLeads(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions to delete leads');
  }

  return withTenantContext(async () => {
    try {
      await prisma.leads.delete({
        where: { id: leadId },
      });

      revalidatePath('/crm/leads');
      revalidatePath('/crm/dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] deleteLead failed:', dbError);
      throw new Error('Failed to delete lead');
    }
  });
}

/**
 * Update lead score
 *
 * @param input - Lead ID and new score
 */
export async function updateLeadScore(input: UpdateLeadScoreInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  const validated = updateLeadScoreSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id: validated.id },
        data: {
          score: validated.score,
          score_value: validated.score_value,
        },
      });

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${validated.id}`);

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] updateLeadScore failed:', dbError);
      throw new Error('Failed to update lead score');
    }
  });
}

/**
 * Update lead status
 *
 * @param input - Lead ID and new status
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  const validated = updateLeadStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const lead = await prisma.leads.update({
        where: { id: validated.id },
        data: {
          status: validated.status,
          // Optionally log status change as an activity
        },
      });

      // If status changed to CONVERTED, could trigger deal creation here

      revalidatePath('/crm/leads');
      revalidatePath(`/crm/leads/${validated.id}`);

      return lead;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] updateLeadStatus failed:', dbError);
      throw new Error('Failed to update lead status');
    }
  });
}

/**
 * Bulk assign leads to an agent
 *
 * @param input - Lead IDs and assignee ID
 */
export async function bulkAssignLeads(input: BulkAssignLeadsInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user) || !canManageLeads(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  const validated = bulkAssignLeadsSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const result = await prisma.leads.updateMany({
        where: {
          id: { in: validated.lead_ids },
        },
        data: {
          assigned_to_id: validated.assigned_to_id,
        },
      });

      revalidatePath('/crm/leads');

      return { count: result.count };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] bulkAssignLeads failed:', dbError);
      throw new Error('Failed to assign leads');
    }
  });
}

/**
 * Convert lead to contact/customer
 *
 * @param leadId - Lead ID
 */
export async function convertLead(leadId: string) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user) || !canManageLeads(session.user)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  return withTenantContext(async () => {
    try {
      // Get lead data
      const lead = await prisma.leads.findFirst({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Create contact from lead
      const contact = await prisma.contacts.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          type: 'CLIENT',
          status: 'ACTIVE',
          notes: lead.notes,
          tags: lead.tags,
          organization_id: lead.organization_id,
          assigned_to_id: lead.assigned_to_id,
        },
      });

      // Update lead status
      await prisma.leads.update({
        where: { id: leadId },
        data: { status: 'CONVERTED' },
      });

      revalidatePath('/crm/leads');
      revalidatePath('/crm/contacts');
      revalidatePath('/crm/dashboard');

      return { contact };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Leads Actions] convertLead failed:', dbError);
      throw new Error('Failed to convert lead');
    }
  });
}
```

### Step 5: Create Public API (index.ts)

**File:** `lib/modules/leads/index.ts`

```typescript
// Export public API
export {
  createLead,
  updateLead,
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  bulkAssignLeads,
  convertLead,
} from './actions';

export {
  getLeads,
  getLeadsCount,
  getLeadById,
  getLeadStats,
  searchLeads,
  getLeadsByAssignee,
} from './queries';

export {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
  updateLeadScoreSchema,
  updateLeadStatusSchema,
  bulkAssignLeadsSchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadFilters,
  type UpdateLeadScoreInput,
  type UpdateLeadStatusInput,
  type BulkAssignLeadsInput,
} from './schemas';

// Re-export Prisma types
export type { leads as Lead } from '@prisma/client';
```

### Step 6: Add RBAC Permissions

**File:** `lib/auth/rbac.ts` (add to existing file)

```typescript
// Add to existing RBAC file

export const CRM_PERMISSIONS = {
  CRM_ACCESS: 'crm:access',
  LEADS_VIEW: 'crm:leads:view',
  LEADS_CREATE: 'crm:leads:create',
  LEADS_EDIT: 'crm:leads:edit',
  LEADS_DELETE: 'crm:leads:delete',
  LEADS_ASSIGN: 'crm:leads:assign',
} as const;

/**
 * Check if user can access CRM module
 */
export function canAccessCRM(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

/**
 * Check if user can manage leads
 */
export function canManageLeads(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const canManage = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && canManage;
}

/**
 * Check if user can delete leads
 */
export function canDeleteLeads(user: any): boolean {
  return ['ADMIN', 'MODERATOR'].includes(user.globalRole) &&
         ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

### Step 7: Create API Routes (Optional)

**File:** `app/api/v1/leads/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getLeads, getLeadsCount } from '@/lib/modules/leads';
import { leadFiltersSchema } from '@/lib/modules/leads/schemas';
import { canAccessCRM } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canAccessCRM(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const filters = leadFiltersSchema.parse({
      status: searchParams.get('status'),
      source: searchParams.get('source'),
      score: searchParams.get('score'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    const [leads, total] = await Promise.all([
      getLeads(filters),
      getLeadsCount(filters),
    ]);

    return NextResponse.json({ leads, total, filters });
  } catch (error) {
    console.error('[API] GET /api/v1/leads failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
```

## Testing & Validation

### Test 1: Module Imports
```typescript
// Test that module can be imported
import { getLeads, createLead } from '@/lib/modules/leads';
```

### Test 2: Schema Validation
```typescript
import { createLeadSchema } from '@/lib/modules/leads/schemas';

// Should pass
const valid = createLeadSchema.parse({
  name: 'John Doe',
  email: 'john@example.com',
  organization_id: 'uuid-here',
});

// Should fail
try {
  const invalid = createLeadSchema.parse({
    name: 'J', // Too short
    email: 'invalid-email',
  });
} catch (error) {
  console.log('Validation failed as expected');
}
```

### Test 3: Create Lead Action
```typescript
// Test creating a lead
const lead = await createLead({
  name: 'Test Lead',
  email: 'test@example.com',
  phone: '555-1234',
  source: 'WEBSITE',
  status: 'NEW_LEAD',
  score: 'WARM',
  organization_id: session.user.organizationId,
});

console.log('Lead created:', lead.id);
```

### Test 4: Query Leads
```typescript
// Test querying leads
const leads = await getLeads({
  status: 'NEW_LEAD',
  limit: 10,
});

console.log('Found leads:', leads.length);
```

## Success Criteria

- [x] Leads module structure created
- [x] All schemas defined with proper validation
- [x] All query functions implemented with proper typing
- [x] All Server Actions implemented with RBAC checks
- [x] Multi-tenancy enforced on all queries
- [x] Error handling in place
- [x] Public API exported via index.ts
- [x] RBAC permissions added
- [x] Path revalidation on mutations
- [x] Module can be imported and used
- [x] All functions properly typed

## Files Created

- ✅ `lib/modules/leads/index.ts`
- ✅ `lib/modules/leads/schemas.ts`
- ✅ `lib/modules/leads/queries.ts`
- ✅ `lib/modules/leads/actions.ts`
- ✅ `app/api/v1/leads/route.ts` (optional)

## Files Modified

- ✅ `lib/auth/rbac.ts` - Added CRM permissions

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing RBAC Checks
**Problem:** Server Actions without permission checks
**Solution:** ALWAYS call requireAuth() and check canAccessCRM() at the start of every action

### ❌ Pitfall 2: Not Using withTenantContext
**Problem:** Data leaks between organizations
**Solution:** Wrap all database operations in withTenantContext()

### ❌ Pitfall 3: Forgetting Revalidation
**Problem:** Stale data in UI after mutations
**Solution:** Call revalidatePath() after every mutation

### ❌ Pitfall 4: Missing Error Handling
**Problem:** Unhandled database errors crash the app
**Solution:** Use try/catch with handleDatabaseError()

### ❌ Pitfall 5: Exposing Server-Only Code
**Problem:** Client components import server-only code
**Solution:** Add 'server-only' import at top of queries.ts

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Leads Module - UI Components & Pages**
2. ✅ Backend is ready for UI integration
3. ✅ Can start building lead management pages
4. ✅ Data layer complete and tested

---

**Session 2 Complete:** ✅ Leads module backend fully implemented
