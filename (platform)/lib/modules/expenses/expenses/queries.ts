'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { ExpenseFilterSchema } from './schemas';
import type { ExpenseFilter } from './schemas';

/**
 * Get Expenses with Filtering and Pagination
 *
 * Fetches expenses for the current organization with optional filtering.
 * Always enforces multi-tenancy by filtering on organization_id.
 *
 * @param filters - Optional filters for category, date range, etc.
 * @returns Paginated list of expenses with metadata
 */
export async function getExpenses(filters: Partial<ExpenseFilter> = {}) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  // Validate and set defaults for filters
  const validated = ExpenseFilterSchema.partial().parse(filters);

  try {
    // Build where clause with organization isolation
    const where: any = {
      organization_id: user.organizationId,
    };

    // Apply filters
    if (validated.categoryId) {
      where.category_id = validated.categoryId;
    }

    if (validated.status) {
      where.status = validated.status;
    }

    if (validated.listingId) {
      where.listing_id = validated.listingId;
    }

    if (validated.startDate || validated.endDate) {
      where.date = {};
      if (validated.startDate) {
        where.date.gte = validated.startDate;
      }
      if (validated.endDate) {
        where.date.lte = validated.endDate;
      }
    }

    if (validated.isDeductible !== undefined) {
      where.is_deductible = validated.isDeductible;
    }

    if (validated.minAmount || validated.maxAmount) {
      where.amount = {};
      if (validated.minAmount) {
        where.amount.gte = validated.minAmount;
      }
      if (validated.maxAmount) {
        where.amount.lte = validated.maxAmount;
      }
    }

    if (validated.search) {
      where.merchant = {
        contains: validated.search,
        mode: 'insensitive',
      };
    }

    // Build orderBy clause
    const orderBy: any = {
      [validated.sortBy || 'date']: validated.sortOrder || 'desc',
    };

    // Calculate pagination
    const page = validated.page || 1;
    const limit = validated.limit || 50;
    const skip = (page - 1) * limit;

    // Fetch expenses with related data
    const [expenses, total] = await Promise.all([
      prisma.expenses.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              address: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          receipts: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.expenses.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      expenses: expenses.map((expense: any) => ({
        id: expense.id,
        date: expense.date.toISOString(),
        merchant: expense.merchant,
        category: expense.category.name,
        categoryId: expense.category.id,
        amount: Number(expense.amount),
        listing: expense.listing
          ? {
              id: expense.listing.id,
              address: expense.listing.address,
            }
          : null,
        description: expense.description,
        notes: expense.notes,
        isDeductible: expense.is_deductible,
        deductionPercent: expense.deduction_percent,
        status: expense.status,
        createdAt: expense.created_at.toISOString(),
        updatedAt: expense.updated_at.toISOString(),
        createdBy: {
          id: expense.user.id,
          name: expense.user.name,
          email: expense.user.email,
        },
        receipts: expense.receipts.map((receipt: any) => ({
          id: receipt.id,
          fileName: receipt.file_name,
          fileUrl: receipt.file_url,
          fileType: receipt.file_type,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw new Error('Failed to fetch expenses');
  }
}

/**
 * Get Expense by ID
 *
 * Fetches a single expense by ID with organization isolation.
 *
 * @param id - Expense ID
 * @returns Single expense or null
 */
export async function getExpenseById(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    const expense = await prisma.expenses.findFirst({
      where: {
        id,
        organization_id: user.organizationId,
      },
      include: {
        listing: {
          select: {
            id: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        receipts: true,
      },
    });

    if (!expense) {
      return null;
    }

    return {
      id: expense.id,
      date: expense.date.toISOString(),
      merchant: expense.merchant,
      category: expense.category.name,
      categoryId: expense.category.id,
      amount: Number(expense.amount),
      listing: expense.listing
        ? {
            id: expense.listing.id,
            address: expense.listing.address,
          }
        : null,
      description: expense.description,
      notes: expense.notes,
      isDeductible: expense.is_deductible,
      deductionPercent: expense.deduction_percent,
      status: expense.status,
      createdAt: expense.created_at.toISOString(),
      updatedAt: expense.updated_at.toISOString(),
      createdBy: {
        id: expense.user.id,
        name: expense.user.name,
        email: expense.user.email,
      },
      receipts: expense.receipts.map((receipt: any) => ({
        id: receipt.id,
        fileName: receipt.file_name,
        fileUrl: receipt.file_url,
        fileType: receipt.file_type,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch expense:', error);
    throw new Error('Failed to fetch expense');
  }
}

/**
 * Get Expense Summary
 *
 * Calculates summary statistics for expenses.
 * Used by the dashboard KPI cards.
 *
 * @returns Summary statistics
 */
export async function getExpenseSummary() {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const where = {
      organization_id: user.organizationId,
    };

    const [ytdExpenses, monthlyExpenses, deductibleExpenses, receiptCount] =
      await Promise.all([
        // YTD total
        prisma.expenses.aggregate({
          where: {
            ...where,
            date: {
              gte: yearStart,
            },
          },
          _sum: {
            amount: true,
          },
          _count: true,
        }),
        // Monthly total
        prisma.expenses.aggregate({
          where: {
            ...where,
            date: {
              gte: monthStart,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // Deductible total
        prisma.expenses.aggregate({
          where: {
            ...where,
            is_deductible: true,
            date: {
              gte: yearStart,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // Receipt count from separate receipts table
        prisma.receipts.count({
          where: {
            organization_id: user.organizationId,
          },
        }),
      ]);

    return {
      ytdTotal: Number(ytdExpenses._sum.amount || 0),
      monthlyTotal: Number(monthlyExpenses._sum.amount || 0),
      deductibleTotal: Number(deductibleExpenses._sum.amount || 0),
      receiptCount,
      totalCount: ytdExpenses._count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch expense summary:', error);
    throw new Error('Failed to fetch expense summary');
  }
}
