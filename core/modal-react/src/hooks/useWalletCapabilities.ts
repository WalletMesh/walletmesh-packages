/**
 * Wallet capabilities discovery hook for WalletMesh
 *
 * Provides information about what a wallet supports including provider types,
 * chains, methods, and features.
 *
 * @module hooks/useWalletCapabilities
 */

import type { ChainType } from '@walletmesh/modal-core';
import type { WalletCapabilities } from '@walletmesh/modal-core';
import { useCallback, useEffect, useState } from 'react';
import { useWalletTransport } from './useWalletTransport.js';

/**
 * Wallet capabilities information
 *
 * @public
 */
export interface WalletCapabilitiesInfo {
  /** The wallet capabilities */
  capabilities: WalletCapabilities | null;
  /** Whether capabilities are being loaded */
  isLoading: boolean;
  /** Error loading capabilities */
  error: Error | null;
  /** Check if a chain type is supported */
  supportsChain: (type: ChainType) => boolean;
  /** Check if a method is supported */
  supportsMethod: (method: string) => boolean;
  /** Check if a chain is supported by chain ID */
  supportsChainId: (chainId: string) => boolean;
  /** Refresh capabilities */
  refresh: () => Promise<void>;
}

/**
 * Hook for discovering wallet capabilities
 *
 * Returns information about what a wallet supports, including provider types,
 * blockchain networks, RPC methods, and features. This enables dApps to
 * adapt their UI and functionality based on wallet capabilities.
 *
 * @returns Wallet capabilities information
 *
 * @since 1.0.0
 *
 * @remarks
 * Capabilities are automatically loaded when a wallet connects and can be
 * manually refreshed. Use this to:
 * - Show/hide UI elements based on wallet support
 * - Choose appropriate provider types
 * - Validate operations before attempting them
 * - Display wallet feature information to users
 *
 * @example
 * ```tsx
 * import { useWalletCapabilities, ProviderType } from '@walletmesh/modal-react';
 *
 * function WalletInfo() {
 *   const {
 *     capabilities,
 *     supportsProvider,
 *     supportsMethod,
 *     supportsChain,
 *     isLoading,
 *   } = useWalletCapabilities();
 *
 *   if (isLoading) {
 *     return <div>Loading wallet capabilities...</div>;
 *   }
 *
 *   if (!capabilities) {
 *     return <div>Connect wallet to see capabilities</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>Wallet Capabilities</h3>
 *       <ul>
 *         <li>Accounts: {capabilities.accounts.join(', ')}</li>
 *         <li>Chains: {capabilities.chains.map(c => c.chainId).join(', ')}</li>
 *         <li>Provider Types: {capabilities.providerTypes.join(', ')}</li>
 *         <li>Methods: {capabilities.methods.length} supported</li>
 *       </ul>
 *
 *       <h4>Feature Support</h4>
 *       <ul>
 *         <li>EVM: {supportsProvider(ProviderType.EIP1193) ? '✅' : '❌'}</li>
 *         <li>Aztec: {supportsProvider(ProviderType.AztecWallet) ? '✅' : '❌'}</li>
 *         <li>Solana: {supportsProvider(ProviderType.Solana) ? '✅' : '❌'}</li>
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional UI based on capabilities
 * function ConditionalOperations() {
 *   const { supportsProvider, supportsMethod } = useWalletCapabilities();
 *
 *   return (
 *     <div>
 *       {supportsProvider(ProviderType.EIP1193) && (
 *         <button>Send ETH Transaction</button>
 *       )}
 *
 *       {supportsProvider(ProviderType.AztecWallet) && (
 *         <button>Private Transaction</button>
 *       )}
 *
 *       {supportsMethod('wallet_switchEthereumChain') && (
 *         <button>Switch Network</button>
 *       )}
 *
 *       {supportsMethod('eth_signTypedData_v4') && (
 *         <button>Sign Typed Data</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Multi-chain support detection
 * function MultiChainDetection() {
 *   const { capabilities, supportsChain } = useWalletCapabilities();
 *
 *   const mainnetSupported = supportsChain('0x1');
 *   const polygonSupported = supportsChain('0x89');
 *   const arbitrumSupported = supportsChain('0xa4b1');
 *
 *   return (
 *     <div>
 *       <h3>Network Support</h3>
 *       <ul>
 *         <li>Ethereum Mainnet: {mainnetSupported ? '✅' : '❌'}</li>
 *         <li>Polygon: {polygonSupported ? '✅' : '❌'}</li>
 *         <li>Arbitrum: {arbitrumSupported ? '✅' : '❌'}</li>
 *       </ul>
 *       {capabilities && (
 *         <p>Total chains supported: {capabilities.chains.length}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useWalletCapabilities(): WalletCapabilitiesInfo {
  const { transport, isAvailable } = useWalletTransport();
  const [capabilities, setCapabilities] = useState<WalletCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load capabilities when transport becomes available
  const loadCapabilities = useCallback(async () => {
    if (!transport) {
      setCapabilities(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const caps = await transport.getCapabilities();
      setCapabilities(caps as WalletCapabilities);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load capabilities'));
      setCapabilities(null);
    } finally {
      setIsLoading(false);
    }
  }, [transport]);

  // Auto-load when transport changes
  useEffect(() => {
    if (isAvailable && transport) {
      loadCapabilities();
    } else {
      setCapabilities(null);
      setError(null);
    }
  }, [transport, isAvailable, loadCapabilities]);

  // Helper functions
  const supportsChain = (type: ChainType): boolean => {
    if (!capabilities) return false;
    return capabilities.chains.some((chain) => chain.type === type);
  };

  const supportsMethod = (method: string): boolean => {
    if (!capabilities) return false;
    // Check if method is supported in permissions
    return capabilities.permissions?.methods.includes(method) || false;
  };

  const supportsChainId = (chainId: string): boolean => {
    if (!capabilities) return false;
    return capabilities.chains.some((chain) => {
      if (chain.chainIds === '*') return true;
      if (Array.isArray(chain.chainIds)) {
        return chain.chainIds.some((id) => id.toLowerCase() === chainId.toLowerCase());
      }
      return false;
    });
  };

  return {
    capabilities,
    isLoading,
    error,
    supportsChain,
    supportsMethod,
    supportsChainId,
    refresh: loadCapabilities,
  };
}
