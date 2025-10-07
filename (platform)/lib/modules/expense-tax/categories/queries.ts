'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Expense Categories Queries
 *
 * Data fetching functions for expense category management
 *
 * SECURITY:
 * - All queries require authentication
 * - Multi-tenancy enforced via organizationId
 * - Returns both system and organization-specific categories
 */

/**
 * Get all categories (system + organization-specific)
 */
export async function getCategories() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Get both system categories and organization-specific categories
  const categories = await prisma.expense_categories.findMany({
    where: {
      OR: [
        { organization_id: organizationId },
        { organization_id: null, is_system: true },
      ],
      is_active: true,
    },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });

  return categories;
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const category = await prisma.expense_categories.findFirst({
    where: {
      id,
      OR: [
        { organization_id: organizationId },
        { organization_id: null, is_system: true },
      ],
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
}

/**
 * Get only custom (non-system) categories for organization
 */
export async function getCustomCategories() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const categories = await prisma.expense_categories.findMany({
    where: {
      organization_id: organizationId,
      is_system: false,
      is_active: true,
    },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });

  return categories;
}

/**
 * Get only system categories
 */
export async function getSystemCategories() {
  const categories = await prisma.expense_categories.findMany({
    where: {
      is_system: true,
      is_active: true,
    },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  });

  return categories;
}
