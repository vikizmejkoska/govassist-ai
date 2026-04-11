import type { AuthResponseDto, StoredSession, StorageMode } from '@/api/types';

const SESSION_KEY = 'govassist-ai.session';

function parseStoredSession(value: string | null): StoredSession | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredSession;
  } catch {
    return null;
  }
}

export function readSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    parseStoredSession(window.sessionStorage.getItem(SESSION_KEY)) ??
    parseStoredSession(window.localStorage.getItem(SESSION_KEY))
  );
}

export function writeSession(session: AuthResponseDto, storageMode: StorageMode): StoredSession {
  const nextSession: StoredSession = {
    ...session,
    storageMode,
    expiresAt: Date.now() + session.expiresIn,
  };

  clearSession();
  const storage = storageMode === 'local' ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  return nextSession;
}

export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}
