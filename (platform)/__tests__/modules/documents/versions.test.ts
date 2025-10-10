import { createDocumentVersion } from '@/lib/modules/transactions/documents/actions';
import {
  getDocumentsByLoop,
  getDocumentById,
  getDocumentVersions,
  getDocumentStats,
} from '@/lib/modules/transactions/documents/queries';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';
import { storageService } from '@/lib/storage/supabase-storage';
import * as validation from '@/lib/storage/validation';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    transaction_loops: {
      findFirst: jest.fn(),
    },
    documents: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    document_versions: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));
jest.mock('@/lib/storage/supabase-storage', () => ({
  storageService: {
    uploadDocument: jest.fn(),
  },
}));
jest.mock('@/lib/storage/validation');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Document Versioning & Queries', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    subscription_tier: 'FREE' as const,
    organization_members: [
      {
        id: 'org-member-1',
        user_id: 'user-1',
        organization_id: 'org-1',
        role: 'ADMIN' as const,
        organizations: {
          id: 'org-1',
          name: 'Test Organization',
        },
      },
    ],
  };

  const mockLoop = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    property_address: '123 Test St',
    organization_id: 'org-1',
    created_by: 'user-1',
  };

  // Helper to create mock File with arrayBuffer
  const createMockFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const file = new File([blob], filename, { type });

    // Add arrayBuffer method to File mock
    Object.defineProperty(file, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(Buffer.from(content)),
    });

    return file;
  };

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    jest.clearAllMocks();
  });

  describe('createDocumentVersion', () => {
    it('should create new version and archive old version', async () => {
      const fileContent = 'Updated PDF content';
      const file = createMockFile(fileContent, 'contract-v2.pdf', 'application/pdf');

      const formData = new FormData();
      formData.append('file', file);

      const existingDoc = {
        id: 'doc-1',
        filename: 'contract_v1.pdf',
        storage_key: 'bucket/path/contract_v1.pdf',
        version: 1,
        file_size: 1000,
        loop_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const updatedDoc = {
        id: 'doc-1',
        filename: 'contract_123_abc.pdf',
        original_name: 'contract-v2.pdf',
        storage_key: 'bucket/path/contract_123_abc.pdf',
        version: 2,
        file_size: fileContent.length,
        uploader: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        versions: [
          {
            version_number: 2,
            storage_key: 'bucket/path/contract_v1.pdf',
            file_size: 1000,
            created_by: 'user-1',
          },
        ],
      };

      (validation.validateFile as jest.Mock).mockReturnValue({ valid: true });
      (validation.generateUniqueFilename as jest.Mock).mockReturnValue('contract_123_abc.pdf');
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(existingDoc);
      (storageService.uploadDocument as jest.Mock).mockResolvedValue('bucket/path/contract_123_abc.pdf');
      (prisma.document_versions.create as jest.Mock).mockResolvedValue({
        version_number: 2,
        storage_key: existingDoc.storage_key,
      });
      (prisma.documents.update as jest.Mock).mockResolvedValue(updatedDoc);

      const result = await createDocumentVersion('doc-1', formData);

      expect(result.success).toBe(true);
      expect(result.document.version).toBe(2);
      expect(prisma.document_versions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            document_id: 'doc-1',
            version_number: 2,
            storage_key: 'bucket/path/contract_v1.pdf', // Old version archived
          }),
        })
      );
      expect(prisma.documents.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            version: 2,
            storage_key: 'bucket/path/contract_123_abc.pdf', // New version
          }),
        })
      );
    });

    it('should reject version creation if document not found', async () => {
      const file = createMockFile('test', 'test.pdf', 'application/pdf');
      const formData = new FormData();
      formData.append('file', file);

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(createDocumentVersion('doc-999', formData)).rejects.toThrow('Document not found');
    });

    it('should enforce organization isolation on version creation', async () => {
      const file = createMockFile('test', 'test.pdf', 'application/pdf');
      const formData = new FormData();
      formData.append('file', file);

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(createDocumentVersion('doc-1', formData)).rejects.toThrow('Document not found');
      expect(prisma.documents.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            loop: {
              organization_id: 'org-1',
            },
          }),
        })
      );
    });
  });

  describe('getDocumentsByLoop', () => {
    it('should return all documents for a loop', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          filename: 'contract.pdf',
          category: 'contract',
          status: 'REVIEWED',
          loop_id: '550e8400-e29b-41d4-a716-446655440000',
          uploader: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          versions: [],
        },
        {
          id: 'doc-2',
          filename: 'disclosure.pdf',
          category: 'disclosure',
          status: 'DRAFT',
          loop_id: '550e8400-e29b-41d4-a716-446655440000',
          uploader: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          versions: [],
        },
      ];

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await getDocumentsByLoop({ loopId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].category).toBe('contract');
      expect(result.data[1].category).toBe('disclosure');
    });

    it('should filter documents by category', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          filename: 'contract.pdf',
          category: 'contract',
          loop_id: '550e8400-e29b-41d4-a716-446655440000',
          uploader: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
          versions: [],
        },
      ];

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      await getDocumentsByLoop({ loopId: '550e8400-e29b-41d4-a716-446655440000', category: 'contract' });

      expect(prisma.documents.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'contract',
          }),
        })
      );
    });

    it('should filter documents by status', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue([]);

      await getDocumentsByLoop({ loopId: '550e8400-e29b-41d4-a716-446655440000', status: 'REVIEWED' });

      expect(prisma.documents.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REVIEWED',
          }),
        })
      );
    });

    it('should search documents by filename', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue([]);

      await getDocumentsByLoop({ loopId: '550e8400-e29b-41d4-a716-446655440000', search: 'contract' });

      expect(prisma.documents.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ filename: expect.any(Object) }),
              expect.objectContaining({ original_name: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should enforce organization isolation', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentsByLoop({ loopId: '550e8400-e29b-41d4-a716-446655440000' })).rejects.toThrow('Transaction loop not found');
      expect(prisma.transaction_loops.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
          }),
        })
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return document with full details', async () => {
      const mockDocument = {
        id: 'doc-1',
        filename: 'contract.pdf',
        uploader: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        loop: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          property_address: '123 Test St',
          transaction_type: 'PURCHASE_AGREEMENT',
          status: 'ACTIVE',
        },
        versions: [
          {
            version_number: 2,
            creator: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
          {
            version_number: 1,
            creator: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
        ],
      };

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);

      const document = await getDocumentById('doc-1');

      expect(document.id).toBe('doc-1');
      expect(document.loop.property_address).toBe('123 Test St');
      expect(document.versions).toHaveLength(2);
    });

    it('should reject if document not found', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentById('doc-999')).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentVersions', () => {
    it('should return version history ordered by version number', async () => {
      const mockDocument = {
        id: 'doc-1',
        loop_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const mockVersions = [
        {
          version_number: 3,
          storage_key: 'bucket/v3.pdf',
          creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        },
        {
          version_number: 2,
          storage_key: 'bucket/v2.pdf',
          creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        },
        {
          version_number: 1,
          storage_key: 'bucket/v1.pdf',
          creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        },
      ];

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (prisma.document_versions.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const versions = await getDocumentVersions('doc-1');

      expect(versions).toHaveLength(3);
      expect(versions[0].version_number).toBe(3);
      expect(versions[1].version_number).toBe(2);
      expect(versions[2].version_number).toBe(1);
    });

    it('should enforce organization isolation', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentVersions('doc-1')).rejects.toThrow('Document not found');
      expect(prisma.documents.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            loop: {
              organization_id: 'org-1',
            },
          }),
        })
      );
    });
  });

  describe('getDocumentStats', () => {
    it('should return document statistics by category and status', async () => {
      const mockDocuments = [
        { category: 'contract', status: 'REVIEWED' },
        { category: 'contract', status: 'SIGNED' },
        { category: 'disclosure', status: 'DRAFT' },
        { category: 'inspection', status: 'PENDING' },
        { category: 'other', status: 'DRAFT' },
      ];

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const stats = await getDocumentStats('550e8400-e29b-41d4-a716-446655440000');

      expect(stats.totalDocuments).toBe(5);
      expect(stats.byCategory.contract).toBe(2);
      expect(stats.byCategory.disclosure).toBe(1);
      expect(stats.byCategory.inspection).toBe(1);
      expect(stats.byCategory.other).toBe(1);
      expect(stats.byStatus.REVIEWED).toBe(1);
      expect(stats.byStatus.SIGNED).toBe(1);
      expect(stats.byStatus.DRAFT).toBe(2);
      expect(stats.byStatus.PENDING).toBe(1);
    });

    it('should return zero counts for empty loop', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.documents.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDocumentStats('550e8400-e29b-41d4-a716-446655440000');

      expect(stats.totalDocuments).toBe(0);
      expect(stats.byCategory.contract).toBe(0);
      expect(stats.byStatus.DRAFT).toBe(0);
    });

    it('should enforce organization isolation', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentStats('550e8400-e29b-41d4-a716-446655440000')).rejects.toThrow('Transaction loop not found');
    });
  });
});
