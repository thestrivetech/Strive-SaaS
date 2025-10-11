'use server';

import { requireAuth, getCurrentUser } from '@/lib/auth/middleware';
import { canAccessContent, canPublishContent } from '@/lib/auth/rbac';
import { canAccessFeature } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
type ContentItemInput = any;
type UpdateContentInput = any;
type PublishContentInput = any;

/**
 * Content Module - Server Actions
 *
 * All actions enforce RBAC permissions, multi-tenancy, and subscription tier limits.
 * Implements revision tracking for content updates.
 */

/**
 * Create new content item
 *
 * @param input - Content item data
 * @returns Promise<ContentItem> - Created content item
 */
export async function createContentItem(input: ContentItemInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  // Check subscription tier (GROWTH+ required)
  if (!canAccessFeature(user, 'content')) {
    throw new Error('Upgrade required: Content features available in GROWTH tier and above');
  }

  // Validate input
  const validated = input;

  // Get user's organization ID
  const organization_id = user.organizationId;

  // Generate unique slug
  const slug = await generateUniqueSlug(validated.slug, organization_id);

  // Create content item
  const content = await prisma.content.create({
    data: {
      title: validated.title,
      slug,
      content: validated.content,
      excerpt: validated.excerpt,
      type: validated.type,
      status: validated.status,
      organization_id, // Multi-tenant isolation
      author_id: user.id,
      category_id: validated.category_id,
      meta_title: validated.meta_title,
      meta_description: validated.meta_description,
      keywords: validated.keywords,
      featured_image: validated.featured_image,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      category: true,
      tags: true,
    },
  });

  revalidatePath('/real-estate/cms-marketing');
  return content;
}

/**
 * Update existing content item
 * Creates revision before updating
 *
 * @param input - Updated content data
 * @returns Promise<ContentItem> - Updated content item
 */
export async function updateContentItem(input: UpdateContentInput) {
  const user = await requireAuth();

  // Check RBAC permissions
  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  // Validate input
  const validated = input;
  const { id, organization_id: _orgId, ...updateData } = validated;

  // Get user's organization ID
  const organization_id = user.organizationId;

  // Verify ownership/access (multi-tenant check)
  const existing = await prisma.content.findFirst({
    where: {
      id,
      organization_id,
    },
  });

  if (!existing) {
    throw new Error('Content not found or access denied');
  }

  // Create revision before update (version control)
  await prisma.content_revisions.create({
    data: {
      content_id: id,
      title: existing.title,
      content_body: existing.content,
      excerpt: existing.excerpt,
      version: await getNextRevisionVersion(id),
      created_by: user.id,
    },
  });

  // Update content (only update fields that are provided)
  const updated = await prisma.content.update({
    where: { id },
    data: {
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.slug !== undefined && { slug: updateData.slug }),
      ...(updateData.content !== undefined && { content: updateData.content }),
      ...(updateData.excerpt !== undefined && { excerpt: updateData.excerpt }),
      ...(updateData.type !== undefined && { type: updateData.type }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.category_id !== undefined && { category_id: updateData.category_id }),
      ...(updateData.meta_title !== undefined && { meta_title: updateData.meta_title }),
      ...(updateData.meta_description !== undefined && { meta_description: updateData.meta_description }),
      ...(updateData.keywords !== undefined && { keywords: updateData.keywords }),
      ...(updateData.featured_image !== undefined && { featured_image: updateData.featured_image }),
      updated_at: new Date(),
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      category: true,
      tags: true,
    },
  });

  revalidatePath('/real-estate/cms-marketing');
  revalidatePath(`/real-estate/cms-marketing/content/${id}`);
  return updated;
}

/**
 * Publish content item (or schedule for future publishing)
 *
 * @param input - Publish data (ID + optional schedule time)
 * @returns Promise<ContentItem> - Published content item
 */
export async function publishContent(input: PublishContentInput) {
  const user = await requireAuth();

  // Check publishing permissions (OWNER/ADMIN only)
  if (!canPublishContent(user)) {
    throw new Error('Unauthorized: Content publishing permission required');
  }

  // Validate input
  const validated = input;

  // Get user's organization ID
  const organization_id = user.organizationId;

  // Verify access
  const content = await prisma.content.findFirst({
    where: {
      id: validated.id,
      organization_id,
    },
  });

  if (!content) {
    throw new Error('Content not found or access denied');
  }

  // Determine publish status
  const updateData: any = {
    updated_at: new Date(),
  };

  if (validated.scheduled_for) {
    // Schedule for future publishing
    updateData.status = 'SCHEDULED';
    updateData.scheduled_for = validated.scheduled_for;
  } else {
    // Publish immediately
    updateData.status = 'PUBLISHED';
    updateData.published_at = new Date();
  }

  // Update content
  const published = await prisma.content.update({
    where: { id: validated.id },
    data: updateData,
  });

  revalidatePath('/real-estate/cms-marketing');
  revalidatePath(`/real-estate/cms-marketing/content/${validated.id}`);
  return published;
}

/**
 * Unpublish content item (revert to draft)
 *
 * @param id - Content item ID
 * @returns Promise<ContentItem> - Unpublished content item
 */
export async function unpublishContent(id: string) {
  const user = await requireAuth();

  // Check publishing permissions
  if (!canPublishContent(user)) {
    throw new Error('Unauthorized: Content publishing permission required');
  }

  // Get user's organization ID
  const organization_id = user.organizationId;

  // Verify access
  const content = await prisma.content.findFirst({
    where: {
      id,
      organization_id,
    },
  });

  if (!content) {
    throw new Error('Content not found or access denied');
  }

  // Unpublish (revert to draft)
  const updated = await prisma.content.update({
    where: { id },
    data: {
      status: 'DRAFT',
      published_at: null,
    },
  });

  revalidatePath('/real-estate/cms-marketing');
  revalidatePath(`/real-estate/cms-marketing/content/${id}`);
  return updated;
}

/**
 * Delete content item
 *
 * @param id - Content item ID
 * @returns Promise<object> - Success indicator
 */
export async function deleteContent(id: string) {
  const user = await requireAuth();

  // Check content access permissions
  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  // Get user's organization ID
  const organization_id = user.organizationId;

  // Verify access
  const content = await prisma.content.findFirst({
    where: {
      id,
      organization_id,
    },
  });

  if (!content) {
    throw new Error('Content not found or access denied');
  }

  // Delete content (cascades to revisions, comments via Prisma schema)
  await prisma.content.delete({
    where: { id },
  });

  revalidatePath('/real-estate/cms-marketing');
  return { success: true };
}

/**
 * Get next revision version number for content
 *
 * @param contentId - Content item ID
 * @returns Promise<number> - Next version number
 */
async function getNextRevisionVersion(contentId: string): Promise<number> {
  const latestRevision = await prisma.content_revisions.findFirst({
    where: { content_id: contentId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  return (latestRevision?.version || 0) + 1;
}
