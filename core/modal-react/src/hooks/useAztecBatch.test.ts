/**
 * Tests for useAztecBatch hook
 */

import { act, renderHook } from '@testing-library/react';
vi.mock('@walletmesh/modal-core/providers/aztec/lazy', async () => {
  const actual = await vi.importActual<typeof import('@walletmesh/modal-core/providers/aztec/lazy')>(
    '@walletmesh/modal-core/providers/aztec/lazy',
  );
  return {
    ...actual,
    executeTx: vi.fn(),
  };
});

import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { executeTx as executeTxLazy } from '@walletmesh/modal-core/providers/aztec/lazy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAztecBatch } from './useAztecBatch.js';

// Mock the useAztecWallet hook
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(),
}));

// Import the mocked function
import { useAztecWallet } from './useAztecWallet.js';

const mockUseAztecWallet = vi.mocked(useAztecWallet);
const mockExecuteTx = vi.mocked(executeTxLazy);

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

// Helper to create failing mock interaction
describe('useAztecBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteTx.mockReset();
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

    const sentTx = {
      txHash: mockReceipt.txHash,
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };
    mockExecuteTx.mockResolvedValueOnce(sentTx);

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
    expect(mockExecuteTx).toHaveBeenCalledTimes(1);
  });

  it('should forward send options to executeTx', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xfeedface',
      status: 'success',
    };

    mockExecuteTx.mockResolvedValueOnce({
      txHash: mockReceipt.txHash,
      wait: vi.fn().mockResolvedValue(mockReceipt),
    });

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

    expect(mockExecuteTx).toHaveBeenCalledWith(
      mockWallet,
      interactions[0] as unknown as ContractFunctionInteraction,
      expect.objectContaining(options),
    );
  });

  it('should execute multiple transactions successfully', async () => {
    const mockReceipts: MockTxReceipt[] = [
      { txHash: '0xabcd1234', status: 'success' },
      { txHash: '0xefgh5678', status: 'success' },
      { txHash: '0xijkl9012', status: 'success' },
    ];

    mockExecuteTx
      .mockResolvedValueOnce({
        txHash: mockReceipts[0]!.txHash,
        wait: vi.fn().mockResolvedValue(mockReceipts[0]),
      })
      .mockResolvedValueOnce({
        txHash: mockReceipts[1]!.txHash,
        wait: vi.fn().mockResolvedValue(mockReceipts[1]),
      })
      .mockResolvedValueOnce({
        txHash: mockReceipts[2]!.txHash,
        wait: vi.fn().mockResolvedValue(mockReceipts[2]),
      });

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
    expect(mockExecuteTx).toHaveBeenCalledTimes(3);
  });

  it('should handle single transaction failure', async () => {
    const error = new Error('Transaction failed');

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    mockExecuteTx.mockRejectedValueOnce(error);

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
    expect(mockExecuteTx).toHaveBeenCalledTimes(1);
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

    mockExecuteTx
      .mockResolvedValueOnce({
        txHash: mockReceipt1.txHash,
        wait: vi.fn().mockResolvedValue(mockReceipt1),
      })
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        txHash: mockReceipt3.txHash,
        wait: vi.fn().mockResolvedValue(mockReceipt3),
      });

    // Mock console.warn to verify it's called
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should return receipts for successful transactions
    expect(receipts).toHaveLength(2);
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

    expect(mockExecuteTx).toHaveBeenCalledTimes(3);

    consoleSpy.mockRestore();
  });

  it('should track transaction status progression correctly', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    mockExecuteTx.mockResolvedValueOnce({
      txHash: mockReceipt.txHash,
      wait: vi.fn().mockResolvedValue(mockReceipt),
    });

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

    mockExecuteTx.mockResolvedValueOnce({
      txHash: mockReceipt.txHash,
      wait: vi.fn().mockResolvedValue(mockReceipt),
    });

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should succeed with hash from sendTx
    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'success',
      hash: '0xabcd1234', // Hash comes from sendTx return value
      receipt: mockReceipt,
    });
  });

  it('should handle non-Error exceptions', async () => {
    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100]),
    ];

    mockExecuteTx.mockRejectedValueOnce('String error' as unknown as Error);

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('All 1 transactions failed');
    });

    // Should convert string error to Error object
    expect(result.current.transactionStatuses[0]?.error).toBeInstanceOf(Error);
    expect(result.current.transactionStatuses[0]?.error?.message).toBe('Transaction failed');
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

    mockExecuteTx.mockResolvedValueOnce({
      txHash: mockReceipt.txHash,
      wait: vi.fn().mockResolvedValue(mockReceipt),
    });

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

    mockExecuteTx
      .mockResolvedValueOnce({
        txHash: mockTxHashes[0]!,
        wait: vi.fn().mockResolvedValue(mockReceipts[0]),
      })
      .mockResolvedValueOnce({
        txHash: mockTxHashes[1]!,
        wait: vi.fn().mockResolvedValue(mockReceipts[1]),
      })
      .mockResolvedValueOnce({
        txHash: mockTxHashes[2]!,
        wait: vi.fn().mockResolvedValue(mockReceipts[2]),
      });

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
    expect(mockExecuteTx).toHaveBeenCalledTimes(3);
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

    mockExecuteTx.mockRejectedValueOnce(error);

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('All 1 transactions failed');
    });

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});
