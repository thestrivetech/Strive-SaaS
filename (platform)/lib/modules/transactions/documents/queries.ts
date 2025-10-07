'use server';

import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { prisma } from '@/lib/prisma';
import type { QueryDocumentsInput } from './schemas';
import { calculatePagination, createPaginatedResult, type PaginationParams, type PaginatedResult } from '../types/pagination';

/**
 * Get all documents for a transaction loop
 *
 * This query:
 * - Enforces organization isolation via loop ownership
 * - Includes uploader information
 * - Includes version history
 * - Orders by most recent first
 * - Supports filtering by category and status
 * - Returns paginated results
 *
 * @param params - Query parameters (loopId, optional filters)
 * @param paginationParams - Pagination parameters (page, limit)
 * @returns {Promise<PaginatedResult>} Paginated list of documents with related data
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If loop not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * const result = await getDocumentsByLoop({
 *   loopId: 'loop-123',
 *   category: 'contract',
 *   status: 'REVIEWED',
 * }, { page: 1, limit: 20 });
 * console.log(`Showing ${result.data.length} of ${result.pagination.total} documents`);
 * ```
 */
export async function getDocumentsByLoop(
  params: QueryDocumentsInput,
  paginationParams: PaginationParams = {}
): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.documents.findMany>>[number]>> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { loopId, category, status, search } = params;
  const { page, limit, skip } = calculatePagination(paginationParams);

  // Verify loop ownership (organization isolation)
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: getUserOrganizationId(user),
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Build where clause with optional filters
  const where: any = {
    loop_id: loopId,
  };

  if (category) {
    where.category = category;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { filename: { contains: search, mode: 'insensitive' } },
      { original_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Parallel query for count and data
  const [documents, total] = await Promise.all([
    prisma.documents.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: { version_number: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip,
    }),
    prisma.documents.count({ where }),
  ]);

  return createPaginatedResult(documents, total, page, limit);
}

/**
 * Get a single document by ID with full details
 *
 * This query:
 * - Enforces organization isolation via loop ownership
 * - Includes uploader information
 * - Includes complete version history
 * - Includes loop information
 *
 * @param documentId - ID of the document to retrieve
 * @returns {Promise<any>} Document with full related data
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If document not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * const document = await getDocumentById('doc-123');
 * console.log(document.versions.length); // Number of versions
 * ```
 */
export async function getDocumentById(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      loop: {
        select: {
          id: true,
          property_address: true,
          transaction_type: true,
          status: true,
        },
      },
      versions: {
        orderBy: { version_number: 'desc' },
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

  if (!document) {
    throw new Error('Document not found');
  }

  return document;
}

/**
 * Get version history for a document
 *
 * This query:
 * - Enforces organization isolation via loop ownership
 * - Includes creator information for each version
 * - Orders by version number (newest first)
 *
 * @param documentId - ID of the document
 * @returns {Promise<Array>} List of document versions
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If document not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * const versions = await getDocumentVersions('doc-123');
 * console.log(versions[0].version_number); // Latest version number
 * ```
 */
export async function getDocumentVersions(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify document ownership first
  const document = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Get version history
  const versions = await prisma.document_versions.findMany({
    where: {
      document_id: documentId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { version_number: 'desc' },
  });

  return versions;
}

/**
 * Get document statistics for a transaction loop
 *
 * Returns counts of documents by category and status.
 *
 * @param loopId - ID of the transaction loop
 * @returns {Promise<object>} Statistics object
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If loop not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * const stats = await getDocumentStats('loop-123');
 * console.log(stats.totalDocuments); // Total number of documents
 * console.log(stats.byCategory.contract); // Number of contracts
 * ```
 */
export async function getDocumentStats(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify loop ownership
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: getUserOrganizationId(user),
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Get all documents for the loop
  const documents = await prisma.documents.findMany({
    where: {
      loop_id: loopId,
    },
    select: {
      category: true,
      status: true,
    },
  });

  // Calculate statistics
  const stats = {
    totalDocuments: documents.length,
    byCategory: {
      contract: 0,
      disclosure: 0,
      inspection: 0,
      appraisal: 0,
      title: 0,
      other: 0,
    },
    byStatus: {
      DRAFT: 0,
      PENDING: 0,
      REVIEWED: 0,
      SIGNED: 0,
      ARCHIVED: 0,
    },
  };

  documents.forEach(doc => {
    if (doc.category) {
      stats.byCategory[doc.category as keyof typeof stats.byCategory]++;
    }
    stats.byStatus[doc.status as keyof typeof stats.byStatus]++;
  });

  return stats;
}
