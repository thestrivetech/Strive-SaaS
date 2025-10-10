'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessCRM } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { contacts, users, activities, deals } from '@prisma/client';

/**
 * Contact with assignee user data
 */
export type ContactWithAssignee = contacts & {
  assigned_to?: Pick<users, 'id' | 'name' | 'email' | 'avatar_url'> | null;
};

/**
 * Contact with full relations for detail view
 */
export type ContactWithRelations = contacts & {
  assigned_to?: Pick<users, 'id' | 'name' | 'email' | 'avatar_url'> | null;
  activities?: (activities & {
    created_by?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
  })[];
  deals?: (deals & {
    assigned_to?: Pick<users, 'id' | 'name' | 'avatar_url'> | null;
  })[];
};

/**
 * Get contacts with filtering, sorting, and pagination
 *
 * @param filters - Filter criteria
 * @returns Contacts array
 */
export async function getContacts(filters?: Partial<ContactFilters>): Promise<ContactWithAssignee[]> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  // Validate filters
  const validatedFilters = filters
    ? contactFiltersSchema.partial().parse(filters)
    : {};

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Build where clause
      const where: any = {
        organization_id: orgId,
      };

      // Type filter
      if (validatedFilters.type) {
        where.type = Array.isArray(validatedFilters.type)
          ? { in: validatedFilters.type }
          : validatedFilters.type;
      }

      // Status filter
      if (validatedFilters.status) {
        where.status = Array.isArray(validatedFilters.status)
          ? { in: validatedFilters.status }
          : validatedFilters.status;
      }

      // Assignment filter
      if (validatedFilters.assigned_to_id) {
        where.assigned_to_id = validatedFilters.assigned_to_id;
      }

      // Tags filter
      if (validatedFilters.tags && validatedFilters.tags.length > 0) {
        where.tags = {
          hasEvery: validatedFilters.tags,
        };
      }

      // Search across multiple fields
      if (validatedFilters.search) {
        where.OR = [
          { name: { contains: validatedFilters.search, mode: 'insensitive' } },
          { email: { contains: validatedFilters.search, mode: 'insensitive' } },
          { company: { contains: validatedFilters.search, mode: 'insensitive' } },
          { position: { contains: validatedFilters.search, mode: 'insensitive' } },
        ];
      }

      // Date filters
      if (validatedFilters.created_from || validatedFilters.created_to) {
        where.created_at = {};
        if (validatedFilters.created_from) {
          where.created_at.gte = validatedFilters.created_from;
        }
        if (validatedFilters.created_to) {
          where.created_at.lte = validatedFilters.created_to;
        }
      }

      if (validatedFilters.last_contact_from || validatedFilters.last_contact_to) {
        where.last_contact_at = {};
        if (validatedFilters.last_contact_from) {
          where.last_contact_at.gte = validatedFilters.last_contact_from;
        }
        if (validatedFilters.last_contact_to) {
          where.last_contact_at.lte = validatedFilters.last_contact_to;
        }
      }

      // Build orderBy
      const orderBy: any = {};
      if (validatedFilters.sort_by) {
        orderBy[validatedFilters.sort_by] = validatedFilters.sort_order || 'desc';
      } else {
        orderBy.created_at = validatedFilters.sort_order || 'desc';
      }

      const contacts = await prisma.contacts.findMany({
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
        take: validatedFilters.limit || 50,
        skip: validatedFilters.offset || 0,
      });

      return contacts;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts:Queries] getContacts failed:', dbError);
      throw new Error(
        `[CRM:Contacts:Queries] Failed to fetch contacts: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Get single contact by ID
 *
 * @param id - Contact ID
 * @returns Contact with basic relations
 */
export async function getContactById(id: string): Promise<ContactWithAssignee | null> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const contact = await prisma.contacts.findFirst({
        where: {
          id,
          organization_id: orgId,
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

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts:Queries] getContactById failed:', dbError);
      throw new Error(
        `[CRM:Contacts:Queries] Failed to fetch contact: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Get contact with full history (activities, deals)
 *
 * @param id - Contact ID
 * @returns Contact with all relations
 */
export async function getContactWithFullHistory(id: string): Promise<ContactWithRelations | null> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const contact = await prisma.contacts.findFirst({
        where: {
          id,
          organization_id: orgId,
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
            orderBy: {
              created_at: 'desc',
            },
            take: 50, // Limit activities to recent 50
          },
          deals: {
            include: {
              assigned_to: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                },
              },
            },
            where: {
              status: {
                in: ['ACTIVE', 'WON'],
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      return contact;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts:Queries] getContactWithFullHistory failed:', dbError);
      throw new Error(
        `[CRM:Contacts:Queries] Failed to fetch contact with history: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Get contact statistics for dashboard
 *
 * @returns Contact stats
 */
export async function getContactStats() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      const [total, active, clients, pastClients] = await Promise.all([
        // Total contacts
        prisma.contacts.count({
          where: {
            organization_id: orgId,
          },
        }),
        // Active contacts
        prisma.contacts.count({
          where: {
            organization_id: orgId,
            status: 'ACTIVE',
          },
        }),
        // Current clients
        prisma.contacts.count({
          where: {
            organization_id: orgId,
            type: 'CLIENT',
          },
        }),
        // Past clients
        prisma.contacts.count({
          where: {
            organization_id: orgId,
            type: 'PAST_CLIENT',
          },
        }),
      ]);

      return {
        total,
        active,
        clients,
        pastClients,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts:Queries] getContactStats failed:', dbError);
      throw new Error(
        `[CRM:Contacts:Queries] Failed to fetch contact statistics: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}

/**
 * Count total contacts for pagination
 *
 * @param filters - Filter criteria
 * @returns Total count
 */
export async function getContactsCount(filters?: Partial<ContactFilters>): Promise<number> {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (!canAccessCRM(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to access CRM');
  }

  const validatedFilters = filters
    ? contactFiltersSchema.partial().parse(filters)
    : {};

  return withTenantContext(async () => {
    try {
      const orgId = user.organization_members[0].organization_id;

      // Build same where clause as getContacts
      const where: any = {
        organization_id: orgId,
      };

      if (validatedFilters.type) {
        where.type = Array.isArray(validatedFilters.type)
          ? { in: validatedFilters.type }
          : validatedFilters.type;
      }

      if (validatedFilters.status) {
        where.status = Array.isArray(validatedFilters.status)
          ? { in: validatedFilters.status }
          : validatedFilters.status;
      }

      if (validatedFilters.assigned_to_id) {
        where.assigned_to_id = validatedFilters.assigned_to_id;
      }

      if (validatedFilters.search) {
        where.OR = [
          { name: { contains: validatedFilters.search, mode: 'insensitive' } },
          { email: { contains: validatedFilters.search, mode: 'insensitive' } },
          { company: { contains: validatedFilters.search, mode: 'insensitive' } },
        ];
      }

      const count = await prisma.contacts.count({ where });
      return count;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[CRM:Contacts:Queries] getContactsCount failed:', dbError);
      throw new Error(
        `[CRM:Contacts:Queries] Failed to count contacts: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
}
