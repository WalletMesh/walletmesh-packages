/**
 * Simple mock client for basic testing needs
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { vi } from 'vitest';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import type { ErrorHandler } from '../../internal/core/errors/errorHandler.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import type { WalletAdapter } from '../../internal/wallets/base/WalletAdapter.js';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';

/**
 * Create a minimal mock client with just the methods tests use
 */
export function createMockClient() {
  return {
    connect: vi.fn().mockResolvedValue({
      walletId: 'mock-wallet',
      address: '0x1234567890123456789012345678901234567890',
      accounts: ['0x1234567890123456789012345678901234567890'],
      chainId: '0x1',
      chainType: ChainType.Evm,
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getWallet: vi.fn().mockReturnValue(null),
    isConnected: false,
    sessions: [], // Add sessions property
    subscribe: vi.fn(() => () => {}), // Return unsubscribe function
    getServices: vi.fn().mockReturnValue({
      balance: {
        getBalance: vi.fn().mockResolvedValue({ value: '1000000000000000000', formatted: '1.0' }),
      },
      transaction: {
        sendTransaction: vi.fn().mockResolvedValue({ hash: '0x123...' }),
      },
      chain: {
        switchChain: vi.fn().mockResolvedValue({ success: true }),
      },
    }),
  };
}

/**
 * Create a mock logger for testing
 */
export function createMockLogger(): Logger {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    dispose: vi.fn(),
    isDebugEnabled: false,
    log: vi.fn(),
    sanitizeData: vi.fn((data) => data),
    prefix: 'test',
  };
  const logger: unknown = mockLogger;
  return logger as Logger;
}

/**
 * Create a mock wallet registry for testing
 */
export function createMockRegistry(): WalletRegistry {
  const mockRegistry = {
    register: vi.fn(),
    detectAvailableAdapters: vi.fn().mockResolvedValue([]),
    getAdapter: vi.fn().mockReturnValue(undefined),
    getAllAdapters: vi.fn().mockReturnValue([]),
    clear: vi.fn(),
    registerDiscoveredWallet: vi.fn(),
    getDiscoveredWallet: vi.fn(),
    getAllDiscoveredWallets: vi.fn().mockReturnValue([]),
    hasDiscoveredWallet: vi.fn().mockReturnValue(false),
    removeDiscoveredWallet: vi.fn(),
    clearDiscoveredWallets: vi.fn(),
  };
  const registry: unknown = mockRegistry;
  return registry as WalletRegistry;
}

/**
 * Create a mock modal controller for testing
 */
export function createMockModal() {
  return {
    open: vi.fn(),
    close: vi.fn(),
    getState: vi.fn().mockReturnValue({
      connection: { state: 'idle' },
      wallets: [],
      isOpen: false,
    }),
    subscribe: vi.fn(() => () => {}),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    cleanup: vi.fn(),
  };
}

/**
 * Create a mock error handler for testing
 */
export function createMockErrorHandler(): ErrorHandler {
  const mockErrorHandler = {
    handleError: vi.fn().mockReturnValue({
      code: 'ERROR_CODE',
      message: 'Error message',
      category: 'general',
      fatal: false,
    }),
    isFatal: vi.fn().mockReturnValue(false),
    getUserMessage: vi.fn().mockReturnValue('User friendly message'),
    logError: vi.fn(),
    dispose: vi.fn(),
  };
  const errorHandler: unknown = mockErrorHandler;
  return errorHandler as ErrorHandler;
}

/**
 * Create a mock wallet adapter for testing
 */
export function createMockWalletAdapter(
  id: string,
  optionsOrChainTypes?:
    | {
        name?: string;
        chains?: Array<{ type: ChainType; chainIds?: string[] | '*' }>;
        features?: string[];
      }
    | ChainType[],
): WalletAdapter {
  // Handle backward compatibility - if second param is array, it's chainTypes
  const options = Array.isArray(optionsOrChainTypes)
    ? { chains: optionsOrChainTypes.map((type) => ({ type, chainIds: '*' as const })) }
    : optionsOrChainTypes || {};
  return {
    id,
    metadata: {
      name: options.name || `Test Wallet ${id}`,
      icon: 'data:image/svg+xml,<svg></svg>',
      description: 'Test wallet adapter',
    },
    capabilities: {
      chains: options.chains || [{ type: ChainType.Evm, chainIds: '*' }],
      features: new Set(options.features || ['sign_message']),
    },
    supportedProviders: {},
    state: {
      status: 'disconnected',
      connection: null,
      error: null,
      accounts: [],
      isConnected: false,
      isConnecting: false,
      address: null,
      chain: null,
      chainType: null,
    },
    connection: null,
    install: vi.fn().mockResolvedValue(undefined),
    uninstall: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue({
      address: '0x1234567890123456789012345678901234567890',
      accounts: ['0x1234567890123456789012345678901234567890'],
      chain: {
        chainId: '0x1',
        chainType: ChainType.Evm,
        name: 'Ethereum Mainnet',
        required: false,
      },
      chainType: ChainType.Evm,
      provider: {},
      walletId: id,
      walletInfo: {
        id,
        name: options.name || `Test Wallet ${id}`,
        icon: 'data:image/svg+xml,<svg></svg>',
        chains: [ChainType.Evm],
      },
      metadata: { connectedAt: Date.now(), lastActiveAt: Date.now() },
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getProvider: vi.fn().mockReturnValue({}),
    hasProvider: vi.fn().mockReturnValue(true),
    on: vi.fn().mockReturnValue(() => {}),
    once: vi.fn().mockReturnValue(() => {}),
    off: vi.fn(),
    detect: vi.fn().mockResolvedValue({ available: true }),
  } as WalletAdapter;
}

/**
 * Create a mock EVM provider for testing that implements the complete BlockchainProvider interface
 */
export function createMockEvmProvider(responses: Record<string, unknown> = {}) {
  const mockAccounts = ['0x1234567890123456789012345678901234567890'];
  let connected = true;
  let currentChainId = '0x1';

  // Event listener management
  const eventListeners = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    // BlockchainProvider interface implementation
    connected,

    getAccounts: vi.fn().mockResolvedValue(mockAccounts),

    getChainId: vi.fn().mockResolvedValue(currentChainId),

    disconnect: vi.fn().mockImplementation(async () => {
      connected = false;
    }),

    on: vi.fn().mockImplementation((event: string, listener: (...args: unknown[]) => void) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event)?.push(listener);
    }),

    off: vi.fn().mockImplementation((event: string, listener: (...args: unknown[]) => void) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),

    removeAllListeners: vi.fn().mockImplementation((event?: string) => {
      if (event) {
        eventListeners.delete(event);
      } else {
        eventListeners.clear();
      }
    }),

    request: vi.fn().mockImplementation(async ({ method, params }) => {
      if (responses[method]) {
        if (responses[method] instanceof Error) {
          throw responses[method];
        }
        // If the response is a function, call it with params
        if (typeof responses[method] === 'function') {
          return (responses[method] as (params: unknown[]) => unknown)(params);
        }
        return responses[method];
      }

      // Default responses
      switch (method) {
        case 'eth_accounts':
          return mockAccounts;
        case 'eth_requestAccounts':
          return mockAccounts;
        case 'eth_getBalance':
          return '0xde0b6b3a7640000'; // 1 ETH in hex
        case 'wallet_switchEthereumChain':
          if (Array.isArray(params) && params[0] && typeof params[0] === 'object' && 'chainId' in params[0]) {
            currentChainId = (params[0] as { chainId: string }).chainId;
          }
          return null; // Success
        case 'wallet_addEthereumChain':
          return null; // Success
        case 'eth_chainId':
          return currentChainId;
        case 'eth_call':
          // Check if it's a balanceOf call
          if (params && Array.isArray(params) && params[0]?.data?.startsWith('0x70a08231')) {
            return '0x1bc16d674ec80000'; // 2 ETH in hex
          }
          // Check if it's a symbol call
          if (params && Array.isArray(params) && params[0]?.data === '0x95d89b41') {
            // Return encoded "USDC" string
            return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000455534443000000000000000000000000000000000000000000000000000000';
          }
          // Check if it's a decimals call
          if (params && Array.isArray(params) && params[0]?.data === '0x313ce567') {
            return '0x0000000000000000000000000000000000000000000000000000000000000006'; // 6 decimals
          }
          // Check if it's a name call
          if (params && Array.isArray(params) && params[0]?.data === '0x06fdde03') {
            // Return encoded "USD Coin" string
            return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436F696E0000000000000000000000000000000000000000000000';
          }
          return '0x0';
        default:
          return null;
      }
    }),

    // Test helper methods to control state
    mockSetConnected: (value: boolean) => {
      connected = value;
    },
    mockSetChainId: (chainId: string) => {
      currentChainId = chainId;
    },
    mockSetAccounts: (accounts: string[]) => {
      mockAccounts.length = 0;
      mockAccounts.push(...accounts);
    },
    mockEmitEvent: (event: string, ...args: unknown[]) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        for (const listener of listeners) {
          listener(...args);
        }
      }
    },
  };
}

