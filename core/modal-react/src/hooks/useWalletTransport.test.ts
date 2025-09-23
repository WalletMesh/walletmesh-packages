import { renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import type { SessionState, WalletAdapter } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useWalletTransport } from './useWalletTransport.js';

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
};

vi.mock('./internal/useStore.js', () => ({
  useStore: <T>(selector: (state: typeof mockStore) => T) => selector(mockStore),
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

// Create the mocks outside the factory so they're accessible
const mockClient = {
  getWalletAdapter: vi.fn(),
};

const mockTransport: Partial<WalletTransport> = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  request: vi.fn(),
  getCapabilities: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

const mockAdapter: Partial<WalletAdapter> = {
  getJSONRPCTransport: vi.fn(),
};

// Mock the WalletMeshContext with proper client
vi.mock('../WalletMeshContext.js', () => ({
  WalletMeshContext: {
    displayName: 'WalletMeshContext',
    Provider: ({ children }: { children: unknown }) => children,
  },
  useWalletMeshContext: () => ({
    client: mockClient,
    config: { appName: 'Test' },
  }),
  useHasWalletMeshProvider: () => true,
}));

describe('useWalletTransport', () => {
  // Mocks are available directly from module scope

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    mockStore.active.sessionId = null;
    mockStore.active.walletId = null;
    mockStore.entities.sessions = {};
    mockStore.ui.currentView = 'walletSelection';
    mockStore.ui.errors = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null transport when not connected', () => {
    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.walletId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return transport when connected', () => {
    // Setup connected state
    const sessionState = createMockSessionState();
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;

    // Setup mock client behavior
    mockClient.getWalletAdapter.mockReturnValue(mockAdapter);
    (mockAdapter.getJSONRPCTransport as ReturnType<typeof vi.fn>).mockReturnValue(mockTransport);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(mockClient.getWalletAdapter).toHaveBeenCalledWith('metamask');
    expect(mockAdapter.getJSONRPCTransport).toHaveBeenCalledWith(ChainType.Evm);
    expect(result.current.transport).toBe(mockTransport);
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.sessionId).toBe('session-1');
    expect(result.current.walletId).toBe('metamask');
  });

  it('should handle missing wallet adapter', () => {
    const sessionState = createMockSessionState({ walletId: 'unknown-wallet' });
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;

    mockClient.getWalletAdapter.mockReturnValue(null);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error?.message).toBe('Wallet adapter not found');
  });

  it('should handle adapter without transport', () => {
    const sessionState = createMockSessionState({ walletId: 'old-wallet' });
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;

    const adapterWithoutTransport = {};
    mockClient.getWalletAdapter.mockReturnValue(adapterWithoutTransport);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error).toBeNull(); // No error, just not available
  });

  it('should show connecting state', () => {
    mockStore.ui.currentView = 'connecting';
    const sessionState = createMockSessionState({ status: 'connecting' as const, accounts: [] });
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.isConnecting).toBe(true);
    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
  });

  it('should handle errors from store', () => {
    const sessionState = createMockSessionState();
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;
    mockStore.ui.errors['transport'] = { message: 'Transport error' };

    // Setup mock to return adapter so it doesn't override with 'Wallet adapter not found'
    const mockAdapter = { getJSONRPCTransport: vi.fn().mockReturnValue(null) };
    mockClient.getWalletAdapter.mockReturnValue(mockAdapter);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Transport error');
  });

  it('should handle exceptions when getting transport', () => {
    const sessionState = createMockSessionState({ walletId: 'faulty-wallet' });
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;

    const faultyAdapter = {
      getJSONRPCTransport: vi.fn(() => {
        throw new Error('Transport initialization failed');
      }),
    };
    mockClient.getWalletAdapter.mockReturnValue(faultyAdapter);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error?.message).toBe('Transport initialization failed');
  });

  it('should update when connection state changes', () => {
    const { result, rerender } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    // Initially disconnected
    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);

    // Connect wallet
    const sessionState = createMockSessionState();
    mockStore.active.sessionId = 'session-1';
    mockStore.entities.sessions['session-1'] = sessionState;
    mockClient.getWalletAdapter.mockReturnValue(mockAdapter);
    (mockAdapter.getJSONRPCTransport as ReturnType<typeof vi.fn>).mockReturnValue(mockTransport);

    rerender();

    // Should now have transport
    expect(result.current.transport).toBe(mockTransport);
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.sessionId).toBe('session-1');
    expect(result.current.walletId).toBe('metamask');

    // Disconnect wallet
    mockStore.active.sessionId = null;
    mockStore.entities.sessions = {};

    rerender();

    // Should lose transport
    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.walletId).toBeNull();
  });

  it('should provide session information', () => {
    const sessionState = createMockSessionState({ sessionId: 'unique-session-123', walletId: 'phantom' });
    mockStore.active.sessionId = 'unique-session-123';
    mockStore.entities.sessions['unique-session-123'] = sessionState;

    mockClient.getWalletAdapter.mockReturnValue(mockAdapter);
    (mockAdapter.getJSONRPCTransport as ReturnType<typeof vi.fn>).mockReturnValue(mockTransport);

    const { result } = renderHook(() => useWalletTransport(), {
      wrapper: createTestWrapper().wrapper,
    });

    expect(result.current.sessionId).toBe('unique-session-123');
    expect(result.current.walletId).toBe('phantom');
  });
});
