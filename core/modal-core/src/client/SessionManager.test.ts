import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionManager } from './SessionManager.js';
import { createClientError } from './errors.js';
import {
  ConnectionState,
  type WalletSession,
  type WalletInfo,
  type Connector,
  type ConnectedWallet,
  type SessionStore,
  type WalletState,
} from '../types.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockStore: SessionStore;
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2025-03-26T10:00:00Z');
    vi.setSystemTime(mockDate);

    mockStore = {
      sessions: new Map<string, WalletSession>(),
      getSession: vi.fn(),
      getSessions: vi.fn(),
      setSession: vi.fn(),
      removeSession: vi.fn(),
      clearSessions: vi.fn(),
    };

    sessionManager = new SessionManager(mockStore);
  });

  const createMockConnector = (overrides: Partial<Connector> = {}): Connector => ({
    getProvider: vi.fn().mockResolvedValue({}),
    connect: vi.fn().mockResolvedValue({
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
      connected: true,
      type: 'test',
      state: {
        address: '0xtest',
        networkId: 1,
        sessionId: 'test',
        lastActive: mockDate.getTime(),
      },
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockReturnValue(ConnectionState.DISCONNECTED),
    resume: vi.fn().mockResolvedValue({
      address: '0xtest',
      chainId: 1,
      publicKey: '0x123',
      connected: true,
      type: 'test',
      state: {
        address: '0xtest',
        networkId: 1,
        sessionId: 'test',
        lastActive: mockDate.getTime(),
      },
    }),
    ...overrides,
  });

  const createMockSession = (
    id: string,
    options: { invalid?: boolean; customState?: Partial<WalletState> } = {},
  ): WalletSession => {
    const walletInfo: WalletInfo = {
      address: `0x${id}`,
      chainId: 1,
      publicKey: '0x456',
    };

    const defaultState: WalletState = {
      address: `0x${id}`,
      networkId: 1,
      sessionId: id,
      lastActive: options.invalid ? 0 : mockDate.getTime() - 60 * 60 * 1000, // 1 hour ago
    };

    const state = options.customState ? { ...defaultState, ...options.customState } : defaultState;

    const wallet: ConnectedWallet = {
      ...walletInfo,
      connected: !options.invalid,
      type: 'test',
      info: walletInfo,
      state,
    };

    const connector = createMockConnector();
    if (options.invalid) {
      connector.resume = vi.fn().mockRejectedValue(new Error('Resume failed'));
    }

    return {
      id,
      address: `0x${id}`,
      chains: {},
      expiry: mockDate.getTime() + 24 * 60 * 60 * 1000, // 1 day from now
      status: options.invalid ? ConnectionState.DISCONNECTED : ConnectionState.CONNECTED,
      connector,
      wallet,
    };
  };

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const validSession = createMockSession('valid');
      vi.mocked(mockStore.getSessions).mockReturnValue([validSession]);

      await sessionManager.initialize();
      expect(mockStore.getSessions).toHaveBeenCalled();
      expect(mockStore.setSession).toHaveBeenCalledWith('valid', validSession);
      expect(mockStore.setSession).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      const mockError = new Error('Mock storage error');
      vi.mocked(mockStore.getSessions).mockRejectedValueOnce(mockError);

      const expectedError = createClientError.restoreFailed('Failed to restore wallet sessions', {
        cause: mockError,
      });

      await expect(sessionManager.initialize()).rejects.toThrow(
        createClientError.initFailed('Failed to initialize session manager', { cause: expectedError }),
      );
    });

    it('should skip invalid sessions during restore', async () => {
      const validSession = createMockSession('valid');
      const invalidSession = createMockSession('invalid', { invalid: true });

      vi.mocked(mockStore.getSessions).mockReturnValue([validSession, invalidSession]);
      await sessionManager.initialize();

      expect(mockStore.setSession).toHaveBeenCalledWith('valid', validSession);
      expect(mockStore.setSession).not.toHaveBeenCalledWith('invalid', expect.any(Object));
      expect(mockStore.setSession).toHaveBeenCalledTimes(1);
    });

    it('should handle custom session state', async () => {
      const customState = {
        lastActive: mockDate.getTime() - 30 * 60 * 1000, // 30 minutes ago
        extraData: 'test',
      };

      const session = createMockSession('custom', { customState });
      vi.mocked(mockStore.getSessions).mockReturnValue([session]);

      await sessionManager.initialize();
      expect(mockStore.setSession).toHaveBeenCalledWith(
        'custom',
        expect.objectContaining({
          wallet: expect.objectContaining({
            state: expect.objectContaining(customState),
          }),
        }),
      );
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      vi.mocked(mockStore.getSessions).mockReturnValue([]);
      await sessionManager.initialize();
    });

    it('should create session', () => {
      const walletInfo: WalletInfo = {
        address: '0xtest',
        chainId: 1,
        publicKey: '0x123',
      };

      const state: WalletState = {
        address: '0xtest',
        networkId: 1,
        sessionId: 'test',
        lastActive: mockDate.getTime(),
      };

      const connectedWallet: ConnectedWallet = {
        ...walletInfo,
        connected: true,
        type: 'test',
        info: walletInfo,
        state,
      };

      const mockConnector = createMockConnector();
      const session = sessionManager.createSession(connectedWallet, mockConnector);

      expect(session.wallet).toEqual(connectedWallet);
      expect(session.connector).toBe(mockConnector);
    });

    it('should get session', () => {
      const session = createMockSession('test');
      vi.mocked(mockStore.getSession).mockReturnValue(session);

      const result = sessionManager.getSession('test');
      expect(result).toEqual(session);
    });

    it('should remove session', () => {
      sessionManager.removeSession('test');
      expect(mockStore.removeSession).toHaveBeenCalledWith('test');
    });

    it('should update session status', () => {
      const session = createMockSession('test');
      vi.mocked(mockStore.getSession).mockReturnValue(session);

      sessionManager.updateSessionStatus('test', ConnectionState.DISCONNECTED);
      expect(mockStore.setSession).toHaveBeenCalledWith('test', {
        ...session,
        status: ConnectionState.DISCONNECTED,
      });
    });
  });
});