/**
 * Create a mock Solana provider for testing that implements the complete BlockchainProvider interface
 */
export function createMockSolanaProvider(balance = 1000000000) {
  const mockPublicKey = 'mock-pubkey';
  const mockAccounts = [mockPublicKey];
  let connected = false;
  let currentChainId = 'mainnet-beta';

  // Event listener management
  const eventListeners = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    // BlockchainProvider interface implementation
    connected,

    getAccounts: vi.fn().mockResolvedValue(mockAccounts),

    getChainId: vi.fn().mockResolvedValue(currentChainId),

    disconnect: vi.fn().mockImplementation(async () => {
      connected = false;
    }),

    on: vi.fn().mockImplementation((event: string, listener: (...args: unknown[]) => void) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event)?.push(listener);
    }),

    off: vi.fn().mockImplementation((event: string, listener: (...args: unknown[]) => void) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),

    removeAllListeners: vi.fn().mockImplementation((event?: string) => {
      if (event) {
        eventListeners.delete(event);
      } else {
        eventListeners.clear();
      }
    }),

    request: vi.fn().mockImplementation(async ({ method }) => {
      // Default Solana provider responses
      switch (method) {
        case 'connect':
          connected = true;
          return { publicKey: mockPublicKey };
        case 'disconnect':
          connected = false;
          return null;
        case 'signTransaction':
          if (!connected) throw new Error('Not connected');
          return { signature: Buffer.from('mock-signature-'.padEnd(64, '0')) };
        case 'signMessage':
          if (!connected) throw new Error('Not connected');
          return {
            signature: Buffer.from('mock-message-signature-'.padEnd(64, '0')),
            publicKey: mockPublicKey,
          };
        case 'getBalance':
          return balance;
        default:
          return null;
      }
    }),

    // Solana-specific properties for backward compatibility
    connection: {
      getBalance: vi.fn().mockResolvedValue(balance),
    },
    publicKey: mockPublicKey,

    // Solana wallet standard methods
    connect: vi.fn().mockImplementation(async () => {
      connected = true;
      return { publicKey: mockPublicKey };
    }),

    signTransaction: vi.fn().mockImplementation(async (transaction) => {
      if (!connected) throw new Error('Not connected');
      return {
        ...transaction,
        signature: Buffer.from('mock-signature-'.padEnd(64, '0')),
      };
    }),

    signMessage: vi.fn().mockImplementation(async (_message) => {
      if (!connected) throw new Error('Not connected');
      return {
        signature: Buffer.from('mock-message-signature-'.padEnd(64, '0')),
        publicKey: mockPublicKey,
      };
    }),

    // Test helper methods to control state
    mockSetConnected: (value: boolean) => {
      connected = value;
    },
    mockSetChainId: (chainId: string) => {
      currentChainId = chainId;
    },
    mockSetPublicKey: (publicKey: string) => {
      mockAccounts[0] = publicKey;
    },
    mockEmitEvent: (event: string, ...args: unknown[]) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        for (const listener of listeners) {
          listener(...args);
        }
      }
    },
  };
}

