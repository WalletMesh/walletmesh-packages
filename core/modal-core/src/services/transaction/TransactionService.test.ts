import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletProvider } from '../../api/types/providers.js';
import { createLogger } from '../../internal/core/logger/logger.js';
import {
  createMockEvmProvider,
  createMockServiceDependencies,
  createMockSolanaProvider,
  createTestEnvironment,
  installCustomMatchers,
} from '../../testing/index.js';
import { ChainType, type SupportedChain } from '../../types.js';
import type { TransactionServiceDependencies } from './TransactionService.js';
import { TransactionService } from './TransactionService.js';
import { TransactionValidator } from './TransactionValidator.js';
import type { AztecTransactionParams, SolanaTransactionParams } from './types.js';

installCustomMatchers();

// Remove local mock since we have a global mock in WalletMeshClient.test.ts that's loaded first

// Helper to create a mock SupportedChain
const createMockChain = (chainId: string, chainType: ChainType): SupportedChain => ({
  chainId,
  chainType,
  name:
    chainId === 'eip155:1'
      ? 'Ethereum Mainnet'
      : chainId === 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
        ? 'Solana Mainnet'
        : chainId === 'aztec:mainnet'
          ? 'Aztec Mainnet'
          : 'Test Chain',
  required: true,
  interfaces:
    chainType === ChainType.Evm ? ['eip1193'] : chainType === ChainType.Solana ? ['solana'] : ['aztec'],
});

// Mock provider using testing utilities
const createMockProvider = (
  responses: Record<string, unknown> = {},
  chainType = ChainType.Evm,
): WalletProvider => {
  if (chainType === ChainType.Evm) {
    const baseProvider = createMockEvmProvider({
      // biome-ignore lint/style/useNamingConvention: RPC method name
      eth_sendTransaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      // biome-ignore lint/style/useNamingConvention: RPC method name
      eth_getTransactionReceipt: (params: unknown[]) => {
        const hash = Array.isArray(params) ? params[0] : null;
        if (!hash) return null;
        return {
          transactionHash: hash,
          blockNumber: '0x3039',
          blockHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          transactionIndex: '0x1',
          from: '0x1234567890123456789012345678901234567890',
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          cumulativeGasUsed: '0x5208',
          gasUsed: '0x5208',
          contractAddress: null,
          logs: [],
          logsBloom: '0x00000...',
          root: '0xabcdef...',
          effectiveGasPrice: '0x4a817c800',
          status: '0x1',
        };
      },
      // biome-ignore lint/style/useNamingConvention: RPC method name
      eth_estimateGas: '0x5208', // 21000 in hex
      // biome-ignore lint/style/useNamingConvention: RPC method name
      eth_feeHistory: {
        baseFeePerGas: ['0x4a817c800'], // 20 gwei
        reward: [['0x3b9aca00']], // 1 gwei priority fee
      },
      ...responses,
    });

    return {
      request: baseProvider.request,
      chainType: ChainType.Evm,
      chainId: 'eip155:1',
      address: '0x1234567890123456789012345678901234567890',
    };
  }
  if (chainType === ChainType.Solana) {
    const baseProvider = createMockSolanaProvider();
    baseProvider.sendTransaction = vi.fn().mockResolvedValue('SolanaTransactionSignature123');
    baseProvider.getTransaction = vi.fn().mockResolvedValue({
      slot: 12345,
      transaction: { signatures: ['SolanaTransactionSignature123'] },
    });

    return {
      request: vi.fn().mockImplementation(async ({ method, params }) => {
        if (method === 'sendTransaction') {
          // Solana params are passed as an object, not array
          return 'SolanaTransactionSignature123';
        }
        if (method === 'getTransaction') {
          const hash = Array.isArray(params) ? params[0] : params;
          if (!hash) return null;
          return {
            slot: 12345,
            transaction: { signatures: ['SolanaTransactionSignature123'] },
            meta: { err: null },
          };
        }
        return null;
      }),
      chainType: ChainType.Solana,
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      address: 'SolanaAddress123',
    };
  }

  // Default Aztec provider
  return {
    request: vi.fn().mockImplementation(async ({ method, params }) => {
      if (method in responses) {
        const response = responses[method];
        if (response instanceof Error) throw response;
        return response;
      }
      if (method === 'aztec_sendTransaction') return 'AztecTxHash123';
      if (method === 'aztec_getTransactionReceipt') {
        const hash = Array.isArray(params) ? params[0] : null;
        if (!hash) return null;
        return {
          transactionHash: hash,
          blockNumber: 12345,
          status: 1,
          blockHash: 'AztecBlockHash123',
          from: 'AztecAddress123',
          to: 'AztecRecipient123',
          gasUsed: '0',
          logs: [],
        };
      }
      return null;
    }),
    chainType: ChainType.Aztec,
    chainId: 'aztec-mainnet',
    address: 'AztecAddress123',
  };
};

