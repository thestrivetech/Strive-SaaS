'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { TaxEstimateSchema, UpdateTaxEstimateSchema } from './schemas';
import { calculateYearlyTaxEstimate, calculateQuarterlyTaxEstimate } from './calculations';
import type { TaxEstimateInput, UpdateTaxEstimateInput } from './schemas';

/**
 * Tax Estimate Actions
 *
 * Server actions for managing tax estimates
 *
 * Features:
 * - Create tax estimates
 * - Update tax estimates
 * - Generate estimates from expense data
 *
 * SECURITY:
 * - Authentication required
 * - Multi-tenancy enforced
 * - Input validation with Zod
 */

/**
 * Create a new tax estimate
 */
export async function createTaxEstimate(input: TaxEstimateInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = TaxEstimateSchema.parse(input);

  try {
    // Calculate tax estimate based on current expenses
    const calculation = validated.quarter
      ? await calculateQuarterlyTaxEstimate(
          organizationId,
          validated.year,
          validated.quarter
        )
      : await calculateYearlyTaxEstimate(
          organizationId,
          validated.year
        );

    const taxEstimate = await prisma.tax_estimates.create({
      data: {
        ...validated,
        taxable_income: calculation.taxableIncome,
        estimated_tax: calculation.estimatedTax,
        organization_id: organizationId,
        created_by: user.id,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, taxEstimate };
  } catch (error) {
    console.error('Failed to create tax estimate:', error);
    throw new Error('Failed to create tax estimate');
  }
}

/**
 * Update an existing tax estimate
 */
export async function updateTaxEstimate(input: UpdateTaxEstimateInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = UpdateTaxEstimateSchema.parse(input);
  const { id, ...data } = validated;

  try {
    // Verify ownership
    const existing = await prisma.tax_estimates.findUnique({
      where: { id },
      select: { organization_id: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Tax estimate not found');
    }

    const taxEstimate = await prisma.tax_estimates.update({
      where: { id },
      data,
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, taxEstimate };
  } catch (error) {
    console.error('Failed to update tax estimate:', error);
    throw new Error('Failed to update tax estimate');
  }
}

/**
 * Generate tax estimate for a specific year
 */
export async function generateTaxEstimateForYear(year: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    const calculation = await calculateYearlyTaxEstimate(
      organizationId,
      year
    );

    return { success: true, calculation };
  } catch (error) {
    console.error('Failed to generate tax estimate:', error);
    throw new Error('Failed to generate tax estimate');
  }
}

/**
 * Generate tax estimate for a specific quarter
 */
export async function generateTaxEstimateForQuarter(year: number, quarter: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    const calculation = await calculateQuarterlyTaxEstimate(
      organizationId,
      year,
      quarter
    );

    return { success: true, calculation };
  } catch (error) {
    console.error('Failed to generate quarterly tax estimate:', error);
    throw new Error('Failed to generate quarterly tax estimate');
  }
}
