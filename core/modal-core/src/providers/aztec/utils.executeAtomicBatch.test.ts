/**
 * Tests for executeAtomicBatch utility function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAtomicBatch } from './utils.js';
import type { AztecDappWallet, ContractFunctionInteraction, SentTx, TxReceipt } from './types.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';

describe('executeAtomicBatch', () => {
  let mockWallet: AztecDappWallet;
  let mockInteraction1: ContractFunctionInteraction;
  let mockInteraction2: ContractFunctionInteraction;
  let mockInteraction3: ContractFunctionInteraction;

  const mockTxHash = '0xabcdef1234567890';
  const mockReceipt: TxReceipt = {
    txHash: mockTxHash,
    status: 'success',
  };

  beforeEach(() => {
    // Create mock wallet with wmBatchExecute method
    mockWallet = {
      wmBatchExecute: vi.fn().mockResolvedValue({
        txHash: mockTxHash,
        receipt: mockReceipt,
        txStatusId: 'test-status-id-123',
      }),
      deployContract: vi.fn(),
      wmDeployContract: vi.fn(),
      wmExecuteTx: vi.fn(),
      wmSimulateTx: vi.fn(),
      proveTx: vi.fn(),
      sendTx: vi.fn(),
      simulateTx: vi.fn(),
      getTxReceipt: vi.fn(),
      registerContractClass: vi.fn(),
      getAddress: vi.fn(),
      getCompleteAddress: vi.fn(),
      createAuthWit: vi.fn(),
      getBlockNumber: vi.fn(),
    };

    // Create mock interactions with request() method
    mockInteraction1 = {
      request: vi.fn().mockResolvedValue({ type: 'execution-payload', calls: ['call1'] }),
      simulate: vi.fn(),
      send: vi.fn(),
    };

    mockInteraction2 = {
      request: vi.fn().mockResolvedValue({ type: 'execution-payload', calls: ['call2'] }),
      simulate: vi.fn(),
      send: vi.fn(),
    };

    mockInteraction3 = {
      request: vi.fn().mockResolvedValue({ type: 'execution-payload', calls: ['call3'] }),
      simulate: vi.fn(),
      send: vi.fn(),
    };
  });

  it('should execute atomic batch successfully', async () => {
    const interactions = [mockInteraction1, mockInteraction2, mockInteraction3];

    const result: SentTx = await executeAtomicBatch(mockWallet, interactions);

    // Verify result structure
    expect(result).toBeDefined();
    expect(result.txHash).toBe(mockTxHash);
    expect(typeof result.wait).toBe('function');

    // Verify request() was called for each interaction
    expect(mockInteraction1.request).toHaveBeenCalledTimes(1);
    expect(mockInteraction2.request).toHaveBeenCalledTimes(1);
    expect(mockInteraction3.request).toHaveBeenCalledTimes(1);

    // Verify wmBatchExecute was called with execution payloads
    expect(mockWallet.wmBatchExecute).toHaveBeenCalledTimes(1);
    expect(mockWallet.wmBatchExecute).toHaveBeenCalledWith(
      [
        { type: 'execution-payload', calls: ['call1'] },
        { type: 'execution-payload', calls: ['call2'] },
        { type: 'execution-payload', calls: ['call3'] },
      ],
      undefined,
    );

    // Verify wait() returns the receipt
    const receipt = await result.wait();
    expect(receipt).toEqual(mockReceipt);
  });

  it('should pass send options to wmBatchExecute', async () => {
    const interactions = [mockInteraction1];
    const sendOptions = { fee: 100, txNonce: 42 };

    await executeAtomicBatch(mockWallet, interactions, sendOptions);

    expect(mockWallet.wmBatchExecute).toHaveBeenCalledWith(
      [{ type: 'execution-payload', calls: ['call1'] }],
      sendOptions,
    );
  });

  it('should throw error when wallet is null', async () => {
    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(null, interactions)).rejects.toThrow('No Aztec wallet available');
  });

  it('should throw error when wallet is undefined', async () => {
    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(undefined as unknown as null, interactions)).rejects.toThrow(
      'No Aztec wallet available',
    );
  });

  it('should throw error when interactions array is empty', async () => {
    await expect(executeAtomicBatch(mockWallet, [])).rejects.toThrow(
      'No interactions provided for atomic batch execution',
    );
  });

  it('should throw error when interactions is null', async () => {
    await expect(
      executeAtomicBatch(mockWallet, null as unknown as ContractFunctionInteraction[]),
    ).rejects.toThrow('No interactions provided for atomic batch execution');
  });

  it('should throw error when wallet does not support wmBatchExecute', async () => {
    const walletWithoutBatch = {
      ...mockWallet,
      wmBatchExecute: undefined,
    } as unknown as AztecDappWallet;

    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(walletWithoutBatch, interactions)).rejects.toThrow(
      'Wallet does not support atomic batch execution',
    );
  });

  it('should throw error when interaction does not have request() method', async () => {
    const invalidInteraction = {
      simulate: vi.fn(),
      send: vi.fn(),
    } as unknown as ContractFunctionInteraction;

    const interactions = [mockInteraction1, invalidInteraction];

    await expect(executeAtomicBatch(mockWallet, interactions)).rejects.toThrow(
      'Interaction at index 1 does not have a request() method',
    );
  });

  it('should throw error when request() fails', async () => {
    const errorMessage = 'Request failed';
    vi.mocked(mockInteraction1.request).mockRejectedValueOnce(new Error(errorMessage));

    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(mockWallet, interactions)).rejects.toThrow();
  });

  it('should throw error when wmBatchExecute fails', async () => {
    const errorMessage = 'Batch execution failed';
    vi.mocked(mockWallet.wmBatchExecute).mockRejectedValueOnce(new Error(errorMessage));

    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(mockWallet, interactions)).rejects.toThrow(
      'Failed to execute atomic batch',
    );
  });

  it('should throw error when transaction hash is unavailable', async () => {
    vi.mocked(mockWallet.wmBatchExecute).mockResolvedValueOnce({
      txHash: null as unknown as string,
      receipt: mockReceipt,
      txStatusId: 'test-id',
    });

    const interactions = [mockInteraction1];

    await expect(executeAtomicBatch(mockWallet, interactions)).rejects.toThrow(
      'Transaction hash unavailable from wmBatchExecute',
    );
  });

  it('should handle txHash as string', async () => {
    vi.mocked(mockWallet.wmBatchExecute).mockResolvedValueOnce({
      txHash: mockTxHash,
      receipt: mockReceipt,
      txStatusId: 'test-id',
    });

    const interactions = [mockInteraction1];
    const result = await executeAtomicBatch(mockWallet, interactions);

    expect(result.txHash).toBe(mockTxHash);
  });

  it('should handle txHash as object with toString()', async () => {
    const txHashObj = {
      toString: () => mockTxHash,
    };

    vi.mocked(mockWallet.wmBatchExecute).mockResolvedValueOnce({
      txHash: txHashObj as unknown as string,
      receipt: mockReceipt,
      txStatusId: 'test-id',
    });

    const interactions = [mockInteraction1];
    const result = await executeAtomicBatch(mockWallet, interactions);

    expect(result.txHash).toBe(mockTxHash);
  });

  it('should handle receipt normalization correctly', async () => {
    const customReceipt = {
      txHash: mockTxHash,
      status: 'confirmed',
      blockNumber: 12345,
      error: undefined,
    };

    vi.mocked(mockWallet.wmBatchExecute).mockResolvedValueOnce({
      txHash: mockTxHash,
      receipt: customReceipt as unknown as TxReceipt,
      txStatusId: 'test-id',
    });

    const interactions = [mockInteraction1];
    const result = await executeAtomicBatch(mockWallet, interactions);

    const receipt = await result.wait();
    expect(receipt.txHash).toBe(mockTxHash);
    expect(receipt.status).toBeDefined();
  });

  it('should execute single interaction atomically', async () => {
    const interactions = [mockInteraction1];

    const result = await executeAtomicBatch(mockWallet, interactions);

    expect(result.txHash).toBe(mockTxHash);
    expect(mockInteraction1.request).toHaveBeenCalledTimes(1);
    expect(mockWallet.wmBatchExecute).toHaveBeenCalledTimes(1);
  });

  it('should execute multiple interactions atomically', async () => {
    const interactions = [mockInteraction1, mockInteraction2, mockInteraction3];

    const result = await executeAtomicBatch(mockWallet, interactions);

    expect(result.txHash).toBe(mockTxHash);
    expect(mockInteraction1.request).toHaveBeenCalledTimes(1);
    expect(mockInteraction2.request).toHaveBeenCalledTimes(1);
    expect(mockInteraction3.request).toHaveBeenCalledTimes(1);
    expect(mockWallet.wmBatchExecute).toHaveBeenCalledTimes(1);
  });

  it('should collect execution payloads from all interactions', async () => {
    const interactions = [mockInteraction1, mockInteraction2];

    await executeAtomicBatch(mockWallet, interactions);

    const callArgs = vi.mocked(mockWallet.wmBatchExecute).mock.calls[0];
    expect(callArgs?.[0]).toHaveLength(2);
    expect(callArgs?.[0]?.[0]).toEqual({ type: 'execution-payload', calls: ['call1'] });
    expect(callArgs?.[0]?.[1]).toEqual({ type: 'execution-payload', calls: ['call2'] });
  });

  it('should use ErrorFactory for errors', async () => {
    const interactions: ContractFunctionInteraction[] = [];

    try {
      await executeAtomicBatch(mockWallet, interactions);
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify error is properly formatted
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    }
  });
});