describe('TransactionService', () => {
  const testEnv = createTestEnvironment();
  let service: TransactionService;
  let dependencies: TransactionServiceDependencies;

  beforeEach(async () => {
    await testEnv.setup();

    dependencies = createMockServiceDependencies({
      logger: createLogger('test'),
    });

    service = new TransactionService(dependencies);
    // Configure the service with test settings
    service.configure({
      confirmationTimeout: 5000,
      pollingInterval: 100,
    });
  });

  afterEach(async () => {
    service.cleanup();
    await testEnv.teardown();
  });

  describe('initialization', () => {
    it('should work immediately after construction (stateless pattern)', () => {
      const newService = new TransactionService(dependencies);
      expect(newService).toBeInstanceOf(TransactionService);
      newService.cleanup();
    });

    it('should work immediately after construction without configuration', async () => {
      const newService = new TransactionService(dependencies);
      const provider = createMockProvider();

      const result = await newService.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'test-wallet',
        address: '0x1234567890123456789012345678901234567890',
      });

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      newService.cleanup();
    });
  });

  describe('sendTransaction', () => {
    describe('EVM transactions', () => {
      it('should send a simple EVM transaction', async () => {
        const provider = createMockProvider();
        const params = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          value: '1000000000000000000', // 1 ETH
        };

        const result = await service.sendTransaction({
          params,
          provider,
          chainType: ChainType.Evm,
          chain: createMockChain('eip155:1', ChainType.Evm),
          walletId: 'metamask',
          address: '0x1234567890123456789012345678901234567890',
        });

        expect(result).toBeDefined();
        expect(result.hash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        expect(result.chainId).toBe('eip155:1');
        expect(result.chainType).toBe(ChainType.Evm);
        expect(result.walletId).toBe('metamask');
        expect(result.status).toBe('confirming');
        expect(result.from).toBe('0x1234567890123456789012345678901234567890');

        // Check provider was called correctly
        expect(provider.request).toHaveBeenCalledWith({
          method: 'eth_sendTransaction',
          params: [
            {
              to: params.to,
              value: '0xde0b6b3a7640000', // 1 ETH in hex
            },
          ],
        });
      });

      it('should validate EVM address format', async () => {
        const provider = createMockProvider();

        await expect(
          service.sendTransaction({
            params: { to: 'invalid-address', value: '1000' },
            provider,
            chainType: ChainType.Evm,
            chainId: 'eip155:1',
            walletId: 'metamask',
            address: '0x1234',
          }),
        ).rejects.toEqual(
          expect.objectContaining({
            code: 'validation_error',
            category: 'general',
            stage: 'validation',
            transactionId: expect.stringMatching(/^tx_/),
          }),
        );
      });

      it('should validate value format', async () => {
        const provider = createMockProvider();

        await expect(
          service.sendTransaction({
            params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: 'not-a-number' },
            provider,
            chainType: ChainType.Evm,
            chainId: 'eip155:1',
            walletId: 'metamask',
            address: '0x1234',
          }),
        ).rejects.toEqual(
          expect.objectContaining({
            code: 'validation_error',
            category: 'general',
            stage: 'validation',
            transactionId: expect.stringMatching(/^tx_/),
          }),
        );
      });

      it('should handle EVM transaction with data', async () => {
        const provider = createMockProvider();
        const params = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          data: '0x095ea7b3',
        };

        const result = await service.sendTransaction({
          params,
          provider,
          chainType: ChainType.Evm,
          chain: createMockChain('eip155:1', ChainType.Evm),
          walletId: 'metamask',
          address: '0x1234567890123456789012345678901234567890',
        });

        expect(result).toBeDefined();
        expect(provider.request).toHaveBeenCalledWith({
          method: 'eth_sendTransaction',
          params: [
            {
              to: params.to,
              data: params.data,
            },
          ],
        });
      });

      it('should handle EVM transaction with gas parameters', async () => {
        const provider = createMockProvider();
        const params = {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          value: '1000000000000000000',
          gas: '21000',
          maxFeePerGas: '30000000000',
          maxPriorityFeePerGas: '2000000000',
        };

        await service.sendTransaction({
          params,
          provider,
          chainType: ChainType.Evm,
          chain: createMockChain('eip155:1', ChainType.Evm),
          walletId: 'metamask',
          address: '0x1234567890123456789012345678901234567890',
        });

        expect(provider.request).toHaveBeenCalledWith({
          method: 'eth_sendTransaction',
          params: [
            {
              to: params.to,
              value: '0xde0b6b3a7640000',
              gas: '0x5208',
              maxFeePerGas: '0x6fc23ac00',
              maxPriorityFeePerGas: '0x77359400',
            },
          ],
        });
      });
    });

    describe('Solana transactions', () => {
      it('should send a Solana transaction', async () => {
        const provider = createMockProvider({}, ChainType.Solana);

        const params: SolanaTransactionParams = {
          transaction: 'SGVsbG8gV29ybGQh', // Base64 encoded
          options: {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          },
        };

        const result = await service.sendTransaction({
          params,
          provider,
          chainType: ChainType.Solana,
          chain: createMockChain('solana-mainnet', ChainType.Solana),
          walletId: 'phantom',
          address: 'SolanaAddress123',
        });

        expect(result).toBeDefined();
        expect(result.hash).toBe('SolanaTransactionSignature123');
        expect(result.chainType).toBe(ChainType.Solana);
        expect(result.walletId).toBe('phantom');

        expect(provider.request).toHaveBeenCalledWith({
          method: 'sendTransaction',
          params: {
            transaction: params.transaction,
            options: params.options,
          },
        });
      });

      it('should validate Solana transaction format', async () => {
        const provider = createMockProvider({}, ChainType.Solana);

        await expect(
          service.sendTransaction({
            // biome-ignore lint/suspicious/noExplicitAny: Testing invalid type
            params: { transaction: 123 as any }, // Invalid type
            provider,
            chainType: ChainType.Solana,
            chainId: 'solana-mainnet',
            walletId: 'phantom',
            address: 'addr',
          }),
        ).rejects.toEqual(
          expect.objectContaining({
            code: 'validation_error',
            category: 'general',
            stage: 'validation',
            transactionId: expect.stringMatching(/^tx_/),
          }),
        );
      });
    });

    describe('Aztec transactions', () => {
      it('should send an Aztec transaction', async () => {
        const provider = createMockProvider({}, ChainType.Aztec);

        const params: AztecTransactionParams = {
          contractAddress: '0x1234567890123456789012345678901234567890',
          functionName: 'transfer',
          args: ['0xabcdef', 1000],
          fee: {
            paymentMethod: 'native',
          },
        };

        const result = await service.sendTransaction({
          params,
          provider,
          chainType: ChainType.Aztec,
          chain: createMockChain('aztec-mainnet', ChainType.Aztec),
          walletId: 'aztec-wallet',
          address: '0xAztecAddress',
        });

        expect(result).toBeDefined();
        expect(result.hash).toBe('AztecTxHash123');
        expect(result.chainType).toBe(ChainType.Aztec);

        expect(provider.request).toHaveBeenCalledWith({
          method: 'aztec_sendTransaction',
          params: [
            {
              contractAddress: params.contractAddress,
              functionName: params.functionName,
              args: params.args,
              fee: params.fee,
            },
          ],
        });
      });

      it('should validate Aztec parameters', async () => {
        const provider = createMockProvider({}, ChainType.Aztec);

        await expect(
          service.sendTransaction({
            params: {
              contractAddress: '',
              functionName: 'test',
              args: [],
            },
            provider,
            chainType: ChainType.Aztec,
            chain: createMockChain('aztec-mainnet', ChainType.Aztec),
            walletId: 'wallet',
            address: 'addr',
          }),
        ).rejects.toEqual(
          expect.objectContaining({
            code: 'validation_error',
            category: 'general',
            stage: 'validation',
            transactionId: expect.stringMatching(/^tx_/),
          }),
        );
      });
    });
  });

  describe('transaction confirmation', () => {
    it('should wait for transaction confirmation', async () => {
      const provider = createMockProvider();

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234567890123456789012345678901234567890',
      });

      // Start waiting for confirmation and advance time to trigger polling
      const waitPromise = result.wait();

      // Advance time to trigger the polling mechanism
      await vi.advanceTimersByTimeAsync(200); // Advance past polling interval

      const receipt = await waitPromise;

      expect(receipt).toBeDefined();
      expect(receipt.transactionHash).toBe(result.hash);
      expect(receipt.blockNumber).toBe(12345);
      expect(receipt.status).toBe('0x1');
    });

    it('should handle transaction timeout', async () => {
      const provider = createMockProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_getTransactionReceipt: null, // No receipt
      });

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234567890123456789012345678901234567890',
      });

      // Start the timeout and immediately advance time
      const waitPromise = result.wait();
      await vi.advanceTimersByTimeAsync(61000); // Advance past timeout

      // Should timeout
      await expect(waitPromise).rejects.toEqual(
        expect.objectContaining({
          code: 'request_timeout',
          category: 'network',
          stage: 'confirmation',
          transactionId: expect.stringMatching(/^tx_/),
        }),
      );
    });

    it('should handle reverted transaction', async () => {
      const provider = createMockProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_getTransactionReceipt: {
          transactionHash: '0x123',
          blockNumber: '0x3039',
          status: '0x0', // Failed
          gasUsed: '0x5208',
        },
      });

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234567890123456789012345678901234567890',
      });

      // Advance time to allow polling to detect the failed status
      await vi.advanceTimersByTimeAsync(200);

      // The transaction should be marked as failed and wait() should reject
      await expect(result.wait()).rejects.toEqual(
        expect.objectContaining({
          code: 'transaction_reverted',
          category: 'wallet',
          stage: 'confirmation',
        }),
      );
    });
  });

  describe('gas estimation', () => {
    it('should estimate gas for EVM transaction', async () => {
      const provider = createMockProvider();

      const result = await service.estimateGas(
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          value: '1000000000000000000',
        },
        provider,
      );

      expect(result).toBeDefined();
      expect(result.gasLimit).toBe('23100'); // 21000 * 1.1
      expect(result.maxFeePerGas).toBe('41000000000'); // (20 gwei * 2) + 1 gwei
      expect(result.maxPriorityFeePerGas).toBe('1000000000'); // 1 gwei
      expect(result.estimatedCost).toBe('947100000000000'); // 23100 * 41 gwei
    });

    it('should handle gas estimation failure', async () => {
      const provider = createMockProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_estimateGas: new Error('Execution reverted'),
      });

      await expect(
        service.estimateGas({ to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' }, provider),
      ).rejects.toThrow('Gas estimation failed');
    });
  });

  describe('transaction history', () => {
    it('should track transaction history', async () => {
      const provider = createMockProvider();

      // Send multiple transactions
      await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '2000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      const history = service.getAllTransactions();
      expect(history).toHaveLength(2);
      expect(history[0].request.value).toBe('1000');
      expect(history[1].request.value).toBe('2000');
    });

    it('should filter transaction history', async () => {
      const provider = createMockProvider();

      // Send transactions on different chains
      await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      const solanaProvider = createMockProvider({}, ChainType.Solana);
      await service.sendTransaction({
        params: { transaction: 'test' },
        provider: solanaProvider,
        chainType: ChainType.Solana,
        chain: createMockChain('solana-mainnet', ChainType.Solana),
        walletId: 'phantom',
        address: 'addr',
      });

      // Filter by chain type
      const evmHistory = service.getTransactionHistory({ chainType: ChainType.Evm });
      expect(evmHistory).toHaveLength(1);
      expect(evmHistory[0].chainType).toBe(ChainType.Evm);

      const solanaHistory = service.getTransactionHistory({ chainType: ChainType.Solana });
      expect(solanaHistory).toHaveLength(1);
      expect(solanaHistory[0].chainType).toBe(ChainType.Solana);
    });

    it('should clear transaction history', async () => {
      const provider = createMockProvider();

      // Send a transaction that will be confirmed
      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      // Manually update the transaction to confirmed status to simulate completion
      (service as { updateTransactionStatus: (id: string, status: string) => void }).updateTransactionStatus(
        result.id,
        'confirmed',
      );

      expect(service.getAllTransactions()).toHaveLength(1);

      // Clear history (only clears completed/failed transactions)
      service.clearHistory();

      expect(service.getAllTransactions()).toHaveLength(0);
    });
  });

  describe('transaction retrieval', () => {
    it('should get transaction by ID', async () => {
      const provider = createMockProvider();

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      const retrieved = service.getTransaction(result.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(result.id);
      expect(retrieved?.hash).toBe(result.hash);
      expect(retrieved?.request.value).toBe('1000');
    });

    it('should return null for non-existent transaction ID', () => {
      const retrieved = service.getTransaction('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should get transaction by hash', async () => {
      const provider = createMockProvider();

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      const retrieved = service.getTransactionByHash(result.hash);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(result.id);
      expect(retrieved?.hash).toBe(result.hash);
      expect(retrieved?.request.value).toBe('1000');
    });

    it('should return null for non-existent transaction hash', () => {
      const retrieved = service.getTransactionByHash('0xnonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('transaction simulation', () => {
    it('should simulate Solana transaction', async () => {
      const mockProvider = {
        request: vi.fn().mockResolvedValue({
          value: { accounts: [], err: null, logs: [] },
        }),
        chainType: ChainType.Solana,
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        address: 'SolanaAddress123',
      };

      const result = await service.simulateTransaction({ transaction: 'test-tx' }, mockProvider);

      expect(result).toBeDefined();
      expect(result).toEqual({
        value: { accounts: [], err: null, logs: [] },
      });
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'simulateTransaction',
        params: {
          transaction: 'test-tx',
          options: undefined,
        },
      });
    });

    it('should handle simulation errors', async () => {
      const mockProvider = {
        request: vi.fn().mockRejectedValue(new Error('Simulation failed')),
        chainType: ChainType.Solana,
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        address: 'SolanaAddress123',
      };

      await expect(
        service.simulateTransaction({ transaction: 'test-tx' }, mockProvider),
      ).rejects.toMatchObject({
        code: 'simulation_failed',
        message: expect.stringContaining('Simulation failed'),
        category: 'wallet',
      });
    });
  });

  describe('validation methods', () => {
    it('should validate connection state', async () => {
      const provider = createMockProvider();

      // Should not throw for valid connection state
      expect(() => {
        (service as unknown).validateConnectionState(provider, ChainType.Evm, 'eip155:1', 'metamask');
      }).not.toThrow();
    });

    it('should validate transaction parameters', () => {
      const validParams = { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' };

      expect(() => {
        (service as unknown).validateTransactionParams(validParams, ChainType.Evm);
      }).not.toThrow();
    });

    it('should validate chain compatibility', () => {
      expect(() => {
        (service as unknown).validateChainCompatibility(ChainType.Evm, 'eip155:1');
      }).not.toThrow();
    });

    it('should validate gas estimation parameters', () => {
      const validParams = { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3' };

      expect(() => {
        (service as unknown).validateGasEstimationParams(validParams, ChainType.Evm);
      }).not.toThrow();
    });

    it('should validate simulation parameters', () => {
      const validParams = { transaction: 'test-tx' };

      expect(() => {
        (service as unknown).validateSimulationParams(validParams);
      }).not.toThrow();
    });
  });

  describe('error handling and utilities', () => {
    it('should convert to react error format', () => {
      const originalError: Record<string, unknown> = {
        message: 'Test error',
        stage: 'sending',
        transactionId: 'tx_123',
        transactionHash: '0xhash123',
      };

      const reactError = (service as unknown).convertToReactError(originalError);

      expect(reactError).toEqual(
        expect.objectContaining({
          code: 'transaction_failed',
          category: 'wallet',
          recoveryStrategy: 'retry',
          stage: 'sending',
          transactionId: 'tx_123',
          transactionHash: '0xhash123',
        }),
      );
    });

    it('should compute loading state for different transaction statuses', () => {
      // Test individual statuses with Aztec-native terminology
      expect((service as unknown).computeLoadingState('simulating')).toBe(true);
      expect((service as unknown).computeLoadingState('proving')).toBe(true);
      expect((service as unknown).computeLoadingState('sending')).toBe(true);
      expect((service as unknown).computeLoadingState('pending')).toBe(true);
      expect((service as unknown).computeLoadingState('confirming')).toBe(false);
      expect((service as unknown).computeLoadingState('confirmed')).toBe(false);
      expect((service as unknown).computeLoadingState('failed')).toBe(false);
    });
  });

  describe('logging', () => {
    it('should log transaction lifecycle', async () => {
      const provider = createMockProvider({
        // biome-ignore lint/style/useNamingConvention: RPC method name
        eth_sendTransaction: '0x1234567890abcdef',
      });

      const result = await service.sendTransaction({
        params: { to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3', value: '1000' },
        provider,
        chainType: ChainType.Evm,
        chain: createMockChain('eip155:1', ChainType.Evm),
        walletId: 'metamask',
        address: '0x1234',
      });

      // Check transaction was processed
      expect(result.id).toBeDefined();
      expect(result.hash).toBe('0x1234567890abcdef');
      expect(result.status).toBe('confirming');
    });
  });
});

describe('TransactionValidator', () => {
  describe('EVM validation', () => {
    it('should validate correct EVM transaction', () => {
      const result = TransactionValidator.validate(
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
          value: '1000000000000000000',
          gas: '21000',
        },
        ChainType.Evm,
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid EVM address', () => {
      const result = TransactionValidator.validate(
        {
          to: 'not-an-address',
          value: '1000',
        },
        ChainType.Evm,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Invalid EVM address format (must be 0x followed by 40 hex characters)',
      );
    });
  });
});
