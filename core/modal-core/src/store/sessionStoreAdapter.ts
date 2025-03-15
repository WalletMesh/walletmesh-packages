/**
 * @packageDocumentation
 * Adapter to make Zustand store compatible with SessionStore interface
 */

import type { SessionStore } from './sessionStore.js';
import type { UseSessionStore } from './sessionStore.js';
import type { WalletSession } from '../types.js';

/**
 * Adapts a Zustand store to implement the SessionStore interface
 */
export class SessionStoreAdapter implements SessionStore {
  constructor(private store: UseSessionStore) {
    if (!store) {
      throw new Error('Session store is required');
    }
  }

  get sessions(): Map<string, WalletSession> {
    return this.store.getState().sessions;
  }

  setSession(id: string, session: WalletSession): void {
    this.store.getState().setSession(id, session);
  }

  removeSession(id: string): void {
    this.store.getState().removeSession(id);
  }

  clearSessions(): void {
    this.store.getState().clearSessions();
  }

  getState() {
    return this.store.getState();
  }
}

/**
 * Default session store adapter instance
 */
export const defaultSessionStoreAdapter = (store: UseSessionStore) => new SessionStoreAdapter(store);
