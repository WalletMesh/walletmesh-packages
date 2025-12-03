/**
 * Factory function for creating WalletMeshClient instances
 *
 * This module provides a convenient factory function for creating and configuring
 * WalletMeshClient instances with all necessary dependencies.
 *
 * @module client/createWalletMeshClient
 * @packageDocumentation
 */

import type { InternalWalletMeshClient, WalletMeshConfig } from '../internal/client/WalletMeshClient.js';
import { WalletMeshClient as WalletMeshClientImpl } from '../internal/client/WalletMeshClientImpl.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { ModalController } from '../types.js';
import { ChainType } from '../types.js';
import type {
  WalletMeshClient as PublicWalletMeshClient,
  WalletMeshClientConfig,
} from '../internal/client/WalletMeshClient.js';

import { createModal } from '../api/core/modal.js';
import { isServer } from '../api/utilities/ssr.js';
import { createComponentServices } from '../internal/core/factories/serviceFactory.js';
import { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';

// Import factory helpers
import { createSSRSafeClient } from './factories/ssr.js';
import { configureLogger } from './factories/loggerConfiguration.js';
import { validateClientConfig } from './factories/configValidation.js';
import { registerBuiltinAdapters, registerCustomAdapters } from './factories/adapterRegistration.js';
import { getWalletsForModal } from './factories/walletFiltering.js';

/**
 * Options for creating a WalletMeshClient
 *
 * @public
 */
export interface CreateWalletMeshClientOptions {
  /** Whether to force SSR mode */
  ssr?: boolean;
  /** Custom registry instance to use */
  registry?: WalletRegistry;
  /** Custom modal controller to use */
  modal?: ModalController;
  /** Custom logger instance to use */
  logger?: Logger;
  /** Whether to register built-in adapters */
  registerBuiltinAdapters?: boolean;
  /** Whether to automatically call initialize() after creation (default: false for sync compatibility) */
  autoInitialize?: boolean;
}

/**
 * Creates a new WalletMeshClient instance with full configuration control
 *
 * This factory function handles the creation and configuration of:
 * - WalletRegistry with built-in adapters
 * - Modal controller with framework adapter
 * - Logger and error handling
 * - ProviderLoader for lazy loading
 * - Event system integration
 *
 * @param config - Full configuration for the WalletMeshClient
 * @param options - Optional creation options
 * @returns A fully configured WalletMeshClient instance
 * @throws If configuration is invalid or creation fails
 *
 * @example
 * ```typescript
 * // Full configuration
 * const client = createWalletMeshClientWithConfig({
 *   appName: 'My DApp',
 *   appDescription: 'A decentralized application',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' }
 *   ],
 *   providerLoader: {
 *     preloadOnInit: true,
 *     preloadChainTypes: ['evm', 'solana']
 *   },
 *   discovery: {
 *     enabled: true,
 *     timeout: 5000
 *   }
 * }, {
 *   registerBuiltinAdapters: true
 * });
 * ```
 *
 * @example
 * ```typescript
 * // SSR-safe usage
 * const client = createWalletMeshClientWithConfig({
 *   appName: 'My DApp'
 * }, {
 *   ssr: true // Will return SSR-safe controller in server environment
 * });
 * ```
 *
 * @public
 */
export function createWalletMeshClientWithConfig(
  config: WalletMeshClientConfig,
  options: CreateWalletMeshClientOptions = {},
): PublicWalletMeshClient {
  // Create and configure logger
  const services = createComponentServices('WalletMeshClient');
  const logger = configureLogger(config, options.logger || services.logger);

  logger.debug('Creating WalletMeshClient', { config, options });

  // Validate configuration
  validateClientConfig(config);

  // Check if we should use SSR mode
  const shouldUseSSR = options.ssr || isServer();
  logger.debug('SSR mode check', { shouldUseSSR, isServer: isServer() });

  if (shouldUseSSR) {
    logger.info('SSR environment detected - returning SSR-safe controller');
    return createSSRSafeClient(logger);
  }

  // Create or use provided registry
  const registry = options.registry || new WalletRegistry();

  // Register built-in adapters if requested
  if (options.registerBuiltinAdapters !== false) {
    registerBuiltinAdapters(registry, config, logger);
  }

  // Register custom adapters if provided
  registerCustomAdapters(registry, config, logger);

  // Determine wallets for modal
  const walletsForModal = getWalletsForModal(config, registry, logger);

  // Create the WalletMeshClient (convert config to internal format)
  const internalConfig = {
    appName: config.appName,
    appDescription: config.appDescription,
    appUrl: config.appUrl,
    appIcon: config.appIcon,
    projectId: config.projectId,
    chains: config.chains as never, // Type differences between public/internal APIs
    wallets: config.wallets,
    debug: config.debug,
  } as WalletMeshConfig;

  // Two-phase construction to eliminate circular dependency:
  // Phase 1: Create client without modal
  const client = new WalletMeshClientImpl(internalConfig, registry, logger);

  // Phase 2: Create or use provided modal with real client reference
  const modal =
    options.modal ||
    createModal({
      wallets: walletsForModal,
      client: client as InternalWalletMeshClient,
    });

  // Phase 3: Wire up client-modal connection
  if ('setModal' in client && typeof client.setModal === 'function') {
    // Type assertion needed because createModal returns public interface type
    // but setModal expects internal class type (they are compatible)
    client.setModal(modal as never);
  }

  logger.debug('WalletMeshClient created successfully', {
    registeredWallets: registry.getAllAdapters().length,
    modalWallets: walletsForModal.length,
    hasDiscovery: config.discovery?.enabled !== false,
  });

  return client as never;
}

/**
 * Creates a WalletMeshClient instance with sensible defaults and automatic initialization.
 *
 * **This is the recommended API for most use cases.** The client is automatically initialized
 * and ready to use immediately after the promise resolves.
 *
 * This async function:
 * - Creates the client with sensible defaults
 * - Automatically calls `initialize()`
 * - Returns a fully initialized, ready-to-use client
 *
 * @param appName - Name of the application
 * @param additionalConfig - Additional configuration options
 * @returns Promise resolving to a fully initialized WalletMeshClient instance
 *
 * @example
 * ```typescript
 * // Recommended: Async with auto-initialization
 * const client = await createWalletMeshClient('My DApp', {
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *     { chainId: '137', chainType: 'evm', name: 'Polygon' }
 *   ]
 * });
 * // Client is ready to use immediately
 * const connection = await client.connectWithModal();
 * ```
 *
 * @example
 * ```typescript
 * // For advanced users who need manual control, use createWalletMeshClientSync
 * const client = createWalletMeshClientSync('My DApp', config);
 * await client.initialize(); // Manual initialization
 * ```
 *
 * @public
 * @since 1.1.0
 */
export async function createWalletMeshClient(
  appName: string,
  additionalConfig: Partial<WalletMeshClientConfig> = {},
): Promise<PublicWalletMeshClient> {
  // Create client synchronously first
  const client = createWalletMeshClientSync(appName, additionalConfig);

  // Auto-initialize if not in SSR mode
  // SSR clients don't need initialization
  if ('initialize' in client && typeof client.initialize === 'function') {
    await client.initialize();
  }

  return client;
}

/**
 * Creates a WalletMeshClient instance synchronously without auto-initialization.
 *
 * **For advanced users only.** This function creates the client but does NOT call
 * `initialize()`. You must call `client.initialize()` manually before using most features.
 *
 * Most developers should use the async `createWalletMeshClient()` instead, which handles
 * initialization automatically.
 *
 * @param appName - Name of the application
 * @param additionalConfig - Additional configuration options
 * @returns WalletMeshClient instance (not yet initialized)
 *
 * @example
 * ```typescript
 * // Manual initialization control
 * const client = createWalletMeshClientSync('My DApp', {
 *   chains: [{ chainId: '1', chainType: 'evm', name: 'Ethereum' }]
 * });
 *
 * // Must call initialize before using the client
 * await client.initialize();
 *
 * // Now ready to use
 * await client.connect();
 * ```
 *
 * @public
 * @since 1.1.0
 */
export function createWalletMeshClientSync(
  appName: string,
  additionalConfig: Partial<WalletMeshClientConfig> = {},
): PublicWalletMeshClient {
  const finalConfig: WalletMeshClientConfig = {
    appName,
    appDescription: additionalConfig.appDescription || `${appName} - Web3 Application`,
    debug: process.env['NODE_ENV'] === 'development',
    // providerLoader: {
    //   preloadOnInit: true,
    //   preloadChainTypes: [ChainType.Evm],
    //   ...additionalConfig.providerLoader,
    // },
    discovery: {
      enabled: true,
      timeout: 5000,
      retryInterval: 30000,
      ...additionalConfig.discovery,
    },
    chains: additionalConfig.chains || [
      { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
    ],
    ...additionalConfig,
  };

  return createWalletMeshClientWithConfig(finalConfig, {
    registerBuiltinAdapters: true,
  });
}
