import { NextRequest, NextResponse } from 'next/server';
import { generateTaxEstimateForYear } from '@/lib/modules/expenses/tax-estimates/actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get('year')) || new Date().getFullYear();

    const result = await generateTaxEstimateForYear(year);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/expenses/tax-estimate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate tax estimate' },
      { status: 500 }
    );
  }
}
