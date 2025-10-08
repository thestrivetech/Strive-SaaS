import { NextRequest, NextResponse } from 'next/server';
import { createExpenseReport } from '@/lib/modules/expenses/reports/actions';
import { getExpenseReports } from '@/lib/modules/expenses/reports/queries';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(); // Validate authentication

    const reports = await getExpenseReports();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET /api/v1/expenses/reports error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await createExpenseReport(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses/reports error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create report' },
      { status: 500 }
    );
  }
}
