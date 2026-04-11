import { http } from '@/api/http';
import type {
  CreateCommentDto,
  CreateRequestDto,
  OfficerRequestDetailsDto,
  PageResponse,
  RequestCommentDto,
  RequestDetailsDto,
  RequestDocumentDto,
  RequestHistoryItemDto,
  RequestSearchItemDto,
  RequestStatus,
  UpdateRequestStatusDto,
} from '@/api/types';

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

export const requestsApi = {
  create: (payload: CreateRequestDto) => http.post<RequestDetailsDto>('/api/requests', payload),
  mine: () => http.get<RequestHistoryItemDto[]>('/api/requests/my'),
  searchMine: (searchTerm: string, status: RequestStatus | '') =>
    http.get<PageResponse<RequestSearchItemDto>>(
      `/api/requests/search${query({ q: searchTerm, status: status || undefined, size: 50 })}`,
    ),
  details: (requestId: number) => http.get<RequestDetailsDto>(`/api/requests/${requestId}`),
  documents: (requestId: number) => http.get<RequestDocumentDto[]>(`/api/requests/${requestId}/documents`),
  uploadDocuments: (requestId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return http.post<RequestDocumentDto[]>(`/api/requests/${requestId}/documents`, formData);
  },
  comments: (requestId: number) => http.get<RequestCommentDto[]>(`/api/requests/${requestId}/comments`),
};

export const officerApi = {
  all: () => http.get<RequestSearchItemDto[]>('/api/officer/requests'),
  search: (searchTerm: string, status: RequestStatus | '', applicantEmail: string) =>
    http.get<PageResponse<RequestSearchItemDto>>(
      `/api/officer/requests/search${query({
        q: searchTerm,
        status: status || undefined,
        applicantEmail: applicantEmail || undefined,
        size: 50,
      })}`,
    ),
  details: (requestId: number) => http.get<OfficerRequestDetailsDto>(`/api/officer/requests/${requestId}`),
  updateStatus: (requestId: number, payload: UpdateRequestStatusDto) =>
    http.put<OfficerRequestDetailsDto>(`/api/officer/requests/${requestId}/status`, payload),
  addComment: (requestId: number, payload: CreateCommentDto) =>
    http.post<RequestCommentDto>(`/api/requests/${requestId}/comments`, payload),
};
