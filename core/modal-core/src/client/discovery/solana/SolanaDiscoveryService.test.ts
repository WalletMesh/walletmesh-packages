/**
 * Tests for Solana Discovery Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SolanaDiscoveryService } from './SolanaDiscoveryService.js';
import type { SolanaProvider, SolanaWalletStandardWallet } from './types.js';

// Type for global with window property
type MockWindow = Window & {
  solana?: Partial<SolanaProvider> | null;
  solflare?: Partial<SolanaProvider> | string;
  backpack?: { solana?: Partial<SolanaProvider> };
  wallets?: {
    get: () => SolanaWalletStandardWallet[];
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };
};

type GlobalWithWindow = typeof globalThis & {
  window?: MockWindow;
};

// Helper to get the mock window
function getMockWindow(): MockWindow {
  const globalWithWindow = global as GlobalWithWindow;
  if (!globalWithWindow.window) {
    throw new Error('Mock window not available in test environment');
  }
  return globalWithWindow.window;
}

describe('SolanaDiscoveryService', () => {
  let service: SolanaDiscoveryService;
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    vi.useFakeTimers();
    originalWindow = global.window as Window & typeof globalThis;

    // Create a mock window object
    (global as GlobalWithWindow).window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    service?.cleanup();

    // Restore original window
    global.window = originalWindow;
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      service = new SolanaDiscoveryService();
      expect(service).toBeDefined();
    });

    it('should accept custom config', () => {
      service = new SolanaDiscoveryService({
        enabled: false,
        walletStandardTimeout: 1000,
        preferWalletStandard: false,
        includeDeprecated: true,
      });
      expect(service).toBeDefined();
    });

    it('should accept a custom logger', () => {
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        setLevel: vi.fn(),
        dispose: vi.fn(),
      };
      service = new SolanaDiscoveryService({}, mockLogger);
      expect(service).toBeDefined();
    });
  });

  describe('discover', () => {
    it('should return empty results when disabled', async () => {
      service = new SolanaDiscoveryService({ enabled: false });
      const results = await service.discover();

      expect(results).toEqual({
        walletStandardWallets: [],
        injectedWallets: [],
        totalCount: 0,
      });
    });

    it('should return empty results in non-browser environment', async () => {
      (global as GlobalWithWindow).window = undefined;
      service = new SolanaDiscoveryService();
      const results = await service.discover();

      expect(results).toEqual({
        walletStandardWallets: [],
        injectedWallets: [],
        totalCount: 0,
      });
    });

    it('should discover injected Phantom wallet', async () => {
      const mockPhantomProvider: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
        signTransaction: vi.fn(),
        signMessage: vi.fn(),
      };

      getMockWindow().solana = mockPhantomProvider;

      service = new SolanaDiscoveryService();
      const promise = service.discover();

      // Advance timers to complete discovery
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.injectedWallets).toHaveLength(1);
      expect(results.injectedWallets[0]).toMatchObject({
        id: 'phantom',
        name: 'Phantom',
        type: 'injected',
      });
      expect(results.totalCount).toBe(1);
    });

    it('should discover multiple injected wallets', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockSolflare: Partial<SolanaProvider> = {
        isSolflare: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockBackpack: Partial<SolanaProvider> = {
        isBackpack: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;
      getMockWindow().solflare = mockSolflare;
      getMockWindow().backpack = { solana: mockBackpack };

      service = new SolanaDiscoveryService();
      const promise = service.discover();

      // Advance timers to complete discovery
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.injectedWallets).toHaveLength(3);
      expect(results.injectedWallets.map((w) => w.id)).toContain('phantom');
      expect(results.injectedWallets.map((w) => w.id)).toContain('solflare');
      expect(results.injectedWallets.map((w) => w.id)).toContain('backpack');
      expect(results.totalCount).toBe(3);
    });

    it('should discover wallets via Wallet Standard', async () => {
      const mockWallet: SolanaWalletStandardWallet = {
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,test',
        chains: ['solana:mainnet', 'solana:testnet'],
        features: { 'solana:signTransaction': {} },
        accounts: [],
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const walletRegistry = {
        get: vi.fn(() => [mockWallet]),
        on: vi.fn(),
        off: vi.fn(),
      };

      getMockWindow().wallets = walletRegistry;

      service = new SolanaDiscoveryService();
      const promise = service.discover();

      // Advance timers to trigger timeout
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.walletStandardWallets).toHaveLength(1);
      expect(results.walletStandardWallets[0]).toMatchObject({
        id: 'test-wallet',
        name: 'Test Wallet',
        type: 'wallet-standard',
      });
    });

    it('should handle wallet-standard:register events', async () => {
      const mockWallet: SolanaWalletStandardWallet = {
        name: 'Dynamic Wallet',
        icon: 'data:image/svg+xml;base64,dynamic',
        chains: ['solana:mainnet'],
        features: { 'solana:signMessage': {} },
        accounts: [],
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      let registeredListener: ((event: CustomEvent) => void) | undefined;
      getMockWindow().addEventListener = vi.fn((event: string, listener: (event: CustomEvent) => void) => {
        if (event === 'wallet-standard:register') {
          registeredListener = listener;
        }
      });

      service = new SolanaDiscoveryService();
      const promise = service.discover();

      // Simulate wallet registration event
      if (registeredListener) {
        const event = new CustomEvent('wallet-standard:register', {
          detail: { wallet: mockWallet },
        });
        registeredListener(event);
      }

      // Advance timers
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.walletStandardWallets).toHaveLength(1);
      expect(results.walletStandardWallets[0].name).toBe('Dynamic Wallet');
    });

    it('should deduplicate wallets when preferWalletStandard is true', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockWalletStandard: SolanaWalletStandardWallet = {
        name: 'Phantom',
        icon: 'data:image/svg+xml;base64,phantom',
        chains: ['solana:mainnet'],
        features: {},
        accounts: [],
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;
      getMockWindow().wallets = {
        get: () => [mockWalletStandard],
        on: vi.fn(),
        off: vi.fn(),
      };

      service = new SolanaDiscoveryService({ preferWalletStandard: true });
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      // Should only have wallet standard version
      expect(results.walletStandardWallets).toHaveLength(1);
      expect(results.injectedWallets).toHaveLength(0);
      expect(results.totalCount).toBe(1);
    });

    it('should include deprecated wallets when configured', async () => {
      // Use the same ID for both to trigger deduplication
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      const mockWalletStandard: SolanaWalletStandardWallet = {
        name: 'phantom', // Use lowercase to match ID generation
        icon: 'data:image/svg+xml;base64,phantom',
        chains: ['solana:mainnet'],
        features: {},
        accounts: [],
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;
      getMockWindow().wallets = {
        get: () => [mockWalletStandard],
        on: vi.fn(),
        off: vi.fn(),
      };

      service = new SolanaDiscoveryService({
        preferWalletStandard: true,
        includeDeprecated: true,
      });
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.walletStandardWallets).toHaveLength(1);
      expect(results.legacyWallets).toBeDefined();
      expect(results.legacyWallets).toHaveLength(1);
      expect(results.legacyWallets?.[0].type).toBe('legacy');
      expect(results.legacyWallets?.[0].id).toBe('phantom');
    });

    it('should detect all supported wallet types', async () => {
      const walletTypes = [
        { prop: 'isPhantom', id: 'phantom', name: 'Phantom' },
        { prop: 'isSolflare', id: 'solflare', name: 'Solflare' },
        { prop: 'isBackpack', id: 'backpack', name: 'Backpack' },
        { prop: 'isGlow', id: 'glow', name: 'Glow' },
        { prop: 'isCoinbaseWallet', id: 'coinbase-solana', name: 'Coinbase Wallet' },
        { prop: 'isTrust', id: 'trust', name: 'Trust Wallet' },
        { prop: 'isExodus', id: 'exodus', name: 'Exodus' },
        { prop: 'isMathWallet', id: 'mathwallet', name: 'MathWallet' },
        { prop: 'isSlope', id: 'slope', name: 'Slope' },
        { prop: 'isTorus', id: 'torus', name: 'Torus' },
        { prop: 'isBraveWallet', id: 'brave-solana', name: 'Brave Wallet' },
        { prop: 'isTokenPocket', id: 'tokenpocket', name: 'TokenPocket' },
      ];

      for (const walletType of walletTypes) {
        // Clear previous mocks
        getMockWindow().solana = undefined;

        const mockProvider: Partial<SolanaProvider> = {
          [walletType.prop]: true,
          connect: vi.fn(),
          disconnect: vi.fn(),
        };

        getMockWindow().solana = mockProvider;

        service = new SolanaDiscoveryService();
        const promise = service.discover();
        await vi.advanceTimersByTimeAsync(500);
        const results = await promise;

        expect(results.injectedWallets).toHaveLength(1);
        expect(results.injectedWallets[0]).toMatchObject({
          id: walletType.id,
          name: walletType.name,
          type: 'injected',
        });

        service.cleanup();
      }
    });

    it('should handle unknown wallet type', async () => {
      const mockUnknown: Partial<SolanaProvider> = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        signTransaction: vi.fn(),
      };

      getMockWindow().solana = mockUnknown;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.injectedWallets).toHaveLength(1);
      expect(results.injectedWallets[0].id).toContain('unknown-solana');
      expect(results.injectedWallets[0].name).toContain('Solana Wallet');
    });
  });

  describe('getDiscoveredWallets', () => {
    it('should return all discovered wallets', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      const wallets = service.getDiscoveredWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0].id).toBe('phantom');
    });
  });

  describe('getAllWallets', () => {
    it('should return all wallets from results', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      const wallets = service.getAllWallets(results);
      expect(wallets).toHaveLength(1);
      expect(wallets[0].id).toBe('phantom');
    });

    it('should return discovered wallets when no results provided', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      const wallets = service.getAllWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0].id).toBe('phantom');
    });
  });

  describe('getWalletById', () => {
    it('should return wallet by ID', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      const wallet = service.getWalletById('phantom');
      expect(wallet).toBeDefined();
      expect(wallet?.name).toBe('Phantom');
    });

    it('should return undefined for non-existent wallet', async () => {
      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      const wallet = service.getWalletById('non-existent');
      expect(wallet).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all discovered wallets', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      await promise;

      expect(service.getDiscoveredWallets()).toHaveLength(1);

      service.clear();
      expect(service.getDiscoveredWallets()).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up resources', () => {
      const removeEventListenerSpy = vi.fn();
      getMockWindow().removeEventListener = removeEventListenerSpy;

      service = new SolanaDiscoveryService();
      service.discover(); // Start discovery but don't await

      // Cleanup immediately
      service.cleanup();

      // Check that cleanup was performed
      expect(service.getDiscoveredWallets()).toHaveLength(0);
    });

    it('should clear timeouts on cleanup', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      service = new SolanaDiscoveryService();
      service.discover(); // Start discovery but don't await

      // Cleanup immediately
      service.cleanup();

      // Verify that clearTimeout was called
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid provider objects', async () => {
      getMockWindow().solana = null;
      getMockWindow().solflare = 'not-an-object' as unknown as Partial<SolanaProvider>;
      getMockWindow().backpack = { solana: {} }; // Missing connect method

      service = new SolanaDiscoveryService();
      const promise = service.discover();
      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.injectedWallets).toHaveLength(0);
      expect(results.totalCount).toBe(0);
    });

    it('should handle wallet registration with invalid data', async () => {
      let registeredListener: ((event: CustomEvent) => void) | undefined;
      getMockWindow().addEventListener = vi.fn((event: string, listener: (event: CustomEvent) => void) => {
        if (event === 'wallet-standard:register') {
          registeredListener = listener;
        }
      });

      service = new SolanaDiscoveryService();
      const promise = service.discover();

      // Send invalid wallet data
      if (registeredListener) {
        const event = new CustomEvent('wallet-standard:register', {
          detail: { wallet: null },
        });
        registeredListener(event);

        const event2 = new CustomEvent('wallet-standard:register', {
          detail: { wallet: { chains: ['ethereum:1'] } }, // Non-Solana chain
        });
        registeredListener(event2);
      }

      await vi.advanceTimersByTimeAsync(500);
      const results = await promise;

      expect(results.walletStandardWallets).toHaveLength(0);
    });

    it('should handle concurrent discovery calls', async () => {
      const mockPhantom: Partial<SolanaProvider> = {
        isPhantom: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      getMockWindow().solana = mockPhantom;

      service = new SolanaDiscoveryService();

      // Start multiple discoveries concurrently
      const promises = Promise.all([service.discover(), service.discover(), service.discover()]);

      // Advance timers to complete all discoveries
      await vi.advanceTimersByTimeAsync(500);
      const [results1, results2, results3] = await promises;

      // All should return the same results
      expect(results1.totalCount).toBe(1);
      expect(results2.totalCount).toBe(1);
      expect(results3.totalCount).toBe(1);

      // But wallets should not be duplicated
      expect(service.getDiscoveredWallets()).toHaveLength(1);
    });
  });
});
