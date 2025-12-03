/**
 * Wallet Adapter Registry API
 *
 * Public API for registering custom wallet adapters that can be used
 * when wallets are discovered through the discovery protocol.
 *
 * @module api/adapters/registry
 * @public
 */

import { globalAdapterRegistry } from '../../internal/registry/WalletAdapterRegistry.js';
import type { WalletAdapterConstructor } from '../../internal/registry/WalletAdapterRegistry.js';

// Re-export the constructor type for consumers
export type { WalletAdapterConstructor };

/**
 * Register a custom wallet adapter implementation.
 *
 * This allows wallets discovered through the discovery protocol to use
 * custom adapter implementations instead of the generic DiscoveryAdapter.
 *
 * @param name - The adapter name (as specified in discovery transportConfig.walletAdapter)
 * @param adapter - The adapter constructor class
 * @param options - Optional registration options
 *
 * @example
 * ```typescript
 * import { registerWalletAdapter } from '@walletmesh/modal-core';
 * import { MetaMaskAdapter } from './adapters/MetaMaskAdapter.js';
 *
 * // Register a custom adapter
 * registerWalletAdapter('MetaMaskAdapter', MetaMaskAdapter);
 *
 * // Register with validation
 * registerWalletAdapter('PhantomAdapter', PhantomAdapter, {
 *   validateConfig: (config) => {
 *     return config && typeof config === 'object' && 'network' in config;
 *   },
 *   description: 'Phantom wallet adapter with Solana support'
 * });
 * ```
 *
 * @public
 */
export function registerWalletAdapter(
  name: string,
  adapter: WalletAdapterConstructor,
  options?: {
    validateConfig?: (config: unknown) => boolean;
    description?: string;
  },
): void {
  globalAdapterRegistry.register(name, adapter, options);
}

/**
 * Unregister a wallet adapter.
 *
 * @param name - The adapter name to unregister
 * @returns True if the adapter was unregistered, false if not found
 *
 * @example
 * ```typescript
 * import { unregisterWalletAdapter } from '@walletmesh/modal-core';
 *
 * // Remove a previously registered adapter
 * const removed = unregisterWalletAdapter('MetaMaskAdapter');
 * console.log('Adapter removed:', removed);
 * ```
 *
 * @public
 */
export function unregisterWalletAdapter(name: string): boolean {
  return globalAdapterRegistry.unregister(name);
}

/**
 * Check if a wallet adapter is registered.
 *
 * @param name - The adapter name to check
 * @returns True if the adapter is registered
 *
 * @example
 * ```typescript
 * import { isWalletAdapterRegistered } from '@walletmesh/modal-core';
 *
 * if (isWalletAdapterRegistered('MetaMaskAdapter')) {
 *   console.log('MetaMask adapter is available');
 * }
 * ```
 *
 * @public
 */
export function isWalletAdapterRegistered(name: string): boolean {
  return globalAdapterRegistry.has(name);
}

/**
 * Get all registered wallet adapter names.
 *
 * @returns Array of registered adapter names
 *
 * @example
 * ```typescript
 * import { getRegisteredWalletAdapters } from '@walletmesh/modal-core';
 *
 * const adapters = getRegisteredWalletAdapters();
 * console.log('Available adapters:', adapters);
 * // Output: ['MetaMaskAdapter', 'PhantomAdapter', ...]
 * ```
 *
 * @public
 */
export function getRegisteredWalletAdapters(): string[] {
  return globalAdapterRegistry.getRegisteredAdapters();
}

/**
 * Clear all registered wallet adapters.
 *
 * This is mainly useful for testing or resetting the adapter registry.
 *
 * @example
 * ```typescript
 * import { clearWalletAdapterRegistry } from '@walletmesh/modal-core';
 *
 * // Remove all registered adapters
 * clearWalletAdapterRegistry();
 * ```
 *
 * @public
 */
export function clearWalletAdapterRegistry(): void {
  globalAdapterRegistry.clear();
}
