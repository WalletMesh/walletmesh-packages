/**
 * Built-in provider registration
 *
 * @module internal/providers/registerBuiltinProviders
 * @packageDocumentation
 */

import { ChainType } from '../../../types.js';
import { EvmProvider } from '../../providers/evm/EvmProvider.js';
import { SolanaProvider } from '../../providers/solana/SolanaProvider.js';
import { ProviderRegistry } from './ProviderRegistry.js';

/**
 * Register built-in providers with the provider registry
 *
 * This function registers the core providers that are always available.
 *
 * Note: Aztec adapters handle their own provider internally using AztecRouterProvider
 * from @walletmesh/aztec-rpc-wallet. Unlike EVM and Solana which use a shared provider
 * pattern, each Aztec adapter creates its own AztecRouterProvider instance directly.
 * This approach provides better isolation and flexibility for Aztec's unique requirements.
 *
 * @internal
 */
export function registerBuiltinProviders(): void {
  const registry = ProviderRegistry.getInstance();

  // Register lightweight providers directly
  registry.registerProvider(ChainType.Evm, EvmProvider, true);
  registry.registerProvider(ChainType.Solana, SolanaProvider, true);

  // Aztec providers are handled internally by each adapter - no registration needed
  // Each Aztec adapter (AztecAdapter, AztecExampleWalletAdapter, etc.) creates
  // its own AztecRouterProvider instance from @walletmesh/aztec-rpc-wallet
}

/**
 * Ensure built-in providers are registered
 * This is idempotent and can be called multiple times safely
 *
 * @internal
 */
export function ensureBuiltinProviders(): void {
  const registry = ProviderRegistry.getInstance();

  // Only register if not already registered
  if (!registry.hasProvider(ChainType.Evm)) {
    registerBuiltinProviders();
  }
}
