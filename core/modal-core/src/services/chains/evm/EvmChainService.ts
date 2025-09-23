/**
 * EVM Chain Service Implementation
 *
 * Handles EVM-specific operations like balance queries, transactions,
 * and gas estimation. This implementation will only be loaded when
 * EVM chains are actually used.
 *
 * @module services/chains/evm/EVMChainService
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
 * EVM-specific provider interface
 */
interface EVMProvider {
  request(args: { method: string; params: unknown[] }): Promise<string>;
}

/**
 * Chain service implementation for EVM-compatible blockchains
 *
 * Handles Ethereum, Polygon, Arbitrum, Optimism, and other EVM chains.
 * Only loaded when EVM functionality is needed.
 */
export class EVMChainService extends BaseChainService {
  private static readonly supportedChains = new Set([
    '1', // Ethereum Mainnet
    '137', // Polygon
    '42161', // Arbitrum One
    '10', // Optimism
    '8453', // Base
    '56', // BSC
    '43114', // Avalanche
    '250', // Fantom
    '5', // Goerli
    '80001', // Mumbai
  ]);

  constructor(logger: Logger) {
    super(ChainType.Evm, logger);
    this.logger.debug('EVMChainService initialized');
  }

  async getNativeBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
  ): Promise<ChainBalanceInfo> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const balanceHex = await evmProvider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const value = BigInt(balanceHex);
      const decimals = 18; // ETH decimals
      const symbol = this.getChainNativeSymbol(chainId);

      return {
        value: value.toString(),
        formatted: this.formatBalance(value, decimals),
        symbol,
        decimals,
        metadata: {
          chainId,
          blockTag: 'latest',
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch EVM native balance', {
        address,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async getTokenBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
    token: ChainTokenInfo,
  ): Promise<ChainBalanceInfo> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      // Encode balanceOf call
      const data = this.encodeERC20Call('balanceOf', [address]);

      const balanceHex = await evmProvider.request({
        method: 'eth_call',
        params: [
          {
            to: token.address,
            data,
          },
          'latest',
        ],
      });

      const value = BigInt(balanceHex);

      // Get token metadata if not provided
      let { symbol, decimals } = token;
      if (!symbol || decimals === undefined) {
        const metadata = await this.getTokenMetadata(provider, token.address, chainId);
        symbol = symbol || metadata.symbol;
        decimals = decimals ?? metadata.decimals;
      }

      return {
        value: value.toString(),
        formatted: this.formatBalance(value, decimals || 18),
        symbol: symbol || 'TOKEN',
        decimals: decimals || 18,
        metadata: {
          chainId,
          tokenAddress: token.address,
          blockTag: 'latest',
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch EVM token balance', {
        address,
        chainId,
        tokenAddress: token.address,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async getTokenMetadata(
    provider: BlockchainProvider,
    tokenAddress: string,
    chainId: string,
  ): Promise<{ symbol: string; name: string; decimals: number }> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const [symbolResult, nameResult, decimalsResult] = await Promise.all([
        evmProvider.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: this.encodeERC20Call('symbol', []) }, 'latest'],
        }),
        evmProvider.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: this.encodeERC20Call('name', []) }, 'latest'],
        }),
        evmProvider.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: this.encodeERC20Call('decimals', []) }, 'latest'],
        }),
      ]);

      return {
        symbol: this.decodeString(symbolResult),
        name: this.decodeString(nameResult),
        decimals: Number.parseInt(decimalsResult, 16),
      };
    } catch (error) {
      this.logger.error('Failed to fetch EVM token metadata', {
        tokenAddress,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async sendTransaction(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<ChainTransactionResult> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const txParams = {
        from: params.from,
        to: params.to,
        value: params.value ? `0x${BigInt(params.value).toString(16)}` : undefined,
        data: params.data,
        gasLimit: params.gasLimit ? `0x${BigInt(params.gasLimit).toString(16)}` : undefined,
        ...params.chainSpecific,
      };

      const hash = await evmProvider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return {
        hash,
        success: true,
        chainSpecific: {
          chainId,
          txParams,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send EVM transaction', {
        params,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async getTransactionReceipt(
    provider: BlockchainProvider,
    hash: string,
    chainId: string,
  ): Promise<ChainTransactionResult | null> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const receipt = await evmProvider.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });

      if (!receipt || receipt === '0x') {
        return null;
      }

      const receiptObj = JSON.parse(receipt);

      return {
        hash,
        success: receiptObj.status === '0x1',
        blockNumber: Number.parseInt(receiptObj.blockNumber, 16),
        gasUsed: BigInt(receiptObj.gasUsed).toString(),
        chainSpecific: {
          chainId,
          receipt: receiptObj,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get EVM transaction receipt', {
        hash,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async estimateGas(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<string> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const txParams = {
        from: params.from,
        to: params.to,
        value: params.value ? `0x${BigInt(params.value).toString(16)}` : undefined,
        data: params.data,
        ...params.chainSpecific,
      };

      const gasHex = await evmProvider.request({
        method: 'eth_estimateGas',
        params: [txParams],
      });

      return BigInt(gasHex).toString();
    } catch (error) {
      this.logger.error('Failed to estimate EVM gas', {
        params,
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  async getGasPrice(provider: BlockchainProvider, chainId: string): Promise<string> {
    const evmProvider = this.validateEVMProvider(provider);

    try {
      const gasPriceHex = await evmProvider.request({
        method: 'eth_gasPrice',
        params: [],
      });

      return BigInt(gasPriceHex).toString();
    } catch (error) {
      this.logger.error('Failed to get EVM gas price', {
        chainId,
        error,
      });

      throw ErrorFactory.fromError(error, 'EVMChainService');
    }
  }

  supportsChain(chainId: string): boolean {
    return EVMChainService.supportedChains.has(String(chainId));
  }

  // Private helper methods

  private validateEVMProvider(provider: BlockchainProvider): EVMProvider {
    if (!this.isEVMProvider(provider)) {
      throw ErrorFactory.configurationError('Invalid provider: EVM provider required', {
        providerType: typeof provider,
      });
    }
    return provider as EVMProvider;
  }

  private isEVMProvider(provider: unknown): provider is EVMProvider {
    return (
      provider !== null &&
      typeof provider === 'object' &&
      'request' in provider &&
      typeof (provider as { request?: unknown }).request === 'function'
    );
  }

  private getChainNativeSymbol(chainId: string): string {
    const symbols: Record<string, string> = {
      '1': 'ETH',
      '137': 'MATIC',
      '42161': 'ETH',
      '10': 'ETH',
      '8453': 'ETH',
      '56': 'BNB',
      '43114': 'AVAX',
      '250': 'FTM',
      '5': 'ETH',
      '80001': 'MATIC',
    };

    return symbols[String(chainId)] || 'ETH';
  }

  private encodeERC20Call(functionName: string, params: unknown[]): string {
    const selectors: Record<string, string> = {
      balanceOf: '0x70a08231',
      symbol: '0x95d89b41',
      name: '0x06fdde03',
      decimals: '0x313ce567',
    };

    const selector = selectors[functionName];
    if (!selector) {
      throw ErrorFactory.configurationError(`Unknown ERC20 function: ${functionName}`);
    }

    if (functionName === 'balanceOf') {
      const address = (params[0] as string).replace('0x', '').padStart(64, '0');
      return selector + address;
    }

    return selector;
  }

  private decodeString(hex: string): string {
    if (hex === '0x' || hex === '0x0') return '';

    try {
      const cleaned = hex.replace('0x', '');
      if (cleaned.length < 128) return '';

      const stringData = cleaned.slice(128);
      const bytes = [];

      for (let i = 0; i < stringData.length; i += 2) {
        const byte = Number.parseInt(stringData.substr(i, 2), 16);
        if (byte === 0) break;
        bytes.push(byte);
      }

      return String.fromCharCode(...bytes);
    } catch {
      return '';
    }
  }
}

/**
 * Factory function to create EVM chain service
 */
export function createEVMChainService(logger: Logger): Promise<EVMChainService> {
  return Promise.resolve(new EVMChainService(logger));
}

/**
 * Default export for dynamic imports
 */
export default createEVMChainService;
