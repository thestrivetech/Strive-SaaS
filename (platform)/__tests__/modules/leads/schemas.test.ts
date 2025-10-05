/**
 * Leads Schemas Test Suite
 * Tests for Zod schema validation
 *
 * Coverage: createLeadSchema, updateLeadSchema, leadFiltersSchema,
 *           updateLeadScoreSchema, updateLeadStatusSchema, bulkAssignLeadsSchema
 */

import { LeadStatus, LeadSource, LeadScore } from '@prisma/client';
import {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
  updateLeadScoreSchema,
  updateLeadStatusSchema,
  bulkAssignLeadsSchema,
} from '@/lib/modules/crm/leads/schemas';

describe('Leads Schemas', () => {
  describe('createLeadSchema', () => {
    it('should validate valid lead data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW_LEAD,
        score: LeadScore.WARM,
        score_value: 50,
        budget: 10000,
        timeline: '3 months',
        notes: 'Interested in enterprise plan',
        tags: ['enterprise', 'high-priority'],
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should require name field', () => {
      const invalidData = {
        email: 'test@example.com',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should enforce name minimum length (2 characters)', () => {
      const invalidData = {
        name: 'J',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should enforce name maximum length (100 characters)', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate email format if provided', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should allow empty string email and convert to undefined', () => {
      const data = {
        name: 'John Doe',
        email: '',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBeUndefined();
      }
    });

    it('should accept valid LeadSource enum values', () => {
      Object.values(LeadSource).forEach((source) => {
        const data = {
          name: 'Test Lead',
          source,
          organization_id: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createLeadSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid LeadSource values', () => {
      const invalidData = {
        name: 'Test Lead',
        source: 'INVALID_SOURCE',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default source to WEBSITE', () => {
      const data = {
        name: 'Test Lead',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe(LeadSource.WEBSITE);
      }
    });

    it('should default status to NEW_LEAD', () => {
      const data = {
        name: 'Test Lead',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(LeadStatus.NEW_LEAD);
      }
    });

    it('should default score to COLD', () => {
      const data = {
        name: 'Test Lead',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.score).toBe(LeadScore.COLD);
      }
    });

    it('should validate score_value range (0-100)', () => {
      const invalidLow = {
        name: 'Test',
        score_value: -10,
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const invalidHigh = {
        name: 'Test',
        score_value: 150,
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(createLeadSchema.safeParse(invalidLow).success).toBe(false);
      expect(createLeadSchema.safeParse(invalidHigh).success).toBe(false);

      const valid = {
        name: 'Test',
        score_value: 75,
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(createLeadSchema.safeParse(valid).success).toBe(true);
    });

    it('should validate budget as positive number', () => {
      const invalidData = {
        name: 'Test',
        budget: -1000,
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate notes max length (5000)', () => {
      const invalidData = {
        name: 'Test',
        notes: 'A'.repeat(5001),
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate tags as array of strings', () => {
      const validData = {
        name: 'Test',
        tags: ['vip', 'enterprise', 'high-priority'],
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['vip', 'enterprise', 'high-priority']);
      }
    });

    it('should default tags to empty array', () => {
      const data = {
        name: 'Test',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it('should validate assigned_to_id as UUID', () => {
      const invalidData = {
        name: 'Test',
        assigned_to_id: 'not-a-uuid',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const validData = {
        name: 'Test',
        assigned_to_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const validResult = createLeadSchema.safeParse(validData);
      expect(validResult.success).toBe(true);
    });

    it('should require organization_id as UUID', () => {
      const missingOrg = {
        name: 'Test',
      };

      expect(createLeadSchema.safeParse(missingOrg).success).toBe(false);

      const invalidOrg = {
        name: 'Test',
        organization_id: 'not-a-uuid',
      };

      expect(createLeadSchema.safeParse(invalidOrg).success).toBe(false);
    });

    it('should accept custom_fields as record', () => {
      const data = {
        name: 'Test',
        custom_fields: {
          industry: 'Technology',
          employees: 50,
          revenue: 1000000,
        },
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.custom_fields).toEqual({
          industry: 'Technology',
          employees: 50,
          revenue: 1000000,
        });
      }
    });
  });

  describe('updateLeadSchema', () => {
    it('should require id field', () => {
      const data = {
        name: 'Updated Name',
      };

      const result = updateLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should make all other fields optional', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = updateLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Name',
        score: LeadScore.HOT,
      };

      const result = updateLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
        expect(result.data.score).toBe(LeadScore.HOT);
      }
    });
  });

  describe('leadFiltersSchema', () => {
    it('should accept single status filter', () => {
      const filters = {
        status: LeadStatus.NEW_LEAD,
      };

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should accept array of statuses', () => {
      const filters = {
        status: [LeadStatus.NEW_LEAD, LeadStatus.QUALIFIED],
      };

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it('should validate pagination limit (max 100)', () => {
      const invalid = {
        limit: 150,
      };

      const result = leadFiltersSchema.safeParse(invalid);
      expect(result.success).toBe(false);

      const valid = {
        limit: 50,
      };

      const validResult = leadFiltersSchema.safeParse(valid);
      expect(validResult.success).toBe(true);
    });

    it('should default limit to 50', () => {
      const filters = {};

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should default offset to 0', () => {
      const filters = {};

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(0);
      }
    });

    it('should validate sort_by enum values', () => {
      const invalid = {
        sort_by: 'invalid_field',
      };

      expect(leadFiltersSchema.safeParse(invalid).success).toBe(false);

      const valid = {
        sort_by: 'score_value',
      };

      expect(leadFiltersSchema.safeParse(valid).success).toBe(true);
    });

    it('should default sort_order to desc', () => {
      const filters = {};

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_order).toBe('desc');
      }
    });

    it('should parse date strings to Date objects', () => {
      const filters = {
        created_from: '2024-01-01',
        created_to: '2024-12-31',
      };

      const result = leadFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created_from).toBeInstanceOf(Date);
        expect(result.data.created_to).toBeInstanceOf(Date);
      }
    });
  });

  describe('updateLeadScoreSchema', () => {
    it('should validate complete score update', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        score: LeadScore.HOT,
        score_value: 95,
      };

      const result = updateLeadScoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require all fields', () => {
      const missingScore = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        score_value: 95,
      };

      expect(updateLeadScoreSchema.safeParse(missingScore).success).toBe(false);

      const missingValue = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        score: LeadScore.HOT,
      };

      expect(updateLeadScoreSchema.safeParse(missingValue).success).toBe(false);
    });

    it('should validate score_value range', () => {
      const tooLow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        score: LeadScore.COLD,
        score_value: -1,
      };

      expect(updateLeadScoreSchema.safeParse(tooLow).success).toBe(false);

      const tooHigh = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        score: LeadScore.HOT,
        score_value: 101,
      };

      expect(updateLeadScoreSchema.safeParse(tooHigh).success).toBe(false);
    });
  });

  describe('updateLeadStatusSchema', () => {
    it('should validate status update', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: LeadStatus.QUALIFIED,
      };

      const result = updateLeadStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional notes', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: LeadStatus.CONVERTED,
        notes: 'Converted to customer',
      };

      const result = updateLeadStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe('Converted to customer');
      }
    });

    it('should validate notes max length (1000)', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: LeadStatus.QUALIFIED,
        notes: 'A'.repeat(1001),
      };

      const result = updateLeadStatusSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkAssignLeadsSchema', () => {
    it('should validate bulk assignment', () => {
      const data = {
        lead_ids: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
          '550e8400-e29b-41d4-a716-446655440003',
        ],
        assigned_to_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = bulkAssignLeadsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require at least 1 lead_id', () => {
      const data = {
        lead_ids: [],
        assigned_to_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = bulkAssignLeadsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should limit to max 100 lead_ids', () => {
      const data = {
        lead_ids: Array(101).fill('550e8400-e29b-41d4-a716-446655440000'),
        assigned_to_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = bulkAssignLeadsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate all UUIDs in array', () => {
      const data = {
        lead_ids: ['not-a-uuid', 'invalid'],
        assigned_to_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = bulkAssignLeadsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
