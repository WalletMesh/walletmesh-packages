import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AccountWallet, PXE, TxHash, AztecAddress } from '@aztec/aztec.js';
import { Fr } from '@aztec/aztec.js';
import { handler } from './handlers.js';
import { AztecWalletError } from './errors.js';
import { ContractArtifactCache } from './contractArtifactCache.js';
import type {
  AztecWalletContext,
  AztecWalletMethodMap,
  TransactionParams,
  TransactionFunctionCall,
} from './types.js';

// Mock Contract.at and NoFeePaymentMethod at the top level
// Mock Aztec.js dependencies
vi.mock('@aztec/aztec.js', async () => {
  const actual = await vi.importActual('@aztec/aztec.js');
  return {
    ...actual,
    Contract: {
      at: vi.fn(),
    },
    NoFeePaymentMethod: class {},
    AztecAddress: {
      fromString: vi.fn().mockImplementation((str) => ({
        toString: () => str,
        toField: () => new Fr(1),
        equals: () => false,
        isZero: () => false,
      })),
    },
    AuthWitness: {
      fromString: vi.fn().mockImplementation((str) => ({
        toString: () => str,
      })),
    },
    GasSettings: {
      default: vi.fn().mockReturnValue({
        maxFeePerGas: BigInt(1000),
        maxPriorityFeePerGas: BigInt(100),
      }),
    },
  };
});

// Mock circuits.js dependencies
vi.mock('@aztec/circuits.js', () => ({
  GasSettings: {
    default: vi.fn().mockReturnValue({
      maxFeePerGas: BigInt(1000),
      maxPriorityFeePerGas: BigInt(100),
    }),
  },
}));

