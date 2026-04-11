export type Role = 'CITIZEN' | 'OFFICER' | 'ADMINISTRATOR';

export type RequestStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'ADDITIONAL_DOCUMENTS_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type CommentType = 'COMMENT' | 'ADDITIONAL_DOCUMENT_REQUEST';

export type StorageMode = 'local' | 'session';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  role: Role;
}

export interface StoredSession extends AuthResponseDto {
  storageMode: StorageMode;
  expiresAt: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface MessageResponse {
  message: string;
}

export interface UserDetailsDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  role: Role;
}

export interface UserSummaryDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  role: Role | null;
}

export interface AdministrativeServiceDto {
  id: number;
  title: string;
  description: string;
  conditions: string;
  requiredDocuments: string;
}

export interface AdministrativeServicePayload {
  title: string;
  description: string;
  conditions: string;
  requiredDocuments: string;
}

export interface NotificationDto {
  id: number;
  requestId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface RequestDocumentDto {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface RequestCommentDto {
  id: number;
  authorEmail: string;
  authorRole: string;
  comment: string;
  type: CommentType;
  createdAt: string;
}

export interface RequestHistoryItemDto {
  id: number;
  serviceId: number;
  serviceTitle: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
}

export interface RequestSearchItemDto {
  id: number;
  applicantEmail: string;
  serviceId: number;
  serviceTitle: string;
  title: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestDetailsDto {
  id: number;
  applicantEmail: string;
  serviceId: number;
  serviceTitle: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  documents: RequestDocumentDto[];
}

export interface OfficerRequestDetailsDto extends RequestDetailsDto {
  comments: RequestCommentDto[];
}

export interface CreateRequestDto {
  serviceId: number;
  title: string;
  description: string;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
}

export interface CreateCommentDto {
  comment: string;
  type: CommentType;
}

export interface UpdateProfileDto {
  fullName: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateUserRoleDto {
  role: Role;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiErrorPayload {
  message?: string;
  error?: string;
}
