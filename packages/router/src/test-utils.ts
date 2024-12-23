import type { SessionStore, SessionStoreConfig } from './session-store.js';
import type { SessionData } from './types.js';

interface StoredTestSession {
  data: SessionData;
  expiresAt: number | undefined;
}

/**
 * Test implementation of SessionStore that exposes internal Map for testing
 */
export class TestSessionStore implements SessionStore {
  private sessions = new Map<string, StoredTestSession>();
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

    for (const [id, stored] of this.sessions) {
      if (!stored.expiresAt || Date.now() <= stored.expiresAt) {
        if (this.config.refreshOnAccess && this.config.lifetime) {
          stored.expiresAt = Date.now() + this.config.lifetime;
        }
        result.set(id, stored.data);
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

  // Test helpers
  getInternalMap(): Map<string, StoredTestSession> {
    return this.sessions;
  }

  // Helper to get just the session data for compatibility with existing tests
  getSessionData(): Map<string, SessionData> {
    const result = new Map<string, SessionData>();
    for (const [id, stored] of this.sessions) {
      result.set(id, stored.data);
    }
    return result;
  }

  // Helper to manually set expiry for testing
  setExpiry(sessionId: string, expiresAt: number | undefined): void {
    const stored = this.sessions.get(sessionId);
    if (stored) {
      stored.expiresAt = expiresAt;
    }
  }
}
