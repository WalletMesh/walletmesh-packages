/**
 * TokenMetadataFetcher Tests
 *
 * Tests for token metadata fetching functionality including:
 * - ERC20 Token Metadata Fetching
 * - EVM Provider Validation
 * - ABI Encoding and Decoding
 * - Error Handling and Edge Cases
 * - String Decoding from Contract Responses
 *
 * @group unit
 * @group services
 * @group balance
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { TokenMetadataFetcher } from './TokenMetadataFetcher.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock EVM provider interface
interface MockEVMProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<string>;
}

// Helper function to create mock EVM provider
function createMockProvider(responses: Record<string, string> = {}): MockEVMProvider {
  return {
    request: vi.fn().mockImplementation(async ({ method, params }) => {
      if (method === 'eth_call') {
        const [callParams] = params as [{ to: string; data: string }];
        const data = callParams.data;

        // Map function selectors to responses
        if (data === '0x95d89b41') {
          // symbol()
          return (
            responses.symbol ||
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000455534443000000000000000000000000000000000000000000000000000000'
          );
        }
        if (data === '0x06fdde03') {
          // name()
          return (
            responses.name ||
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000'
          );
        }
        if (data === '0x313ce567') {
          // decimals()
          return responses.decimals || '0x0000000000000000000000000000000000000000000000000000000000000006';
        }

        throw new Error(`Unknown method data: ${data}`);
      }

      throw new Error(`Unknown method: ${method}`);
    }),
  };
}

// Helper function to encode string to hex format
function encodeStringToHex(str: string): string {
  const encoded = Buffer.from(str, 'utf8').toString('hex');
  const length = str.length.toString(16).padStart(64, '0');
  const data = encoded.padEnd(64, '0');
  return `0x0000000000000000000000000000000000000000000000000000000000000020${length}${data}`;
}

describe('TokenMetadataFetcher', () => {
  const testEnv = createTestEnvironment();
  const validTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
    vi.restoreAllMocks();
  });

  describe('Token Metadata Fetching', () => {
    describe('Successful metadata retrieval', () => {
      it('should fetch complete token metadata', async () => {
        const mockProvider = createMockProvider({
          symbol: encodeStringToHex('USDC'),
          name: encodeStringToHex('USD Coin'),
          decimals: '0x0000000000000000000000000000000000000000000000000000000000000006',
        });

        const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);

        expect(metadata).toEqual({
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
        });

        expect(mockProvider.request).toHaveBeenCalledTimes(3);
        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_call',
          params: [{ to: validTokenAddress, data: '0x95d89b41' }, 'latest'], // symbol()
        });
        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_call',
          params: [{ to: validTokenAddress, data: '0x06fdde03' }, 'latest'], // name()
        });
        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_call',
          params: [{ to: validTokenAddress, data: '0x313ce567' }, 'latest'], // decimals()
        });
      });

      it('should use symbol as name when name is empty', async () => {
        const mockProvider = createMockProvider({
          symbol: encodeStringToHex('TOKEN'),
          name: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000', // Empty string
          decimals: '0x0000000000000000000000000000000000000000000000000000000000000012', // 18 decimals
        });

        const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);

        expect(metadata).toEqual({
          symbol: 'TOKEN',
          name: 'TOKEN', // Should fallback to symbol
          decimals: 18,
        });
      });

      it('should handle different decimal values', async () => {
        const testCases = [
          { decimalsHex: '0x0000000000000000000000000000000000000000000000000000000000000006', expected: 6 },
          { decimalsHex: '0x0000000000000000000000000000000000000000000000000000000000000008', expected: 8 },
          { decimalsHex: '0x0000000000000000000000000000000000000000000000000000000000000012', expected: 18 },
          { decimalsHex: '0x0000000000000000000000000000000000000000000000000000000000000000', expected: 0 },
        ];

        for (const testCase of testCases) {
          const mockProvider = createMockProvider({
            symbol: encodeStringToHex('TEST'),
            name: encodeStringToHex('Test Token'),
            decimals: testCase.decimalsHex,
          });

          const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);
          expect(metadata.decimals).toBe(testCase.expected);
        }
      });

      it('should handle tokens with special characters in name/symbol', async () => {
        const mockProvider = createMockProvider({
          symbol: encodeStringToHex('$TOKEN'),
          name: encodeStringToHex('Special Token 2.0 (TEST)'),
          decimals: '0x0000000000000000000000000000000000000000000000000000000000000012',
        });

        const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);

        expect(metadata).toEqual({
          symbol: '$TOKEN',
          name: 'Special Token 2.0 (TEST)',
          decimals: 18,
        });
      });
    });

    describe('Error handling', () => {
      it('should throw error for non-EVM provider', async () => {
        const invalidProvider = { notRequest: () => {} };

        await expect(TokenMetadataFetcher.fetchMetadata(invalidProvider, validTokenAddress)).rejects.toThrow(
          'EVM provider required for token metadata',
        );
      });

      it('should throw error when provider is null', async () => {
        await expect(TokenMetadataFetcher.fetchMetadata(null, validTokenAddress)).rejects.toThrow(
          'EVM provider required for token metadata',
        );
      });

      it('should throw error when provider is undefined', async () => {
        await expect(TokenMetadataFetcher.fetchMetadata(undefined, validTokenAddress)).rejects.toThrow(
          'EVM provider required for token metadata',
        );
      });

      it('should throw error when provider request fails', async () => {
        const mockProvider = {
          request: vi.fn().mockRejectedValue(new Error('Network error')),
        };

        await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
          'Failed to fetch token metadata: Network error',
        );
      });

      it('should throw error when symbol is empty', async () => {
        const mockProvider = createMockProvider({
          symbol:
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000', // Empty string
          name: encodeStringToHex('Test Token'),
          decimals: '0x0000000000000000000000000000000000000000000000000000000000000012',
        });

        await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
          'Failed to fetch token metadata',
        );
      });

      it('should throw error when decimals is invalid', async () => {
        const mockProvider = createMockProvider({
          symbol: encodeStringToHex('TEST'),
          name: encodeStringToHex('Test Token'),
          decimals: '0xinvalid', // Invalid hex
        });

        await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
          'Failed to fetch token metadata',
        );
      });

      it('should handle provider request throwing non-Error objects', async () => {
        const mockProvider = {
          request: vi.fn().mockRejectedValue('String error'),
        };

        await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
          'Failed to fetch token metadata: Unknown error',
        );
      });
    });
  });

  describe('EVM Provider Validation', () => {
    it('should validate correct EVM provider', async () => {
      const validProvider = {
        request: async () => '0x123',
      };

      // Using fetchMetadata to indirectly test the private isEVMProvider method
      // Since the provider is valid but returns invalid data format, expect it to throw for other reasons
      await expect(TokenMetadataFetcher.fetchMetadata(validProvider, validTokenAddress)).rejects.toThrow();
    });

    it('should reject provider without request method', async () => {
      const invalidProviders = [
        {},
        { request: 'not a function' },
        { request: null },
        { request: undefined },
        { otherMethod: () => {} },
      ];

      for (const provider of invalidProviders) {
        await expect(TokenMetadataFetcher.fetchMetadata(provider, validTokenAddress)).rejects.toThrow(
          'EVM provider required for token metadata',
        );
      }
    });

    it('should reject non-object providers', async () => {
      const invalidProviders = ['string', 123, true, [], () => {}];

      for (const provider of invalidProviders) {
        await expect(TokenMetadataFetcher.fetchMetadata(provider, validTokenAddress)).rejects.toThrow(
          'EVM provider required for token metadata',
        );
      }
    });
  });

  describe('Address Parameter Encoding', () => {
    it('should encode address parameter correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b8D400E67C7B2D6b77';
      const encoded = TokenMetadataFetcher.encodeAddressParam(address);

      expect(encoded).toBe('000000000000000000000000742d35Cc6634C0532925a3b8D400E67C7B2D6b77'.toLowerCase());
      expect(encoded).toHaveLength(64);
    });

    it('should handle address without 0x prefix', () => {
      const address = '742d35Cc6634C0532925a3b8D400E67C7B2D6b77';
      const encoded = TokenMetadataFetcher.encodeAddressParam(address);

      expect(encoded).toBe('000000000000000000000000742d35Cc6634C0532925a3b8D400E67C7B2D6b77'.toLowerCase());
    });

    it('should pad short addresses', () => {
      const address = '0x123';
      const encoded = TokenMetadataFetcher.encodeAddressParam(address);

      expect(encoded).toBe('0000000000000000000000000000000000000000000000000000000000000123');
      expect(encoded).toHaveLength(64);
    });
  });

  describe('Function Selector Encoding', () => {
    it('should encode known ERC20 function selectors', async () => {
      // Testing the private encodeERC20Call method indirectly through metadata fetching
      const mockProvider = createMockProvider();

      // This will trigger calls to symbol(), name(), and decimals()
      await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);

      const calls = (mockProvider.request as ReturnType<typeof vi.fn>).mock.calls;

      // Check that correct function selectors are used
      expect(
        calls.some(
          (call) => call[0].params[0].data === '0x95d89b41', // symbol()
        ),
      ).toBe(true);

      expect(
        calls.some(
          (call) => call[0].params[0].data === '0x06fdde03', // name()
        ),
      ).toBe(true);

      expect(
        calls.some(
          (call) => call[0].params[0].data === '0x313ce567', // decimals()
        ),
      ).toBe(true);
    });
  });

  describe('String Decoding', () => {
    it('should decode simple strings correctly', async () => {
      // We test string decoding indirectly through metadata fetching
      const testCases = [
        { input: 'USDC', expected: 'USDC' },
        { input: 'USD Coin', expected: 'USD Coin' },
        { input: 'A', expected: 'A' },
        { input: 'Very Long Token Name', expected: 'Very Long Token Name' },
      ];

      for (const testCase of testCases) {
        const mockProvider = createMockProvider({
          symbol: encodeStringToHex(testCase.input),
          name: encodeStringToHex('Test'),
          decimals: '0x0000000000000000000000000000000000000000000000000000000000000012',
        });

        const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);
        expect(metadata.symbol).toBe(testCase.expected);
      }
    });

    it('should handle empty string response', async () => {
      const mockProvider = createMockProvider({
        symbol: encodeStringToHex('TEST'),
        name: '0x', // Empty response
        decimals: '0x0000000000000000000000000000000000000000000000000000000000000012',
      });

      const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);
      expect(metadata.name).toBe('TEST'); // Should fallback to symbol
    });

    it('should handle malformed hex response gracefully', async () => {
      const mockProvider = {
        request: vi.fn().mockImplementation(async ({ method, params }) => {
          const [callParams] = params as [{ to: string; data: string }];
          const data = callParams.data;

          if (data === '0x95d89b41') {
            // symbol()
            return encodeStringToHex('TEST');
          }
          if (data === '0x06fdde03') {
            // name()
            return '0xmalformed'; // Malformed response
          }
          if (data === '0x313ce567') {
            // decimals()
            return '0x0000000000000000000000000000000000000000000000000000000000000012';
          }

          throw new Error('Unknown method');
        }),
      };

      const metadata = await TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress);
      expect(metadata.symbol).toBe('TEST');
      expect(metadata.name).toBe('TEST'); // Should fallback to symbol when name decode fails
      expect(metadata.decimals).toBe(18);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle network timeouts', async () => {
      const mockProvider = {
        request: vi.fn().mockRejectedValue(new Error('Request timeout')),
      };

      await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
        'Failed to fetch token metadata: Request timeout',
      );
    });

    it('should handle partial response failures', async () => {
      const mockProvider = {
        request: vi.fn().mockImplementation(async ({ method, params }) => {
          const [callParams] = params as [{ to: string; data: string }];
          const data = callParams.data;

          if (data === '0x95d89b41') {
            // symbol()
            return encodeStringToHex('FAIL');
          }
          if (data === '0x06fdde03') {
            // name()
            throw new Error('Name call failed');
          }
          if (data === '0x313ce567') {
            // decimals()
            return '0x0000000000000000000000000000000000000000000000000000000000000012';
          }

          throw new Error('Unknown method');
        }),
      };

      await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
        'Failed to fetch token metadata: Name call failed',
      );
    });

    it('should handle invalid token addresses', async () => {
      const mockProvider = {
        request: vi.fn().mockRejectedValue(new Error('Invalid address')),
      };

      await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, 'invalid-address')).rejects.toThrow(
        'Failed to fetch token metadata: Invalid address',
      );
    });

    it('should handle contract that does not implement ERC20', async () => {
      const mockProvider = {
        request: vi.fn().mockRejectedValue(new Error('Contract does not exist')),
      };

      await expect(TokenMetadataFetcher.fetchMetadata(mockProvider, validTokenAddress)).rejects.toThrow(
        'Failed to fetch token metadata: Contract does not exist',
      );
    });
  });
});
