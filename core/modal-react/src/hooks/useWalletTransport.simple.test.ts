import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useWalletTransport } from './useWalletTransport.js';

// Mock the useWalletMeshContext hook
vi.mock('../WalletMeshContext.js', () => ({
  WalletMeshContext: {
    displayName: 'WalletMeshContext',
    Provider: ({ children }: { children: unknown }) => children,
  },
  useWalletMeshContext: () => ({
    client: {
      getWalletAdapter: vi.fn(() => null),
    },
  }),
  useHasWalletMeshProvider: () => true,
}));

// Mock the store to return disconnected state
vi.mock('./internal/useStore.js', () => ({
  useStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      ui: {
        currentView: 'walletSelection',
        errors: {},
        modalOpen: false,
        viewHistory: [],
        loading: { connection: false, discovery: false, transaction: false },
        targetChainType: null,
      },
      entities: {
        sessions: {},
        wallets: {},
        transactions: {},
      },
      active: {
        sessionId: null,
        walletId: null,
        transactionId: null,
        selectedWalletId: null,
      },
      meta: {
        lastDiscoveryTime: null,
        connectionTimestamps: {},
        availableWalletIds: [],
        discoveryErrors: [],
        transactionStatus: 'idle',
      },
    };
    return selector ? selector(mockState) : mockState;
  },
}));

describe('useWalletTransport - Simplified', () => {
  it('should return null transport when not connected', () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useWalletTransport(), { wrapper });

    expect(result.current.transport).toBeNull();
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.walletId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle missing session information', () => {
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => useWalletTransport(), { wrapper });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.walletId).toBeNull();
    expect(result.current.isConnecting).toBe(false);
  });
});
