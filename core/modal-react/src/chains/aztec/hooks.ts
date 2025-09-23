/**
 * Aztec-enhanced versions of core hooks
 *
 * These hooks are aware of Aztec-specific functionality and provide
 * enhanced features when working with Aztec wallets and chains.
 *
 * @module chains/aztec/hooks
 * @packageDocumentation
 */

// Re-export the core hooks that are chain-aware
// These work with Aztec chains when imported from this module
export { useAccount } from '../../hooks/useAccount.js';
export { useConnect } from '../../hooks/useConnect.js';
export { useSwitchChain } from '../../hooks/useSwitchChain.js';
export { useTransaction } from '../../hooks/useTransaction.js';
export { useBalance } from '../../hooks/useBalance.js';
export { usePublicProvider } from '../../hooks/usePublicProvider.js';
export { useWalletProvider } from '../../hooks/useWalletProvider.js';
