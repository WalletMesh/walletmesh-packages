/**
 * Aztec configuration utilities
 *
 * Provides helper functions to create standardized configurations for
 * Aztec dApps, reducing boilerplate and ensuring consistent setup.
 *
 * @module utils/aztecConfig
 * @packageDocumentation
 */

import type { ChainType } from '@walletmesh/modal-core';
import { aztecMainnet, aztecSandbox, aztecTestnet } from '@walletmesh/modal-core';
import type { AztecProviderConfig } from '../../components/AztecWalletMeshProvider.js';
import type { WalletMeshConfig } from '../../types.js';

/**
 * Creates a complete WalletMesh configuration from simplified Aztec config
 *
 * This helper function transforms a simplified Aztec configuration into a full
 * WalletMesh configuration with sensible defaults for Aztec dApps. It handles:
 * - Chain configuration with automatic mainnet/testnet/sandbox mapping
 * - Default permissions for common Aztec operations
 * - Optimized discovery settings for Aztec wallets
 * - Environment-specific defaults (sandbox for dev, testnet for prod)
 *
 * @param config - Aztec-specific configuration options
 * @returns Complete WalletMesh configuration ready for use
 *
 * @example
 * ```ts
 * // Basic development configuration
 * const config = createAztecConfig({
 *   appName: 'My Aztec DApp',
 *   appDescription: 'Zero-knowledge trading platform'
 * });
 * // Results in sandbox chain with default permissions
 * ```
 *
 * @example
 * ```ts
 * // Production configuration with custom chains
 * const config = createAztecConfig({
 *   appName: 'Production DApp',
 *   chains: [
 *     { chainId: 'aztec:mainnet', required: true, label: 'Aztec Mainnet' }
 *   ],
 *   permissions: [
 *     'aztec_getAddress',
 *     'aztec_sendTx',
 *     'aztec_deployContract'
 *   ]
 * });
 * ```
 *
 * @example
 * ```ts
 * // Multi-environment setup
 * const config = createAztecConfig({
 *   appName: 'Cross-Chain DApp',
 *   chains: [
 *     { chainId: 'aztec:mainnet', label: 'Mainnet' },
 *     { chainId: 'aztec:testnet', label: 'Testnet' },
 *     { chainId: 'aztec:31337', label: 'Local Sandbox' }
 *   ],
 *   discoveryTimeout: 8000, // Longer timeout for multiple chains
 *   debug: true
 * });
 * ```
 *
 * @public
 */
export function createAztecConfig(config: AztecProviderConfig): WalletMeshConfig {
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  // Default to sandbox for development, testnet for production if no chains specified
  const defaultChains = config.chains || [
    isDevelopment
      ? { chainId: 'aztec:31337', required: false, label: 'Aztec Sandbox' }
      : { chainId: 'aztec:testnet', required: false, label: 'Aztec Testnet' },
  ];

  // Convert simplified chain config to full SupportedChain objects
  const chains = defaultChains.map((chain) => {
    // Map chainId to full chain configuration
    if (chain.chainId === 'aztec:31337' || chain.chainId.includes('sandbox')) {
      return { ...aztecSandbox, required: chain.required ?? false };
    }
    if (chain.chainId === 'aztec:testnet') {
      return { ...aztecTestnet, required: chain.required ?? false };
    }
    if (chain.chainId === 'aztec:mainnet') {
      return { ...aztecMainnet, required: chain.required ?? false };
    }

    // Fallback for custom chain IDs
    return {
      chainId: chain.chainId,
      name: chain.label || chain.chainId,
      required: chain.required ?? false,
      label: chain.label || chain.chainId,
      interfaces: ['aztec-wallet-api-v1'],
      chainType: 'aztec' as ChainType,
      group: 'aztec',
    };
  });

  // Create permissions for each chain
  const permissions: Record<string, string[]> = {};

  // Use provided permissions or fall back to defaults
  const aztecMethods = config.permissions || [
    'aztec_getAddress',
    'aztec_getChainId',
    'aztec_getCompleteAddress',
    'aztec_sendTx',
    'aztec_proveTx',
    'aztec_getNodeInfo',
    'aztec_getPXEInfo',
    'aztec_getRegisteredAccounts',
  ];

  for (const chain of chains) {
    permissions[chain.chainId] = [...aztecMethods];
  }

  return {
    appName: config.appName,
    ...(config.appDescription && { appDescription: config.appDescription }),
    ...(config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined)
      ? { appUrl: config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined) }
      : {}),
    ...(config.appIcon && { appIcon: config.appIcon }),
    ...(config.appMetadata && { appMetadata: config.appMetadata }),
    chains,

    // Default permissions for Aztec chains
    permissions,

    // Pass through wallet adapters (instances or classes)
    ...(config.wallets && { wallets: config.wallets }),

    // Optimized discovery configuration for Aztec
    discovery: {
      enabled: true,
      timeout: config.discoveryTimeout || 5000,
      retryInterval: 2000,
    },

    // Enhanced logging for development
    debug: config.debug ?? isDevelopment,
    logger: {
      debug: config.debug ?? isDevelopment,
      level: (config.debug ?? isDevelopment) ? 'debug' : 'info',
      prefix: '[AztecWalletMesh]',
    },

    // Aztec-specific interfaces
    supportedInterfaces: {
      aztec: ['aztec-wallet-api-v1', 'aztec-connect-v2'],
    },
  } as unknown as WalletMeshConfig;
}

/**
 * Creates development-optimized Aztec configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Development configuration
 *
 * @public
 */
export function createAztecDevConfig(
  appName: string,
  options: Partial<AztecProviderConfig> = {},
): WalletMeshConfig {
  return createAztecConfig({
    appName,
    appDescription: options.appDescription || `${appName} - Development`,
    chains: [{ chainId: 'aztec:31337', required: false, label: 'Aztec Sandbox' }],
    debug: true,
    discoveryTimeout: 3000,
    ...options,
  });
}

/**
 * Creates production-ready Aztec configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Production configuration
 *
 * @public
 */
export function createAztecProdConfig(
  appName: string,
  options: Partial<AztecProviderConfig> = {},
): WalletMeshConfig {
  return createAztecConfig({
    appName,
    chains: [{ chainId: 'aztec:mainnet', required: true, label: 'Aztec Mainnet' }],
    debug: false,
    discoveryTimeout: 8000,
    ...options,
  });
}
