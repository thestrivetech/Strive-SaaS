'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { sendSignatureRequestEmail } from '@/lib/email/notifications';
import { requireTransactionAccess } from '../core/permissions';
import {
  CreateSignatureRequestSchema,
  SignDocumentSchema,
  DeclineSignatureSchema,
} from './schemas';
import type {
  CreateSignatureRequestInput,
  SignDocumentInput,
  DeclineSignatureInput,
} from './schemas';

/**
 * Create a signature request for one or more documents
 *
 * This action:
 * - Validates input and user permissions
 * - Verifies loop ownership (organization isolation)
 * - Creates signature request record
 * - Creates individual signature records for each (document × signer) combination
 * - Sends email notifications to all signers
 * - Tracks audit trail
 *
 * @param input - Signature request data
 * @returns Created request with signatures
 * @throws Error if user not authenticated or loop not found
 *
 * @example
 * ```typescript
 * const result = await createSignatureRequest({
 *   loopId: 'loop-123',
 *   title: '123 Main St Purchase Agreement',
 *   message: 'Please review and sign',
 *   documentIds: ['doc-1', 'doc-2'],
 *   signerIds: ['party-1', 'party-2'],
 *   signingOrder: 'PARALLEL',
 *   expiresAt: new Date('2025-10-11')
 * });
 * ```
 */
