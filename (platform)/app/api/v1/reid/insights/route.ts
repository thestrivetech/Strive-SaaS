import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodInsights } from '@/lib/modules/reid/insights';
import { z } from 'zod';

const FiltersSchema = z.object({
  areaCodes: z.string().optional().transform(val => val?.split(',')),
  areaType: z.enum(['ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA']).optional(),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawFilters = {
      areaCodes: searchParams.get('areaCodes'),
      areaType: searchParams.get('areaType'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
    };

    const filters = FiltersSchema.parse(rawFilters);
    const insights = await getNeighborhoodInsights(filters);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error fetching neighborhood insights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
