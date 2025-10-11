import {
  WorkflowStepSchema,
  CreateWorkflowTemplateSchema,
  ApplyWorkflowSchema,
  UpdateWorkflowTemplateSchema,
  QueryWorkflowTemplatesSchema,
} from '@/lib/modules/workspace/workflows/schemas';
import { PartyRole } from '@prisma/client';

describe('Workflow Schemas', () => {
  describe('WorkflowStepSchema', () => {
    it('should validate valid workflow step', () => {
      const validStep = {
        id: 'step-1',
        title: 'Complete inspection',
        description: 'Schedule and complete property inspection',
        order: 0,
        estimatedDays: 7,
        dependencies: [],
        autoAssignRole: 'INSPECTOR' as PartyRole,
        requiresDocument: true,
        requiresSignature: false,
      };

      const result = WorkflowStepSchema.safeParse(validStep);
      expect(result.success).toBe(true);
    });

    it('should reject step with invalid order', () => {
      const invalidStep = {
        id: 'step-1',
        title: 'Test Step',
        order: -1, // Invalid: negative order
      };

      const result = WorkflowStepSchema.safeParse(invalidStep);
      expect(result.success).toBe(false);
    });

    it('should reject step with short title', () => {
      const invalidStep = {
        id: 'step-1',
        title: 'AB', // Too short
        order: 0,
      };

      const result = WorkflowStepSchema.safeParse(invalidStep);
      expect(result.success).toBe(false);
    });

    it('should set default values for optional fields', () => {
      const minimalStep = {
        id: 'step-1',
        title: 'Valid Step Title',
        order: 0,
      };

      const result = WorkflowStepSchema.parse(minimalStep);
      expect(result.dependencies).toEqual([]);
      expect(result.requiresDocument).toBe(false);
      expect(result.requiresSignature).toBe(false);
    });
  });

  describe('CreateWorkflowTemplateSchema', () => {
    it('should validate valid workflow template', () => {
      const validTemplate = {
        name: 'Purchase Agreement Workflow',
        description: 'Standard workflow for purchase agreements',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [
          {
            id: 'step-1',
            title: 'Submit Offer',
            order: 0,
            estimatedDays: 1,
          },
          {
            id: 'step-2',
            title: 'Schedule Inspection',
            order: 1,
            estimatedDays: 7,
            dependencies: ['step-1'],
          },
        ],
      };

      const result = CreateWorkflowTemplateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should reject template with empty steps array', () => {
      const invalidTemplate = {
        name: 'Empty Workflow',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [],
      };

      const result = CreateWorkflowTemplateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should reject template with short name', () => {
      const invalidTemplate = {
        name: 'AB', // Too short
        transactionType: 'PURCHASE_AGREEMENT' as const,
        steps: [{ id: 'step-1', title: 'Step Title', order: 0 }],
      };

      const result = CreateWorkflowTemplateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should reject template with invalid transaction type', () => {
      const invalidTemplate = {
        name: 'Valid Workflow Name',
        transactionType: 'INVALID_TYPE',
        steps: [{ id: 'step-1', title: 'Step Title', order: 0 }],
      };

      const result = CreateWorkflowTemplateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });

    it('should accept ALL as transaction type', () => {
      const validTemplate = {
        name: 'Universal Workflow',
        transactionType: 'ALL' as const,
        steps: [{ id: 'step-1', title: 'Step Title', order: 0 }],
      };

      const result = CreateWorkflowTemplateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });
  });

  describe('ApplyWorkflowSchema', () => {
    it('should validate valid application input', () => {
      const validInput = {
        loopId: '123e4567-e89b-12d3-a456-426614174000',
        templateId: '123e4567-e89b-12d3-a456-426614174001',
        customizations: { priority: 'HIGH' },
      };

      const result = ApplyWorkflowSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for loopId', () => {
      const invalidInput = {
        loopId: 'not-a-uuid',
        templateId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = ApplyWorkflowSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for templateId', () => {
      const invalidInput = {
        loopId: '123e4567-e89b-12d3-a456-426614174000',
        templateId: 'invalid',
      };

      const result = ApplyWorkflowSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should allow optional customizations', () => {
      const minimalInput = {
        loopId: '123e4567-e89b-12d3-a456-426614174000',
        templateId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = ApplyWorkflowSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateWorkflowTemplateSchema', () => {
    it('should validate partial updates', () => {
      const validUpdate = {
        name: 'Updated Workflow Name',
      };

      const result = UpdateWorkflowTemplateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate steps update', () => {
      const validUpdate = {
        steps: [
          { id: 'step-1', title: 'New Step', order: 0 },
        ],
      };

      const result = UpdateWorkflowTemplateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject empty steps array in update', () => {
      const invalidUpdate = {
        steps: [],
      };

      const result = UpdateWorkflowTemplateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('QueryWorkflowTemplatesSchema', () => {
    it('should validate query with transaction type', () => {
      const validQuery = {
        transactionType: 'PURCHASE_AGREEMENT' as const,
        isTemplate: true,
      };

      const result = QueryWorkflowTemplatesSchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should default isTemplate to true', () => {
      const query = {};

      const result = QueryWorkflowTemplatesSchema.parse(query);
      expect(result.isTemplate).toBe(true);
    });

    it('should allow ALL transaction type', () => {
      const validQuery = {
        transactionType: 'ALL' as const,
      };

      const result = QueryWorkflowTemplatesSchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });
  });
});
