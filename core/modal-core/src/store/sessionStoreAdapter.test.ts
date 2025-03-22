import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Provider } from '../types.js';
import type { SessionStore } from './sessionStore.js';
import { SessionStoreAdapter } from './sessionStoreAdapter.js';
import type { UseBoundStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import { ConnectionStatus } from '../types.js';
import type { WalletSession, ConnectedWallet } from '../types.js';
import { createStoreError, isStoreError, StoreErrorCode } from './errors.js';

describe('SessionStoreAdapter', () => {
  let adapter: SessionStoreAdapter;
  let mockStore: UseBoundStore<StoreApi<SessionStore>>;
  let mockSessions: Map<string, WalletSession>;
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    mockSessions = new Map();
    const store = {
      sessions: mockSessions,
      getSession: vi.fn((id: string) => mockSessions.get(id)),
      getSessions: vi.fn(() => Array.from(mockSessions.values())),
      setSession: vi.fn((id: string, session: WalletSession) => {
        if (!id || id.trim() === '') {
          throw createStoreError.invalidSessionId(id);
        }
        if (!session.wallet) {
          throw createStoreError.invalidSessionData('Missing wallet data');
        }
        mockSessions.set(id, session);
      }),
      removeSession: vi.fn((id: string) => mockSessions.delete(id)),
      clearSessions: vi.fn(() => mockSessions.clear()),
    };

    mockStore = vi.fn(() => store) as unknown as UseBoundStore<StoreApi<SessionStore>>;
    adapter = new SessionStoreAdapter(mockStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockWallet = (overrides?: Partial<ConnectedWallet>): ConnectedWallet => ({
    address: '0xtest',
    chainId: 1,
    publicKey: '0x',
    connected: true,
    state: {
      sessionId: 'test-session',
      networkId: 1,
      address: '0xtest',
      lastActive: Date.now(),
    },
    ...overrides,
  });

  const createMockSession = (overrides?: Partial<WalletSession>): WalletSession => ({
    id: 'test-session',
    address: '0xtest',
    chains: {},
    expiry: now + 3600000, // 1 hour from now
    status: ConnectionStatus.CONNECTED,
    connector: {
      getProvider: createMockProvider,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getState: vi.fn(),
      resume: vi.fn(),
    },
    wallet: createMockWallet(),
    ...overrides,
  });

  describe('session management', () => {
    it('should store and retrieve sessions', () => {
      const session = createMockSession();
      adapter.setSession(session.id, session);
      const retrieved = adapter.getSession(session.id);
      expect(retrieved).toEqual(session);
    });

    it('should list all sessions', () => {
      const session1 = createMockSession({ id: '1' });
      const session2 = createMockSession({ id: '2' });

      adapter.setSession('1', session1);
      adapter.setSession('2', session2);

      const sessions = adapter.getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toEqual(session1);
      expect(sessions[1]).toEqual(session2);
    });

    it('should remove sessions', () => {
      const session = createMockSession();
      adapter.setSession(session.id, session);
      adapter.removeSession(session.id);
      expect(adapter.getSession(session.id)).toBeUndefined();
    });

    it('should clear all sessions', () => {
      adapter.setSession('1', createMockSession({ id: '1' }));
      adapter.setSession('2', createMockSession({ id: '2' }));
      adapter.clearSessions();
      expect(adapter.getSessions()).toHaveLength(0);
    });
  });

  describe('session validation', () => {
    it('should throw StoreError on invalid session ID', () => {
      const invalidSession = createMockSession();
      invalidSession.id = '';

      try {
        adapter.setSession(invalidSession.id, invalidSession);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_ID);
        }
      }
    });

    it('should throw StoreError on invalid session data', () => {
      const { wallet: _, ...invalidSession } = createMockSession();

      try {
        adapter.setSession('test', invalidSession as WalletSession);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_DATA);
        }
      }
    });

    it('should validate session expiry', () => {
      const expiredSession = createMockSession({ expiry: now - 1000 });
      const id = expiredSession.id;

      adapter.setSession(id, expiredSession);
      expect(adapter.getSession(id)).toBe(undefined);
    });

    it('should handle missing or invalid session IDs', () => {
      expect(adapter.getSession('')).toBeUndefined();
      expect(adapter.getSession('nonexistent')).toBeUndefined();
      expect(() => adapter.removeSession('')).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw StoreError when store is not provided', () => {
      try {
        // Cast to the specific store type to avoid 'any'
        new SessionStoreAdapter(null as unknown as UseBoundStore<StoreApi<SessionStore>>);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.STORE_REQUIRED);
        }
      }
    });

    it('should handle store failures gracefully', () => {
      const mockError = createStoreError.storageError('Store operation failed');
      const failingStore = vi.fn(() => ({
        sessions: mockSessions,
        getSession: vi.fn().mockImplementation(() => {
          throw mockError;
        }),
        getSessions: vi.fn().mockImplementation(() => {
          throw mockError;
        }),
        setSession: vi.fn().mockImplementation(() => {
          throw mockError;
        }),
        removeSession: vi.fn().mockImplementation(() => {
          throw mockError;
        }),
        clearSessions: vi.fn().mockImplementation(() => {
          throw mockError;
        }),
      })) as unknown as UseBoundStore<StoreApi<SessionStore>>;

      const failingAdapter = new SessionStoreAdapter(failingStore);

      expect(() => failingAdapter.getSession('test')).toThrow(mockError);
      expect(() => failingAdapter.getSessions()).toThrow(mockError);
      expect(() => failingAdapter.setSession('test', createMockSession())).toThrow(mockError);
      expect(() => failingAdapter.removeSession('test')).toThrow(mockError);
      expect(() => failingAdapter.clearSessions()).toThrow(mockError);
    });
  });
});

const createMockProvider = (): Promise<Provider> =>
  Promise.resolve({
    request: async <T>(_method: string, _params?: unknown[]): Promise<T> => ({}) as T,
    connect: async () => {},
    disconnect: async () => {},
    isConnected: () => true,
  });
