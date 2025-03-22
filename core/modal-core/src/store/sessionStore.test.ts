import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionStore } from './sessionStore.js';
import { ConnectionStatus } from '../types.js';
import type { Provider } from '../types.js';
import { isStoreError, StoreErrorCode } from './errors.js';

describe('SessionStore', () => {
  const mockProvider: Provider = {
    request: async <T>(): Promise<T> => ({}) as T,
    connect: async () => {},
    disconnect: async () => {},
    isConnected: () => true,
  };

  const defaultSession = {
    id: 'test-session',
    address: '0x123',
    chains: {
      1: {
        chainId: 1,
        rpcUrl: 'https://test.com',
        status: ConnectionStatus.CONNECTED,
      },
    },
    expiry: Date.now() + 3600000, // 1 hour from now
    status: ConnectionStatus.CONNECTED,
    connector: {
      getProvider: async () => mockProvider,
      connect: async () => ({ address: '0x123', chainId: 1, publicKey: 'test', connected: true }),
      disconnect: async () => {},
      getState: () => ConnectionStatus.CONNECTED,
      resume: async () => ({ address: '0x123', chainId: 1, publicKey: 'test', connected: true }),
    },
    wallet: {
      address: '0x123',
      chainId: 1,
      publicKey: 'test-key',
      connected: true,
      state: {
        address: '0x123',
        networkId: 1,
        sessionId: 'test-session',
        lastActive: Date.now(),
      },
    },
  };

  let useStore: ReturnType<typeof createSessionStore>;

  beforeEach(() => {
    useStore = createSessionStore();
    useStore.getState().clearSessions();
  });

  describe('setSession', () => {
    it('should store valid session', () => {
      useStore.getState().setSession('test-session', defaultSession);
      expect(useStore.getState().getSession('test-session')).toEqual(defaultSession);
    });

    it('should throw StoreError on empty session ID', () => {
      try {
        useStore.getState().setSession('', defaultSession);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_ID);
        }
      }

      try {
        useStore.getState().setSession('  ', defaultSession);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_ID);
        }
      }
    });

    it('should throw StoreError on invalid session data', () => {
      const invalidSession = {
        ...defaultSession,
        wallet: { address: '', chainId: 1, publicKey: '', connected: false },
      };

      try {
        useStore.getState().setSession('test', invalidSession);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isStoreError(error)).toBe(true);
        if (isStoreError(error)) {
          expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_DATA);
        }
      }
    });

    it('should not store expired session', () => {
      const expiredSession = {
        ...defaultSession,
        expiry: Date.now() - 1000, // 1 second ago
      };
      useStore.getState().setSession('test-session', expiredSession);
      expect(useStore.getState().getSession('test-session')).toBeUndefined();
    });
  });

  describe('getSession', () => {
    it('should return undefined for non-existent session', () => {
      expect(useStore.getState().getSession('non-existent')).toBeUndefined();
    });

    it('should return undefined and remove expired session', () => {
      const expiredSession = {
        ...defaultSession,
        expiry: Date.now() - 1000,
      };
      // First set with future expiry
      useStore.getState().setSession('expired', { ...expiredSession, expiry: Date.now() + 1000 });
      // Then manually update to expired state
      useStore.setState((state) => {
        const sessions = new Map(state.sessions);
        sessions.set('expired', expiredSession);
        return { sessions };
      });
      expect(useStore.getState().getSession('expired')).toBeUndefined();
      expect(useStore.getState().sessions.get('expired')).toBeUndefined();
    });
  });

  describe('getSessions', () => {
    it('should return all sessions', () => {
      useStore.getState().setSession('test1', defaultSession);
      useStore.getState().setSession('test2', { ...defaultSession, id: 'test2' });
      expect(useStore.getState().getSessions()).toHaveLength(2);
    });

    it('should return empty array when no sessions', () => {
      expect(useStore.getState().getSessions()).toHaveLength(0);
    });
  });

  describe('removeSession', () => {
    it('should remove existing session', () => {
      useStore.getState().setSession('test', defaultSession);
      useStore.getState().removeSession('test');
      expect(useStore.getState().getSession('test')).toBeUndefined();
    });

    it('should not throw when removing non-existent session', () => {
      expect(() => useStore.getState().removeSession('non-existent')).not.toThrow();
    });
  });

  describe('clearSessions', () => {
    it('should remove all sessions', () => {
      useStore.getState().setSession('test1', defaultSession);
      useStore.getState().setSession('test2', { ...defaultSession, id: 'test2' });
      useStore.getState().clearSessions();
      expect(useStore.getState().getSessions()).toHaveLength(0);
    });
  });
});
