/**
 * Non-React utilities for getting chain-specific providers with proper typing
 *
 * This module provides functions that return the appropriate provider type
 * based on the chain configuration, enabling type-safe provider usage
 * outside of React components.
 *
 * @module providers/getChainProvider
 * @packageDocumentation
 */

import type { WalletProvider } from '../api/types/providers.js';
import { useStore } from '../state/store.js';
import type { SupportedChain } from '../types.js';
import { ChainType } from '../types.js';
import type { EvmProvider } from './evm/index.js';
import type { SolanaProvider } from './solana/index.js';

/**
 * Get a chain-specific provider with proper typing
 *
 * @template T - The chain type (inferred from chain.chainType)
 * @param chain - The chain configuration
 * @returns The typed provider or null if not connected
 *
 * @example
 * ```typescript
 * // With an EVM chain
 * const evmChain: SupportedChain = {
 *   chainId: 'eip155:1',
 *   chainType: ChainType.Evm,
 *   name: 'Ethereum',
 *   required: true
 * };
 *
 * const provider = getChainProvider(evmChain);
 * // provider is typed as EvmProvider | null
 *
 * if (provider) {
 *   // TypeScript knows this is an EvmProvider
 *   const accounts = await provider.request({ method: 'eth_accounts' });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With a Solana chain
 * const solanaChain: SupportedChain = {
 *   chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
 *   chainType: ChainType.Solana,
 *   name: 'Solana Mainnet',
 *   required: false
 * };
 *
 * const provider = getChainProvider(solanaChain);
 * // provider is typed as SolanaProvider | null
 *
 * if (provider) {
 *   // TypeScript knows this is a SolanaProvider
 *   const pubkey = provider.publicKey;
 * }
 * ```
 */
export function getChainProvider<T extends ChainType>(
  chain: SupportedChain & { chainType: T },
): T extends ChainType.Evm
  ? EvmProvider | null
  : T extends ChainType.Solana
    ? SolanaProvider | null
    : WalletProvider | null {
  const state = useStore.getState();

  // Find session for the specified chain
  const activeSession = Object.values(state.entities.sessions).find(
    (session) => session.chain.chainId === chain.chainId && session.status === 'connected',
  );

  if (!activeSession || !activeSession.provider?.instance) {
    // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
    return null as any;
  }

  // Return the provider with proper typing based on chain type
  // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
  return activeSession.provider.instance as any;
}

/**
 * Get the active provider for the current chain
 *
 * @returns The provider for the active chain or null
 *
 * @example
 * ```typescript
 * const provider = getActiveProvider();
 *
 * if (provider) {
 *   // Use provider based on current chain
 *   console.log('Connected to chain:', provider.chainType);
 * }
 * ```
 */
export function getActiveProvider(): WalletProvider | null {
  const state = useStore.getState();
  const activeSessionId = state.active.sessionId;

  if (!activeSessionId) return null;

  const activeSession = state.entities.sessions[activeSessionId];

  if (!activeSession || activeSession.status !== 'connected') return null;

  return (activeSession?.provider?.instance as unknown as WalletProvider) || null;
}

/**
 * Get all connected providers grouped by chain type
 *
 * @returns Object with providers grouped by chain type
 *
 * @example
 * ```typescript
 * const providers = getProvidersByChainType();
 *
 * // Access EVM providers
 * providers.evm.forEach(provider => {
 *   console.log('EVM provider:', provider);
 * });
 *
 * // Access Solana providers
 * providers.solana.forEach(provider => {
 *   console.log('Solana provider:', provider);
 * });
 * ```
 */
export function getProvidersByChainType(): {
  evm: EvmProvider[];
  solana: SolanaProvider[];
} {
  const state = useStore.getState();
  const sessions = Object.values(state.entities.sessions).filter((s) => s.status === 'connected');

  const result = {
    evm: [] as EvmProvider[],
    solana: [] as SolanaProvider[],
  };

  for (const session of sessions) {
    if (!session.provider?.instance) continue;

    const provider = session.provider.instance as unknown as WalletProvider;
    const chainType = session.chain.chainType as ChainType;

    switch (chainType) {
      case ChainType.Evm:
        result.evm.push(provider as unknown as EvmProvider);
        break;
      case ChainType.Solana:
        result.solana.push(provider as unknown as SolanaProvider);
        break;
      // Note: Aztec support removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
    }
  }

  return result;
}

/**
 * Get provider for a specific chain ID
 *
 * @param chainId - The chain ID to get provider for
 * @returns The provider or null if not connected
 *
 * @example
 * ```typescript
 * // Get provider for Ethereum mainnet
 * const provider = getProviderByChainId('eip155:1');
 *
 * if (provider) {
 *   const blockNumber = await provider.request({ method: 'eth_blockNumber' });
 * }
 * ```
 */
export function getProviderByChainId(chainId: string): WalletProvider | null {
  const state = useStore.getState();

  const session = Object.values(state.entities.sessions).find(
    (s) => s.chain.chainId === chainId && s.status === 'connected',
  );

  return (session?.provider?.instance as unknown as WalletProvider) || null;
}

/**
 * Check if a provider is available for a specific chain
 *
 * @param chain - The chain to check
 * @returns Whether a provider is available
 *
 * @example
 * ```typescript
 * const evmChain: SupportedChain = {
 *   chainId: 'eip155:1',
 *   chainType: ChainType.Evm,
 *   name: 'Ethereum',
 *   required: true
 * };
 *
 * if (hasProviderForChain(evmChain)) {
 *   console.log('Ethereum provider is available');
 * }
 * ```
 */
export function hasProviderForChain(chain: SupportedChain): boolean {
  const state = useStore.getState();

  return Object.values(state.entities.sessions).some(
    (session) =>
      session.chain.chainId === chain.chainId &&
      session.status === 'connected' &&
      session.provider?.instance != null,
  );
}
