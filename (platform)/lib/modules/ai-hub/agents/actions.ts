'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { AgentStatus } from '@prisma/client';
import {
  createAgentSchema,
  updateAgentSchema,
  executeAgentSchema,
  type CreateAgentInput,
  type UpdateAgentInput,
  type ExecuteAgentInput,
} from './schemas';
import { executeAgent as runAgent } from './execution';
import { validateAgentConfig } from './utils';
import { validateProviderApiKey } from './providers';

/**
 * Create a new AI agent
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function createAgent(input: CreateAgentInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized: AI Hub access required (GROWTH tier minimum)');
  }

  const validated = createAgentSchema.parse(input);

  // Validate agent configuration
  const configValidation = validateAgentConfig(validated.model_config);
  if (!configValidation.valid) {
    throw new Error(`Invalid configuration: ${configValidation.error}`);
  }

  // Validate provider API key
  if (!validateProviderApiKey(validated.model_config.provider)) {
    throw new Error(`API key not configured for provider: ${validated.model_config.provider}`);
  }

  await setTenantContext({ organizationId: user.organizationId });

  const agent = await prisma.ai_agents.create({
    data: {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: validated.name,
      description: validated.description,
      avatar: validated.avatar,
      personality: validated.personality as any,
      model_config: validated.model_config as any,
      capabilities: validated.capabilities,
      memory: validated.memory as any,
      is_active: validated.is_active,
      status: AgentStatus.IDLE,
      organization_id: user.organizationId,
      created_by: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/agents');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return agent;
}

/**
 * Update an existing AI agent
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function updateAgent(input: UpdateAgentInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateAgentSchema.parse(input);
  const { id, ...updateData } = validated;

  // Validate configuration if changed
  if (updateData.model_config) {
    const configValidation = validateAgentConfig(updateData.model_config);
    if (!configValidation.valid) {
      throw new Error(`Invalid configuration: ${configValidation.error}`);
    }

    // Validate provider API key
    if (!validateProviderApiKey(updateData.model_config.provider)) {
      throw new Error(`API key not configured for provider: ${updateData.model_config.provider}`);
    }
  }

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership
  const existing = await prisma.ai_agents.findFirst({
    where: { id, organization_id: user.organizationId },
  });

  if (!existing) {
    throw new Error('Agent not found');
  }

  const agent = await prisma.ai_agents.update({
    where: { id },
    data: {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
      ...(updateData.personality && { personality: updateData.personality as any }),
      ...(updateData.model_config && { model_config: updateData.model_config as any }),
      ...(updateData.capabilities && { capabilities: updateData.capabilities }),
      ...(updateData.memory && { memory: updateData.memory as any }),
      ...(updateData.is_active !== undefined && { is_active: updateData.is_active }),
      ...(updateData.status && { status: updateData.status }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar_url: true },
      },
    },
  });

  revalidatePath('/real-estate/ai-hub/agents');
  revalidatePath(`/real-estate/ai-hub/agents/${id}`);
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return agent;
}

/**
 * Execute an AI agent task
 * RBAC: Requires AI Hub access
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function executeAgent(input: ExecuteAgentInput) {
  const user = await requireAuth();

  if (!canAccessAIHub(user)) {
    throw new Error('Unauthorized');
  }

  const validated = executeAgentSchema.parse(input);

  const execution = await runAgent(
    validated.agentId,
    user.organizationId,
    validated.task,
    validated.context
  );

  revalidatePath(`/real-estate/ai-hub/agents/${validated.agentId}`);

  return execution;
}

/**
 * Delete an AI agent
 * RBAC: Requires AI Hub management permissions
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function deleteAgent(agentId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized: Admin permissions required');
  }

  await setTenantContext({ organizationId: user.organizationId });

  // Verify ownership
  const existing = await prisma.ai_agents.findFirst({
    where: { id: agentId, organization_id: user.organizationId },
  });

  if (!existing) {
    throw new Error('Agent not found');
  }

  await prisma.ai_agents.delete({
    where: { id: agentId },
  });

  revalidatePath('/real-estate/ai-hub/agents');
  revalidatePath('/real-estate/ai-hub/ai-hub-dashboard');

  return { success: true };
}

/**
 * Toggle agent active status
 * RBAC: Requires AI Hub management permissions
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function toggleAgentStatus(agentId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  await setTenantContext({ organizationId: user.organizationId });

  const agent = await prisma.ai_agents.findFirst({
    where: { id: agentId, organization_id: user.organizationId },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  const updated = await prisma.ai_agents.update({
    where: { id: agentId },
    data: { is_active: !agent.is_active },
  });

  revalidatePath('/real-estate/ai-hub/agents');
  revalidatePath(`/real-estate/ai-hub/agents/${agentId}`);

  return updated;
}

/**
 * Reset agent status to IDLE
 * RBAC: Requires AI Hub management permissions
 * Multi-tenancy: ALWAYS filter by organizationId
 */
export async function resetAgentStatus(agentId: string) {
  const user = await requireAuth();

  if (!canManageAIHub(user)) {
    throw new Error('Unauthorized');
  }

  await setTenantContext({ organizationId: user.organizationId });

  const agent = await prisma.ai_agents.findFirst({
    where: { id: agentId, organization_id: user.organizationId },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  const updated = await prisma.ai_agents.update({
    where: { id: agentId },
    data: { status: AgentStatus.IDLE },
  });

  revalidatePath('/real-estate/ai-hub/agents');
  revalidatePath(`/real-estate/ai-hub/agents/${agentId}`);

  return updated;
}