/**
 * Create a mock JSON-RPC transport for testing
 */
export function createMockJSONRPCTransport(): JSONRPCTransport & {
  request?: ReturnType<typeof vi.fn>;
  sendBatch?: ReturnType<typeof vi.fn>;
  close?: ReturnType<typeof vi.fn>;
} {
  return {
    send: vi.fn(),
    sendBatch: vi.fn(),
    close: vi.fn(),
    onMessage: vi.fn(),
    // Add request method to prevent wrapping in TransportToJsonrpcAdapter
    request: vi.fn(),
  };
}

/**
 * Create a mock JSON-RPC Node for testing
 */
export function createMockJSONRPCNode() {
  return {
    callMethod: vi.fn(),
    publishEvent: vi.fn(),
    setContext: vi.fn(),
    on: vi.fn().mockReturnValue(() => {}), // Return cleanup function
    once: vi.fn(),
    removeListener: vi.fn(),
    destroy: vi.fn(),
    context: {},
  };
}

/**
 * Create mock service dependencies for testing
 * Generic function that works with all service dependency types
 */
export function createMockServiceDependencies<T extends Record<string, unknown> = { logger: Logger }>(
  overrides: Partial<T> = {},
): T {
  const base = {
    logger: createMockLogger(),
  };
  const merged: unknown = {
    ...base,
    ...overrides,
  };
  return merged as T;
}

