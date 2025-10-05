import { uploadDocument, getDocumentDownloadUrl, updateDocument, deleteDocument } from '@/lib/modules/transactions/documents/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/prisma';
import { storageService } from '@/lib/storage/supabase-storage';
import * as validation from '@/lib/storage/validation';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transaction_loops: {
      findFirst: jest.fn(),
    },
    documents: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock('@/lib/storage/supabase-storage', () => ({
  storageService: {
    uploadDocument: jest.fn(),
    getSignedUrl: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));
jest.mock('@/lib/storage/validation');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Document Upload Actions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'EMPLOYEE' as const,
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

  describe('uploadDocument', () => {
    it('should upload document with valid file and metadata', async () => {
      const fileContent = 'PDF file content';
      const file = createMockFile(fileContent, 'contract.pdf', 'application/pdf');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('loopId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('category', 'contract');
      formData.append('description', 'Purchase agreement');

      (validation.validateFile as jest.Mock).mockReturnValue({ valid: true });
      (validation.generateUniqueFilename as jest.Mock).mockReturnValue('contract_123456_abc.pdf');
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (storageService.uploadDocument as jest.Mock).mockResolvedValue('bucket/path/contract_123456_abc.pdf');

      const mockDocument = {
        id: 'doc-1',
        filename: 'contract_123456_abc.pdf',
        original_name: 'contract.pdf',
        mime_type: 'application/pdf',
        file_size: fileContent.length,
        storage_key: 'bucket/path/contract_123456_abc.pdf',
        category: 'contract',
        loop_id: '550e8400-e29b-41d4-a716-446655440000',
        uploaded_by: 'user-1',
        version: 1,
        status: 'DRAFT',
        uploader: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      (prisma.documents.create as jest.Mock).mockResolvedValue(mockDocument);

      const result = await uploadDocument(formData);

      expect(result.success).toBe(true);
      expect(result.document.id).toBe('doc-1');
      expect(result.document.category).toBe('contract');
      expect(validation.validateFile).toHaveBeenCalledWith({
        name: 'contract.pdf',
        size: fileContent.length,
        type: 'application/pdf',
      });
      expect(storageService.uploadDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          loopId: '550e8400-e29b-41d4-a716-446655440000',
          fileName: 'contract_123456_abc.pdf',
          mimeType: 'application/pdf',
          encrypt: true,
        })
      );
    });

    it('should reject upload if user is not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('file', createMockFile('test', 'test.pdf', 'application/pdf'));

      await expect(uploadDocument(formData)).rejects.toThrow('Unauthorized');
    });

    it('should reject upload if no file provided', async () => {
      const formData = new FormData();
      formData.append('loopId', '550e8400-e29b-41d4-a716-446655440000');

      await expect(uploadDocument(formData)).rejects.toThrow('No file provided');
    });

    it('should reject upload if file validation fails', async () => {
      const file = createMockFile('test', 'malware.exe', 'application/x-executable');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('loopId', '550e8400-e29b-41d4-a716-446655440000');

      (validation.validateFile as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Invalid file type',
      });
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      await expect(uploadDocument(formData)).rejects.toThrow('Invalid file type');
    });

    it('should reject upload if loop not found', async () => {
      const file = createMockFile('test', 'test.pdf', 'application/pdf');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('loopId', '660e8400-e29b-41d4-a716-446655440000');

      (validation.validateFile as jest.Mock).mockReturnValue({ valid: true });
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(uploadDocument(formData)).rejects.toThrow('Transaction loop not found');
    });

    it('should reject upload if loop belongs to different organization', async () => {
      const file = createMockFile('test', 'test.pdf', 'application/pdf');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('loopId', '550e8400-e29b-41d4-a716-446655440000');

      (validation.validateFile as jest.Mock).mockReturnValue({ valid: true });
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null); // Not found due to org filter

      await expect(uploadDocument(formData)).rejects.toThrow('Transaction loop not found');
      expect(prisma.transaction_loops.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
          }),
        })
      );
    });
  });

  describe('getDocumentDownloadUrl', () => {
    it('should generate signed URL for valid document', async () => {
      const mockDocument = {
        id: 'doc-1',
        storage_key: 'bucket/path/file.pdf',
        loop_id: 'loop-1',
      };

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.getSignedUrl as jest.Mock).mockResolvedValue('https://signed-url.com/file.pdf?token=abc');

      const result = await getDocumentDownloadUrl('doc-1');

      expect(result.url).toBe('https://signed-url.com/file.pdf?token=abc');
      expect(storageService.getSignedUrl).toHaveBeenCalledWith('bucket/path/file.pdf', 3600);
    });

    it('should reject if user not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentDownloadUrl('doc-1')).rejects.toThrow('Unauthorized');
    });

    it('should reject if document not found', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentDownloadUrl('doc-1')).rejects.toThrow('Document not found');
    });

    it('should enforce organization isolation', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getDocumentDownloadUrl('doc-1')).rejects.toThrow('Document not found');
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

  describe('updateDocument', () => {
    it('should update document metadata', async () => {
      const mockDocument = {
        id: 'doc-1',
        loop_id: 'loop-1',
        category: 'other',
        status: 'DRAFT',
      };

      const updatedDocument = {
        ...mockDocument,
        category: 'contract',
        status: 'REVIEWED',
        uploader: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (prisma.documents.update as jest.Mock).mockResolvedValue(updatedDocument);

      const result = await updateDocument('doc-1', {
        category: 'contract',
        status: 'REVIEWED',
      });

      expect(result.success).toBe(true);
      expect(result.document.category).toBe('contract');
      expect(result.document.status).toBe('REVIEWED');
    });

    it('should reject update if document not found', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(updateDocument('doc-1', { category: 'contract' })).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and remove from storage', async () => {
      const mockDocument = {
        id: 'doc-1',
        storage_key: 'bucket/path/file.pdf',
        loop_id: 'loop-1',
      };

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (prisma.documents.delete as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.deleteDocument as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteDocument('doc-1');

      expect(result.success).toBe(true);
      expect(prisma.documents.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
      expect(storageService.deleteDocument).toHaveBeenCalledWith('bucket/path/file.pdf');
    });

    it('should reject delete if document not found', async () => {
      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(deleteDocument('doc-1')).rejects.toThrow('Document not found');
    });

    it('should continue if storage deletion fails', async () => {
      const mockDocument = {
        id: 'doc-1',
        storage_key: 'bucket/path/file.pdf',
        loop_id: 'loop-1',
      };

      (prisma.documents.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (prisma.documents.delete as jest.Mock).mockResolvedValue(mockDocument);
      (storageService.deleteDocument as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await deleteDocument('doc-1');

      expect(result.success).toBe(true);
      expect(prisma.documents.delete).toHaveBeenCalled();
    });
  });
});
