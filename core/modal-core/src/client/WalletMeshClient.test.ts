import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalletMeshClient } from './WalletMeshClient.js';
import {
  ConnectionStatus,
  type ConnectedWallet,
  type WalletInfo,
  type Connector,
  type WalletSession,
} from '../types.js';
import { createClientError, isClientError } from './errors.js';

// Mock functions need to be defined before vi.mock()
const mockUpdateSessionStatus = vi.fn();
const mockSetSession = vi.fn();
const mockGetSession = vi.fn();
const mockGetSessions = vi.fn();
const mockRemoveSession = vi.fn();

describe('WalletMeshClient', () => {
  // Mock data
  const mockDappInfo = {
    name: 'Test DApp',
    url: 'https://test.com',
    icon: 'https://test.com/icon.png',
    origin: 'https://test.com',
  };

  const mockWalletInfo: WalletInfo = {
    address: '0x123',
    chainId: 1,
    publicKey: '0x456',
  };

  const mockConnectedWallet: ConnectedWallet = {
    address: '0x123',
    chainId: 1,
    publicKey: '0x456',
    connected: true,
    type: 'test',
    info: mockWalletInfo,
    state: {
      address: '0x123',
      networkId: 1,
      sessionId: 'test-session',
      lastActive: Date.now(),
    },
  };

  const mockSession: WalletSession = {
    id: 'test-wallet',
    address: '0x123',
    chains: {},
    connector: {
      connect: vi.fn().mockResolvedValue(mockConnectedWallet),
      disconnect: vi.fn().mockResolvedValue(undefined),
      getProvider: vi.fn().mockResolvedValue({}),
      getState: vi.fn().mockReturnValue(ConnectionStatus.CONNECTED),
      resume: vi.fn().mockResolvedValue(mockConnectedWallet),
    },
    status: ConnectionStatus.CONNECTED,
    expiry: Date.now() + 3600000,
    wallet: mockConnectedWallet,
  };

  // Mock SessionManager
  vi.mock('./SessionManager.js', () => ({
    SessionManager: vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      getSession: mockGetSession,
      getSessions: mockGetSessions,
      setSession: mockSetSession,
      removeSession: mockRemoveSession,
      updateSessionStatus: mockUpdateSessionStatus,
      getWalletConnections: vi.fn(),
    })),
  }));

  // Mock window setup
  const mockWindow = {
    location: {
      origin: 'https://test.com',
      protocol: 'https:',
      host: 'test.com',
      href: 'https://test.com',
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    WalletMeshClient.resetInstance();

    // Setup default mock behaviors
    mockGetSession.mockReturnValue(undefined);
    mockGetSessions.mockReturnValue([mockSession]);

    // Reset all global mocks
    vi.unstubAllGlobals();

    // Setup window mock
    vi.stubGlobal('window', mockWindow);

    // Setup crypto mock
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('test-uuid'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Initialization', () => {
    it('should create single instance', () => {
      const instance1 = WalletMeshClient.getInstance(mockDappInfo);
      const instance2 = WalletMeshClient.getInstance(mockDappInfo);
      expect(instance1).toBe(instance2);
    });

    it('should validate origin against window.location', () => {
      const wrongWindow = {
        ...mockWindow,
        location: {
          origin: 'https://wrong.com',
          href: 'https://wrong.com',
        },
      };
      vi.stubGlobal('window', wrongWindow);

      expect(() => WalletMeshClient.getInstance(mockDappInfo)).toThrow(
        createClientError.originMismatch('https://test.com', 'https://wrong.com'),
      );
    });

    it('should handle concurrent initialization', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      const promise1 = client.initialize();
      const promise2 = client.initialize();

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe(result2);
    });
  });

  describe('Connection Management', () => {
    it('should handle connection state changes', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      // Setup initial state with a connected wallet
      const wallet = await client.connectWallet(mockWalletInfo, mockSession.connector);
      expect(wallet).toBe(mockConnectedWallet);

      // Mock session retrieval
      mockGetSession.mockReturnValue(mockSession);

      // Test transition
      client.prepareForTransition();

      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(wallet.address, ConnectionStatus.CONNECTING);
      expect(client['initialized']).toBe(false);
    });

    it('should handle connection errors', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const connectionError = new Error('Connection failed');
      const errorConnector: Connector = {
        ...mockSession.connector,
        connect: vi.fn().mockRejectedValue(connectionError),
      };

      try {
        await client.connectWallet(mockWalletInfo, errorConnector);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(isClientError(error)).toBe(true);
        expect((error as Error).message).toBe('Failed to establish wallet connection');
      }
    });

    it('should handle disconnect', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const wallet = await client.connectWallet(mockWalletInfo, mockSession.connector);
      expect(wallet).toBe(mockConnectedWallet);

      mockGetSession.mockReturnValue(mockSession);
      await client.disconnect();

      expect(mockSession.connector.disconnect).toHaveBeenCalled();
      expect(client['currentWallet']).toBeNull();
    });

    it('should handle missing session in prepareForTransition', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      // Reset all mocks to ensure clean state
      vi.clearAllMocks();

      // Ensure mockGetSession returns undefined
      mockGetSession.mockReturnValue(undefined);

      // Set up the current wallet state
      client['currentWallet'] = mockConnectedWallet;

      // Should not throw when session is missing
      client.prepareForTransition();

      expect(mockUpdateSessionStatus).not.toHaveBeenCalled();
      expect(client['initialized']).toBe(false);
    });
  });
});
