/**
 * Balance service for querying native and token balances
 *
 * This service provides functionality for fetching and caching blockchain balance information,
 * including native currency balances and token balances across multiple chains.
 * It uses chain service registry for blockchain-specific operations.
 *
 * @module services/balance/BalanceService
 * @category Services
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { SupportedChain } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type { BaseChainService } from '../chains/BaseChainService.js';
import type { ChainServiceRegistry } from '../chains/ChainServiceRegistry.js';
import type { BalanceInfo, BalanceQueryOptions, TokenInfo } from './types.js';

/**
 * Service for querying and caching blockchain balances
 *
 * The BalanceService provides a unified interface for fetching native currency balances
 * and token balances across different blockchain types (EVM, Solana, Aztec). It uses
 * chain service registry for blockchain-specific operations, enabling lazy loading
 * and better separation of concerns.
 *
 * @category Services
 *
 * @example
 * ```typescript
 * // Initialize the service
 * const balanceService = new BalanceService(dependencies);
 * // Configuration is handled automatically by QueryManager
 *
 * // Get native balance
 * const nativeBalance = await balanceService.getNativeBalance({
 *   provider, // BlockchainProvider
 *   address: '0x1234...5678',
 *   chain: ethereumMainnet // SupportedChain object
 * });
 * console.log(`Balance: ${nativeBalance.formatted} ${nativeBalance.symbol}`);
 *
 * // Get token balance
 * const tokenBalance = await balanceService.getTokenBalance({
 *   provider, // BlockchainProvider
 *   address: '0x1234...5678',
 *   chain: ethereumMainnet // SupportedChain object,
 *   token: { address: '0xtoken...address', symbol: 'USDC', decimals: 6 }
 * });
 * console.log(`Token Balance: ${tokenBalance.formatted} ${tokenBalance.symbol}`);
 * ```
 */
/**
 * Dependencies required by BalanceService
 *
 * Extends the base service dependencies with chain service registry for
 * blockchain-specific balance operations. The registry enables lazy loading
 * of chain services and proper separation of concerns.
 *
 * @example
 * ```typescript
 * const dependencies: BalanceServiceDependencies = {
 *   logger: createLogger('BalanceService'),
 *   chainServiceRegistry: new ChainServiceRegistry()
 * };
 * ```
 */
export interface BalanceServiceDependencies extends BaseServiceDependencies {
  /**
   * Registry for chain-specific services
   *
   * Provides access to blockchain-specific implementations for balance queries.
   * The registry determines which service to use based on the chain ID and
   * loads services on-demand to reduce bundle size.
   */
  chainServiceRegistry: ChainServiceRegistry;
}

/**
 * Parameters for getting native balance
 *
 * Contains all required information to fetch the native currency balance
 * for an address on a specific blockchain. Native currency refers to the
 * blockchain's primary currency (ETH for Ethereum, SOL for Solana, etc.).
 *
 * @example Ethereum mainnet balance
 * ```typescript
 * const params: GetNativeBalanceParams = {
 *   provider: evmProvider,
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *   chain: ethereumMainnet // SupportedChain object,
 *   options: { useCache: true, staleTime: 30000 }
 * };
 * ```
 */
export interface GetNativeBalanceParams {
  /**
   * Blockchain provider instance for making RPC calls
   *
   * The provider must be connected and configured for the target chain.
   * Different blockchain types require different provider implementations.
   */
  provider: BlockchainProvider;

  /**
   * The address to query balance for
   *
   * Must be a valid address format for the target blockchain:
   * - EVM: 0x-prefixed hexadecimal (e.g., "0x123...")
   * - Solana: Base58-encoded address
   * - Aztec: Aztec-specific address format
   */
  address: string;

  /**
   * The chain ID to query on
   *
   * Identifies which blockchain to query. The service uses this to
   * select the appropriate chain service implementation.
   */
  chain: SupportedChain;

  /**
   * Optional query options
   *
   * Override default caching behavior for this specific query.
   * If not provided, uses the service's default configuration.
   */
  options?: BalanceQueryOptions;
}

/**
 * Parameters for getting token balance
 *
 * Contains all required information to fetch a token balance for an address.
 * Tokens are smart contract-based assets (ERC20, SPL, etc.) as opposed to
 * native blockchain currencies.
 *
 * @example ERC20 token balance
 * ```typescript
 * const params: GetTokenBalanceParams = {
 *   provider: evmProvider,
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *   chain: ethereumMainnet // SupportedChain object,
 *   token: {
 *     address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 *     symbol: 'USDC',
 *     decimals: 6
 *   }
 * };
 * ```
 *
 * @example SPL token balance on Solana
 * ```typescript
 * const params: GetTokenBalanceParams = {
 *   provider: solanaProvider,
 *   address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
 *   chain: solanaMainnet, // SupportedChain object
 *   token: {
 *     address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
 *   }
 * };
 * ```
 */
