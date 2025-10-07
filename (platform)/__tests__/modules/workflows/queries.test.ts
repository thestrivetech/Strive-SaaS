import {
  getWorkflowTemplates,
  getWorkflowTemplateById,
  getWorkflowsByLoopId,
} from '@/lib/modules/transactions/workflows/queries';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    workflows: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    transaction_loops: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Workflow Queries', () => {
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

  describe('getWorkflowTemplates', () => {
    it('should fetch all workflow templates for organization', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Purchase Workflow',
          is_template: true,
          organization_id: 'org-1',
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        {
          id: 'template-2',
          name: 'Listing Workflow',
          is_template: true,
          organization_id: 'org-1',
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      ];

      (prisma.workflows.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await getWorkflowTemplates();

      expect(result.success).toBe(true);
      expect(result.templates).toHaveLength(2);
      expect(prisma.workflows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_template: true,
            organization_id: 'org-1',
          }),
        })
      );
    });

    it('should filter by transaction type', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Purchase Workflow',
          is_template: true,
          organization_id: 'org-1',
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      ];

      (prisma.workflows.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      await getWorkflowTemplates({
        transactionType: 'PURCHASE_AGREEMENT',
        isTemplate: true,
      });

      expect(prisma.workflows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_template: true,
            organization_id: 'org-1',
            steps: {
              path: ['transactionType'],
              equals: 'PURCHASE_AGREEMENT',
            },
          }),
        })
      );
    });

    it('should not filter by type when ALL is specified', async () => {
      const mockTemplates: any[] = [];
      (prisma.workflows.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      await getWorkflowTemplates({
        transactionType: 'ALL',
        isTemplate: true,
      });

      expect(prisma.workflows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            steps: expect.anything(),
          }),
        })
      );
    });

    it('should require authentication', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getWorkflowTemplates()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getWorkflowTemplateById', () => {
    it('should fetch single template by ID', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Purchase Workflow',
        is_template: true,
        organization_id: 'org-1',
        creator: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await getWorkflowTemplateById('template-1');

      expect(result.success).toBe(true);
      expect(result.template).toMatchObject({
        id: 'template-1',
        name: 'Purchase Workflow',
      });
      expect(prisma.workflows.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'template-1',
            is_template: true,
            organization_id: 'org-1',
          },
        })
      );
    });

    it('should throw error if template not found', async () => {
      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getWorkflowTemplateById('non-existent')).rejects.toThrow(
        'Workflow template not found'
      );
    });

    it('should require authentication', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getWorkflowTemplateById('template-1')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('getWorkflowsByLoopId', () => {
    it('should fetch workflows for a loop', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
      };

      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Applied Purchase Workflow',
          is_template: false,
          loop_id: loopId,
          creator: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      ];

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.workflows.findMany as jest.Mock).mockResolvedValue(mockWorkflows);

      const result = await getWorkflowsByLoopId(loopId);

      expect(result.success).toBe(true);
      expect(result.workflows).toHaveLength(1);
      expect(result.workflows[0].is_template).toBe(false);
      expect(prisma.workflows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            loop_id: loopId,
            is_template: false,
          },
        })
      );
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getWorkflowsByLoopId('non-existent')).rejects.toThrow(
        'Transaction loop not found'
      );
    });

    it('should verify organization access to loop', async () => {
      const loopId = 'loop-1';

      const mockLoop = {
        id: loopId,
        organization_id: 'org-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(mockLoop);
      (prisma.workflows.findMany as jest.Mock).mockResolvedValue([]);

      await getWorkflowsByLoopId(loopId);

      expect(prisma.transaction_loops.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: loopId,
            organization_id: 'org-1',
          },
        })
      );
    });

    it('should require authentication', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(getWorkflowsByLoopId('loop-1')).rejects.toThrow('Unauthorized');
    });
  });
});
