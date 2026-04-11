import type { ApiErrorPayload, AuthResponseDto, StoredSession } from '@/api/types';
import { clearSession, readSession, writeSession } from '@/lib/session';

type HttpBody = BodyInit | object | null | undefined;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: HttpBody;
  auth?: boolean;
  retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

let onUnauthorized: (() => void) | null = null;

function buildUrl(path: string): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${baseUrl}${path}`;
}

function parseErrorMessage(status: number, payload: unknown): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  const typed = payload as ApiErrorPayload | undefined;
  if (typed?.message) {
    return typed.message;
  }
  if (typed?.error) {
    return typed.error;
  }

  return status >= 500 ? 'A server error occurred.' : 'The request could not be completed.';
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function toFetchBody(body: HttpBody, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || typeof body === 'string' || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

async function refreshSession(session: StoredSession): Promise<StoredSession | null> {
  const response = await fetch(buildUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const nextSession = (await response.json()) as AuthResponseDto;
  return writeSession(nextSession, session.storageMode);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers: rawHeaders, ...rest } = options;
  const headers = new Headers(rawHeaders);
  const session = auth ? readSession() : null;

  if (auth && session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers,
    body: toFetchBody(body, headers),
  });

  if (response.status === 401 && auth && retry && session) {
    const nextSession = await refreshSession(session);
    if (nextSession) {
      return request<T>(path, { ...options, retry: false });
    }

    clearSession();
    onUnauthorized?.();
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, parseErrorMessage(response.status, payload), payload);
  }

  return payload as T;
}

export function registerUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: HttpBody, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: HttpBody, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};
