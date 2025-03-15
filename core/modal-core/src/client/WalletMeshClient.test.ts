import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalletMeshClient } from './WalletMeshClient.js';
import { ConnectionStatus } from '../types.js';
import type { ConnectedWallet, DappInfo, WalletInfo, WalletSession, Connector } from '../types.js';

// Mock SessionManager
vi.mock('./SessionManager.js', () => ({
  SessionManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    getSession: vi.fn(),
    getSessions: vi.fn().mockReturnValue([]),
    setSession: vi.fn(),
    removeSession: vi.fn(),
    updateSessionStatus: vi.fn(),
    getWalletConnections: vi.fn(),
  })),
}));

describe('WalletMeshClient', () => {
  // Mock data
  const mockDappInfo: DappInfo = {
    name: 'Test DApp',
    description: 'Test Description',
    url: 'https://test.com',
    icon: 'https://test.com/icon.png',
    origin: 'https://test.com',
  };

  const mockWalletInfo: WalletInfo = {
    id: 'test-wallet',
    name: 'Test Wallet',
    description: 'Test Wallet Description',
    icon: 'https://test.com/wallet-icon.png',
    connector: {
      type: 'test',
      options: {},
    },
  };

  const mockConnectedWallet: ConnectedWallet = {
    info: mockWalletInfo,
    state: {
      address: '0x123',
      networkId: '1',
      sessionId: 'test-session',
    },
  };

  const mockConnector: Connector = {
    connect: vi.fn().mockResolvedValue(mockConnectedWallet),
    resume: vi.fn().mockResolvedValue(mockConnectedWallet),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getProvider: vi.fn().mockResolvedValue({}),
  };

  const createMockSession = (overrides?: Partial<WalletSession>): WalletSession => ({
    id: 'test-wallet',
    createdAt: Date.now(),
    connector: mockConnector,
    wallet: mockConnectedWallet,
    status: ConnectionStatus.Connected,
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
    ...overrides,
  });

  // Mock window setup
  const mockWindow = {
    location: { 
      origin: 'https://test.com',
      protocol: 'https:',
      host: 'test.com',
      href: 'https://test.com'
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    WalletMeshClient.resetInstance();
    
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

  describe('Singleton Pattern & Initialization', () => {
    it('should create single instance', () => {
      const instance1 = WalletMeshClient.getInstance(mockDappInfo);
      const instance2 = WalletMeshClient.getInstance(mockDappInfo);
      expect(instance1).toBe(instance2);
    });

    it('should validate origin against window.location', () => {
      const wrongWindow = {
        ...mockWindow,
        location: { origin: 'https://wrong.com', href: 'https://wrong.com' },
      };
      vi.stubGlobal('window', wrongWindow);

      expect(() => WalletMeshClient.getInstance(mockDappInfo)).toThrow(
        "Origin mismatch: DApp info specifies 'https://test.com' but is being served from 'https://wrong.com'"
      );
    });

    it('should make dappInfo immutable', () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      const dappInfo = client.getDappInfo();
      expect(() => {
        (dappInfo as { name: string }).name = 'New Name';
      }).toThrow();
    });

    it('should handle concurrent initialization', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      const promise1 = client.initialize();
      const promise2 = client.initialize();

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe(result2);
    });

    it('should prevent reinitialization', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();
      const result = await client.initialize();
      expect(result).toBe(null);
    });
  });

  describe('Session Management', () => {
    it('should get connected wallet', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const mockSession = createMockSession();
      vi.mocked(client['sessionManager'].getSessions).mockReturnValue([mockSession]);

      const connectedWallet = client.getConnectedWallet();
      expect(connectedWallet).toBe(mockConnectedWallet);
    });

    it('should get wallet connections', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const mockConnections = new Map();
      mockConnections.set(1, { address: '0x123', permissions: ['test'] });

      vi.mocked(client['sessionManager'].getWalletConnections).mockResolvedValue(mockConnections);

      const connections = await client.getWalletConnections('test-wallet');
      expect(connections).toBe(mockConnections);
    });
  });

  describe('Wallet Connection/Disconnection', () => {
    it('should connect wallet successfully', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const connectedWallet = await client.connectWallet(mockWalletInfo, mockConnector);
      expect(connectedWallet).toBe(mockConnectedWallet);
      expect(mockConnector.connect).toHaveBeenCalledWith(mockWalletInfo);
    });

    it('should throw error when connecting without initialization', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await expect(client.connectWallet(mockWalletInfo, mockConnector)).rejects.toThrow(
        'Client must be initialized before connecting'
      );
    });

    it('should disconnect wallet with timeout', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      // Mock slow disconnect
      const slowConnector: Connector = {
        ...mockConnector,
        disconnect: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 6000))),
      };

      const mockSession = createMockSession({ connector: slowConnector });
      vi.mocked(client['sessionManager'].getSession).mockReturnValue(mockSession);

      await client.disconnectWallet('test-wallet');
      expect(client['sessionManager'].removeSession).toHaveBeenCalledWith('test-wallet');
    });
  });

  describe('Page Transition Handling', () => {
    it('should prepare for page transition', () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      const mockSession = createMockSession();

      vi.mocked(client['sessionManager'].getSessions).mockReturnValue([mockSession]);
      
      client['initialized'] = true;
      client.prepareForTransition();

      expect(client['sessionManager'].updateSessionStatus).toHaveBeenCalledWith(
        'test-wallet',
        ConnectionStatus.Resuming
      );
      expect(client['initialized']).toBe(false);
    });

    it('should handle window events', () => {
      // Setup fresh window mock with spy
      const addEventListenerSpy = vi.fn();
      vi.stubGlobal('window', {
        ...mockWindow,
        addEventListener: addEventListenerSpy
      });
      
      // Reset the cleanupCallbackRegistered flag
      WalletMeshClient['cleanupCallbackRegistered'] = false;

      // Create new instance to trigger event listener registration
      WalletMeshClient.resetInstance();
      WalletMeshClient.getInstance(mockDappInfo);

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      const errorConnector: Connector = {
        ...mockConnector,
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
      };

      await expect(client.connectWallet(mockWalletInfo, errorConnector)).rejects.toThrow(
        'Connection failed'
      );
    });

    it('should handle provider errors', async () => {
      const client = WalletMeshClient.getInstance(mockDappInfo);
      await client.initialize();

      vi.mocked(client['sessionManager'].getSession).mockReturnValue(undefined);

      await expect(client.getChainProvider('test-wallet')).rejects.toThrow(
        'No session found for wallet test-wallet'
      );
    });
  });
});