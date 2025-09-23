/**
 * Token metadata fetching utilities
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { TokenMetadata } from './types.js';

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for token metadata operations
export class TokenMetadataFetcher {
  /**
   * Fetch ERC20 token metadata
   */
  static async fetchMetadata(provider: unknown, tokenAddress: string): Promise<TokenMetadata> {
    if (!TokenMetadataFetcher.isEVMProvider(provider)) {
      throw ErrorFactory.configurationError('EVM provider required for token metadata');
    }

    try {
      const [symbolResult, nameResult, decimalsResult] = await Promise.all([
        TokenMetadataFetcher.callTokenMethod(provider, tokenAddress, 'symbol'),
        TokenMetadataFetcher.callTokenMethod(provider, tokenAddress, 'name'),
        TokenMetadataFetcher.callTokenMethod(provider, tokenAddress, 'decimals'),
      ]);

      const symbol = TokenMetadataFetcher.decodeString(symbolResult);
      const name = TokenMetadataFetcher.decodeString(nameResult);
      const decimals = Number.parseInt(decimalsResult, 16);

      if (!symbol || Number.isNaN(decimals)) {
        throw ErrorFactory.validation('Invalid token metadata');
      }

      return {
        symbol,
        name: name || symbol,
        decimals,
      };
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Failed to fetch token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { tokenAddress },
      );
    }
  }

  /**
   * Call a token method
   */
  private static async callTokenMethod(
    provider: unknown,
    tokenAddress: string,
    method: string,
  ): Promise<string> {
    const data = TokenMetadataFetcher.encodeERC20Call(method);
    const evmProvider = provider as {
      request: (args: { method: string; params: unknown[] }) => Promise<string>;
    };

    return evmProvider.request({
      method: 'eth_call',
      params: [{ to: tokenAddress, data }, 'latest'],
    });
  }

  /**
   * Simple ERC20 function encoder
   */
  private static encodeERC20Call(functionName: string): string {
    // Function selector (first 4 bytes of keccak256 hash)
    const selectors: Record<string, string> = {
      balanceOf: '0x70a08231',
      symbol: '0x95d89b41',
      decimals: '0x313ce567',
      name: '0x06fdde03',
      totalSupply: '0x18160ddd',
    };

    const selector = selectors[functionName];
    if (!selector) {
      throw ErrorFactory.configurationError(`Unknown function: ${functionName}`);
    }

    return selector;
  }

  /**
   * Encode address parameter for ERC20 calls
   */
  static encodeAddressParam(address: string): string {
    return address.replace('0x', '').toLowerCase().padStart(64, '0');
  }

  /**
   * Simple string decoder for contract calls
   */
  private static decodeString(hex: string): string {
    if (hex === '0x') return '';

    try {
      // Remove 0x prefix and decode
      const cleaned = hex.replace('0x', '');
      // Skip offset and length, get actual string data
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

  /**
   * Type guard for EVM providers
   */
  private static isEVMProvider(
    provider: unknown,
  ): provider is { request: (args: { method: string; params: unknown[] }) => Promise<string> } {
    return (
      provider !== null &&
      typeof provider === 'object' &&
      'request' in provider &&
      typeof (provider as { request?: unknown }).request === 'function'
    );
  }
}