/**
 * Create mock wallet info for testing
 */
export function createMockWalletInfo(
  id = 'mock-wallet',
  options: {
    name?: string;
    chains?: ChainType[];
    icon?: string;
    features?: string[];
    version?: string;
  } = {},
): WalletInfo {
  return {
    id,
    name: options.name || 'Mock Wallet',
    icon: options.icon || 'data:image/svg+xml,<svg></svg>',
    chains: options.chains || [ChainType.Evm],
    ...(options.features && { features: options.features }),
    ...(options.version && { version: options.version }),
  };
}

/**
 * Create a mock transport for testing
 */
export function createMockTransport() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(false),
    on: vi.fn().mockReturnValue(() => {}), // Return unsubscribe function
    off: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Create a mock session state for testing
 */
export function createMockSessionState(overrides: Record<string, unknown> = {}) {
  return {
    sessionId: 'session_test_123',
    walletId: 'mock-wallet',
    addresses: ['0x1234567890123456789012345678901234567890'],
    primaryAddress: '0x1234567890123456789012345678901234567890',
    chain: {
      chainId: '0x1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
    },
    status: ConnectionStatus.Connected,
    activeAccount: {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Account 1',
      index: 0,
    },
    accounts: [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'Account 1',
        index: 0,
        isDefault: true,
      },
    ],
    lifecycle: {
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      lastAccessedAt: Date.now(),
      operationCount: 0,
    },
    metadata: {
      appName: 'Test App',
      connectedAt: Date.now(),
    },
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction'],
      events: ['accountsChanged', 'chainChanged'],
    },
    providerMetadata: {
      type: 'injected',
      version: '1.0.0',
      multiChainCapable: true,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    ...overrides,
  };
}

/**
 * Create a mock popup window for testing
 */
export function createMockPopupWindow() {
  return {
    closed: false,
    close: vi.fn(),
    focus: vi.fn(),
    postMessage: vi.fn(),
  } as Partial<Window>;
}

/**
 * Create a mock DOM window for testing
 */
export function createMockWindow() {
  const mockPopup = createMockPopupWindow();
  return {
    open: vi.fn().mockReturnValue(mockPopup),
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: { origin: 'https://app.example.com' },
    innerWidth: 1024,
    innerHeight: 768,
  };
}

/**
 * Create a mock event emitter for testing
 */
export function createMockEventEmitter() {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)?.push(handler);
      return () => {
        const handlers = listeners.get(event);
        if (handlers) {
          const index = handlers.indexOf(handler);
          if (index > -1) handlers.splice(index, 1);
        }
      };
    }),
    once: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      const wrappedHandler = (...args: unknown[]) => {
        handler(...args);
        const handlers = listeners.get(event);
        if (handlers) {
          const index = handlers.indexOf(wrappedHandler);
          if (index > -1) handlers.splice(index, 1);
        }
      };
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)?.push(wrappedHandler);
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      const handlers = listeners.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    }),
    emit: vi.fn((event: string, ...args: unknown[]) => {
      const handlers = listeners.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(...args);
        }
      }
      return true;
    }),
    removeAllListeners: vi.fn(() => {
      listeners.clear();
    }),
  };
}

/**
 * Create a mock resource manager for testing
 */
export function createMockResourceManager() {
  return {
    register: vi.fn(),
    unregister: vi.fn(),
    cleanup: vi.fn(),
    dispose: vi.fn(),
    getResource: vi.fn(),
    hasResource: vi.fn(),
  };
}

/**
 * Create a mock state manager for testing
 */
export function createMockStateManager() {
  return {
    getState: vi.fn().mockReturnValue({}),
    setState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    reset: vi.fn(),
  };
}

/**
 * Create a mock modal controller for testing
 */
export function createMockModalController() {
  return {
    open: vi.fn(),
    close: vi.fn(),
    setView: vi.fn(),
    getState: vi.fn().mockReturnValue({
      isOpen: false,
      currentView: 'walletSelection',
      isLoading: false,
      error: undefined,
    }),
    onStateChange: vi.fn(() => () => {}),
    cleanup: vi.fn(),
    getActions: vi.fn().mockReturnValue({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      setView: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
    }),
  };
}

