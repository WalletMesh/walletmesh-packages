/**
 * @module @walletmesh/aztec-rpc-wallet
 *
 * This module provides a JSON-RPC implementation for interacting with Aztec Network.
 * It enables communication between dApps and wallets through a standardized interface.
 */

/**
 * Provider class for dApps to interact with Aztec wallets
 * @see AztecProvider
 */
export { AztecProvider } from './provider.js';

/**
 * Minimal provider for direct interaction with an Aztec chain wallet
 * @see AztecChainProvider
 */
export { AztecChainProvider } from './chainProvider.js';

/**
 * Wallet implementation that handles RPC requests from dApps
 * @see AztecChainWallet
 */
export { AztecChainWallet } from './wallet.js';
export { AztecChainWalletMiddleware } from './types.js';

/**
 * Cache for contract artifacts
 * @see ContractArtifactCache
 */
export { ContractArtifactCache } from './contractArtifactCache.js';

/**
 * Error handling utilities for RPC communication
 * @see AztecWalletError
 * @see AztecWalletErrorMap
 * @see AztecWalletErrorType
 */
export { AztecWalletError, AztecWalletErrorMap, AztecWalletErrorType } from './errors.js';

/**
 * Type definitions for RPC interfaces
 */
export type {
  /** Chain identifier type */
  AztecChainId,
  /** Context passed through RPC middleware */
  AztecWalletContext,
  /** Event map for wallet events */
  AztecWalletEventMap,
  /** Base method map for core wallet functionality */
  AztecWalletBaseMethodMap,
  /** Complete method map including all Aztec methods */
  AztecWalletMethodMap,
  /** Middleware type for processing RPC requests */
  AztecWalletMiddleware,
  /** Router client type for wallet mesh integration */
  AztecWalletRouterClient,
  /** Handler type for wallet methods */
  AztecWalletMethodHandler,
  /** Type for contract function calls */
  TransactionFunctionCall,
  /** Parameters for transaction requests */
  TransactionParams,
} from './types.js';
