/**
 * React hook for getting chain-specific providers with proper typing
 *
 * This module provides a hook that returns the appropriate provider type
 * based on the chain configuration, enabling type-safe provider usage.
 *
 * @module providers/hooks/useChainProvider
 * @packageDocumentation
 */

import type { ChainType, SupportedChain, WalletProvider } from '@walletmesh/modal-core';
import { ChainType as ChainTypeEnum } from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useStore } from '../internal/useStore.js';
import type { WalletMeshState } from '../internal/useStore.js';

// Provider types - using WalletProvider as base type for now
// In the future, these could be imported from @walletmesh/modal-core/providers/evm etc.
type EVMProvider = WalletProvider;
type SolanaProvider = WalletProvider;

/**
 * Type guard for EVM provider
 */
function isEvmProvider(provider: WalletProvider | null, chainType: ChainType): provider is EVMProvider {
  return provider !== null && chainType === ChainTypeEnum.Evm;
}

/**
 * Type guard for Solana provider
 */
function isSolanaProvider(provider: WalletProvider | null, chainType: ChainType): provider is SolanaProvider {
  return provider !== null && chainType === ChainTypeEnum.Solana;
}

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
 *   chainType: ChainTypeEnum.Evm,
 *   name: 'Ethereum',
 *   required: true
 * };
 *
 * const provider = useChainProvider(evmChain);
 * // provider is typed as EVMProvider | null
 *
 * if (provider) {
 *   // TypeScript knows this is an EVMProvider
 *   const accounts = await provider.request({ method: 'eth_accounts' });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With a Solana chain
 * const solanaChain: SupportedChain = {
 *   chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
 *   chainType: ChainTypeEnum.Solana,
 *   name: 'Solana Mainnet',
 *   required: false
 * };
 *
 * const provider = useChainProvider(solanaChain);
 * // provider is typed as SolanaProvider | null
 *
 * if (provider) {
 *   // TypeScript knows this is a SolanaProvider
 *   const pubkey = await provider.publicKey;
 * }
 * ```
 */
export function useChainProvider<T extends ChainType>(
  chain: SupportedChain & { chainType: T },
): T extends ChainTypeEnum.Evm
  ? EVMProvider | null
  : T extends ChainTypeEnum.Solana
    ? SolanaProvider | null
    : WalletProvider | null {
  const activeSession = useStore((state: WalletMeshState) => {
    // Find session for the specified chain
    const sessions = Object.values(state.entities.sessions || {});
    return sessions.find(
      (session) => session.chain.chainId === chain.chainId && session.status === 'connected',
    );
  });

  return useMemo(() => {
    if (!activeSession || !activeSession.provider?.instance) {
      // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
      return null as any;
    }

    const provider = activeSession.provider.instance as unknown as WalletProvider;

    // Type narrowing based on chain type
    if (isEvmProvider(provider, chain.chainType)) {
      // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
      return provider as any;
    }
    if (isSolanaProvider(provider, chain.chainType)) {
      // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
      return provider as any;
    }
    // Note: Aztec support removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet

    // Fallback for unknown chain types
    // biome-ignore lint/suspicious/noExplicitAny: Conditional return type requires any cast
    return provider as any;
  }, [activeSession, chain.chainType]);
}

/**
 * Get the active provider for the current chain
 *
 * @returns The provider for the active chain or null
 *
 * @example
 * ```typescript
 * const provider = useActiveProvider();
 *
 * if (provider) {
 *   // Use provider based on current chain
 *   console.log('Connected to:', provider.chainType);
 * }
 * ```
 */
export function useActiveProvider(): WalletProvider | null {
  const activeSession = useStore((state: WalletMeshState) => {
    const activeSessionId = state.active?.sessionId;
    if (!activeSessionId) return null;

    const session = state.entities.sessions?.[activeSessionId];
    return session && session.status === 'connected' ? session : null;
  });

  return (activeSession?.provider?.instance as unknown as WalletProvider) || null;
}

/**
 * Get all connected providers grouped by chain type
 *
 * @returns Object with providers grouped by chain type
 *
 * @example
 * ```typescript
 * const providers = useProvidersByChainType();
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
export function useProvidersByChainType(): {
  evm: EVMProvider[];
  solana: SolanaProvider[];
} {
  const sessions = useStore((state: WalletMeshState) => {
    const allSessions = Object.values(state.entities.sessions || {});
    return allSessions.filter((s) => s.status === 'connected');
  });

  return useMemo(() => {
    const result = {
      evm: [] as EVMProvider[],
      solana: [] as SolanaProvider[],
    };

    for (const session of sessions) {
      if (!session.provider?.instance) continue;

      const provider = session.provider.instance as unknown as WalletProvider;
      const chainType = session.chain.chainType as ChainType;

      if (isEvmProvider(provider, chainType)) {
        result.evm.push(provider);
      } else if (isSolanaProvider(provider, chainType)) {
        result.solana.push(provider);
      }
      // Note: Aztec support removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
    }

    return result;
  }, [sessions]);
}
