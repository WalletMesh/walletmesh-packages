import { renderHook } from '@testing-library/react';
import { ChainType } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WalletMeshContext,
  useHasWalletMeshProvider,
  useWalletMeshContext,
  useWalletMeshServices,
} from './WalletMeshContext.js';
import type { InternalContextValue } from './WalletMeshContext.js';
import type { WalletMeshConfig } from './types.js';

// Import the client type that createWalletMesh returns (unwrapped from Promise)
type WalletMeshClient = Awaited<ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>>;

// Mock the modal-core module
vi.mock('@walletmesh/modal-core', () => ({
  createWalletMesh: vi.fn(),
  createDebugLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
  })),
  ErrorFactory: {
    configurationError: vi.fn().mockImplementation((message, details) => {
      const error = new Error(message);
      Object.assign(error, {
        code: 'CONFIGURATION_ERROR',
        category: 'configuration',
        fatal: true,
        data: details,
      });
      return error;
    }),
    connectionFailed: vi.fn().mockImplementation((message, details) => {
      const error = new Error(message);
      Object.assign(error, {
        code: 'CONNECTION_FAILED',
        category: 'connection',
        fatal: false,
        data: details,
      });
      return error;
    }),
    walletNotFound: vi.fn().mockImplementation((walletId) => {
      const error = new Error(`Wallet ${walletId} not found`);
      Object.assign(error, {
        code: 'WALLET_NOT_FOUND',
        category: 'wallet',
        fatal: false,
        data: { walletId },
      });
      return error;
    }),
  },
  ChainType: {
    Evm: 'evm',
    Solana: 'solana',
    Aztec: 'aztec',
  },
}));

describe('WalletMeshContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Don't restore all mocks since we need the vi.mock at module level
    // vi.restoreAllMocks();
  });

  describe('useWalletMeshContext', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useWalletMeshContext());
      }).toThrow(
        'useWalletMeshContext must be used within a WalletMeshProvider. ' +
          'Wrap your application with <WalletMeshProvider> to use WalletMesh hooks.',
      );
    });

    it('should return context value when used inside provider', () => {
      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true }],
      };

      const mockClient: Partial<WalletMeshClient> = {
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const contextValue: InternalContextValue = {
        client: mockClient as WalletMeshClient,
        config: mockConfig,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useWalletMeshContext(), { wrapper });

      expect(result.current).toEqual(contextValue);
    });
  });

  describe('useHasWalletMeshProvider', () => {
    it('should return false when used outside provider', () => {
      const { result } = renderHook(() => useHasWalletMeshProvider());

      expect(result.current).toBe(false);
    });

    it('should return true when used inside provider', () => {
      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true }],
      };

      const mockClient: Partial<WalletMeshClient> = {
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const contextValue: InternalContextValue = {
        client: mockClient as WalletMeshClient,
        config: mockConfig,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useHasWalletMeshProvider(), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false when provider value is null', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={null}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useHasWalletMeshProvider(), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useWalletMeshServices', () => {
    it('should return null when client is null', () => {
      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true }],
      };

      const contextValue: InternalContextValue = {
        client: null,
        config: mockConfig,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useWalletMeshServices(), { wrapper });

      expect(result.current).toBeNull();
    });

    it('should return null when client does not have getServices method', () => {
      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true }],
      };

      const mockClient: Partial<WalletMeshClient> = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        // getServices method is missing
      };

      const contextValue: InternalContextValue = {
        client: mockClient as WalletMeshClient,
        config: mockConfig,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useWalletMeshServices(), { wrapper });

      expect(result.current).toBeNull();
    });

    it('should return services when client has getServices method', () => {
      const mockServices = {
        transaction: { sendTransaction: vi.fn() },
        balance: { getBalance: vi.fn() },
        chain: { switchChain: vi.fn() },
        connection: { validateConnectionParams: vi.fn() },
      };

      const mockConfig: WalletMeshConfig = {
        appName: 'Test App',
        chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: true }],
      };

      const mockClient: Partial<WalletMeshClient> = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        getServices: vi.fn().mockReturnValue(mockServices),
      };

      const contextValue: InternalContextValue = {
        client: mockClient as WalletMeshClient,
        config: mockConfig,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      );

      const { result } = renderHook(() => useWalletMeshServices(), { wrapper });

      expect(result.current).toEqual(mockServices);
      // With useMemo, getServices is only called once
      expect(mockClient.getServices).toHaveBeenCalledTimes(1);
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useWalletMeshServices());
      }).toThrow(
        'useWalletMeshContext must be used within a WalletMeshProvider. ' +
          'Wrap your application with <WalletMeshProvider> to use WalletMesh hooks.',
      );
    });
  });
});
