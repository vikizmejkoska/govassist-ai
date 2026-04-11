import { http } from '@/api/http';
import type { UpdateProfileDto, UpdateUserRoleDto, UserDetailsDto, UserSummaryDto } from '@/api/types';

export const usersApi = {
  me: () => http.get<UserDetailsDto>('/api/users/me'),
  updateMe: (payload: UpdateProfileDto) => http.put<UserDetailsDto>('/api/users/me', payload),
};

export const adminUsersApi = {
  all: () => http.get<UserSummaryDto[]>('/api/admin/users'),
  details: (userId: number) => http.get<UserDetailsDto>(`/api/admin/users/${userId}`),
  updateRole: (userId: number, payload: UpdateUserRoleDto) =>
    http.put<UserDetailsDto>(`/api/admin/users/${userId}/role`, payload),
};
