/**
 * EVM blockchain support for @walletmesh/modal-react
 *
 * Import from this module when building EVM-specific dApps
 * (Ethereum, Polygon, Arbitrum, Optimism, Base, etc.).
 * This module includes all core functionality plus EVM-specific features.
 *
 * @example
 * ```tsx
 * import {
 *   WalletMeshProvider,
 *   EVMConnectButton,
 *   useEvmWallet,
 *   useBalance,
 *   useTransaction,
 *   createEVMConfig
 * } from '@walletmesh/modal-react/evm';
 * ```
 *
 * @module evm
 * @packageDocumentation
 */

// Re-export all chain-agnostic functionality
export * from './core.js';

// Export all EVM-specific functionality
export * from './chains/evm/index.js';
