import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ConnectionStatus, type ConnectedWallet } from '../types.js';
import type { WalletSession } from '../lib/client/types.js';

interface SerializedWalletSession extends Omit<WalletSession, 'chainConnections'> {
  chainConnections: [number, { address: string; permissions: string[] }][];
}

/**
 * Serialize a session for storage
 */
function serializeSession(session: WalletSession): SerializedWalletSession {
  return {
    ...session,
    chainConnections: Array.from(session.chainConnections.entries()),
  };
}

/**
 * Deserialize a session from storage
 */
function deserializeSession(serialized: unknown): WalletSession | null {
  if (!serialized || typeof serialized !== 'object') return null;

  const session = serialized as SerializedWalletSession;
  if (!session.wallet?.state?.sessionId || !session.wallet?.info?.connector) {
    return null;
  }

  return {
    ...session,
    chainConnections: new Map(session.chainConnections || []),
  };
}

/**
 * Helper to safely reconstruct Map from serialized data
 */
function rehydrateSessions(serializedData: unknown): Map<string, WalletSession> {
  const sessions = new Map<string, WalletSession>();

  if (Array.isArray(serializedData)) {
    for (const entry of serializedData) {
      if (Array.isArray(entry) && entry.length === 2) {
        const [key, session] = entry;
        if (typeof key === 'string') {
          const deserialized = deserializeSession(session);
          if (deserialized) {
            sessions.set(key, deserialized);
          }
        }
      }
    }
  }

  console.log('[WalletStore] Rehydrated sessions:', sessions.size);
  return sessions;
}

interface WalletState {
  status: ConnectionStatus;
  wallet: ConnectedWallet | null;
  error: Error | null;
  connectWallet: (wallet: ConnectedWallet) => void;
  disconnectWallet: () => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: Error | null) => void;
  sessions: Map<string, WalletSession>;
  setSession: (walletId: string, session: WalletSession) => void;
  removeSession: (walletId: string) => void;
  clearSessions: () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // Initial state
      status: ConnectionStatus.Idle,
      wallet: null,
      error: null,
      sessions: new Map(),

      // Actions
      connectWallet: (wallet: ConnectedWallet) =>
        set({
          status: ConnectionStatus.Connected,
          wallet,
          error: null,
        }),

      disconnectWallet: () =>
        set({
          status: ConnectionStatus.Idle,
          wallet: null,
          error: null,
        }),

      setStatus: (status: ConnectionStatus) =>
        set((state) => ({
          ...state,
          status,
          error: null,
        })),

      setError: (error: Error | null) =>
        set((state) => {
          const shouldClearWallet = state.status === ConnectionStatus.Disconnecting;

          return {
            ...state,
            wallet: shouldClearWallet ? null : state.wallet,
            error,
            status: [
              ConnectionStatus.Connecting,
              ConnectionStatus.Disconnecting,
              ConnectionStatus.Resuming,
            ].includes(state.status)
              ? ConnectionStatus.Idle
              : state.status,
          };
        }),

      setSession: (walletId: string, session: WalletSession) =>
        set((state) => {
          const newSessions = new Map(state.sessions);
          newSessions.set(walletId, session);
          return {
            ...state,
            sessions: newSessions,
          };
        }),

      removeSession: (walletId: string) =>
        set((state) => {
          const newSessions = new Map(state.sessions);
          newSessions.delete(walletId);
          return {
            ...state,
            sessions: newSessions,
          };
        }),

      clearSessions: () => set((state) => ({ ...state, sessions: new Map() })),

      // Reset the entire state
      reset: () =>
        set({
          status: ConnectionStatus.Idle,
          wallet: null,
          error: null,
          sessions: new Map(),
        }),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallet: state.wallet,
        status: state.status,
        sessions: Array.from(state.sessions.entries()).map(([key, session]) => [
          key,
          serializeSession(session),
        ]),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && 'sessions' in state) {
          state.sessions = rehydrateSessions(state.sessions);
        }
        return state;
      },
    },
  ),
);
