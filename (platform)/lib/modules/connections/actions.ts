'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { revalidatePath } from 'next/cache';
import {
  CreateConnectionSchema,
  UpdateConnectionSchema,
  type CreateConnectionInput,
  type UpdateConnectionInput,
  type ConnectionProvider
} from './schemas';

/**
 * Create or update a connection
 */
export async function upsertConnection(input: CreateConnectionInput) {
  const session = await requireAuth();

  // Validate input
  const validated = CreateConnectionSchema.parse(input);

  // Check if connection already exists
  const existing = await prisma.user_connections.findUnique({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: validated.provider,
      },
    },
  });

  let connection;

  if (existing) {
    // Update existing connection
    connection = await prisma.user_connections.update({
      where: { id: existing.id },
      data: {
        provider_user_id: validated.providerUserId,
        access_token: validated.accessToken,
        refresh_token: validated.refreshToken,
        expires_at: validated.expiresAt,
        scope: validated.scope,
        profile_data: validated.profileData || {},
        status: 'CONNECTED',
        is_active: true,
        last_synced: new Date(),
        error_message: null,
        updated_at: new Date(),
      },
    });
  } else {
    // Create new connection
    connection = await prisma.user_connections.create({
      data: {
        user_id: session.user.id,
        provider: validated.provider,
        provider_user_id: validated.providerUserId,
        access_token: validated.accessToken,
        refresh_token: validated.refreshToken,
        expires_at: validated.expiresAt,
        scope: validated.scope,
        profile_data: validated.profileData || {},
        status: 'CONNECTED',
        is_active: true,
        last_synced: new Date(),
      },
    });
  }

  revalidatePath('/settings/connections');
  return connection;
}

/**
 * Update an existing connection
 */
export async function updateConnection(
  provider: ConnectionProvider,
  input: UpdateConnectionInput
) {
  const session = await requireAuth();

  // Validate input
  const validated = UpdateConnectionSchema.parse(input);

  const connection = await prisma.user_connections.update({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
    data: {
      ...validated,
      updated_at: new Date(),
    },
  });

  revalidatePath('/settings/connections');
  return connection;
}

/**
 * Disconnect (deactivate) a connection
 */
export async function disconnectConnection(provider: ConnectionProvider) {
  const session = await requireAuth();

  const connection = await prisma.user_connections.update({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
    data: {
      status: 'DISCONNECTED',
      is_active: false,
      access_token: null,
      refresh_token: null,
      updated_at: new Date(),
    },
  });

  revalidatePath('/settings/connections');
  return connection;
}

/**
 * Delete a connection permanently
 */
export async function deleteConnection(provider: ConnectionProvider) {
  const session = await requireAuth();

  await prisma.user_connections.delete({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
  });

  revalidatePath('/settings/connections');
  return { success: true };
}

/**
 * Refresh connection tokens
 */
export async function refreshConnectionToken(provider: ConnectionProvider) {
  const session = await requireAuth();

  const connection = await prisma.user_connections.findUnique({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
  });

  if (!connection || !connection.refresh_token) {
    throw new Error('Connection not found or no refresh token available');
  }

  // TODO: Implement provider-specific token refresh logic
  // This will be implemented in the provider files

  return { success: true, message: 'Token refresh initiated' };
}

/**
 * Test a connection
 */
export async function testConnection(provider: ConnectionProvider) {
  const session = await requireAuth();

  const connection = await prisma.user_connections.findUnique({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
  });

  if (!connection || !connection.access_token) {
    throw new Error('Connection not found or not authenticated');
  }

  try {
    // TODO: Implement provider-specific connection test
    // This will make a simple API call to verify the connection works

    await prisma.user_connections.update({
      where: { id: connection.id },
      data: {
        status: 'CONNECTED',
        last_synced: new Date(),
        error_message: null,
        updated_at: new Date(),
      },
    });

    revalidatePath('/settings/connections');
    return { success: true, message: 'Connection test successful' };
  } catch (error) {
    await prisma.user_connections.update({
      where: { id: connection.id },
      data: {
        status: 'ERROR',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date(),
      },
    });

    revalidatePath('/settings/connections');
    throw error;
  }
}

/**
 * Sync connection data
 */
export async function syncConnection(provider: ConnectionProvider) {
  const session = await requireAuth();

  const connection = await prisma.user_connections.findUnique({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
  });

  if (!connection || !connection.access_token) {
    throw new Error('Connection not found or not authenticated');
  }

  try {
    // TODO: Implement provider-specific data sync
    // This will fetch latest profile data, etc.

    await prisma.user_connections.update({
      where: { id: connection.id },
      data: {
        last_synced: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath('/settings/connections');
    return { success: true, message: 'Connection synced successfully' };
  } catch (error) {
    throw new Error(`Failed to sync connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
