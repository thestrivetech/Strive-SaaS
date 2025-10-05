import {
  calculateLoopProgress,
  recalculateAllLoopProgress,
  getProgressSummary,
} from '@/lib/modules/transactions/milestones/calculator';
import {
  getMilestonesForType,
  getCurrentMilestone,
  getNextMilestone,
} from '@/lib/modules/transactions/milestones/schemas';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transaction_loops: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction_audit_logs: {
      create: jest.fn(),
    },
  },
}));

describe('Milestone Calculator', () => {
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

  describe('calculateLoopProgress', () => {
    it('should calculate progress with all components', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [
          { id: 'task-1', status: 'DONE' },
          { id: 'task-2', status: 'DONE' },
          { id: 'task-3', status: 'TODO' },
          { id: 'task-4', status: 'TODO' },
        ],
        documents: [
          { id: 'doc-1' },
          { id: 'doc-2' },
          { id: 'doc-3' },
        ],
        signatures: [
          {
            id: 'sig-req-1',
            signatures: [
              { id: 'sig-1', status: 'SIGNED' },
              { id: 'sig-2', status: 'PENDING' },
            ],
          },
        ],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await calculateLoopProgress(loopId);

      expect(result.success).toBe(true);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.breakdown.tasks.completed).toBe(2);
      expect(result.breakdown.tasks.total).toBe(4);
      expect(result.breakdown.documents.count).toBe(3);
      expect(result.breakdown.signatures.completed).toBe(1);
      expect(result.breakdown.signatures.total).toBe(2);
      expect(prisma.transaction_loops.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: loopId },
          data: { progress: expect.any(Number) },
        })
      );
    });

    it('should calculate 50% task completion correctly', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [
          { id: 'task-1', status: 'DONE' },
          { id: 'task-2', status: 'TODO' },
        ],
        documents: [],
        signatures: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await calculateLoopProgress(loopId);

      // Task completion is 50%, but weighted at 50% of total
      // So overall progress should be around 25%
      expect(result.breakdown.tasks.percentage).toBe(50);
      expect(result.progress).toBeGreaterThanOrEqual(20);
      expect(result.progress).toBeLessThanOrEqual(30);
    });

    it('should handle loop with no tasks', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [],
        documents: [{ id: 'doc-1' }],
        signatures: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await calculateLoopProgress(loopId);

      expect(result.success).toBe(true);
      expect(result.breakdown.tasks.total).toBe(0);
      expect(result.breakdown.tasks.percentage).toBe(0);
    });

    it('should cap document progress at 100%', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [],
        documents: Array(10).fill({ id: 'doc' }), // 10 documents (>= 5 required)
        signatures: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await calculateLoopProgress(loopId);

      expect(result.breakdown.documents.percentage).toBe(100);
    });

    it('should include milestone information', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [
          { id: 'task-1', status: 'DONE' },
          { id: 'task-2', status: 'DONE' },
        ],
        documents: Array(5).fill({ id: 'doc' }),
        signatures: [
          {
            id: 'sig-req-1',
            signatures: [{ id: 'sig-1', status: 'SIGNED' }],
          },
        ],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      const result = await calculateLoopProgress(loopId);

      expect(result.milestones).toBeDefined();
      expect(result.milestones.current).toBeDefined();
    });

    it('should create audit log', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [],
        documents: [],
        signatures: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);

      await calculateLoopProgress(loopId);

      expect(prisma.transaction_audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'updated_progress',
            entity_type: 'transaction_loop',
            entity_id: loopId,
          }),
        })
      );
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(calculateLoopProgress('non-existent')).rejects.toThrow(
        'Transaction loop not found'
      );
    });

    it('should require authentication', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(calculateLoopProgress('loop-1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('recalculateAllLoopProgress', () => {
    it('should recalculate progress for all active loops', async () => {
      const mockLoops = [
        { id: 'loop-1' },
        { id: 'loop-2' },
        { id: 'loop-3' },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockLoops);

      // Mock calculateLoopProgress internally
      const mockLoopData = {
        id: 'loop-1',
        organization_id: 'org-1',
        transaction_type: 'PURCHASE_AGREEMENT',
        transaction_tasks: [],
        documents: [],
        signatures: [],
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoopData);

      const result = await recalculateAllLoopProgress();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(3);
      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization_id: 'org-1',
            status: {
              in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'],
            },
          }),
        })
      );
    });

    it('should handle errors gracefully and continue', async () => {
      const mockLoops = [
        { id: 'loop-1' },
        { id: 'loop-2' },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockLoops);

      // First loop succeeds
      (prisma.transaction_loops.findFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: 'loop-1',
          organization_id: 'org-1',
          transaction_type: 'PURCHASE_AGREEMENT',
          transaction_tasks: [],
          documents: [],
          signatures: [],
        })
        // Second loop fails
        .mockResolvedValueOnce(null);

      const result = await recalculateAllLoopProgress();

      // Should still succeed with partial results
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getProgressSummary', () => {
    it('should return summary statistics', async () => {
      const mockLoops = [
        {
          id: 'loop-1',
          progress: 25,
          status: 'ACTIVE',
          transaction_type: 'PURCHASE_AGREEMENT',
        },
        {
          id: 'loop-2',
          progress: 75,
          status: 'CLOSING',
          transaction_type: 'PURCHASE_AGREEMENT',
        },
        {
          id: 'loop-3',
          progress: 50,
          status: 'ACTIVE',
          transaction_type: 'LISTING_AGREEMENT',
        },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockLoops);

      const result = await getProgressSummary();

      expect(result.success).toBe(true);
      expect(result.summary.totalLoops).toBe(3);
      expect(result.summary.averageProgress).toBe(50); // (25+75+50)/3
      expect(result.summary.byStatus.ACTIVE).toBe(2);
      expect(result.summary.byStatus.CLOSING).toBe(1);
      expect(result.summary.byType.PURCHASE_AGREEMENT).toBe(2);
      expect(result.summary.byType.LISTING_AGREEMENT).toBe(1);
    });

    it('should categorize progress distribution correctly', async () => {
      const mockLoops = [
        { id: 'loop-1', progress: 10, status: 'ACTIVE', transaction_type: 'PURCHASE_AGREEMENT' },
        { id: 'loop-2', progress: 40, status: 'ACTIVE', transaction_type: 'PURCHASE_AGREEMENT' },
        { id: 'loop-3', progress: 60, status: 'ACTIVE', transaction_type: 'PURCHASE_AGREEMENT' },
        { id: 'loop-4', progress: 90, status: 'ACTIVE', transaction_type: 'PURCHASE_AGREEMENT' },
      ];

      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue(mockLoops);

      const result = await getProgressSummary();

      expect(result.summary.progressDistribution['0-25']).toBe(1); // 10%
      expect(result.summary.progressDistribution['26-50']).toBe(1); // 40%
      expect(result.summary.progressDistribution['51-75']).toBe(1); // 60%
      expect(result.summary.progressDistribution['76-100']).toBe(1); // 90%
    });

    it('should handle empty loops', async () => {
      (prisma.transaction_loops.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getProgressSummary();

      expect(result.success).toBe(true);
      expect(result.summary.totalLoops).toBe(0);
      expect(result.summary.averageProgress).toBe(0);
    });

    it('should exclude closed loops', async () => {
      await getProgressSummary();

      expect(prisma.transaction_loops.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { not: 'CLOSED' },
          }),
        })
      );
    });
  });

  describe('Milestone Helper Functions', () => {
    it('should get milestones for transaction type', () => {
      const milestones = getMilestonesForType('PURCHASE_AGREEMENT');

      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones[0]).toHaveProperty('name');
      expect(milestones[0]).toHaveProperty('completedPercentage');
    });

    it('should get current milestone based on progress', () => {
      const milestone = getCurrentMilestone('PURCHASE_AGREEMENT', 40);

      expect(milestone).toBeDefined();
      expect(milestone?.completedPercentage).toBeLessThanOrEqual(40);
    });

    it('should get next milestone', () => {
      const milestone = getNextMilestone('PURCHASE_AGREEMENT', 40);

      expect(milestone).toBeDefined();
      if (milestone) {
        expect(milestone.completedPercentage).toBeGreaterThan(40);
      }
    });

    it('should return null for next milestone at 100%', () => {
      const milestone = getNextMilestone('PURCHASE_AGREEMENT', 100);

      expect(milestone).toBeNull();
    });
  });
});
