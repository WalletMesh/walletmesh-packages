import { act, renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import type { WalletCapabilities, WalletFeature } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useWalletCapabilities } from './useWalletCapabilities.js';

// Define WalletTransport interface locally
interface WalletTransport {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  request<T = unknown>(request: { method: string; params?: unknown }): Promise<T>;
  getCapabilities(): Promise<unknown>;
  isConnected(): boolean;
  getSessionId(): string | undefined;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
}

// Remove unused ProviderType

// Mock useWalletTransport
const mockTransportState = {
  transport: null as WalletTransport | null,
  isAvailable: false,
};

vi.mock('./useWalletTransport.js', () => ({
  useWalletTransport: () => mockTransportState,
}));

describe('useWalletCapabilities', () => {
  const mockCapabilities: WalletCapabilities = {
    chains: [{ type: ChainType.Evm, chainIds: ['1', '137'] }],
    features: new Set<WalletFeature>(['sign_message', 'sign_typed_data']),
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction', 'eth_signTypedData_v4', 'wallet_switchEthereumChain'],
      events: [],
    },
  };

  const mockTransport: Partial<WalletTransport> = {
    getCapabilities: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockTransportState.transport = null;
    mockTransportState.isAvailable = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return null capabilities when transport is not available', () => {
    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    expect(result.current.capabilities).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
    expect(result.current.supportsMethod('eth_accounts')).toBe(false);
    expect(result.current.supportsChainId('1')).toBe(false);
  });

  it('should load capabilities when transport becomes available', async () => {
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

    const { result, rerender } = renderHook(() => useWalletCapabilities(), {
      wrapper: createTestWrapper().wrapper,
    });

    // Initially no transport
    expect(result.current.capabilities).toBeNull();

    // Transport becomes available
    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
      rerender();

      // Advance timers to allow any async operations to complete
      await vi.advanceTimersByTimeAsync(100);
    });

    // Should start loading and complete
    expect(mockTransport.getCapabilities).toHaveBeenCalled();
    expect(result.current.capabilities).toEqual(mockCapabilities);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors when loading capabilities', async () => {
    const error = new Error('Failed to get capabilities');
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.capabilities).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should check chain type support correctly', async () => {
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(mockCapabilities);
    expect(result.current.supportsChain(ChainType.Evm)).toBe(true);
    expect(result.current.supportsChain(ChainType.Aztec)).toBe(false);
    expect(result.current.supportsChain(ChainType.Solana)).toBe(false);
  });

  it('should check method support correctly', async () => {
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(mockCapabilities);
    expect(result.current.supportsMethod('eth_accounts')).toBe(true);
    expect(result.current.supportsMethod('eth_sendTransaction')).toBe(true);
    expect(result.current.supportsMethod('eth_signTypedData_v4')).toBe(true);
    expect(result.current.supportsMethod('wallet_switchEthereumChain')).toBe(true);
    expect(result.current.supportsMethod('unknown_method')).toBe(false);
  });

  it('should check chain ID support correctly', async () => {
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(mockCapabilities);
    // Should support chains in capabilities
    expect(result.current.supportsChainId('1')).toBe(true);
    expect(result.current.supportsChainId('137')).toBe(true);

    // Should not support unknown chains
    expect(result.current.supportsChainId('42161')).toBe(false);
    expect(result.current.supportsChainId('10')).toBe(false);
  });

  it('should refresh capabilities on demand', async () => {
    const initialCapabilities: WalletCapabilities = {
      ...mockCapabilities,
      permissions: {
        methods: ['eth_accounts'],
        events: [],
      },
    };

    const updatedCapabilities: WalletCapabilities = {
      ...mockCapabilities,
      permissions: {
        methods: ['eth_accounts', 'eth_sendTransaction', 'eth_sign'],
        events: [],
      },
    };

    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(initialCapabilities)
      .mockResolvedValueOnce(updatedCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    // Wait for initial load
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(initialCapabilities);
    expect(result.current.supportsMethod('eth_sendTransaction')).toBe(false);

    // Refresh capabilities
    await act(async () => {
      await result.current.refresh();
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(updatedCapabilities);
    expect(result.current.supportsMethod('eth_sendTransaction')).toBe(true);
    expect(result.current.supportsMethod('eth_sign')).toBe(true);
  });

  it('should clear capabilities when transport disconnects', async () => {
    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result, rerender } = renderHook(() => useWalletCapabilities(), {
      wrapper: createTestWrapper().wrapper,
    });

    // Wait for capabilities to load
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(mockCapabilities);

    // Disconnect transport
    await act(async () => {
      mockTransportState.transport = null;
      mockTransportState.isAvailable = false;
      rerender();
    });

    // Should clear capabilities
    expect(result.current.capabilities).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
  });

  it('should handle loading state correctly', async () => {
    let resolveCapabilities: (value: WalletCapabilities) => void;
    const capabilitiesPromise = new Promise<WalletCapabilities>((resolve) => {
      resolveCapabilities = resolve;
    });

    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockReturnValue(capabilitiesPromise);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    // Should be loading initially - no need to wait
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveCapabilities?.(mockCapabilities);
      await vi.advanceTimersByTimeAsync(100);
    });

    // Should no longer be loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.capabilities).toEqual(mockCapabilities);
  });

  it('should handle empty capabilities gracefully', async () => {
    const emptyCapabilities: WalletCapabilities = {
      chains: [],
      features: new Set<WalletFeature>(),
    };

    (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(emptyCapabilities);

    await act(async () => {
      mockTransportState.transport = mockTransport as WalletTransport;
      mockTransportState.isAvailable = true;
    });

    const { result } = renderHook(() => useWalletCapabilities(), { wrapper: createTestWrapper().wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.capabilities).toEqual(emptyCapabilities);
    expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
    expect(result.current.supportsMethod('eth_accounts')).toBe(false);
    expect(result.current.supportsChainId('1')).toBe(false);
  });
});
