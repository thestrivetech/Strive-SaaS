/**
 * Contacts Schemas Test Suite
 * Tests for Zod schema validation
 *
 * Coverage: createContactSchema, updateContactSchema, contactFiltersSchema,
 *           logCommunicationSchema, updateContactStatusSchema, bulkAssignContactsSchema
 */

import { ContactType, ContactStatus, ActivityType } from '@prisma/client';
import {
  createContactSchema,
  updateContactSchema,
  contactFiltersSchema,
  logCommunicationSchema,
  updateContactStatusSchema,
  bulkAssignContactsSchema,
} from '@/lib/modules/crm/contacts/schemas';

describe('Contact Schemas', () => {
  describe('createContactSchema', () => {
    it('should validate valid contact data', () => {
      const validData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        position: 'CEO',
        type: ContactType.PROSPECT,
        status: ContactStatus.ACTIVE,
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Smith');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should reject name that is too short', () => {
      const invalidData = {
        name: 'J', // Too short (min 2 characters)
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Smith',
        email: 'invalid-email',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should accept empty string for email and transform to undefined', () => {
      const data = {
        name: 'John Smith',
        email: '',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBeUndefined();
      }
    });

    it('should validate LinkedIn URL if provided', () => {
      const validData = {
        name: 'John Smith',
        linkedin_url: 'https://linkedin.com/in/johnsmith',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid LinkedIn URL', () => {
      const invalidData = {
        name: 'John Smith',
        linkedin_url: 'not-a-url',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const minimalData = {
        name: 'John Smith',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe(ContactType.PROSPECT); // Default
        expect(result.data.status).toBe(ContactStatus.ACTIVE); // Default
        expect(result.data.tags).toEqual([]); // Default
      }
    });

    it('should validate tags array', () => {
      const data = {
        name: 'John Smith',
        tags: ['vip', 'conference', 'follow-up'],
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toHaveLength(3);
      }
    });

    it('should validate custom_fields object', () => {
      const data = {
        name: 'John Smith',
        custom_fields: {
          industry: 'Technology',
          employee_count: '50-100',
        },
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.custom_fields?.industry).toBe('Technology');
      }
    });

    it('should validate assigned_to_id as UUID', () => {
      const data = {
        name: 'John Smith',
        assigned_to_id: '123e4567-e89b-12d3-a456-426614174000',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for assigned_to_id', () => {
      const data = {
        name: 'John Smith',
        assigned_to_id: 'not-a-uuid',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('updateContactSchema', () => {
    it('should validate update with all fields optional except ID', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Name',
      };

      const result = updateContactSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should require ID field', () => {
      const data = {
        name: 'Updated Name',
      };

      const result = updateContactSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        position: 'VP Sales', // Only updating position
      };

      const result = updateContactSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.position).toBe('VP Sales');
      }
    });
  });

  describe('contactFiltersSchema', () => {
    it('should validate basic filters', () => {
      const filters = {
        type: ContactType.CLIENT,
        status: ContactStatus.ACTIVE,
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
    });

    it('should validate array of types', () => {
      const filters = {
        type: [ContactType.CLIENT, ContactType.PROSPECT],
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
    });

    it('should validate search string', () => {
      const filters = {
        search: 'john',
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
    });

    it('should validate pagination parameters', () => {
      const filters = {
        limit: 25,
        offset: 10,
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should apply default pagination values', () => {
      const filters = {};

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50); // Default
        expect(result.data.offset).toBe(0); // Default
        expect(result.data.sort_order).toBe('desc'); // Default
      }
    });

    it('should reject limit greater than 100', () => {
      const filters = {
        limit: 150,
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const filters = {
        offset: -10,
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(false);
    });

    it('should validate date range filters', () => {
      const filters = {
        created_from: new Date('2024-01-01'),
        created_to: new Date('2024-12-31'),
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
    });

    it('should validate sorting parameters', () => {
      const filters = {
        sort_by: 'name' as const,
        sort_order: 'asc' as const,
      };

      const result = contactFiltersSchema.safeParse(filters);

      expect(result.success).toBe(true);
    });
  });

  describe('logCommunicationSchema', () => {
    it('should validate valid communication log', () => {
      const data = {
        contact_id: '123e4567-e89b-12d3-a456-426614174000',
        type: ActivityType.CALL,
        title: 'Discussed partnership',
        description: 'Had a great conversation',
        outcome: 'Scheduled follow-up',
        duration_minutes: 30,
      };

      const result = logCommunicationSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should require contact_id, type, and title', () => {
      const data = {
        description: 'Missing required fields',
      };

      const result = logCommunicationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const data = {
        contact_id: '123e4567-e89b-12d3-a456-426614174000',
        type: ActivityType.CALL,
        title: '',
      };

      const result = logCommunicationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should validate duration_minutes as positive integer', () => {
      const validData = {
        contact_id: '123e4567-e89b-12d3-a456-426614174000',
        type: ActivityType.CALL,
        title: 'Call',
        duration_minutes: 15,
      };

      const result = logCommunicationSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject negative duration_minutes', () => {
      const invalidData = {
        contact_id: '123e4567-e89b-12d3-a456-426614174000',
        type: ActivityType.CALL,
        title: 'Call',
        duration_minutes: -10,
      };

      const result = logCommunicationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('updateContactStatusSchema', () => {
    it('should validate status update', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: ContactStatus.INACTIVE,
      };

      const result = updateContactStatusSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should accept optional notes', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: ContactStatus.INACTIVE,
        notes: 'Contact requested to be marked inactive',
      };

      const result = updateContactStatusSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeDefined();
      }
    });

    it('should require id and status', () => {
      const data = {
        notes: 'Missing required fields',
      };

      const result = updateContactStatusSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('bulkAssignContactsSchema', () => {
    it('should validate bulk assignment', () => {
      const data = {
        contact_ids: [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174001',
        ],
        assigned_to_id: '323e4567-e89b-12d3-a456-426614174002',
      };

      const result = bulkAssignContactsSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should reject empty contact_ids array', () => {
      const data = {
        contact_ids: [],
        assigned_to_id: '323e4567-e89b-12d3-a456-426614174002',
      };

      const result = bulkAssignContactsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should reject more than 100 contact_ids', () => {
      const data = {
        contact_ids: Array(101).fill('123e4567-e89b-12d3-a456-426614174000'),
        assigned_to_id: '323e4567-e89b-12d3-a456-426614174002',
      };

      const result = bulkAssignContactsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require assigned_to_id', () => {
      const data = {
        contact_ids: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = bulkAssignContactsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});
