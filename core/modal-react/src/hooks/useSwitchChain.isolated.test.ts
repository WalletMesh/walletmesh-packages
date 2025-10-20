/**
 * Isolated tests for useSwitchChain hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '@walletmesh/modal-core';

const mockChainService = {
  switchChain: vi.fn().mockResolvedValue(undefined),
  getSupportedChains: vi.fn().mockReturnValue([
    { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
  ]),
  isChainSupported: vi.fn().mockReturnValue(true),
  validateChainSwitch: vi.fn().mockReturnValue({ isValid: true }),
};

const mockStore = {
  getState: vi.fn().mockReturnValue({
    entities: {
      wallets: {},
      sessions: {},
      transactions: {},
    },
    ui: { loading: {}, errors: {} },
    active: { walletId: null, sessionId: null },
    meta: {},
  }),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
};

const mockClient = {
  getServices: vi.fn().mockReturnValue({
    chain: mockChainService,
    connection: {},
    transaction: {},
    balance: {},
  }),
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

// Mock context
vi.mock('../WalletMeshContext.js', () => ({
  useWalletMeshContext: vi.fn(() => ({
    client: mockClient,
    config: {
      appName: 'Test',
      chains: [
        { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
      ],
    },
  })),
  useWalletMeshServices: vi.fn(() => ({
    chain: mockChainService,
    connection: {},
    transaction: {},
    balance: {},
  })),
}));

// Mock internal hooks
vi.mock('./internal/useStore.js', () => ({
  useStore: vi.fn((selector) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  useWalletMeshStore: vi.fn((selector) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  useWalletMeshStoreInstance: vi.fn(() => mockStore),
}));

vi.mock('./internal/useService.js', () => ({
  useService: vi.fn(() => ({
    service: mockChainService,
    isAvailable: true,
  })),
}));

vi.mock('./useAccount.js', () => ({
  useAccount: vi.fn(() => ({
    isConnected: false,
    address: null,
    chainId: null,
    chain: null,
    chainType: null,
    wallet: null,
  })),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useSwitchChain - Isolated Tests', () => {
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
    it('should return proper initial state when disconnected', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(result.current.chain).toBeNull();
      expect(result.current.chainType).toBeNull();
      expect(result.current.isSwitching).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide required function interfaces', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(typeof result.current.isChainSupported).toBe('function');
      expect(typeof result.current.switchChain).toBe('function');
      expect(typeof result.current.switchChainAsync).toBe('function');
    });
  });

  describe('Chain Information', () => {
    it('should provide chain support checking functionality', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      const ethereumChain = {
        chainId: '1',
        chainType: ChainType.Evm,
        name: 'Ethereum',
        required: true,
      };

      const isSupported = result.current.isChainSupported(ethereumChain);
      expect(typeof isSupported).toBe('boolean');
    });

    it('should return available chains', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(Array.isArray(result.current.chains)).toBe(true);
    });
  });

  describe('Chain Switching Operations', () => {
    it('should provide synchronous chain switch function', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(typeof result.current.switchChain).toBe('function');
      expect(result.current.isSwitching).toBe(false);
    });

    it('should provide asynchronous chain switch function', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(typeof result.current.switchChainAsync).toBe('function');
    });

    it('should track switching state', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(typeof result.current.isSwitching).toBe('boolean');
      expect(result.current.isSwitching).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should track error state', async () => {
      const { useSwitchChain } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useSupportedChains', () => {
    it('should return supported chains array', async () => {
      const { useSupportedChains } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSupportedChains(), { wrapper });

      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should provide consistent chain information', async () => {
      const { useSupportedChains } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useSupportedChains(), { wrapper });

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toBeDefined();
    });
  });

  describe('useIsChainCompatible', () => {
    it('should check chain compatibility', async () => {
      const { useIsChainCompatible } = await import('./useSwitchChain.js');
      const ethereumChain = {
        chainId: '1',
        chainType: ChainType.Evm,
        name: 'Ethereum',
        required: true,
      };

      const { result } = renderHook(() => useIsChainCompatible(ethereumChain), { wrapper });

      expect(typeof result.current).toBe('boolean');
    });

    it('should handle invalid chain types', async () => {
      const { useIsChainCompatible } = await import('./useSwitchChain.js');
      const { result } = renderHook(() => useIsChainCompatible('invalid-chain' as never), { wrapper });

      expect(typeof result.current).toBe('boolean');
    });
  });
});
