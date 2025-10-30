/**
 * Isolated tests for useAztecContract hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockContract = {
  address: '0x123',
  methods: {
    transfer: vi.fn(),
    balanceOf: vi.fn(),
  },
};

const mockWallet = {
  wmExecuteTx: vi.fn(),
  wmSimulateTx: vi.fn(),
  getAddress: vi.fn(),
  registerContractClass: vi.fn().mockResolvedValue(undefined),
};

// Mock logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock useAztecWallet
vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(() => ({
    aztecWallet: mockWallet,
    isAvailable: true,
    isConnected: true,
    isReady: true,
    isLoading: false,
    address: '0x123',
    chain: null,
    chainId: null,
    wallet: null,
    walletId: null,
    error: null,
    status: 'ready' as const,
    isAztecChain: true,
  })),
}));

// Mock lazy module
vi.mock('@walletmesh/modal-core/providers/aztec/lazy', () => ({
  getContractAt: vi.fn().mockResolvedValue(mockContract),
}));

// Mock aztec providers
vi.mock('@walletmesh/modal-core/providers/aztec', () => ({
  ensureContractClassRegistered: vi.fn().mockResolvedValue(undefined),
  normalizeArtifact: vi.fn((artifact: unknown) => artifact),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useAztecContract - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  const mockArtifact = {
    name: 'TestContract',
    functions: [],
    events: [],
    notes: {},
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return null contract when no address provided', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, mockArtifact), { wrapper });

      expect(result.current.contract).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return null contract when no artifact provided', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract('0x123', null), { wrapper });

      expect(result.current.contract).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide required function interfaces', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('State Properties', () => {
    it('should expose contract loading state', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(result.current).toHaveProperty('contract');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should have correct initial types', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.contract === null || typeof result.current.contract === 'object').toBe(true);
      expect(result.current.error === null || result.current.error instanceof Error).toBe(true);
    });
  });

  describe('Loading Behavior', () => {
    it('should not be loading when no address or artifact', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });

    it('should start loading when address and artifact provided', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), { wrapper });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.contract).toBeNull();
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should expose error state', async () => {
      const { useAztecContract } = await import('./useAztecContract.js');
      const { result } = renderHook(() => useAztecContract(null, null), { wrapper });

      expect(result.current.error).toBeNull();
    });
  });
});
