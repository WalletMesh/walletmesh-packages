/**
 * @packageDocumentation
 * Session store implementation for WalletMesh Core.
 */

import { create } from 'zustand';
import type { WalletSession } from '../types.js';

/**
 * Interface for session store state and actions
 */
export interface SessionStore {
  /** Gets a specific session */
  getSession: (id: string) => WalletSession | undefined;
  /** Gets all sessions */
  getSessions: () => WalletSession[];
  /** Sets a session */
  setSession: (id: string, session: WalletSession) => void;
  /** Removes a session */
  removeSession: (id: string) => void;
  /** Clears all sessions */
  clearSessions: () => void;
  /** Internal state */
  readonly sessions: Map<string, WalletSession>;
}

/**
 * Creates the session store with zustand
 */
export const createSessionStore = () =>
  create<SessionStore>((set, get) => ({
    sessions: new Map(),

    getSession: (id: string) => {
      const session = get().sessions.get(id);
      if (!session) {
        return undefined;
      }
      if (session.expiry && session.expiry < Date.now()) {
        get().removeSession(id);
        return undefined;
      }
      return session;
    },

    getSessions: () => {
      return Array.from(get().sessions.values());
    },

    setSession: (id: string, session: WalletSession) => {
      if (!id || id.trim() === '') {
        throw new Error('Invalid session ID');
      }
      if (!session.wallet?.address || !session.wallet?.state?.sessionId) {
        throw new Error('Invalid session data');
      }
      // Don't store expired sessions
      if (session.expiry && session.expiry < Date.now()) return;
      set((state) => {
        const sessions = new Map(state.sessions);
        sessions.set(id, session);
        return { sessions };
      });
    },

    removeSession: (id: string) => {
      set((state) => {
        const sessions = new Map(state.sessions);
        sessions.delete(id);
        return { sessions };
      });
    },
    clearSessions: () => {
      set({ sessions: new Map() });
    },
  }));

/**
 * Default session store instance
 */
export const defaultSessionStore = createSessionStore();

/**
 * Type for accessing the session store
 */
export type UseSessionStore = typeof defaultSessionStore;
