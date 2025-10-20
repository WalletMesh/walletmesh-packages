/**
 * Isolated tests for useWalletCapabilities hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { act, renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import type { WalletCapabilities, WalletFeature } from '@walletmesh/modal-core';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

// Mock transport state
const mockTransportState = {
  transport: null as WalletTransport | null,
  isAvailable: false,
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

// Mock useWalletTransport
vi.mock('./useWalletTransport.js', () => ({
  useWalletTransport: () => mockTransportState,
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useWalletCapabilities - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

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
    wrapper = createWrapper();
    mockTransportState.transport = null;
    mockTransportState.isAvailable = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return null capabilities when transport is not available', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(result.current.capabilities).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
      expect(result.current.supportsMethod('eth_accounts')).toBe(false);
      expect(result.current.supportsChainId('1')).toBe(false);
    });

    it('should provide required function interfaces', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(typeof result.current.supportsChain).toBe('function');
      expect(typeof result.current.supportsMethod).toBe('function');
      expect(typeof result.current.supportsChainId).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('State Properties', () => {
    it('should expose capabilities state', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(result.current).toHaveProperty('capabilities');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should have correct initial types', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.capabilities === null || typeof result.current.capabilities === 'object').toBe(true);
      expect(result.current.error === null || result.current.error instanceof Error).toBe(true);
    });
  });

  describe('Capability Checking', () => {
    it('should check chain type support correctly', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');

      (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

      const { result, rerender } = renderHook(() => useWalletCapabilities(), { wrapper });

      // Make transport available and trigger effect
      await act(async () => {
        mockTransportState.transport = mockTransport as WalletTransport;
        mockTransportState.isAvailable = true;
        rerender();
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.supportsChain(ChainType.Evm)).toBe(true);
      expect(result.current.supportsChain(ChainType.Aztec)).toBe(false);
      expect(result.current.supportsChain(ChainType.Solana)).toBe(false);
    });

    it('should check method support correctly', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');

      (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

      const { result, rerender } = renderHook(() => useWalletCapabilities(), { wrapper });

      // Make transport available and trigger effect
      await act(async () => {
        mockTransportState.transport = mockTransport as WalletTransport;
        mockTransportState.isAvailable = true;
        rerender();
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.supportsMethod('eth_accounts')).toBe(true);
      expect(result.current.supportsMethod('eth_sendTransaction')).toBe(true);
      expect(result.current.supportsMethod('eth_signTypedData_v4')).toBe(true);
      expect(result.current.supportsMethod('wallet_switchEthereumChain')).toBe(true);
      expect(result.current.supportsMethod('unknown_method')).toBe(false);
    });

    it('should check chain ID support correctly', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');

      (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockCapabilities);

      const { result, rerender } = renderHook(() => useWalletCapabilities(), { wrapper });

      // Make transport available and trigger effect
      await act(async () => {
        mockTransportState.transport = mockTransport as WalletTransport;
        mockTransportState.isAvailable = true;
        rerender();
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should support chains in capabilities
      expect(result.current.supportsChainId('1')).toBe(true);
      expect(result.current.supportsChainId('137')).toBe(true);

      // Should not support unknown chains
      expect(result.current.supportsChainId('42161')).toBe(false);
      expect(result.current.supportsChainId('10')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when loading capabilities', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');

      const error = new Error('Failed to get capabilities');
      (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result, rerender } = renderHook(() => useWalletCapabilities(), { wrapper });

      // Make transport available and trigger effect
      await act(async () => {
        mockTransportState.transport = mockTransport as WalletTransport;
        mockTransportState.isAvailable = true;
        rerender();
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.capabilities).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle empty capabilities gracefully', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');

      const emptyCapabilities: WalletCapabilities = {
        chains: [],
        features: new Set<WalletFeature>(),
      };

      (mockTransport.getCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(emptyCapabilities);

      const { result, rerender } = renderHook(() => useWalletCapabilities(), { wrapper });

      // Make transport available and trigger effect
      await act(async () => {
        mockTransportState.transport = mockTransport as WalletTransport;
        mockTransportState.isAvailable = true;
        rerender();
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.capabilities).toEqual(emptyCapabilities);
      expect(result.current.supportsChain(ChainType.Evm)).toBe(false);
      expect(result.current.supportsMethod('eth_accounts')).toBe(false);
      expect(result.current.supportsChainId('1')).toBe(false);
    });
  });

  describe('Refresh Functionality', () => {
    it('should provide refresh function', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('Loading State', () => {
    it('should track loading state', async () => {
      const { useWalletCapabilities } = await import('./useWalletCapabilities.js');
      const { result } = renderHook(() => useWalletCapabilities(), { wrapper });

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.isLoading).toBe(false);
    });
  });
});
