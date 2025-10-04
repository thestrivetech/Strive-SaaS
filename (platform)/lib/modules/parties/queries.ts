'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { QueryPartiesSchema, type QueryPartiesInput } from './schemas';

/**
 * Get all parties for a transaction loop
 *
 * @param input - Query parameters with loop ID and optional filters
 * @returns Array of parties with loop information
 * @throws Error if user not authenticated or loop not found
 */
export async function getPartiesByLoop(input: QueryPartiesInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Validate input
  const validated = QueryPartiesSchema.parse(input);
  const { loopId, status, role } = validated;

  const organizationId = getUserOrganizationId(user);

  // Verify loop exists and belongs to user's organization
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Build where clause
  const where = {
    loop_id: loopId,
    ...(status && { status }),
    ...(role && { role }),
  };

  // Get parties with counts
  const parties = await prisma.loop_parties.findMany({
    where,
    include: {
      _count: {
        select: {
          signatures: true,
          assigned_tasks: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // Active parties first
      { role: 'asc' },   // Then by role
      { invited_at: 'desc' }, // Most recent first
    ],
  });

  return parties;
}

/**
 * Get a single party by ID
 *
 * @param partyId - Party ID
 * @returns Party with full details including signatures and tasks
 * @throws Error if user not authenticated or party not found
 */
export async function getPartyById(partyId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get party with full details
  const party = await prisma.loop_parties.findFirst({
    where: {
      id: partyId,
      loop: {
        organization_id: organizationId,
      },
    },
    include: {
      loop: {
        select: {
          id: true,
          property_address: true,
          transaction_type: true,
          status: true,
        },
      },
      signatures: {
        include: {
          request: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          document: {
            select: {
              id: true,
              filename: true,
              original_name: true,
            },
          },
        },
      },
      assigned_tasks: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!party) {
    throw new Error('Party not found');
  }

  return party;
}

/**
 * Get party statistics for a loop
 *
 * @param loopId - Loop ID
 * @returns Party statistics (counts by role, status, etc.)
 * @throws Error if user not authenticated
 */
export async function getPartyStats(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify loop access
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Get party counts
  const [
    totalParties,
    activeParties,
    pendingSignatures,
    completedSignatures,
  ] = await Promise.all([
    // Total parties
    prisma.loop_parties.count({
      where: { loop_id: loopId },
    }),
    // Active parties
    prisma.loop_parties.count({
      where: {
        loop_id: loopId,
        status: 'ACTIVE',
      },
    }),
    // Pending signatures by parties
    prisma.document_signatures.count({
      where: {
        document: {
          loop_id: loopId,
        },
        status: {
          in: ['PENDING', 'SENT', 'VIEWED'],
        },
      },
    }),
    // Completed signatures by parties
    prisma.document_signatures.count({
      where: {
        document: {
          loop_id: loopId,
        },
        status: 'SIGNED',
      },
    }),
  ]);

  return {
    totalParties,
    activeParties,
    inactiveParties: totalParties - activeParties,
    pendingSignatures,
    completedSignatures,
  };
}

/**
 * Type for party with counts
 */
export type PartyWithCounts = Awaited<ReturnType<typeof getPartiesByLoop>>[number];

/**
 * Type for party with full details
 */
export type PartyWithDetails = Awaited<ReturnType<typeof getPartyById>>;

/**
 * Type for party statistics
 */
export type PartyStats = Awaited<ReturnType<typeof getPartyStats>>;
