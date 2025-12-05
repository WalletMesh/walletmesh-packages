/**
 * Root exports for @walletmesh/aztec-rpc-wallet
 * 
 * This package provides RPC wallet functionality for Aztec.
 * Import from client or server subpaths for specific functionality.
 */

// Export common types
export type { AztecWalletMethodMap, AztecWalletEventMap, AztecSendOptions } from './types.js';
export type { AztecWalletHandlerContext } from './server/types.js';

// Re-export serializers for convenience
export { SERIALIZERS } from './serializers.js';
export { registerAztecWalletSerializers } from './client/register-serializers.js';

// Re-export client classes
export { AztecWalletRouterProvider } from './client/index.js';
