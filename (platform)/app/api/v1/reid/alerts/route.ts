import { NextRequest, NextResponse } from 'next/server';
import { getPropertyAlerts } from '@/lib/modules/reid/alerts/queries';
import { createPropertyAlert } from '@/lib/modules/reid/alerts/actions';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const alertType = searchParams.get('alertType');
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (alertType) filters.alertType = alertType;
    if (isActive !== null) filters.isActive = isActive === 'true';

    const alerts = await getPropertyAlerts(filters);
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
