import type {
  AccountWallet,
  AuthWitness,
  AztecAddress,
  PXE,
  Tx,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
} from '@aztec/aztec.js';
import { Fr } from '@aztec/aztec.js';
import type {
  PrivateExecutionResult,
  TxProfileResult,
  TxProvingResult,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
// import type { FeeOptions, TxExecutionOptions } from '@aztec/entrypoints/interfaces'; // Unused
// import type { ExecutionPayload } from '@aztec/entrypoints/payload'; // Unused
import type { AztecHandlerContext } from './index.js';
import { createTransactionHandlers } from './transaction.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    createTxExecutionRequest: vi.fn(),
    proveTx: vi.fn(),
    sendTx: vi.fn(),
    getTxReceipt: vi.fn(),
    simulateTx: vi.fn(),
    profileTx: vi.fn(),
    simulateUtility: vi.fn(),
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    // No specific methods needed for transaction handlers
  }) as unknown as PXE;

const createMockContext = (wallet: AccountWallet, pxe: PXE): AztecHandlerContext => ({
  wallet,
  pxe,
  cache: {} as ContractArtifactCache,
});

describe('Transaction Handlers', () => {
  let mockWallet: AccountWallet;
  let mockPXE: PXE;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createTransactionHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    mockPXE = createMockPXE();
    context = createMockContext(mockWallet, mockPXE);
    handlers = createTransactionHandlers();
  });

  describe('aztec_proveTx', () => {
    it('should prove transaction with request and execution result', async () => {
      const txRequest = {
        txRequest: { exec: { calls: [] } },
      } as unknown as TxExecutionRequest;
      const privateExecutionResult = {
        executionResults: [],
        gasUsed: { l2Gas: 50000, daGas: 2500 },
        entrypoint: undefined,
        firstNullifier: undefined,
        publicFunctionCalldata: undefined,
        getSimulationBlockNumber: vi.fn(),
      } as unknown as PrivateExecutionResult;

      const expectedTx = {
        hash: '0xabcdef1234567890',
        data: Buffer.from('proven transaction data'),
        privateExecutionResult: {},
        publicInputs: {},
        toTx: vi.fn(),
      } as unknown as TxProvingResult;

      vi.mocked(mockWallet.proveTx).mockResolvedValue(expectedTx);

      const result = await handlers.aztec_proveTx(context, [txRequest, privateExecutionResult]);

      expect(mockWallet.proveTx).toHaveBeenCalledWith(txRequest, privateExecutionResult);
      expect(result).toBe(expectedTx);
    });

    it('should propagate errors from wallet.proveTx', async () => {
      const txRequest = {} as unknown as TxExecutionRequest;
      const privateExecutionResult = {} as unknown as PrivateExecutionResult;
      const error = new Error('Failed to prove transaction');
      vi.mocked(mockWallet.proveTx).mockRejectedValue(error);

      await expect(handlers.aztec_proveTx(context, [txRequest, privateExecutionResult])).rejects.toThrow(
        'Failed to prove transaction',
      );
      expect(mockWallet.proveTx).toHaveBeenCalledWith(txRequest, privateExecutionResult);
    });
  });

  describe('aztec_sendTx', () => {
    it('should send transaction and return transaction hash', async () => {
      const tx = {
        getTxHash: () => '0xabcdef1234567890' as unknown as TxHash,
        data: Buffer.from('transaction data'),
        toJSON: () => ({
          hash: '0xabcdef1234567890',
          data: 'transaction data',
        }),
      } as unknown as Tx;

      const expectedTxHash = '0xabcdef1234567890' as unknown as TxHash;
      vi.mocked(mockWallet.sendTx).mockResolvedValue(expectedTxHash);

      const result = await handlers.aztec_sendTx(context, [tx]);

      expect(mockWallet.sendTx).toHaveBeenCalledWith(tx);
      expect(result).toBe(expectedTxHash);
    });

    it('should propagate errors from wallet.sendTx', async () => {
      const tx = {
        getTxHash: () => '0xabcdef1234567890' as unknown as TxHash,
        toJSON: () => ({
          hash: '0xabcdef1234567890',
        }),
      } as unknown as Tx;
      const error = new Error('Failed to send transaction');
      vi.mocked(mockWallet.sendTx).mockRejectedValue(error);

      await expect(handlers.aztec_sendTx(context, [tx])).rejects.toThrow('Failed to send transaction');
      expect(mockWallet.sendTx).toHaveBeenCalledWith(tx);
    });
  });

  describe('aztec_getTxReceipt', () => {
    it('should get transaction receipt for given hash', async () => {
      const txHash = '0xabcdef1234567890' as unknown as TxHash;
      const expectedReceipt = {
        txHash,
        status: 'mined',
        blockNumber: 42,
        blockHash: '0x1234567890abcdef',
      } as unknown as TxReceipt;

      vi.mocked(mockWallet.getTxReceipt).mockResolvedValue(expectedReceipt);

      const result = await handlers.aztec_getTxReceipt(context, [txHash]);

      expect(mockWallet.getTxReceipt).toHaveBeenCalledWith(txHash);
      expect(result).toBe(expectedReceipt);
    });

    it('should handle null receipt for pending transaction', async () => {
      const txHash = '0xabcdef1234567890' as unknown as TxHash;
      vi.mocked(mockWallet.getTxReceipt).mockResolvedValue(null as unknown as TxReceipt);

      const result = await handlers.aztec_getTxReceipt(context, [txHash]);

      expect(mockWallet.getTxReceipt).toHaveBeenCalledWith(txHash);
      expect(result).toBe(null);
    });

    it('should propagate errors from wallet.getTxReceipt', async () => {
      const txHash = '0xabcdef1234567890' as unknown as TxHash;
      const error = new Error('Failed to get transaction receipt');
      vi.mocked(mockWallet.getTxReceipt).mockRejectedValue(error);

      await expect(handlers.aztec_getTxReceipt(context, [txHash])).rejects.toThrow(
        'Failed to get transaction receipt',
      );
      expect(mockWallet.getTxReceipt).toHaveBeenCalledWith(txHash);
    });
  });

  describe('aztec_simulateTx', () => {
    it('should simulate transaction with all parameters', async () => {
      const txRequest = {
        txRequest: { exec: { calls: [] } },
      } as unknown as TxExecutionRequest;
      const simulatePublic = true;
      const skipTxValidation = true;
      const skipFeeEnforcement = true;

      const expectedSimulation = {
        txRequest,
        publicOutput: {},
        gasUsed: { l2Gas: 50000, daGas: 2500 },
      } as unknown as TxSimulationResult;

      vi.mocked(mockWallet.simulateTx).mockResolvedValue(expectedSimulation);

      const result = await handlers.aztec_simulateTx(context, [
        txRequest,
        simulatePublic,
        skipTxValidation,
        skipFeeEnforcement,
      ]);

      expect(mockWallet.simulateTx).toHaveBeenCalledWith(
        txRequest,
        simulatePublic,
        skipTxValidation,
        skipFeeEnforcement,
        undefined
      );
      expect(result).toBe(expectedSimulation);
    });

    it('should simulate transaction with default parameters', async () => {
      const txRequest = {
        txRequest: { exec: { calls: [] } },
      } as unknown as TxExecutionRequest;

      const expectedSimulation = {
        txRequest,
        publicOutput: {},
        gasUsed: { l2Gas: 50000, daGas: 2500 },
      } as unknown as TxSimulationResult;

      vi.mocked(mockWallet.simulateTx).mockResolvedValue(expectedSimulation);

      const result = await handlers.aztec_simulateTx(context, [
        txRequest,
        undefined,
        undefined,
        undefined,
        undefined,
      ]);

      expect(mockWallet.simulateTx).toHaveBeenCalledWith(txRequest, false, undefined, false, undefined);
      expect(result).toBe(expectedSimulation);
    });

    it('should propagate errors from wallet.simulateTx', async () => {
      const txRequest = {} as unknown as TxExecutionRequest;
      const error = new Error('Simulation failed');
      vi.mocked(mockWallet.simulateTx).mockRejectedValue(error);

      await expect(
        handlers.aztec_simulateTx(context, [txRequest, undefined, undefined, undefined, undefined]),
      ).rejects.toThrow('Simulation failed');
      expect(mockWallet.simulateTx).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_profileTx', () => {
    it('should profile transaction with all parameters', async () => {
      const txRequest = {
        txRequest: { exec: { calls: [] } },
      } as unknown as TxExecutionRequest;
      const profileMode = 'full' as const;
      const skipProofGeneration = true;
      const msgSender = '0x1234567890abcdef' as unknown as AztecAddress;

      const expectedProfile = {
        txRequest,
        executionSteps: [],
        timings: { totalTime: 1000 },
        profile: { totalTime: 1000, gates: 50000 },
      } as unknown as TxProfileResult;

      vi.mocked(mockWallet.profileTx).mockResolvedValue(expectedProfile);

      const result = await handlers.aztec_profileTx(context, [
        txRequest,
        profileMode,
        skipProofGeneration,
        msgSender,
      ]);

      expect(mockWallet.profileTx).toHaveBeenCalledWith(
        txRequest,
        profileMode,
        skipProofGeneration,
        msgSender,
      );
      expect(result).toBe(expectedProfile);
    });

    it('should profile transaction with default parameters', async () => {
      const txRequest = {
        txRequest: { exec: { calls: [] } },
      } as unknown as TxExecutionRequest;

      const expectedProfile = {
        txRequest,
        executionSteps: [],
        timings: {},
        profile: { gates: 50000 },
      } as unknown as TxProfileResult;

      vi.mocked(mockWallet.profileTx).mockResolvedValue(expectedProfile);

      const result = await handlers.aztec_profileTx(context, [txRequest, undefined, undefined, undefined]);

      expect(mockWallet.profileTx).toHaveBeenCalledWith(txRequest, 'gates', undefined, undefined);
      expect(result).toBe(expectedProfile);
    });

    it('should propagate errors from wallet.profileTx', async () => {
      const txRequest = {} as unknown as TxExecutionRequest;
      const error = new Error('Profiling failed');
      vi.mocked(mockWallet.profileTx).mockRejectedValue(error);

      await expect(
        handlers.aztec_profileTx(context, [txRequest, undefined, undefined, undefined]),
      ).rejects.toThrow('Profiling failed');
      expect(mockWallet.profileTx).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_simulateUtility', () => {
    it('should simulate utility function with all parameters', async () => {
      const functionName = 'testUtility';
      const args = [new Fr(0x123n), new Fr(0x456n)];
      const to = '0x1234567890abcdef' as unknown as AztecAddress;
      const authWits = [{ witness: [new Fr(1n)] } as unknown as AuthWitness];
      const from = '0xabcdef1234567890' as unknown as AztecAddress;

      const expectedResult = {
        result: new Fr(0x789n),
        returnValue: new Fr(0x789n),
        gasUsed: { l2Gas: 10000, daGas: 500 },
      } as unknown as UtilitySimulationResult;

      vi.mocked(mockWallet.simulateUtility).mockResolvedValue(expectedResult);

      const result = await handlers.aztec_simulateUtility(context, [functionName, args, to, authWits, from]);

      expect(mockWallet.simulateUtility).toHaveBeenCalledWith(functionName, args, to, authWits, from);
      expect(result).toBe(expectedResult);
    });

    it('should simulate utility function with minimal parameters', async () => {
      const functionName = 'simpleUtility';
      const args: Fr[] = [];
      const to = '0x1234567890abcdef' as unknown as AztecAddress;

      const expectedResult = {
        result: new Fr(0x0n),
        returnValue: new Fr(0x0n),
        gasUsed: { l2Gas: 5000, daGas: 250 },
      } as unknown as UtilitySimulationResult;

      vi.mocked(mockWallet.simulateUtility).mockResolvedValue(expectedResult);

      const result = await handlers.aztec_simulateUtility(context, [
        functionName,
        args,
        to,
        undefined,
        undefined,
      ]);

      expect(mockWallet.simulateUtility).toHaveBeenCalledWith(functionName, args, to, undefined, undefined);
      expect(result).toBe(expectedResult);
    });

    it('should propagate errors from wallet.simulateUtility', async () => {
      const functionName = 'failingUtility';
      const args: Fr[] = [];
      const to = '0x1234567890abcdef' as unknown as AztecAddress;
      const error = new Error('Utility simulation failed');
      vi.mocked(mockWallet.simulateUtility).mockRejectedValue(error);

      await expect(
        handlers.aztec_simulateUtility(context, [functionName, args, to, undefined, undefined]),
      ).rejects.toThrow('Utility simulation failed');
      expect(mockWallet.simulateUtility).toHaveBeenCalledWith(functionName, args, to, undefined, undefined);
    });
  });
});
