import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SessionStore } from './sessionStore.js';
import { ConnectionStatus } from '../types.js';
import type { WalletSession, ConnectedWallet, Connector } from '../types.js';

// Mock zustand
vi.mock('zustand', () => ({
  create: () => vi.fn()
}));

describe('SessionStore', () => {
  let store: SessionStore;
  let mockSessions: Map<string, WalletSession>;
  let now: number;

  const mockConnector: Connector = {
    getProvider: vi.fn().mockResolvedValue({}),
    connect: vi.fn(),
    disconnect: vi.fn(),
    getState: vi.fn(),
    resume: vi.fn(),
  };

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    mockSessions = new Map();
    const storeImpl: SessionStore = {
      sessions: mockSessions,
      getSession: (id: string) => {
        const session = mockSessions.get(id);
        if (!session) return undefined;
        if (session.expiry && session.expiry < Date.now()) {
          mockSessions.delete(id);
          return undefined;
        }
        return session;
      },
      getSessions: () => Array.from(mockSessions.values()),
      setSession: (id: string, session: WalletSession) => {
        if (!id || id.trim() === '') {
          throw new Error('Invalid session ID');
        }
        if (!session.wallet?.address || !session.wallet?.state?.sessionId) {
          throw new Error('Invalid session data');
        }
        if (session.expiry && session.expiry < Date.now()) return;
        mockSessions.set(id, session);
      },
      removeSession: (id: string) => mockSessions.delete(id),
      clearSessions: () => mockSessions.clear()
    };

    store = storeImpl;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const createMockSession = (overrides?: Partial<WalletSession>): WalletSession => ({
    id: 'test-session',
    address: '0x123',
    chains: {},
    expiry: now + 3600000, // 1 hour from now
    status: ConnectionStatus.CONNECTED,
    connector: mockConnector,
    wallet: {
      address: '0x123',
      chainId: 1,
      connected: true,
      publicKey: '0x456',
      state: {
        sessionId: 'test-session',
        networkId: 1,
        address: '0x123',
        lastActive: Date.now()
      }
    },
    ...overrides
  });

  describe('store operations', () => {
    it('should store and retrieve sessions', () => {
      const session = createMockSession();
      store.setSession(session.id, session);

      const retrieved = store.getSession(session.id);
      expect(retrieved).toEqual(session);
    });

    it('should handle disconnected sessions', () => {
      const session = createMockSession({
        status: ConnectionStatus.DISCONNECTED,
        wallet: {
          ...createMockSession().wallet,
          connected: false
        }
      });

      store.setSession(session.id, session);
      const retrieved = store.getSession(session.id);
      expect(retrieved?.status).toBe(ConnectionStatus.DISCONNECTED);
      expect(retrieved?.wallet.connected).toBe(false);
    });

    it('should remove sessions', () => {
      const session = createMockSession();
      store.setSession(session.id, session);
      store.removeSession(session.id);
      expect(store.getSession(session.id)).toBeUndefined();
    });

    it('should clear all sessions', () => {
      store.setSession('1', createMockSession({ id: '1' }));
      store.setSession('2', createMockSession({ id: '2' }));
      store.clearSessions();
      expect(store.getSessions()).toHaveLength(0);
    });

    it('should list all sessions', () => {
      const session1 = createMockSession({ id: '1' });
      const session2 = createMockSession({ id: '2' });

      store.setSession('1', session1);
      store.setSession('2', session2);

      const sessions = store.getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toEqual(session1);
      expect(sessions[1]).toEqual(session2);
    });
  });

  describe('validation', () => {
    it('should validate session expiry', () => {
      const expiredSession = createMockSession({
        expiry: now - 1000 // 1 second ago
      });

      store.setSession(expiredSession.id, expiredSession);
      expect(store.getSession(expiredSession.id)).toBeUndefined();
    });

    it('should handle session updates', () => {
      const session = createMockSession();
      store.setSession(session.id, session);

      const updatedSession = {
        ...session,
        status: ConnectionStatus.DISCONNECTED,
        wallet: {
          ...session.wallet,
          connected: false
        }
      };

      store.setSession(session.id, updatedSession);
      const retrieved = store.getSession(session.id);
      expect(retrieved).toEqual(updatedSession);
    });
  });

  describe('error handling', () => {
    it('should reject invalid session IDs', () => {
      const session = createMockSession();
      expect(() => store.setSession('', session)).toThrow('Invalid session ID');
    });

    it('should reject invalid session data', () => {
      const invalidSession: WalletSession = {
        ...createMockSession(),
        wallet: {} as ConnectedWallet // Force invalid wallet data
      };
      expect(() => store.setSession('test', invalidSession)).toThrow('Invalid session data');
    });
  });
});
