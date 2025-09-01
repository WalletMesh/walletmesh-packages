/**
 * @module @walletmesh/aztec-rpc-wallet
 *
 * JSON-RPC wallet integration for Aztec Protocol, built on WalletMesh router for multi-chain support.
 * This package provides both wallet-side and dApp-side implementations for Aztec integration.
 */

// Client-side exports
/**
 * DApp-side wallet class that implements the aztec.js Wallet interface.
 * @see {@link AztecDappWallet}
 */
export { AztecDappWallet, createAztecWallet } from './client/aztec-dapp-wallet.js';
/**
 * Extended WalletRouterProvider with built-in Aztec serialization support.
 * Use this instead of the base WalletRouterProvider for automatic serialization
 * of Aztec types on the client side.
 * @see {@link AztecRouterProvider}
 */
export { AztecRouterProvider } from './client/aztec-router-provider.js';
/**
 * Helper constants and functions for connecting to Aztec wallets.
 * - ALL_AZTEC_METHODS: Complete list of all available Aztec methods
 * - connectAztec: Helper to connect to Aztec and create wallet instance
 */
export {
  ALL_AZTEC_METHODS,
  connectAztec,
} from './client/helpers.js';
/**
 * Helper function to register Aztec serializers with a WalletRouterProvider.
 * This enables proper serialization of Aztec types when using the router.
 * @see {@link registerAztecSerializers}
 */
export { registerAztecSerializers } from './client/register-serializers.js';
// Utilities
/**
 * Cache utility for managing contract artifacts in wallet implementations.
 * @see {@link ContractArtifactCache}
 */
export { ContractArtifactCache } from './contractArtifactCache.js';
// Error utilities
/**
 * Error handling utilities for Aztec wallet operations.
 * - AztecWalletError: Custom error class for Aztec wallet errors
 * - AztecWalletErrorMap: Map of error codes to error messages
 */
export { AztecWalletError, AztecWalletErrorMap } from './errors.js';

// Shared types
/**
 * Core type definitions used throughout the package.
 * - AztecChainId: Type-safe Aztec chain ID format (e.g., "aztec:mainnet")
 * - AztecWalletContext: Context object for wallet implementations
 * - AztecWalletMethodMap: Complete method map for all Aztec wallet methods
 */
export type {
  AztecChainId,
  AztecWalletContext,
  AztecWalletMethodMap,
} from './types.js';
// Wallet-side exports
/**
 * Creates an Aztec wallet node that can be used with WalletRouter.
 * This is the wallet-side implementation that handles JSON-RPC requests.
 * @see {@link createAztecWalletNode}
 */
export { createAztecWalletNode } from './wallet/create-node.js';
/**
 * Context interface provided to all handler functions in the wallet implementation.
 * @see {@link AztecHandlerContext}
 */
export type { AztecHandlerContext } from './wallet/handlers/index.js';

// Re-export serializers
/**
 * Re-exports the primary {@link AztecWalletSerializer} and the wallet-side
 * `registerAztecSerializers` function from the `wallet/serializers` module.
 * These are crucial for handling Aztec-specific data types over JSON-RPC
 * on the wallet (node) side.
 *
 * @see {@link AztecWalletSerializer} - The main serializer object.
 * @see {@link module:@walletmesh/aztec-rpc-wallet/wallet/serializers} - The module providing these utilities.
 * Note: The client-side `registerAztecSerializers` is exported separately from `./client/register-serializers.js`.
 */
export {
  AztecWalletSerializer,
  registerAztecSerializers as registerWalletAztecSerializers,
} from './wallet/serializers.js';
// To avoid naming collision with client/register-serializers.ts,
// the wallet-side registerAztecSerializers is re-exported as registerWalletAztecSerializers.
// AztecWalletSerializer is unique and can be re-exported directly.
// Other internal details of wallet/serializers.ts are not re-exported here.
