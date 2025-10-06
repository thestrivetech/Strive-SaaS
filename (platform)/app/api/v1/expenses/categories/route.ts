import { NextRequest, NextResponse } from 'next/server';
import { createCategory } from '@/lib/modules/expense-tax/categories/actions';
import { getCategories } from '@/lib/modules/expense-tax/categories/queries';

/**
 * Expense Categories API Routes
 *
 * GET  /api/v1/expenses/categories - Get all categories (system + custom)
 * POST /api/v1/expenses/categories - Create new custom category
 *
 * SECURITY:
 * - Authentication required
 * - Multi-tenancy enforced
 * - Input validation
 */

/**
 * GET /api/v1/expenses/categories
 *
 * Fetch all expense categories (system + organization-specific)
 */
export async function GET(req: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/v1/expenses/categories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/expenses/categories
 *
 * Create a new custom expense category
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await createCategory(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses/categories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}
