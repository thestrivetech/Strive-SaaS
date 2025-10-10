import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageUsers } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { logAdminAction } from '@/lib/modules/admin/audit';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Prevent deleting own account
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user info before deletion for logging
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.users.delete({
      where: { id: userId },
    });

    // Log action
    await logAdminAction({
      action: 'USER_DELETE',
      description: `Deleted user: ${targetUser.email}`,
      targetType: 'user',
      targetId: userId,
      metadata: {
        email: targetUser.email,
        name: targetUser.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