describe('RPC Handlers', () => {
  let context: AztecWalletContext;
  let pxe: PXE;
  // Define a type for our mocked wallet that includes the methods we need
  type MockedWallet = AccountWallet & {
    sendTransaction: ReturnType<typeof vi.fn>;
    simulateTransaction: ReturnType<typeof vi.fn>;
    getContractInstance: ReturnType<typeof vi.fn>;
    getContractArtifact: ReturnType<typeof vi.fn>;
    getCurrentBaseFees: ReturnType<typeof vi.fn>;
    createTxExecutionRequest: ReturnType<typeof vi.fn>;
    simulateTx: ReturnType<typeof vi.fn>;
    proveTx: ReturnType<typeof vi.fn>;
    sendTx: ReturnType<typeof vi.fn>;
  };
  let wallet: MockedWallet;
  let contractArtifactCache: ContractArtifactCache;

  beforeEach(() => {
    // Mock wallet with common methods
    wallet = {
      getAddress: vi.fn().mockResolvedValue('mockAddress'),
      getContractInstance: vi.fn().mockResolvedValue(undefined),
      getContractArtifact: vi.fn().mockResolvedValue(undefined),
      sendTransaction: vi.fn(),
      simulateTransaction: vi.fn(),
      getCurrentBaseFees: vi.fn().mockResolvedValue(BigInt(1000)),
      createTxExecutionRequest: vi.fn().mockResolvedValue({
        id: 'mockTxId',
        data: new Uint8Array(),
      }),
      simulateTx: vi.fn().mockResolvedValue({
        privateExecutionResult: {
          success: true,
          data: new Uint8Array(),
        },
      }),
      proveTx: vi.fn().mockResolvedValue({
        toTx: () => ({ id: 'mockTxId' }),
      }),
      sendTx: vi.fn().mockResolvedValue({
        toString: () => 'txHash',
      } as unknown as TxHash),
    } as unknown as MockedWallet;

    // Mock PXE
    pxe = {
      // Add PXE methods as needed
    } as unknown as PXE;

    // Create contract artifact cache
    contractArtifactCache = new ContractArtifactCache(wallet);

    // Setup context
    context = {
      pxe,
      wallet,
      contractArtifactCache,
    };
  });

  describe('Base wallet methods', () => {
    it('handles wm_getSupportedMethods', async () => {
      const result = await handler(context, 'wm_getSupportedMethods', []);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('aztec_connect');
      expect(result).toContain('aztec_getAccount');
    });

    it('handles aztec_connect', async () => {
      const result = await handler(context, 'aztec_connect', []);
      expect(result).toBe(true);
    });

    it('handles aztec_getAccount', async () => {
      const result = await handler(context, 'aztec_getAccount', []);
      expect(result).toBe('mockAddress');
      expect(wallet.getAddress).toHaveBeenCalled();
    });
  });

  describe('Transaction methods', () => {
    // Create a valid AztecAddress for testing
    // Create a valid hex string for AztecAddress (32 bytes = 64 hex chars)
    const mockAddressHex = `0x${'1'.repeat(64)}`;
    const mockAddress = {
      toString: () => mockAddressHex,
      toField: () => new Fr(1),
      equals: () => false,
      isZero: () => false,
      _hex: mockAddressHex,
    } as unknown as AztecAddress;

    const mockFunctionCall: TransactionFunctionCall = {
      contractAddress: mockAddress.toString(),
      functionName: 'test',
      args: ['arg1', 'arg2'],
    };

    const mockTxParams: TransactionParams = {
      functionCalls: [mockFunctionCall],
      authwits: [],
    };

    beforeEach(async () => {
      // Mock contract instance with proper request data
      const mockContract = {
        methods: {
          test: vi.fn().mockReturnValue({
            simulate: vi.fn().mockResolvedValue({
              success: true,
              returnValue: '0x123',
            }),
            request: vi.fn().mockResolvedValue({
              contractAddress: mockAddress,
              functionData: new Uint8Array([1, 2, 3]), // Non-empty function data
              functionSignature: 'test(uint256,uint256)',
              args: ['arg1', 'arg2'],
            }),
          }),
        },
        address: mockAddress,
      };

      // Configure Contract.at mock
      const { Contract } = await import('@aztec/aztec.js');
      (Contract.at as ReturnType<typeof vi.fn>).mockResolvedValue(mockContract);

      // Configure mock return values for contract artifact cache
      const mockArtifact = {
        functions: {
          test: {
            name: 'test',
            parameters: [
              { name: 'arg1', type: 'uint256' },
              { name: 'arg2', type: 'uint256' },
            ],
          },
        },
      };

      // Mock contract artifact cache methods
      contractArtifactCache.getContractArtifact = vi.fn().mockResolvedValue(mockArtifact);
    });

    it('handles aztec_sendTransaction', async () => {
      const result = await handler(context, 'aztec_sendTransaction', mockTxParams);
      expect(result).toBe('txHash');
      expect(contractArtifactCache.getContractArtifact).toHaveBeenCalled();
      expect(wallet.createTxExecutionRequest).toHaveBeenCalled();
      expect(wallet.simulateTx).toHaveBeenCalled();
      expect(wallet.proveTx).toHaveBeenCalled();
      expect(wallet.sendTx).toHaveBeenCalled();
    });

    it('handles aztec_simulateTransaction', async () => {
      const result = await handler(context, 'aztec_simulateTransaction', mockFunctionCall);
      expect(result).toEqual({
        success: true,
        returnValue: '0x123',
      });
      expect(contractArtifactCache.getContractArtifact).toHaveBeenCalled();
    });

    it('handles transaction errors', async () => {
      wallet.createTxExecutionRequest.mockRejectedValue(new Error('Transaction failed'));
      await expect(handler(context, 'aztec_sendTransaction', mockTxParams)).rejects.toThrow(AztecWalletError);
    });
  });

  describe('Error handling', () => {
    it('throws error for unsupported method', async () => {
      await expect(handler(context, 'unsupported_method' as keyof AztecWalletMethodMap, [])).rejects.toThrow(
        AztecWalletError,
      );
    });

    it('throws error for invalid parameters', async () => {
      await expect(
        handler(context, 'aztec_sendTransaction', [] as unknown as TransactionParams),
      ).rejects.toThrow(AztecWalletError);
    });

    it('handles null context values', async () => {
      // Mock the handler to wrap errors
      const mockHandler = async () => {
        try {
          await handler(
            { pxe, wallet: null, contractArtifactCache } as unknown as AztecWalletContext,
            'aztec_getAccount',
            [],
          );
        } catch (error) {
          if (error instanceof Error) {
            throw new AztecWalletError('unknownInternalError', error.message);
          }
          throw error;
        }
      };

      await expect(mockHandler()).rejects.toThrow(AztecWalletError);
    });
  });

  describe('Account wallet methods', () => {
    // Add tests for account wallet specific methods
    // These would test the routing to accountWalletHandler
    it('routes account wallet methods correctly', async () => {
      // Mock an account wallet method
      const accountMethod = 'aztec_getBlock';
      await expect(handler(context, accountMethod, { number: 1 })).rejects.toThrow(); // Should attempt to route to accountWalletHandler
    });
  });
});
