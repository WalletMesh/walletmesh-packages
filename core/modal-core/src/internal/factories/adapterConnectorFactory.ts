/**
 * Adapter-based connector factory
 *
 * Creates wallet connectors using the new adapter system instead of the old strategy pattern.
 * This factory provides a compatibility layer for applications migrating from the old system.
 *
 * @module factories/adapterConnectorFactory
 * @internal
 */

import { ZodError } from 'zod';
import { walletInfoSchema } from '../../schemas/index.js';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { WalletRegistry } from '../registries/wallets/WalletRegistry.js';
// Removed WalletConnectorInterface import
import type { WalletAdapter } from '../wallets/base/WalletAdapter.js';
import { DebugWallet } from '../wallets/debug/DebugWallet.js';
import { EvmAdapter } from '../wallets/evm/EvmAdapter.js';
// Removed dependency on service factory

/**
 * Global wallet registry for adapter-based connectors
 */
let globalRegistry: WalletRegistry | null = null;

/**
 * Initialize the global wallet registry with built-in adapters
 */
function initializeGlobalRegistry(): WalletRegistry {
  if (globalRegistry) {
    return globalRegistry;
  }

  globalRegistry = new WalletRegistry();

  // Register built-in adapters
  globalRegistry.register(new EvmAdapter());

  // Register mock adapter for testing
  globalRegistry.register(new DebugWallet());

  return globalRegistry;
}

/**
 * Get the global wallet registry
 */
export function getWalletRegistry(): WalletRegistry {
  return initializeGlobalRegistry();
}

/**
 * Create a wallet connector using the adapter system
 *
 * This function provides compatibility with the old createConnector API
 * while using the new adapter system under the hood.
 *
 * @param walletInfo - Wallet information
 * @returns A wallet connector interface
 * @throws {ModalError} If wallet info is invalid or no suitable adapter found
 */
export function createConnector(walletInfo: WalletInfo): WalletAdapter {
  // Validate wallet info
  try {
    walletInfoSchema.parse(walletInfo);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ErrorFactory.configurationError('Invalid wallet configuration', {
        walletInfo,
        validationErrors: error.errors,
      });
    }
    throw error;
  }

  const registry = getWalletRegistry();

  // Find a suitable adapter for this wallet
  let suitableAdapter: WalletAdapter | null = null;

  // First, try to find an adapter by exact ID match
  const adapterById = registry.getAdapter(walletInfo.id);
  if (adapterById) {
    suitableAdapter = adapterById;
  } else {
    // Fallback: find an adapter that supports the wallet's chains
    const allAdapters = registry.getAllAdapters();
    for (const adapter of allAdapters) {
      // Check if adapter supports any of the wallet's chains
      const supportedChainTypes = adapter.capabilities.chains.map((chain) => chain.type);
      const hasCommonChain = walletInfo.chains.some((walletChain) =>
        supportedChainTypes.includes(walletChain),
      );

      if (hasCommonChain) {
        suitableAdapter = adapter;
        break;
      }
    }
  }

  if (!suitableAdapter) {
    throw ErrorFactory.walletNotFound(`No adapter found for wallet: ${walletInfo.id}`);
  }

  // Return the adapter directly
  return suitableAdapter;
}

/**
 * Check if a wallet is supported by any registered adapter
 *
 * @param walletInfo - Wallet information to check
 * @returns True if the wallet is supported
 */
export function isWalletSupported(walletInfo: WalletInfo): boolean {
  try {
    createConnector(walletInfo);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wallets that support a specific chain type
 *
 * @param wallets - List of all wallets
 * @param chainType - Chain type to filter by
 * @returns Wallets that support the specified chain
 */
export function getWalletsForChain(wallets: WalletInfo[], chainType: ChainType): WalletInfo[] {
  return wallets.filter((wallet) => wallet.chains.includes(chainType));
}

/**
 * Test utilities for adapter-based connectors
 */

/**
 * Configuration for test connectors
 */
export interface TestConnectorConfig {
  /** Test wallet ID */
  walletId?: string;
  /** Test wallet name */
  walletName?: string;
  /** Supported chain types */
  chainTypes?: ChainType[];
  /** Whether wallet should be available */
  isAvailable?: boolean;
}

/**
 * Create a test connector instance using the mock adapter
 *
 * @param config - Test configuration
 * @returns Test connector instance
 */
export function createTestConnector(config: TestConnectorConfig = {}): WalletAdapter {
  const testWallet: WalletInfo = {
    id: config.walletId || 'debug-wallet',
    name: config.walletName || 'Debug Wallet',
    icon: 'data:image/svg+xml,<svg></svg>',
    chains: config.chainTypes || [ChainType.Evm],
  };

  return createConnector(testWallet);
}

/**
 * Create a mock connector instance using the mock adapter
 *
 * @returns Mock connector instance
 */
export function createMockConnector(): WalletAdapter {
  const mockWallet: WalletInfo = {
    id: 'mock-wallet',
    name: 'Mock Wallet',
    icon: 'data:image/svg+xml,<svg></svg>',
    chains: [ChainType.Evm],
  };

  return createConnector(mockWallet);
}

/**
 * Register a custom adapter with the global registry
 *
 * @param adapter - Wallet adapter to register
 */
export function registerAdapter(adapter: WalletAdapter): void {
  const registry = getWalletRegistry();
  registry.register(adapter);
}

/**
 * Unregister an adapter from the global registry
 *
 * @param adapterId - ID of the adapter to unregister
 */
export function unregisterAdapter(adapterId: string): void {
  const registry = getWalletRegistry();
  registry.unregister(adapterId);
}

/**
 * Get all registered adapters
 *
 * @returns Array of all registered adapters
 */
export function getAllAdapters(): WalletAdapter[] {
  const registry = getWalletRegistry();
  return registry.getAllAdapters();
}

/**
 * Clear the global registry (for testing)
 */
export function clearRegistry(): void {
  globalRegistry = null;
}
