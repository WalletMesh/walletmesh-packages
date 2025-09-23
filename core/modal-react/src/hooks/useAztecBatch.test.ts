/**
 * Tests for useAztecBatch hook
 */

import { act, renderHook } from '@testing-library/react';
import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAztecBatch } from './useAztecBatch.js';

// Mock the useAztecWallet hook
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(),
}));

// Import the mocked function
import { useAztecWallet } from './useAztecWallet.js';

const mockUseAztecWallet = vi.mocked(useAztecWallet);

const mockWallet = {
  wmExecuteTx: vi.fn(),
  deployContract: vi.fn(),
  wmSimulateTx: vi.fn(),
  getTxReceipt: vi.fn(),
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
}

interface MockSentTx {
  txHash?: string;
  hash?: string;
  wait: () => Promise<MockTxReceipt>;
}

interface MockTxReceipt {
  txHash: string;
  status: string;
  error?: string;
}

describe('useAztecBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock wallet state
    mockWallet.wmExecuteTx.mockClear();
    // Set up default mock return value for each test
    mockUseAztecWallet.mockReturnValue({
      aztecWallet: mockWallet,
      isAvailable: true,
      isConnected: true,
      isReady: true,
      isLoading: false,
      address: '0x123',
      chain: null,
      chainId: null,
      wallet: null,
      walletId: 'test-wallet',
      error: null,
      status: 'ready' as const,
      isAztecChain: true,
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
      chain: null,
      chainId: null,
      wallet: null,
      walletId: null,
      error: null,
      status: 'disconnected' as const,
      isAztecChain: false,
    });

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
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

    const mockSentTx: MockSentTx = {
      txHash: '0xabcd1234',
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };

    mockWallet.wmExecuteTx.mockResolvedValue(mockSentTx);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
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
  });

  it('should execute multiple transactions successfully', async () => {
    const mockReceipts: MockTxReceipt[] = [
      { txHash: '0xabcd1234', status: 'success' },
      { txHash: '0xefgh5678', status: 'success' },
      { txHash: '0xijkl9012', status: 'success' },
    ];

    const mockSentTxs: MockSentTx[] = mockReceipts.map((receipt) => ({
      txHash: receipt.txHash,
      wait: vi.fn().mockResolvedValue(receipt),
    }));

    mockWallet.wmExecuteTx
      .mockResolvedValueOnce(mockSentTxs[0])
      .mockResolvedValueOnce(mockSentTxs[1])
      .mockResolvedValueOnce(mockSentTxs[2]);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
      { id: 'tx2', method: 'transfer', args: ['0x456', 200] },
      { id: 'tx3', method: 'approve', args: ['0x789', 300] },
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
  });

  it('should handle single transaction failure', async () => {
    const error = new Error('Transaction failed');
    mockWallet.wmExecuteTx.mockRejectedValue(error);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
    ];

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
  });

  it('should handle partial batch failure', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    const mockSentTx: MockSentTx = {
      txHash: '0xabcd1234',
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };

    const error = new Error('Second transaction failed');

    mockWallet.wmExecuteTx
      .mockResolvedValueOnce(mockSentTx) // First succeeds
      .mockRejectedValueOnce(error) // Second fails
      .mockResolvedValueOnce(mockSentTx); // Third succeeds

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
      { id: 'tx2', method: 'transfer', args: ['0x456', 200] },
      { id: 'tx3', method: 'approve', args: ['0x789', 300] },
    ];

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

    consoleSpy.mockRestore();
  });

  it('should handle wallet disconnection during batch execution', async () => {
    // Mock console.warn to verify it's called
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Setup initial wallet
    const mockSentTx: MockSentTx = {
      txHash: '0xabcd1234',
      wait: vi.fn().mockResolvedValue({
        txHash: '0xabcd1234',
        status: 'success',
      }),
    };

    // First call succeeds, second call wallet is null
    mockWallet.wmExecuteTx.mockResolvedValueOnce(mockSentTx).mockImplementation(() => {
      // Simulate wallet disconnection
      mockUseAztecWallet.mockReturnValue({
        aztecWallet: null,
        isAvailable: false,
        isConnected: false,
        isReady: false,
        isLoading: false,
        address: null,
        chain: null,
        chainId: null,
        wallet: null,
        walletId: null,
        error: null,
        status: 'disconnected' as const,
        isAztecChain: false,
      });
      throw new Error('Wallet disconnected during batch execution');
    });

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
      { id: 'tx2', method: 'transfer', args: ['0x456', 200] },
    ];

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should get receipt for first transaction
    expect(receipts).toHaveLength(1);
    expect(result.current.totalTransactions).toBe(2);
    expect(result.current.completedTransactions).toBe(2);
    expect(result.current.failedTransactions).toBe(1);
    expect(result.current.isExecuting).toBe(false);

    // First should succeed, second should fail
    expect(result.current.transactionStatuses[0]?.status).toBe('success');
    expect(result.current.transactionStatuses[1]?.status).toBe('error');
    expect(result.current.transactionStatuses[1]?.error?.message).toBe(
      'Wallet disconnected during batch execution',
    );

    // Check console warning was called
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Batch execution partially failed. Failed transactions: 2'),
    );

    consoleSpy.mockRestore();
  });

  it('should track transaction status progression correctly', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

    const mockSentTx: MockSentTx = {
      hash: '0xabcd1234', // Test hash field instead of txHash
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };

    mockWallet.wmExecuteTx.mockResolvedValue(mockSentTx);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
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

    // Test with neither txHash nor hash field
    const mockSentTx: MockSentTx = {
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };

    mockWallet.wmExecuteTx.mockResolvedValue(mockSentTx);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should succeed without hash field
    expect(result.current.transactionStatuses[0]).toMatchObject({
      index: 0,
      status: 'success',
      receipt: mockReceipt,
    });
    expect(result.current.transactionStatuses[0]?.hash).toBeUndefined();
  });

  it('should handle non-Error exceptions', async () => {
    mockWallet.wmExecuteTx.mockRejectedValue('String error');

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
    ];

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

    const mockSentTx: MockSentTx = {
      txHash: '0xabcd1234',
      wait: vi.fn().mockResolvedValue(mockReceipt),
    };

    mockWallet.wmExecuteTx.mockResolvedValue(mockSentTx);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
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

    const mockSentTxs: MockSentTx[] = mockReceipts.map((receipt) => ({
      txHash: receipt.txHash,
      wait: vi.fn().mockResolvedValue(receipt),
    }));

    mockWallet.wmExecuteTx
      .mockResolvedValueOnce(mockSentTxs[0])
      .mockResolvedValueOnce(mockSentTxs[1])
      .mockResolvedValueOnce(mockSentTxs[2]);

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
      { id: 'tx2', method: 'transfer', args: ['0x456', 200] },
      { id: 'tx3', method: 'approve', args: ['0x789', 300] },
    ];

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Final progress should be 100%
    expect(result.current.progress).toBe(100);
    expect(result.current.completedTransactions).toBe(3);
  });

  it('should handle unexpected errors during batch execution', async () => {
    const { result } = renderHook(() => useAztecBatch());

    // Verify initial state is correct
    expect(result.current).not.toBeNull();
    expect(typeof result.current.executeBatch).toBe('function');

    // Mock an unexpected error that's not from individual transactions
    mockWallet.wmExecuteTx.mockRejectedValue(new Error('Unexpected batch error'));

    const interactions: MockContractFunctionInteraction[] = [
      { id: 'tx1', method: 'transfer', args: ['0x123', 100] },
    ];

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('All 1 transactions failed');
    });

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});
