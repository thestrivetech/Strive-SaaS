'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { revalidatePath } from 'next/cache';
import {
  canManageUsers,
  canManageFeatureFlags,
  canManageSystemAlerts,
} from '@/lib/auth/rbac';
import { logAdminAction } from './audit';
import {
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  createSystemAlertSchema,
  updateSystemAlertSchema,
  suspendUserSchema,
  type CreateFeatureFlagInput,
  type UpdateFeatureFlagInput,
  type CreateSystemAlertInput,
  type UpdateSystemAlertInput,
  type SuspendUserInput,
} from './schemas';

/**
 * Create feature flag
 */
export async function createFeatureFlag(input: CreateFeatureFlagInput) {
  const user = await getCurrentUser();

  if (!user || !canManageFeatureFlags(user.role)) {
    throw new Error('Unauthorized');
  }

  const validated = createFeatureFlagSchema.parse(input);

  try {
    const flag = await prisma.feature_flags.create({
      data: {
        name: validated.name,
        description: validated.description,
        is_enabled: validated.isEnabled,
        rollout_percent: validated.rolloutPercent,
        target_tiers: validated.targetTiers,
        target_orgs: validated.targetOrgs,
        target_users: validated.targetUsers,
        environment: validated.environment,
        category: validated.category,
        created_by: user.id,
      },
    });

    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Created feature flag: ${flag.name}`,
      targetType: 'feature_flag',
      targetId: flag.id,
      metadata: { flagName: flag.name, isEnabled: flag.is_enabled },
    });

    revalidatePath('/admin/feature-flags');
    return flag;
  } catch (error: any) {
    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Failed to create feature flag: ${validated.name}`,
      targetType: 'feature_flag',
      targetId: 'new',
      success: false,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(input: UpdateFeatureFlagInput) {
  const user = await getCurrentUser();

  if (!user || !canManageFeatureFlags(user.role)) {
    throw new Error('Unauthorized');
  }

  const validated = updateFeatureFlagSchema.parse(input);
  const { id, ...data } = validated;

  // Map camelCase to snake_case
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isEnabled !== undefined) updateData.is_enabled = data.isEnabled;
  if (data.rolloutPercent !== undefined) updateData.rollout_percent = data.rolloutPercent;
  if (data.targetTiers !== undefined) updateData.target_tiers = data.targetTiers;
  if (data.targetOrgs !== undefined) updateData.target_orgs = data.targetOrgs;
  if (data.targetUsers !== undefined) updateData.target_users = data.targetUsers;
  if (data.environment !== undefined) updateData.environment = data.environment;
  if (data.category !== undefined) updateData.category = data.category;

  try {
    const flag = await prisma.feature_flags.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Updated feature flag: ${flag.name}`,
      targetType: 'feature_flag',
      targetId: flag.id,
      metadata: { changes: data },
    });

    revalidatePath('/admin/feature-flags');
    return flag;
  } catch (error: any) {
    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Failed to update feature flag: ${id}`,
      targetType: 'feature_flag',
      targetId: id,
      success: false,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Create system alert
 */
export async function createSystemAlert(input: CreateSystemAlertInput) {
  const user = await getCurrentUser();

  if (!user || !canManageSystemAlerts(user.role)) {
    throw new Error('Unauthorized');
  }

  const validated = createSystemAlertSchema.parse(input);

  const alert = await prisma.system_alerts.create({
    data: {
      title: validated.title,
      message: validated.message,
      level: validated.level,
      category: validated.category,
      is_global: validated.isGlobal,
      target_roles: validated.targetRoles,
      target_tiers: validated.targetTiers,
      target_orgs: validated.targetOrgs,
      is_dismissible: validated.isDismissible,
      auto_hide_after: validated.autoHideAfter,
      starts_at: validated.startsAt,
      ends_at: validated.endsAt,
      created_by: user.id,
    },
  });

  await logAdminAction({
    action: 'SYSTEM_CONFIG_UPDATE',
    description: `Created system alert: ${alert.title}`,
    targetType: 'system_alert',
    targetId: alert.id,
  });

  revalidatePath('/admin/alerts');
  return alert;
}

/**
 * Update system alert
 */
export async function updateSystemAlert(input: UpdateSystemAlertInput) {
  const user = await getCurrentUser();

  if (!user || !canManageSystemAlerts(user.role)) {
    throw new Error('Unauthorized');
  }

  const validated = updateSystemAlertSchema.parse(input);
  const { id, ...data } = validated;

  // Map camelCase to snake_case
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.message !== undefined) updateData.message = data.message;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal;
  if (data.targetRoles !== undefined) updateData.target_roles = data.targetRoles;
  if (data.targetTiers !== undefined) updateData.target_tiers = data.targetTiers;
  if (data.targetOrgs !== undefined) updateData.target_orgs = data.targetOrgs;
  if (data.isDismissible !== undefined) updateData.is_dismissible = data.isDismissible;
  if (data.autoHideAfter !== undefined) updateData.auto_hide_after = data.autoHideAfter;
  if (data.startsAt !== undefined) updateData.starts_at = data.startsAt;
  if (data.endsAt !== undefined) updateData.ends_at = data.endsAt;

  const alert = await prisma.system_alerts.update({
    where: { id },
    data: updateData,
  });

  await logAdminAction({
    action: 'SYSTEM_CONFIG_UPDATE',
    description: `Updated system alert: ${alert.title}`,
    targetType: 'system_alert',
    targetId: alert.id,
  });

  revalidatePath('/admin/alerts');
  return alert;
}

/**
 * Suspend user
 * TODO: Add suspension fields to users table (is_suspended, suspended_until, suspended_reason)
 */
export async function suspendUser(input: SuspendUserInput) {
  const user = await getCurrentUser();

  if (!user || !canManageUsers(user.role)) {
    throw new Error('Unauthorized');
  }

  const validated = suspendUserSchema.parse(input);

  // TODO: Update when suspension fields are added to schema
  // For now, deactivate the user
  const targetUser = await prisma.users.update({
    where: { id: validated.userId },
    data: {
      is_active: false,
    },
  });

  await logAdminAction({
    action: 'USER_SUSPEND',
    description: `Suspended user: ${targetUser.email}`,
    targetType: 'user',
    targetId: targetUser.id,
    metadata: {
      reason: validated.reason,
      suspendedUntil: validated.suspendUntil,
    },
  });

  revalidatePath('/admin/users');
  return targetUser;
}

/**
 * Reactivate suspended user
 * TODO: Add suspension fields to users table (is_suspended, suspended_until, suspended_reason)
 */
export async function reactivateUser(userId: string) {
  const user = await getCurrentUser();

  if (!user || !canManageUsers(user.role)) {
    throw new Error('Unauthorized');
  }

  // TODO: Update when suspension fields are added to schema
  // For now, reactivate the user
  const targetUser = await prisma.users.update({
    where: { id: userId },
    data: {
      is_active: true,
    },
  });

  await logAdminAction({
    action: 'USER_UPDATE',
    description: `Reactivated user: ${targetUser.email}`,
    targetType: 'user',
    targetId: targetUser.id,
  });

  revalidatePath('/admin/users');
  return targetUser;
}
