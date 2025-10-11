import {
  createWorkflowTemplate,
  applyWorkflowToLoop,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
} from '@/lib/modules/workspace/workflows/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    workflows: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    transaction_loops: {
      findFirst: jest.fn(),
    },
    transaction_tasks: {
      create: jest.fn(),
    },
    transaction_audit_logs: {
      create: jest.fn(),
    },
  },
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('@/lib/email/notifications', () => ({
  sendTaskAssignmentEmail: jest.fn(),
}));

describe('Workflow Actions', () => {
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

  describe('createWorkflowTemplate', () => {
    it('should create workflow template with valid input', async () => {
      const input = {
        name: 'Purchase Workflow',
        description: 'Standard purchase workflow',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [
          {
            id: 'step-1',
            title: 'Submit Offer',
            order: 0,
            estimatedDays: 1,
            dependencies: [],
            requiresDocument: false,
            requiresSignature: false,
          },
          {
            id: 'step-2',
            title: 'Inspection',
            order: 1,
            estimatedDays: 7,
            dependencies: ['step-1'],
            autoAssignRole: 'INSPECTOR' as const,
            requiresDocument: true,
            requiresSignature: false,
          },
        ],
      };

      const createdTemplate = {
        id: 'template-1',
        name: input.name,
        description: input.description,
        is_template: true,
        steps: input.steps,
        status: 'ACTIVE',
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        loop_id: null,
        creator: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (prisma.workflows.create as jest.Mock).mockResolvedValue(createdTemplate);

      const result = await createWorkflowTemplate(input);

      expect(result.success).toBe(true);
      expect(result.template).toMatchObject({
        id: 'template-1',
        name: input.name,
      });
      expect(prisma.transaction_audit_logs.create).toHaveBeenCalled();
    });

    it('should reject duplicate step IDs', async () => {
      const input = {
        name: 'Invalid Workflow',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            order: 0,
            dependencies: [],
            requiresDocument: false,
            requiresSignature: false,
          },
          {
            id: 'step-1',
            title: 'Step 2',
            order: 1,
            dependencies: [],
            requiresDocument: false,
            requiresSignature: false,
          }, // Duplicate ID
        ],
      };

      await expect(createWorkflowTemplate(input)).rejects.toThrow(
        'Step IDs must be unique'
      );
    });

    it('should reject invalid dependency references', async () => {
      const input = {
        name: 'Invalid Workflow',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            order: 0,
            dependencies: ['non-existent'], // Invalid dependency
            requiresDocument: false,
            requiresSignature: false,
          },
        ],
      };

      await expect(createWorkflowTemplate(input)).rejects.toThrow(
        'Dependency non-existent not found in step IDs'
      );
    });

    it('should require authentication', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const input = {
        name: 'Test Workflow',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            order: 0,
            dependencies: [],
            requiresDocument: false,
            requiresSignature: false,
          },
        ],
      };

      await expect(createWorkflowTemplate(input)).rejects.toThrow('Unauthorized');
    });
  });

  describe('applyWorkflowToLoop', () => {
    it('should apply workflow and create tasks', async () => {
      const input = {
        loopId: '123e4567-e89b-12d3-a456-426614174000',
        templateId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const template = {
        id: 'template-1',
        name: 'Purchase Workflow',
        description: 'Test workflow',
        is_template: true,
        steps: [
          {
            id: 'step-1',
            title: 'Submit Offer',
            order: 0,
            estimatedDays: 1,
          },
          {
            id: 'step-2',
            title: 'Inspection',
            order: 1,
            estimatedDays: 7,
            autoAssignRole: 'INSPECTOR',
          },
        ],
        organization_id: 'org-1',
      };

      const loop = {
        id: 'loop-1',
        property_address: '123 Main St',
        organization_id: 'org-1',
        parties: [
          {
            id: 'party-1',
            role: 'INSPECTOR',
            email: 'inspector@example.com',
            name: 'Inspector John',
          },
        ],
      };

      const createdWorkflow = {
        id: 'workflow-1',
        name: template.name,
        description: template.description,
        is_template: false,
        steps: template.steps,
        status: 'ACTIVE',
        loop_id: 'loop-1',
        created_by: 'user-1',
        creator: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      const createdTask = {
        id: 'task-1',
        title: 'Submit Offer',
        loop_id: 'loop-1',
        created_by: 'user-1',
        assigned_to: null,
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: null,
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(template);
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(loop);
      (prisma.workflows.create as jest.Mock).mockResolvedValue(createdWorkflow);
      (prisma.transaction_tasks.create as jest.Mock).mockResolvedValue(createdTask);

      const result = await applyWorkflowToLoop(input);

      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(result.tasks).toHaveLength(2);
      expect(prisma.transaction_tasks.create).toHaveBeenCalledTimes(2);
    });

    it('should auto-assign tasks to parties by role', async () => {
      const input = {
        loopId: '123e4567-e89b-12d3-a456-426614174002',
        templateId: '123e4567-e89b-12d3-a456-426614174003',
      };

      const template = {
        id: 'template-1',
        name: 'Test Workflow',
        steps: [
          {
            id: 'step-1',
            title: 'Inspection Task',
            order: 0,
            autoAssignRole: 'INSPECTOR',
          },
        ],
        organization_id: 'org-1',
      };

      const loop = {
        id: 'loop-1',
        property_address: '123 Main St',
        organization_id: 'org-1',
        parties: [
          {
            id: 'party-inspector',
            role: 'INSPECTOR',
            email: 'inspector@example.com',
            name: 'Inspector Jane',
          },
        ],
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(template);
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(loop);
      const { id: _, ...templateWithoutId } = template;
      (prisma.workflows.create as jest.Mock).mockResolvedValue({
        id: 'workflow-1',
        ...templateWithoutId,
        is_template: false,
      });
      (prisma.transaction_tasks.create as jest.Mock).mockResolvedValue({
        id: 'task-1',
        assigned_to: 'party-inspector',
        assignee: loop.parties[0],
      });

      await applyWorkflowToLoop(input);

      expect(prisma.transaction_tasks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assigned_to: 'party-inspector',
          }),
        })
      );
    });

    it('should throw error if template not found', async () => {
      const input = {
        loopId: '123e4567-e89b-12d3-a456-426614174004',
        templateId: '123e4567-e89b-12d3-a456-426614174005',
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(applyWorkflowToLoop(input)).rejects.toThrow(
        'Workflow template not found'
      );
    });

    it('should throw error if loop not found', async () => {
      const input = {
        loopId: '123e4567-e89b-12d3-a456-426614174006',
        templateId: '123e4567-e89b-12d3-a456-426614174007',
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue({
        id: 'template-1',
        organization_id: 'org-1',
      });
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(applyWorkflowToLoop(input)).rejects.toThrow(
        'Transaction loop not found'
      );
    });
  });

  describe('updateWorkflowTemplate', () => {
    it('should update workflow template', async () => {
      const templateId = 'template-1';
      const input = {
        name: 'Updated Workflow Name',
        description: 'Updated description',
      };

      const existingTemplate = {
        id: templateId,
        name: 'Old Name',
        is_template: true,
        organization_id: 'org-1',
      };

      const updatedTemplate = {
        ...existingTemplate,
        ...input,
        updated_at: new Date(),
        creator: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(existingTemplate);
      (prisma.workflows.update as jest.Mock).mockResolvedValue(updatedTemplate);

      const result = await updateWorkflowTemplate(templateId, input);

      expect(result.success).toBe(true);
      expect(result.template.name).toBe(input.name);
      expect(prisma.transaction_audit_logs.create).toHaveBeenCalled();
    });

    it('should throw error if template not found', async () => {
      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        updateWorkflowTemplate('non-existent', { name: 'Test' })
      ).rejects.toThrow('Workflow template not found');
    });
  });

  describe('deleteWorkflowTemplate', () => {
    it('should delete template if not applied', async () => {
      const templateId = 'template-1';

      const template = {
        id: templateId,
        name: 'Test Template',
        is_template: true,
        organization_id: 'org-1',
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(template);
      (prisma.workflows.count as jest.Mock).mockResolvedValue(0);
      (prisma.workflows.delete as jest.Mock).mockResolvedValue(template);

      const result = await deleteWorkflowTemplate(templateId);

      expect(result.success).toBe(true);
      expect(prisma.workflows.delete).toHaveBeenCalledWith({
        where: { id: templateId },
      });
    });

    it('should reject deletion if template has been applied', async () => {
      const templateId = 'template-1';

      const template = {
        id: templateId,
        name: 'Applied Template',
        is_template: true,
        organization_id: 'org-1',
      };

      (prisma.workflows.findFirst as jest.Mock).mockResolvedValue(template);
      (prisma.workflows.count as jest.Mock).mockResolvedValue(3); // 3 instances

      await expect(deleteWorkflowTemplate(templateId)).rejects.toThrow(
        'Cannot delete template. It has been applied to 3 loop(s)'
      );
    });
  });
});
