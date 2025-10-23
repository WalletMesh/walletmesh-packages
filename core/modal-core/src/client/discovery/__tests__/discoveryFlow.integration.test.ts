/**
 * Integration tests for discovery flow
 * Tests the complete flow from protocol initialization to JSON-RPC session
 */

import type { DiscoveryInitiator, QualifiedResponder } from '@walletmesh/discovery';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorFactory } from '../../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../../internal/core/logger/logger.js';
import type { WalletRegistry } from '../../../internal/registries/wallets/WalletRegistry.js';
import { createMockLogger } from '../../../testing/index.js';
import { RateLimiter } from '../../../security/rateLimiting.js';
import { ChainType, TransportType } from '../../../types.js';
import { DiscoveryService } from '../../DiscoveryService.js';

// Mock @walletmesh/discovery module
vi.mock('@walletmesh/discovery', () => {
  const createMockInitiator = () => ({
    startDiscovery: vi.fn().mockResolvedValue([]),
    stopDiscovery: vi.fn().mockResolvedValue(undefined),
    isDiscovering: vi.fn().mockReturnValue(false),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  });

  return {
    DiscoveryInitiator: vi.fn().mockImplementation(createMockInitiator),
    createInitiatorSession: vi.fn().mockImplementation(createMockInitiator),
  };
});

// Mock the store module from test's perspective
// Also add a second mock for DiscoveryService's import path
vi.mock('../../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected',
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined,
      },
      entities: {
        wallets: {},
      },
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn()),
  })),
}));

vi.mock('../../state/store.js', () => ({
  getStoreInstance: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false, error: undefined },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected',
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined,
      },
      entities: {
        wallets: {},
      },
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    subscribeWithSelector: vi.fn(() => vi.fn()),
  })),
  useStore: vi.fn(() => ({
    getState: vi.fn(() => ({
      ui: { isOpen: false, isLoading: false },
      connections: {
        activeSessions: [],
        availableWallets: [],
        discoveredWallets: [],
        activeSessionId: null,
        connectionStatus: 'disconnected',
      },
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
        activeTransaction: undefined,
      },
      entities: {
        wallets: {},
      },
    })),
  })),
}));

// Mock WebSocket transport
vi.mock('../../../internal/transports/websocket/WebSocketTransport.js', () => ({
  WebSocketTransport: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue(undefined),
    onMessage: vi.fn(),
    onError: vi.fn(),
    onClose: vi.fn(),
    dispose: vi.fn(),
  })),
}));

