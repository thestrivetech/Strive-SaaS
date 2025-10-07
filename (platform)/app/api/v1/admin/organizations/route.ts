import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageOrganizations } from '@/lib/auth/rbac';
import { getAllOrganizations } from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageOrganizations(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      subscriptionTier: searchParams.get('tier') || undefined,
      limit: 50,
    };

    const data = await getAllOrganizations(filters);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin organizations API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
