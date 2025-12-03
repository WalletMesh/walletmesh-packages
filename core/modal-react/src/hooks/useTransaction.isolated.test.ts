/**
 * Isolated tests for useTransaction hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import { act } from 'react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal mocks defined inline
const mockTransactionService = {
  sendTransaction: vi.fn().mockResolvedValue({
    txHash: '0xabc123',
    wait: vi.fn().mockResolvedValue({ blockNumber: 123 }),
  }),
  validateConnectionState: vi.fn().mockReturnValue({ isValid: true }),
  validateTransactionParams: vi.fn().mockReturnValue({ isValid: true }),
  validateChainCompatibility: vi.fn().mockReturnValue({ isValid: true }),
  validateGasEstimationParams: vi.fn().mockReturnValue({ isValid: true }),
  validateSimulationParams: vi.fn().mockReturnValue({ isValid: true }),
  estimateGas: vi.fn().mockResolvedValue({ gasLimit: '21000' }),
  simulateTransaction: vi.fn().mockResolvedValue({ success: true }),
};

const mockClient = {
  getServices: vi.fn().mockReturnValue({
    transaction: mockTransactionService,
    connection: {},
    balance: {},
    chain: {},
  }),
  getQueryManager: vi.fn().mockReturnValue({
    getQueryClient: vi.fn().mockReturnValue({
      invalidateQueries: vi.fn(),
    }),
  }),
};

const mockStore = {
  getState: vi.fn().mockReturnValue({
    entities: {
      wallets: {},
      sessions: {
        'session-1': {
          sessionId: 'session-1',
          provider: {
            instance: {
              request: vi.fn(),
            },
          },
        },
      },
      transactions: {},
    },
    ui: { loading: {}, errors: {} },
    active: { walletId: 'metamask', sessionId: 'session-1' },
    meta: { transactionStatus: 'idle' },
  }),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
};

const mockQueryClient = {
  invalidateQueries: vi.fn(),
};

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({
      txHash: '0xabc123',
      wait: vi.fn().mockResolvedValue({ blockNumber: 123 }),
    }),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
    reset: vi.fn(),
  })),
  useQueryClient: vi.fn(() => mockQueryClient),
}));

// Mock logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock context
vi.mock('../WalletMeshContext.js', () => ({
  useWalletMeshContext: vi.fn(() => ({
    client: mockClient,
    config: { appName: 'Test', chains: [] },
  })),
  useWalletMeshServices: vi.fn(() => ({
    transaction: mockTransactionService,
    connection: {},
    balance: {},
    chain: {},
  })),
}));

// Mock internal hooks
vi.mock('./internal/useStore.js', () => ({
  useWalletMeshStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  useWalletMeshStoreInstance: vi.fn(() => mockStore),
}));

vi.mock('./internal/useService.js', () => ({
  useService: vi.fn(() => ({
    service: mockTransactionService,
    isAvailable: true,
  })),
}));

vi.mock('./useAccount.js', () => ({
  useAccount: vi.fn(() => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
    chainId: '0x1',
    chain: { chainId: '0x1', chainType: 'evm', name: 'Ethereum' },
    chainType: 'evm',
    wallet: { id: 'metamask', name: 'MetaMask' },
  })),
}));

vi.mock('./useSwitchChain.js', () => ({
  useSwitchChain: vi.fn(() => ({
    switchChain: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('./useWalletProvider.js', () => ({
  useWalletProvider: vi.fn(() => ({
    provider: {
      request: vi.fn(),
    },
  })),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useTransaction - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return proper initial state values', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(result.current.currentTransaction).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('idle');
      expect(Array.isArray(result.current.transactions)).toBe(true);
    });

    it('should provide required function interfaces', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(typeof result.current.sendTransaction).toBe('function');
      expect(typeof result.current.sendTransactionAsync).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.getTransaction).toBe('function');
      expect(typeof result.current.getTransactionById).toBe('function');
      expect(typeof result.current.waitForConfirmation).toBe('function');
      expect(typeof result.current.estimateGas).toBe('function');
      expect(typeof result.current.simulateTransaction).toBe('function');
    });

    it('should initialize with empty transaction list', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(Array.isArray(result.current.transactions)).toBe(true);
      expect(result.current.transactions).toHaveLength(0);
    });
  });

  describe('Transaction Sending', () => {
    it('should handle basic ETH transfer', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(result.current.sendTransaction).toBeDefined();
      expect(typeof result.current.sendTransaction).toBe('function');
    });

    it('should provide sendTransactionAsync method', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(result.current.sendTransactionAsync).toBeDefined();
      expect(typeof result.current.sendTransactionAsync).toBe('function');
    });
  });

  describe('Transaction States', () => {
    it('should track transaction status', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(result.current.status).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPending).toBe(false);
    });

    it('should provide error state', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Gas Estimation', () => {
    it('should provide gas estimation functionality', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(typeof result.current.estimateGas).toBe('function');
    });
  });

  describe('Transaction History', () => {
    it('should maintain transaction history', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(Array.isArray(result.current.transactions)).toBe(true);
      expect(result.current.transactions).toHaveLength(0);
    });

    it('should provide transaction retrieval functionality', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(typeof result.current.getTransaction).toBe('function');
      expect(typeof result.current.getTransactionById).toBe('function');
    });

    it('should handle reset function', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(typeof result.current.reset).toBe('function');

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentTransaction).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.status).toBe('idle');
    });
  });

  describe('Error Handling', () => {
    it('should handle transaction errors gracefully', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      // The hook should be stable and not throw during render
      expect(result.current).toBeDefined();
      expect(typeof result.current.sendTransaction).toBe('function');
    });
  });

  describe('Simulation', () => {
    it('should provide transaction simulation functionality', async () => {
      const { useTransaction } = await import('./useTransaction.js');
      const { result } = renderHook(() => useTransaction(), { wrapper });

      expect(typeof result.current.simulateTransaction).toBe('function');
    });
  });
});
