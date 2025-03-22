import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionStatus } from '../types.js';
import type { WalletSession, SessionStore, ConnectedWallet } from '../types.js';
import { SessionManager } from './SessionManager.js';

describe('SessionManager', () => {
  let mockStore: SessionStore;
  let sessionManager: SessionManager;
  let testSessions: Map<string, WalletSession>;

  const createMockWalletSession = (id: string, connected = true): WalletSession => ({
    id,
    address: `0x${id}`,
    chains: {},
    expiry: Date.now() + 3600000,
    connector: {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getProvider: vi.fn(),
      getState: vi.fn(),
      resume: vi.fn(),
    },
    status: connected ? ConnectionStatus.CONNECTED : ConnectionStatus.CONNECTING,
    wallet: {
      address: `0x${id}`,
      chainId: 1,
      publicKey: '0x456',
      connected,
      type: 'test',
      state: {
        address: `0x${id}`,
        networkId: 1,
        sessionId: id,
        lastActive: Date.now(),
      },
    },
  });

  beforeEach(() => {
    testSessions = new Map();

    mockStore = {
      sessions: testSessions,
      getSession: vi.fn().mockImplementation((id: string) => testSessions.get(id)),
      getSessions: vi.fn().mockImplementation(() => Promise.resolve(Array.from(testSessions.values()))),
      setSession: vi.fn().mockImplementation((id: string, session: WalletSession) => {
        testSessions.set(id, session);
      }),
      removeSession: vi.fn().mockImplementation((id: string) => {
        testSessions.delete(id);
      }),
      clearSessions: vi.fn().mockImplementation(() => testSessions.clear()),
    };

    sessionManager = new SessionManager(mockStore);
  });

  describe('Initialization', () => {
    it('should handle initialization errors', async () => {
      const mockError = new Error('Mock storage error');
      vi.mocked(mockStore.getSessions).mockRejectedValue(mockError);

      const promise = sessionManager.initialize();
      await expect(promise).rejects.toHaveProperty('code', 'init_failed');
      await expect(promise).rejects.toHaveProperty('message', 'Failed to initialize session manager');

      const error = await promise.catch((e) => e);
      expect(error.details?.cause?.code).toBe('restore_failed');
      expect(error.details?.cause?.message).toBe('Failed to restore wallet sessions');
      expect(error.details?.cause?.details?.cause?.message).toBe('Mock storage error');

      expect(vi.mocked(mockStore.getSessions)).toHaveBeenCalled();
    });

    it('should initialize successfully', async () => {
      const session1 = createMockWalletSession('1');
      const session2 = createMockWalletSession('2', false);
      testSessions.set('1', session1);
      testSessions.set('2', session2);

      await sessionManager.initialize();

      expect(mockStore.getSessions).toHaveBeenCalled();
      const restoredSessions = sessionManager.getSessions();
      expect(restoredSessions).toHaveLength(2);

      // Connected session should maintain status
      const restored1 = restoredSessions.find((s) => s.id === '1');
      expect(restored1?.status).toBe(ConnectionStatus.CONNECTED);
      expect(restored1?.wallet.connected).toBe(true);

      // Disconnected session should be in connecting state
      const restored2 = restoredSessions.find((s) => s.id === '2');
      expect(restored2?.status).toBe(ConnectionStatus.CONNECTING);
      expect(restored2?.wallet.connected).toBe(false);
    });

    it('should skip invalid sessions during restore', async () => {
      const validSession = createMockWalletSession('valid');

      // Create an invalid wallet without required state property
      const invalidWallet: Partial<ConnectedWallet> = {
        address: '0xinvalid',
        chainId: 1,
        publicKey: '0x456',
        connected: false,
        type: 'test',
        // Intentionally omitting state property
      };

      const invalidSession: WalletSession = {
        id: 'invalid',
        address: '0xinvalid',
        chains: {},
        expiry: Date.now() + 3600000,
        connector: {
          connect: vi.fn(),
          disconnect: vi.fn(),
          getProvider: vi.fn(),
          getState: vi.fn(),
          resume: vi.fn(),
        },
        status: ConnectionStatus.DISCONNECTED,
        wallet: invalidWallet as ConnectedWallet,
      };

      testSessions.set('valid', validSession);
      testSessions.set('invalid', invalidSession);

      await sessionManager.initialize();
      expect(sessionManager.getSessions()).toEqual([validSession]);
    });
  });

  // ... rest of the tests remain unchanged
  describe('Session Management', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should store and retrieve sessions', () => {
      const session = createMockWalletSession('test');
      sessionManager.setSession('test', session);

      expect(mockStore.setSession).toHaveBeenCalledWith('test', session);

      const retrieved = sessionManager.getSession('test');
      expect(retrieved).toEqual(session);
    });

    it('should update session status', () => {
      const session = createMockWalletSession('test');
      testSessions.set('test', session);

      sessionManager.updateSessionStatus('test', ConnectionStatus.CONNECTING);

      const updated = sessionManager.getSession('test');
      expect(updated?.status).toBe(ConnectionStatus.CONNECTING);
      expect(updated?.wallet.connected).toBe(false);
      expect(mockStore.setSession).toHaveBeenCalled();
    });

    it('should handle missing sessions in status update', () => {
      sessionManager.updateSessionStatus('nonexistent', ConnectionStatus.CONNECTING);
      expect(mockStore.setSession).not.toHaveBeenCalled();
    });

    it('should remove sessions', () => {
      const session = createMockWalletSession('test');
      testSessions.set('test', session);

      sessionManager.removeSession('test');

      expect(mockStore.removeSession).toHaveBeenCalledWith('test');
      expect(sessionManager.getSession('test')).toBeUndefined();
    });

    it('should handle removing non-existent sessions', () => {
      sessionManager.removeSession('nonexistent');
      expect(mockStore.removeSession).toHaveBeenCalledWith('nonexistent');
    });

    it('should maintain cache consistency with store', () => {
      const session = createMockWalletSession('test');
      sessionManager.setSession('test', session);

      // Modify session in store directly
      const modifiedSession = { ...session, status: ConnectionStatus.CONNECTING };
      testSessions.set('test', modifiedSession);

      // Cache should be updated when getting session
      const retrieved = sessionManager.getSession('test');
      expect(retrieved).toEqual(modifiedSession);
    });

    it('should prevent session mutation', () => {
      const session = createMockWalletSession('test');
      sessionManager.setSession('test', session);

      const retrieved = sessionManager.getSession('test');
      expect(() => {
        if (retrieved) {
          retrieved.status = ConnectionStatus.CONNECTING;
        }
      }).toThrow(TypeError);

      // Original session in store should not be modified
      const fromStore = sessionManager.getSession('test');
      expect(fromStore?.status).toBe(ConnectionStatus.CONNECTED);
    });
  });
});
