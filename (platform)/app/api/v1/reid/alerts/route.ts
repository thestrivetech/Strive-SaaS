import { NextRequest, NextResponse } from 'next/server';
import { getPropertyAlerts } from '@/lib/modules/reid/alerts/queries';
import { createPropertyAlert } from '@/lib/modules/reid/alerts/actions';

export async function GET(req: NextRequest) {
  try {
    // getPropertyAlerts() takes no parameters - filters by organizationId automatically
    const alerts = await getPropertyAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alert = await createPropertyAlert(body);
    return NextResponse.json({ alert });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create alert' },
      { status: 500 }
    );
  }
}
