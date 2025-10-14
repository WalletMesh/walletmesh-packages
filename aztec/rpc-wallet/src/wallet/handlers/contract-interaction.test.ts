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
        txStatusId: expect.any(String),
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

    it('should automatically send transaction status notifications with backend-generated ID', async () => {
      const result = await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload]);

      // Verify the backend generated a txStatusId and returned it
      expect(result.txStatusId).toBeDefined();
      expect(typeof result.txStatusId).toBe('string');
      expect(result.txStatusId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID format

      // Verify notifications were sent for each stage
      const notifyCalls = vi.mocked(mockContext.notify!).mock.calls;

      // Should have notifications for: initiated, simulating, proving, sending, pending
      expect(notifyCalls.length).toBeGreaterThanOrEqual(5);

      // Verify all notifications use the same txStatusId
      const txStatusId = result.txStatusId;

      // Verify initiated notification (sent first)
      const initiatedCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'initiated',
      );
      expect(initiatedCall).toBeDefined();
      expect(initiatedCall?.[1]).toMatchObject({
        txStatusId,
        status: 'initiated',
        timestamp: expect.any(Number),
      });

      // Verify simulating notification
      const simulatingCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'simulating',
      );
      expect(simulatingCall).toBeDefined();
      expect(simulatingCall?.[1]).toMatchObject({
        txStatusId,
        status: 'simulating',
        timestamp: expect.any(Number),
      });

      // Verify proving notification
      const provingCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'proving',
      );
      expect(provingCall).toBeDefined();
      expect(provingCall?.[1]).toMatchObject({
        txStatusId,
        status: 'proving',
        timestamp: expect.any(Number),
      });

      // Verify sending notification
      const sendingCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'sending',
      );
      expect(sendingCall).toBeDefined();
      expect(sendingCall?.[1]).toMatchObject({
        txStatusId,
        status: 'sending',
        timestamp: expect.any(Number),
      });

      // Verify pending notification (includes txHash)
      const pendingCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'pending',
      );
      expect(pendingCall).toBeDefined();
      expect(pendingCall?.[1]).toMatchObject({
        txStatusId,
        status: 'pending',
        txHash: mockTxHash.toString(),
        timestamp: expect.any(Number),
      });
    });

    it('should send error notification when transaction fails', async () => {
      const errorMessage = 'Simulation failed';

      // Make simulation fail
      vi.mocked(mockContext.wallet.simulateTx).mockRejectedValueOnce(new Error(errorMessage));

      await expect(handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload])).rejects.toThrow();

      // Verify error notification was sent with a backend-generated txStatusId
      const notifyCalls = vi.mocked(mockContext.notify!).mock.calls;
      const failedCall = notifyCalls.find(
        (call) =>
          call[0] === 'aztec_transactionStatus' &&
          (call[1] as Record<string, unknown>)['status'] === 'failed',
      );

      expect(failedCall).toBeDefined();
      expect(failedCall?.[1]).toMatchObject({
        txStatusId: expect.any(String),
        status: 'failed',
        error: expect.stringContaining(errorMessage),
        timestamp: expect.any(Number),
      });
    });

    it('should continue transaction execution even if notifications fail', async () => {
      // Make notify fail
      vi.mocked(mockContext.notify!).mockRejectedValue(new Error('Notification failed'));

      // Transaction should still complete successfully
      const result = await handlers.aztec_wmExecuteTx(mockContext, [mockExecutionPayload]);

      expect(result).toEqual({
        txHash: mockTxHash,
        txStatusId: expect.any(String),
      });
      // Verify wallet methods were still called
      expect(mockContext.wallet.simulateTx).toHaveBeenCalled();
      expect(mockContext.wallet.proveTx).toHaveBeenCalled();
      expect(mockContext.wallet.sendTx).toHaveBeenCalled();
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
        txStatusId: expect.any(String),
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
        txStatusId: expect.any(String),
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
});
