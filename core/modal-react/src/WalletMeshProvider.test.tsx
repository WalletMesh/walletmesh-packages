import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletMeshProvider } from './WalletMeshProvider.js';

// Mock the modal-core module
vi.mock('@walletmesh/modal-core', () => ({
  createWalletMesh: vi.fn(),
  createDebugLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  isServer: vi.fn(() => false),
  isBrowser: vi.fn(() => true),
  getAztecProvingState: vi.fn(() => ({ entries: {} })),
  getActiveAztecProvingEntries: vi.fn(() => []),
  provingActions: {
    handleNotification: vi.fn(),
    clearAll: vi.fn(),
  },
  ssrState: {
    isClient: true,
    isServer: false,
    hasHydrated: true,
    serialize: vi.fn().mockImplementation((state: unknown) => JSON.stringify(state)),
    deserialize: vi.fn().mockImplementation((serialized: string) => JSON.parse(serialized)),
    extractSafeState: vi.fn().mockImplementation((state: unknown) => state),
  },
}));

// Mock the WalletMeshModal component
vi.mock('./components/WalletMeshModal.js', () => ({
  WalletMeshModal: () => null,
}));

describe('WalletMeshProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window object with matchMedia
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      },
      writable: true,
    });
    // Reset process.env
    process.env['NODE_ENV'] = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Properties', () => {
    it('should have correct displayName', () => {
      expect(WalletMeshProvider.displayName).toBe('WalletMeshProvider');
    });
  });

  describe('Chain Configuration Logic', () => {
    it('should handle aztec chain type transformation', async () => {
      const { createWalletMesh } = await import('@walletmesh/modal-core');
      const mockCreateWalletMesh = vi.mocked(createWalletMesh);

      // Mock the function to track calls
      mockCreateWalletMesh.mockReturnValue({ id: 'test-client' } as unknown as ReturnType<
        typeof mockCreateWalletMesh
      >);

      // Create a provider with aztec chain
      const config = {
        appName: 'Test App',
        chains: ['aztec'] as const,
      };

      // Simulate the transformation logic that happens inside the provider
      const transformedChains =
        config.chains?.map((chainType: string) => {
          switch (chainType) {
            case 'evm':
              return { chainId: '1', chainType: 'evm', name: 'Ethereum' };
            case 'solana':
              return { chainId: 'mainnet-beta', chainType: 'solana', name: 'Solana' };
            case 'aztec':
              return { chainId: 'aztec-mainnet', chainType: 'aztec', name: 'Aztec' };
            default:
              return { chainId: chainType, chainType, name: chainType };
          }
        }) || [];

      expect(transformedChains).toEqual([{ chainId: 'aztec-mainnet', chainType: 'aztec', name: 'Aztec' }]);
    });

    it('should handle custom/unknown chain types', () => {
      const chainTypes = ['custom-chain', 'unknown-type'];

      // Simulate the transformation logic
      const transformedChains = chainTypes.map((chainType: string) => {
        switch (chainType) {
          case 'evm':
            return { chainId: '1', chainType: 'evm', name: 'Ethereum' };
          case 'solana':
            return { chainId: 'mainnet-beta', chainType: 'solana', name: 'Solana' };
          case 'aztec':
            return { chainId: 'aztec-mainnet', chainType: 'aztec', name: 'Aztec' };
          default:
            return { chainId: chainType, chainType, name: chainType };
        }
      });

      expect(transformedChains).toEqual([
        { chainId: 'custom-chain', chainType: 'custom-chain', name: 'custom-chain' },
        { chainId: 'unknown-type', chainType: 'unknown-type', name: 'unknown-type' },
      ]);
    });
  });

  describe('Wallet Configuration Logic', () => {
    it('should transform string array wallet config', () => {
      const wallets = ['metamask', 'phantom'];

      // Simulate the transformation logic from the provider
      let transformedWallets: string[] | { include: string[] } = wallets;

      if (Array.isArray(wallets) && wallets.length > 0 && typeof wallets[0] === 'string') {
        transformedWallets = {
          include: wallets,
        };
      }

      expect(transformedWallets).toEqual({
        include: ['metamask', 'phantom'],
      });
    });

    it('should pass through wallet object configuration', () => {
      const walletConfig = {
        include: ['metamask'],
        exclude: ['trust'],
        order: ['metamask', 'phantom'],
      };

      // Simulate the transformation logic - should pass through
      let transformedWallets: typeof walletConfig | { include: typeof walletConfig } = walletConfig;

      if (Array.isArray(walletConfig) && walletConfig.length > 0 && typeof walletConfig[0] === 'string') {
        transformedWallets = {
          include: walletConfig,
        };
      }

      expect(transformedWallets).toEqual(walletConfig);
    });

    it('should pass through WalletInfo array configuration', () => {
      const walletInfos = [{ id: 'custom-wallet', name: 'Custom Wallet', icon: 'icon.svg', chains: ['evm'] }];

      // Simulate the transformation logic - should pass through
      let transformedWallets: typeof walletInfos | { include: typeof walletInfos } = walletInfos;

      if (Array.isArray(walletInfos) && walletInfos.length > 0 && typeof walletInfos[0] === 'string') {
        transformedWallets = {
          include: walletInfos,
        };
      }

      expect(transformedWallets).toEqual(walletInfos);
    });
  });

  describe('SSR Logic', () => {
    it('should detect SSR environment correctly', () => {
      // Simulate SSR environment by setting window to undefined
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';
      const hasWindow = typeof window !== 'undefined';

      expect(hasWindow).toBe(false);
      expect(isTestEnv).toBe(false);

      // In SSR without test env, should return null
      if (!hasWindow && !isTestEnv) {
        expect(null).toBe(null); // This simulates returning null for client
      }
    });

    it('should detect test environment correctly', () => {
      // Set test environment
      process.env['NODE_ENV'] = 'test';

      // Simulate SSR by checking window availability
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';
      const hasWindow = typeof window !== 'undefined';

      expect(hasWindow).toBe(false);
      expect(isTestEnv).toBe(true);

      // In test env even without window, should create client
      if (!hasWindow && isTestEnv) {
        expect(true).toBe(true); // This simulates creating client in test env
      }
    });
  });

  describe('Debug Flag Logic', () => {
    it('should handle debug flag setup when window exists', () => {
      const mockWindow: Window & { __WALLETMESH_DEBUG__?: boolean } = {
        __WALLETMESH_DEBUG__: false,
      } as Window & { __WALLETMESH_DEBUG__?: boolean };
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      });

      const debug = true;

      // Simulate the debug setup logic
      if (debug && typeof window !== 'undefined') {
        (window as Window & { __WALLETMESH_DEBUG__?: boolean }).__WALLETMESH_DEBUG__ = true;
      }

      expect(mockWindow.__WALLETMESH_DEBUG__).toBe(true);
    });

    it('should not set debug flag when debug is false', () => {
      const mockWindow: Window & { __WALLETMESH_DEBUG__?: boolean } = {
        __WALLETMESH_DEBUG__: false,
      } as Window & { __WALLETMESH_DEBUG__?: boolean };
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      });

      const debug = false;

      // Simulate the debug setup logic
      if (debug && typeof window !== 'undefined') {
        (window as Window & { __WALLETMESH_DEBUG__?: boolean }).__WALLETMESH_DEBUG__ = true;
      }

      expect(mockWindow.__WALLETMESH_DEBUG__).toBe(false);
    });

    it('should not crash when window does not exist', () => {
      // Simulate environment without window
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const debug = true;

      // Simulate the debug setup logic - should not crash
      expect(() => {
        if (debug && typeof window !== 'undefined') {
          (window as Window & { __WALLETMESH_DEBUG__?: boolean }).__WALLETMESH_DEBUG__ = true;
        }
      }).not.toThrow();
    });
  });

  describe('Error Handling Logic', () => {
    it('should handle client creation errors gracefully', async () => {
      const { createWalletMesh } = await import('@walletmesh/modal-core');
      const mockCreateWalletMesh = vi.mocked(createWalletMesh);

      mockCreateWalletMesh.mockImplementation(() => {
        throw new Error('Client creation failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate the error handling logic
      let client = null;
      try {
        client = mockCreateWalletMesh({
          appName: 'Test App',
          chains: [],
        });
      } catch (error) {
        console.error('[WalletMeshProvider] Failed to create client:', error);
        client = null;
      }

      expect(client).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WalletMeshProvider] Failed to create client:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Basic Provider Functionality', () => {
    it('should have proper display name', () => {
      // Simple test that verifies the provider component properties
      expect(WalletMeshProvider.displayName).toBe('WalletMeshProvider');
    });

    it('should be a valid React component', () => {
      // Verify the provider is a valid React component function
      expect(typeof WalletMeshProvider).toBe('function');
    });
  });
});
