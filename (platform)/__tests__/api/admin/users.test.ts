import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as suspendUser } from '@/app/api/v1/admin/users/suspend/route';
import { POST as reactivateUser } from '@/app/api/v1/admin/users/reactivate/route';
import { DELETE as deleteUser } from '@/app/api/v1/admin/users/[id]/route';

// Mock dependencies
vi.mock('@/lib/auth/auth-helpers');
vi.mock('@/lib/auth/rbac');
vi.mock('@/lib/modules/admin');
vi.mock('@/lib/database/prisma');
vi.mock('@/lib/modules/admin/audit');

const mockGetCurrentUser = vi.fn();
const mockCanManageUsers = vi.fn();
const mockSuspendUser = vi.fn();
const mockReactivateUser = vi.fn();
const mockPrisma = {
  users: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
};
const mockLogAdminAction = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Admin Users API', () => {
  describe('POST /api/v1/admin/users/suspend', () => {
    it('should suspend user with valid request', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);
      mockSuspendUser.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        is_active: false,
      });

      const req = new NextRequest('http://localhost/api/v1/admin/users/suspend', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          reason: 'Violation of TOS',
        }),
      });

      const response = await suspendUser(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.is_active).toBe(false);
    });

    it('should reject non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'USER' });
      mockCanManageUsers.mockReturnValue(false);

      const req = new NextRequest('http://localhost/api/v1/admin/users/suspend', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          reason: 'Test',
        }),
      });

      const response = await suspendUser(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should validate request body', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);

      const req = new NextRequest('http://localhost/api/v1/admin/users/suspend', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'invalid-uuid',
          reason: '',
        }),
      });

      const response = await suspendUser(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request data');
    });
  });

  describe('POST /api/v1/admin/users/reactivate', () => {
    it('should reactivate suspended user', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);
      mockReactivateUser.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        is_active: true,
      });

      const req = new NextRequest('http://localhost/api/v1/admin/users/reactivate', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
        }),
      });

      const response = await reactivateUser(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.is_active).toBe(true);
    });

    it('should reject non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'USER' });
      mockCanManageUsers.mockReturnValue(false);

      const req = new NextRequest('http://localhost/api/v1/admin/users/reactivate', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
        }),
      });

      const response = await reactivateUser(req);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/admin/users/[id]', () => {
    it('should delete user successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);
      mockPrisma.users.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
      mockPrisma.users.delete.mockResolvedValue({});
      mockLogAdminAction.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/v1/admin/users/user-123', {
        method: 'DELETE',
      });

      const response = await deleteUser(req, { params: Promise.resolve({ id: 'user-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should prevent self-deletion', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);

      const req = new NextRequest('http://localhost/api/v1/admin/users/admin-1', {
        method: 'DELETE',
      });

      const response = await deleteUser(req, { params: Promise.resolve({ id: 'admin-1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot delete your own account');
    });

    it('should return 404 for non-existent user', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanManageUsers.mockReturnValue(true);
      mockPrisma.users.findUnique.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/v1/admin/users/user-123', {
        method: 'DELETE',
      });

      const response = await deleteUser(req, { params: Promise.resolve({ id: 'user-123' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });
});
