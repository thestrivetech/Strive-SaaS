import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database/prisma';

/**
 * GET /api/v1/expenses/categories/list
 *
 * Fetches available expense categories for the current organization.
 * Returns system categories (available to all) + organization-specific categories.
 *
 * Response format:
 * {
 *   categories: Array<{
 *     id: string;
 *     name: string;
 *     code: string;
 *     description: string | null;
 *     irs_category: string | null;
 *     default_deductible: boolean;
 *     deduction_limit: number | null;
 *     color: string | null;
 *     icon: string | null;
 *   }>
 * }
 */
export async function GET() {
  try {
    // Require authentication
    const user = await requireAuth();

    // Fetch system categories + org-specific categories
    const categories = await prisma.expense_categories.findMany({
      where: {
        OR: [
          // System categories (available to all organizations)
          { is_system: true, organization_id: null },
          // Organization-specific categories
          { organization_id: user.organizationId },
        ],
        // Only active categories
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        irs_category: true,
        default_deductible: true,
        deduction_limit: true,
        color: true,
        icon: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convert BigInt deduction_limit to number for JSON serialization
    const formattedCategories = categories.map(cat => ({
      ...cat,
      deduction_limit: cat.deduction_limit ? Number(cat.deduction_limit) : null,
    }));

    return NextResponse.json({
      categories: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);

    // Return appropriate error response
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
      { status: 500 }
    );
  }
}
