import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { createExpense, updateExpense } from '@/lib/modules/expense-tax/actions';
import { getExpenses } from '@/lib/modules/expense-tax/queries';
import { canAccessExpenses } from '@/lib/auth/rbac';

/**
 * GET /api/v1/expenses
 * Fetch expenses with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessExpenses(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const isDeductibleParam = searchParams.get('isDeductible');

    const filters: any = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    };

    if (categoryParam) filters.category = categoryParam;
    if (statusParam) filters.status = statusParam;
    if (searchParams.get('dateFrom')) filters.dateFrom = new Date(searchParams.get('dateFrom')!);
    if (searchParams.get('dateTo')) filters.dateTo = new Date(searchParams.get('dateTo')!);
    if (isDeductibleParam !== null) filters.isDeductible = isDeductibleParam === 'true';
    if (searchParams.get('listingId')) filters.listingId = searchParams.get('listingId')!;

    const result = await getExpenses(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] GET /api/v1/expenses failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/expenses
 * Create a new expense
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessExpenses(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const result = await createExpense(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/v1/expenses failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create expense' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/expenses
 * Update an existing expense
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireAuth();
    const user = await getCurrentUser();

    if (!user || !canAccessExpenses(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const result = await updateExpense(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] PATCH /api/v1/expenses failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update expense' },
      { status: 500 }
    );
  }
}