export interface GetTokenBalanceParams {
  /**
   * Blockchain provider instance for making RPC calls
   *
   * Must be configured for the blockchain where the token exists.
   * The provider is used for contract calls to fetch balance and metadata.
   */
  provider: BlockchainProvider;

  /**
   * The address to query balance for
   *
   * The wallet or account address whose token balance is being queried.
   * Must be valid for the target blockchain.
   */
  address: string;

  /**
   * The chain ID to query on
   *
   * Identifies the blockchain where the token contract exists.
   * Must match the chain the provider is connected to.
   */
  chain: SupportedChain;

  /**
   * Token information including contract address
   *
   * At minimum, must include the token's contract address.
   * Additional metadata (symbol, decimals) improves performance
   * by avoiding extra RPC calls.
   */
  token: TokenInfo;

  /**
   * Optional query options
   *
   * Control caching behavior for this query. Useful for tokens
   * with frequently changing balances or stable balances.
   */
  options?: BalanceQueryOptions;
}

/**
 * Service for querying and managing blockchain balance information
 *
 * BalanceService provides a unified interface for fetching both native currency
 * and token balances across different blockchain networks. It features:
 *
 * - **Multi-chain support**: Works with EVM, Solana, Aztec, and other chains
 * - **Intelligent caching**: Reduces RPC calls with configurable cache strategies
 * - **Lazy loading**: Chain services are loaded only when needed
 * - **Type safety**: Full TypeScript support with proper typing
 * - **Error handling**: Comprehensive error handling with detailed messages
 *
 * @remarks
 * The service uses a chain service registry to delegate blockchain-specific
 * operations, ensuring proper separation of concerns and enabling easy
 * addition of new blockchain support.
 *
 * @example Basic usage
 * ```typescript
 * const balanceService = new BalanceService({
 *   logger: createLogger('BalanceService'),
 *   chainServiceRegistry: registry
 * });
 *
 * // Configuration is handled automatically by QueryManager
 *
 * // Get native balance
 * const ethBalance = await balanceService.getNativeBalance({
 *   provider,
 *   address: '0x...',
 *   chain: ethereumMainnet // SupportedChain object
 * });
 *
 * // Get token balance
 * const usdcBalance = await balanceService.getTokenBalance({
 *   provider,
 *   address: '0x...',
 *   chain: ethereumMainnet // SupportedChain object,
 *   token: { address: '0x...', symbol: 'USDC', decimals: 6 }
 * });
 * ```
 */
export class BalanceService {
  private logger: Logger;
  private chainServiceRegistry: ChainServiceRegistry;

  /**
   * Creates a new BalanceService instance
   *
   * @param dependencies - Required service dependencies
   * @param dependencies.logger - Logger instance for debugging and error tracking
   * @param dependencies.chainServiceRegistry - Registry for chain-specific services
   *
   * @example
   * ```typescript
   * const balanceService = new BalanceService({
   *   logger: createLogger('BalanceService'),
   *   chainServiceRegistry: new ChainServiceRegistry()
   * });
   * ```
   */
  constructor(dependencies: BalanceServiceDependencies) {
    this.logger = dependencies.logger;
    this.chainServiceRegistry = dependencies.chainServiceRegistry;
  }

