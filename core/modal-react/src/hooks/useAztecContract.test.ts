/**
 * Tests for useAztecContract hook
 */

import type { ContractArtifact } from '@aztec/aztec.js';
import { renderHook } from '@testing-library/react';
import * as lazyModule from '@walletmesh/modal-core/providers/aztec/lazy';
import type { AztecDappWallet } from '@walletmesh/modal-core/providers/aztec/lazy';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../test/utils.js';
import { useAztecContract } from './useAztecContract.js';
import * as aztecWallet from './useAztecWallet.js';
import type { AztecWalletInfo } from './useAztecWallet.js';

// Mock dependencies
vi.mock('./useAztecWallet.js');
vi.mock('@walletmesh/modal-core/providers/aztec/lazy', () => {
  return {
    getContractAt: vi.fn(),
  };
});

// Additional synchronous tests to ensure basic functionality
describe('useAztecContract - Synchronous behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for useAztecWallet
    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
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
    } as AztecWalletInfo);
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useAztecContract(null, null), {
      wrapper: createWrapper(),
    });

    expect(result.current.contract).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should start loading when address and artifact are provided', () => {
    const mockWallet = {
      wmExecuteTx: vi.fn(),
      wmSimulateTx: vi.fn(),
      getAddress: vi.fn(),
    };

    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
      aztecWallet: mockWallet as unknown as AztecDappWallet,
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
    } as AztecWalletInfo);

    const mockArtifact = {
      name: 'TestContract',
      functions: [],
    } as unknown as ContractArtifact;

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Should start loading immediately
    expect(result.current.isLoading).toBe(true);
    expect(result.current.contract).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should not load when wallet is not available', () => {
    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
      aztecWallet: null,
      isAvailable: false,
      isConnected: true,
      isReady: false,
      isLoading: false,
      address: '0x123',
      chain: null,
      chainId: null,
      wallet: null,
      walletId: null,
      error: null,
      status: 'connected' as const,
      isAztecChain: true,
    } as AztecWalletInfo);

    const mockArtifact = {
      name: 'TestContract',
      functions: [],
    } as unknown as ContractArtifact;

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Should not start loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.contract).toBeNull();
    expect(lazyModule.getContractAt).not.toHaveBeenCalled();
  });
});

describe('useAztecContract', () => {
  const mockWallet = {
    wmExecuteTx: vi.fn(),
    wmSimulateTx: vi.fn(),
    getAddress: vi.fn(),
  };

  const mockArtifact = {
    name: 'TestContract',
    functions: [],
    nonDispatchPublicFunctions: [],
    outputs: {
      globals: {},
      structs: {},
    },
    storageLayout: {},
    notes: {},
    fileMap: {},
  } as unknown as ContractArtifact;

  const mockContract = {
    address: '0x123',
    artifact: mockArtifact,
    methods: {
      transfer: vi.fn(),
      balanceOf: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup provider mock
    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
      aztecWallet: mockWallet as unknown as AztecDappWallet,
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
    } as AztecWalletInfo);

    // Setup lazy module mock
    vi.mocked(lazyModule.getContractAt).mockResolvedValue(mockContract);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return null contract when no address provided', () => {
    const { result } = renderHook(() => useAztecContract(null, mockArtifact), {
      wrapper: createWrapper(),
    });

    expect(result.current.contract).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return null contract when no artifact provided', () => {
    const { result } = renderHook(() => useAztecContract('0x123', null), {
      wrapper: createWrapper(),
    });

    expect(result.current.contract).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load contract when address and artifact provided', async () => {
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      return Promise.resolve(mockContract);
    });

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Let the useEffect run
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.contract).toBe(mockContract);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(lazyModule.getContractAt).toHaveBeenCalledWith(mockWallet, '0x123', mockArtifact);
  });

  it('should handle loading errors', async () => {
    const error = new Error('Failed to load contract');
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      return Promise.reject(error);
    });

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Let the useEffect run and handle the error
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.contract).toBeNull();
  });

  it('should refetch contract', async () => {
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      return Promise.resolve(mockContract);
    });

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(lazyModule.getContractAt).toHaveBeenCalledTimes(1);
    expect(result.current.contract).toBe(mockContract);

    // Clear mock to track new calls
    vi.mocked(lazyModule.getContractAt).mockClear();
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      return Promise.resolve(mockContract);
    });

    // Trigger refetch
    await act(async () => {
      const refetchPromise = result.current.refetch();
      await vi.runAllTimersAsync();
      await refetchPromise;
    });

    expect(lazyModule.getContractAt).toHaveBeenCalledTimes(1);
    expect(result.current.contract).toBe(mockContract);
  });

  it('should not refetch if contract is cached with same address and artifact', async () => {
    // Reset mock to ensure clean state
    vi.mocked(lazyModule.getContractAt).mockClear();
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      return Promise.resolve(mockContract);
    });

    const { rerender, result } = renderHook(({ address, artifact }) => useAztecContract(address, artifact), {
      initialProps: { address: '0x123', artifact: mockArtifact },
      wrapper: createWrapper(),
    });

    // Wait for initial load to complete
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.contract).toBe(mockContract);
    expect(lazyModule.getContractAt).toHaveBeenCalledTimes(1);

    // Clear the mock calls to make it easier to track
    vi.mocked(lazyModule.getContractAt).mockClear();

    // Re-render with same props
    rerender({ address: '0x123', artifact: mockArtifact });

    // Run timers to allow any potential refetch to occur
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not fetch again since address and artifact are the same
    expect(lazyModule.getContractAt).not.toHaveBeenCalled();
    expect(result.current.contract).toBe(mockContract);
  });

  it('should refetch when address changes', async () => {
    const mockContract2 = { ...mockContract, address: '0x456' };
    let callCount = 0;
    vi.mocked(lazyModule.getContractAt).mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount === 1 ? mockContract : mockContract2);
    });

    const { rerender, result } = renderHook(({ address, artifact }) => useAztecContract(address, artifact), {
      initialProps: { address: '0x123', artifact: mockArtifact },
      wrapper: createWrapper(),
    });

    // Wait for initial load to complete
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.contract).toBe(mockContract);
    expect(lazyModule.getContractAt).toHaveBeenCalledTimes(1);
    expect(lazyModule.getContractAt).toHaveBeenCalledWith(mockWallet, '0x123', mockArtifact);

    // Change address
    rerender({ address: '0x456', artifact: mockArtifact });

    // Wait for new contract to be loaded
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.contract).toBe(mockContract2);
    expect(lazyModule.getContractAt).toHaveBeenCalledTimes(2);
    expect(lazyModule.getContractAt).toHaveBeenLastCalledWith(mockWallet, '0x456', mockArtifact);
  });

  it('should handle wallet not available', () => {
    // Clear previous mocks
    vi.clearAllMocks();

    // Mock provider to return no wallet
    vi.mocked(aztecWallet.useAztecWallet).mockReturnValue({
      aztecWallet: null,
      isAvailable: false,
      isConnected: true,
      isReady: false,
      isLoading: false,
      address: '0x123',
      chain: null,
      chainId: null,
      wallet: null,
      walletId: null,
      error: null,
      status: 'connected' as const,
      isAztecChain: true,
    } as AztecWalletInfo);

    const { result } = renderHook(() => useAztecContract('0x123', mockArtifact), {
      wrapper: createWrapper(),
    });

    // Should immediately return null since wallet is not available
    expect(result.current).toBeDefined();
    expect(result.current.contract).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(lazyModule.getContractAt).not.toHaveBeenCalled();
  });
});
