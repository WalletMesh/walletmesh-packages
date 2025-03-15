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
  sessions: Map<string, WalletSession>;
  setSession: (id: string, session: WalletSession) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
}

/**
 * Creates the session store with zustand
 */
export const createSessionStore = () =>
  create<SessionStore>((set) => ({
    sessions: new Map(),

    setSession: (id: string, session: WalletSession) => {
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
