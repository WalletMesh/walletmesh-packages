/**
 * Solana Chain Service Implementation
 *
 * Handles Solana-specific operations like balance queries, transactions,
 * and SPL token operations. This implementation will only be loaded when
 * Solana chains are actually used.
 *
 * @module services/chains/solana/SolanaChainService
 */

import type { BlockchainProvider } from '../../../api/types/chainProviders.js';
import { ErrorFactory } from '../../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../../internal/core/logger/logger.js';
import { ChainType } from '../../../types.js';
// ChainId type has been removed
import {
  BaseChainService,
  type ChainBalanceInfo,
  type ChainTokenInfo,
  type ChainTransactionParams,
  type ChainTransactionResult,
} from '../BaseChainService.js';

/**
 * Solana-specific provider interface
 *
 * Note: In a real implementation, this would import types from @solana/web3.js
 * but since this is lazy loaded, those imports only happen when Solana is used.
 */
interface SolanaProvider {
  publicKey: unknown; // PublicKey from @solana/web3.js
  connection: {
    getBalance: (pubkey: unknown) => Promise<number>;
    getTokenAccountsByOwner: (owner: unknown, filter: unknown) => Promise<unknown>;
    sendTransaction: (transaction: unknown, signers?: unknown[]) => Promise<string>;
    getTransaction: (signature: string) => Promise<unknown>;
    getRecentBlockhash: () => Promise<{ blockhash: string; feeCalculator: unknown }>;
  };
  signTransaction?: (transaction: unknown) => Promise<unknown>;
  signAllTransactions?: (transactions: unknown[]) => Promise<unknown[]>;
}

/**
 * Chain service implementation for Solana blockchain
 *
 * Handles SOL native balance, SPL tokens, and Solana transactions.
 * Only loaded when Solana functionality is needed.
 */
export class SolanaChainService extends BaseChainService {
  private static readonly supportedChains = new Set([
    'mainnet-beta', // Solana Mainnet
    'testnet', // Solana Testnet
    'devnet', // Solana Devnet
    'localnet', // Local Solana cluster
  ]);

  constructor(logger: Logger) {
    super(ChainType.Solana, logger);
    this.logger.debug('SolanaChainService initialized');
  }

