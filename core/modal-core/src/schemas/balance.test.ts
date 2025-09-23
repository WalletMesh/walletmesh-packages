/**
 * @fileoverview Tests for balance service input validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  blockchainAddressSchema,
  typedAddressSchema,
  tokenInfoSchema,
  chainTokenInfoSchema,
  balanceQueryOptionsSchema,
  getNativeBalanceParamsSchema,
  getTokenBalanceParamsSchema,
  getMultiTokenBalanceParamsSchema,
  balanceInfoSchema,
  tokenBalanceInfoSchema,
  multiTokenBalanceResultSchema,
  balanceServiceConfigSchema,
} from './balance.js';
import { ChainType } from '../types.js';

describe('Balance Schemas', () => {
  describe('Address Validation Schemas', () => {
    describe('blockchainAddressSchema', () => {
      it('should validate non-empty addresses', () => {
        const addresses = [
          '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
          'aztec-address-123',
        ];
        for (const address of addresses) {
          expect(() => blockchainAddressSchema.parse(address)).not.toThrow();
        }
      });

      it('should reject empty addresses', () => {
        expect(() => blockchainAddressSchema.parse('')).toThrow('Address cannot be empty');
      });
    });

    describe('typedAddressSchema', () => {
      it('should validate EVM addresses', () => {
        const typedAddress = {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainType: ChainType.Evm,
        };
        expect(() => typedAddressSchema.parse(typedAddress)).not.toThrow();
      });

      it('should reject invalid EVM addresses', () => {
        const typedAddress = {
          address: 'invalid-evm-address',
          chainType: ChainType.Evm,
        };
        expect(() => typedAddressSchema.parse(typedAddress)).toThrow('Invalid EVM address format');
      });

      it('should validate Solana addresses', () => {
        const typedAddress = {
          address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
          chainType: ChainType.Solana,
        };
        expect(() => typedAddressSchema.parse(typedAddress)).not.toThrow();
      });

      it('should reject invalid Solana addresses', () => {
        const typedAddress = {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainType: ChainType.Solana,
        };
        expect(() => typedAddressSchema.parse(typedAddress)).toThrow('Invalid Solana address format');
      });

      it('should validate Aztec addresses', () => {
        const typedAddress = {
          address: 'aztec-address-123',
          chainType: ChainType.Aztec,
        };
        expect(() => typedAddressSchema.parse(typedAddress)).not.toThrow();
      });
    });
  });

  describe('Token Information Schemas', () => {
    describe('tokenInfoSchema', () => {
      it('should validate minimal token info', () => {
        const token = {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        };
        expect(() => tokenInfoSchema.parse(token)).not.toThrow();
      });

      it('should validate complete token info', () => {
        const token = {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          decimals: 6,
          name: 'USD Coin',
          logoURI: 'https://example.com/usdc.png',
        };
        expect(() => tokenInfoSchema.parse(token)).not.toThrow();
      });

      it('should reject empty token address', () => {
        const token = { address: '' };
        expect(() => tokenInfoSchema.parse(token)).toThrow('Token address is required');
      });

      it('should validate symbol length', () => {
        const longSymbol = 'A'.repeat(21);
        expect(() => tokenInfoSchema.parse({ address: '0x', symbol: longSymbol })).toThrow();
        expect(() => tokenInfoSchema.parse({ address: '0x', symbol: 'USDC' })).not.toThrow();
      });

      it('should validate decimals range', () => {
        expect(() => tokenInfoSchema.parse({ address: '0x', decimals: -1 })).toThrow();
        expect(() => tokenInfoSchema.parse({ address: '0x', decimals: 256 })).toThrow();
        expect(() => tokenInfoSchema.parse({ address: '0x', decimals: 18 })).not.toThrow();
      });

      it('should validate logo URI', () => {
        expect(() => tokenInfoSchema.parse({ address: '0x', logoURI: 'not-a-url' })).toThrow();
        expect(() =>
          tokenInfoSchema.parse({ address: '0x', logoURI: 'https://example.com/logo.png' }),
        ).not.toThrow();
      });
    });

    describe('chainTokenInfoSchema', () => {
      it('should validate EVM token with proper address', () => {
        const token = {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          chainType: ChainType.Evm,
          symbol: 'USDC',
          decimals: 6,
        };
        expect(() => chainTokenInfoSchema.parse(token)).not.toThrow();
      });

      it('should reject EVM token with invalid address', () => {
        const token = {
          address: 'invalid-address',
          chainType: ChainType.Evm,
        };
        expect(() => chainTokenInfoSchema.parse(token)).toThrow('Invalid EVM token address format');
      });

      it('should validate Solana token with proper address', () => {
        const token = {
          address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          chainType: ChainType.Solana,
          symbol: 'USDC',
          decimals: 6,
        };
        expect(() => chainTokenInfoSchema.parse(token)).not.toThrow();
      });

      it('should validate Aztec token', () => {
        const token = {
          address: 'aztec-token-address',
          chainType: ChainType.Aztec,
          symbol: 'AZT',
          decimals: 18,
        };
        expect(() => chainTokenInfoSchema.parse(token)).not.toThrow();
      });
    });
  });

  describe('Balance Query Schemas', () => {
    describe('balanceQueryOptionsSchema', () => {
      it('should validate empty options', () => {
        expect(() => balanceQueryOptionsSchema.parse({})).not.toThrow();
      });

      it('should validate complete options', () => {
        const options = {
          useCache: true,
          staleTime: 30000,
          cacheTime: 300000,
          pollingInterval: 10000,
          includeMetadata: true,
        };
        expect(() => balanceQueryOptionsSchema.parse(options)).not.toThrow();
      });

      it('should reject negative times', () => {
        expect(() => balanceQueryOptionsSchema.parse({ staleTime: -1 })).toThrow();
        expect(() => balanceQueryOptionsSchema.parse({ cacheTime: -1 })).toThrow();
      });

      it('should reject polling interval below minimum', () => {
        expect(() => balanceQueryOptionsSchema.parse({ pollingInterval: 500 })).toThrow();
      });
    });

    describe('getNativeBalanceParamsSchema', () => {
      it('should validate native balance params', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
        };
        expect(() => getNativeBalanceParamsSchema.parse(params)).not.toThrow();
      });

      it('should validate with options', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          options: {
            useCache: true,
            staleTime: 30000,
          },
        };
        expect(() => getNativeBalanceParamsSchema.parse(params)).not.toThrow();
      });

      it('should reject empty address', () => {
        const params = {
          provider: {},
          address: '',
          chainId: 'eip155:1',
        };
        expect(() => getNativeBalanceParamsSchema.parse(params)).toThrow('Address cannot be empty');
      });
    });

    describe('getTokenBalanceParamsSchema', () => {
      it('should validate token balance params', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          token: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
        };
        expect(() => getTokenBalanceParamsSchema.parse(params)).not.toThrow();
      });

      it('should validate with complete token info', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          token: {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: 6,
            name: 'USD Coin',
          },
        };
        expect(() => getTokenBalanceParamsSchema.parse(params)).not.toThrow();
      });

      it('should reject missing token address', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          token: { address: '' },
        };
        expect(() => getTokenBalanceParamsSchema.parse(params)).toThrow('Token address is required');
      });
    });

    describe('getMultiTokenBalanceParamsSchema', () => {
      it('should validate multi-token balance params', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          tokens: [
            { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
            { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
          ],
        };
        expect(() => getMultiTokenBalanceParamsSchema.parse(params)).not.toThrow();
      });

      it('should reject empty token array', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          tokens: [],
        };
        expect(() => getMultiTokenBalanceParamsSchema.parse(params)).toThrow();
      });

      it('should reject too many tokens', () => {
        const params = {
          provider: {},
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
          chainId: 'eip155:1',
          tokens: Array(101).fill({ address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }),
        };
        expect(() => getMultiTokenBalanceParamsSchema.parse(params)).toThrow();
      });
    });
  });

  describe('Balance Result Schemas', () => {
    describe('balanceInfoSchema', () => {
      it('should validate balance info', () => {
        const balance = {
          value: '1000000000000000000',
          formatted: '1.0',
          symbol: 'ETH',
          decimals: 18,
        };
        expect(() => balanceInfoSchema.parse(balance)).not.toThrow();
      });

      it('should validate with USD values', () => {
        const balance = {
          value: '1000000000000000000',
          formatted: '1.0',
          symbol: 'ETH',
          decimals: 18,
          usdValue: 2000.5,
          usdPrice: 2000.5,
          timestamp: Date.now(),
        };
        expect(() => balanceInfoSchema.parse(balance)).not.toThrow();
      });

      it('should reject invalid decimals', () => {
        const balance = {
          value: '1000',
          formatted: '1.0',
          symbol: 'TEST',
          decimals: -1,
        };
        expect(() => balanceInfoSchema.parse(balance)).toThrow();
      });
    });

    describe('tokenBalanceInfoSchema', () => {
      it('should validate token balance info', () => {
        const balance = {
          value: '1000000',
          formatted: '1.0',
          symbol: 'USDC',
          decimals: 6,
          token: {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: 6,
          },
          isVerified: true,
          tokenType: 'ERC20',
        };
        expect(() => tokenBalanceInfoSchema.parse(balance)).not.toThrow();
      });
    });

    describe('multiTokenBalanceResultSchema', () => {
      it('should validate multi-token balance result', () => {
        const result = {
          native: {
            value: '1000000000000000000',
            formatted: '1.0',
            symbol: 'ETH',
            decimals: 18,
          },
          tokens: [
            {
              value: '1000000',
              formatted: '1.0',
              symbol: 'USDC',
              decimals: 6,
              token: {
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                symbol: 'USDC',
                decimals: 6,
              },
            },
          ],
          totalUsdValue: 3000.5,
          timestamp: Date.now(),
        };
        expect(() => multiTokenBalanceResultSchema.parse(result)).not.toThrow();
      });
    });
  });

  describe('Balance Service Configuration', () => {
    describe('balanceServiceConfigSchema', () => {
      it('should provide defaults', () => {
        const result = balanceServiceConfigSchema.parse({});
        expect(result.defaultCacheTime).toBe(300000);
        expect(result.defaultStaleTime).toBe(30000);
        expect(result.enablePolling).toBe(false);
        expect(result.defaultPollingInterval).toBe(30000);
        expect(result.maxConcurrentQueries).toBe(10);
        expect(result.enableUsdPrices).toBe(false);
      });

      it('should validate custom config', () => {
        const config = {
          defaultCacheTime: 600000,
          defaultStaleTime: 60000,
          enablePolling: true,
          defaultPollingInterval: 60000,
          maxConcurrentQueries: 20,
          enableUsdPrices: true,
          priceProvider: {
            type: 'coingecko' as const,
            apiKey: 'test-api-key',
          },
        };
        expect(() => balanceServiceConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject values out of range', () => {
        expect(() => balanceServiceConfigSchema.parse({ defaultCacheTime: 3700000 })).toThrow();
        expect(() => balanceServiceConfigSchema.parse({ defaultStaleTime: 700000 })).toThrow();
        expect(() => balanceServiceConfigSchema.parse({ defaultPollingInterval: 3000 })).toThrow();
        expect(() => balanceServiceConfigSchema.parse({ maxConcurrentQueries: 0 })).toThrow();
      });

      it('should validate price provider config', () => {
        const config = {
          priceProvider: {
            type: 'custom' as const,
            endpoint: 'https://api.custom-price-provider.com',
          },
        };
        expect(() => balanceServiceConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject invalid price provider', () => {
        const config = {
          priceProvider: {
            type: 'invalid',
          },
        };
        expect(() => balanceServiceConfigSchema.parse(config)).toThrow();
      });
    });
  });
});
