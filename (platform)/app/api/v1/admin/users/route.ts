import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageUsers } from '@/lib/auth/rbac';
import { getAllUsers } from '@/lib/modules/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      role: searchParams.get('role') || undefined,
      subscriptionTier: searchParams.get('tier') || undefined,
      limit: 50,
    };

    const data = await getAllUsers(filters);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
