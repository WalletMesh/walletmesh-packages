/**
 * Modal factory module for creating modal controllers
 *
 * This factory provides centralized creation of modal controllers with proper
 * dependency injection, validation, and service initialization. It ensures
 * all modal instances are created with consistent configuration and error handling.
 *
 * @module factories/modalFactory
 * @internal
 */

import type { z } from 'zod';
import type { WalletProvider } from '../../api/types/providers.js';
import type { modalViewSchema } from '../../schemas/connection.js';
import { ChainType, type SupportedChain, type SupportedChainsConfig, type WalletInfo } from '../../types.js';
import type { InternalWalletMeshClient } from '../client/WalletMeshClient.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { createComponentServices } from '../core/factories/serviceFactory.js';
import { ModalController, type ModalControllerOptions } from '../modal/controller.js';
import type { WalletRegistry } from '../registries/wallets/WalletRegistry.js';

/**
 * Modal view type inferred from schema
 * @typedef {z.infer<typeof modalViewSchema>} ModalView
 * @private
 */
type ModalView = z.infer<typeof modalViewSchema>;

/**
 * Convert SupportedChain array to SupportedChainsConfig
 * @param chains - Array of supported chain objects
 * @returns SupportedChainsConfig with chains organized by technology
 */
function convertChainArrayToConfig(chains: SupportedChain[] | undefined): SupportedChainsConfig | undefined {
  if (!chains || !Array.isArray(chains) || chains.length === 0) {
    return undefined;
  }

  // Convert array to SupportedChainsConfig
  const chainsByTech: Record<string, SupportedChain[]> = {};

  for (const chain of chains) {
    const tech = chain.chainType;
    if (!chainsByTech[tech]) {
      chainsByTech[tech] = [];
    }
    chainsByTech[tech].push(chain);
  }

  return {
    chainsByTech,
    allowMultipleWalletsPerChain: false,
    allowFallbackChains: false,
  };
}

/**
 * Configuration for creating modal components
 * @interface ModalFactoryConfig
 */
export interface ModalFactoryConfig {
  /**
   * Available wallets
   * @type {WalletInfo[]}
   */
  wallets: WalletInfo[];
  /**
   * Wallet client for managing connections
   * @type {InternalWalletMeshClient}
   */
  client: InternalWalletMeshClient;
  /**
   * Supported chains configuration
   * Array of supported chain objects that define which chains the modal supports
   * @type {SupportedChain[]}
   */
  supportedChains?: SupportedChain[];
  /**
   * Initial view to display
   * @type {ModalView}
   */
  initialView?: ModalView;
  /**
   * Auto close delay in milliseconds
   * @type {number}
   */
  autoCloseDelay?: number;
  /**
   * Whether to persist wallet selection
   * @type {boolean}
   */
  persistWalletSelection?: boolean;
  /**
   * Show provider selection view
   * @type {boolean}
   */
  showProviderSelection?: boolean;
  /**
   * Debug mode
   * @type {boolean}
   */
  debug?: boolean;
}

/**
 * Create a modal controller with full validation and service injection
 *
 * This factory method handles:
 * - Configuration validation (wallets, client)
 * - Service creation (logger, error handler)
 * - Dependency injection into the controller
 * - Proper error handling with descriptive messages
 *
 * @param config - Modal configuration options
 * @returns Fully initialized modal controller instance
 *
 * @throws {ModalError} Configuration error if:
 *   - Wallet configuration is invalid (missing required fields)
 *   - Client is not provided or invalid
 *
 * @example
 * ```typescript
 * const controller = createModalController({
 *   wallets: [
 *     { id: 'metamask', name: 'MetaMask', icon: '...', chains: ['evm'] }
 *   ],
 *   client: walletMeshClient,
 *   debug: true,
 *   autoCloseDelay: 3000
 * });
 *
 * await controller.open();
 * ```
 *
 * @internal Used by public createModal() function
 */
