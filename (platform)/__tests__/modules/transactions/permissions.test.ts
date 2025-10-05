import {
  hasTransactionPermission,
  canModifyLoop,
  TRANSACTION_PERMISSIONS,
} from '@/lib/modules/transactions/core/permissions';

describe('Transaction Permissions', () => {
  describe('hasTransactionPermission', () => {
    describe('VIEW_LOOPS permission', () => {
      it('should allow ADMIN users to view', () => {
        const user = {
          id: 'user-1',
          role: 'ADMIN' as const,
          organization_members: [],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.VIEW_LOOPS)).toBe(true);
      });

      it('should allow USER with any org role to view', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'VIEWER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.VIEW_LOOPS)).toBe(true);
      });

      it('should deny CLIENT users', () => {
        const user = {
          id: 'user-1',
          role: 'CLIENT' as const,
          organization_members: [{ role: 'ADMIN' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.VIEW_LOOPS)).toBe(false);
      });

      it('should deny USER without org membership', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.VIEW_LOOPS)).toBe(false);
      });
    });

    describe('CREATE_LOOPS permission', () => {
      it('should allow USER with MEMBER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'MEMBER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.CREATE_LOOPS)).toBe(true);
      });

      it('should allow USER with ADMIN role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'ADMIN' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.CREATE_LOOPS)).toBe(true);
      });

      it('should allow USER with OWNER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'OWNER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.CREATE_LOOPS)).toBe(true);
      });

      it('should deny USER with VIEWER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'VIEWER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.CREATE_LOOPS)).toBe(false);
      });

      it('should allow platform ADMIN regardless of org role', () => {
        const user = {
          id: 'user-1',
          role: 'ADMIN' as const,
          organization_members: [{ role: 'VIEWER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.CREATE_LOOPS)).toBe(true);
      });
    });

    describe('UPDATE_LOOPS permission', () => {
      it('should allow USER with MEMBER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'MEMBER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.UPDATE_LOOPS)).toBe(true);
      });

      it('should deny USER with VIEWER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'VIEWER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.UPDATE_LOOPS)).toBe(false);
      });
    });

    describe('DELETE_LOOPS permission', () => {
      it('should allow USER with OWNER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'OWNER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.DELETE_LOOPS)).toBe(true);
      });

      it('should allow USER with ADMIN role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'ADMIN' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.DELETE_LOOPS)).toBe(true);
      });

      it('should deny USER with MEMBER role', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'MEMBER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.DELETE_LOOPS)).toBe(false);
      });

      it('should allow platform ADMIN', () => {
        const user = {
          id: 'user-1',
          role: 'ADMIN' as const,
          organization_members: [{ role: 'MEMBER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.DELETE_LOOPS)).toBe(true);
      });
    });

    describe('MANAGE_ALL permission', () => {
      it('should allow platform ADMIN', () => {
        const user = {
          id: 'user-1',
          role: 'ADMIN' as const,
          organization_members: [],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.MANAGE_ALL)).toBe(true);
      });

      it('should allow org OWNER', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'OWNER' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.MANAGE_ALL)).toBe(true);
      });

      it('should deny org ADMIN', () => {
        const user = {
          id: 'user-1',
          role: 'USER' as const,
          organization_members: [{ role: 'ADMIN' as const }],
        };

        expect(hasTransactionPermission(user as any, TRANSACTION_PERMISSIONS.MANAGE_ALL)).toBe(false);
      });
    });
  });

  describe('canModifyLoop', () => {
    it('should allow creator to modify their own loop', () => {
      const user = {
        id: 'user-1',
        role: 'USER' as const,
        organization_members: [{ role: 'VIEWER' as const }],
      };

      const loop = {
        created_by: 'user-1',
      };

      expect(canModifyLoop(user as any, loop)).toBe(true);
    });

    it('should allow org ADMIN to modify any loop', () => {
      const user = {
        id: 'user-1',
        role: 'USER' as const,
        organization_members: [{ role: 'ADMIN' as const }],
      };

      const loop = {
        created_by: 'user-2', // Different user
      };

      expect(canModifyLoop(user as any, loop)).toBe(true);
    });

    it('should allow org OWNER to modify any loop', () => {
      const user = {
        id: 'user-1',
        role: 'USER' as const,
        organization_members: [{ role: 'OWNER' as const }],
      };

      const loop = {
        created_by: 'user-2', // Different user
      };

      expect(canModifyLoop(user as any, loop)).toBe(true);
    });

    it('should deny non-creator MEMBER from modifying', () => {
      const user = {
        id: 'user-1',
        role: 'USER' as const,
        organization_members: [{ role: 'MEMBER' as const }],
      };

      const loop = {
        created_by: 'user-2', // Different user
      };

      expect(canModifyLoop(user as any, loop)).toBe(false);
    });

    it('should allow platform ADMIN to modify any loop', () => {
      const user = {
        id: 'user-1',
        role: 'ADMIN' as const,
        organization_members: [{ role: 'VIEWER' as const }],
      };

      const loop = {
        created_by: 'user-2',
      };

      expect(canModifyLoop(user as any, loop)).toBe(true);
    });
  });
});
