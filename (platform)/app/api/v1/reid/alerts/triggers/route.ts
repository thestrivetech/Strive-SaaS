import { NextRequest, NextResponse } from 'next/server';
import { getAlertTriggers } from '@/lib/modules/reid/alerts/queries';

export async function GET(req: NextRequest) {
  try {
    const triggers = await getAlertTriggers();
    return NextResponse.json({ triggers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}