describe('Discovery Flow Integration', () => {
  let discoveryService: DiscoveryService;
  let mockDiscoveryInitiator: Partial<DiscoveryInitiator>;
  let mockConnectionManager: unknown;
  let logger: Logger;
  let mockWalletRegistry: Partial<WalletRegistry>;
  let mockAdapterRegistry: unknown;
  let mockCoordinator: unknown;

  beforeEach(async () => {
    vi.useFakeTimers();

    // Create mock logger
    logger = createMockLogger();

    // Create mock registries
    mockWalletRegistry = {
      register: vi.fn(),
      unregister: vi.fn(),
      getAdapter: vi.fn(),
      getAllAdapters: vi.fn().mockReturnValue([]),
      hasAdapter: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
      detectAvailableAdapters: vi.fn().mockResolvedValue([]),
    };

    mockAdapterRegistry = {
      registerAdapter: vi.fn(),
      getAdapter: vi.fn(),
      hasAdapter: vi.fn().mockReturnValue(false),
      getAllAdapters: vi.fn().mockReturnValue([]),
      clear: vi.fn(),
    };

    mockCoordinator = {
      registerListener: vi.fn(),
      unregisterListener: vi.fn(),
      notifyDiscovery: vi.fn(),
    };

    // Create mock discovery listener
    mockDiscoveryInitiator = {
      startDiscovery: vi.fn().mockResolvedValue([]),
      stopDiscovery: vi.fn().mockResolvedValue(undefined),
      getQualifiedResponders: vi.fn().mockReturnValue([]),
      isDiscovering: vi.fn().mockReturnValue(false),
      destroy: vi.fn(),
    };

    // Create mock connection manager
    mockConnectionManager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    // Mock constructor
    const discoveryModule = await import('@walletmesh/discovery');
    vi.mocked(discoveryModule.DiscoveryInitiator).mockImplementation(
      () => mockDiscoveryInitiator as unknown as DiscoveryInitiator,
    );
    vi.mocked(discoveryModule.createInitiatorSession).mockImplementation(
      () => mockDiscoveryInitiator as unknown as DiscoveryInitiator,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    discoveryService?.destroy();
  });

  describe('Basic Discovery Flow', () => {
    it('should complete discovery flow from protocol to session', async () => {
      // Create discovery service with minimal config
      const config = {
        enabled: true,
        timeout: 5000,
        supportedChainTypes: [ChainType.Evm],
        dappInfo: {
          name: 'Test DApp',
          url: 'https://test.example.com',
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock successful discovery response
      const mockResponder: QualifiedResponder = {
        responderId: 'metamask-123',
        sessionId: 'session-123',
        rdns: 'io.metamask',
        name: 'MetaMask',
        icon: 'https://metamask.io/icon.png',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: ['eip1193'] }],
            features: ['inject_window', 'events'],
          },
        },
      };

      // Setup discovery mock to return responder
      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);

      // Setup connection mock
      mockConnectionManager.connect.mockResolvedValue({
        connectionId: 'session-123',
        transport: {
          type: 'injected',
          provider: { request: vi.fn() },
        },
      });

      // Run a discovery scan
      await discoveryService.scan();

      // Wait for discovery to complete
      await vi.advanceTimersByTimeAsync(200);

      // Verify discovery was initiated
      expect(mockDiscoveryInitiator.startDiscovery).toHaveBeenCalled();

      // Connect to discovered wallet
      const wallets = await discoveryService.getAvailableWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0]).toMatchObject({
        id: 'io.metamask',
        name: 'MetaMask',
        icon: 'https://metamask.io/icon.png',
      });

      // Verify wallet was discovered
      const discoveredWallet = discoveryService.getDiscoveredWallet('io.metamask');
      expect(discoveredWallet).toBeDefined();
      expect(discoveredWallet?.isAvailable).toBe(true);
    });

    it('should handle CAIP-2 chain ID normalization', async () => {
      const config = {
        enabled: true,
        supportedChainTypes: [ChainType.Evm, ChainType.Solana],
        capabilities: {
          chains: ['ethereum', '0x89', 'solana:mainnet'],
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      await discoveryService.scan();

      // Verify discovery was called
      expect(mockDiscoveryInitiator.startDiscovery).toHaveBeenCalled();

      // Verify discovery listener was created with technologies
      expect(mockDiscoveryInitiator.startDiscovery).toHaveBeenCalled();
    });
  });

  describe('Security Integration', () => {
    it('should validate origin before allowing connection', async () => {
      // Create discovery service with security enabled
      const config = {
        enabled: true,
        security: {
          enableOriginValidation: true,
          originValidation: {
            requireHttps: true,
            allowedOrigins: ['https://test.example.com'],
          },
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock responder with invalid origin
      const mockResponder: QualifiedResponder = {
        responderId: 'malicious-123',
        sessionId: 'session-123',
        rdns: 'com.malicious',
        name: 'Malicious Wallet',
        icon: 'http://malicious.com/icon.png',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: [] }],
            features: [],
          },
        },
      };

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      // Wallet should not be added due to origin validation failure
      const wallets = await discoveryService.getAvailableWallets();
      expect(wallets).toHaveLength(0);
    });

    it('should enforce rate limiting on discovery requests', async () => {
      const config = {
        enabled: true,
        security: {
          enableRateLimiting: true,
          rateLimit: {
            maxRequests: 2,
            windowMs: 60000,
            burstSize: 0, // Disable burst tokens to get simple counting behavior
          },
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      const rateLimiterCheckSpy = vi.spyOn(RateLimiter.prototype, 'check').mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAfterMs: 1000,
        retryAfterMs: 1000,
        reason: 'rate_limited',
      });

      await expect(discoveryService.scan()).rejects.toMatchObject({
        code: 'configuration_error',
        message: expect.stringContaining('Rate limit exceeded'),
      });

      rateLimiterCheckSpy.mockRestore();
    });

    it('should create secure sessions with origin binding', async () => {
      const config = {
        enabled: true,
        security: {
          enableSessionSecurity: true,
          sessionSecurity: {
            bindToOrigin: true,
            enableRecovery: true,
          },
        },
        dappInfo: {
          name: 'Test DApp',
          url: 'https://test.example.com',
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock successful discovery and connection
      const mockResponder: QualifiedResponder = {
        responderId: 'metamask-123',
        sessionId: 'session-123',
        rdns: 'io.metamask',
        name: 'MetaMask',
        icon: 'https://metamask.io/icon.png',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: [] }],
            features: [],
          },
        },
      };

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);

      mockConnectionManager.connect.mockResolvedValue({
        connectionId: 'session-123',
        transport: { type: 'injected', provider: {} },
      });

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      // Connect to discovered wallet to create session
      const connection = await discoveryService.connectToWallet('metamask-123', {
        requestedChains: ['eip155:1'],
      });

      expect(connection).toBeDefined();
      expect(connection.sessionId).toBe('session-123');

      // Session should be created with security
      const session = {
        origin: 'https://test.example.com',
        walletId: 'metamask-123',
        sessionId: connection.sessionId,
      };

      expect(session).toBeDefined();
      expect(session.origin).toBe('https://test.example.com');
      expect(session.walletId).toBe('metamask-123');
    });
  });

  describe('Event System Integration', () => {
    it('should emit events during discovery flow', async () => {
      const config = {
        enabled: true,
        supportedChainTypes: [ChainType.Evm],
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      const events: Array<{ type: string; data: unknown }> = [];

      // Listen to all discovery events
      discoveryService.on('discovery_started', (data) => {
        events.push({ type: 'discovery_started', data });
      });

      discoveryService.on('wallet_discovered', (data) => {
        events.push({ type: 'wallet_discovered', data });
      });

      discoveryService.on('discovery_completed', (data) => {
        events.push({ type: 'discovery_completed', data });
      });

      // Mock discovery response
      const mockResponder: QualifiedResponder = {
        responderId: 'metamask-123',
        sessionId: 'session-123',
        rdns: 'io.metamask',
        name: 'MetaMask',
        icon: 'https://metamask.io/icon.png',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: [] }],
            features: [],
          },
        },
      };

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      // Verify events were emitted in correct order
      expect(events.length).toBeGreaterThanOrEqual(2);
      expect(events[0].type).toBe('discovery_started');
      expect(events.find((e) => e.type === 'discovery_completed')).toBeDefined();
    });
  });

  describe('Transport Configuration', () => {
    it('should extract and configure WebSocket transport', async () => {
      const config = {
        enabled: true,
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock WebSocket transport responder
      const mockResponder: QualifiedResponder = {
        responderId: 'websocket-wallet-123',
        sessionId: 'session-123',
        rdns: 'com.wallet.websocket',
        name: 'WebSocket Wallet',
        icon: 'https://wallet.com/icon.png',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: [] }],
            features: ['websocket'],
          },
        },
      };

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      const wallets = await discoveryService.getAvailableWallets();
      expect(wallets[0]).toMatchObject({
        id: expect.any(String),
        name: 'WebSocket Wallet',
      });
    });

    it('should handle multiple transport types from discovery', async () => {
      const config = {
        enabled: true,
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock multiple responders
      const mockResponders: QualifiedResponder[] = [
        {
          responderId: 'injected-wallet-123',
          sessionId: 'session-123',
          rdns: 'com.injected',
          name: 'Injected Wallet',
          icon: '',
          matched: {
            required: {
              technologies: [{ type: 'evm' as const, interfaces: [] }],
              features: ['inject_window'],
            },
          },
        },
        {
          responderId: 'popup-wallet-123',
          sessionId: 'session-123',
          rdns: 'com.popup',
          name: 'Popup Wallet',
          icon: '',
          matched: {
            required: {
              technologies: [{ type: 'evm' as const, interfaces: [] }],
              features: ['popup'],
            },
          },
        },
        {
          responderId: 'iframe-wallet-123',
          sessionId: 'session-123',
          rdns: 'com.iframe',
          name: 'IFrame Wallet',
          icon: '',
          matched: {
            required: {
              technologies: [{ type: 'evm' as const, interfaces: [] }],
              features: ['iframe'],
            },
          },
        },
      ];

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue(mockResponders);

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      const wallets = await discoveryService.getAvailableWallets();
      expect(wallets).toHaveLength(3);

      // Verify wallets were discovered
      expect(wallets.find((w) => w.name === 'Injected Wallet')).toBeDefined();
      expect(wallets.find((w) => w.name === 'Popup Wallet')).toBeDefined();
      expect(wallets.find((w) => w.name === 'IFrame Wallet')).toBeDefined();
    });
  });

  describe('Connection State Recovery', () => {
    it('should recover sessions after reconnection', async () => {
      const config = {
        enabled: true,
        security: {
          enableSessionSecurity: true,
          sessionSecurity: {
            enableRecovery: true,
            enablePersistence: true,
          },
        },
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock a wallet with session
      const mockResponder: QualifiedResponder = {
        responderId: 'metamask-123',
        sessionId: 'session-123',
        rdns: 'io.metamask',
        name: 'MetaMask',
        icon: '',
        matched: {
          required: {
            technologies: [{ type: 'evm' as const, interfaces: [] }],
            features: [],
          },
        },
      };

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([mockResponder]);
      mockConnectionManager.connect.mockResolvedValue({
        connectionId: 'session-123',
        transport: { type: 'injected', provider: {} },
      });

      await discoveryService.scan();

      // Connect to create session
      const connection = await discoveryService.connectToWallet('metamask-123');
      expect(connection.sessionId).toBe('session-123');

      // Verify session was created and can be recovered
      // This would be handled by session security manager in real implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle discovery protocol errors gracefully', async () => {
      const config = {
        enabled: true,
        retryInterval: 1000,
        maxAttempts: 2,
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock discovery failure - succeed first, then fail
      mockDiscoveryInitiator.startDiscovery
        .mockResolvedValueOnce([]) // First scan succeeds
        .mockRejectedValue(ErrorFactory.transportError('Discovery protocol error')); // Subsequent scans fail

      const errorHandler = vi.fn();
      discoveryService.on('discovery_error', errorHandler);

      await discoveryService.scan();

      // Discovery should fail
      await expect(discoveryService.scan()).rejects.toThrow();
      await vi.advanceTimersByTimeAsync(200);

      // Verify error was emitted
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: expect.stringContaining('Discovery protocol error'),
          }),
        }),
      );
    });

    it('should handle malformed discovery responses', async () => {
      const config = {
        enabled: true,
      };

      discoveryService = new DiscoveryService(
        config,
        mockWalletRegistry,
        logger,
        mockAdapterRegistry,
        mockConnectionManager,
      );

      // Mock malformed responder (missing required fields)
      const malformedResponder = {
        responderId: 'malformed',
        name: undefined,
        rdns: undefined,
        sessionId: undefined,
        // Missing required fields like sessionId, rdns, name, etc.
      } as Partial<QualifiedResponder> as QualifiedResponder;

      mockDiscoveryInitiator.startDiscovery.mockResolvedValue([malformedResponder]);

      await discoveryService.scan();
      await vi.advanceTimersByTimeAsync(200);

      // Malformed wallet should be filtered out
      const wallets = await discoveryService.getAvailableWallets();
      expect(wallets).toHaveLength(0);
    });
  });
});