  /**
   * Get native balance for an address
   *
   * Fetches the native currency balance (ETH, SOL, etc.) for a given address on a specific chain.
   * Results are cached based on the configured cache settings. This method uses chain service
   * registry to delegate blockchain-specific operations.
   *
   * @param params - Parameters for getting native balance
   * @returns Promise resolving to balance information
   *
   * @throws {ModalError} Configuration error if chain service is not available
   * @throws {ModalError} Configuration error if balance fetch fails
   *
   * @example
   * ```typescript
   * const balance = await balanceService.getNativeBalance({
   *   provider, // BlockchainProvider
   *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
   *   chain: ethereumMainnet // SupportedChain object
   * });
   * console.log(`${balance.formatted} ${balance.symbol}`);
   * // Output: "1.234 ETH"
   * ```
   */
  async getNativeBalance(params: GetNativeBalanceParams): Promise<BalanceInfo> {
    const { provider, address, chain } = params;

    try {
      // Get chain service (lazy loaded on first use)
      const chainService = await this.getChainService(chain);

      // Delegate to chain service for blockchain-specific logic
      const chainBalance = await chainService.getNativeBalance(provider, address, chain.chainId);

      // Convert to BalanceInfo format
      const balanceInfo: BalanceInfo = {
        value: chainBalance.value,
        formatted: chainBalance.formatted,
        symbol: chainBalance.symbol,
        decimals: chainBalance.decimals,
      };

      this.logger.debug('Native balance fetched successfully', {
        address,
        chainId: chain.chainId,
        balance: balanceInfo.formatted,
        symbol: balanceInfo.symbol,
      });

      return balanceInfo;
    } catch (error) {
      this.logger.error('Failed to fetch native balance', {
        address,
        chainId: chain.chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'BalanceService');
    }
  }

  /**
   * Get token balance for an address
   *
   * Fetches the balance of a specific token (ERC20, SPL, etc.) for a given address.
   * If token metadata is not provided, it will be fetched automatically.
   * Results are cached based on the configured cache settings.
   *
   * @param params - Parameters for getting token balance
   * @returns Promise resolving to balance information
   *
   * @throws {ModalError} Configuration error if chain service is not available
   * @throws {ModalError} Configuration error if token balance fetch fails
   *
   * @example
   * ```typescript
   * const usdcBalance = await balanceService.getTokenBalance({
   *   provider, // BlockchainProvider
   *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
   *   chain: ethereumMainnet // SupportedChain object,
   *   token: {
   *     address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
   *     symbol: 'USDC',
   *     decimals: 6
   *   }
   * });
   * console.log(`${usdcBalance.formatted} ${usdcBalance.symbol}`);
   * // Output: "1,000.50 USDC"
   * ```
   */
  async getTokenBalance(params: GetTokenBalanceParams): Promise<BalanceInfo> {
    const { provider, address, chain, token } = params;

    try {
      // Get chain service (lazy loaded on first use)
      const chainService = await this.getChainService(chain);

      // Convert TokenInfo to ChainTokenInfo
      const chainToken = {
        address: token.address,
        symbol: token.symbol || 'TOKEN',
        decimals: token.decimals || 18,
      };

      // Delegate to chain service for blockchain-specific logic
      const chainBalance = await chainService.getTokenBalance(provider, address, chain.chainId, chainToken);

      // Convert to BalanceInfo format
      const balanceInfo: BalanceInfo = {
        value: chainBalance.value,
        formatted: chainBalance.formatted,
        symbol: chainBalance.symbol,
        decimals: chainBalance.decimals,
      };

      this.logger.debug('Token balance fetched successfully', {
        address,
        chainId: chain.chainId,
        tokenAddress: token.address,
        balance: balanceInfo.formatted,
        symbol: balanceInfo.symbol,
      });

      return balanceInfo;
    } catch (error) {
      this.logger.error('Failed to fetch token balance', {
        address,
        chainId: chain.chainId,
        tokenAddress: token.address,
        error,
      });

      throw ErrorFactory.fromError(error, 'BalanceService');
    }
  }

  /**
   * Cleanup resources
   *
   * This method is kept for compatibility but no longer needs to clean up internal cache.
   *
   * @example
   * ```typescript
   * // On component unmount or service disposal
   * balanceService.cleanup();
   * ```
   */
  cleanup(): void {
    this.logger.debug('BalanceService cleanup completed');
  }

  // Private methods

  /**
   * Get chain service for a specific chain ID
   *
   * This method demonstrates the lazy loading pattern:
   * 1. Registry determines which chain type handles this chainId
   * 2. Only loads the specific chain service when needed
   * 3. Caches the loaded service for future use
   *
   * @param chainId - The blockchain identifier
   * @returns Promise resolving to the appropriate chain service
   *
   * @throws {ModalError} Configuration error if no service is available for the chain
   *
   * @remarks
   * Chain services are loaded dynamically to reduce bundle size. Only the
   * services for chains actually used by the application are loaded.
   */
  private async getChainService(chain: SupportedChain): Promise<BaseChainService> {
    try {
      // Get chain service from registry (chain type is determined internally)
      const chainService = await this.chainServiceRegistry.getChainService(chain.chainId);

      if (!chainService) {
        throw ErrorFactory.configurationError(`No chain service available for chain ${chain.chainId}`, {
          chainId: chain.chainId,
        });
      }

      return chainService;
    } catch (error) {
      this.logger.error('Failed to get chain service', { chainId: chain.chainId, error });
      throw ErrorFactory.fromError(error, 'BalanceService');
    }
  }
}

/**
 * Factory function to create BalanceService with chain service registry
 *
 * Provides a convenient way to instantiate BalanceService with proper
 * dependency injection. This is the recommended way to create service instances.
 *
 * @param dependencies - Required service dependencies
 * @returns Configured BalanceService instance
 *
 * @example
 * ```typescript
 * const balanceService = createBalanceService({
 *   logger: createLogger('BalanceService'),
 *   chainServiceRegistry: registry
 * });
 *
 * // Configuration is handled automatically by QueryManager
 * ```
 */
export function createBalanceService(dependencies: BalanceServiceDependencies): BalanceService {
  return new BalanceService(dependencies);
}
