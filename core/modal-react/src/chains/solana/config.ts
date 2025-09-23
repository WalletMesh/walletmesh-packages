/**
 * Solana configuration utilities
 *
 * Provides helper functions to create standardized configurations for
 * Solana dApps, reducing boilerplate and ensuring consistent setup.
 *
 * @module chains/solana/config
 * @packageDocumentation
 */

import type { SupportedChain, WalletMeshClientConfig } from '@walletmesh/modal-core';
import { solanaDevnet, solanaMainnet, solanaTestnet } from '@walletmesh/modal-core';

export interface SolanaProviderConfig {
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  wallets?: unknown[]; // Wallet adapters
  debug?: boolean;
  discoveryTimeout?: number;
}

/**
 * Creates a complete WalletMesh configuration from simplified Solana config
 *
 * @param config - Solana-specific configuration
 * @returns Complete WalletMesh configuration
 *
 * @public
 */
export function createSolanaConfig(config: SolanaProviderConfig): WalletMeshClientConfig {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const network = config.network || (isDevelopment ? 'devnet' : 'mainnet-beta');

  // Select chain based on network
  let chain: SupportedChain;
  switch (network) {
    case 'mainnet-beta':
      chain = solanaMainnet;
      break;
    case 'devnet':
      chain = solanaDevnet;
      break;
    case 'testnet':
      chain = solanaTestnet;
      break;
    default:
      // Fallback for custom networks
      chain = {
        chainId: `solana:${network}`,
        name: network,
        label: network,
        chainType: 'solana',
        group: 'solana',
        required: false,
        interfaces: ['solana-wallet-standard'],
      } as SupportedChain;
  }

  return {
    appName: config.appName,
    ...(config.appDescription && { appDescription: config.appDescription }),
    ...(config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined)
      ? { appUrl: config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined) }
      : {}),
    ...(config.appIcon && { appIcon: config.appIcon }),
    chains: [chain],

    // Pass through wallet adapters
    ...(config.wallets && { wallets: config.wallets }),

    // Optimized discovery configuration for Solana
    discovery: {
      enabled: true,
      timeout: config.discoveryTimeout || 3000,
      retryInterval: 1000,
    },

    // Enhanced logging for development
    debug: config.debug ?? isDevelopment,
    logger: {
      debug: config.debug ?? isDevelopment,
      level: (config.debug ?? isDevelopment) ? 'debug' : 'info',
      prefix: '[SolanaWalletMesh]',
    },

    // Solana-specific interfaces
    supportedInterfaces: {
      solana: ['solana-wallet-standard', 'solana-wallet-adapter'],
    },
  } as unknown as WalletMeshClientConfig;
}

/**
 * Creates mainnet-optimized Solana configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Mainnet configuration
 *
 * @public
 */
export function createSolanaMainnetConfig(
  appName: string,
  options: Partial<SolanaProviderConfig> = {},
): WalletMeshClientConfig {
  return createSolanaConfig({
    appName,
    appDescription: options.appDescription || `${appName} - Mainnet`,
    network: 'mainnet-beta',
    debug: false,
    discoveryTimeout: 5000,
    ...options,
  });
}

/**
 * Creates devnet-optimized Solana configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Devnet configuration
 *
 * @public
 */
export function createSolanaDevnetConfig(
  appName: string,
  options: Partial<SolanaProviderConfig> = {},
): WalletMeshClientConfig {
  return createSolanaConfig({
    appName,
    appDescription: options.appDescription || `${appName} - Devnet`,
    network: 'devnet',
    debug: true,
    discoveryTimeout: 3000,
    ...options,
  });
}
