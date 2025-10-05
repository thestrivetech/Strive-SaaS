import { getLoops, getLoopById, getLoopStats } from '@/lib/modules/transactions/core/queries';
import { TRANSACTION_PERMISSIONS } from '@/lib/modules/transactions/core/permissions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transaction_loops: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

describe('Transaction Loop Queries', () => {
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

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    jest.clearAllMocks();
  });

  describe('getLoops', () => {
    it('should return paginated loops with default params', async () => {
      const mockLoops = [
        {
          id: 'loop-1',
          property_address: '123 Test St',
          transaction_type: 'PURCHASE_AGREEMENT',
          listing_price: 450000,
          status: 'ACTIVE',
          organization_id: 'org-1',
          created_by: 'user-1',
          creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
          _count: { documents: 5, parties: 2, transaction_tasks: 3, signatures: 1 },
        },
        {
          id: 'loop-2',
          property_address: '456 Main Ave',
          transaction_type: 'LISTING_AGREEMENT',
          listing_price: 550000,
          status: 'DRAFT',
          organization_id: 'org-1',
          created_by: 'user-1',
          creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
          _count: { documents: 2, parties: 1, transaction_tasks: 1, signatures: 0 },
        },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockLoops);
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(2);

      const result = await getLoops({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.loops).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      });
    });

    it('should filter loops by status', async () => {
      const mockActiveLoops = [
        {
          id: 'loop-1',
          property_address: '123 Test St',
          status: 'ACTIVE',
          organization_id: 'org-1',
        },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockActiveLoops);
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(1);

      const result = await getLoops({ page: 1, limit: 20, status: 'ACTIVE', sortBy: 'createdAt', sortOrder: 'desc' });

      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
            organization_id: 'org-1',
          }),
        })
      );
      expect(result.loops).toHaveLength(1);
    });

    it('should filter loops by transaction type', async () => {
      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(0);

      await getLoops({
        page: 1,
        limit: 20,
        transactionType: 'PURCHASE_AGREEMENT',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transaction_type: 'PURCHASE_AGREEMENT',
          }),
        })
      );
    });

    it('should search loops by property address', async () => {
      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(0);

      await getLoops({ page: 1, limit: 20, search: 'Main St', sortBy: 'createdAt', sortOrder: 'desc' });

      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_address: {
              contains: 'Main St',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should enforce organization isolation', async () => {
      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(0);

      await getLoops({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
          }),
        })
      );
    });

    it('should reject unauthenticated request', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getLoops({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })).rejects.toThrow('Not authenticated');
    });

    it('should reject user without view permission', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: 'CLIENT', // No access to transactions
      });

      await expect(getLoops({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })).rejects.toThrow('No permission');
    });
  });

  describe('getLoopById', () => {
    it('should return loop with full details', async () => {
      const mockLoop = {
        id: 'loop-1',
        property_address: '123 Test St',
        transaction_type: 'PURCHASE_AGREEMENT',
        listing_price: 450000,
        status: 'ACTIVE',
        organization_id: 'org-1',
        created_by: 'user-1',
        creator: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        documents: [],
        parties: [],
        transaction_tasks: [],
        signatures: [],
        workflows: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await getLoopById('loop-1');

      expect(result).toMatchObject({
        id: 'loop-1',
        property_address: '123 Test St',
      });
      expect(prisma.transaction_loops.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'loop-1',
            organization_id: 'org-1',
          },
          include: expect.objectContaining({
            creator: expect.any(Object),
            documents: expect.any(Object),
            parties: expect.any(Object),
          }),
        })
      );
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getLoopById('non-existent')).rejects.toThrow('Loop not found');
    });

    it('should enforce organization isolation', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getLoopById('loop-from-another-org')).rejects.toThrow('Loop not found');

      expect(prisma.transaction_loops.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
          }),
        })
      );
    });
  });

  describe('getLoopStats', () => {
    it('should return dashboard statistics', async () => {
      (prisma.transaction_loops.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalLoops
        .mockResolvedValueOnce(7) // activeLoops
        .mockResolvedValueOnce(3); // closingThisMonth

      (prisma.transaction_loops.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          listing_price: 5000000,
        },
      });

      const result = await getLoopStats();

      expect(result).toEqual({
        totalLoops: 10,
        activeLoops: 7,
        closingThisMonth: 3,
        totalValue: 5000000,
      });
    });

    it('should handle null total value', async () => {
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(0);
      (prisma.transaction_loops.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          listing_price: null,
        },
      });

      const result = await getLoopStats();

      expect(result.totalValue).toBe(0);
    });

    it('should enforce organization isolation', async () => {
      (prisma.transaction_loops.count as jest.Mock).mockResolvedValue(0);
      (prisma.transaction_loops.aggregate as jest.Mock).mockResolvedValue({
        _sum: { listing_price: null },
      });

      await getLoopStats();

      // All count calls should filter by organization
      expect(prisma.transaction_loops.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
          }),
        })
      );
    });

    it('should reject unauthenticated request', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getLoopStats()).rejects.toThrow('Not authenticated');
    });
  });
});
