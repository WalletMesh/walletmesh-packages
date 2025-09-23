/**
 * Modal API module
 *
 * This module provides the main API for creating and managing wallet connection modals.
 * It includes factory functions, configuration interfaces, and type exports.
 *
 * @module modal
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { walletInfoSchema } from '../../schemas/index.js';
import type { EventListener, ModalController, ModalState, SupportedChain } from '../../types.js';
import { ChainType } from '../../types.js';

// Service Factory Pattern imports
import {
  type ModalFactoryConfig,
  createModalController,
  createTestModal as createTestModalInternal,
} from '../../internal/factories/modalFactory.js';

/**
 * Create a headless modal controller for wallet connections
 *
 * This is the main factory function for creating a headless wallet connection modal.
 * It validates all wallet configurations and sets up the modal controller for
 * state management. UI frameworks handle their own rendering based on state subscriptions.
 *
 * @param config - Modal configuration options
 * @param config.wallets - Array of wallet configurations to display in the modal
 * @param config.client - WalletMesh client instance for handling connections
 * @param config.supportedChains - Optional array of supported chain objects
 *
 * @returns Headless modal controller instance with methods to open, close, and manage state
 *
 * @throws {ModalError} Configuration error if wallet validation fails
 *
 * @example
 * // Basic headless usage with MetaMask and supported chains
 * import { createModal, createWalletMeshClient, ChainType } from '@walletmesh/modal-core';
 *
 * const client = createWalletMeshClient({ appName: 'My DApp' });
 * const modal = createModal({
 *   wallets: [
 *     {
 *       id: 'metamask',
 *       name: 'MetaMask',
 *       icon: 'https://example.com/metamask-icon.png',
 *       chainTypes: ['evm']
 *     }
 *   ],
 *   supportedChains: [
 *     {
 *       chainId: 'eip155:1',
 *       chainType: ChainType.Evm,
 *       name: 'Ethereum Mainnet',
 *       required: true,
 *       icon: 'https://example.com/eth-icon.png'
 *     },
 *     {
 *       chainId: 'eip155:137',
 *       chainType: ChainType.Evm,
 *       name: 'Polygon',
 *       required: false
 *     }
 *   ],
 *   client,
 *   debug: true
 * });
 *
 * // Subscribe to state changes for UI updates
 * modal.subscribe((state) => {
 *   console.log('Modal state changed:', state);
 * });
 *
 * // Open modal and handle connection
 * await modal.open();
 *
 * @example
 * // Advanced usage with multiple wallets and chains
 * const modal = createModal({
 *   wallets: [
 *     { id: 'metamask', name: 'MetaMask', icon: '...', chainTypes: ['evm'] },
 *     { id: 'phantom', name: 'Phantom', icon: '...', chainTypes: ['solana'] },
 *     { id: 'aztec', name: 'Aztec Wallet', icon: '...', chainTypes: ['aztec'] }
 *   ],
 *   supportedChains: [
 *     {
 *       chainId: 'eip155:1',
 *       chainType: ChainType.Evm,
 *       name: 'Ethereum Mainnet',
 *       required: true,
 *       interfaces: ['eip-1193', 'eip-6963']
 *     },
 *     {
 *       chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
 *       chainType: ChainType.Solana,
 *       name: 'Solana Mainnet',
 *       required: false,
 *       interfaces: ['solana-standard-wallet']
 *     },
 *     {
 *       chainId: 'aztec:mainnet',
 *       chainType: ChainType.Aztec,
 *       name: 'Aztec Mainnet',
 *       required: false,
 *       interfaces: ['aztec-connect-v2', 'aztec-wallet-api-v1']
 *     }
 *   ],
 *   client,
 *   debug: true,
 *   autoCloseDelay: 3000
 * });
 *
 * @public
 */
export function createModal(config: ModalFactoryConfig): ModalController {
  // Validate each wallet configuration against the schema to ensure
  // all required fields are present and properly formatted
  try {
    for (const wallet of config.wallets) {
      walletInfoSchema.parse(wallet);
    }
  } catch (error) {
    // Throw a structured error with details for debugging
    // This helps developers identify which wallet config is invalid
    throw ErrorFactory.configurationError(
      `Invalid modal configuration: ${error instanceof Error ? error.message : 'Unknown validation error'}`,
      { config, validationError: error },
    );
  }

  // Delegate to internal factory which handles dependency injection
  // and service initialization
  return createModalController(config) as ModalController;
}

/**
 * Create a headless modal controller configured for testing
 *
 * This factory provides a pre-configured headless modal with mock wallets and
 * services suitable for unit and integration testing. It automatically
 * sets up common test scenarios without requiring manual configuration.
 *
 * @returns Headless modal controller instance with test-friendly defaults:
 *   - Mock wallets for EVM chains
 *   - In-memory storage for session persistence
 *   - Debug logging enabled
 *   - Headless mode (no UI rendering)
 *   - Deterministic wallet behaviors for testing
 *
 * @example
 * // In test files
 * import { createTestModal } from '@walletmesh/modal-core';
 *
 * describe('Wallet Connection', () => {
 *   let modal: ModalController;
 *
 *   beforeEach(() => {
 *     modal = createTestModal();
 *   });
 *
 *   it('should connect to mock wallet', async () => {
 *     await modal.open();
 *     const result = await modal.connect('debug-wallet');
 *     expect(result.address).toBeDefined();
 *   });
 * });
 *
 * @remarks
 * The test modal includes:
 * - 'debug-wallet': Debug wallet that always succeeds for testing
 *
 * @public
 */
export function createTestModal(): ModalController {
  return createTestModalInternal() as ModalController;
}

// Re-export primary createModal as default
export { createModal as default };

export { ChainType };
export type { ModalState, ModalController, EventListener, ModalFactoryConfig, SupportedChain };
