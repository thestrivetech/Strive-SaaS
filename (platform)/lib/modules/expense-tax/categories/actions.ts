'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { CategorySchema, UpdateCategorySchema } from './schemas';
import type { CategoryInput, UpdateCategoryInput } from './schemas';

/**
 * Expense Categories Actions
 *
 * Server Actions for expense category management with RBAC enforcement
 *
 * SECURITY:
 * - All actions require authentication
 * - Multi-tenancy enforced via organizationId
 * - System categories cannot be modified/deleted
 * - Input validation with Zod schemas
 */

/**
 * Create a new custom expense category
 */
export async function createCategory(input: CategoryInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = CategorySchema.parse(input);

  try {
    const category = await prisma.expense_categories.create({
      data: {
        name: validated.name,
        description: validated.description,
        is_deductible: validated.isDeductible,
        tax_code: validated.taxCode,
        is_active: validated.isActive,
        sort_order: validated.sortOrder,
        organization_id: organizationId,
        is_system: false, // Custom categories are never system
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'created_category',
        resource_type: 'expense_category',
        resource_id: category.id,
        new_data: {
          name: category.name,
          isDeductible: category.is_deductible,
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to create category:', error);
    throw new Error('Failed to create category');
  }
}

/**
 * Update an existing category (custom categories only)
 */
export async function updateCategory(input: UpdateCategoryInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = UpdateCategorySchema.parse(input);
  const { id, ...data } = validated;

  try {
    // Verify category belongs to organization and is not system
    const existing = await prisma.expense_categories.findUnique({
      where: { id },
      select: { organization_id: true, is_system: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Category not found');
    }

    if (existing.is_system) {
      throw new Error('Cannot modify system categories');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isDeductible !== undefined) updateData.is_deductible = data.isDeductible;
    if (data.taxCode !== undefined) updateData.tax_code = data.taxCode;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    const category = await prisma.expense_categories.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'updated_category',
        resource_type: 'expense_category',
        resource_id: category.id,
        new_data: updateData,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to update category:', error);
    throw new Error('Failed to update category');
  }
}

/**
 * Delete a custom category
 */
export async function deleteCategory(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    // Verify category belongs to organization and is not system
    const existing = await prisma.expense_categories.findUnique({
      where: { id },
      select: { organization_id: true, is_system: true, name: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Category not found');
    }

    if (existing.is_system) {
      throw new Error('Cannot delete system categories');
    }

    await prisma.expense_categories.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'deleted_category',
        resource_type: 'expense_category',
        resource_id: id,
        old_data: { name: existing.name },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw new Error('Failed to delete category');
  }
}
