import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getExpenseSummary, getCategoryBreakdown } from '@/lib/modules/expense-tax/queries';
import { canAccessExpenses } from '@/lib/auth/rbac';

/**
 * GET /api/v1/expenses/summary
 * Get expense summary (YTD, monthly, deductible totals)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessExpenses(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [summary, breakdown] = await Promise.all([
      getExpenseSummary(),
      getCategoryBreakdown(),
    ]);

    return NextResponse.json({
      ...summary,
      breakdown,
    });
  } catch (error) {
    console.error('[API] GET /api/v1/expenses/summary failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
