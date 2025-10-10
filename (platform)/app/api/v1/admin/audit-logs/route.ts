import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canViewAuditLogs } from '@/lib/auth/rbac';
import { getAdminActionLogs } from '@/lib/modules/admin/audit';
import type { AdminAction } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !canViewAuditLogs(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required to view audit logs' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;

    const filters = {
      action: searchParams.get('action') as AdminAction | undefined,
      adminId: searchParams.get('adminId') || undefined,
      targetType: searchParams.get('targetType') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: Number(searchParams.get('limit')) || 100,
    };

    const logs = await getAdminActionLogs(filters);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
