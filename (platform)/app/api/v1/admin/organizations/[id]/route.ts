import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canManageOrganizations } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { logAdminAction } from '@/lib/modules/admin/audit';
import { z } from 'zod';

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  website: z.string().url().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageOrganizations(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const organization = await prisma.organizations.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organization_members: true },
        },
        subscriptions: {
          select: {
            tier: true,
            status: true,
            current_period_start: true,
            current_period_end: true,
          },
        },
        organization_members: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageOrganizations(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateOrgSchema.parse(body);

    const organization = await prisma.organizations.update({
      where: { id },
      data: validated,
    });

    // Log action
    await logAdminAction({
      action: 'ORG_UPDATE',
      description: `Updated organization: ${organization.name}`,
      targetType: 'organization',
      targetId: organization.id,
      metadata: validated,
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !canManageOrganizations(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get organization info before deletion
    const org = await prisma.organizations.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Delete organization (cascading deletes will handle related records)
    await prisma.organizations.delete({
      where: { id },
    });

    // Log action
    await logAdminAction({
      action: 'ORG_DELETE',
      description: `Deleted organization: ${org.name}`,
      targetType: 'organization',
      targetId: org.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
