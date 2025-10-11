import 'server-only';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { IntegrationStatus } from '@prisma/client';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageAIHub } from '@/lib/auth/rbac';
import {
  encryptCredentials,
  decryptCredentials,
  testProviderConnection,
} from './utils';
import type {
  CreateIntegrationInput,
  UpdateIntegrationInput,
  TestConnectionInput,
  ExecuteIntegrationInput,
} from './schemas';

/**
 * Create new integration
 * RBAC: canManageAIHub() required
 */
export async function createIntegration(input: CreateIntegrationInput) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId: input.organizationId });

  // Encrypt credentials before storing
  const encryptedCredentials = encryptCredentials(input.credentials);

  const integration = await prisma.integrations.create({
    data: {
      name: input.name,
      provider: input.provider,
      description: input.description,
      credentials: encryptedCredentials,
      config: input.config || {},
      organization_id: input.organizationId,
      created_by: session.id,
      status: IntegrationStatus.DISCONNECTED,
      is_active: true,
    },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/integrations');

  return integration;
}

/**
 * Update integration
 * RBAC: canManageAIHub() required
 */
export async function updateIntegration(
  id: string,
  organizationId: string,
  input: UpdateIntegrationInput
) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Verify ownership
  const existing = await prisma.integrations.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!existing) {
    throw new Error('Integration not found');
  }

  // Encrypt credentials if provided
  const updateData: any = {
    ...input,
  };

  if (input.credentials) {
    updateData.credentials = encryptCredentials(input.credentials);
  }

  const integration = await prisma.integrations.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/integrations');

  return integration;
}

/**
 * Delete integration
 * RBAC: canManageAIHub() required
 */
export async function deleteIntegration(id: string, organizationId: string) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Verify ownership
  const existing = await prisma.integrations.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!existing) {
    throw new Error('Integration not found');
  }

  await prisma.integrations.delete({
    where: { id },
  });

  revalidatePath('/real-estate/ai-hub');
  revalidatePath('/api/v1/ai-hub/integrations');

  return { success: true };
}

/**
 * Test integration connection
 */
export async function testConnection(input: TestConnectionInput) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  // Test without storing (for pre-creation validation)
  const result = await testProviderConnection(input.provider, input.credentials);

  return result;
}

/**
 * Test existing integration
 */
export async function testExistingIntegration(id: string, organizationId: string) {
  const session = await requireAuth();

  if (!canManageAIHub(session)) {
    throw new Error('Unauthorized: AI Hub management permission required');
  }

  await setTenantContext({ organizationId });

  // Get integration
  const integration = await prisma.integrations.findFirst({
    where: { id, organization_id: organizationId },
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Decrypt credentials
  const credentials = decryptCredentials(integration.credentials);

  // Test connection
  const result = await testProviderConnection(integration.provider, credentials);

  // Update status based on test result
  await prisma.integrations.update({
    where: { id },
    data: {
      status: result.success ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
      last_tested: new Date(),
    },
  });

  revalidatePath('/real-estate/ai-hub');

  return result;
}

/**
 * Execute integration action (used by workflows)
 */
export async function executeIntegration(input: ExecuteIntegrationInput) {
  await setTenantContext({ organizationId: input.organizationId });

  // Get integration
  const integration = await prisma.integrations.findFirst({
    where: {
      id: input.integrationId,
      organization_id: input.organizationId,
    },
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  if (!integration.is_active) {
    throw new Error('Integration is not active');
  }

  // Decrypt credentials
  const credentials = decryptCredentials(integration.credentials);

  // Execute provider-specific action
  let result: any;

  try {
    switch (integration.provider) {
      case 'SLACK': {
        const { sendSlackMessage, postSlackThread, uploadSlackFile } =
          await import('./providers/slack');

        if (input.action === 'sendMessage') {
          result = await sendSlackMessage(credentials, input.params || {});
        } else if (input.action === 'postThread') {
          result = await postSlackThread(credentials, input.params || {});
        } else if (input.action === 'uploadFile') {
          result = await uploadSlackFile(credentials, input.params || {});
        } else {
          throw new Error(`Unknown Slack action: ${input.action}`);
        }
        break;
      }

      case 'GMAIL': {
        const { sendGmail } = await import('./providers/gmail');

        if (input.action === 'sendEmail') {
          result = await sendGmail(credentials, input.params || {});
        } else {
          throw new Error(`Unknown Gmail action: ${input.action}`);
        }
        break;
      }

      case 'WEBHOOK': {
        const { sendWebhook } = await import('./providers/webhook');
        result = await sendWebhook(credentials, input.params || {});
        break;
      }

      case 'HTTP': {
        const { executeHTTPRequest } = await import('./providers/http');
        result = await executeHTTPRequest(credentials, input.params || {});
        break;
      }

      default:
        throw new Error(`Unknown provider: ${integration.provider}`);
    }

    // Update last_used timestamp
    await prisma.integrations.update({
      where: { id: integration.id },
      data: { last_used: new Date() },
    });

    return {
      success: true,
      output: result,
      timestamp: new Date(),
    };
  } catch (error: any) {
    // Update status to ERROR
    await prisma.integrations.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.ERROR },
    });

    throw new Error(`Integration execution failed: ${error.message}`);
  }
}
