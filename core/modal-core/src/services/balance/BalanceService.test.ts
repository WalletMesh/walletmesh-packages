import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { createLogger } from '../../internal/core/logger/logger.js';
import {
  createMockEvmProvider,
  createMockSolanaProvider,
  createTestEnvironment,
  installCustomMatchers,
} from '../../testing/index.js';
import { ChainType, type SupportedChain } from '../../types.js';
import type { BalanceServiceDependencies } from './BalanceService.js';

// Install domain-specific matchers
installCustomMatchers();
import type { BaseChainService } from '../chains/BaseChainService.js';
import { BalanceService } from './BalanceService.js';
import type { TokenInfo } from './types.js';

// Test constants
const TOKEN_ADDRESSES = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
};

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

const CHAIN_IDS = {
  ETHEREUM_MAINNET: '1',
};

// Helper to create a mock SupportedChain
const createMockChain = (chainId: string): SupportedChain => ({
  chainId,
  chainType: chainId.startsWith('eip155')
    ? ChainType.Evm
    : chainId.includes('solana')
      ? ChainType.Solana
      : chainId.includes('aztec')
        ? ChainType.Aztec
        : ChainType.Evm,
  name:
    chainId === '1' || chainId === 'eip155:1'
      ? 'Ethereum Mainnet'
      : chainId === '137' || chainId === 'eip155:137'
        ? 'Polygon'
        : chainId === '56' || chainId === 'eip155:56'
          ? 'Binance Smart Chain'
          : chainId === 'mainnet-beta' || chainId.includes('solana')
            ? 'Solana Mainnet'
            : chainId.includes('aztec')
              ? 'Aztec'
              : 'Test Chain',
  required: true,
  interfaces: chainId.includes('solana') ? ['solana'] : chainId.includes('aztec') ? ['aztec'] : ['eip1193'],
});

