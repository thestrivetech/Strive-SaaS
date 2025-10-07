import { NextResponse } from 'next/server';
import { getPlatformMetrics } from '@/lib/modules/admin/metrics';

/**
 * GET /api/v1/admin/metrics
 * Fetch platform metrics for admin dashboard
 */
export async function GET() {
  try {
    const metrics = await getPlatformMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching platform metrics:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