  async getNativeBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
  ): Promise<ChainBalanceInfo> {
    const solanaProvider = this.validateSolanaProvider(provider);

    try {
      // In a real implementation, this would use @solana/web3.js types
      const balance = await solanaProvider.connection.getBalance(solanaProvider.publicKey);

      const decimals = 9; // SOL has 9 decimals
      const value = BigInt(balance);

      return {
        value: value.toString(),
        formatted: this.formatBalance(value, decimals),
        symbol: 'SOL',
        decimals,
        metadata: {
          chainId,
          cluster: this.getClusterFromChainId(chainId),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch Solana native balance', {
        address,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async getTokenBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
    token: ChainTokenInfo,
  ): Promise<ChainBalanceInfo> {
    const solanaProvider = this.validateSolanaProvider(provider);

    try {
      // In a real implementation, this would:
      // 1. Import @solana/web3.js and @solana/spl-token
      // 2. Create PublicKey from token.address (mint address)
      // 3. Get token accounts for the wallet
      // 4. Find the specific token account
      // 5. Get the balance from that account

      // Placeholder implementation
      const balance = await this.getSPLTokenBalance(solanaProvider, token.address, address);

      return {
        value: balance.value.toString(),
        formatted: this.formatBalance(BigInt(balance.value), balance.decimals),
        symbol: token.symbol || balance.symbol,
        decimals: balance.decimals,
        metadata: {
          chainId,
          tokenMint: token.address,
          cluster: this.getClusterFromChainId(chainId),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch Solana token balance', {
        address,
        chainId,
        tokenAddress: token.address,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async getTokenMetadata(
    provider: BlockchainProvider,
    tokenAddress: string,
    chainId: string,
  ): Promise<{ symbol: string; name: string; decimals: number }> {
    const solanaProvider = this.validateSolanaProvider(provider);

    try {
      // In a real implementation, this would:
      // 1. Import @solana/spl-token-registry or @metaplex-foundation/mpl-token-metadata
      // 2. Query token metadata from the mint account
      // 3. Parse the metadata to get symbol, name, decimals

      // Placeholder implementation
      const metadata = await this.getSPLTokenMetadata(solanaProvider, tokenAddress);

      return {
        symbol: metadata.symbol,
        name: metadata.name,
        decimals: metadata.decimals,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Solana token metadata', {
        tokenAddress,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async sendTransaction(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<ChainTransactionResult> {
    const solanaProvider = this.validateSolanaProvider(provider);

    try {
      // In a real implementation, this would:
      // 1. Import @solana/web3.js
      // 2. Create a Transaction object
      // 3. Add instructions based on params
      // 4. Sign and send the transaction

      // Extract Solana-specific parameters
      const solanaParams = params.chainSpecific as {
        instructions?: unknown[];
        recentBlockhash?: string;
      };

      const transaction = await this.createSolanaTransaction(params, solanaParams, chainId);

      // Sign and send transaction
      const signature = await solanaProvider.connection.sendTransaction(
        transaction,
        [], // signers would be handled by the wallet
      );

      return {
        hash: signature,
        success: true,
        chainSpecific: {
          chainId,
          cluster: this.getClusterFromChainId(chainId),
          signature,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send Solana transaction', {
        params,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async getTransactionReceipt(
    provider: BlockchainProvider,
    hash: string,
    chainId: string,
  ): Promise<ChainTransactionResult | null> {
    const solanaProvider = this.validateSolanaProvider(provider);

    try {
      const transaction = await solanaProvider.connection.getTransaction(hash);

      if (!transaction) {
        return null;
      }

      // In a real implementation, would parse the transaction response
      const txData = transaction as {
        meta?: { err: unknown };
        slot?: number;
      };

      const result: ChainTransactionResult = {
        hash,
        success: !txData.meta?.err,
        chainSpecific: {
          chainId,
          cluster: this.getClusterFromChainId(chainId),
          transaction: txData,
        },
      };

      if (txData.slot !== undefined) {
        result.blockNumber = txData.slot;
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get Solana transaction receipt', {
        hash,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async estimateGas(
    _provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<string> {
    // Solana uses a different fee model than gas
    // In a real implementation, this would calculate the transaction fee

    try {
      // Basic fee calculation - in practice would be more sophisticated
      const baseFee = 5000; // 0.000005 SOL in lamports
      const computeUnits = (params.chainSpecific?.['computeUnits'] as number) || 200000;

      // Simple fee estimation
      const estimatedFee = baseFee + Math.floor(computeUnits / 1000);

      return estimatedFee.toString();
    } catch (error) {
      this.logger.error('Failed to estimate Solana transaction fee', {
        params,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  async getGasPrice(_provider: BlockchainProvider, chainId: string): Promise<string> {
    // Solana doesn't use gas price in the same way as EVM
    // This returns the base fee per signature

    try {
      // In a real implementation, would query current fees
      const baseFee = 5000; // lamports per signature
      return baseFee.toString();
    } catch (error) {
      this.logger.error('Failed to get Solana fees', {
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'SolanaChainService');
    }
  }

  supportsChain(chainId: string): boolean {
    return SolanaChainService.supportedChains.has(String(chainId));
  }

  // Private helper methods

  private validateSolanaProvider(provider: BlockchainProvider): SolanaProvider {
    if (!this.isSolanaProvider(provider)) {
      throw ErrorFactory.configurationError('Invalid provider: Solana provider required', {
        providerType: typeof provider,
      });
    }
    return provider as SolanaProvider;
  }

  private isSolanaProvider(provider: unknown): provider is SolanaProvider {
    return (
      provider !== null &&
      typeof provider === 'object' &&
      'publicKey' in provider &&
      'connection' in provider &&
      typeof (provider as { connection?: unknown }).connection === 'object'
    );
  }

  private getClusterFromChainId(chainId: string): string {
    const clusters: Record<string, string> = {
      'mainnet-beta': 'mainnet-beta',
      testnet: 'testnet',
      devnet: 'devnet',
      localnet: 'localnet',
    };

    return clusters[String(chainId)] || 'mainnet-beta';
  }

  private async getSPLTokenBalance(
    _provider: SolanaProvider,
    mintAddress: string,
    ownerAddress: string,
  ): Promise<{ value: number; decimals: number; symbol: string }> {
    // Placeholder implementation
    // In reality, would:
    // 1. Create PublicKey from mintAddress
    // 2. Get token accounts by owner
    // 3. Filter by mint
    // 4. Get account info and parse balance

    this.logger.debug('Getting SPL token balance', { mintAddress, ownerAddress });

    // Mock response
    return {
      value: 0,
      decimals: 6, // Common for many SPL tokens
      symbol: 'SPL',
    };
  }

  private async getSPLTokenMetadata(
    _provider: SolanaProvider,
    mintAddress: string,
  ): Promise<{ symbol: string; name: string; decimals: number }> {
    // Placeholder implementation
    // In reality, would query token metadata

    this.logger.debug('Getting SPL token metadata', { mintAddress });

    // Mock response
    return {
      symbol: 'SPL',
      name: 'SPL Token',
      decimals: 6,
    };
  }

  private async createSolanaTransaction(
    params: ChainTransactionParams,
    solanaParams: { instructions?: unknown[]; recentBlockhash?: string },
    chainId: string,
  ): Promise<unknown> {
    // Placeholder implementation
    // In reality, would:
    // 1. Import @solana/web3.js
    // 2. Create Transaction
    // 3. Add instructions
    // 4. Set recent blockhash

    this.logger.debug('Creating Solana transaction', {
      params,
      solanaParams,
      chainId,
    });

    // Mock transaction object
    return {
      instructions: solanaParams.instructions || [],
      recentBlockhash: solanaParams.recentBlockhash,
      feePayer: params.from,
    };
  }
}

/**
 * Factory function to create Solana chain service
 */
export function createSolanaChainService(logger: Logger): Promise<SolanaChainService> {
  return Promise.resolve(new SolanaChainService(logger));
}

/**
 * Default export for dynamic imports
 */
export default createSolanaChainService;
