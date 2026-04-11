import type { Role } from '@/api/types';

export function homePathForRole(role: Role): string {
  switch (role) {
    case 'OFFICER':
      return '/officer/panel';
    case 'ADMINISTRATOR':
      return '/admin/panel';
    default:
      return '/dashboard';
  }
}
