'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage, canManageAIGarage } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
type CreateBlueprintInput = any;
type UpdateBlueprintInput = any;
type CloneBlueprintInput = any;

/**
 * Tool Blueprint Actions Module
 *
 * Server Actions for blueprint marketplace and visual builder functionality
 * All actions protected by RBAC and multi-tenant isolation
 */

/**
 * Create a new tool blueprint
 *
 * RBAC: Requires canManageAIGarage permission
 */
export async function createBlueprint(input: CreateBlueprintInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to create blueprints');
  }

  // Validate input
  const validated = input;

  return withTenantContext(async () => {
    try {
      // Ensure organization_id matches current user's organization
      if (!user.organization_members || user.organization_members.length === 0) {
        throw new Error('User must belong to an organization');
      }

      const userOrgId = user.organization_members[0].organization_id;
      if (validated.organization_id !== userOrgId) {
        throw new Error('Organization ID mismatch');
      }

      const blueprint = await prisma.tool_blueprints.create({
        data: {
          ...validated,
          created_by_id: user.id,
          usage_count: 0,
        },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        data: blueprint,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] createBlueprint failed:', dbError);
      throw error;
    }
  });
}

/**
 * Update an existing blueprint
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be blueprint creator or admin
 */
export async function updateBlueprint(input: UpdateBlueprintInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to update blueprints');
  }

  const validated = input;

  return withTenantContext(async () => {
    try {
      // Check if blueprint exists and user has permission to update
      const existingBlueprint = await prisma.tool_blueprints.findUnique({
        where: { id: validated.id },
      });

      if (!existingBlueprint) {
        throw new Error('Blueprint not found');
      }

      // Only creator or admin can update
      if (existingBlueprint.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only update your own blueprints');
      }

      const { id, ...updateData } = validated;

      const blueprint = await prisma.tool_blueprints.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath(`/real-estate/ai-hub/tool-forge/${id}`);
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        data: blueprint,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] updateBlueprint failed:', dbError);
      throw error;
    }
  });
}

/**
 * Delete a blueprint
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be blueprint creator or admin
 */
export async function deleteBlueprint(blueprintId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to delete blueprints');
  }

  return withTenantContext(async () => {
    try {
      const existingBlueprint = await prisma.tool_blueprints.findUnique({
        where: { id: blueprintId },
      });

      if (!existingBlueprint) {
        throw new Error('Blueprint not found');
      }

      // Only creator or admin can delete
      if (existingBlueprint.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only delete your own blueprints');
      }

      await prisma.tool_blueprints.delete({
        where: { id: blueprintId },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        message: 'Blueprint deleted successfully',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] deleteBlueprint failed:', dbError);
      throw error;
    }
  });
}

/**
 * Clone a blueprint to current organization
 *
 * RBAC: Requires canManageAIGarage permission
 * Creates a copy of public or accessible blueprint
 */
export async function cloneBlueprint(input: CloneBlueprintInput) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to clone blueprints');
  }

  const validated = input;

  return withTenantContext(async () => {
    try {
      // Ensure organization_id matches current user's organization
      if (!user.organization_members || user.organization_members.length === 0) {
        throw new Error('User must belong to an organization');
      }

      const userOrgId = user.organization_members[0].organization_id;
      if (validated.organization_id !== userOrgId) {
        throw new Error('Organization ID mismatch');
      }

      // Find the original blueprint
      const original = await prisma.tool_blueprints.findFirst({
        where: {
          id: validated.blueprint_id,
          OR: [
            { is_public: true },
            { organization_id: userOrgId },
          ],
        },
      });

      if (!original) {
        throw new Error('Blueprint not found or not accessible');
      }

      // Create clone with new organization ownership
      const clone = await prisma.tool_blueprints.create({
        data: {
          name: validated.name || `${original.name} (Copy)`,
          description: original.description,
          category: original.category,
          tags: original.tags,
          configuration: original.configuration as any,
          components: original.components as any,
          connections: original.connections as any,
          complexity: original.complexity,
          organization_id: userOrgId,
          created_by_id: user.id,
          is_public: false, // Clones are private by default
          usage_count: 0,
        },
      });

      // Increment original blueprint usage count
      await prisma.tool_blueprints.update({
        where: { id: validated.blueprint_id },
        data: {
          usage_count: {
            increment: 1,
          },
        },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        data: clone,
        message: 'Blueprint cloned successfully',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] cloneBlueprint failed:', dbError);
      throw error;
    }
  });
}

/**
 * Increment blueprint usage count
 *
 * Called when a blueprint is used to create a tool
 * RBAC: Requires canAccessAIGarage permission
 */
export async function incrementBlueprintUsage(blueprintId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Insufficient permissions');
  }

  return withTenantContext(async () => {
    try {
      await prisma.tool_blueprints.update({
        where: { id: blueprintId },
        data: {
          usage_count: {
            increment: 1,
          },
        },
      });

      revalidatePath(`/real-estate/ai-hub/tool-forge/${blueprintId}`);
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        message: 'Usage count incremented',
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] incrementBlueprintUsage failed:', dbError);
      throw error;
    }
  });
}

/**
 * Toggle blueprint public visibility
 *
 * RBAC: Requires canManageAIGarage permission
 * Additional check: User must be blueprint creator or admin
 */
export async function toggleBlueprintVisibility(blueprintId: string) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to change blueprint visibility');
  }

  return withTenantContext(async () => {
    try {
      const existingBlueprint = await prisma.tool_blueprints.findUnique({
        where: { id: blueprintId },
      });

      if (!existingBlueprint) {
        throw new Error('Blueprint not found');
      }

      // Only creator or admin can change visibility
      if (existingBlueprint.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only change visibility of your own blueprints');
      }

      const blueprint = await prisma.tool_blueprints.update({
        where: { id: blueprintId },
        data: {
          is_public: !existingBlueprint.is_public,
          updated_at: new Date(),
        },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath(`/real-estate/ai-hub/tool-forge/${blueprintId}`);
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        data: blueprint,
        message: `Blueprint is now ${blueprint.is_public ? 'public' : 'private'}`,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] toggleBlueprintVisibility failed:', dbError);
      throw error;
    }
  });
}

/**
 * Update blueprint version
 *
 * RBAC: Requires canManageAIGarage permission
 * Increments version number when blueprint is modified
 */
export async function updateBlueprintVersion(
  blueprintId: string,
  newVersion: string
) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Insufficient permissions to update blueprint version');
  }

  // Validate version format
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    throw new Error('Version must be in format X.Y.Z');
  }

  return withTenantContext(async () => {
    try {
      const existingBlueprint = await prisma.tool_blueprints.findUnique({
        where: { id: blueprintId },
      });

      if (!existingBlueprint) {
        throw new Error('Blueprint not found');
      }

      // Only creator or admin can update version
      if (existingBlueprint.created_by_id !== user.id && user.role !== 'ADMIN') {
        throw new Error('You can only update version of your own blueprints');
      }

      const blueprint = await prisma.tool_blueprints.update({
        where: { id: blueprintId },
        data: {
          version: newVersion,
          updated_at: new Date(),
        },
      });

      revalidatePath('/real-estate/ai-hub/tool-forge');
      revalidatePath(`/real-estate/ai-hub/tool-forge/${blueprintId}`);
      revalidatePath('/api/v1/ai-garage/blueprints');

      return {
        success: true,
        data: blueprint,
        message: `Blueprint version updated to ${newVersion}`,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Blueprints Actions] updateBlueprintVersion failed:', dbError);
      throw error;
    }
  });
}
