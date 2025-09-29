/**
 * Wallet Provider Fallback implementation for public provider operations
 *
 * This wrapper allows using a wallet provider as a fallback for public provider
 * operations when no dApp RPC endpoints are configured. It restricts access to
 * only read-only methods for security.
 *
 * @module providers/WalletProviderFallbackWrapper
 * @packageDocumentation
 */

import { isAztecRouterProvider, isEvmProvider } from '../api/types/guards.js';
import type { PublicProvider, WalletProvider } from '../api/types/providers.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { ChainType } from '../types.js';

/**
 * List of allowed read-only methods for public provider operations
 */
const READ_ONLY_METHODS = new Set([
  // EVM read methods
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_estimateGas',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getLogs',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_maxPriorityFeePerGas',
  'eth_feeHistory',
  'net_version',
  'net_listening',
  'net_peerCount',
  'web3_clientVersion',
  'web3_sha3',

  // Solana read methods
  'getAccountInfo',
  'getBalance',
  'getBlock',
  'getBlockHeight',
  'getBlockProduction',
  'getBlockCommitment',
  'getBlocks',
  'getBlocksWithLimit',
  'getBlockTime',
  'getClusterNodes',
  'getEpochInfo',
  'getEpochSchedule',
  'getFeeForMessage',
  'getFirstAvailableBlock',
  'getGenesisHash',
  'getHealth',
  'getHighestSnapshotSlot',
  'getIdentity',
  'getInflationGovernor',
  'getInflationRate',
  'getInflationReward',
  'getLargestAccounts',
  'getLatestBlockhash',
  'getLeaderSchedule',
  'getMaxRetransmitSlot',
  'getMaxShredInsertSlot',
  'getMinimumBalanceForRentExemption',
  'getMultipleAccounts',
  'getProgramAccounts',
  'getRecentBlockhash',
  'getRecentPerformanceSamples',
  'getRecentPrioritizationFees',
  'getSignaturesForAddress',
  'getSignatureStatuses',
  'getSlot',
  'getSlotLeader',
  'getSlotLeaders',
  'getStakeActivation',
  'getStakeMinimumDelegation',
  'getSupply',
  'getTokenAccountBalance',
  'getTokenAccountsByDelegate',
  'getTokenAccountsByOwner',
  'getTokenLargestAccounts',
  'getTokenSupply',
  'getTransaction',
  'getTransactionCount',
  'getVersion',
  'getVoteAccounts',
  'minimumLedgerSlot',

  // Aztec read methods
  'getBlock',
  'getBlocks',
  'getBlockNumber',
  'getChainId',
  'getVersion',
  'getNodeInfo',
  'getTxReceipt',
  'getTxEffect',
  'getContractData',
  'getContractClass',
  'getContractClassIds',
  'getContractClassRegistrationDate',
  'getPublicStorageAt',
  'getNullifierMembershipWitness',
  'isContractClassPubliclyRegistered',
  'isContractPublished',
]);

/**
 * Wallet provider fallback wrapper that restricts access to read-only methods
 *
 * @public
 */
export class WalletProviderFallbackWrapper implements PublicProvider {
  /**
   * Create a new wallet provider fallback wrapper
   *
   * @param walletProvider - The wallet provider to wrap
   * @param chainId - Chain ID this provider is for
   * @param chainType - Type of blockchain
   */
  constructor(
    private readonly walletProvider: WalletProvider,
    public readonly chainId: string,
    public readonly chainType: ChainType,
  ) {}

  /**
   * Make a read-only JSON-RPC request through the wallet provider
   *
   * @param args - RPC method and parameters
   * @returns The RPC response
   * @throws If the method is not allowed or the RPC call fails
   */
  async request<T = unknown>(args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    // Check if the method is allowed for public provider operations
    if (!READ_ONLY_METHODS.has(args.method)) {
      throw ErrorFactory.transportError(
        `Method '${args.method}' is not allowed for public provider operations. Only read-only methods are permitted.`,
        'WalletProviderFallback',
      );
    }

    try {
      // Forward the request to the appropriate provider type
      if (isEvmProvider(this.walletProvider)) {
        // EVM providers have the request() method
        const result = await this.walletProvider.request(args);
        return result as T;
      }
      if (isAztecRouterProvider(this.walletProvider)) {
        // Aztec providers use the call() method
        const result = await this.walletProvider.call({
          method: args.method,
          params: Array.isArray(args.params) ? args.params : args.params ? [args.params] : [],
        });
        return result as T;
      }
      // For other providers, we can't make generic requests
      throw ErrorFactory.transportError(
        'Provider type does not support generic request method. Use provider-specific methods instead.',
        'WalletProviderFallback',
      );
    } catch (error) {
      // Re-throw with proper error context
      throw ErrorFactory.transportError(
        `Wallet provider fallback RPC call failed: ${args.method}`,
        'WalletProviderFallback',
      );
    }
  }
}
