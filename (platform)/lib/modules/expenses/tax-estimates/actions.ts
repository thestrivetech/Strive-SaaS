'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { calculateYearlyTaxEstimate, calculateQuarterlyTaxEstimate } from './calculations';
import { SimpleTaxEstimateInput, UpdateTaxEstimateInput } from './schemas';

export async function createTaxEstimate(input: SimpleTaxEstimateInput) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = input;

  try {
    // Calculate tax estimate
    const calculation = validated.quarter
      ? await calculateQuarterlyTaxEstimate(
          user.organizationId,
          validated.year,
          validated.quarter
        )
      : await calculateYearlyTaxEstimate(
          user.organizationId,
          validated.year
        );

    // Calculate period dates
    const periodStart = validated.quarter
      ? new Date(validated.year, (validated.quarter - 1) * 3, 1)
      : new Date(validated.year, 0, 1);
    const periodEnd = validated.quarter
      ? new Date(validated.year, validated.quarter * 3, 0)
      : new Date(validated.year, 11, 31);

    const taxEstimate = await prisma.tax_estimates.create({
      data: {
        tax_year: validated.year,
        quarter: validated.quarter,
        period_start: periodStart,
        period_end: periodEnd,
        total_income: calculation.totalIncome,
        total_expenses: 0,
        total_deductions: calculation.totalDeductions,
        net_income: calculation.taxableIncome,
        estimated_tax_rate: calculation.effectiveTaxRate,
        federal_tax_estimated: calculation.estimatedTax,
        state_tax_estimated: 0,
        self_employment_tax: 0,
        total_tax_estimated: calculation.estimatedTax,
        calculation_method: 'STANDARD',
        organization_id: user.organizationId,
        user_id: user.id,
      }
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, taxEstimate };
  } catch (error) {
    console.error('Failed to create tax estimate:', error);
    throw new Error('Failed to create tax estimate');
  }
}

export async function updateTaxEstimate(input: UpdateTaxEstimateInput) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = input;
  const { id, ...data } = validated;

  try {
    const existing = await prisma.tax_estimates.findUnique({
      where: { id },
      select: { organization_id: true }
    });

    if (!existing || existing.organization_id !== user.organizationId) {
      throw new Error('Tax estimate not found');
    }

    const updateData: any = {};

    if (data.year !== undefined) updateData.tax_year = data.year;
    if (data.quarter !== undefined) updateData.quarter = data.quarter;
    if (data.totalIncome !== undefined) updateData.total_income = data.totalIncome;
    if (data.totalDeductions !== undefined) updateData.total_deductions = data.totalDeductions;
    if (data.taxRate !== undefined) updateData.estimated_tax_rate = data.taxRate;

    const taxEstimate = await prisma.tax_estimates.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, taxEstimate };
  } catch (error) {
    console.error('Failed to update tax estimate:', error);
    throw new Error('Failed to update tax estimate');
  }
}

export async function generateTaxEstimateForYear(year: number) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    const calculation = await calculateYearlyTaxEstimate(
      user.organizationId,
      year
    );

    return { success: true, calculation };
  } catch (error) {
    console.error('Failed to generate tax estimate:', error);
    throw new Error('Failed to generate tax estimate');
  }
}
