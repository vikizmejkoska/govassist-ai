import type { RequestStatus, Role } from '@/api/types';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function humanizeStatus(status: RequestStatus): string {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function humanizeRole(role: Role | string | null | undefined): string {
  if (!role) {
    return 'Unknown';
  }

  return role
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatTrackingNumber(id: number, createdAt?: string): string {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `GOV-${year}-${String(id).padStart(6, '0')}`;
}

export function statusColor(status: RequestStatus): 'default' | 'warning' | 'success' | 'error' | 'info' | 'secondary' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'IN_PROGRESS':
      return 'warning';
    case 'ADDITIONAL_DOCUMENTS_REQUIRED':
      return 'secondary';
    default:
      return 'info';
  }
}
