import { NextRequest, NextResponse } from 'next/server';
import { getExpenses } from '@/lib/modules/expenses/expenses/queries';

/**
 * GET /api/v1/expenses
 *
 * Fetch expenses with optional filtering
 *
 * Query parameters:
 * - category: ExpenseCategory enum value
 * - status: ExpenseStatus enum value
 * - listingId: UUID
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - isDeductible: boolean
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - sortBy: 'date' | 'amount' | 'merchant' | 'category'
 * - sortOrder: 'asc' | 'desc'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter object
    const filters: any = {};

    // Category filter
    if (searchParams.has('category')) {
      filters.categoryId = searchParams.get('category');
    }

    // Status filter
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status');
    }

    // Listing filter
    if (searchParams.has('listingId')) {
      filters.listingId = searchParams.get('listingId');
    }

    // Date range filters
    if (searchParams.has('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.has('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    // Deductible filter
    if (searchParams.has('isDeductible')) {
      filters.isDeductible = searchParams.get('isDeductible') === 'true';
    }

    // Pagination
    if (searchParams.has('page')) {
      filters.page = parseInt(searchParams.get('page')!);
    }
    if (searchParams.has('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!);
    }

    // Sorting
    if (searchParams.has('sortBy')) {
      filters.sortBy = searchParams.get('sortBy');
    }
    if (searchParams.has('sortOrder')) {
      filters.sortOrder = searchParams.get('sortOrder');
    }

    // Search
    if (searchParams.has('search')) {
      filters.search = searchParams.get('search');
    }

    // Fetch expenses using Server Query
    const result = await getExpenses(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/expenses error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
