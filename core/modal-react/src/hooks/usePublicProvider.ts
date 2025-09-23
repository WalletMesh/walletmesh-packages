/**
 * Public provider access hook for WalletMesh
 *
 * Provides access to dApp-specified RPC endpoints for read operations,
 * separating infrastructure concerns between read and write operations.
 *
 * @module hooks/usePublicProvider
 */

import type { PublicProvider, SupportedChain } from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { useStore } from './internal/useStore.js';

/**
 * Public provider information with type safety
 *
 * @public
 */
export interface PublicProviderInfo {
  /** The public provider instance */
  provider: PublicProvider | null;
  /** Whether provider is available */
  isAvailable: boolean;
  /** Chain this provider is for */
  chain: SupportedChain | null;
}

/**
 * Hook for accessing public providers for read operations
 *
 * Returns a public provider that uses dApp-specified RPC endpoints
 * for blockchain read operations, allowing applications to control
 * their infrastructure and costs.
 *
 * @param chain - Optional chain to get provider for. If not specified, uses current chain.
 * @returns Public provider information
 *
 * @since 1.0.0
 *
 * @remarks
 * Public providers are ideal for:
 * - Reading blockchain state (balances, contract data)
 * - Estimating gas prices
 * - Querying transaction status
 * - Any read-only operation
 *
 * They use your application's RPC endpoints configured in the
 * chains array passed to WalletMeshProvider.
 *
 * @example
 * ```tsx
 * import { usePublicProvider } from '@walletmesh/modal-react';
 *
 * function BlockNumber() {
 *   const { provider, isAvailable } = usePublicProvider();
 *   const [blockNumber, setBlockNumber] = useState<number | null>(null);
 *
 *   useEffect(() => {
 *     if (!isAvailable || !provider) return;
 *
 *     const fetchBlockNumber = async () => {
 *       const block = await provider.request({
 *         method: 'eth_blockNumber'
 *       });
 *       setBlockNumber(parseInt(block as string, 16));
 *     };
 *
 *     fetchBlockNumber();
 *     const interval = setInterval(fetchBlockNumber, 12000);
 *
 *     return () => clearInterval(interval);
 *   }, [provider, isAvailable]);
 *
 *   if (!isAvailable) return <div>No provider available</div>;
 *
 *   return <div>Block: {blockNumber}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Query specific chain
 * function PolygonBalance() {
 *   const { provider } = usePublicProvider({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' });
 *   const [balance, setBalance] = useState<string>('0');
 *
 *   const checkBalance = async (address: string) => {
 *     if (!provider) return;
 *
 *     const balance = await provider.request({
 *       method: 'eth_getBalance',
 *       params: [address, 'latest']
 *     });
 *
 *     setBalance(balance as string);
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         placeholder="Enter address"
 *         onBlur={(e) => checkBalance(e.target.value)}
 *       />
 *       <p>Balance: {balance}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Read contract data
 * function ContractReader() {
 *   const { provider } = usePublicProvider();
 *
 *   const readContract = async () => {
 *     if (!provider) return;
 *
 *     const data = await provider.request({
 *       method: 'eth_call',
 *       params: [{
 *         to: '0xContractAddress',
 *         data: '0xMethodSelector'
 *       }, 'latest']
 *     });
 *
 *     console.log('Contract data:', data);
 *   };
 *
 *   return (
 *     <button onClick={readContract}>
 *       Read Contract
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function usePublicProvider(chain?: SupportedChain): PublicProviderInfo {
  const { client } = useWalletMeshContext();

  // Get current chain from state if not specified
  const currentChain = useStore((state) => {
    const activeSessionId = state.active?.sessionId;
    const activeSession = activeSessionId ? state.entities.sessions?.[activeSessionId] : null;
    return activeSession?.chain || null;
  });

  const targetChain = chain || currentChain;

  // Get public provider for the chain
  const providerInfo = useMemo<PublicProviderInfo>(() => {
    if (!client || !targetChain) {
      return {
        provider: null,
        isAvailable: false,
        chain: null,
      };
    }

    const provider = client.getPublicProvider(targetChain.chainId);

    return {
      provider,
      isAvailable: Boolean(provider),
      chain: targetChain,
    };
  }, [client, targetChain]);

  return providerInfo;
}
