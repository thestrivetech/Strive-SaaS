'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { ExpenseFiltersSchema } from './schemas';
import type { ExpenseFilters } from './schemas';

/**
 * Expense & Tax Queries Module
 *
 * Data fetching functions for expense tracking and tax management
 *
 * SECURITY:
 * - All queries require authentication
 * - Multi-tenancy enforced via organizationId filtering
 * - Optimized with proper indexing
 *
 * Features:
 * - Expense retrieval with filtering
 * - Tax summary calculations
 * - Category breakdown
 * - Receipt management
 * - Analytics queries
 */

/**
 * Get expenses with filters and pagination
 */
export async function getExpenses(filters?: ExpenseFilters) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = filters ? ExpenseFiltersSchema.parse(filters) : { page: 1, limit: 50 };
  const { page = 1, limit = 50, ...otherFilters } = validated;
  const skip = (page - 1) * limit;

  const where: any = {
    organization_id: organizationId,
  };

  // Apply filters
  if (otherFilters.category) {
    where.category = otherFilters.category;
  }

  if (otherFilters.dateFrom || otherFilters.dateTo) {
    where.date = {};
    if (otherFilters.dateFrom) {
      where.date.gte = otherFilters.dateFrom;
    }
    if (otherFilters.dateTo) {
      where.date.lte = otherFilters.dateTo;
    }
  }

  if (otherFilters.isDeductible !== undefined) {
    where.is_deductible = otherFilters.isDeductible;
  }

  if (otherFilters.listingId) {
    where.listing_id = otherFilters.listingId;
  }

  if (otherFilters.status) {
    where.status = otherFilters.status;
  }

  const [expenses, total] = await Promise.all([
    prisma.expenses.findMany({
      where,
      include: {
        listing: {
          select: { id: true, address: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        receipt: {
          select: { id: true, file_url: true, mime_type: true },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.expenses.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const expense = await prisma.expenses.findUnique({
    where: {
      id,
      organization_id: organizationId,
    },
    include: {
      listing: true,
      creator: {
        select: { id: true, name: true, email: true },
      },
      reviewer: {
        select: { id: true, name: true, email: true },
      },
      receipt: true,
    },
  });

  if (!expense) {
    throw new Error('Expense not found');
  }

  return expense;
}

/**
 * Get expense summary (YTD, monthly, deductible totals)
 */
export async function getExpenseSummary() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // YTD expenses
  const ytdExpenses = await prisma.expenses.aggregate({
    where: {
      organization_id: organizationId,
      date: {
        gte: new Date(currentYear, 0, 1),
      },
    },
    _sum: { amount: true },
    _count: true,
  });

  // This month expenses
  const monthlyExpenses = await prisma.expenses.aggregate({
    where: {
      organization_id: organizationId,
      date: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1),
      },
    },
    _sum: { amount: true },
  });

  // Tax deductible expenses YTD
  const deductibleExpenses = await prisma.expenses.aggregate({
    where: {
      organization_id: organizationId,
      date: {
        gte: new Date(currentYear, 0, 1),
      },
      is_deductible: true,
    },
    _sum: { amount: true },
  });

  // Total receipts count
  const receiptCount = await prisma.receipts.count({
    where: {
      expense: {
        organization_id: organizationId,
      },
    },
  });

  return {
    ytdTotal: ytdExpenses._sum.amount?.toNumber() || 0,
    monthlyTotal: monthlyExpenses._sum.amount?.toNumber() || 0,
    deductibleTotal: deductibleExpenses._sum.amount?.toNumber() || 0,
    receiptCount,
    totalCount: ytdExpenses._count,
  };
}

/**
 * Get category breakdown for current year
 */
export async function getCategoryBreakdown() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const currentYear = new Date().getFullYear();

  const breakdown = await prisma.expenses.groupBy({
    by: ['category'],
    where: {
      organization_id: organizationId,
      date: {
        gte: new Date(currentYear, 0, 1),
      },
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  return breakdown.map((item) => ({
    category: item.category,
    total: item._sum.amount?.toNumber() || 0,
    count: item._count,
  }));
}

/**
 * Get expense categories for organization
 */
export async function getExpenseCategories() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Get both system categories and org-specific categories
  const categories = await prisma.expense_categories.findMany({
    where: {
      OR: [
        { is_system: true },
        { organization_id: organizationId },
      ],
      is_active: true,
    },
    orderBy: { sort_order: 'asc' },
  });

  return categories;
}

/**
 * Get tax estimate for year/quarter
 */
export async function getTaxEstimate(year: number, quarter?: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const estimate = await prisma.tax_estimates.findFirst({
    where: {
      year,
      quarter: quarter || null,
      organization_id: organizationId,
    },
  });

  return estimate;
}

/**
 * Get expense reports for organization
 */
export async function getExpenseReports() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const reports = await prisma.expense_reports.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return reports;
}

/**
 * Get monthly expense trend (last 12 months)
 */
export async function getMonthlyExpenseTrend() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const expenses = await prisma.expenses.findMany({
    where: {
      organization_id: organizationId,
      date: {
        gte: twelveMonthsAgo,
      },
    },
    select: {
      date: true,
      amount: true,
    },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};

  expenses.forEach((expense) => {
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount.toNumber();
  });

  return Object.entries(monthlyData).map(([month, total]) => ({
    month,
    total,
  }));
}
