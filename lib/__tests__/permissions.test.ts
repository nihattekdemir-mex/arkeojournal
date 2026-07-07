import { hasPermission, hasAnyPermission, hasAllPermissions, ROLE_PERMISSIONS } from '@/lib/permissions';

describe('Permissions', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions for all roles', () => {
      const roles = ['ADMIN', 'EDITOR', 'CORRESPONDENT_ACADEMIC', 'CORRESPONDENT_MUSEUM', 'CORRESPONDENT_EXPERT', 'STUDENT', 'GUEST'];
      roles.forEach(role => {
        expect(ROLE_PERMISSIONS).toHaveProperty(role);
        expect(Array.isArray(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS])).toBe(true);
      });
    });

    it('should grant admin all permissions', () => {
      const adminPerms = ROLE_PERMISSIONS['ADMIN'];
      expect(adminPerms.length).toBeGreaterThan(0);
      expect(adminPerms).toContain('create_news');
      expect(adminPerms).toContain('approve_news');
      expect(adminPerms).toContain('manage_users');
    });

    it('should limit student permissions', () => {
      const studentPerms = ROLE_PERMISSIONS['STUDENT'];
      expect(studentPerms).toEqual(['read_news']);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('ADMIN', 'create_news')).toBe(true);
      expect(hasPermission('ADMIN', 'manage_users')).toBe(true);
      expect(hasPermission('ADMIN', 'approve_news')).toBe(true);
    });

    it('should return false for guest with create permission', () => {
      expect(hasPermission('GUEST', 'create_news')).toBe(false);
    });

    it('should return true for student with read permission', () => {
      expect(hasPermission('STUDENT', 'read_news')).toBe(true);
    });

    it('should return false for student with create permission', () => {
      expect(hasPermission('STUDENT', 'create_news')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if role has at least one permission', () => {
      expect(hasAnyPermission('EDITOR', ['approve_news', 'delete_news'])).toBe(true);
    });

    it('should return false if role has no permissions', () => {
      expect(hasAnyPermission('GUEST', ['create_news', 'delete_news'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      expect(hasAllPermissions('ADMIN', ['create_news', 'approve_news'])).toBe(true);
    });

    it('should return false if role is missing any permission', () => {
      expect(hasAllPermissions('EDITOR', ['create_news', 'approve_news'])).toBe(false);
    });

    it('should return true for empty permission list', () => {
      expect(hasAllPermissions('GUEST', [])).toBe(true);
    });
  });
});
