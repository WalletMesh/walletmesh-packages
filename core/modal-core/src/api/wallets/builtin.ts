/**
 * Built-in wallet adapter exports
 *
 * @module api/wallets/builtin
 * @packageDocumentation
 */

// Built-in wallet adapters
export { EvmAdapter } from '../../internal/wallets/evm/EvmAdapter.js';
export type { EvmAdapterConfig } from '../../internal/wallets/evm/EvmAdapter.js';
export { SolanaAdapter } from '../../internal/wallets/solana/SolanaAdapter.js';
export { AztecAdapter } from '../../internal/wallets/aztec/AztecAdapter.js';
export type { AztecAdapterConfig } from '../../internal/wallets/aztec/AztecAdapter.js';
export { DebugWallet } from '../../internal/wallets/debug/DebugWallet.js';

// Aztec example wallet adapter
export { AztecExampleWalletAdapter } from '../../internal/wallets/aztec-example/AztecExampleWalletAdapter.js';
