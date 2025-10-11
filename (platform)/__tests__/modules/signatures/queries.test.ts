import {
  getSignatureRequest,
  getSignatureRequestsByLoop,
  getPendingSignatures,
  getSignatureById,
  getSignatureStats,
} from '@/lib/modules/workspace/signatures/queries';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    signature_requests: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    document_signatures: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    transaction_loops: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Signature Queries', () => {
  const mockUser = {
    id: 'cm1usr123456789012345',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    subscription_tier: 'FREE' as const,
    organization_members: [
      {
        id: 'cm1mem123456789012345',
        user_id: 'cm1usr123456789012345',
        organization_id: 'cm1org123456789012345',
        role: 'ADMIN' as const,
        organizations: {
          id: 'cm1org123456789012345',
          name: 'Test Organization',
        },
      },
    ],
  };

  const mockRequest = {
    id: 'cm1req123456789012345',
    title: '123 Test St Purchase Agreement',
    message: 'Please review and sign',
    status: 'SENT' as const,
    signing_order: 'PARALLEL' as const,
    expires_at: new Date('2025-10-11'),
    completed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    loop_id: 'cm1abc123456789012345',
    requested_by: 'cm1usr123456789012345',
    loop: {
      id: 'cm1abc123456789012345',
      property_address: '123 Test St',
      transaction_type: 'PURCHASE_AGREEMENT' as const,
      status: 'ACTIVE' as const,
    },
    requester: {
      id: 'cm1usr123456789012345',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: null,
    },
    signatures: [
      {
        id: 'cm1sig123456789012345',
        status: 'SIGNED' as const,
        signed_at: new Date(),
        signature_data: 'data:image/png...',
        document_id: 'cm1doc123456789012345',
        signer_id: 'cm1par123456789012345',
        request_id: 'cm1req123456789012345',
        signer: {
          id: 'cm1par123456789012345',
          name: 'John Buyer',
          email: 'john@example.com',
          role: 'BUYER' as const,
        },
        document: {
          id: 'cm1doc123456789012345',
          original_name: 'Purchase Agreement.pdf',
          filename: 'purchase-agreement.pdf',
          mime_type: 'application/pdf',
          file_size: 102400,
        },
      },
      {
        id: 'cm1sig223456789012345',
        status: 'PENDING' as const,
        signed_at: null,
        signature_data: null,
        document_id: 'cm1doc123456789012345',
        signer_id: 'cm1par223456789012345',
        request_id: 'cm1req123456789012345',
        signer: {
          id: 'cm1par223456789012345',
          name: 'Jane Seller',
          email: 'jane@example.com',
          role: 'SELLER' as const,
        },
        document: {
          id: 'cm1doc123456789012345',
          original_name: 'Purchase Agreement.pdf',
          filename: 'purchase-agreement.pdf',
          mime_type: 'application/pdf',
          file_size: 102400,
        },
      },
    ],
  };

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    jest.clearAllMocks();
  });

  describe('getSignatureRequest', () => {
    it('should return signature request with all details', async () => {
      (prisma.signature_requests.findFirst as jest.Mock).mockResolvedValue(mockRequest);

      const result = await getSignatureRequest('cm1req123456789012345');

      expect(result).toEqual(mockRequest);
      expect(result.signatures).toHaveLength(2);
      expect(result.loop).toBeDefined();
      expect(result.requester).toBeDefined();

      expect(prisma.signature_requests.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cm1req123456789012345',
          loop: {
            organization_id: 'cm1org123456789012345',
          },
        },
        include: expect.any(Object),
      });
    });

    it('should throw error if not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getSignatureRequest('cm1req123456789012345')).rejects.toThrow('Unauthorized');
    });

    it('should throw error if request not found', async () => {
      (prisma.signature_requests.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getSignatureRequest('cm1xxx222222222222222')).rejects.toThrow('not found');
    });
  });

  describe('getSignatureRequestsByLoop', () => {
    it('should return paginated requests for a loop', async () => {
      const mockRequests = [mockRequest];

      (prisma.signature_requests.findMany as jest.Mock).mockResolvedValue(mockRequests);
      (prisma.signature_requests.count as jest.Mock).mockResolvedValue(1);
      (prisma.document_signatures.groupBy as jest.Mock).mockResolvedValue([
        { status: 'SIGNED', _count: 1 },
        { status: 'PENDING', _count: 1 },
      ]);

      const result = await getSignatureRequestsByLoop({
        loopId: 'cm1abc123456789012345',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.requests).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);

      expect(result.requests[0].signatureStats).toEqual({
        SIGNED: 1,
        PENDING: 1,
      });
    });

    it('should filter by status', async () => {
      (prisma.signature_requests.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.signature_requests.count as jest.Mock).mockResolvedValue(0);

      await getSignatureRequestsByLoop({
        loopId: 'cm1abc123456789012345',
        status: 'SIGNED',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.signature_requests.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'SIGNED',
        }),
        include: expect.any(Object),
        orderBy: expect.any(Object),
        skip: 0,
        take: 10,
      });
    });

    it('should throw error if not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(
        getSignatureRequestsByLoop({
          loopId: 'cm1abc123456789012345',
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getPendingSignatures', () => {
    it('should return pending signatures for user organization', async () => {
      const mockSignatures = [
        {
          id: 'cm1sig123456789012345',
          status: 'SENT' as const,
          signer: {
            id: 'cm1par123456789012345',
            name: 'John Buyer',
            email: 'john@example.com',
            role: 'BUYER' as const,
          },
          document: {
            id: 'cm1doc123456789012345',
            original_name: 'Purchase Agreement.pdf',
            filename: 'purchase-agreement.pdf',
          },
          request: {
            id: 'cm1req123456789012345',
            title: '123 Test St Purchase Agreement',
            message: 'Please review and sign',
            expires_at: new Date('2025-10-11'),
            loop_id: 'cm1abc123456789012345',
          },
        },
      ];

      (prisma.document_signatures.findMany as jest.Mock).mockResolvedValue(mockSignatures);

      const result = await getPendingSignatures();

      expect(result).toEqual(mockSignatures);
      expect(prisma.document_signatures.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: ['PENDING', 'SENT', 'VIEWED'],
          },
          request: {
            loop: {
              organization_id: 'cm1org123456789012345',
            },
            status: {
              in: ['PENDING', 'SENT'],
            },
          },
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
        take: 50,
      });
    });

    it('should throw error if not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getPendingSignatures()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSignatureById', () => {
    it('should return signature details (no auth required)', async () => {
      const mockSignature = {
        id: 'cm1sig123456789012345',
        status: 'SENT' as const,
        signed_at: null,
        signature_data: null,
        document_id: 'cm1doc123456789012345',
        signer_id: 'cm1par123456789012345',
        request_id: 'cm1req123456789012345',
        signer: {
          id: 'cm1par123456789012345',
          name: 'John Buyer',
          email: 'john@example.com',
          role: 'BUYER' as const,
        },
        document: {
          id: 'cm1doc123456789012345',
          original_name: 'Purchase Agreement.pdf',
          filename: 'purchase-agreement.pdf',
          mime_type: 'application/pdf',
          file_size: 102400,
          storage_key: 'documents/loop-1/doc-1.pdf',
        },
        request: {
          id: 'cm1req123456789012345',
          title: '123 Test St Purchase Agreement',
          message: 'Please review and sign',
          status: 'SENT' as const,
          expires_at: new Date('2025-10-11'),
          signing_order: 'PARALLEL' as const,
          loop: {
            id: 'cm1abc123456789012345',
            property_address: '123 Test St',
            transaction_type: 'PURCHASE_AGREEMENT' as const,
          },
        },
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);

      const result = await getSignatureById('cm1sig123456789012345');

      expect(result).toEqual(mockSignature);
      expect(result.signer).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.request.loop).toBeDefined();
    });

    it('should throw error if not found', async () => {
      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getSignatureById('cm1xxx222222222222222')).rejects.toThrow('not found');
    });
  });

  describe('getSignatureStats', () => {
    it('should return signature statistics for a loop', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue({
        id: 'cm1abc123456789012345',
      });

      (prisma.signature_requests.groupBy as jest.Mock).mockResolvedValue([
        { status: 'SENT', _count: 2 },
        { status: 'SIGNED', _count: 1 },
      ]);

      (prisma.document_signatures.count as jest.Mock)
        .mockResolvedValueOnce(10) // Total signatures
        .mockResolvedValueOnce(6); // Signed signatures

      const result = await getSignatureStats('cm1abc123456789012345');

      expect(result.requests.total).toBe(3);
      expect(result.requests.SENT).toBe(2);
      expect(result.requests.SIGNED).toBe(1);
      expect(result.signatures.total).toBe(10);
      expect(result.signatures.signed).toBe(6);
      expect(result.signatures.pending).toBe(4);
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getSignatureStats('cm1xxx222222222222222')).rejects.toThrow(
        'Loop not found or access denied'
      );
    });

    it('should throw error if not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getSignatureStats('cm1abc123456789012345')).rejects.toThrow('Unauthorized');
    });
  });
});
