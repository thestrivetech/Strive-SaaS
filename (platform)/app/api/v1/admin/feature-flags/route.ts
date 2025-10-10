import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageFeatureFlags } from '@/lib/auth/rbac';
import {
  getAllFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
} from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!canManageFeatureFlags(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flags = await getAllFeatureFlags();
    return NextResponse.json(flags);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!canManageFeatureFlags(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const flag = await createFeatureFlag(body);
    return NextResponse.json(flag);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create feature flag' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!canManageFeatureFlags(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const flag = await updateFeatureFlag(body);
    return NextResponse.json(flag);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}
