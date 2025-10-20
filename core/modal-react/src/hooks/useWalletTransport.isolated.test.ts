/**
 * Isolated tests for useWalletTransport hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import type { SessionState } from '@walletmesh/modal-core';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Define WalletTransport interface for testing
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

// Helper to create a complete SessionState
function createMockSessionState(overrides?: Partial<SessionState>): SessionState {
  const now = Date.now();
  return {
    sessionId: 'session-1',
    walletId: 'metamask',
    status: 'connected',
    accounts: [{ address: '0x123', name: 'Account 1' }],
    activeAccount: { address: '0x123', name: 'Account 1' },
    chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
    provider: {
      instance: {
        connected: true,
        getAddresses: vi.fn().mockResolvedValue(['0x123']),
        getChainId: vi.fn().mockResolvedValue('0x1'),
        disconnect: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        removeAllListeners: vi.fn(),
        request: vi.fn(),
      },
      type: 'eip1193',
      version: '1.0',
      multiChainCapable: false,
      supportedMethods: [],
    },
    permissions: { methods: [], events: [] },
    metadata: {
      wallet: { name: 'MetaMask', icon: '' },
      dapp: { name: 'Test' },
      connection: { initiatedBy: 'user' as const, method: 'extension' as const },
    },
    lifecycle: { createdAt: now, lastActiveAt: now, lastAccessedAt: now, operationCount: 0, activeTime: 0 },
    ...overrides,
  } as SessionState;
}

// Mock the store
const mockStore = {
  getState: vi.fn(() => ({
    active: {
      sessionId: null as string | null,
      walletId: null as string | null,
      transactionId: null as string | null,
      selectedWalletId: null as string | null,
    },
    entities: {
      sessions: {} as Record<string, SessionState>,
      wallets: {},
      transactions: {},
    },
    ui: {
      currentView: 'walletSelection' as string,
      errors: {} as Record<string, unknown>,
      modalOpen: false,
      viewHistory: [],
      loading: { connection: false, discovery: false, transaction: false },
      targetChainType: null,
    },
    meta: {
      backgroundTransactionIds: [] as string[],
    },
  })),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
};

const mockTransport: Partial<WalletTransport> = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  request: vi.fn(),
  getCapabilities: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

const mockAdapter = {
  getJSONRPCTransport: vi.fn(),
};

const mockClient = {
  getWalletAdapter: vi.fn(),
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
    config: { appName: 'Test' },
  })),
}));

// Mock internal hooks
vi.mock('./internal/useStore.js', () => ({
  useStore: vi.fn((selector) => {
    const state = mockStore.getState();
    return selector ? selector(state) : state;
  }),
  shallowEqual: vi.fn((a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    return true;
  }),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useWalletTransport - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();

    // Reset store state
    mockStore.getState.mockReturnValue({
      active: {
        sessionId: null,
        walletId: null,
        transactionId: null,
        selectedWalletId: null,
      },
      entities: {
        sessions: {},
        wallets: {},
        transactions: {},
      },
      ui: {
        currentView: 'walletSelection',
        errors: {},
        modalOpen: false,
        viewHistory: [],
        loading: { connection: false, discovery: false, transaction: false },
        targetChainType: null,
      },
      meta: {
        backgroundTransactionIds: [],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return null transport when not connected', async () => {
      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.transport).toBeNull();
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.sessionId).toBeNull();
      expect(result.current.walletId).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide required function interfaces', async () => {
      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current).toHaveProperty('transport');
      expect(result.current).toHaveProperty('isAvailable');
      expect(result.current).toHaveProperty('sessionId');
      expect(result.current).toHaveProperty('walletId');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isConnecting');
    });
  });

  describe('Connected State', () => {
    it('should return transport when connected', async () => {
      // Setup connected state
      const sessionState = createMockSessionState();
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      // Setup mock client behavior
      mockClient.getWalletAdapter.mockReturnValue(mockAdapter);
      mockAdapter.getJSONRPCTransport.mockReturnValue(mockTransport);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(mockClient.getWalletAdapter).toHaveBeenCalledWith('metamask');
      expect(mockAdapter.getJSONRPCTransport).toHaveBeenCalledWith(ChainType.Evm);
      expect(result.current.transport).toBe(mockTransport);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.sessionId).toBe('session-1');
      expect(result.current.walletId).toBe('metamask');
    });

    it('should provide session information', async () => {
      const sessionState = createMockSessionState({ sessionId: 'unique-session-123', walletId: 'phantom' });
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'unique-session-123',
          walletId: 'phantom',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'unique-session-123': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      mockClient.getWalletAdapter.mockReturnValue(mockAdapter);
      mockAdapter.getJSONRPCTransport.mockReturnValue(mockTransport);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.sessionId).toBe('unique-session-123');
      expect(result.current.walletId).toBe('phantom');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing wallet adapter', async () => {
      const sessionState = createMockSessionState({ walletId: 'unknown-wallet' });
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'unknown-wallet',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      mockClient.getWalletAdapter.mockReturnValue(null);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.transport).toBeNull();
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.error?.message).toBe('Wallet adapter not found');
    });

    it('should handle adapter without transport', async () => {
      const sessionState = createMockSessionState({ walletId: 'old-wallet' });
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'old-wallet',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      const adapterWithoutTransport = {};
      mockClient.getWalletAdapter.mockReturnValue(adapterWithoutTransport);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.transport).toBeNull();
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.error).toBeNull(); // No error, just not available
    });

    it('should handle exceptions when getting transport', async () => {
      const sessionState = createMockSessionState({ walletId: 'faulty-wallet' });
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'faulty-wallet',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      const faultyAdapter = {
        getJSONRPCTransport: vi.fn(() => {
          throw new Error('Transport initialization failed');
        }),
      };
      mockClient.getWalletAdapter.mockReturnValue(faultyAdapter);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.transport).toBeNull();
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.error?.message).toBe('Transport initialization failed');
    });

    it('should handle errors from store', async () => {
      const sessionState = createMockSessionState();
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connected',
          errors: { transport: { message: 'Transport error' } },
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      // Setup mock to return adapter so it doesn't override with 'Wallet adapter not found'
      const mockAdapterLocal = { getJSONRPCTransport: vi.fn().mockReturnValue(null) };
      mockClient.getWalletAdapter.mockReturnValue(mockAdapterLocal);

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Transport error');
    });
  });

  describe('Connecting State', () => {
    it('should show connecting state', async () => {
      const sessionState = createMockSessionState({ status: 'connecting' as const, accounts: [] });
      mockStore.getState.mockReturnValue({
        active: {
          sessionId: 'session-1',
          walletId: 'metamask',
          transactionId: null,
          selectedWalletId: null,
        },
        entities: {
          sessions: { 'session-1': sessionState },
          wallets: {},
          transactions: {},
        },
        ui: {
          currentView: 'connecting',
          errors: {},
          modalOpen: false,
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          targetChainType: null,
        },
        meta: {
          backgroundTransactionIds: [],
        },
      });

      const { useWalletTransport } = await import('./useWalletTransport.js');
      const { result } = renderHook(() => useWalletTransport(), { wrapper });

      expect(result.current.isConnecting).toBe(true);
      expect(result.current.transport).toBeNull();
      expect(result.current.isAvailable).toBe(false);
    });
  });
});
