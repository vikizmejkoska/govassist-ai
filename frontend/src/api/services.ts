import { http } from '@/api/http';
import type { AdministrativeServiceDto, AdministrativeServicePayload, PageResponse } from '@/api/types';

function query(params: Record<string, string | number | undefined | null>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const value = searchParams.toString();
  return value ? `?${value}` : '';
}

export const servicesApi = {
  list: () => http.get<AdministrativeServiceDto[]>('/api/services', { auth: false }),
  details: (serviceId: number) => http.get<AdministrativeServiceDto>(`/api/services/${serviceId}`, { auth: false }),
  search: (term: string) =>
    http.get<PageResponse<AdministrativeServiceDto>>(`/api/services/search${query({ q: term, size: 50 })}`, {
      auth: false,
    }),
};

export const adminServicesApi = {
  list: () => http.get<AdministrativeServiceDto[]>('/api/admin/services'),
  details: (serviceId: number) => http.get<AdministrativeServiceDto>(`/api/admin/services/${serviceId}`),
  create: (payload: AdministrativeServicePayload) => http.post<AdministrativeServiceDto>('/api/admin/services', payload),
  update: (serviceId: number, payload: AdministrativeServicePayload) =>
    http.put<AdministrativeServiceDto>(`/api/admin/services/${serviceId}`, payload),
  remove: (serviceId: number) => http.delete<void>(`/api/admin/services/${serviceId}`),
};
