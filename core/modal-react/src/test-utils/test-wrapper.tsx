/**
 * Simplified test wrapper using the new mock infrastructure
 *
 * Provides a clean, efficient wrapper for testing React components
 * and hooks with WalletMesh functionality.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChainType } from '@walletmesh/modal-core';
import type { ReactNode } from 'react';
import { WalletMeshProvider } from '../WalletMeshProvider.js';
import type { WalletMeshReactConfig } from '../types.js';
import { MockWalletMeshClient, WalletScenarios } from './mock-infrastructure.js';

/**
 * Test wrapper configuration
 */
export interface TestWrapperConfig {
  // Initial wallet scenario
  scenario?: keyof typeof WalletScenarios;
  // Custom client instance
  client?: MockWalletMeshClient;
  // Provider config overrides
  config?: Partial<WalletMeshReactConfig>;
  // Enable debug logging
  debug?: boolean;
}

/**
 * Create a test wrapper with mock client
 */
export function createTestWrapper(options: TestWrapperConfig = {}) {
  const { scenario = 'disconnected', client: providedClient, config = {} } = options;

  // Create or use provided client
  const mockClient = providedClient || new MockWalletMeshClient();

  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  // Set initial scenario if not using provided client
  if (!providedClient && scenario) {
    mockClient.setScenario(WalletScenarios[scenario]);
  }

  // Default test config
  const defaultConfig: WalletMeshReactConfig = {
    appName: 'Test App',
    chains: [
      {
        chainId: '0x1',
        chainType: ChainType.Evm,
        name: 'Ethereum Mainnet',
        required: true,
      },
      {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
        required: true,
      },
    ],
    wallets: [], // Tests will provide their own wallets if needed
    theme: {
      mode: 'light',
    },
    ...config,
  };

  // Wrapper component
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WalletMeshProvider config={defaultConfig}>{children}</WalletMeshProvider>
    </QueryClientProvider>
  );

  // Cleanup function
  const cleanup = () => {
    mockClient.disconnect.mockClear();
    mockClient.connect.mockClear();
    mockClient.sendTransaction.mockClear();
    mockClient.switchChain.mockClear();
    mockClient.getBalance.mockClear();
    mockClient.on.mockClear();
    mockClient.emit.mockClear();
    mockClient.subscribe.mockClear();
    queryClient.clear();
  };

  return {
    wrapper,
    client: mockClient,
    config: defaultConfig,
    cleanup,
  };
}

/**
 * Setup a disconnected test scenario
 */
export function setupDisconnectedTest(config?: Partial<WalletMeshReactConfig>) {
  return createTestWrapper({
    scenario: 'disconnected',
    ...(config && { config }),
  });
}

/**
 * Setup a connected test scenario
 */
export function setupConnectedTest(config?: Partial<WalletMeshReactConfig>) {
  return createTestWrapper({
    scenario: 'connectedEvm',
    ...(config && { config }),
  });
}

/**
 * Setup a test with connection error
 */
export function setupErrorTest(config?: Partial<WalletMeshReactConfig>) {
  return createTestWrapper({
    scenario: 'errorState',
    ...(config && { config }),
  });
}

/**
 * Setup a multi-chain test scenario
 */
export function setupMultiChainTest(config?: Partial<WalletMeshReactConfig>) {
  return createTestWrapper({
    scenario: 'multiChain',
    ...(config && { config }),
  });
}
