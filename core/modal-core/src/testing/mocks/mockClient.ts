/**
 * WalletMesh Client mocking utilities
 *
 * This module provides auto-mocked client implementations using Vitest's
 * mocking capabilities. Instead of manually implementing mock methods,
 * we create real client instances and auto-mock them, ensuring:
 *
 * - Type safety: Mocks automatically match real client interfaces
 * - Maintainability: No need to update mocks when client changes
 * - Flexibility: Easy to override specific behaviors for tests
 *
 * @example
 * ```typescript
 * // Create a simple mocked client
 * const mockClient = createAutoMockedWalletMeshClient();
 *
 * // Override specific behavior
 * mockClient.connect.mockResolvedValue({
 *   walletId: 'custom-wallet',
 *   address: '0xabc...',
 *   // ... other connection details
 * });
 *
 * // Use in tests
 * await mockClient.connect('metamask');
 * expect(mockClient.connect).toHaveBeenCalledWith('metamask');
 * ```
 *
 * @module testing/mocks/mockClient
 */

import { vi } from 'vitest';
import type { MockedObject } from 'vitest';

// Import REAL client implementation to auto-mock it
import { WalletMeshClient } from '../../internal/client/WalletMeshClientImpl.js';
import type { createWalletMeshClient } from '../../client/createWalletMeshClient.js';
import { ChainType } from '../../types.js';

// ServiceDependencies no longer exists - use specific dependency types as needed
import type { HeadlessModalState } from '../../api/core/headless.js';
// Import real types - no more duplicate interfaces!
import type { WalletMeshClientConfig } from '../../internal/client/WalletMeshClient.js';

// Import the preference service to auto-mock it
import { WalletPreferenceService } from '../../services/preferences/WalletPreferenceService.js';
import { createMockLogger } from '../index.js';
import { createMockedServiceRegistry } from './mockServices.js';
// Import our improved mock factories
import { createAutoMockedStore } from './mockStore.js';

/**
 * Create an auto-mocked WalletMeshClient instance
 *
 * This function creates a real client instance and then mocks all its methods,
 * providing sensible defaults while allowing easy customization.
 *
 * @param config - Optional partial client configuration
 * @returns Mocked client with all methods stubbed
 *
 * @example
 * ```typescript
 * const client = createAutoMockedWalletMeshClient({
 *   appName: 'Test DApp',
 *   chains: [{ id: '1', type: ChainType.Evm, name: 'Ethereum' }]
 * });
 *
 * // All methods are mocked with defaults
 * await client.connect(); // Returns mock connection
 * client.getServices(); // Returns mock services
 * ```
 */
export function createAutoMockedWalletMeshClient(
  config?: Partial<WalletMeshClientConfig>,
): MockedObject<WalletMeshClient> {
  // Create real client instance, then auto-mock it
  const clientConfig: WalletMeshClientConfig = {
    appName: 'Test App',
    ...config,
  };
  // Create mock dependencies for the client
  const realClient = new WalletMeshClient(
    clientConfig,
    // biome-ignore lint/suspicious/noExplicitAny: Mock client requires flexible registry
    {} as any, // registry
    // biome-ignore lint/suspicious/noExplicitAny: Mock client requires flexible logger
    {} as any, // logger
  );
  const mockedClient = vi.mocked(realClient, { deep: true });

  // Set up realistic default behaviors
  mockedClient.connect.mockResolvedValue({
    walletId: 'mock-wallet',
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
    walletInfo: {
      id: 'mock-wallet',
      name: 'Mock Wallet',
      icon: '',
      chains: [ChainType.Evm],
    },
    metadata: {
      connectedAt: Date.now(),
      lastActiveAt: Date.now(),
      source: 'test',
    },
  });

  mockedClient.disconnect.mockResolvedValue(undefined);

  mockedClient.getWallet.mockReturnValue(undefined);

  // Add missing getServices method using the proper service registry mock
  const mockServices = createMockedServiceRegistry();
  // Add the missing preferences service using auto-mocking
  const mockLogger = createMockLogger();
  const mockPreferenceService = vi.mocked(new WalletPreferenceService({ logger: mockLogger }), {
    deep: true,
  });
  const enhancedServices = {
    connection: mockServices.connection,
    session: mockServices.session,
    health: mockServices.health,
    ui: mockServices.ui,
    preference: mockPreferenceService,
    chain: mockServices.chain,
    transaction: mockServices.transaction,
    balance: mockServices.balance,
    dappRpc: mockServices.dappRpc,
  };
  mockedClient.getServices.mockReturnValue(enhancedServices);

  // Add missing subscribe method (for state subscriptions)
  mockedClient.subscribe.mockImplementation((_callback: (state: HeadlessModalState) => void) => {
    // Return unsubscribe function
    return () => {};
  });

  Object.defineProperty(mockedClient, 'isConnected', {
    value: false,
    writable: true,
  });
  // Note: getActiveSession method doesn't exist on WalletMeshClient

  return mockedClient;
}

/**
 * IMPROVED: Auto-mock the client factory function
 * This mocks the factory while preserving the real client interface
 */
