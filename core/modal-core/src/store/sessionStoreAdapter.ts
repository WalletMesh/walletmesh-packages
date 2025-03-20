/**
 * @packageDocumentation
 * Session store adapter implementation
 */

import type { UseBoundStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import type { SessionStore } from './sessionStore.js';
import type { WalletSession } from '../types.js';

/**
 * Adapter for zustand session store
 */
export class SessionStoreAdapter implements SessionStore {
  private store: UseBoundStore<StoreApi<SessionStore>>;

  constructor(store: UseBoundStore<StoreApi<SessionStore>>) {
    if (!store) {
      throw new Error('Store is required');
    }
    this.store = store;
  }

  /** Get internal sessions map */
  get sessions(): Map<string, WalletSession> {
    return this.store().sessions;
  }

  /**
   * Gets the session for the given ID
   */
  getSession(id: string): WalletSession | undefined {
    const session = this.store().getSession(id);
    if (!session) return undefined;

    // Return undefined for expired sessions
    if (this.isExpired(session)) {
      this.removeSession(id);
      return undefined;
    }

    return session;
  }

  /**
   * Gets all active sessions
   */
  getSessions(): WalletSession[] {
    const sessions = this.store().getSessions();
    
    // Filter out and cleanup expired sessions
    const activeSessions = sessions.filter(session => {
      if (this.isExpired(session)) {
        this.removeSession(session.id);
        return false;
      }
      return true;
    });

    return activeSessions;
  }

  /**
   * Sets a session
   */
  setSession(id: string, session: WalletSession): void {
    // Don't store already expired sessions
    if (this.isExpired(session)) {
      return;
    }

    this.store().setSession(id, session);
  }

  /**
   * Removes a session
   */
  removeSession(id: string): void {
    this.store().removeSession(id);
  }

  /**
   * Clears all sessions
   */
  clearSessions(): void {
    this.store().clearSessions();
  }

  /**
   * Checks if a session is expired
   */
  private isExpired(session: WalletSession): boolean {
    return session.expiry < Date.now();
  }
}

/**
 * Creates a new session store adapter
 */
export function defaultSessionStoreAdapter(
  store: UseBoundStore<StoreApi<SessionStore>>
): SessionStoreAdapter {
  return new SessionStoreAdapter(store);
}
