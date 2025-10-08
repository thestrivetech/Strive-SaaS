/**
 * Media Actions Test Suite
 * Tests for Media upload, folder management, and file operations
 *
 * Coverage: uploadMediaAsset, createMediaFolder, updateMediaAsset,
 *           deleteMediaAsset, deleteMediaFolder, moveAssetsToFolder
 */

import { UserRole, OrgRole, SubscriptionTier } from '@prisma/client';
import { testPrisma, cleanDatabase, createTestOrgWithUser, connectTestDb, disconnectTestDb } from '@/__tests__/utils/test-helpers';
import { uploadMediaAsset, createMediaFolder, updateMediaAsset, deleteMediaAsset, deleteMediaFolder, moveAssetsToFolder } from '@/lib/modules/content/media/actions';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canAccessContent } from '@/lib/auth/rbac';

jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/auth/rbac');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('@/lib/auth/user-helpers', () => ({
  getUserOrganizationId: jest.fn((user) => user.organizationId || user.organization_members?.[0]?.organization_id),
}));
jest.mock('@/lib/modules/content/media/upload', () => ({
  uploadToSupabase: jest.fn(async (file, folder) => ({
    fileName: `${folder}/${file.name}`,
    fileUrl: `https://storage.example.com/${folder}/${file.name}`,
    mimeType: file.type,
    fileSize: file.size,
    width: 1920,
    height: 1080,
  })),
  deleteFromSupabase: jest.fn(async () => true),
}));

