export interface SessionStoreConfig {
  /** Session lifetime in milliseconds. If not provided, sessions never expire */
  lifetime?: number;
  /** Whether to refresh session expiry on access. Default false */
  refreshOnAccess?: boolean;
}

/**
 * Interface for session storage implementations
 */
export interface SessionStore {
  /**
   * Store a new session
   * @param sessionId - Unique session identifier
   * @param data - Session data to store
   */
  set(sessionId: string, data: SessionData): Promise<void>;

  /**
   * Retrieve a session if it exists and has not expired
   * @param sessionId - Unique session identifier
   * @returns Promise resolving to session data if found and valid, undefined otherwise
   */
  get(sessionId: string): Promise<SessionData | undefined>;

  /**
   * Get all non-expired sessions
   * @returns Promise resolving to Map of session IDs to session data
   */
  getAll(): Promise<Map<string, SessionData>>;

  /**
   * Remove a session
   * @param sessionId - Unique session identifier
   */
  delete(sessionId: string): Promise<void>;

  /**
   * Clear all sessions
   */
  clear(): Promise<void>;

  /**
   * Validate a session and optionally refresh its expiry
   * @param sessionId - Unique session identifier
   * @returns Promise resolving to session data if valid, undefined if expired or not found
   */
  validateAndRefresh(sessionId: string): Promise<SessionData | undefined>;

  /**
   * Remove all expired sessions
   * @returns Promise resolving to number of sessions removed
   */
  cleanExpired(): Promise<number>;
}

interface StoredSession {
  data: SessionData;
  expiresAt: number | undefined;
}

/**
 * In-memory session storage implementation
 */
export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, StoredSession>();

  async set(sessionId: string, data: SessionData): Promise<void> {
    // Sessions no longer expire automatically
    this.sessions.set(sessionId, { data, expiresAt: undefined });
  }

  async validateAndRefresh(sessionId: string): Promise<SessionData | undefined> {
    const stored = this.sessions.get(sessionId);
    if (!stored) return undefined;

    // Sessions no longer expire, just return the data
    return stored.data;
  }

  async get(sessionId: string): Promise<SessionData | undefined> {
    return this.validateAndRefresh(sessionId);
  }

  async getAll(): Promise<Map<string, SessionData>> {
    const result = new Map<string, SessionData>();

    // Sessions no longer expire, return all sessions
    for (const [id, stored] of this.sessions) {
      result.set(id, stored.data);
    }

    return result;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async clear(): Promise<void> {
    this.sessions.clear();
  }

  async cleanExpired(): Promise<number> {
    // Sessions no longer expire automatically
    return 0;
  }
}

/**
 * LocalStorage-based session storage implementation
 */
export class LocalStorageSessionStore implements SessionStore {
  private readonly prefix = 'wm_session_';

  private checkAvailable(): void {
    if (typeof localStorage === 'undefined') {
      throw new Error('LocalStorage is not available in this environment');
    }
  }

  async set(sessionId: string, data: SessionData): Promise<void> {
    this.checkAvailable();

    // Sessions no longer expire automatically
    const stored: StoredSession = { data, expiresAt: undefined };
    localStorage.setItem(this.prefix + sessionId, JSON.stringify(stored));
  }

  async validateAndRefresh(sessionId: string): Promise<SessionData | undefined> {
    this.checkAvailable();

    const item = localStorage.getItem(this.prefix + sessionId);
    if (!item) return undefined;

    const stored: StoredSession = JSON.parse(item);

    // Sessions no longer expire, just return the data
    return stored.data;
  }

  async get(sessionId: string): Promise<SessionData | undefined> {
    return this.validateAndRefresh(sessionId);
  }

  async getAll(): Promise<Map<string, SessionData>> {
    this.checkAvailable();

    const sessions = new Map<string, SessionData>();

    // Sessions no longer expire, return all sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          const stored: StoredSession = JSON.parse(data);
          const sessionId = key.slice(this.prefix.length);
          sessions.set(sessionId, stored.data);
        }
      }
    }
    return sessions;
  }

  async delete(sessionId: string): Promise<void> {
    this.checkAvailable();
    localStorage.removeItem(this.prefix + sessionId);
  }

  async clear(): Promise<void> {
    this.checkAvailable();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  async cleanExpired(): Promise<number> {
    // Sessions no longer expire automatically
    return 0;
  }
}

// Import SessionData type and export a default memory store instance
import type { SessionData } from './types.js';
export const defaultStore = new MemorySessionStore();
