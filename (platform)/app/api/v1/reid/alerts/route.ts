import { NextRequest, NextResponse } from 'next/server';
import { getPropertyAlerts } from '@/lib/modules/reid/alerts/queries';

export async function GET(req: NextRequest) {
  try {
    const alerts = await getPropertyAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