export function createModalController(config: ModalFactoryConfig): ModalController {
  // Validate wallets array - ensure all required fields are present
  // This prevents runtime errors when rendering wallet options
  try {
    for (const wallet of config.wallets) {
      // Validate required wallet fields
      if (!wallet.id || !wallet.name || !wallet.icon || !wallet.chains) {
        throw ErrorFactory.invalidParams('Invalid wallet configuration: missing required fields');
      }
    }
  } catch (error) {
    throw ErrorFactory.configurationError(
      error instanceof Error ? error.message : 'Invalid wallet configuration',
      { wallets: config.wallets },
    );
  }

  // Type-based validation for other fields
  if (!config.client || typeof config.client !== 'object') {
    throw ErrorFactory.configurationError('Invalid wallet client provided', {
      clientType: typeof config.client,
    });
  }

  // Create services using service factory for memory efficiency
  // This ensures all modals share the same service instances when possible
  const services = createComponentServices('ModalController', {
    logger: {
      level: config.debug ? 'debug' : 'info',
    },
  });
  const { logger, errorHandler } = services;

  // Convert SupportedChain[] to SupportedChainsConfig if needed
  const supportedChainsConfig = convertChainArrayToConfig(config.supportedChains);

  // Prepare controller options
  const controllerOptions: ModalControllerOptions = {
    wallets: config.wallets,
    client: config.client,
    errorHandler,
    logger,
    ...(supportedChainsConfig !== undefined && { supportedChains: supportedChainsConfig }),
    ...(config.initialView !== undefined && { initialView: config.initialView }),
    ...(config.autoCloseDelay !== undefined && { autoCloseDelay: config.autoCloseDelay }),
    ...(config.persistWalletSelection !== undefined && {
      persistWalletSelection: config.persistWalletSelection,
    }),
    ...(config.showProviderSelection !== undefined && {
      showProviderSelection: config.showProviderSelection,
    }),
    ...(config.debug !== undefined && { debug: config.debug }),
  };

  return new ModalController(controllerOptions);
}

/**
 * Configuration for test modal creation
 * @interface TestModalConfig
 */
export interface TestModalConfig {
  /**
   * Test wallets
   * @type {WalletInfo[]}
   */
  wallets?: WalletInfo[];
  /**
   * Test client instance
   * @type {InternalWalletMeshClient}
   */
  client?: InternalWalletMeshClient;
}

/**
 * Create a modal controller for testing
 * @param {TestModalConfig} [config={}] - Test configuration
 * @returns {ModalController} Test modal controller instance
 * @public
 */
export function createTestModal(config: TestModalConfig = {}): ModalController {
  // Create mock client if not provided
  const mockClient =
    config.client ||
    ({
      connect: async () => ({
        address: '0x123',
        accounts: ['0x123'],
        chain: {
          chainId: '1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: false,
        },
        chainType: ChainType.Evm,
        provider: {} as WalletProvider,
        walletId: 'debug-wallet',
        walletInfo: {
          id: 'debug-wallet',
          name: 'Debug Wallet',
          icon: 'data:image/svg+xml,<svg></svg>',
          chains: [ChainType.Evm],
        },
      }),
      disconnect: async () => {},
      disconnectAll: async () => {},
      switchChain: async () => ({
        provider: {},
        chainType: 'evm',
        chainId: '137',
        previousChainId: '1',
      }),
      getConnection: () => undefined,
      getConnections: () => [],
      getAllConnections: () => [],
      discoverWallets: async () => [],
      getWallet: () => undefined,
      getAllWallets: () => [],
      on: () => {},
      openModal: async () => {},
      closeModal: () => {},
      modal: {} as ModalController,
      registry: {} as WalletRegistry,
      isConnected: false,
      setActiveWallet: () => {},
      getActiveWallet: () => null,
      getMaxConnections: () => 5,
      destroy: () => {},
      setupModalEvents: () => {},
    } as Partial<InternalWalletMeshClient> as InternalWalletMeshClient);

  // Default test wallets
  const defaultWallets: WalletInfo[] = config.wallets || [
    {
      id: 'debug-wallet',
      name: 'Debug Wallet',
      icon: 'data:image/svg+xml,<svg></svg>',
      chains: [ChainType.Evm],
    },
  ];

  return createModalController({
    wallets: defaultWallets,
    client: mockClient,
    debug: true,
  });
}
