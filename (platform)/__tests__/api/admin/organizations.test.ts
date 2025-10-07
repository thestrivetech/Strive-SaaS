import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  GET as getOrganization,
  PATCH as updateOrganization,
  DELETE as deleteOrganization,
} from '@/app/api/v1/admin/organizations/[id]/route';

// Mock dependencies
vi.mock('@/lib/auth/auth-helpers');
vi.mock('@/lib/auth/rbac');
vi.mock('@/lib/database/prisma');
vi.mock('@/lib/modules/admin/audit');

const mockGetCurrentUser = vi.fn();
const mockCanManageOrganizations = vi.fn();
const mockPrisma = {
  organizations: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
const mockLogAdminAction = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Admin Organizations API', () => {
  describe('GET /api/v1/admin/organizations/[id]', () => {
    it('should fetch organization with details', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);
      mockPrisma.organizations.findUnique.mockResolvedValue({
        id: 'org-123',
        name: 'Test Org',
        website: 'https://test.com',
        _count: { members: 5 },
        subscriptions: {
          tier: 'STARTER',
          status: 'ACTIVE',
          interval: 'MONTHLY',
        },
        members: [],
      });

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'GET',
      });

      const response = await getOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.organization).toBeDefined();
      expect(data.organization.id).toBe('org-123');
    });

    it('should return 404 for non-existent organization', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);
      mockPrisma.organizations.findUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'GET',
      });

      const response = await getOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should reject non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'USER' });
      mockCanManageOrganizations.mockReturnValue(false);

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'GET',
      });

      const response = await getOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/admin/organizations/[id]', () => {
    it('should update organization', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);
      mockPrisma.organizations.update.mockResolvedValue({
        id: 'org-123',
        name: 'Updated Org',
        website: 'https://updated.com',
      });
      mockLogAdminAction.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Org',
          website: 'https://updated.com',
        }),
      });

      const response = await updateOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.organization.name).toBe('Updated Org');
    });

    it('should validate update data', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'PATCH',
        body: JSON.stringify({
          website: 'invalid-url',
        }),
      });

      const response = await updateOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request data');
    });

    it('should reject non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'USER' });
      mockCanManageOrganizations.mockReturnValue(false);

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await updateOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/admin/organizations/[id]', () => {
    it('should delete organization', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);
      mockPrisma.organizations.findUnique.mockResolvedValue({
        id: 'org-123',
        name: 'Test Org',
      });
      mockPrisma.organizations.delete.mockResolvedValue({});
      mockLogAdminAction.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'DELETE',
      });

      const response = await deleteOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent organization', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageOrganizations.mockReturnValue(true);
      mockPrisma.organizations.findUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/v1/admin/organizations/org-123', {
        method: 'DELETE',
      });

      const response = await deleteOrganization(req, { params: Promise.resolve({ id: 'org-123' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });
});
