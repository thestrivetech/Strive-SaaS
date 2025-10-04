/**
 * Tests for Organization-Level Role-Based Access Control (Org RBAC)
 *
 * Target: 90%+ coverage
 */

import {
  hasOrgPermission,
  requireOrgPermission,
  canManageMembers,
  canInviteMembers,
  canManageBilling,
  canManageOrgSettings,
  canDeleteOrganization,
  canInstallTools,
  canManageIndustries,
  getOrgRolePermissions,
  isOrgOwner,
  isOrgAdmin,
  type OrgRole,
  type OrgPermission,
} from '@/lib/auth/org-rbac';

describe('Organization RBAC System', () => {
  describe('hasOrgPermission', () => {
    describe('Global ADMIN bypass', () => {
      it('should allow global ADMIN all org permissions regardless of org role', () => {
        expect(hasOrgPermission('ADMIN', 'VIEWER', 'org:delete')).toBe(true);
        expect(hasOrgPermission('ADMIN', 'VIEWER', 'settings:billing')).toBe(true);
        expect(hasOrgPermission('ADMIN', 'MEMBER', 'members:remove')).toBe(true);
        expect(hasOrgPermission('ADMIN', 'ADMIN', 'org:transfer')).toBe(true);
      });
    });

    describe('OWNER permissions', () => {
      const role: OrgRole = 'OWNER';

      it('should have full access to all org permissions', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'members:invite')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'members:remove')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'members:updateRole')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:edit')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:billing')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:integrations')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'industry:enable')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'industry:disable')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'industry:configure')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:delete')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:transfer')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:install')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:uninstall')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:configure')).toBe(true);
      });
    });

    describe('ADMIN (org) permissions', () => {
      const role: OrgRole = 'ADMIN';

      it('should have most permissions except ownership-level ones', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'members:invite')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'members:remove')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:edit')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'industry:enable')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:install')).toBe(true);
      });

      it('should NOT have owner-only permissions', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:billing')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:delete')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:transfer')).toBe(false);
      });
    });

    describe('MEMBER permissions', () => {
      const role: OrgRole = 'MEMBER';

      it('should have limited permissions', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'members:invite')).toBe(true);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:configure')).toBe(true);
      });

      it('should NOT have management permissions', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'members:remove')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:edit')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:billing')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:delete')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:install')).toBe(false);
      });
    });

    describe('VIEWER permissions', () => {
      const role: OrgRole = 'VIEWER';

      it('should have NO org-level permissions', () => {
        expect(hasOrgPermission('EMPLOYEE', role, 'members:invite')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'tools:configure')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'settings:edit')).toBe(false);
        expect(hasOrgPermission('EMPLOYEE', role, 'org:delete')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return false for invalid org role', () => {
        expect(hasOrgPermission('EMPLOYEE', 'INVALID' as OrgRole, 'members:invite')).toBe(false);
      });

      it('should work with MODERATOR global role', () => {
        expect(hasOrgPermission('MODERATOR', 'OWNER', 'org:delete')).toBe(true);
        expect(hasOrgPermission('MODERATOR', 'VIEWER', 'members:invite')).toBe(false);
      });

      it('should work with CLIENT global role', () => {
        // Clients can still be org owners/admins if invited
        expect(hasOrgPermission('CLIENT', 'OWNER', 'settings:billing')).toBe(true);
        expect(hasOrgPermission('CLIENT', 'MEMBER', 'members:invite')).toBe(true);
      });
    });
  });

  describe('requireOrgPermission', () => {
    it('should not throw for user with org permission', () => {
      expect(() => {
        requireOrgPermission('EMPLOYEE', 'OWNER', 'org:delete');
      }).not.toThrow();
    });

    it('should throw for user without org permission', () => {
      expect(() => {
        requireOrgPermission('EMPLOYEE', 'VIEWER', 'org:delete');
      }).toThrow('Forbidden: Missing organization permission org:delete');
    });

    it('should not throw for global ADMIN', () => {
      expect(() => {
        requireOrgPermission('ADMIN', 'VIEWER', 'org:delete');
      }).not.toThrow();
    });
  });

  describe('Helper Functions', () => {
    describe('canManageMembers', () => {
      it('should return true for OWNER and ADMIN org roles', () => {
        expect(canManageMembers('EMPLOYEE', 'OWNER')).toBe(true);
        expect(canManageMembers('EMPLOYEE', 'ADMIN')).toBe(true);
      });

      it('should return false for MEMBER and VIEWER', () => {
        expect(canManageMembers('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canManageMembers('EMPLOYEE', 'VIEWER')).toBe(false);
      });

      it('should return true for global ADMIN regardless of org role', () => {
        expect(canManageMembers('ADMIN', 'VIEWER')).toBe(true);
      });
    });

    describe('canInviteMembers', () => {
      it('should return true for OWNER, ADMIN, and MEMBER', () => {
        expect(canInviteMembers('EMPLOYEE', 'OWNER')).toBe(true);
        expect(canInviteMembers('EMPLOYEE', 'ADMIN')).toBe(true);
        expect(canInviteMembers('EMPLOYEE', 'MEMBER')).toBe(true);
      });

      it('should return false for VIEWER', () => {
        expect(canInviteMembers('EMPLOYEE', 'VIEWER')).toBe(false);
      });
    });

    describe('canManageBilling', () => {
      it('should return true only for OWNER', () => {
        expect(canManageBilling('EMPLOYEE', 'OWNER')).toBe(true);
      });

      it('should return false for non-owners', () => {
        expect(canManageBilling('EMPLOYEE', 'ADMIN')).toBe(false);
        expect(canManageBilling('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canManageBilling('EMPLOYEE', 'VIEWER')).toBe(false);
      });

      it('should return true for global ADMIN', () => {
        expect(canManageBilling('ADMIN', 'VIEWER')).toBe(true);
      });
    });

    describe('canManageOrgSettings', () => {
      it('should return true for OWNER and ADMIN', () => {
        expect(canManageOrgSettings('EMPLOYEE', 'OWNER')).toBe(true);
        expect(canManageOrgSettings('EMPLOYEE', 'ADMIN')).toBe(true);
      });

      it('should return false for MEMBER and VIEWER', () => {
        expect(canManageOrgSettings('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canManageOrgSettings('EMPLOYEE', 'VIEWER')).toBe(false);
      });
    });

    describe('canDeleteOrganization', () => {
      it('should return true only for OWNER', () => {
        expect(canDeleteOrganization('EMPLOYEE', 'OWNER')).toBe(true);
      });

      it('should return false for non-owners', () => {
        expect(canDeleteOrganization('EMPLOYEE', 'ADMIN')).toBe(false);
        expect(canDeleteOrganization('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canDeleteOrganization('EMPLOYEE', 'VIEWER')).toBe(false);
      });

      it('should return true for global ADMIN', () => {
        expect(canDeleteOrganization('ADMIN', 'MEMBER')).toBe(true);
      });
    });

    describe('canInstallTools', () => {
      it('should return true for OWNER and ADMIN', () => {
        expect(canInstallTools('EMPLOYEE', 'OWNER')).toBe(true);
        expect(canInstallTools('EMPLOYEE', 'ADMIN')).toBe(true);
      });

      it('should return false for MEMBER and VIEWER', () => {
        expect(canInstallTools('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canInstallTools('EMPLOYEE', 'VIEWER')).toBe(false);
      });
    });

    describe('canManageIndustries', () => {
      it('should return true for OWNER and ADMIN', () => {
        expect(canManageIndustries('EMPLOYEE', 'OWNER')).toBe(true);
        expect(canManageIndustries('EMPLOYEE', 'ADMIN')).toBe(true);
      });

      it('should return false for MEMBER and VIEWER', () => {
        expect(canManageIndustries('EMPLOYEE', 'MEMBER')).toBe(false);
        expect(canManageIndustries('EMPLOYEE', 'VIEWER')).toBe(false);
      });
    });
  });

  describe('getOrgRolePermissions', () => {
    it('should return all OWNER permissions', () => {
      const permissions = getOrgRolePermissions('OWNER');

      expect(permissions).toContain('members:invite');
      expect(permissions).toContain('settings:billing');
      expect(permissions).toContain('org:delete');
      expect(permissions.length).toBeGreaterThan(10);
    });

    it('should return ADMIN permissions without owner-only ones', () => {
      const permissions = getOrgRolePermissions('ADMIN');

      expect(permissions).toContain('members:invite');
      expect(permissions).toContain('settings:edit');
      expect(permissions).not.toContain('settings:billing');
      expect(permissions).not.toContain('org:delete');
    });

    it('should return limited MEMBER permissions', () => {
      const permissions = getOrgRolePermissions('MEMBER');

      expect(permissions).toHaveLength(2);
      expect(permissions).toContain('members:invite');
      expect(permissions).toContain('tools:configure');
    });

    it('should return empty array for VIEWER', () => {
      const permissions = getOrgRolePermissions('VIEWER');

      expect(permissions).toHaveLength(0);
    });

    it('should return empty array for invalid role', () => {
      const permissions = getOrgRolePermissions('INVALID' as OrgRole);

      expect(permissions).toHaveLength(0);
    });
  });

  describe('isOrgOwner', () => {
    it('should return true only for OWNER', () => {
      expect(isOrgOwner('OWNER')).toBe(true);
      expect(isOrgOwner('ADMIN')).toBe(false);
      expect(isOrgOwner('MEMBER')).toBe(false);
      expect(isOrgOwner('VIEWER')).toBe(false);
    });
  });

  describe('isOrgAdmin', () => {
    it('should return true for OWNER and ADMIN', () => {
      expect(isOrgAdmin('OWNER')).toBe(true);
      expect(isOrgAdmin('ADMIN')).toBe(true);
    });

    it('should return false for MEMBER and VIEWER', () => {
      expect(isOrgAdmin('MEMBER')).toBe(false);
      expect(isOrgAdmin('VIEWER')).toBe(false);
    });
  });

  describe('Dual-Role Permission Scenarios', () => {
    it('should handle EMPLOYEE + OWNER correctly', () => {
      expect(hasOrgPermission('EMPLOYEE', 'OWNER', 'org:delete')).toBe(true);
      expect(hasOrgPermission('EMPLOYEE', 'OWNER', 'settings:billing')).toBe(true);
    });

    it('should handle MODERATOR + ADMIN correctly', () => {
      expect(hasOrgPermission('MODERATOR', 'ADMIN', 'members:remove')).toBe(true);
      expect(hasOrgPermission('MODERATOR', 'ADMIN', 'settings:billing')).toBe(false);
    });

    it('should handle CLIENT + MEMBER correctly', () => {
      // CLIENTs can still be org members and invite
      expect(hasOrgPermission('CLIENT', 'MEMBER', 'members:invite')).toBe(true);
      expect(hasOrgPermission('CLIENT', 'MEMBER', 'settings:edit')).toBe(false);
    });

    it('should handle CLIENT + VIEWER correctly', () => {
      // Lowest permission combination
      expect(hasOrgPermission('CLIENT', 'VIEWER', 'members:invite')).toBe(false);
      expect(hasOrgPermission('CLIENT', 'VIEWER', 'tools:configure')).toBe(false);
    });
  });

  describe('Permission Exhaustiveness', () => {
    const allPermissions: OrgPermission[] = [
      'members:invite',
      'members:remove',
      'members:updateRole',
      'settings:edit',
      'settings:billing',
      'settings:integrations',
      'industry:enable',
      'industry:disable',
      'industry:configure',
      'org:delete',
      'org:transfer',
      'tools:install',
      'tools:uninstall',
      'tools:configure',
    ];

    it('should check all org permissions', () => {
      allPermissions.forEach(permission => {
        // OWNER should have all
        expect(hasOrgPermission('EMPLOYEE', 'OWNER', permission)).toBe(true);

        // Global ADMIN should bypass
        expect(hasOrgPermission('ADMIN', 'VIEWER', permission)).toBe(true);
      });
    });
  });
});