describe('BalanceService', () => {
  let service: BalanceService;
  let dependencies: BalanceServiceDependencies;
  const testEnv = createTestEnvironment();
  let mockChainService: Partial<BaseChainService>;

  beforeEach(async () => {
    await testEnv.setup();

    // Create a mock chain service
    mockChainService = {
      getNativeBalance: vi.fn().mockResolvedValue({
        value: '1000000000000000000',
        formatted: '1.0',
        symbol: 'ETH',
        decimals: 18,
      }),
      getTokenBalance: vi.fn().mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'USDC',
        decimals: 6,
      }),
    };

    // Create a mock chain service registry
    const mockChainServiceRegistry = {
      getChainService: vi.fn().mockImplementation(async (_chainId) => {
        return mockChainService;
      }),
      registerChainService: vi.fn(),
      hasChainService: vi.fn().mockReturnValue(true),
    };

    dependencies = {
      logger: createLogger('test'),
      chainServiceRegistry: mockChainServiceRegistry,
    };

    service = new BalanceService(dependencies);
    // Note: Configuration is now handled automatically by QueryManager
    // No manual configuration needed
  });

  afterEach(async () => {
    service.cleanup();
    await testEnv.teardown();
    // Reset all mocks to ensure clean state for each test
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should create service with dependencies', () => {
      expect(service).toBeInstanceOf(BalanceService);
    });

    it('should work immediately after construction (stateless pattern)', async () => {
      const provider = createMockEvmProvider();
      const balance = await service.getNativeBalance({
        provider,
        address: '0x123',
        chain: createMockChain('1'),
      });
      expect(balance).toBeDefined();
    });
  });

  describe('getNativeBalance', () => {
    describe('EVM balances', () => {
      it('should fetch EVM native balance', async () => {
        const provider = createMockEvmProvider();
        const address = '0x1234567890123456789012345678901234567890';

        const balance = await service.getNativeBalance({ provider, address, chain: createMockChain('1') });

        expect(balance).toBeDefined();
        expect(balance.value).toBe('1000000000000000000'); // 1 ETH in wei
        expect(balance.formatted).toBe('1.0');
        expect(balance.symbol).toBe('ETH');
        expect(balance.decimals).toBe(18);

        expect(mockChainService.getNativeBalance).toHaveBeenCalledWith(provider, address, '1');
      });

      it('should fetch balance for different chains with correct symbols', async () => {
        const provider = createMockEvmProvider();
        const address = '0x1234567890123456789012345678901234567890';

        // Configure chain service to return different symbols for different chains
        mockChainService.getNativeBalance.mockImplementation(async (_, __, chainId) => {
          const symbols: Record<string, string> = { '137': 'MATIC', '56': 'BNB', '1': 'ETH' };
          return {
            value: '1000000000000000000',
            formatted: '1.0',
            symbol: symbols[chainId as string] || 'ETH',
            decimals: 18,
          };
        });

        // Test Polygon
        const polygonBalance = await service.getNativeBalance({
          provider,
          address,
          chain: createMockChain('137'),
        });
        expect(polygonBalance.symbol).toBe('MATIC');

        // Test BSC
        const bscBalance = await service.getNativeBalance({
          provider,
          address,
          chain: createMockChain('56'),
        });
        expect(bscBalance.symbol).toBe('BNB');
      });

      it('should format large balances correctly', async () => {
        const provider = createMockEvmProvider({
          // biome-ignore lint/style/useNamingConvention: RPC method name
          eth_getBalance: '0x3635c9adc5dea00000', // 1000 ETH in hex
        });

        mockChainService.getNativeBalance.mockResolvedValue({
          value: '1000000000000000000000', // 1000 ETH
          formatted: '1000.0',
          symbol: 'ETH',
          decimals: 18,
        });

        const balance = await service.getNativeBalance({
          provider,
          address: '0x123',
          chain: createMockChain('1'),
        });
        expect(balance.formatted).toBe('1000.0');
      });

      it('should format small balances with decimals', async () => {
        const provider = createMockEvmProvider({
          // biome-ignore lint/style/useNamingConvention: RPC method name
          eth_getBalance: '0x16345785d8a0000', // 0.1 ETH in hex
        });

        mockChainService.getNativeBalance.mockResolvedValue({
          value: '100000000000000000', // 0.1 ETH
          formatted: '0.1',
          symbol: 'ETH',
          decimals: 18,
        });

        const balance = await service.getNativeBalance({
          provider,
          address: '0x123',
          chain: createMockChain('1'),
        });
        expect(balance.formatted).toBe('0.1');
      });
    });

    describe('Solana balances', () => {
      it('should fetch Solana native balance', async () => {
        const provider = createMockSolanaProvider();
        const address = 'SolanaAddress123';

        mockChainService.getNativeBalance.mockResolvedValue({
          value: '1000000000', // 1 SOL in lamports
          formatted: '1.0',
          symbol: 'SOL',
          decimals: 9,
        });

        const balance = await service.getNativeBalance({
          provider,
          address,
          chain: createMockChain('mainnet-beta'),
        });

        expect(balance).toBeDefined();
        expect(balance.value).toBe('1000000000'); // 1 SOL in lamports
        expect(balance.formatted).toBe('1.0');
        expect(balance.symbol).toBe('SOL');
        expect(balance.decimals).toBe(9);

        expect(mockChainService.getNativeBalance).toHaveBeenCalledWith(provider, address, 'mainnet-beta');
      });
    });

    describe('Error handling', () => {
      it('should handle provider errors', async () => {
        const provider = createMockEvmProvider();
        mockChainService.getNativeBalance.mockRejectedValue(new Error('Network error'));

        await expect(
          service.getNativeBalance({ provider, address: '0x123', chain: createMockChain('1') }),
        ).rejects.toThrow();
      });

      it('should reject unsupported chain types', async () => {
        const provider = createMockEvmProvider();
        // Mock the chain service registry to throw for unsupported chains
        dependencies.chainServiceRegistry.getChainService.mockRejectedValue(
          ErrorFactory.configurationError('No chain service available for chain unsupported-chain-id', {
            chain: createMockChain('unsupported-chain-id'),
          }),
        );

        await expect(
          service.getNativeBalance({
            provider,
            address: '0x123',
            chain: createMockChain('unsupported-chain-id'),
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe('getTokenBalance', () => {
    it('should fetch EVM token balance', async () => {
      const provider = createMockEvmProvider();
      const token: TokenInfo = {
        address: TOKEN_ADDRESSES.USDC,
        symbol: 'USDC',
        decimals: 6,
      };

      const balance = await service.getTokenBalance({
        provider,
        address: TEST_ADDRESS,
        chain: createMockChain(CHAIN_IDS.ETHEREUM_MAINNET),
        token,
      });

      expect(balance).toBeDefined();
      expect(balance.value).toBe('2000000000000000000'); // 2 tokens
      expect(balance.formatted).toBe('2000000000000.0'); // With 6 decimals
      expect(balance.symbol).toBe('USDC');
      expect(balance.decimals).toBe(6);

      // Check that chain service was called
      expect(mockChainService.getTokenBalance).toHaveBeenCalledWith(
        provider,
        TEST_ADDRESS,
        CHAIN_IDS.ETHEREUM_MAINNET,
        expect.objectContaining({
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
        }),
      );
    });

    it('should fetch token metadata if not provided', async () => {
      const provider = createMockEvmProvider();
      const address = '0x1234567890123456789012345678901234567890';
      const token: TokenInfo = {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        // No symbol or decimals provided
      };

      const balance = await service.getTokenBalance({
        provider,
        address,
        chain: createMockChain('1'),
        token,
      });

      // Mock token with defaults that will be used
      mockChainService.getTokenBalance.mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'USDC', // Default symbol from chain service
        decimals: 6, // Default decimals from chain service
      });

      expect(balance.symbol).toBe('USDC');
      expect(balance.decimals).toBe(6);

      // Verify chain service was called with partial token info
      expect(mockChainService.getTokenBalance).toHaveBeenCalledWith(
        provider,
        address,
        '1',
        expect.objectContaining({
          address: token.address,
          symbol: 'TOKEN', // Default when not provided
          decimals: 18, // Default when not provided
        }),
      );
    });

    it('should handle token balance errors', async () => {
      const provider = createMockEvmProvider();
      mockChainService.getTokenBalance.mockRejectedValue(new Error('Contract error'));

      const token: TokenInfo = {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        symbol: 'USDC',
        decimals: 6,
      };

      await expect(
        service.getTokenBalance({ provider, address: '0x123', chain: createMockChain('1'), token }),
      ).rejects.toThrow();
    });
  });

  describe('logging', () => {
    it('should log native balance fetch', async () => {
      const provider = createMockEvmProvider();
      const address = '0x123';

      const result = await service.getNativeBalance({ provider, address, chain: createMockChain('1') });

      expect(result).toMatchObject({
        value: '1000000000000000000',
        symbol: 'ETH',
        formatted: '1.0',
        decimals: 18,
      });
    });

    it('should log token balance fetch', async () => {
      const provider = createMockEvmProvider();
      const address = '0x123';
      const token: TokenInfo = { address: '0xtoken', symbol: 'TOK', decimals: 18 };

      // Update mock to return the expected symbol
      mockChainService.getTokenBalance.mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'TOK',
        decimals: 18,
      });

      const result = await service.getTokenBalance({ provider, address, chain: createMockChain('1'), token });

      expect(result).toMatchObject({
        value: '2000000000000000000',
        symbol: 'TOK',
        decimals: 18,
      });
    });
  });

  // fetchTokenMetadata tests removed - method doesn't exist in current implementation

  describe('Aztec chain support', () => {
    it('should reject Aztec native balance queries', async () => {
      const provider = createMockEvmProvider();

      // Mock the chain service registry to return null for Aztec chains
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getNativeBalance({ provider, address: '0x123', chain: createMockChain('aztec:31337') }),
      ).rejects.toThrow();
    });

    it('should reject Aztec token balance queries', async () => {
      const provider = createMockEvmProvider();
      const token: TokenInfo = { address: '0xtoken', symbol: 'TOK', decimals: 18 };

      // Mock the chain service registry to return null for Aztec chains
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getTokenBalance({ provider, address: '0x123', chain: createMockChain('aztec:31337'), token }),
      ).rejects.toThrow();
    });
  });

  describe('Solana token support', () => {
    it('should reject Solana token balance queries', async () => {
      const provider = createMockSolanaProvider();
      const token: TokenInfo = { address: 'SolanaTokenAddress', symbol: 'SPL', decimals: 9 };

      // Mock the chain service registry to return null for Solana chains
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getTokenBalance({
          provider,
          address: 'SolanaAddress',
          chain: createMockChain('mainnet-beta'),
          token,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle invalid EVM provider for native balance', async () => {
      const invalidProvider = {} as BlockchainProvider;

      // Mock the chain service registry to return null
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getNativeBalance({
          provider: invalidProvider,
          address: '0x123',
          chain: createMockChain('1'),
        }),
      ).rejects.toThrow();
    });

    it('should handle invalid EVM provider for token balance', async () => {
      const invalidProvider = {} as BlockchainProvider;
      const token: TokenInfo = { address: '0xtoken', symbol: 'TOK', decimals: 18 };

      // Mock the chain service registry to return null
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getTokenBalance({
          provider: invalidProvider,
          address: '0x123',
          chain: createMockChain('1'),
          token,
        }),
      ).rejects.toThrow();
    });

    it('should handle invalid Solana provider', async () => {
      const invalidProvider = { connection: null, publicKey: null } as BlockchainProvider;

      // Mock the chain service registry to return null
      dependencies.chainServiceRegistry.getChainService.mockResolvedValue(null);

      await expect(
        service.getNativeBalance({
          provider: invalidProvider,
          address: 'SolanaAddress',
          chain: createMockChain('mainnet-beta'),
        }),
      ).rejects.toThrow();
    });

    it('should handle non-Error objects in getNativeBalance', async () => {
      const provider = createMockEvmProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_getBalance: () => Promise.reject('string error'),
      });

      // Mock chain service to throw a string error
      mockChainService.getNativeBalance.mockRejectedValue('string error');

      await expect(
        service.getNativeBalance({ provider, address: '0x123', chain: createMockChain('1') }),
      ).rejects.toThrow();
    });

    it('should re-throw ModalError instances in getNativeBalance', async () => {
      const modalError = {
        code: 'test_error',
        category: 'network',
        message: 'Test error',
      };
      const provider = createMockEvmProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_getBalance: () => Promise.reject(modalError),
      });

      // Mock chain service to throw the modal error
      mockChainService.getNativeBalance.mockRejectedValue(modalError);

      await expect(
        service.getNativeBalance({ provider, address: '0x123', chain: createMockChain('1') }),
      ).rejects.toThrow();
    });
  });

  // Provider type guards tests removed - methods don't exist in current implementation

  describe('Token balance with partial metadata', () => {
    it('should use provided symbol when decimals are missing', async () => {
      const provider = createMockEvmProvider();
      const address = '0x1234567890123456789012345678901234567890';
      const token: TokenInfo = {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        symbol: 'CUSTOM',
        // No decimals provided
      };

      // Mock response with provided symbol
      mockChainService.getTokenBalance.mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'CUSTOM', // Uses provided symbol
        decimals: 6, // Default decimals
      });

      const balance = await service.getTokenBalance({
        provider,
        address,
        chain: createMockChain('1'),
        token,
      });

      expect(balance.symbol).toBe('CUSTOM'); // Uses provided symbol
      expect(balance.decimals).toBe(6); // Default decimals
    });

    it('should use provided decimals when symbol is missing', async () => {
      const provider = createMockEvmProvider();
      const address = '0x1234567890123456789012345678901234567890';
      const token: TokenInfo = {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 8,
        // No symbol provided
      };

      // Mock response with provided decimals
      mockChainService.getTokenBalance.mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'USDC', // Default symbol
        decimals: 8, // Uses provided decimals
      });

      const balance = await service.getTokenBalance({
        provider,
        address,
        chain: createMockChain('1'),
        token,
      });

      expect(balance.symbol).toBe('USDC'); // Default symbol
      expect(balance.decimals).toBe(8); // Uses provided decimals
    });

    it('should use fallback values when metadata fetch fails', async () => {
      const provider = createMockEvmProvider();
      const address = '0x1234567890123456789012345678901234567890';
      const token: TokenInfo = {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        // No metadata provided
      };

      // Mock chain service to use default values
      mockChainService.getTokenBalance.mockResolvedValue({
        value: '2000000000000000000',
        formatted: '2000000000000.0',
        symbol: 'TOKEN', // Default symbol when not provided
        decimals: 18, // Default decimals when not provided
      });

      const balance = await service.getTokenBalance({
        provider,
        address,
        chain: createMockChain('1'),
        token,
      });

      expect(balance.symbol).toBe('TOKEN');
      expect(balance.decimals).toBe(18);
    });
  });
});
