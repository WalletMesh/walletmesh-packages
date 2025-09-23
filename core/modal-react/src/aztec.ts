/**
 * Aztec blockchain support for @walletmesh/modal-react
 *
 * Import from this module when building Aztec-specific dApps.
 * This module includes all core functionality plus Aztec-specific features.
 *
 * @example
 * ```tsx
 * import {
 *   AztecWalletMeshProvider,
 *   AztecConnectButton,
 *   useAztecWallet,
 *   createAztecConfig
 * } from '@walletmesh/modal-react/aztec';
 * ```
 *
 * @module aztec
 * @packageDocumentation
 */

// Re-export all chain-agnostic functionality
export * from './core.js';

// Export all Aztec-specific functionality
export * from './chains/aztec/index.js';
