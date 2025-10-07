import { createLoop, updateLoop, deleteLoop, updateLoopProgress } from '@/lib/modules/transactions/core/actions';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { prisma } from '@/lib/database/prisma';

// Mock dependencies
jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    transaction_loops: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction_audit_logs: {
      create: jest.fn(),
    },
  },
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Transaction Loop Actions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    subscription_tier: 'GROWTH' as const, // Transaction Management requires GROWTH tier
    organization_members: [
      {
        id: 'org-member-1',
        user_id: 'user-1',
        organization_id: 'org-1',
        role: 'ADMIN' as const,
        organizations: {
          id: 'org-1',
          name: 'Test Organization',
          subscription_tier: 'GROWTH' as const, // Org also needs GROWTH tier
        },
      },
    ],
  };

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    jest.clearAllMocks();
  });

  describe('createLoop', () => {
    it('should create loop with valid input', async () => {
      const input = {
        propertyAddress: '123 Test St, City, ST 12345',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        listingPrice: 450000,
      };

      const createdLoop = {
        id: 'loop-1',
        property_address: input.propertyAddress,
        transaction_type: input.transactionType,
        listing_price: input.listingPrice,
        organization_id: 'org-1',
        created_by: 'user-1',
        status: 'DRAFT',
        progress: 0,
        expected_closing: null,
        actual_closing: null,
        created_at: new Date(),
        updated_at: new Date(),
        creator: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (prisma.transaction_loops.create as jest.Mock).mockResolvedValue(createdLoop);

      const result = await createLoop(input);

      expect(result.success).toBe(true);
      expect(result.loop).toMatchObject({
        id: 'loop-1',
        property_address: input.propertyAddress,
        transaction_type: input.transactionType,
      });
      expect(prisma.transaction_audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'created',
            entity_type: 'loop',
            entity_id: 'loop-1',
          }),
        })
      );
    });

    it('should reject invalid input', async () => {
      const invalidInput = {
        propertyAddress: 'abc', // Too short
        transactionType: 'INVALID_TYPE' as any,
        listingPrice: -100, // Negative
      };

      await expect(createLoop(invalidInput)).rejects.toThrow();
    });

    it('should enforce permission', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        subscription_tier: 'STARTER', // Below GROWTH tier
        organization_members: [
          {
            ...mockUser.organization_members[0],
            role: 'VIEWER', // No create permission
            organizations: {
              ...mockUser.organization_members[0].organizations,
              subscription_tier: 'STARTER', // Below GROWTH tier
            },
          },
        ],
      });

      await expect(
        createLoop({
          propertyAddress: '123 Test St',
          transactionType: 'PURCHASE_AGREEMENT' as const,
          listingPrice: 450000,
        })
      ).rejects.toThrow('Transaction Management requires GROWTH tier');
    });

    it('should reject unauthenticated request', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(
        createLoop({
          propertyAddress: '123 Test St',
          transactionType: 'PURCHASE_AGREEMENT' as const,
          listingPrice: 450000,
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('updateLoop', () => {
    it('should update loop when user is creator', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-1',
        organization_id: 'org-1',
        property_address: '123 Test St',
        transaction_type: 'PURCHASE_AGREEMENT',
        listing_price: 450000,
        status: 'DRAFT',
        progress: 0,
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transaction_loops.update as jest.Mock).mockResolvedValue({
        ...existingLoop,
        progress: 50,
      });

      const result = await updateLoop('loop-1', { progress: 50 });

      expect(result.success).toBe(true);
      expect(result.loop.progress).toBe(50);
      expect(prisma.transaction_audit_logs.create).toHaveBeenCalled();
    });

    it('should reject update from non-creator without admin role', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-2', // Different creator
        organization_id: 'org-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        organization_members: [
          {
            ...mockUser.organization_members[0],
            role: 'MEMBER', // Not admin, not creator
          },
        ],
      });

      await expect(updateLoop('loop-1', { progress: 50 })).rejects.toThrow('Unauthorized');
    });

    it('should allow org admin to update any loop', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-2', // Different creator
        organization_id: 'org-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transaction_loops.update as jest.Mock).mockResolvedValue({
        ...existingLoop,
        progress: 75,
      });

      // User is org admin
      const result = await updateLoop('loop-1', { progress: 75 });

      expect(result.success).toBe(true);
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(updateLoop('non-existent', { progress: 50 })).rejects.toThrow('Loop not found');
    });
  });

  describe('deleteLoop', () => {
    it('should delete loop with admin permission', async () => {
      const existingLoop = {
        id: 'loop-1',
        organization_id: 'org-1',
        created_by: 'user-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transaction_loops.delete as jest.Mock).mockResolvedValue(existingLoop);

      const result = await deleteLoop('loop-1');

      expect(result.success).toBe(true);
      expect(prisma.transaction_loops.delete).toHaveBeenCalledWith({
        where: { id: 'loop-1' },
      });
      expect(prisma.transaction_audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'deleted',
            entity_type: 'loop',
          }),
        })
      );
    });

    it('should reject delete without permission', async () => {
      const existingLoop = {
        id: 'loop-1',
        organization_id: 'org-1',
        created_by: 'user-2', // Not the creator
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        organization_members: [
          {
            ...mockUser.organization_members[0],
            role: 'MEMBER', // No delete permission
          },
        ],
      });

      await expect(deleteLoop('loop-1')).rejects.toThrow('Unauthorized');
    });

    it('should throw error if loop not found', async () => {
      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(deleteLoop('non-existent')).rejects.toThrow('Loop not found');
    });
  });

  describe('updateLoopProgress', () => {
    it('should update progress for valid input', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-1',
        organization_id: 'org-1',
        progress: 0,
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transaction_loops.update as jest.Mock).mockResolvedValue({
        ...existingLoop,
        progress: 65,
      });

      const result = await updateLoopProgress('loop-1', 65);

      expect(result.success).toBe(true);
      expect(result.progress).toBe(65);
    });

    it('should reject invalid progress values', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-1',
        organization_id: 'org-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);

      await expect(updateLoopProgress('loop-1', -10)).rejects.toThrow('Progress must be between 0 and 100');
      await expect(updateLoopProgress('loop-1', 150)).rejects.toThrow('Progress must be between 0 and 100');
    });

    it('should enforce modify permission', async () => {
      const existingLoop = {
        id: 'loop-1',
        created_by: 'user-2', // Different user
        organization_id: 'org-1',
      };

      (prisma.transaction_loops.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (getCurrentUser as jest.Mock).mockResolvedValue({
        ...mockUser,
        organization_members: [
          {
            ...mockUser.organization_members[0],
            role: 'MEMBER', // Not admin, not creator
          },
        ],
      });

      await expect(updateLoopProgress('loop-1', 50)).rejects.toThrow('Unauthorized');
    });
  });
});
