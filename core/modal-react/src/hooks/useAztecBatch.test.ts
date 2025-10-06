/**
 * Tests for useAztecBatch hook
 */

import { act, renderHook } from '@testing-library/react';
vi.mock('@walletmesh/modal-core/providers/aztec', async () => {
  const actual = await vi.importActual<typeof import('@walletmesh/modal-core/providers/aztec')>(
    '@walletmesh/modal-core/providers/aztec',
  );
  return {
    ...actual,
    executeBatchInteractions: vi.fn(),
  };
});

import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { executeBatchInteractions } from '@walletmesh/modal-core/providers/aztec';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAztecBatch } from './useAztecBatch.js';

// Mock the useAztecWallet hook
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(),
}));

// Import the mocked function
import { useAztecWallet } from './useAztecWallet.js';

const mockUseAztecWallet = vi.mocked(useAztecWallet);
const mockExecuteBatchInteractions = vi.mocked(executeBatchInteractions);

const mockWallet = {
  wmExecuteTx: vi.fn(),
  wmSimulateTx: vi.fn(),
  proveTx: vi.fn(),
  sendTx: vi.fn(),
  simulateTx: vi.fn(),
  deployContract: vi.fn(),
  getTxReceipt: vi.fn(),
  registerContractClass: vi.fn(),
  getAddress: vi.fn(),
  getCompleteAddress: vi.fn(),
  createAuthWit: vi.fn(),
  getBlockNumber: vi.fn(),
};

// Mock transaction types
interface MockContractFunctionInteraction {
  id: string;
  method: string;
  args: unknown[];
  request: () => Promise<unknown>;
  simulate: () => Promise<unknown>;
  send: () => Promise<{
    txHash: { toString(): string };
    wait: () => Promise<unknown>;
  }>;
}

interface MockTxReceipt {
  txHash: string;
  status: string;
  error?: string;
}

// Helper to create mock interactions with send method
function createMockInteraction(
  id: string,
  method: string,
  args: unknown[],
  txHash = '0xmockhash',
  receipt: MockTxReceipt = { txHash, status: 'success' }
): MockContractFunctionInteraction {
  return {
    id,
    method,
    args,
    request: vi.fn().mockResolvedValue({ type: 'tx-request' }),
    simulate: vi.fn(),
    send: vi.fn().mockResolvedValue({
      txHash: { toString: () => txHash },
      wait: vi.fn().mockResolvedValue(receipt),
    }),
  };
}

// Helper to mock executeBatchInteractions with callback simulation
function mockBatchSuccess(receipts: MockTxReceipt[], hashes?: string[]) {
  mockExecuteBatchInteractions.mockImplementationOnce(async (_wallet, interactions, options) => {
    for (let index = 0; index < interactions.length; index++) {
      options?.callbacks?.onSending?.(index);
      const hash = hashes?.[index] || receipts[index]?.txHash || `0x${index}hash`;
      options?.callbacks?.onSent?.(index, hash);
      options?.callbacks?.onSuccess?.(index, {
        hash,
        receipt: receipts[index] || { txHash: hash, status: 'success' },
        status: 'success'
      });
    }
    return { receipts, errors: [] };
  });
}

// Helper to mock executeBatchInteractions with partial failures
function mockBatchPartialFailure(
  receipts: MockTxReceipt[],
  errors: Array<{ index: number; error: Error }>,
  hashes?: string[]
) {
  mockExecuteBatchInteractions.mockImplementationOnce(async (_wallet, interactions, options) => {
    const errorIndices = new Set(errors.map(e => e.index));
    for (let index = 0; index < interactions.length; index++) {
      if (errorIndices.has(index)) {
        const error = errors.find(e => e.index === index)?.error;
        options?.callbacks?.onSending?.(index);
        options?.callbacks?.onError?.(index, error || new Error('Mock error'));
      } else {
        options?.callbacks?.onSending?.(index);
        const hash = hashes?.[index] || receipts[index]?.txHash || `0x${index}hash`;
        options?.callbacks?.onSent?.(index, hash);
        options?.callbacks?.onSuccess?.(index, {
          hash,
          receipt: receipts[index] || { txHash: hash, status: 'success' },
          status: 'success'
        });
      }
    }
    return { receipts, errors };
  });
}

