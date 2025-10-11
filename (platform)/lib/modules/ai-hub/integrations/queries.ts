'use server';

import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export async function getIntegrations() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  return await prisma.integrations.findMany({
    where: { organization_id: organizationId },
    orderBy: { updated_at: 'desc' },
  });
}

export async function getIntegrationStats() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const organizationId = user.organization_members[0]?.organization_id;
  if (!organizationId) throw new Error('No organization membership');

  await setTenantContext({ organizationId, userId: user.id });

  const integrations = await prisma.integrations.findMany({
    where: { organization_id: organizationId },
  });

  const total = integrations.length;
  const connected = integrations.filter(i => i.status === 'CONNECTED').length;
  const disconnected = integrations.filter(i => i.status === 'DISCONNECTED').length;
  const error = integrations.filter(i => i.status === 'ERROR').length;

  return {
    total,
    connected,
    disconnected,
    error,
  };
}