export function createMockedClientFactory(): typeof createWalletMeshClient {
  // biome-ignore lint/suspicious/noExplicitAny: Factory function return type needs flexible casting
  return vi.fn().mockImplementation((config) => createAutoMockedWalletMeshClient(config)) as any;
}

/**
 * Create a mock client with integrated services and store
 *
 * This provides a complete testing environment with mocked client,
 * services, and state store all wired together. Useful for integration
 * tests that need to verify interactions between components.
 *
 * @param config - Configuration options
 * @param config.clientConfig - Client configuration overrides
 * @param config.serviceOverrides - Service mock overrides
 * @param config.storeOverrides - Store state overrides
 * @returns Fully integrated mock client
 *
 * @example
 * ```typescript
 * const client = createIntegratedMockClient({
 *   clientConfig: { appName: 'Integration Test' },
 *   storeOverrides: {
 *     connection: { status: 'connected' }
 *   }
 * });
 *
 * // Services and store are wired up
 * const services = client.getServices();
 * await services.connection.validateConnectionParams();
 * ```
 */
export function createIntegratedMockClient(config?: {
  clientConfig?: Partial<WalletMeshClientConfig>;
  serviceOverrides?: Record<string, unknown>;
  storeOverrides?: Record<string, unknown>;
}): MockedObject<WalletMeshClient> {
  const client = createAutoMockedWalletMeshClient(config?.clientConfig);

  // Attach mocked services (if the real client has them)
  const services = createMockedServiceRegistry();
  const store = createAutoMockedStore(config?.storeOverrides);

  // Wire up the mocked dependencies
  // biome-ignore lint/suspicious/noExplicitAny: Internal client properties need dynamic assignment
  (client as any).services = services;
  // biome-ignore lint/suspicious/noExplicitAny: Internal client properties need dynamic assignment
  (client as any).store = store;

  return client;
}

export function setupClientModuleMocks() {
  // Auto-mock the client module
  vi.mock('../../client/WalletMeshClient.js', () => ({
    WalletMeshClient: vi.fn(() => createAutoMockedWalletMeshClient()),
  }));

  // Auto-mock the client factory
  vi.mock('../../client/createWalletMeshClient.js', () => ({
    createWalletMeshClient: createMockedClientFactory(),
  }));
}

/**
 * IMPROVED: Client spy mode for integration testing
 * This keeps real functionality but adds spy capabilities
 */
export function createSpiedWalletMeshClient(
  config?: Partial<WalletMeshClientConfig>,
): MockedObject<WalletMeshClient> {
  const clientConfig: WalletMeshClientConfig = {
    appName: 'Test App',
    ...config,
  };
  const client = new WalletMeshClient(
    clientConfig,
    // biome-ignore lint/suspicious/noExplicitAny: Spy client requires flexible registry
    {} as any, // registry
    // biome-ignore lint/suspicious/noExplicitAny: Spy client requires flexible logger
    {} as any, // logger
  );

  // Spy on all public methods
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(
    (name) => typeof client[name as keyof WalletMeshClient] === 'function' && name !== 'constructor',
  );

  for (const methodName of methodNames) {
    // biome-ignore lint/suspicious/noExplicitAny: Spy methods need dynamic access to client methods
    vi.spyOn(client as any, methodName);
  }

  return client as MockedObject<WalletMeshClient>;
}

/**
 * IMPROVED: Preset client configurations for common test scenarios
 */
export const clientPresets = {
  /**
   * Disconnected client for testing connection flows
   */
  disconnected: () => {
    const client = createAutoMockedWalletMeshClient();
    Object.defineProperty(client, 'isConnected', {
      value: false,
      writable: true,
    });
    // Note: getActiveSession method doesn't exist on WalletMeshClient
    return client;
  },

  /**
   * Connected client for testing connected state
   */
  connected: () => {
    const client = createAutoMockedWalletMeshClient();
    Object.defineProperty(client, 'isConnected', {
      value: true,
      writable: true,
    });
    // Note: getActiveSession method doesn't exist on WalletMeshClient
    // Mock session data would be stored in the unified store instead
    return client;
  },

  /**
   * Client with multiple wallets available
   */
  multiWallet: () => {
    const client = createAutoMockedWalletMeshClient();
    client.getWallet.mockReturnValue(undefined);
    return client;
  },

  /**
   * Client that simulates errors for testing error handling
   */
  errorProne: () => {
    const client = createAutoMockedWalletMeshClient();
    client.connect.mockRejectedValue(new Error('Connection failed'));
    client.disconnect.mockRejectedValue(new Error('Disconnect failed'));
    return client;
  },
};

// Export factories for different use cases
export const clientMockFactories = {
  basic: createAutoMockedWalletMeshClient,
  integrated: createIntegratedMockClient,
  spied: createSpiedWalletMeshClient,
  factory: createMockedClientFactory,
  presets: clientPresets,
};

// Alias for compatibility with existing tests
export { createAutoMockedWalletMeshClient as createMockWalletMeshClient };