// Helper to create failing mock interaction
describe('useAztecBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteBatchInteractions.mockReset();
    // Reset mock wallet state
    mockWallet.proveTx.mockClear();
    mockWallet.sendTx.mockClear();
    mockWallet.wmExecuteTx.mockClear();
    mockWallet.wmSimulateTx.mockClear();
    mockWallet.simulateTx.mockClear();
    // Set up default mock return value for each test
    mockUseAztecWallet.mockReturnValue({
      aztecWallet: mockWallet,
      isAvailable: true,
      isConnected: true,
      isReady: true,
      isLoading: false,
      address: '0x123',
      addressAztec: null,
      addressString: '0x123',
      chain: null,
      chainId: null,
      wallet: null,
      walletId: 'test-wallet',
      error: null,
      status: 'ready' as const,
      isAztecChain: true,
      // Account management fields (consolidated from useAztecAccounts)
      accounts: [],
      activeAccount: null,
      switchAccount: vi.fn().mockResolvedValue(undefined),
      signMessage: vi.fn().mockResolvedValue('mock-signature'),
      refreshAccounts: vi.fn().mockResolvedValue(undefined),
      isLoadingAccounts: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Don't use resetAllMocks as it removes mock implementations
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useAztecBatch());

    expect(result.current.transactionStatuses).toEqual([]);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.totalTransactions).toBe(0);
    expect(result.current.completedTransactions).toBe(0);
    expect(result.current.failedTransactions).toBe(0);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.executeBatch).toBe('function');
    expect(typeof result.current.clearStatuses).toBe('function');
  });

  it('should throw error when no wallet is connected', async () => {
    mockUseAztecWallet.mockReturnValue({
      aztecWallet: null,
      isAvailable: false,
      isConnected: false,
      isReady: false,
      isLoading: false,
      address: null,
      addressAztec: null,
      addressString: null,
      chain: null,
      chainId: null,
      wallet: null,
      walletId: null,
      error: null,
      status: 'disconnected' as const,
      isAztecChain: false,
      // Account management fields
      accounts: [],
      activeAccount: null,
      switchAccount: vi.fn().mockResolvedValue(undefined),
      signMessage: vi.fn().mockResolvedValue('mock-signature'),
      refreshAccounts: vi.fn().mockResolvedValue(undefined),
      isLoadingAccounts: false,
    });

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('No Aztec wallet connected');
    });
  });

  it('should throw error when no interactions provided', async () => {
    const { result } = renderHook(() => useAztecBatch());

    await act(async () => {
      await expect(result.current.executeBatch([])).rejects.toThrow('No interactions provided');
    });

    await act(async () => {
      await expect(
        result.current.executeBatch(null as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('No interactions provided');
    });
  });

  it('should execute single transaction successfully', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    mockBatchSuccess([mockReceipt], ['0xabcd1234']);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
    ];

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toEqual(mockReceipt);
    expect(result.current.totalTransactions).toBe(1);
    expect(result.current.completedTransactions).toBe(1);
    expect(result.current.failedTransactions).toBe(0);
    expect(result.current.progress).toBe(100);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeNull();

    // Check final transaction status
    expect(result.current.transactionStatuses).toHaveLength(1);
    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'success',
      hash: '0xabcd1234',
      receipt: mockReceipt,
    });
    expect(mockExecuteBatchInteractions).toHaveBeenCalledTimes(1);
  });

  it('should forward send options to executeTx', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xfeedface',
      status: 'success',
    };

    mockBatchSuccess([mockReceipt], ['0xfeedface']);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx-options', 'transfer', ['0x123', 100], mockReceipt.txHash, mockReceipt),
    ];

    const options = { txNonce: 42 } as const;

    await act(async () => {
      await result.current.executeBatch(
        interactions as unknown as ContractFunctionInteraction[],
        { ...options },
      );
    });

    expect(mockExecuteBatchInteractions).toHaveBeenCalledWith(
      mockWallet,
      interactions as unknown as ContractFunctionInteraction[],
      expect.objectContaining({
        sendOptions: expect.objectContaining(options),
      }),
    );
  });

  it('should execute multiple transactions successfully', async () => {
    const mockReceipts: MockTxReceipt[] = [
      { txHash: '0xabcd1234', status: 'success' },
      { txHash: '0xefgh5678', status: 'success' },
      { txHash: '0xijkl9012', status: 'success' },
    ];

    mockBatchSuccess(mockReceipts);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipts[0]),
      createMockInteraction('tx2', 'transfer', ['0x456', 200], '0xefgh5678', mockReceipts[1]),
      createMockInteraction('tx3', 'approve', ['0x789', 300], '0xijkl9012', mockReceipts[2]),
    ];

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    expect(receipts).toHaveLength(3);
    expect(receipts).toEqual(mockReceipts);
    expect(result.current.totalTransactions).toBe(3);
    expect(result.current.completedTransactions).toBe(3);
    expect(result.current.failedTransactions).toBe(0);
    expect(result.current.progress).toBe(100);
    expect(result.current.isExecuting).toBe(false);

    // Check all transaction statuses
    expect(result.current.transactionStatuses).toHaveLength(3);
    result.current.transactionStatuses.forEach((status, index) => {
      expect(status).toMatchObject({
        index,
        status: 'success',
        hash: mockReceipts[index]?.txHash,
        receipt: mockReceipts[index],
      });
    });
    expect(mockExecuteBatchInteractions).toHaveBeenCalledTimes(1);
  });

  it('should handle single transaction failure', async () => {
    const error = new Error('Transaction failed');

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    // Simulate batch execution where all transactions fail
    mockBatchPartialFailure([], [{ index: 0, error }]);

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('All 1 transactions failed');
    });

    expect(result.current.totalTransactions).toBe(1);
    expect(result.current.completedTransactions).toBe(1);
    expect(result.current.failedTransactions).toBe(1);
    expect(result.current.progress).toBe(100);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toMatchObject({
      message: expect.stringContaining('All 1 transactions failed'),
    });

    // Check transaction status
    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'error',
      error,
    });
    expect(mockExecuteBatchInteractions).toHaveBeenCalledTimes(1);
  });

  it('should handle partial batch failure', async () => {
    const mockReceipt1: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    const mockReceipt3: MockTxReceipt = {
      txHash: '0xijkl9012',
      status: 'success',
    };

    const error = new Error('Second transaction failed');

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt1),
      createMockInteraction('tx2', 'transfer', ['0x456', 200]),
      createMockInteraction('tx3', 'approve', ['0x789', 300], '0xijkl9012', mockReceipt3),
    ];

    mockBatchPartialFailure([mockReceipt1, mockReceipt3], [{ index: 1, error }]);

    // Mock console.warn to verify it's called
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should return receipts for successful transactions
    expect(receipts).toHaveLength(2);
    expect(receipts).toEqual([mockReceipt1, mockReceipt3]);
    expect(result.current.totalTransactions).toBe(3);
    expect(result.current.completedTransactions).toBe(3);
    expect(result.current.failedTransactions).toBe(1);
    expect(result.current.progress).toBe(100);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeNull(); // No overall error for partial failure

    // Check console warning was called
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Batch execution partially failed. Failed transactions: 2'),
    );

    // Check transaction statuses
    expect(result.current.transactionStatuses[0]?.status).toBe('success');
    expect(result.current.transactionStatuses[1]?.status).toBe('error');
    expect(result.current.transactionStatuses[2]?.status).toBe('success');

    expect(mockExecuteBatchInteractions).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it('should track transaction status progression correctly', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    mockBatchSuccess([mockReceipt], ['0xabcd1234']);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Final status should be success with hash from 'hash' field
    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'success',
      hash: '0xabcd1234',
      receipt: mockReceipt,
    });
  });

  it('should handle transaction hash extraction from different fields', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    mockBatchSuccess([mockReceipt], ['0xabcd1234']);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'success',
      hash: '0xabcd1234',
      receipt: mockReceipt,
    });
  });

  it('should handle non-Error exceptions', async () => {
    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    mockExecuteBatchInteractions.mockRejectedValueOnce('String error' as unknown as Error);

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('Batch execution failed');
    });

    // Should convert non-Error to Error object
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Batch execution failed');
  });

  it('should handle array validation properly', async () => {
    const { result } = renderHook(() => useAztecBatch());

    // Test with empty array
    await act(async () => {
      await expect(result.current.executeBatch([])).rejects.toThrow('No interactions provided');
    });

    // Test with null
    await act(async () => {
      await expect(
        result.current.executeBatch(null as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('No interactions provided');
    });

    expect(result.current.isExecuting).toBe(false);
  });

  it('should clearStatuses correctly', async () => {
    // First execute a batch to have statuses
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    mockBatchSuccess([mockReceipt], ['0xabcd1234']);

    mockWallet.proveTx.mockResolvedValue({ provenTxData: 'proven' });
    mockWallet.sendTx.mockResolvedValue('0xabcd1234');
    mockWallet.getTxReceipt.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Verify we have statuses
    expect(result.current.transactionStatuses).toHaveLength(1);
    expect(result.current.totalTransactions).toBe(1);

    // Clear statuses
    act(() => {
      result.current.clearStatuses();
    });

    // Verify statuses are cleared
    expect(result.current.transactionStatuses).toEqual([]);
    expect(result.current.totalTransactions).toBe(0);
    expect(result.current.completedTransactions).toBe(0);
    expect(result.current.failedTransactions).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should calculate progress correctly during execution', async () => {
    const mockReceipts: MockTxReceipt[] = [
      { txHash: '0xabcd1234', status: 'success' },
      { txHash: '0xefgh5678', status: 'success' },
      { txHash: '0xijkl9012', status: 'success' },
    ];

    const mockTxHashes = mockReceipts.map((r) => r.txHash);

    mockBatchSuccess(mockReceipts, mockTxHashes);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], mockTxHashes[0], mockReceipts[0]),
      createMockInteraction('tx2', 'transfer', ['0x456', 200], mockTxHashes[1], mockReceipts[1]),
      createMockInteraction('tx3', 'approve', ['0x789', 300], mockTxHashes[2], mockReceipts[2]),
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Final progress should be 100%
    expect(result.current.progress).toBe(100);
    expect(result.current.completedTransactions).toBe(3);
    expect(mockExecuteBatchInteractions).toHaveBeenCalledTimes(1);
  });

  it('should handle unexpected errors during batch execution', async () => {
    const { result } = renderHook(() => useAztecBatch());

    // Verify initial state is correct
    expect(result.current).not.toBeNull();
    expect(typeof result.current.executeBatch).toBe('function');

    const error = new Error('Unexpected batch error');
    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    mockExecuteBatchInteractions.mockRejectedValueOnce(error);

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('Unexpected batch error');
    });

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Unexpected batch error');
  });
});
