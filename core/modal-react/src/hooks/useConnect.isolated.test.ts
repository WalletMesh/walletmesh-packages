/**
 * Isolated tests for useConnect hook - bypasses heavy test setup
 *
 * This test file runs in complete isolation without the heavy
 * global test setup to avoid memory issues.
 */

import { renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import { act } from 'react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal mocks defined inline
const mockClient = {
  connect: vi.fn().mockResolvedValue({ walletId: 'metamask', addresses: ['0x1234'], chainId: '0x1' }),
  disconnect: vi.fn().mockResolvedValue(undefined),
  disconnectAll: vi.fn().mockResolvedValue(undefined),
};

const mockStore = {
  getState: vi.fn().mockReturnValue({
    entities: { wallets: {}, sessions: {}, transactions: {} },
    ui: { currentView: 'walletSelection', loading: {}, errors: {} },
    active: { walletId: null, sessionId: null },
    meta: {},
  }),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
  destroy: vi.fn(),
};

// Mock modules inline
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

vi.mock('../WalletMeshContext.js', () => ({
  useWalletMeshContext: vi.fn(() => ({
    client: mockClient,
    config: { appName: 'Test', chains: [] },
  })),
  useWalletMeshServices: vi.fn(() => ({
    connection: { connect: vi.fn(), disconnect: vi.fn(), isConnected: vi.fn() },
    transaction: {},
    balance: {},
    chain: {},
  })),
}));

vi.mock('./internal/useStore.js', () => ({
  useStore: vi.fn((selector?: (state: unknown) => unknown) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  useStoreActions: vi.fn(() => ({
    ui: { setError: vi.fn(), clearError: vi.fn(), setLoading: vi.fn() },
  })),
  useStoreInstance: vi.fn(() => mockStore),
}));

// Minimal test wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useConnect - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect successfully', async () => {
    const { useConnect } = await import('./useConnect.js');
    const { result } = renderHook(() => useConnect(), { wrapper });

    await act(async () => {
      await result.current.connect('metamask');
    });

    expect(mockClient.connect).toHaveBeenCalledWith('metamask', undefined);
  });

  it('should disconnect successfully', async () => {
    mockStore.getState.mockReturnValue({
      entities: {
        wallets: {},
        sessions: {
          'session-1': {
            sessionId: 'session-1',
            walletId: 'metamask',
            status: 'connected',
          },
        },
        transactions: {},
      },
      ui: { currentView: 'connected', loading: {}, errors: {} },
      active: { walletId: 'metamask', sessionId: 'session-1' },
      meta: {},
    });

    const { useConnect } = await import('./useConnect.js');
    const { result } = renderHook(() => useConnect(), { wrapper });

    await act(async () => {
      await result.current.disconnect();
    });

    expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
  });

  it('should handle connection errors', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

    const { useConnect } = await import('./useConnect.js');
    const { result } = renderHook(() => useConnect(), { wrapper });

    // Ensure hook rendered successfully
    expect(result.current).toBeTruthy();
    expect(result.current.connect).toBeDefined();

    await expect(async () => {
      await act(async () => {
        await result.current.connect('metamask');
      });
    }).rejects.toThrow('Connection failed');
  });

  it('should prevent disconnect with pending transactions', async () => {
    mockStore.getState.mockReturnValue({
      entities: {
        wallets: {},
        sessions: {},
        transactions: {
          'tx-1': { txStatusId: 'tx-1', walletId: 'metamask', status: 'proving' },
        },
      },
      ui: { currentView: 'connected', loading: {}, errors: {} },
      active: { walletId: 'metamask', sessionId: 'session-1' },
      meta: {},
    });

    const { useConnect } = await import('./useConnect.js');
    const { result } = renderHook(() => useConnect(), { wrapper });

    // Ensure hook rendered successfully
    expect(result.current).toBeTruthy();
    expect(result.current.disconnect).toBeDefined();

    await expect(async () => {
      await act(async () => {
        await result.current.disconnect('metamask');
      });
    }).rejects.toThrow('Cannot disconnect: 1 pending transaction(s)');
  });

  it('should allow forced disconnect', async () => {
    mockStore.getState.mockReturnValue({
      entities: {
        wallets: {},
        sessions: {},
        transactions: {
          'tx-1': { txStatusId: 'tx-1', walletId: 'metamask', status: 'proving' },
        },
      },
      ui: { currentView: 'connected', loading: {}, errors: {} },
      active: { walletId: 'metamask', sessionId: 'session-1' },
      meta: {},
    });

    const { useConnect } = await import('./useConnect.js');
    const { result } = renderHook(() => useConnect(), { wrapper });

    await act(async () => {
      await result.current.disconnect('metamask', { force: true });
    });

    expect(mockClient.disconnect).toHaveBeenCalledWith('metamask');
  });
});

describe('useWalletAdapters - Isolated', () => {
  it('should return available wallets', async () => {
    vi.mocked(mockStore.getState).mockReturnValue({
      entities: {
        wallets: {
          metamask: { id: 'metamask', name: 'MetaMask', icon: '', chains: [ChainType.Evm] },
          phantom: { id: 'phantom', name: 'Phantom', icon: '', chains: [ChainType.Solana] },
        },
        sessions: {},
        transactions: {},
      },
      ui: { currentView: 'walletSelection', loading: {}, errors: {} },
      active: { walletId: null, sessionId: null },
      meta: {},
    });

    const wrapper = createWrapper();
    const { useWalletAdapters } = await import('./useConnect.js');
    const { result } = renderHook(() => useWalletAdapters(), { wrapper });

    expect(result.current.length).toBe(2);
  });
});

describe('useIsConnecting - Isolated', () => {
  it('should return connection state', async () => {
    mockStore.getState.mockReturnValue({
      entities: { wallets: {}, sessions: {}, transactions: {} },
      ui: { currentView: 'connecting', loading: {}, errors: {} },
      active: { walletId: null, sessionId: null },
      meta: {},
    });

    const wrapper = createWrapper();
    const { useIsConnecting } = await import('./useConnect.js');
    const { result } = renderHook(() => useIsConnecting(), { wrapper });

    expect(result.current).toBe(true);
  });
});
