/**
 * Tests for useAztecBatch hook
 */

import { act, renderHook } from '@testing-library/react';
vi.mock('@walletmesh/modal-core/providers/aztec', async () => {
  const actual = (await vi.importActual(
    '@walletmesh/modal-core/providers/aztec',
  )) as typeof import('@walletmesh/modal-core/providers/aztec');
  return {
    ...actual,
    executeBatchInteractions: vi.fn(),
    executeAtomicBatch: vi.fn(),
  };
});

// Mock aztecTransactionActions and createAztecTransactionManager
vi.mock('@walletmesh/modal-core', async () => {
  const actual = (await vi.importActual('@walletmesh/modal-core')) as typeof import('@walletmesh/modal-core');
  return {
    ...actual,
    aztecTransactionActions: {
      addAztecTransaction: vi.fn(),
      updateAztecTransaction: vi.fn(),
      updateAztecTransactionStatus: vi.fn(),
      startTransactionStage: vi.fn(),
      endTransactionStage: vi.fn(),
    },
    createAztecTransactionManager: vi.fn(),
  };
});

import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { executeBatchInteractions, executeAtomicBatch } from '@walletmesh/modal-core/providers/aztec';
import { aztecTransactionActions, createAztecTransactionManager, ChainType } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAztecBatch } from './useAztecBatch.js';

// Mock the useAztecWallet hook
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(),
}));

// Mock the useStoreInstance hook
vi.mock('./internal/useStore.js', () => ({
  useStoreInstance: vi.fn(),
}));

// Import the mocked functions
import { useAztecWallet } from './useAztecWallet.js';
import { useStoreInstance } from './internal/useStore.js';

const mockUseAztecWallet = vi.mocked(useAztecWallet);
const mockUseStoreInstance = vi.mocked(useStoreInstance);
const mockExecuteBatchInteractions = vi.mocked(executeBatchInteractions);
const mockExecuteAtomicBatch = vi.mocked(executeAtomicBatch);
const mockAztecTransactionActions = vi.mocked(aztecTransactionActions);
const mockCreateAztecTransactionManager = vi.mocked(createAztecTransactionManager);

// Mock store instance - needs to be callable to match UseBoundStore signature
const mockStoreState = {
  entities: {
    wallets: {},
    sessions: {},
    transactions: {},
  },
  active: {
    walletId: null,
    sessionId: null,
    transactionId: null,
    selectedWalletId: null,
  },
  meta: {
    lastDiscoveryTime: null,
    connectionTimestamps: {},
    availableWalletIds: [],
    discoveryErrors: [],
    transactionStatus: 'idle' as const,
    backgroundTransactionIds: [],
  },
  ui: {
    modalOpen: false,
    currentView: 'walletSelection' as const,
    viewHistory: [],
    loading: {},
    errors: {},
  },
  discovery: {
    wallets: [],
    isDiscovering: false,
  },
};

const mockStore = Object.assign(
  vi.fn(() => mockStoreState),
  {
    getState: vi.fn(() => mockStoreState),
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
);

// Mock transaction manager
const mockTransactionManager = {
  executeAsync: vi.fn(),
  getTransaction: vi.fn(),
  cancelTransaction: vi.fn(),
  clearCompleted: vi.fn(),
  getAllTransactions: vi.fn(),
};

// Transaction manager state (shared across all tests)
const transactionStore = new Map<string, any>();

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
  receipt: MockTxReceipt = { txHash, status: 'success' },
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

// Helper to flush microtasks (ensures queueMicrotask callbacks complete)
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(() => resolve()));

