import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getAuditLogs } from '@/app/api/v1/admin/audit-logs/route';

// Mock dependencies
vi.mock('@/lib/auth/auth-helpers');
vi.mock('@/lib/auth/rbac');
vi.mock('@/lib/modules/admin/audit');

const mockGetCurrentUser = vi.fn();
const mockCanViewAuditLogs = vi.fn();
const mockGetAdminActionLogs = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Admin Audit Logs API', () => {
  describe('GET /api/v1/admin/audit-logs', () => {
    it('should fetch audit logs with filters', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanViewAuditLogs.mockReturnValue(true);
      mockGetAdminActionLogs.mockResolvedValue([
        {
          id: 'log-1',
          action: 'USER_SUSPEND',
          description: 'Suspended user',
          created_at: new Date(),
        },
        {
          id: 'log-2',
          action: 'ORG_UPDATE',
          description: 'Updated organization',
          created_at: new Date(),
        },
      ]);

      const req = new NextRequest(
        'http://localhost/api/v1/admin/audit-logs?action=USER_SUSPEND&limit=50',
        { method: 'GET' }
      );

      const response = await getAuditLogs(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toBeDefined();
      expect(data.logs.length).toBe(2);
    });

    it('should apply date range filters', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanViewAuditLogs.mockReturnValue(true);
      mockGetAdminActionLogs.mockResolvedValue([]);

      const startDate = '2025-10-01';
      const endDate = '2025-10-31';
      const req = new NextRequest(
        `http://localhost/api/v1/admin/audit-logs?startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );

      const response = await getAuditLogs(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockGetAdminActionLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });

    it('should reject non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1', role: 'USER' });
      mockCanViewAuditLogs.mockReturnValue(false);

      const req = new NextRequest('http://localhost/api/v1/admin/audit-logs', {
        method: 'GET',
      });

      const response = await getAuditLogs(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should apply default limit', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      mockCanViewAuditLogs.mockReturnValue(true);
      mockGetAdminActionLogs.mockResolvedValue([]);

      const req = new NextRequest('http://localhost/api/v1/admin/audit-logs', {
        method: 'GET',
      });

      await getAuditLogs(req);

      expect(mockGetAdminActionLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      );
    });
  });
});