/**
 * Create a composite mock for complete wallet connection scenario
 */
export function createMockConnectionScenario(options?: {
  walletId?: string;
  chainType?: ChainType;
  connectionDelay?: number;
  shouldFail?: boolean;
}) {
  const config = {
    walletId: options?.walletId || 'mock-wallet',
    chainType: options?.chainType || ChainType.Evm,
    connectionDelay: options?.connectionDelay || 0,
    shouldFail: options?.shouldFail || false,
  };

  const wallet = createMockWalletAdapter(config.walletId, {
    chains: [{ type: config.chainType, chainIds: '*' }],
  });

  const provider =
    config.chainType === ChainType.Solana ? createMockSolanaProvider() : createMockEvmProvider();

  const session = createMockSessionState({
    walletId: wallet.id,
    chain: {
      chainId: config.chainType === ChainType.Solana ? 'mainnet-beta' : '0x1',
      chainType: config.chainType,
      name: config.chainType === ChainType.Solana ? 'Solana Mainnet' : 'Ethereum Mainnet',
    },
  });

  // Configure connection behavior
  if (config.shouldFail) {
    wallet.connect = vi.fn().mockRejectedValue(new Error('Connection failed'));
  } else if (config.connectionDelay > 0) {
    wallet.connect = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, config.connectionDelay));
      return {
        address: session.primaryAddress,
        accounts: session.addresses,
        chainId: session.chain.chainId,
        chainType: session.chain.chainType,
        provider,
        walletId: wallet.id,
        walletInfo: wallet.metadata,
      };
    });
  }

  return { wallet, provider, session };
}

/**
 * Mock validation utilities for common test assertions
 */
export const mockValidation = {
  expectWalletConnected(wallet: ReturnType<typeof createMockWalletAdapter>) {
    expect(wallet.connect).toHaveBeenCalled();
    expect(wallet.state.isConnected).toBe(true);
  },

  expectProviderMethod(provider: unknown, method: string, params?: unknown) {
    expect((provider as { request: unknown }).request).toHaveBeenCalledWith({
      method,
      params: params || expect.anything(),
    });
  },

  expectErrorHandled(errorHandler: ReturnType<typeof createMockErrorHandler>, category: string) {
    expect(errorHandler.handleError).toHaveBeenCalledWith(expect.objectContaining({ category }));
  },

  expectSessionCreated(session: ReturnType<typeof createMockSessionState>, walletId: string) {
    expect(session.walletId).toBe(walletId);
    expect(session.status).toBe(ConnectionStatus.Connected);
    expect(session.primaryAddress).toBeDefined();
  },

  expectModalOpened(modal: ReturnType<typeof createMockModalController>) {
    expect(modal.open).toHaveBeenCalled();
  },

  expectModalClosed(modal: ReturnType<typeof createMockModalController>) {
    expect(modal.close).toHaveBeenCalled();
  },
};

/**
 * Type-safe mock factory using Vitest
 * Creates a mock object with all methods automatically mocked
 */
export function createTypedMock<T extends object>(partial?: Partial<T>): T {
  const mockTarget = {} as Record<string | symbol, unknown>;

  // Create a proxy that automatically generates vi.fn() for methods
  return new Proxy(mockTarget, {
    get(_target, prop) {
      // Return partial value if provided
      if (partial && prop in partial) {
        return partial[prop as keyof T];
      }

      // If property doesn't exist yet, create it
      if (!(prop in mockTarget)) {
        // For string properties (method names), create vi.fn()
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          mockTarget[prop] = vi.fn();
        }
      }

      return mockTarget[prop];
    },

    has(_target, prop) {
      return partial ? prop in partial : true;
    },
  }) as T;
}

/**
 * Create a mock framework adapter for testing
 */
