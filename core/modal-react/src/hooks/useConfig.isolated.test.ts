/**
 * Isolated tests for useConfig hook
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { renderHook } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockClient = {
  openModal: vi.fn(),
  closeModal: vi.fn(),
  discoverWallets: vi.fn().mockResolvedValue([]),
};

const mockStore = {
  getState: vi.fn().mockReturnValue({
    entities: {
      wallets: {},
      sessions: {},
      transactions: {},
    },
    ui: {
      modalOpen: false,
      currentView: 'walletSelection',
      loading: { discovery: false },
      errors: {},
    },
    active: {},
    meta: { availableWalletIds: [] },
  }),
  subscribe: vi.fn().mockReturnValue(() => {}),
  setState: vi.fn(),
};

const mockActions = {
  ui: {
    startDiscovery: vi.fn(),
    stopDiscovery: vi.fn(),
    setWalletFilter: vi.fn(),
    clearWalletFilter: vi.fn(),
    addDiscoveryError: vi.fn(),
  },
  connections: {
    addDiscoveredWallet: vi.fn(),
  },
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
      appName: 'Test App',
      appDescription: 'Test Description',
      appUrl: 'https://test.com',
      appIcon: 'https://test.com/icon.png',
      chains: [],
      debug: true,
    },
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
  useStoreActions: vi.fn(() => mockActions),
  useStoreInstance: vi.fn(() => mockStore),
  useWalletMeshStoreInstance: vi.fn(() => mockStore),
  useWalletMeshStoreActions: vi.fn(() => mockActions),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('useConfig - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Config Properties', () => {
    it('should provide config values from context', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.appName).toBe('Test App');
      expect(result.current.appDescription).toBe('Test Description');
      expect(result.current.appUrl).toBe('https://test.com');
      expect(result.current.appIcon).toBe('https://test.com/icon.png');
      expect(result.current.debug).toBe(true);
    });

    it('should provide chains from config', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(Array.isArray(result.current.chains)).toBe(true);
    });
  });

  describe('Modal Controls', () => {
    it('should provide modal control functions', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
    });

    it('should expose modal state', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(typeof result.current.isOpen).toBe('boolean');
    });
  });

  describe('Wallet Management', () => {
    it('should provide wallet list', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(Array.isArray(result.current.wallets)).toBe(true);
    });

    it('should provide filtered wallets', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(Array.isArray(result.current.filteredWallets)).toBe(true);
    });

    it('should provide wallet filtering functions', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(typeof result.current.setWalletFilter).toBe('function');
      expect(typeof result.current.clearWalletFilter).toBe('function');
    });
  });

  describe('Discovery State', () => {
    it('should expose discovery state', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(typeof result.current.isDiscovering).toBe('boolean');
    });

    it('should provide refreshWallets function', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(typeof result.current.refreshWallets).toBe('function');
    });
  });

  describe('Interface Completeness', () => {
    it('should expose all expected properties', async () => {
      const { useConfig } = await import('./useConfig.js');
      const { result } = renderHook(() => useConfig(), { wrapper });

      // Config properties
      expect(result.current).toHaveProperty('appName');
      expect(result.current).toHaveProperty('appDescription');
      expect(result.current).toHaveProperty('appUrl');
      expect(result.current).toHaveProperty('appIcon');
      expect(result.current).toHaveProperty('chains');
      expect(result.current).toHaveProperty('debug');

      // Modal control
      expect(result.current).toHaveProperty('open');
      expect(result.current).toHaveProperty('close');
      expect(result.current).toHaveProperty('isOpen');

      // Wallet management
      expect(result.current).toHaveProperty('wallets');
      expect(result.current).toHaveProperty('filteredWallets');
      expect(result.current).toHaveProperty('walletFilter');
      expect(result.current).toHaveProperty('setWalletFilter');
      expect(result.current).toHaveProperty('clearWalletFilter');

      // Discovery
      expect(result.current).toHaveProperty('isDiscovering');
      expect(result.current).toHaveProperty('refreshWallets');
    });
  });
});
