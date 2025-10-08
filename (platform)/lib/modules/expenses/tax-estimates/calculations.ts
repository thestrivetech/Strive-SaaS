import { prisma } from '@/lib/database/prisma';

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

const STANDARD_DEDUCTION_2025 = 14600; // Single filer
const TAX_BRACKETS_2025 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

export function calculateTax(taxableIncome: number): number {
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

export async function calculateQuarterlyTaxEstimate(
  organizationId: string,
  year: number,
  quarter: number
): Promise<TaxCalculationResult> {
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
