import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageSystemAlerts } from '@/lib/auth/rbac';
import {
  getActiveSystemAlerts,
  createSystemAlert,
} from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!canManageSystemAlerts(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await getActiveSystemAlerts();
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!canManageSystemAlerts(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const alert = await createSystemAlert(body);
    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