export function createMockFrameworkAdapter() {
  return {
    render: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    getContainer: vi.fn().mockReturnValue(null),
    isRendered: vi.fn().mockReturnValue(false),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock WalletPreferenceService for testing
 */
export function createMockWalletPreferenceService() {
  const preferences = new Map<string, unknown>();

  return {
    getPreference: vi.fn((key: string) => preferences.get(key)),
    setPreference: vi.fn((key: string, value: unknown) => {
      preferences.set(key, value);
    }),
    clearPreferences: vi.fn(() => preferences.clear()),
    getLastUsedWallet: vi.fn().mockReturnValue(null),
    setLastUsedWallet: vi.fn(),
    getPreferredChains: vi.fn().mockReturnValue([]),
    setPreferredChains: vi.fn(),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock DAppRpcService for testing
 */
export function createMockDAppRpcService() {
  return {
    sendRequest: vi.fn().mockResolvedValue({ result: 'success' }),
    handleRequest: vi.fn().mockResolvedValue({ result: 'handled' }),
    registerHandler: vi.fn(),
    unregisterHandler: vi.fn(),
    isMethodSupported: vi.fn().mockReturnValue(true),
    getSupportedMethods: vi.fn().mockReturnValue(['eth_accounts', 'eth_sendTransaction']),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock ServiceRegistry for testing
 */
export function createMockServiceRegistry() {
  const services = new Map<string, unknown>();

  return {
    register: vi.fn((name: string, service: unknown) => {
      services.set(name, service);
    }),
    get: vi.fn((name: string) => services.get(name)),
    has: vi.fn((name: string) => services.has(name)),
    getAll: vi.fn(() => Array.from(services.values())),
    getServices: vi.fn().mockReturnValue({
      connectionService: createMockConnectionScenario(),
      chainService: createMockServiceDependencies(),
      transactionService: createMockServiceDependencies(),
      balanceService: createMockServiceDependencies(),
      walletPreferenceService: createMockWalletPreferenceService(),
      dAppRpcService: createMockDAppRpcService(),
    }),
    dispose: vi.fn(() => services.clear()),
  };
}

/**
 * Create a mock SessionManager for testing
 */
export function createMockSessionManager() {
  const sessions = new Map<string, unknown>();

  return {
    createSession: vi.fn().mockImplementation((id: string) => {
      const session = {
        sessionId: id,
        walletId: 'mock-wallet',
        chainId: '0x1',
        chainType: ChainType.Evm,
        addresses: ['0x1234567890123456789012345678901234567890'],
        primaryAddress: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        isActive: true,
      };
      sessions.set(id, session);
      return session;
    }),
    getSession: vi.fn((id: string) => sessions.get(id)),
    updateSession: vi.fn((id: string, updates: Record<string, unknown>) => {
      const session = sessions.get(id);
      if (session) {
        Object.assign(session, updates);
      }
      return session;
    }),
    deleteSession: vi.fn((id: string) => sessions.delete(id)),
    getAllSessions: vi.fn(() => Array.from(sessions.values())),
    getActiveSession: vi.fn().mockReturnValue(null),
    dispose: vi.fn(() => sessions.clear()),
  };
}

/**
 * Create a mock ConnectionManager for testing
 */
export function createMockConnectionManager() {
  return {
    connect: vi.fn().mockResolvedValue({
      success: true,
      walletId: 'mock-wallet',
      address: '0x1234567890123456789012345678901234567890',
      chainId: '0x1',
    }),
    disconnect: vi.fn().mockResolvedValue({ success: true }),
    isConnected: vi.fn().mockReturnValue(false),
    getConnectionInfo: vi.fn().mockReturnValue(null),
    validateConnection: vi.fn().mockResolvedValue(true),
    handleConnectionError: vi.fn(),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock ChromeExtensionTransport for testing
 */
export function createMockChromeExtensionTransport() {
  return {
    ...createMockTransport(),
    extensionId: 'mock-extension-id',
    sendToExtension: vi.fn().mockResolvedValue({ success: true }),
    onExtensionMessage: vi.fn(),
    checkExtensionInstalled: vi.fn().mockResolvedValue(true),
  };
}

/**
 * Create a mock PopupWindowTransport for testing
 */
export function createMockPopupWindowTransport() {
  const mockWindow = createMockPopupWindow();
  return {
    ...createMockTransport(),
    window: mockWindow,
    openPopup: vi.fn().mockReturnValue(mockWindow),
    closePopup: vi.fn(),
    sendToPopup: vi.fn(),
    onPopupMessage: vi.fn(),
  };
}

// Re-export service mock functions from mockServices.ts for convenience
export {
  createAutoMockedTransactionService,
  createAutoMockedBalanceService,
  createAutoMockedChainService,
  createAutoMockedConnectionService,
  createAutoMockedDiscoveryService,
  createAutoMockedConnectionUIService,
  createAutoMockedEventMappingService,
} from '../mocks/mockServices.js';
