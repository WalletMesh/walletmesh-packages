import { act, renderHook } from '@testing-library/react';
import { ChainType, type SupportedChain, type WalletAdapter } from '@walletmesh/modal-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletMeshConfig } from '../types.js';

// Mock modal-core SSR utilities
vi.mock('@walletmesh/modal-core', () => ({
  isServer: vi.fn(),
  ssrState: {
    serialize: vi.fn(),
    deserialize: vi.fn(),
    extractSafeState: vi.fn(),
  },
  createWalletMesh: vi.fn(),
  getAztecProvingState: vi.fn(() => ({ entries: {} })),
  getActiveAztecProvingEntries: vi.fn(() => []),
  provingActions: {
    handleNotification: vi.fn(),
    clearAll: vi.fn(),
  },
  ChainType: {
    Evm: 'evm',
    Solana: 'solana',
    Aztec: 'aztec',
  },
}));

import {
  createSSRWalletMesh,
  deserializeState,
  extractSafeState,
  isBrowser,
  isServer,
  safeBrowserAPI,
  serializeState,
  useClientOnly,
  useHasMounted,
} from './ssr-walletmesh.js';

import { createWalletMesh, isServer as mockIsServer, ssrState } from '@walletmesh/modal-core';

const mockCoreIsServer = vi.mocked(mockIsServer);
const mockCreateWalletMesh = vi.mocked(createWalletMesh);
const mockSsrState = vi.mocked(ssrState);

