/**
 * EVM configuration utilities
 *
 * Provides helper functions to create standardized configurations for
 * EVM dApps, reducing boilerplate and ensuring consistent setup.
 *
 * @module chains/evm/config
 * @packageDocumentation
 */

import type { SupportedChain, WalletMeshClientConfig } from '@walletmesh/modal-core';
import {
  arbitrumOne,
  arbitrumSepolia,
  baseMainnet,
  baseSepolia,
  ethereumMainnet,
  ethereumSepolia,
  evmMainnets,
  evmTestnets,
  optimismMainnet,
  optimismSepolia,
  polygonAmoy,
  polygonMainnet,
} from '@walletmesh/modal-core';

export interface EVMProviderConfig {
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  chains?: Array<'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | SupportedChain>;
  testnet?: boolean;
  wallets?: unknown[]; // Wallet adapters
  debug?: boolean;
  discoveryTimeout?: number;
}

/**
 * Creates a complete WalletMesh configuration from simplified EVM config
 *
 * @param config - EVM-specific configuration
 * @returns Complete WalletMesh configuration
 *
 * @public
 */
export function createEVMConfig(config: EVMProviderConfig): WalletMeshClientConfig {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const useTestnet = config.testnet ?? isDevelopment;

  // Map chain names to chain configs
  const chains =
    config.chains?.map((chain): SupportedChain => {
      if (typeof chain === 'object' && 'chainId' in chain) {
        return chain;
      }

      // Map string identifiers to chain configs
      switch (chain) {
        case 'ethereum':
          return useTestnet ? ethereumSepolia : ethereumMainnet;
        case 'polygon':
          return useTestnet ? polygonAmoy : polygonMainnet;
        case 'arbitrum':
          return useTestnet ? arbitrumSepolia : arbitrumOne;
        case 'optimism':
          return useTestnet ? optimismSepolia : optimismMainnet;
        case 'base':
          return useTestnet ? baseSepolia : baseMainnet;
        default:
          // Fallback for unknown chains
          return {
            chainId: `evm:${chain}`,
            name: String(chain),
            label: String(chain),
            chainType: 'evm',
            group: 'evm',
            required: false,
            interfaces: ['eip1193'],
          } as SupportedChain;
      }
    }) || (useTestnet ? evmTestnets : evmMainnets);

  return {
    appName: config.appName,
    ...(config.appDescription && { appDescription: config.appDescription }),
    ...(config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined)
      ? { appUrl: config.appUrl || (typeof window !== 'undefined' ? window.location.origin : undefined) }
      : {}),
    ...(config.appIcon && { appIcon: config.appIcon }),
    chains,

    // Pass through wallet adapters
    ...(config.wallets && { wallets: config.wallets }),

    // Optimized discovery configuration for EVM
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
      prefix: '[EVMWalletMesh]',
    },

    // EVM-specific interfaces
    supportedInterfaces: {
      evm: ['eip1193', 'eip6963', 'walletconnect'],
    },
  } as unknown as WalletMeshClientConfig;
}

/**
 * Creates mainnet-optimized EVM configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Mainnet configuration
 *
 * @public
 */
export function createMainnetConfig(
  appName: string,
  options: Partial<EVMProviderConfig> = {},
): WalletMeshClientConfig {
  return createEVMConfig({
    appName,
    appDescription: options.appDescription || `${appName} - Mainnet`,
    chains: options.chains || ['ethereum', 'polygon', 'arbitrum'],
    testnet: false,
    debug: false,
    discoveryTimeout: 5000,
    ...options,
  });
}

/**
 * Creates testnet-optimized EVM configuration
 *
 * @param appName - Application name
 * @param options - Additional configuration options
 * @returns Testnet configuration
 *
 * @public
 */
export function createTestnetConfig(
  appName: string,
  options: Partial<EVMProviderConfig> = {},
): WalletMeshClientConfig {
  return createEVMConfig({
    appName,
    appDescription: options.appDescription || `${appName} - Testnet`,
    chains: options.chains || ['ethereum', 'polygon'],
    testnet: true,
    debug: true,
    discoveryTimeout: 3000,
    ...options,
  });
}
