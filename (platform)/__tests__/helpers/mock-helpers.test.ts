import { mockAsyncFunction, mockFunction, setupAuthMocks, setupPrismaMocks } from './mock-helpers';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/lib/database/prisma');

describe('Mock Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mockAsyncFunction', () => {
    it('should create typed async mock', async () => {
      const mockFn = jest.fn().mockResolvedValue('test');
      const typedMock = mockAsyncFunction(mockFn);

      const result = await typedMock();
      expect(result).toBe('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle async function with parameters', async () => {
      const mockFn = jest.fn().mockResolvedValue({ id: '123', name: 'Test' });
      const typedMock = mockAsyncFunction(mockFn);

      const result = await typedMock('param1', 'param2');
      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(mockFn).toHaveBeenCalledWith('param1', 'param2');
    });
  });

  describe('mockFunction', () => {
    it('should create typed sync mock', () => {
      const mockFn = jest.fn().mockReturnValue(42);
      const typedMock = mockFunction(mockFn);

      const result = typedMock();
      expect(result).toBe(42);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle function with parameters', () => {
      const mockFn = jest.fn().mockReturnValue('result');
      const typedMock = mockFunction(mockFn);

      const result = typedMock('arg1', 'arg2');
      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('setupAuthMocks', () => {
    it('should setup auth mocks correctly', () => {
      const { mockUser } = setupAuthMocks();

      expect(mockUser.id).toBe('test-user-id');
      expect(mockUser.email).toBe('test@example.com');
      expect(mockUser.organizationId).toBe('test-org-id');
      expect(mockUser.globalRole).toBe('USER');
      expect(mockUser.organizationRole).toBe('ADMIN');
    });

    it('should mock getCurrentUser', async () => {
      const { mockUser } = setupAuthMocks();

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should return consistent mock user across calls', () => {
      const { mockUser: mockUser1 } = setupAuthMocks();
      const { mockUser: mockUser2 } = setupAuthMocks();

      expect(mockUser1).toEqual(mockUser2);
    });
  });

  describe('setupPrismaMocks', () => {
    it('should setup Prisma mocks', () => {
      const prisma = setupPrismaMocks();

      expect(prisma).toBeDefined();
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
    });

    it('should allow configuration of Prisma mocks', () => {
      const prisma = setupPrismaMocks();
      const mockData = [{ id: '1', name: 'Test User' }];

      mockAsyncFunction(prisma.user.findMany).mockResolvedValue(mockData);

      expect(prisma.user.findMany).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should work together for common test scenarios', async () => {
      const { mockUser } = setupAuthMocks();
      const prisma = setupPrismaMocks();

      const mockUsers = [
        { id: '1', email: 'user1@example.com', organizationId: mockUser.organizationId },
        { id: '2', email: 'user2@example.com', organizationId: mockUser.organizationId },
      ];

      mockAsyncFunction(prisma.user.findMany).mockResolvedValue(mockUsers);

      const user = await getCurrentUser();
      expect(user).toEqual(mockUser);

      // In a real test, you would call a function that uses these mocks
      // For now, just verify the mocks are set up correctly
      expect(prisma.user.findMany).toBeDefined();
    });
  });
});
