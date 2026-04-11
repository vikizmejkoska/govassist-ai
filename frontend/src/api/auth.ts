import { http } from '@/api/http';
import type { AuthResponseDto, LoginRequestDto, MessageResponse, RegisterRequestDto, UserDetailsDto } from '@/api/types';

export const authApi = {
  login: (payload: LoginRequestDto) => http.post<AuthResponseDto>('/api/auth/login', payload, { auth: false }),
  register: (payload: RegisterRequestDto) => http.post<MessageResponse>('/api/auth/register', payload, { auth: false }),
  me: () => http.get<UserDetailsDto>('/api/auth/me'),
  logout: () => http.post<MessageResponse>('/api/auth/logout'),
};
