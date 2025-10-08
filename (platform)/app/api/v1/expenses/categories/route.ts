import { NextResponse } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

/**
 * GET /api/v1/expenses/categories
 *
 * Fetch expense category breakdown data for charts
 *
 * Returns:
 * - categories: Array of { category, amount, count, percentage }
 * - totalAmount: Total expenses across all categories
 * - totalCount: Total number of expenses
 *
 * @protected - Requires authentication
 * @multi-tenant - Filtered by organizationId
 */
export async function GET() {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user?.organization_members?.[0]?.organization_id) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    const organizationId = user.organization_members[0].organization_id;

    // Get current year for YTD calculation
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Group expenses by category with aggregations
    const categoryBreakdown = await prisma.expenses.groupBy({
      by: ['category'],
      where: {
        organization_id: organizationId,
        date: { gte: yearStart },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Calculate total for percentage calculations
    const totalAmount = categoryBreakdown.reduce(
      (sum: number, cat: any) => sum + Number(cat._sum.amount || 0),
      0
    );

    const totalCount = categoryBreakdown.reduce(
      (sum: number, cat: any) => sum + cat._count,
      0
    );

    // Transform data for client
    const categories = categoryBreakdown
      .map((cat: any) => {
        const amount = Number(cat._sum.amount || 0);
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

        return {
          category: cat.category,
          amount,
          count: cat._count,
          percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        };
      })
      .sort((a: any, b: any) => b.amount - a.amount); // Sort by amount descending

    return NextResponse.json({
      categories,
      totalAmount,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category breakdown' },
      { status: 500 }
    );
  }
}
