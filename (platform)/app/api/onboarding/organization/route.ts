import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has an organization
    if (user.organization_members && user.organization_members.length > 0) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Check if slug already exists
    const existingOrg = await prisma.organizations.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      // Add random suffix to make it unique
      const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;

      // Create organization with unique slug
      const organization = await prisma.organizations.create({
        data: {
          name: name.trim(),
          slug: uniqueSlug,
          description: description?.trim() || null,
          subscription_status: 'TRIAL',
        },
      });

      // Add user as organization owner
      await prisma.organization_members.create({
        data: {
          user_id: user.id,
          organization_id: organization.id,
          role: 'OWNER',
        },
      });

      return NextResponse.json({
        success: true,
        organization,
      });
    }

    // Create organization
    const organization = await prisma.organizations.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        subscription_status: 'TRIAL',
      },
    });

    // Add user as organization owner
    await prisma.organization_members.create({
      data: {
        user_id: user.id,
        organization_id: organization.id,
        role: 'OWNER',
      },
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
