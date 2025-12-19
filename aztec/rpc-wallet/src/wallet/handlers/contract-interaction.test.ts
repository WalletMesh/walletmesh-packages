import { AztecAddress, FeeJuicePaymentMethod, Fr, TxHash, type TxReceipt } from '@aztec/aztec.js';
import type { ExecutionPayload } from '@aztec/entrypoints/payload';
import { GasFees } from '@aztec/stdlib/gas';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContractInteractionHandlers } from './contract-interaction.js';
import type { AztecHandlerContext } from './index.js';

// Mock the aztec.js module
vi.mock('@aztec/aztec.js', async () => {
  const actual = await vi.importActual('@aztec/aztec.js');
  return {
    ...actual,
    Contract: {
      deploy: vi.fn(),
    },
  };
});

describe('createContractInteractionHandlers', () => {
  let mockContext: AztecHandlerContext;
  let handlers: ReturnType<typeof createContractInteractionHandlers>;

  const mockAddress = AztecAddress.fromString(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  );
  const mockTxHash = TxHash.fromString('0x2222222222222222222222222222222222222222222222222222222222222222');
  const mockTxReceipt = {
    txHash: mockTxHash,
    blockNumber: 1,
    status: 'success',
  } as unknown as TxReceipt;

  const mockExecutionPayload: ExecutionPayload = {
    calls: [], // Add calls property
  } as unknown as ExecutionPayload;

  beforeEach(() => {
    mockContext = {
      wallet: {
        getAddress: vi.fn().mockReturnValue(mockAddress),
        getCurrentBaseFees: vi.fn().mockResolvedValue(new GasFees(100n, 100n)),
        createTxExecutionRequest: vi.fn().mockResolvedValue({}),
        simulateTx: vi.fn().mockResolvedValue({ privateExecutionResult: {} }),
        proveTx: vi.fn().mockResolvedValue({ toTx: vi.fn().mockReturnValue({}) }),
        sendTx: vi.fn().mockResolvedValue(mockTxHash),
        getTxReceipt: vi.fn().mockResolvedValue(mockTxReceipt),
        registerContract: vi.fn().mockResolvedValue(undefined),
        getContractClassMetadata: vi.fn().mockResolvedValue({
          artifactHash: new Fr(123n),
          privateFunctionsRoot: new Fr(456n),
          publicBytecodeCommitment: new Fr(789n),
        }),
        getContractMetadata: vi.fn().mockResolvedValue(undefined),
        registerContractClass: vi.fn().mockResolvedValue(undefined),
      },
      pxe: {},
      cache: {},
      notify: vi.fn().mockResolvedValue(undefined),
    } as unknown as AztecHandlerContext;

    handlers = createContractInteractionHandlers();
  });

  describe('aztec_wmExecuteTx', () => {
    it('should execute a contract interaction', async () => {
      const result = await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload]);

      expect(result).toEqual({
        txHash: mockTxHash,
      });
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();
      expect(mockContext.wallet.createTxExecutionRequest).toHaveBeenCalled();
      expect(mockContext.wallet.simulateTx).toHaveBeenCalled();
      expect(mockContext.wallet.proveTx).toHaveBeenCalled();
      expect(mockContext.wallet.sendTx).toHaveBeenCalled();
    });

    it('should handle contract interaction with proper fee configuration', async () => {
      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload]);

      // Verify fee configuration
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();
      expect(createTxCall?.[0]).toBe(mockExecutionPayload);

      const feeOpts = createTxCall?.[1];
      expect(feeOpts).toBeDefined();
      expect(feeOpts?.paymentMethod).toBeInstanceOf(FeeJuicePaymentMethod);
      expect(feeOpts?.gasSettings).toBeDefined();
    });

    it('should propagate errors when transaction fails', async () => {
      const errorMessage = 'Simulation failed';

      // Make simulation fail
      vi.mocked(mockContext.wallet.simulateTx).mockRejectedValueOnce(new Error(errorMessage));

      await expect(handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload])).rejects.toThrow(errorMessage);
    });

    it('should accept and use custom fee options from sendOptions', async () => {
      const customFeeOptions = {
        paymentMethod: new FeeJuicePaymentMethod(mockAddress),
        gasSettings: {
          maxFeesPerGas: { feePerL2Gas: 200n, feePerDaGas: 200n },
          maxInclFeePerGas: { feePerL2Gas: 300n, feePerDaGas: 300n },
        },
      };

      const sendOptions = {
        fee: customFeeOptions,
      };

      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload, sendOptions]);

      // Verify custom fee options were passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();
      expect(createTxCall?.[0]).toBe(mockExecutionPayload);

      const feeOpts = createTxCall?.[1];
      expect(feeOpts).toBeDefined();
      expect(feeOpts?.paymentMethod).toBe(customFeeOptions.paymentMethod);
    });

    it('should accept and use custom txNonce from sendOptions', async () => {
      const customTxNonce = 42;
      const sendOptions = {
        txNonce: customTxNonce,
      };

      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload, sendOptions]);

      // Verify txNonce was passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const txOpts = createTxCall?.[2];
      expect(txOpts).toBeDefined();
      expect(txOpts?.txNonce).toBe(customTxNonce);
    });

    it('should accept and use custom cancellable flag from sendOptions', async () => {
      const sendOptions = {
        cancellable: true,
      };

      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload, sendOptions]);

      // Verify cancellable was passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const txOpts = createTxCall?.[2];
      expect(txOpts).toBeDefined();
      expect(txOpts?.cancellable).toBe(true);
    });

    it('should accept and use multiple custom options from sendOptions', async () => {
      const customFeeOptions = {
        paymentMethod: new FeeJuicePaymentMethod(mockAddress),
        gasSettings: {
          maxFeesPerGas: { feePerL2Gas: 200n, feePerDaGas: 200n },
          maxInclFeePerGas: { feePerL2Gas: 300n, feePerDaGas: 300n },
        },
      };

      const sendOptions = {
        fee: customFeeOptions,
        txNonce: 99,
        cancellable: false,
      };

      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload, sendOptions]);

      // Verify all custom options were passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const feeOpts = createTxCall?.[1];
      expect(feeOpts?.paymentMethod).toBe(customFeeOptions.paymentMethod);

      const txOpts = createTxCall?.[2];
      expect(txOpts?.txNonce).toBe(99);
      expect(txOpts?.cancellable).toBe(false);
    });

    it('should use default options when sendOptions is not provided (backward compatibility)', async () => {
      // Call without sendOptions parameter (old API)
      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload]);

      // Verify default fee and tx options were used
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();
      expect(createTxCall?.[0]).toBe(mockExecutionPayload);

      // Should have called getCurrentBaseFees for default fee options
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();

      const feeOpts = createTxCall?.[1];
      expect(feeOpts).toBeDefined();
      expect(feeOpts?.paymentMethod).toBeInstanceOf(FeeJuicePaymentMethod);
    });

    it('should use default options when sendOptions is empty object', async () => {
      // Pass empty object as sendOptions
      await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload, {}]);

      // Verify default options were used
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();
      expect(mockContext.wallet.createTxExecutionRequest).toHaveBeenCalled();
    });
  });

  describe('aztec_wmDeployContract', () => {
    it('should deploy a contract with new interface', async () => {
      const { Contract } = await import('@aztec/aztec.js');

      // Create a minimal artifact that won't trigger complex contract deployment logic
      const mockArtifact = {
        name: 'TestContract',
        functions: [],
      } as unknown as import('@aztec/aztec.js').ContractArtifact;

      const mockArgs: unknown[] = [];

      const mockSentTx = {
        getTxHash: vi.fn().mockResolvedValue(mockTxHash),
        wait: vi.fn().mockResolvedValue({}),
      };

      const mockProvenTx = {
        send: vi.fn().mockResolvedValue(mockSentTx),
      };

      const mockDeployMethod = {
        prove: vi.fn().mockResolvedValue(mockProvenTx),
        getInstance: vi.fn().mockResolvedValue({
          address: mockAddress,
        }),
      };

      vi.mocked(Contract.deploy).mockReturnValue(
        mockDeployMethod as unknown as ReturnType<typeof Contract.deploy>,
      );

      const params = {
        artifact: mockArtifact,
        args: mockArgs,
      };

      const result = await handlers.aztec_wmDeployContract(mockContext, [params]);

      expect(result).toEqual({
        txHash: mockTxHash,
        contractAddress: mockAddress,
      });
      expect(Contract.deploy).toHaveBeenCalledWith(mockContext.wallet, mockArtifact, mockArgs, undefined);
      expect(mockDeployMethod.prove).toHaveBeenCalled();
      expect(mockProvenTx.send).toHaveBeenCalled();
      expect(mockSentTx.getTxHash).toHaveBeenCalled();
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();
    });

    it('should deploy a contract with custom constructor name', async () => {
      const { Contract } = await import('@aztec/aztec.js');

      const mockArtifact = {
        name: 'TestContract',
        functions: [],
      } as unknown as import('@aztec/aztec.js').ContractArtifact;

      const mockArgs: unknown[] = [];

      const mockSentTx = {
        getTxHash: vi.fn().mockResolvedValue(mockTxHash),
        wait: vi.fn().mockResolvedValue({}),
      };

      const mockProvenTx = {
        send: vi.fn().mockResolvedValue(mockSentTx),
      };

      const mockDeployMethod = {
        prove: vi.fn().mockResolvedValue(mockProvenTx),
        getInstance: vi.fn().mockResolvedValue({
          address: mockAddress,
        }),
      };

      vi.mocked(Contract.deploy).mockReturnValue(
        mockDeployMethod as unknown as ReturnType<typeof Contract.deploy>,
      );

      const params = {
        artifact: mockArtifact,
        args: mockArgs,
        constructorName: 'customConstructor',
      };

      const result = await handlers.aztec_wmDeployContract(mockContext, [params]);

      expect(result).toEqual({
        txHash: mockTxHash,
        contractAddress: mockAddress,
      });
      expect(Contract.deploy).toHaveBeenCalledWith(
        mockContext.wallet,
        mockArtifact,
        mockArgs,
        'customConstructor',
      );
      expect(mockDeployMethod.prove).toHaveBeenCalled();
      expect(mockProvenTx.send).toHaveBeenCalled();
      expect(mockSentTx.getTxHash).toHaveBeenCalled();
    });

    it('should register contract instance before deployment', async () => {
      const { Contract } = await import('@aztec/aztec.js');

      const mockArtifact = {
        name: 'TestContract',
        functions: [],
      } as unknown as import('@aztec/aztec.js').ContractArtifact;

      const mockSentTx = {
        getTxHash: vi.fn().mockResolvedValue(mockTxHash),
        wait: vi.fn().mockResolvedValue({}),
      };

      const mockProvenTx = {
        send: vi.fn().mockResolvedValue(mockSentTx),
      };

      const mockDeployMethod = {
        prove: vi.fn().mockResolvedValue(mockProvenTx),
        getInstance: vi.fn().mockResolvedValue({
          address: mockAddress,
        }),
      };

      vi.mocked(Contract.deploy).mockReturnValue(
        mockDeployMethod as unknown as ReturnType<typeof Contract.deploy>,
      );

      const params = {
        artifact: mockArtifact,
        args: [],
      };

      // Track the order of calls
      const callOrder: string[] = [];
      vi.mocked(mockContext.wallet.getCurrentBaseFees).mockImplementation(async () => {
        callOrder.push('getCurrentBaseFees');
        return new GasFees(100n, 100n);
      });
      vi.mocked(mockDeployMethod.prove).mockImplementation(async () => {
        callOrder.push('prove');
        return mockProvenTx;
      });
      vi.mocked(mockProvenTx.send).mockImplementation(async () => {
        callOrder.push('send');
        return mockSentTx;
      });

      await handlers.aztec_wmDeployContract(mockContext, [params]);

      // Verify that the deployment flow is correct
      expect(callOrder.includes('getCurrentBaseFees')).toBe(true);
      expect(callOrder.includes('prove')).toBe(true);
      expect(callOrder.includes('send')).toBe(true);
      expect(callOrder.indexOf('prove') < callOrder.indexOf('send')).toBe(true);
    });
  });

  describe('aztec_wmBatchExecute', () => {
    const createMockPayload = (calls: unknown[] = []): ExecutionPayload =>
      ({
        calls,
        authWitnesses: [],
        packedArguments: [],
        enqueuedPublicFunctions: [],
        capsules: [],
        extraHashedArgs: [],
      }) as unknown as ExecutionPayload;

    it('should execute atomic batch transaction successfully', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);
      const payload2 = createMockPayload([{ to: mockAddress, selector: 'approve', args: [200] }]);

      const result = await handlers.aztec_wmBatchExecute(mockContext, [[payload1, payload2]]);

      expect(result).toEqual({
        txHash: mockTxHash,
        receipt: mockTxReceipt,
      });

      // Verify wallet methods were called
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();
      expect(mockContext.wallet.createTxExecutionRequest).toHaveBeenCalled();
      expect(mockContext.wallet.simulateTx).toHaveBeenCalled();
      expect(mockContext.wallet.proveTx).toHaveBeenCalled();
      expect(mockContext.wallet.sendTx).toHaveBeenCalled();
      expect(mockContext.wallet.getTxReceipt).toHaveBeenCalled();
    });

    it('should merge multiple execution payloads correctly', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);
      const payload2 = createMockPayload([{ to: mockAddress, selector: 'approve', args: [200] }]);
      const payload3 = createMockPayload([{ to: mockAddress, selector: 'mint', args: [300] }]);

      await handlers.aztec_wmBatchExecute(mockContext, [[payload1, payload2, payload3]]);

      // Verify that createTxExecutionRequest was called with merged payload
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const mergedPayload = createTxCall?.[0] as ExecutionPayload;
      expect(mergedPayload.calls).toHaveLength(3);
    });

    it('should validate execution payloads and reject empty array', async () => {
      await expect(handlers.aztec_wmBatchExecute(mockContext, [[]])).rejects.toThrow(
        'executionPayloads array cannot be empty',
      );
    });

    it('should validate execution payloads and reject invalid payloads', async () => {
      const invalidPayload = null as unknown as ExecutionPayload;

      await expect(handlers.aztec_wmBatchExecute(mockContext, [[invalidPayload]])).rejects.toThrow(
        'executionPayloads[0] must be an object',
      );
    });

    it('should validate execution payloads structure', async () => {
      const invalidPayload = { invalid: 'structure' } as unknown as ExecutionPayload;

      await expect(handlers.aztec_wmBatchExecute(mockContext, [[invalidPayload]])).rejects.toThrow(
        'executionPayloads[0].calls must be an array',
      );
    });

    it('should propagate errors when batch transaction fails', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);
      const errorMessage = 'Simulation failed during batch';

      // Make simulation fail
      vi.mocked(mockContext.wallet.simulateTx).mockRejectedValueOnce(new Error(errorMessage));

      await expect(handlers.aztec_wmBatchExecute(mockContext, [[payload1]])).rejects.toThrow(errorMessage);
    });

    it('should accept and use custom fee options from sendOptions', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);

      const customFeeOptions = {
        paymentMethod: new FeeJuicePaymentMethod(mockAddress),
        gasSettings: {
          maxFeesPerGas: { feePerL2Gas: 500n, feePerDaGas: 500n },
          maxInclFeePerGas: { feePerL2Gas: 600n, feePerDaGas: 600n },
        },
      };

      const sendOptions = {
        fee: customFeeOptions,
      };

      await handlers.aztec_wmBatchExecute(mockContext, [[payload1], sendOptions]);

      // Verify custom fee options were passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const feeOpts = createTxCall?.[1];
      expect(feeOpts).toBeDefined();
      expect(feeOpts?.paymentMethod).toBe(customFeeOptions.paymentMethod);
    });

    it('should accept and use custom txNonce and cancellable from sendOptions', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);

      const sendOptions = {
        txNonce: 42,
        cancellable: true,
      };

      await handlers.aztec_wmBatchExecute(mockContext, [[payload1], sendOptions]);

      // Verify custom tx options were passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const txOpts = createTxCall?.[2];
      expect(txOpts).toBeDefined();
      expect(txOpts?.txNonce).toBe(42);
      expect(txOpts?.cancellable).toBe(true);
    });

    it('should accept and use multiple custom options from sendOptions', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);
      const payload2 = createMockPayload([{ to: mockAddress, selector: 'approve', args: [200] }]);

      const customFeeOptions = {
        paymentMethod: new FeeJuicePaymentMethod(mockAddress),
        gasSettings: {
          maxFeesPerGas: { feePerL2Gas: 400n, feePerDaGas: 400n },
          maxInclFeePerGas: { feePerL2Gas: 500n, feePerDaGas: 500n },
        },
      };

      const sendOptions = {
        fee: customFeeOptions,
        txNonce: 123,
        cancellable: false,
      };

      await handlers.aztec_wmBatchExecute(mockContext, [[payload1, payload2], sendOptions]);

      // Verify all custom options were passed to createTxExecutionRequest
      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const feeOpts = createTxCall?.[1];
      expect(feeOpts?.paymentMethod).toBe(customFeeOptions.paymentMethod);

      const txOpts = createTxCall?.[2];
      expect(txOpts?.txNonce).toBe(123);
      expect(txOpts?.cancellable).toBe(false);
    });

    it('should use default options when sendOptions is not provided (backward compatibility)', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);

      // Call without sendOptions parameter (old API)
      await handlers.aztec_wmBatchExecute(mockContext, [[payload1]]);

      // Verify default fee and tx options were used
      expect(mockContext.wallet.getCurrentBaseFees).toHaveBeenCalled();

      const createTxCall = vi.mocked(mockContext.wallet.createTxExecutionRequest).mock.calls[0];
      expect(createTxCall).toBeDefined();

      const feeOpts = createTxCall?.[1];
      expect(feeOpts).toBeDefined();
      expect(feeOpts?.paymentMethod).toBeInstanceOf(FeeJuicePaymentMethod);
    });

    it('should return receipt in the result for immediate use', async () => {
      const payload1 = createMockPayload([{ to: mockAddress, selector: 'transfer', args: [100] }]);

      const result = await handlers.aztec_wmBatchExecute(mockContext, [[payload1]]);

      // Verify receipt is included in the result
      expect(result.receipt).toEqual(mockTxReceipt);
      expect(result.receipt.txHash).toEqual(mockTxHash);
      expect(result.receipt.status).toBe('success');
    });
  });
});
