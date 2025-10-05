import {
  createSignatureRequest,
  signDocument,
  declineSignature,
} from '@/lib/modules/transactions/signatures/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendSignatureRequestEmail } from '@/lib/email/notifications';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/email/notifications');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transaction_loops: {
      findFirst: jest.fn(),
    },
    documents: {
      findMany: jest.fn(),
    },
    loop_parties: {
      findMany: jest.fn(),
    },
    signature_requests: {
      create: jest.fn(),
      update: jest.fn(),
    },
    document_signatures: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Signature Actions', () => {
  const mockUser = {
    id: 'cm1usr123456789012345',
    email: 'test@example.com',
    name: 'Test User',
    role: 'EMPLOYEE' as const,
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

  const mockLoop = {
    id: 'cm1abc123456789012345',
    property_address: '123 Test St',
    organization_id: 'cm1org123456789012345',
  };

  const mockDocuments = [
    {
      id: 'cm1doc123456789012345',
      original_name: 'Purchase Agreement.pdf',
      loop_id: 'cm1abc123456789012345',
    },
    {
      id: 'cm1doc223456789012345',
      original_name: 'Disclosure.pdf',
      loop_id: 'cm1abc123456789012345',
    },
  ];

  const mockSigners = [
    {
      id: 'cm1par123456789012345',
      name: 'John Buyer',
      email: 'john@example.com',
      loop_id: 'cm1abc123456789012345',
      status: 'ACTIVE' as const,
    },
    {
      id: 'cm1par223456789012345',
      name: 'Jane Seller',
      email: 'jane@example.com',
      loop_id: 'cm1abc123456789012345',
      status: 'ACTIVE' as const,
    },
  ];

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (sendSignatureRequestEmail as jest.Mock).mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
    });
    jest.clearAllMocks();
  });

  describe('createSignatureRequest', () => {
    it('should create signature request with valid input', async () => {
      const input = {
        loopId: 'cm1abc123456789012345',
        title: '123 Test St Purchase Agreement',
        message: 'Please review and sign',
        documentIds: ['cm1doc123456789012345', 'cm1doc223456789012345'],
        signerIds: ['cm1par123456789012345', 'cm1par223456789012345'],
        signingOrder: 'PARALLEL' as const,
      };

      // Mock database responses
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prisma.loop_parties.findMany as jest.Mock).mockResolvedValue(mockSigners);

      const createdRequest = {
        id: 'cm1req123456789012345',
        title: input.title,
        message: input.message,
        loop_id: input.loopId,
        requested_by: mockUser.id,
        signing_order: input.signingOrder,
        expires_at: null,
        status: 'PENDING',
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        loop: mockLoop,
        requester: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      };

      (prisma.signature_requests.create as jest.Mock).mockResolvedValue(createdRequest);

      const createdSignatures = [
        {
          id: 'cm1sig123456789012345',
          document_id: 'cm1doc123456789012345',
          signer_id: 'cm1par123456789012345',
          request_id: 'cm1req123456789012345',
          status: 'PENDING',
          signer: mockSigners[0],
          document: mockDocuments[0],
        },
        {
          id: 'cm1sig223456789012345',
          document_id: 'cm1doc123456789012345',
          signer_id: 'cm1par223456789012345',
          request_id: 'cm1req123456789012345',
          status: 'PENDING',
          signer: mockSigners[1],
          document: mockDocuments[0],
        },
        {
          id: 'cm1sig323456789012345',
          document_id: 'cm1doc223456789012345',
          signer_id: 'cm1par123456789012345',
          request_id: 'cm1req123456789012345',
          status: 'PENDING',
          signer: mockSigners[0],
          document: mockDocuments[1],
        },
        {
          id: 'cm1sig423456789012345',
          document_id: 'cm1doc223456789012345',
          signer_id: 'cm1par223456789012345',
          request_id: 'cm1req123456789012345',
          status: 'PENDING',
          signer: mockSigners[1],
          document: mockDocuments[1],
        },
      ];

      (prisma.document_signatures.findMany as jest.Mock).mockResolvedValue(createdSignatures);
      (prisma.document_signatures.update as jest.Mock).mockResolvedValue({});
      (prisma.signature_requests.update as jest.Mock).mockResolvedValue({});

      const result = await createSignatureRequest(input);

      expect(result.success).toBe(true);
      expect(result.request.id).toBe('cm1req123456789012345');
      expect(result.request.signatures).toHaveLength(4);

      // Verify signatures created for all combinations
      expect(prisma.document_signatures.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            document_id: 'cm1doc123456789012345',
            signer_id: 'cm1par123456789012345',
          }),
          expect.objectContaining({
            document_id: 'cm1doc123456789012345',
            signer_id: 'cm1par223456789012345',
          }),
          expect.objectContaining({
            document_id: 'cm1doc223456789012345',
            signer_id: 'cm1par123456789012345',
          }),
          expect.objectContaining({
            document_id: 'cm1doc223456789012345',
            signer_id: 'cm1par223456789012345',
          }),
        ]),
      });

      // Verify emails sent
      expect(sendSignatureRequestEmail).toHaveBeenCalledTimes(4);
    });

    it('should throw error if user not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const input = {
        loopId: 'cm1abc123456789012345',
        title: 'Test',
        documentIds: ['cm1doc123456789012345'],
        signerIds: ['cm1par123456789012345'],
        signingOrder: 'PARALLEL' as const,
      };

      await expect(createSignatureRequest(input)).rejects.toThrow('Unauthorized');
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      const input = {
        loopId: 'cm1xxx111111111111111',
        title: 'Test',
        documentIds: ['cm1doc123456789012345'],
        signerIds: ['cm1par123456789012345'],
        signingOrder: 'PARALLEL' as const,
      };

      await expect(createSignatureRequest(input)).rejects.toThrow(
        'Loop not found or access denied'
      );
    });

    it('should throw error if documents not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue([mockDocuments[0]]); // Only 1 of 2

      const input = {
        loopId: 'cm1abc123456789012345',
        title: 'Test',
        documentIds: ['cm1doc123456789012345', 'cm1doc223456789012345'],
        signerIds: ['cm1par123456789012345'],
        signingOrder: 'PARALLEL' as const,
      };

      await expect(createSignatureRequest(input)).rejects.toThrow(
        'One or more documents not found'
      );
    });
  });

  describe('signDocument', () => {
    it('should sign document successfully', async () => {
      const input = {
        signatureId: 'cm1sig123456789012345',
        signatureData: 'data:image/png;base64,iVBORw0KGgo...',
        authMethod: 'EMAIL' as const,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockSignature = {
        id: 'cm1sig123456789012345',
        status: 'SENT' as const,
        request_id: 'cm1req123456789012345',
        document_id: 'cm1doc123456789012345',
        signer_id: 'cm1par123456789012345',
        request: {
          id: 'cm1req123456789012345',
          status: 'SENT' as const,
          expires_at: new Date(Date.now() + 86400000), // Tomorrow
          loop_id: 'cm1abc123456789012345',
        },
        signer: mockSigners[0],
        document: mockDocuments[0],
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);

      const updatedSignature = {
        ...mockSignature,
        status: 'SIGNED' as const,
        signed_at: new Date(),
        signature_data: input.signatureData,
        auth_method: input.authMethod,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
      };

      (prisma.document_signatures.update as jest.Mock).mockResolvedValue(updatedSignature);

      // Mock: not all signed yet
      (prisma.document_signatures.findMany as jest.Mock).mockResolvedValue([
        { id: 'cm1sig123456789012345', status: 'SIGNED' },
        { id: 'cm1sig223456789012345', status: 'PENDING' },
      ]);

      const result = await signDocument(input);

      expect(result.success).toBe(true);
      expect(result.signature.status).toBe('SIGNED');
      expect(result.requestCompleted).toBe(false);

      expect(prisma.document_signatures.update).toHaveBeenCalledWith({
        where: { id: input.signatureId },
        data: expect.objectContaining({
          status: 'SIGNED',
          signature_data: input.signatureData,
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
        }),
        include: expect.any(Object),
      });
    });

    it('should complete request when all signatures signed', async () => {
      const input = {
        signatureId: 'cm1sig223456789012345',
        signatureData: 'data:image/png;base64,iVBORw0KGgo...',
        authMethod: 'EMAIL' as const,
      };

      const mockSignature = {
        id: 'cm1sig223456789012345',
        status: 'SENT' as const,
        request_id: 'cm1req123456789012345',
        document_id: 'cm1doc123456789012345',
        signer_id: 'cm1par223456789012345',
        request: {
          id: 'cm1req123456789012345',
          status: 'SENT' as const,
          expires_at: new Date(Date.now() + 86400000),
          loop_id: 'cm1abc123456789012345',
        },
        signer: mockSigners[1],
        document: mockDocuments[0],
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);
      (prisma.document_signatures.update as jest.Mock).mockResolvedValue({
        ...mockSignature,
        status: 'SIGNED',
      });

      // Mock: all signatures signed
      (prisma.document_signatures.findMany as jest.Mock).mockResolvedValue([
        { id: 'cm1sig123456789012345', status: 'SIGNED' },
        { id: 'cm1sig223456789012345', status: 'SIGNED' },
      ]);

      (prisma.signature_requests.update as jest.Mock).mockResolvedValue({});

      const result = await signDocument(input);

      expect(result.requestCompleted).toBe(true);
      expect(prisma.signature_requests.update).toHaveBeenCalledWith({
        where: { id: 'cm1req123456789012345' },
        data: expect.objectContaining({
          status: 'SIGNED',
          completed_at: expect.any(Date),
        }),
      });
    });

    it('should throw error if already signed', async () => {
      const input = {
        signatureId: 'cm1sig123456789012345',
        signatureData: 'data:image/png;base64,iVBORw0KGgo...',
        authMethod: 'EMAIL' as const,
      };

      const mockSignature = {
        id: 'cm1sig123456789012345',
        status: 'SIGNED' as const,
        request: {
          id: 'cm1req123456789012345',
          status: 'SENT' as const,
          expires_at: new Date(Date.now() + 86400000),
          loop_id: 'cm1abc123456789012345',
        },
        signer: mockSigners[0],
        document: mockDocuments[0],
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);

      await expect(signDocument(input)).rejects.toThrow('already signed');
    });

    it('should throw error if request expired', async () => {
      const input = {
        signatureId: 'cm1sig123456789012345',
        signatureData: 'data:image/png;base64,iVBORw0KGgo...',
        authMethod: 'EMAIL' as const,
      };

      const mockSignature = {
        id: 'cm1sig123456789012345',
        status: 'SENT' as const,
        request_id: 'cm1req123456789012345',
        request: {
          id: 'cm1req123456789012345',
          status: 'SENT' as const,
          expires_at: new Date(Date.now() - 86400000), // Yesterday
          loop_id: 'cm1abc123456789012345',
        },
        signer: mockSigners[0],
        document: mockDocuments[0],
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);
      (prisma.signature_requests.update as jest.Mock).mockResolvedValue({});

      await expect(signDocument(input)).rejects.toThrow('expired');
    });
  });

  describe('declineSignature', () => {
    it('should decline signature successfully', async () => {
      const input = {
        signatureId: 'cm1sig123456789012345',
        reason: 'Terms not acceptable',
      };

      const mockSignature = {
        id: 'cm1sig123456789012345',
        status: 'SENT' as const,
        request_id: 'cm1req123456789012345',
        request: {
          id: 'cm1req123456789012345',
          loop_id: 'cm1abc123456789012345',
        },
      };

      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(mockSignature);

      const updatedSignature = {
        ...mockSignature,
        status: 'DECLINED' as const,
        decline_reason: input.reason,
        signer: mockSigners[0],
        document: mockDocuments[0],
      };

      (prisma.document_signatures.update as jest.Mock).mockResolvedValue(updatedSignature);
      (prisma.signature_requests.update as jest.Mock).mockResolvedValue({});

      const result = await declineSignature(input);

      expect(result.success).toBe(true);
      expect(result.signature.status).toBe('DECLINED');

      // Verify request also marked as declined
      expect(prisma.signature_requests.update).toHaveBeenCalledWith({
        where: { id: 'cm1req123456789012345' },
        data: { status: 'DECLINED' },
      });
    });

    it('should throw error if signature not found', async () => {
      (prisma.document_signatures.findUnique as jest.Mock).mockResolvedValue(null);

      const input = {
        signatureId: 'cm1xxx222222222222222',
        reason: 'Test reason',
      };

      await expect(declineSignature(input)).rejects.toThrow('not found');
    });
  });
});