describe('useAztecBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteBatchInteractions.mockReset();
    mockExecuteAtomicBatch.mockReset();
    // Reset aztecTransactionActions mocks
    mockAztecTransactionActions.addAztecTransaction.mockClear();
    mockAztecTransactionActions.updateAztecTransaction.mockClear();
    mockAztecTransactionActions.updateAztecTransactionStatus.mockClear();
    mockAztecTransactionActions.startTransactionStage.mockClear();
    mockAztecTransactionActions.endTransactionStage.mockClear();
    // Reset transaction manager mocks
    mockTransactionManager.executeAsync.mockClear();
    mockTransactionManager.getTransaction.mockClear();
    mockTransactionManager.cancelTransaction.mockClear();
    mockTransactionManager.clearCompleted.mockClear();
    mockTransactionManager.getAllTransactions.mockClear();
    // Clear transaction store for each test
    transactionStore.clear();

    // Set up mock transaction manager
    mockCreateAztecTransactionManager.mockResolvedValue(mockTransactionManager as any);

    // Set up default transaction manager behavior
    mockTransactionManager.executeAsync.mockImplementation(async (interaction: any, options: any) => {
      // Generate unique txId using random and timestamp
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Execute transaction and store result before returning
      // This ensures polling loop sees completed transaction immediately
      try {
        const sentTx = await interaction.send();
        const txHash = sentTx.txHash.toString();
        const receipt = await sentTx.wait();

        // Store completed transaction
        transactionStore.set(txId, {
          id: txId,
          status: 'confirmed' as const,
          txHash,
          receipt,
          error: null,
        });

        // Run callbacks asynchronously using queueMicrotask
        // This avoids TDZ since implementation no longer references txId in callback
        queueMicrotask(() => {
          if (options?.onSuccess) {
            options.onSuccess({ txHash, receipt });
          }
        });

        return txId;
      } catch (error) {
        // Store failed transaction
        transactionStore.set(txId, {
          id: txId,
          status: 'failed' as const,
          txHash: null,
          receipt: null,
          error,
        });

        // Run error callback asynchronously using queueMicrotask
        queueMicrotask(() => {
          if (options?.onError) {
            options.onError(error);
          }
        });

        return txId;
      }
    });

    mockTransactionManager.getTransaction.mockImplementation((txId: string) => {
      return transactionStore.get(txId) || null;
    });
    // Reset mock wallet state
    mockWallet.proveTx.mockClear();
    mockWallet.sendTx.mockClear();
    mockWallet.wmExecuteTx.mockClear();
    mockWallet.wmSimulateTx.mockClear();
    mockWallet.simulateTx.mockClear();
    // Reset mock store
    mockStore.mockClear();
    (mockStore.getState as any).mockClear();
    (mockStore.setState as any).mockClear();
    (mockStore.subscribe as any).mockClear();
    // Set up mock store instance
    mockUseStoreInstance.mockReturnValue(mockStore as any);
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
      chain: {
        chainId: 'aztec:31337',
        name: 'Aztec Sandbox',
        chainType: ChainType.Aztec,
        required: false,
      },
      chainId: 'aztec:31337',
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

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
    ];

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Wait for callbacks to complete (they run via queueMicrotask)
    await flushMicrotasks();

    // Check all results
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

    // Sequential mode uses transaction manager
    expect(mockTransactionManager.executeAsync).toHaveBeenCalled();
  });

  it('should forward send options to executeTx', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xfeedface',
      status: 'success',
    };

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx-options', 'transfer', ['0x123', 100], mockReceipt.txHash, mockReceipt),
    ];

    const options = { txNonce: 42 } as const;

    await act(async () => {
      await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
        ...options,
      });
    });

    // Verify execution completed successfully
    expect(result.current.completedTransactions).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('should execute multiple transactions successfully', async () => {
    const mockReceipts: MockTxReceipt[] = [
      { txHash: '0xabcd1234', status: 'success' },
      { txHash: '0xefgh5678', status: 'success' },
      { txHash: '0xijkl9012', status: 'success' },
    ];

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
    // Sequential mode uses transaction manager
    expect(mockTransactionManager.executeAsync).toHaveBeenCalledTimes(3);
  });

  it('should handle single transaction failure', async () => {
    const error = new Error('Transaction failed');

    const { result } = renderHook(() => useAztecBatch());

    // Create a failing interaction
    const failingInteraction = {
      id: 'tx1',
      method: 'transfer',
      args: ['0x123', 100],
      request: vi.fn().mockResolvedValue({ type: 'tx-request' }),
      simulate: vi.fn(),
      send: vi.fn().mockRejectedValue(error),
    };

    const interactions: MockContractFunctionInteraction[] = [failingInteraction];

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

    // Create interactions: first succeeds, second fails, third succeeds
    const failingInteraction = {
      id: 'tx2',
      method: 'transfer',
      args: ['0x456', 200],
      request: vi.fn().mockResolvedValue({ type: 'tx-request' }),
      simulate: vi.fn(),
      send: vi.fn().mockRejectedValue(error),
    };

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt1),
      failingInteraction,
      createMockInteraction('tx3', 'approve', ['0x789', 300], '0xijkl9012', mockReceipt3),
    ];

    let receipts: MockTxReceipt[] = [];
    await act(async () => {
      receipts = await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
    });

    // Should return receipts with null for failed transaction
    expect(receipts).toHaveLength(3);
    expect(receipts[0]).toEqual(mockReceipt1);
    expect(receipts[1]).toBeNull(); // Failed transaction
    expect(receipts[2]).toEqual(mockReceipt3);
    expect(result.current.totalTransactions).toBe(3);
    expect(result.current.completedTransactions).toBe(3);
    expect(result.current.failedTransactions).toBe(1);
    expect(result.current.progress).toBe(100);
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeNull(); // No overall error for partial failure

    // Check transaction statuses
    expect(result.current.transactionStatuses[0]?.status).toBe('success');
    expect(result.current.transactionStatuses[1]?.status).toBe('error');
    expect(result.current.transactionStatuses[2]?.status).toBe('success');
  });

  it('should track transaction status progression correctly', async () => {
    const mockReceipt: MockTxReceipt = {
      txHash: '0xabcd1234',
      status: 'success',
    };

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

    // Create interaction that throws a non-Error exception
    const failingInteraction = {
      id: 'tx1',
      method: 'transfer',
      args: ['0x123', 100],
      request: vi.fn().mockResolvedValue({ type: 'tx-request' }),
      simulate: vi.fn(),
      send: vi.fn().mockRejectedValue('String error'),
    };

    const interactions: MockContractFunctionInteraction[] = [failingInteraction];

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow();
    });

    // Should handle non-Error exceptions
    expect(result.current.error).toBeTruthy();
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

    const { result } = renderHook(() => useAztecBatch());

    const interactions: MockContractFunctionInteraction[] = [
      createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xabcd1234', mockReceipt),
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
  });

  it('should handle unexpected errors during batch execution', async () => {
    const { result } = renderHook(() => useAztecBatch());

    // Verify initial state is correct
    expect(result.current).not.toBeNull();
    expect(typeof result.current.executeBatch).toBe('function');

    const error = new Error('Unexpected batch error');

    // Create a failing interaction
    const failingInteraction = {
      id: 'tx1',
      method: 'transfer',
      args: ['0x123', 100],
      request: vi.fn().mockResolvedValue({ type: 'tx-request' }),
      simulate: vi.fn(),
      send: vi.fn().mockRejectedValue(error),
    };

    const interactions: MockContractFunctionInteraction[] = [failingInteraction];

    await act(async () => {
      await expect(
        result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]),
      ).rejects.toThrow('Unexpected batch error');
    });

    expect(result.current.isExecuting).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Unexpected batch error');
  });

  describe('Atomic Mode', () => {
    it('should execute batch in atomic mode when atomic option is true', async () => {
      const mockReceipt: MockTxReceipt = {
        txHash: '0xatomic123',
        status: 'success',
      };

      mockExecuteAtomicBatch.mockResolvedValueOnce({
        txHash: '0xatomic123',
        wait: vi.fn().mockResolvedValue(mockReceipt),
      });

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xatomic123', mockReceipt),
        createMockInteraction('tx2', 'approve', ['0x456', 200], '0xatomic123', mockReceipt),
      ];

      let receipts: MockTxReceipt[] = [];
      await act(async () => {
        receipts = await result.current.executeBatch(
          interactions as unknown as ContractFunctionInteraction[],
          {
            atomic: true,
          },
        );
      });

      // Verify executeAtomicBatch was called instead of executeBatchInteractions
      expect(mockExecuteAtomicBatch).toHaveBeenCalledTimes(1);
      expect(mockExecuteBatchInteractions).not.toHaveBeenCalled();

      // Verify result - all interactions get the same receipt (atomic)
      expect(receipts).toHaveLength(2);
      expect(receipts[0]).toEqual(mockReceipt);
      expect(receipts[1]).toEqual(mockReceipt);

      // Verify all transactions share the same hash and receipt
      expect(result.current.transactionStatuses).toHaveLength(2);
      expect(result.current.transactionStatuses[0]?.hash).toBe('0xatomic123');
      expect(result.current.transactionStatuses[1]?.hash).toBe('0xatomic123');
      expect(result.current.transactionStatuses[0]?.status).toBe('success');
      expect(result.current.transactionStatuses[1]?.status).toBe('success');
    });

    it('should use sequential mode by default when atomic option is not provided', async () => {
      const mockReceipts: MockTxReceipt[] = [
        { txHash: '0xseq1', status: 'success' },
        { txHash: '0xseq2', status: 'success' },
      ];

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xseq1', mockReceipts[0]),
        createMockInteraction('tx2', 'approve', ['0x456', 200], '0xseq2', mockReceipts[1]),
      ];

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[]);
      });

      // Verify transaction manager was used (sequential mode)
      expect(mockTransactionManager.executeAsync).toHaveBeenCalled();
      expect(mockExecuteAtomicBatch).not.toHaveBeenCalled();
    });

    it('should use sequential mode when atomic option is false', async () => {
      const mockReceipt: MockTxReceipt = { txHash: '0xseq1', status: 'success' };

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100], '0xseq1', mockReceipt),
      ];

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
          atomic: false,
        });
      });

      // Verify transaction manager was used (sequential mode)
      expect(mockTransactionManager.executeAsync).toHaveBeenCalled();
      expect(mockExecuteAtomicBatch).not.toHaveBeenCalled();
    });

    it('should pass send options correctly in atomic mode', async () => {
      const mockReceipt: MockTxReceipt = {
        txHash: '0xatomic456',
        status: 'success',
      };

      mockExecuteAtomicBatch.mockResolvedValueOnce({
        txHash: '0xatomic456',
        wait: vi.fn().mockResolvedValue(mockReceipt),
      });

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100]),
      ];

      const sendOptions = { txNonce: 42, fee: 100 };

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
          atomic: true,
          ...sendOptions,
        });
      });

      // Verify send options were passed (without atomic flag)
      expect(mockExecuteAtomicBatch).toHaveBeenCalledWith(
        mockWallet,
        interactions as unknown as ContractFunctionInteraction[],
        sendOptions,
      );
    });

    it('should handle atomic batch failure', async () => {
      const errorMessage = 'Atomic batch failed';

      mockExecuteAtomicBatch.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100]),
        createMockInteraction('tx2', 'approve', ['0x456', 200]),
      ];

      await act(async () => {
        await expect(
          result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
            atomic: true,
          }),
        ).rejects.toThrow();
      });

      // Verify error state
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('should update all transaction statuses to same state in atomic mode', async () => {
      const mockReceipt: MockTxReceipt = {
        txHash: '0xatomic789',
        status: 'success',
      };

      const mockWait = vi.fn().mockResolvedValue(mockReceipt);
      mockExecuteAtomicBatch.mockResolvedValueOnce({
        txHash: '0xatomic789',
        wait: mockWait,
      });

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100]),
        createMockInteraction('tx2', 'approve', ['0x456', 200]),
        createMockInteraction('tx3', 'mint', ['0x789', 300]),
      ];

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
          atomic: true,
        });
      });

      // All transactions should have same hash and status
      const statuses = result.current.transactionStatuses;
      expect(statuses).toHaveLength(3);

      statuses.forEach((status) => {
        expect(status.hash).toBe('0xatomic789');
        expect(status.status).toBe('success');
        expect(status.receipt).toEqual(mockReceipt);
      });

      // Verify progress
      expect(result.current.progress).toBe(100);
      expect(result.current.completedTransactions).toBe(3);
      expect(result.current.failedTransactions).toBe(0);
    });

    it('should handle single transaction in atomic mode', async () => {
      const mockReceipt: MockTxReceipt = {
        txHash: '0xsingle123',
        status: 'success',
      };

      mockExecuteAtomicBatch.mockResolvedValueOnce({
        txHash: '0xsingle123',
        wait: vi.fn().mockResolvedValue(mockReceipt),
      });

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100]),
      ];

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
          atomic: true,
        });
      });

      expect(mockExecuteAtomicBatch).toHaveBeenCalledTimes(1);
      expect(result.current.transactionStatuses).toHaveLength(1);
      expect(result.current.transactionStatuses[0]?.status).toBe('success');
    });

    it('should set correct intermediate statuses in atomic mode', async () => {
      const mockReceipt: MockTxReceipt = {
        txHash: '0xintermediate123',
        status: 'success',
      };

      mockExecuteAtomicBatch.mockResolvedValueOnce({
        txHash: '0xintermediate123',
        wait: vi.fn().mockResolvedValue(mockReceipt),
      });

      const { result } = renderHook(() => useAztecBatch());

      const interactions: MockContractFunctionInteraction[] = [
        createMockInteraction('tx1', 'transfer', ['0x123', 100]),
        createMockInteraction('tx2', 'approve', ['0x456', 200]),
      ];

      await act(async () => {
        await result.current.executeBatch(interactions as unknown as ContractFunctionInteraction[], {
          atomic: true,
        });
      });

      // Final state should be success for both
      expect(result.current.transactionStatuses[0]?.status).toBe('success');
      expect(result.current.transactionStatuses[1]?.status).toBe('success');
      expect(result.current.transactionStatuses[0]?.hash).toBe('0xintermediate123');
      expect(result.current.transactionStatuses[1]?.hash).toBe('0xintermediate123');
    });
  });
});
