import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodInsightByAreaCode } from '@/lib/modules/reid/insights';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ areaCode: string }> }
) {
  try {
    const { areaCode } = await params;
    const insight = await getNeighborhoodInsightByAreaCode(areaCode);

    if (!insight) {
      return NextResponse.json(
        { error: 'Neighborhood insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error('Error fetching neighborhood insight:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Insight not found' },
      { status: 404 }
    );
  }
}
