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
  private config: SessionStoreConfig;

  constructor(config: SessionStoreConfig = {}) {
    this.config = config;
  }

  async set(sessionId: string, data: SessionData): Promise<void> {
    const expiresAt = this.config.lifetime ? Date.now() + this.config.lifetime : undefined;

    this.sessions.set(sessionId, { data, expiresAt });
  }

  async validateAndRefresh(sessionId: string): Promise<SessionData | undefined> {
    const stored = this.sessions.get(sessionId);
    if (!stored) return undefined;

    // Check expiry
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    // Refresh expiry if configured
    if (this.config.refreshOnAccess && this.config.lifetime) {
      stored.expiresAt = Date.now() + this.config.lifetime;
    }

    return stored.data;
  }

  async get(sessionId: string): Promise<SessionData | undefined> {
    return this.validateAndRefresh(sessionId);
  }

  async getAll(): Promise<Map<string, SessionData>> {
    const result = new Map<string, SessionData>();
    const now = Date.now();

    for (const [id, stored] of this.sessions) {
      if (!stored.expiresAt || now <= stored.expiresAt) {
        if (this.config.refreshOnAccess && this.config.lifetime) {
          stored.expiresAt = now + this.config.lifetime;
        }
        result.set(id, stored.data);
      } else {
        // Remove expired sessions
        this.sessions.delete(id);
      }
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
    let count = 0;
    const now = Date.now();

    for (const [id, stored] of this.sessions) {
      if (stored.expiresAt && now > stored.expiresAt) {
        this.sessions.delete(id);
        count++;
      }
    }

    return count;
  }
}

/**
 * LocalStorage-based session storage implementation
 */
export class LocalStorageSessionStore implements SessionStore {
  private readonly prefix = 'wm_session_';
  private config: SessionStoreConfig;

  constructor(config: SessionStoreConfig = {}) {
    this.config = config;
  }

  private checkAvailable(): void {
    if (typeof localStorage === 'undefined') {
      throw new Error('LocalStorage is not available in this environment');
    }
  }

  async set(sessionId: string, data: SessionData): Promise<void> {
    this.checkAvailable();

    const expiresAt = this.config.lifetime ? Date.now() + this.config.lifetime : undefined;

    const stored: StoredSession = { data, expiresAt };
    localStorage.setItem(this.prefix + sessionId, JSON.stringify(stored));
  }

  async validateAndRefresh(sessionId: string): Promise<SessionData | undefined> {
    this.checkAvailable();

    const item = localStorage.getItem(this.prefix + sessionId);
    if (!item) return undefined;

    const stored: StoredSession = JSON.parse(item);

    // Check expiry
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      localStorage.removeItem(this.prefix + sessionId);
      return undefined;
    }

    // Refresh expiry if configured
    if (this.config.refreshOnAccess && this.config.lifetime) {
      stored.expiresAt = Date.now() + this.config.lifetime;
      localStorage.setItem(this.prefix + sessionId, JSON.stringify(stored));
    }

    return stored.data;
  }

  async get(sessionId: string): Promise<SessionData | undefined> {
    return this.validateAndRefresh(sessionId);
  }

  async getAll(): Promise<Map<string, SessionData>> {
    this.checkAvailable();

    const sessions = new Map<string, SessionData>();
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          const stored: StoredSession = JSON.parse(data);

          if (!stored.expiresAt || now <= stored.expiresAt) {
            const sessionId = key.slice(this.prefix.length);

            if (this.config.refreshOnAccess && this.config.lifetime) {
              stored.expiresAt = now + this.config.lifetime;
              localStorage.setItem(key, JSON.stringify(stored));
            }

            sessions.set(sessionId, stored.data);
          }
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
    this.checkAvailable();
    let count = 0;
    const now = Date.now();

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          const stored: StoredSession = JSON.parse(data);
          if (stored.expiresAt && now > stored.expiresAt) {
            keysToRemove.push(key);
            count++;
          }
        }
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    return count;
  }
}

// Import SessionData type and export a default memory store instance with 24h lifetime
import type { SessionData } from './types.js';
export const defaultStore = new MemorySessionStore({
  lifetime: 24 * 60 * 60 * 1000, // 24 hours
});
