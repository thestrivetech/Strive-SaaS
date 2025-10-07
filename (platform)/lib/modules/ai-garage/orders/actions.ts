'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage, canManageAIGarage } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  updateOrderProgressSchema,
  createMilestoneSchema,
  createBuildLogSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type UpdateOrderStatusInput,
  type UpdateOrderProgressInput,
  type CreateMilestoneInput,
  type CreateBuildLogInput,
} from './schemas';
import { calculateEstimatedHours, calculateEstimatedCost } from './utils';
import { getOrderById } from './queries';

/**
 * Create a new agent order
 *
 * RBAC: Requires AI Garage access
 */
export async function createOrder(input: CreateOrderInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Unauthorized: AI Garage access required');
  }

  const validated = createOrderSchema.parse(input);

  // Calculate estimates
  const estimatedHours = calculateEstimatedHours(
    validated.complexity,
    validated.requirements
  );
  const estimatedCost = calculateEstimatedCost(estimatedHours);

  return withTenantContext(async () => {
    try {
      // Get organization ID from user's organization members
      const orgId = user.organization_members?.[0]?.organization_id;
      if (!orgId) {
        throw new Error('User must belong to an organization');
      }

      const order = await prisma.custom_agent_orders.create({
        data: {
          ...validated,
          estimated_hours: estimatedHours,
          estimated_cost: estimatedCost,
          organization_id: orgId,
          created_by_id: user.id,
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
      });

      revalidatePath('/real-estate/ai-hub/orders');
      revalidatePath('/real-estate/ai-hub/dashboard');

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createOrder failed:', dbError);
      throw new Error('Failed to create order');
    }
  });
}

/**
 * Update an existing order
 */
export async function updateOrder(input: UpdateOrderInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Unauthorized: AI Garage access required');
  }

  const validated = updateOrderSchema.parse(input);
  const { id, ...updateData } = validated;

  // Recalculate estimates if complexity or requirements changed
  const extraUpdates: { estimated_hours?: number; estimated_cost?: number } = {};
  if (updateData.complexity || updateData.requirements) {
    const order = await getOrderById(id);
    if (order) {
      const complexity = updateData.complexity || order.complexity;
      const requirements = updateData.requirements || order.requirements;
      extraUpdates.estimated_hours = calculateEstimatedHours(complexity, requirements);
      extraUpdates.estimated_cost = calculateEstimatedCost(extraUpdates.estimated_hours);
    }
  }

  return withTenantContext(async () => {
    try {
      const order = await prisma.custom_agent_orders.update({
        where: { id },
        data: { ...updateData, ...extraUpdates },
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
      });

      revalidatePath('/real-estate/ai-hub/orders');
      revalidatePath(`/real-estate/ai-hub/orders/${id}`);
      revalidatePath('/real-estate/ai-hub/dashboard');

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrder failed:', dbError);
      throw new Error('Failed to update order');
    }
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canAccessAIGarage(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateOrderStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const updateData: any = { status: validated.status };

      // Set timestamps based on status
      if (validated.status === 'SUBMITTED') {
        updateData.submitted_at = new Date();
      } else if (validated.status === 'IN_PROGRESS') {
        updateData.started_at = new Date();
      } else if (validated.status === 'COMPLETED') {
        updateData.completed_at = new Date();
        updateData.progress = 100;
      } else if (validated.status === 'DELIVERED') {
        updateData.delivered_at = new Date();
      }

      const order = await prisma.custom_agent_orders.update({
        where: { id: validated.id },
        data: updateData,
      });

      // Log status change
      if (validated.notes) {
        await createBuildLog({
          order_id: validated.id,
          stage: 'status_change',
          message: `Status changed to ${validated.status}: ${validated.notes}`,
          log_level: 'INFO',
        });
      }

      revalidatePath('/real-estate/ai-hub/orders');
      revalidatePath(`/real-estate/ai-hub/orders/${validated.id}`);

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrderStatus failed:', dbError);
      throw new Error('Failed to update order status');
    }
  });
}

/**
 * Update order progress
 */
export async function updateOrderProgress(input: UpdateOrderProgressInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateOrderProgressSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const order = await prisma.custom_agent_orders.update({
        where: { id: validated.id },
        data: {
          progress: validated.progress,
          current_stage: validated.current_stage,
        },
      });

      revalidatePath('/real-estate/ai-hub/orders');
      revalidatePath(`/real-estate/ai-hub/orders/${validated.id}`);

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrderProgress failed:', dbError);
      throw new Error('Failed to update progress');
    }
  });
}

/**
 * Create milestone for order
 */
export async function createMilestone(input: CreateMilestoneInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Unauthorized');
  }

  const validated = createMilestoneSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const milestone = await prisma.order_milestones.create({
        data: validated,
      });

      revalidatePath(`/real-estate/ai-hub/orders/${validated.order_id}`);

      return milestone;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createMilestone failed:', dbError);
      throw new Error('Failed to create milestone');
    }
  });
}

/**
 * Create build log entry
 */
export async function createBuildLog(input: CreateBuildLogInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Unauthorized');
  }

  const validated = createBuildLogSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const log = await prisma.build_logs.create({
        data: validated,
      });

      revalidatePath(`/real-estate/ai-hub/orders/${validated.order_id}`);

      return log;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createBuildLog failed:', dbError);
      throw new Error('Failed to create build log');
    }
  });
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated');
  }

  if (!canManageAIGarage(user)) {
    throw new Error('Unauthorized');
  }

  return withTenantContext(async () => {
    try {
      await prisma.custom_agent_orders.delete({
        where: { id: orderId },
      });

      revalidatePath('/real-estate/ai-hub/orders');
      revalidatePath('/real-estate/ai-hub/dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] deleteOrder failed:', dbError);
      throw new Error('Failed to delete order');
    }
  });
}