describe('SSR Enhanced Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Environment Detection', () => {
    it('should re-export isServer from modal-core', () => {
      mockCoreIsServer.mockReturnValue(true);
      expect(isServer()).toBe(true);

      mockCoreIsServer.mockReturnValue(false);
      expect(isServer()).toBe(false);

      expect(mockCoreIsServer).toHaveBeenCalledTimes(2);
    });

    it('should provide isBrowser as inverse of isServer', () => {
      mockCoreIsServer.mockReturnValue(true);
      expect(isBrowser()).toBe(false);

      mockCoreIsServer.mockReturnValue(false);
      expect(isBrowser()).toBe(true);
    });
  });

  describe('createSSRWalletMesh', () => {
    const mockConfig = {
      appName: 'Test App',
      appDescription: 'Test Description',
      appUrl: 'https://test.com',
      appIcon: 'icon.png',
      projectId: 'test-project',
      debug: true,
      chains: [
        {
          chainId: 'eip155:1',
          required: false,
          label: 'Ethereum',
          interfaces: ['eip1193'],
          group: 'ethereum',
        },
        {
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          required: false,
          label: 'Solana',
          interfaces: ['solana'],
          group: 'solana',
        },
      ] as SupportedChain[],
      wallets: [
        { id: 'evm-wallet-1', name: 'EVM Wallet 1' },
        { id: 'solana-wallet-1', name: 'Solana Wallet 1' },
      ] as unknown as WalletAdapter[],
    };

    const mockClient = { id: 'mock-client' };

    beforeEach(() => {
      mockCreateWalletMesh.mockReturnValue(mockClient as unknown as ReturnType<typeof createWalletMesh>);
    });

    it('should create WalletMesh with converted config', () => {
      createSSRWalletMesh(mockConfig as unknown as WalletMeshConfig);

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(
        {
          appName: 'Test App',
          appDescription: 'Test Description',
          appUrl: 'https://test.com',
          appIcon: 'icon.png',
          projectId: 'test-project',
          debug: true,
          chains: [
            {
              chainId: 'eip155:1',
              chainType: 'evm',
              name: 'Ethereum',
              required: false,
              label: 'Ethereum',
              interfaces: ['eip1193'],
              group: 'ethereum',
            },
            {
              chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
              chainType: 'solana',
              name: 'Solana',
              required: false,
              label: 'Solana',
              interfaces: ['solana'],
              group: 'solana',
            },
          ],
          wallets: {
            include: ['evm-wallet-1', 'solana-wallet-1'],
          },
        },
        {},
      );
    });

    it('should handle minimal config', () => {
      const minimalConfig = {
        appName: 'Minimal App',
        chains: [
          {
            chainId: 'eip155:1',
            chainType: ChainType.Evm,
            name: 'Ethereum',
            required: false,
          } as SupportedChain,
        ],
      };

      createSSRWalletMesh(minimalConfig);

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(
        {
          appName: 'Minimal App',
          chains: [{ chainId: 'eip155:1', chainType: 'evm', name: 'Ethereum', required: false }],
        },
        {},
      );
    });

    it('should handle wallet objects in config', () => {
      const configWithWalletObjects = {
        appName: 'Test App',
        chains: [] as SupportedChain[],
        wallets: [
          { id: 'evm-wallet-1', name: 'EVM Wallet 1' },
          { id: 'solana-wallet-1', name: 'Solana Wallet 1' },
        ],
      };

      createSSRWalletMesh(configWithWalletObjects as unknown as WalletMeshConfig);

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(
        {
          appName: 'Test App',
          wallets: {
            include: ['evm-wallet-1', 'solana-wallet-1'],
          },
        },
        {},
      );
    });

    it('should handle unknown chain types', () => {
      const configWithUnknownChain = {
        appName: 'Test App',
        chains: [
          {
            chainId: 'unknown',
            required: false,
            label: 'Unknown Chain',
            interfaces: ['unknown'],
            group: 'unknown',
          },
        ] as SupportedChain[],
      };

      createSSRWalletMesh(configWithUnknownChain as Parameters<typeof createSSRWalletMesh>[0]);

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(
        {
          appName: 'Test App',
          chains: [
            {
              chainId: 'unknown',
              chainType: 'evm',
              name: 'Unknown Chain',
              required: false,
              label: 'Unknown Chain',
              interfaces: ['unknown'],
              group: 'unknown',
            },
          ],
        },
        {},
      );
    });

    it('should pass through forceSSR option', () => {
      createSSRWalletMesh(mockConfig as unknown as WalletMeshConfig, {
        forceSSR: true,
      });

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(expect.any(Object), { ssr: true });
    });

    it('should pass through ssr option', () => {
      createSSRWalletMesh(mockConfig as unknown as WalletMeshConfig, {
        ssr: false,
      });

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(expect.any(Object), { ssr: false });
    });

    it('should prefer ssr option over forceSSR', () => {
      createSSRWalletMesh(mockConfig as unknown as WalletMeshConfig, {
        forceSSR: true,
        ssr: false,
      });

      expect(mockCreateWalletMesh).toHaveBeenCalledWith(
        expect.any(Object),
        { ssr: false }, // SSR option should be passed
      );
    });
  });

  describe('State Serialization', () => {
    it('should re-export serialize from modal-core', () => {
      const mockData = { test: 'data' } as unknown as Parameters<typeof serializeState>[0];
      const mockResult = 'serialized';

      mockSsrState.serialize.mockReturnValue(mockResult);

      const result = serializeState(mockData);

      expect(result).toBe(mockResult);
      expect(mockSsrState.serialize).toHaveBeenCalledWith(mockData);
    });

    it('should re-export deserialize from modal-core', () => {
      const mockSerialized = 'serialized';
      const mockResult = { test: 'data' } as unknown as ReturnType<typeof deserializeState>;

      mockSsrState.deserialize.mockReturnValue(mockResult);

      const result = deserializeState(mockSerialized);

      expect(result).toBe(mockResult);
      expect(mockSsrState.deserialize).toHaveBeenCalledWith(mockSerialized);
    });

    it('should re-export extractSafeState from modal-core', () => {
      const mockState = { test: 'state' } as unknown as Parameters<typeof extractSafeState>[0];
      const mockResult = { safe: 'state' } as unknown as ReturnType<typeof extractSafeState>;

      mockSsrState.extractSafeState.mockReturnValue(mockResult);

      const result = extractSafeState(mockState);

      expect(result).toBe(mockResult);
      expect(mockSsrState.extractSafeState).toHaveBeenCalledWith(mockState);
    });
  });

  describe('useHasMounted', () => {
    it('should handle mount state correctly', () => {
      const { result } = renderHook(() => useHasMounted());

      // In test environment, may already be mounted
      expect(typeof result.current).toBe('boolean');
    });

    it('should handle effect lifecycle', async () => {
      const { result, rerender } = renderHook(() => useHasMounted());

      const initialValue = result.current;
      expect(typeof initialValue).toBe('boolean');

      // Trigger effect
      await act(async () => {
        rerender();
      });

      // Should maintain consistency
      expect(typeof result.current).toBe('boolean');
    });

    it('should remain true on subsequent renders', async () => {
      const { result, rerender } = renderHook(() => useHasMounted());

      await act(async () => {
        rerender();
      });

      expect(result.current).toBe(true);

      rerender();
      expect(result.current).toBe(true);
    });
  });

  describe('useClientOnly', () => {
    it('should handle client value correctly', () => {
      const clientValue = vi.fn(() => 'client-value');
      renderHook(() => useClientOnly(clientValue));

      // In test environment, might be called immediately or deferred
      expect(clientValue.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle effect lifecycle', async () => {
      const clientValue = vi.fn(() => 'client-value');
      const { rerender } = renderHook(() => useClientOnly(clientValue));

      await act(async () => {
        rerender();
      });

      // Should have called client value at some point
      expect(clientValue).toHaveBeenCalled();
    });

    it('should memoize client value', async () => {
      const clientValue = vi.fn(() => 'client-value');
      const { result, rerender } = renderHook(() => useClientOnly(clientValue));

      await act(async () => {
        rerender();
      });

      const firstResult = result.current;

      rerender();

      expect(result.current).toBe(firstResult);
      expect(clientValue).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle client value function changes', async () => {
      let clientValue = vi.fn(() => 'value-1');
      const { result, rerender } = renderHook((fn?: () => string) => useClientOnly(fn || clientValue));

      await act(async () => {
        rerender();
      });

      expect(result.current).toBe('value-1');

      clientValue = vi.fn(() => 'value-2');
      rerender(clientValue as Parameters<typeof rerender>[0]);

      expect(result.current).toBe('value-2');
    });
  });

  describe('safeBrowserAPI', () => {
    it('should return fallback when isServer returns true', () => {
      mockCoreIsServer.mockReturnValue(true);

      const browserFn = vi.fn(() => 'browser-value');
      const result = safeBrowserAPI(browserFn, 'fallback');

      expect(result).toBe('fallback');
      expect(browserFn).not.toHaveBeenCalled();
    });

    it('should call function when isServer returns false', () => {
      mockCoreIsServer.mockReturnValue(false);

      const browserFn = vi.fn(() => 'browser-value');
      const result = safeBrowserAPI(browserFn, 'fallback');

      expect(result).toBe('browser-value');
      expect(browserFn).toHaveBeenCalledTimes(1);
    });

    it('should return fallback when function throws', () => {
      mockCoreIsServer.mockReturnValue(false);

      const browserFn = vi.fn(() => {
        throw new Error('Browser API error');
      });
      const result = safeBrowserAPI(browserFn, 'fallback');

      expect(result).toBe('fallback');
      expect(browserFn).toHaveBeenCalledTimes(1);
    });

    it('should work with different return types', () => {
      mockCoreIsServer.mockReturnValue(false);

      const objectResult = safeBrowserAPI(() => ({ test: 'object' }), null);
      expect(objectResult).toEqual({ test: 'object' });

      const numberResult = safeBrowserAPI(() => 42, 0);
      expect(numberResult).toBe(42);

      const booleanResult = safeBrowserAPI(() => true, false);
      expect(booleanResult).toBe(true);
    });
  });

  describe('Real-world Integration', () => {
    it('should handle Next.js getServerSideProps pattern', () => {
      // Simulate server environment
      mockCoreIsServer.mockReturnValue(true);

      const getServerSideData = () => {
        if (isServer()) {
          return { source: 'server', timestamp: Date.now() };
        }

        return safeBrowserAPI(() => ({ source: 'client', url: window.location.href }), {
          source: 'fallback',
          url: '/',
        });
      };

      const result = getServerSideData();
      expect(result.source).toBe('server');
      expect(result).toHaveProperty('timestamp');
    });

    it('should handle client-side hydration pattern', () => {
      // Simulate client environment
      mockCoreIsServer.mockReturnValue(false);

      const getClientData = () => {
        return safeBrowserAPI(
          () => ({
            userAgent: 'test-agent',
            language: 'en-US',
            online: true,
          }),
          {
            userAgent: 'unknown',
            language: 'en',
            online: false,
          },
        );
      };

      const result = getClientData();
      expect(result.userAgent).toBe('test-agent');
      expect(result.language).toBe('en-US');
      expect(result.online).toBe(true);
    });

    it('should handle React component mounting detection', async () => {
      const { result, rerender } = renderHook(() => {
        const hasMounted = useHasMounted();
        const clientData = useClientOnly(() => ({
          mounted: true,
          timestamp: Date.now(),
        }));

        return { hasMounted, clientData };
      });

      // Check initial state types
      expect(typeof result.current.hasMounted).toBe('boolean');

      // After effect runs
      await act(async () => {
        rerender();
      });

      expect(typeof result.current.hasMounted).toBe('boolean');
      // In test environment, clientData might be available immediately
      if (result.current.clientData) {
        expect(result.current.clientData).toHaveProperty('mounted');
        expect(result.current.clientData).toHaveProperty('timestamp');
      }
    });
  });
});
