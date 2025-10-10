'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { calculateYearlyTaxEstimate, calculateQuarterlyTaxEstimate } from './calculations';

export async function createTaxEstimate(input: TaxEstimateInput) {
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

    const taxEstimate = await prisma.tax_estimates.create({
      data: {
        year: validated.year,
        quarter: validated.quarter,
        total_income: calculation.totalIncome,
        business_income: calculation.businessIncome,
        other_income: calculation.otherIncome,
        total_deductions: calculation.totalDeductions,
        business_deductions: calculation.businessDeductions,
        standard_deduction: calculation.standardDeduction,
        taxable_income: calculation.taxableIncome,
        estimated_tax: calculation.estimatedTax,
        tax_rate: calculation.effectiveTaxRate,
        organization_id: user.organizationId,
        created_by_id: user.id,
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

    const taxEstimate = await prisma.tax_estimates.update({
      where: { id },
      data: {
        year: data.year,
        quarter: data.quarter,
        total_income: data.totalIncome,
        business_income: data.businessIncome,
        other_income: data.otherIncome,
        total_deductions: data.totalDeductions,
        business_deductions: data.businessDeductions,
        standard_deduction: data.standardDeduction,
        tax_rate: data.taxRate,
      }
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
