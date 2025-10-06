import { prisma } from '@/lib/prisma';

/**
 * Tax Calculation Helpers
 *
 * Functions for calculating tax estimates based on expense data
 *
 * Features:
 * - Progressive tax bracket calculations
 * - Quarterly and annual estimates
 * - Standard deduction handling
 * - Business expense deductions
 *
 * SECURITY:
 * - All calculations use organization-scoped data
 * - No user input in tax calculations (uses official brackets)
 */

export interface TaxCalculationResult {
  totalIncome: number;
  businessIncome: number;
  otherIncome: number;
  totalDeductions: number;
  businessDeductions: number;
  standardDeduction: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveTaxRate: number;
}

// 2025 Tax Brackets (Single Filer)
const STANDARD_DEDUCTION_2025 = 14600;
const TAX_BRACKETS_2025 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

/**
 * Calculate tax using progressive bracket system
 */
export function calculateTax(taxableIncome: number): number {
  if (taxableIncome <= 0) {
    return 0;
  }

  let tax = 0;

  for (const bracket of TAX_BRACKETS_2025) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(
        taxableIncome - bracket.min,
        bracket.max - bracket.min
      );
      tax += taxableInBracket * bracket.rate;
    }
  }

  return tax;
}

/**
 * Calculate yearly tax estimate for organization
 */
export async function calculateYearlyTaxEstimate(
  organizationId: string,
  year: number
): Promise<TaxCalculationResult> {
  // Get all deductible expenses for the year
  const deductibleExpenses = await prisma.expenses.aggregate({
    where: {
      organization_id: organizationId,
      is_deductible: true,
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    _sum: { amount: true },
  });

  const businessDeductions = Number(deductibleExpenses._sum.amount || 0);
  const standardDeduction = STANDARD_DEDUCTION_2025;
  const totalDeductions = businessDeductions + standardDeduction;

  // For now, use placeholder income (should come from user input)
  // In production, this would be pulled from income records or user-provided data
  const totalIncome = 0;
  const businessIncome = 0;
  const otherIncome = 0;

  const taxableIncome = Math.max(0, totalIncome - totalDeductions);
  const estimatedTax = calculateTax(taxableIncome);
  const effectiveTaxRate = totalIncome > 0 ? estimatedTax / totalIncome : 0;

  return {
    totalIncome,
    businessIncome,
    otherIncome,
    totalDeductions,
    businessDeductions,
    standardDeduction,
    taxableIncome,
    estimatedTax,
    effectiveTaxRate,
  };
}

/**
 * Calculate quarterly tax estimate for organization
 */
export async function calculateQuarterlyTaxEstimate(
  organizationId: string,
  year: number,
  quarter: number
): Promise<TaxCalculationResult> {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4');
  }

  const quarterStartMonth = (quarter - 1) * 3;
  const quarterEndMonth = quarterStartMonth + 3;

  const deductibleExpenses = await prisma.expenses.aggregate({
    where: {
      organization_id: organizationId,
      is_deductible: true,
      date: {
        gte: new Date(year, quarterStartMonth, 1),
        lt: new Date(year, quarterEndMonth, 1),
      },
    },
    _sum: { amount: true },
  });

  const businessDeductions = Number(deductibleExpenses._sum.amount || 0);
  const standardDeduction = STANDARD_DEDUCTION_2025 / 4; // Quarterly
  const totalDeductions = businessDeductions + standardDeduction;

  // For now, use placeholder income
  const totalIncome = 0;
  const businessIncome = 0;
  const otherIncome = 0;

  const taxableIncome = Math.max(0, totalIncome - totalDeductions);
  const estimatedTax = calculateTax(taxableIncome);
  const effectiveTaxRate = totalIncome > 0 ? estimatedTax / totalIncome : 0;

  return {
    totalIncome,
    businessIncome,
    otherIncome,
    totalDeductions,
    businessDeductions,
    standardDeduction,
    taxableIncome,
    estimatedTax,
    effectiveTaxRate,
  };
}
