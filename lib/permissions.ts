import { Role } from '@prisma/client';

export type Permission = 
  | 'create_news'
  | 'read_news'
  | 'update_news'
  | 'delete_news'
  | 'approve_news'
  | 'reject_news'
  | 'manage_users'
  | 'manage_categories'
  | 'view_approvals'
  | 'view_analytics'
  | 'publish_news';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'create_news',
    'read_news',
    'update_news',
    'delete_news',
    'approve_news',
    'reject_news',
    'manage_users',
    'manage_categories',
    'view_approvals',
    'view_analytics',
    'publish_news',
  ],
  EDITOR: [
    'read_news',
    'approve_news',
    'reject_news',
    'view_approvals',
    'view_analytics',
    'publish_news',
  ],
  CORRESPONDENT_ACADEMIC: [
    'create_news',
    'read_news',
    'update_news',
    'delete_news',
  ],
  CORRESPONDENT_MUSEUM: [
    'create_news',
    'read_news',
    'update_news',
    'delete_news',
  ],
  CORRESPONDENT_EXPERT: [
    'create_news',
    'read_news',
    'update_news',
    'delete_news',
  ],
  STUDENT: [
    'read_news',
  ],
  GUEST: [
    'read_news',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}
