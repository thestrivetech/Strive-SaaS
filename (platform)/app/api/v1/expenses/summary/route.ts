import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

/**
 * GET /api/v1/expenses/summary
 *
 * Fetch expense KPI summary data for the dashboard
 *
 * Returns:
 * - ytdTotal: Total expenses year-to-date
 * - monthlyTotal: Total expenses this month
 * - deductibleTotal: Total tax deductible expenses YTD
 * - receiptCount: Number of receipts uploaded
 * - totalCount: Total number of expenses YTD
 *
 * @protected - Requires authentication
 * @multi-tenant - Filtered by organizationId
 */
export async function GET(request: NextRequest) {
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

    // Get current year and month
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate YTD expenses
    const ytdTotal = await prisma.expenses.aggregate({
      where: {
        organization_id: organizationId,
        date: { gte: yearStart }
      },
      _sum: { amount: true },
      _count: true
    });

    // Aggregate monthly expenses
    const monthlyTotal = await prisma.expenses.aggregate({
      where: {
        organization_id: organizationId,
        date: { gte: monthStart }
      },
      _sum: { amount: true }
    });

    // Aggregate deductible expenses
    const deductibleTotal = await prisma.expenses.aggregate({
      where: {
        organization_id: organizationId,
        date: { gte: yearStart },
        is_deductible: true
      },
      _sum: { amount: true }
    });

    // Count receipts
    const receiptCount = await prisma.receipts.count({
      where: {
        expense: {
          organization_id: organizationId
        }
      }
    });

    return NextResponse.json({
      ytdTotal: Number(ytdTotal._sum.amount || 0),
      monthlyTotal: Number(monthlyTotal._sum.amount || 0),
      deductibleTotal: Number(deductibleTotal._sum.amount || 0),
      receiptCount,
      totalCount: ytdTotal._count || 0
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense summary' },
      { status: 500 }
    );
  }
}