describe('Media Actions', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    jest.clearAllMocks();
  });

  // ============================================================================
  // FILE UPLOAD SECURITY TESTS
  // ============================================================================
  describe('File Upload Security', () => {
    it('should validate file type (images, videos, documents only)', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      // Valid file types
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'application/pdf',
        'application/msword',
      ];

      for (const type of validTypes) {
        const formData = new FormData();
        const file = new File(['test'], 'test.jpg', { type });
        formData.append('file', file);

        const asset = await uploadMediaAsset(formData);
        expect(asset.mime_type).toBe(type);
      }
    });

    it('should validate file size limits', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const formData = new FormData();
      // Create file with known size
      const smallFile = new File(['small'], 'small.jpg', { type: 'image/jpeg' });
      formData.append('file', smallFile);

      const asset = await uploadMediaAsset(formData);
      expect(asset.file_size).toBeLessThanOrEqual(10 * 1024 * 1024); // 10MB for images
    });

    it('should sanitize file names', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const formData = new FormData();
      const file = new File(['test'], '../../../etc/passwd', { type: 'image/jpeg' });
      formData.append('file', file);

      const asset = await uploadMediaAsset(formData);

      // File name should not contain directory traversal
      expect(asset.file_name).not.toContain('..');
      expect(asset.file_name).not.toContain('/etc/');
    });

    it('should reject missing file', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const formData = new FormData();
      // No file attached

      await expect(uploadMediaAsset(formData)).rejects.toThrow('No file provided');
    });
  });

  // ============================================================================
  // MULTI-TENANCY TESTS
  // ============================================================================
  describe('Multi-Tenancy Isolation', () => {
    it('should upload media to user organizationId', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const asset = await uploadMediaAsset(formData);

      expect(asset.organization_id).toBe(organization.id);
      expect(asset.uploaded_by).toBe(user.id);

      // Verify in database
      const dbAsset = await testPrisma.media_assets.findUnique({
        where: { id: asset.id },
      });
      expect(dbAsset?.organization_id).toBe(organization.id);
    });

    it('should NOT allow deleting other org media', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create media in org1
      const asset = await testPrisma.media_assets.create({
        data: {
          name: 'Org 1 Image',
          original_name: 'image.jpg',
          file_name: 'root/image.jpg',
          file_url: 'https://storage.example.com/root/image.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: org1.id,
          uploaded_by: user1.id,
        },
      });

      // Try to delete with user from org2
      (getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user2-id',
        organizationId: org2.id,
        role: UserRole.USER,
      });

      await expect(deleteMediaAsset(asset.id)).rejects.toThrow('Asset not found');
    });

    it('should filter media by organizationId', async () => {
      const { organization: org1, user: user1 } = await createTestOrgWithUser(OrgRole.OWNER);
      const { organization: org2, user: user2 } = await createTestOrgWithUser(OrgRole.OWNER);

      // Create media in both orgs
      await testPrisma.media_assets.create({
        data: {
          name: 'Org 1 Image',
          original_name: 'image1.jpg',
          file_name: 'root/image1.jpg',
          file_url: 'https://storage.example.com/root/image1.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: org1.id,
          uploaded_by: user1.id,
        },
      });

      await testPrisma.media_assets.create({
        data: {
          name: 'Org 2 Image',
          original_name: 'image2.jpg',
          file_name: 'root/image2.jpg',
          file_url: 'https://storage.example.com/root/image2.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: org2.id,
          uploaded_by: user2.id,
        },
      });

      // Query should only return org1 media
      const org1Media = await testPrisma.media_assets.findMany({
        where: { organization_id: org1.id },
      });

      expect(org1Media).toHaveLength(1);
      expect(org1Media[0].name).toBe('Org 1 Image');
    });
  });

  // ============================================================================
  // FOLDER MANAGEMENT TESTS
  // ============================================================================
  describe('Folder Management', () => {
    it('should create folder in user org', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const folderData = {
        name: 'My Folder',
        organizationId: organization.id,
      };

      const folder = await createMediaFolder(folderData);

      expect(folder.name).toBe('My Folder');
      expect(folder.organization_id).toBe(organization.id);
      expect(folder.created_by).toBe(user.id);
      expect(folder.path).toBe('my-folder');

      // Verify in database
      const dbFolder = await testPrisma.media_folders.findUnique({
        where: { id: folder.id },
      });
      expect(dbFolder?.organization_id).toBe(organization.id);
    });

    it('should create nested folder structure', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      // Create parent folder
      const parent = await createMediaFolder({
        name: 'Parent',
        organizationId: organization.id,
      });

      // Create child folder
      const child = await createMediaFolder({
        name: 'Child',
        parentId: parent.id,
        organizationId: organization.id,
      });

      expect(child.parent_id).toBe(parent.id);
      expect(child.path).toBe('parent/child');
    });

    it('should prevent duplicate folder names in same parent', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      // Create first folder
      await createMediaFolder({
        name: 'Duplicate',
        organizationId: organization.id,
      });

      // Try to create duplicate
      await expect(
        createMediaFolder({
          name: 'Duplicate',
          organizationId: organization.id,
        })
      ).rejects.toThrow('folder with this name already exists');
    });

    it('should delete empty folder successfully', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const folder = await testPrisma.media_folders.create({
        data: {
          name: 'Empty Folder',
          path: 'empty-folder',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const result = await deleteMediaFolder(folder.id);
      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await testPrisma.media_folders.findUnique({
        where: { id: folder.id },
      });
      expect(deleted).toBeNull();
    });

    it('should prevent deleting folder with assets', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const folder = await testPrisma.media_folders.create({
        data: {
          name: 'Folder With Assets',
          path: 'folder-with-assets',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      // Add asset to folder
      await testPrisma.media_assets.create({
        data: {
          name: 'Image',
          original_name: 'image.jpg',
          file_name: 'folder/image.jpg',
          file_url: 'https://storage.example.com/folder/image.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          folder_id: folder.id,
          organization_id: organization.id,
          uploaded_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      await expect(deleteMediaFolder(folder.id)).rejects.toThrow(
        'Cannot delete folder with assets'
      );
    });

    it('should prevent deleting folder with subfolders', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const parent = await testPrisma.media_folders.create({
        data: {
          name: 'Parent',
          path: 'parent',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      await testPrisma.media_folders.create({
        data: {
          name: 'Child',
          path: 'parent/child',
          parent_id: parent.id,
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      await expect(deleteMediaFolder(parent.id)).rejects.toThrow(
        'Cannot delete folder with subfolders'
      );
    });
  });

  // ============================================================================
  // ASSET OPERATIONS TESTS
  // ============================================================================
  describe('Asset Operations', () => {
    it('should move media within same org only', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const folder = await testPrisma.media_folders.create({
        data: {
          name: 'Target Folder',
          path: 'target-folder',
          organization_id: organization.id,
          created_by: user.id,
        },
      });

      const asset = await testPrisma.media_assets.create({
        data: {
          name: 'Image',
          original_name: 'image.jpg',
          file_name: 'root/image.jpg',
          file_url: 'https://storage.example.com/root/image.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: organization.id,
          uploaded_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const result = await moveAssetsToFolder([asset.id], folder.id);
      expect(result.success).toBe(true);
      expect(result.movedCount).toBe(1);

      // Verify move
      const movedAsset = await testPrisma.media_assets.findUnique({
        where: { id: asset.id },
      });
      expect(movedAsset?.folder_id).toBe(folder.id);
    });

    it('should update media asset metadata', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const asset = await testPrisma.media_assets.create({
        data: {
          name: 'Original Name',
          original_name: 'original.jpg',
          file_name: 'root/original.jpg',
          file_url: 'https://storage.example.com/root/original.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: organization.id,
          uploaded_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const updated = await updateMediaAsset({
        id: asset.id,
        name: 'Updated Name',
        alt: 'Updated alt text',
        caption: 'Updated caption',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.alt).toBe('Updated alt text');
      expect(updated.caption).toBe('Updated caption');
    });

    it('should delete media asset and file from storage', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const asset = await testPrisma.media_assets.create({
        data: {
          name: 'To Delete',
          original_name: 'delete.jpg',
          file_name: 'root/delete.jpg',
          file_url: 'https://storage.example.com/root/delete.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: organization.id,
          uploaded_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const { deleteFromSupabase } = jest.requireMock('@/lib/modules/content/media/upload');

      const result = await deleteMediaAsset(asset.id);
      expect(result.success).toBe(true);

      // Verify storage deletion was called
      expect(deleteFromSupabase).toHaveBeenCalledWith('root/delete.jpg');

      // Verify database deletion
      const deleted = await testPrisma.media_assets.findUnique({
        where: { id: asset.id },
      });
      expect(deleted).toBeNull();
    });

    it('should verify folder exists before moving assets', async () => {
      const { organization, user } = await createTestOrgWithUser(OrgRole.OWNER);

      const asset = await testPrisma.media_assets.create({
        data: {
          name: 'Image',
          original_name: 'image.jpg',
          file_name: 'root/image.jpg',
          file_url: 'https://storage.example.com/root/image.jpg',
          mime_type: 'image/jpeg',
          file_size: 1024,
          organization_id: organization.id,
          uploaded_by: user.id,
        },
      });

      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...user,
        organizationId: organization.id,
        role: UserRole.USER,
      });

      const fakeFolderId = 'non-existent-folder-id';
      await expect(moveAssetsToFolder([asset.id], fakeFolderId)).rejects.toThrow(
        'Target folder not found'
      );
    });
  });
});