export async function createSignatureRequest(input: CreateSignatureRequestInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Validate input
  const validated = CreateSignatureRequestSchema.parse(input);

  const organizationId = getUserOrganizationId(user);

  // Verify loop ownership (RLS + org isolation)
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: validated.loopId,
      organization_id: organizationId,
    },
    select: {
      id: true,
      property_address: true,
    },
  });

  if (!loop) {
    throw new Error('Loop not found or access denied');
  }

  // Verify documents belong to this loop
  const documents = await prisma.documents.findMany({
    where: {
      id: { in: validated.documentIds },
      loop_id: validated.loopId,
    },
    select: {
      id: true,
      original_name: true,
    },
  });

  if (documents.length !== validated.documentIds.length) {
    throw new Error('One or more documents not found or not associated with this loop');
  }

  // Verify signers (loop parties) belong to this loop
  const signers = await prisma.loop_parties.findMany({
    where: {
      id: { in: validated.signerIds },
      loop_id: validated.loopId,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (signers.length !== validated.signerIds.length) {
    throw new Error('One or more signers not found or not active in this loop');
  }

  // Create signature request
  const request = await prisma.signature_requests.create({
    data: {
      title: validated.title,
      message: validated.message,
      loop_id: validated.loopId,
      requested_by: user.id,
      signing_order: validated.signingOrder,
      expires_at: validated.expiresAt,
      status: 'PENDING',
    },
    include: {
      loop: {
        select: {
          id: true,
          property_address: true,
        },
      },
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  // Create individual signature records for each (document × signer) combination
  const signaturesToCreate = [];

  for (const document of documents) {
    for (const signer of signers) {
      signaturesToCreate.push({
        document_id: document.id,
        signer_id: signer.id,
        request_id: request.id,
        status: 'PENDING' as const,
      });
    }
  }

  // Bulk create signatures
  await prisma.document_signatures.createMany({
    data: signaturesToCreate,
  });

  // Fetch created signatures with relations for email sending
  const createdSignatures = await prisma.document_signatures.findMany({
    where: {
      request_id: request.id,
    },
    include: {
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
        },
      },
    },
  });

  // Send email notifications to signers
  const { publicConfig } = await import('@/lib/config/public');
  const appUrl = publicConfig.appUrl;
  const emailPromises = createdSignatures.map(async (signature) => {
    try {
      await sendSignatureRequestEmail({
        to: signature.signer.email,
        signerName: signature.signer.name,
        documentName: signature.document.original_name,
        requestTitle: validated.title,
        message: validated.message,
        signUrl: `${appUrl}/transactions/sign/${signature.id}`,
        expiresAt: validated.expiresAt,
      });

      // Update signature status to SENT after successful email
      await prisma.document_signatures.update({
        where: { id: signature.id },
        data: { status: 'SENT' },
      });
    } catch (error) {
      console.error(`Failed to send email to ${signature.signer.email}:`, error);
      // Don't fail the entire request if email fails
    }
  });

  await Promise.all(emailPromises);

  // Update request status to SENT
  await prisma.signature_requests.update({
    where: { id: request.id },
    data: { status: 'SENT' },
  });

  // Revalidate paths
  revalidatePath(`/transactions/${validated.loopId}`);
  revalidatePath('/transactions');

  return {
    success: true,
    request: {
      ...request,
      signatures: createdSignatures,
    },
  };
}

/**
 * Sign a document
 *
 * This action:
 * - Validates signature data
 * - Checks signature status (not already signed, not expired)
 * - Updates signature record with data and metadata
 * - Checks if all signatures in the request are complete
 * - Auto-updates request status if all signatures complete
 *
 * @param input - Signature data
 * @returns Updated signature
 * @throws Error if signature not found, already signed, or expired
 *
 * @example
 * ```typescript
 * const result = await signDocument({
 *   signatureId: 'sig-123',
 *   signatureData: 'data:image/png;base64,...',
 *   authMethod: 'EMAIL',
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...'
 * });
 * ```
 */
export async function signDocument(input: SignDocumentInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Validate input
  const validated = SignDocumentSchema.parse(input);

  // Fetch signature with request info
  const signature = await prisma.document_signatures.findUnique({
    where: { id: validated.signatureId },
    include: {
      request: {
        select: {
          id: true,
          status: true,
          expires_at: true,
          loop_id: true,
        },
      },
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
        },
      },
    },
  });

  if (!signature) {
    throw new Error('Signature not found');
  }

  // Check if already signed
  if (signature.status === 'SIGNED') {
    throw new Error('Document already signed');
  }

  // Check if declined
  if (signature.status === 'DECLINED') {
    throw new Error('Signature was declined');
  }

  // Check if request expired
  if (signature.request.status === 'EXPIRED') {
    throw new Error('Signature request has expired');
  }

  // Check expiration date
  if (signature.request.expires_at && signature.request.expires_at < new Date()) {
    // Mark request as expired
    await prisma.signature_requests.update({
      where: { id: signature.request.id },
      data: { status: 'EXPIRED' },
    });
    throw new Error('Signature request has expired');
  }

  // Update signature
  const updated = await prisma.document_signatures.update({
    where: { id: validated.signatureId },
    data: {
      status: 'SIGNED',
      signed_at: new Date(),
      signature_data: validated.signatureData,
      auth_method: validated.authMethod,
      ip_address: validated.ipAddress,
      user_agent: validated.userAgent,
    },
    include: {
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
        },
      },
    },
  });

  // Check if all signatures in the request are complete
  const allSignatures = await prisma.document_signatures.findMany({
    where: {
      request_id: signature.request.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  const allSigned = allSignatures.every((sig) => sig.status === 'SIGNED');

  if (allSigned) {
    // Update request status to SIGNED (completed)
    await prisma.signature_requests.update({
      where: { id: signature.request.id },
      data: {
        status: 'SIGNED',
        completed_at: new Date(),
      },
    });
  }

  // Revalidate paths
  revalidatePath(`/transactions/${signature.request.loop_id}`);
  revalidatePath(`/transactions/sign/${validated.signatureId}`);

  return {
    success: true,
    signature: updated,
    requestCompleted: allSigned,
  };
}

/**
 * Decline a signature request
 *
 * This action:
 * - Updates signature status to DECLINED
 * - Records decline reason
 * - Updates request status to DECLINED (one decline fails the entire request)
 *
 * @param input - Decline data with reason
 * @returns Updated signature
 * @throws Error if signature not found
 *
 * @example
 * ```typescript
 * const result = await declineSignature({
 *   signatureId: 'sig-123',
 *   reason: 'Terms not acceptable'
 * });
 * ```
 */
export async function declineSignature(input: DeclineSignatureInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check subscription tier access
  requireTransactionAccess(user);

  // Validate input
  const validated = DeclineSignatureSchema.parse(input);

  // Fetch signature
  const signature = await prisma.document_signatures.findUnique({
    where: { id: validated.signatureId },
    include: {
      request: {
        select: {
          id: true,
          loop_id: true,
        },
      },
    },
  });

  if (!signature) {
    throw new Error('Signature not found');
  }

  // Update signature status to DECLINED
  const updated = await prisma.document_signatures.update({
    where: { id: validated.signatureId },
    data: {
      status: 'DECLINED',
      decline_reason: validated.reason,
    },
    include: {
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
        },
      },
    },
  });

  // Update request status to DECLINED (one decline fails the entire request)
  await prisma.signature_requests.update({
    where: { id: signature.request.id },
    data: {
      status: 'DECLINED',
    },
  });

  // Revalidate paths
  revalidatePath(`/transactions/${signature.request.loop_id}`);
  revalidatePath(`/transactions/sign/${validated.signatureId}`);

  return {
    success: true,
    signature: updated,
  };
}
