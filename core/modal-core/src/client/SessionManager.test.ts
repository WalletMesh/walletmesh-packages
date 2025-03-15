import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defaultSessionStore } from '../store/sessionStore.js';
import { SessionManager } from './SessionManager.js';
import { defaultSessionStoreAdapter } from '../store/sessionStoreAdapter.js';
import { ConnectionStatus, type WalletSession, WalletError } from '../types.js';

// Mock crypto
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockReturnValue('test-uuid'),
});

// Mock createConnector
vi.mock('./createConnector.js', () => ({
  // Return success by default
  createConnector: vi.fn().mockResolvedValue({}),
}));

describe('SessionManager', () => {
  const mockSession: WalletSession = {
    id: 'test-wallet',
    createdAt: Date.now(),
    wallet: {
      info: {
        id: 'test-wallet',
        name: 'Test Wallet',
        connector: { type: 'mock' },
      },
      state: {
        address: '0x123',
        networkId: '1',
        sessionId: 'test-session',
      },
    },
    chainConnections: new Map(),
    sessionToken: {
      id: 'token-id',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      walletType: 'test',
      publicKey: '0x456',
      permissions: ['test'],
      accounts: ['0x123'],
      chainIds: [1],
      nonce: 'test-nonce',
      signature: '0x789',
    },
    status: ConnectionStatus.Connected,
  };

  const mockStore = defaultSessionStoreAdapter(defaultSessionStore);
  let sessionManager: SessionManager;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStore.clearSessions();
    sessionManager = new SessionManager(mockStore);
    await sessionManager.initialize();
  });

  describe('session management', () => {
    it('should set and get session', () => {
      sessionManager.setSession('test-wallet', mockSession);
      const retrievedSession = sessionManager.getSession('test-wallet');
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe('test-wallet');
    });

    it('should remove session', () => {
      sessionManager.setSession('test-wallet', mockSession);
      sessionManager.removeSession('test-wallet');
      expect(sessionManager.getSession('test-wallet')).toBeUndefined();
    });

    it('should get all sessions', () => {
      sessionManager.setSession('test-wallet-1', mockSession);
      sessionManager.setSession('test-wallet-2', {
        ...mockSession,
        id: 'test-wallet-2',
      });

      const sessions = sessionManager.getSessions();
      expect(sessions).toHaveLength(2);
    });

    it('should clear all sessions', () => {
      sessionManager.setSession('test-wallet-1', mockSession);
      sessionManager.setSession('test-wallet-2', {
        ...mockSession,
        id: 'test-wallet-2',
      });

      sessionManager.clearSessions();
      expect(sessionManager.getSessions()).toHaveLength(0);
    });

    it('should validate wallet state', () => {
      const invalidSession = {
        ...mockSession,
        wallet: {
          ...mockSession.wallet,
          state: {
            address: null,
            networkId: null,
            sessionId: null,
          },
        },
      };

      expect(() => sessionManager.setSession('test-wallet', invalidSession)).toThrow(WalletError);
    });

    it('should update session status and error', () => {
      sessionManager.setSession('test-wallet', mockSession);
      const error = new Error('Test error');
      
      sessionManager.updateSessionStatus('test-wallet', ConnectionStatus.Error, error);
      
      const updatedSession = sessionManager.getSession('test-wallet');
      expect(updatedSession?.status).toBe(ConnectionStatus.Error);
      expect(updatedSession?.lastConnectionError).toBe(error);
    });
  });

  describe('session restoration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should restore sessions on initialization', async () => {
      // Setup mock session in store
      mockStore.setSession('test-wallet', mockSession);

      // Create new instance and initialize
      const newManager = new SessionManager(mockStore);
      await newManager.initialize();

      // Verify session was restored
      const session = newManager.getSession('test-wallet');
      expect(session).toBeDefined();
      expect(session?.id).toBe('test-wallet');
      expect(session?.status).toBe(ConnectionStatus.Resuming);

      // Verify createConnector was called
      const { createConnector } = await import('./createConnector.js');
      expect(createConnector).toHaveBeenCalledWith(mockSession.wallet.info.connector); 
    });
  });
});
