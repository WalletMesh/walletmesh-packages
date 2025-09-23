/**
 * Tests for EVM Discovery Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EVMDiscoveryService } from './EvmDiscoveryService.js';
import type { EIP6963ProviderDetail, EVMDiscoveryConfig } from './types.js';

describe('EVMDiscoveryService', () => {
  let service: EVMDiscoveryService;
  let mockLogger: {
    debug: vi.Mock;
    info: vi.Mock;
    warn: vi.Mock;
    error: vi.Mock;
  };

  beforeEach(() => {
    // Setup mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Setup fake timers for controlling timeouts
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create service with default config', () => {
      service = new EVMDiscoveryService();
      expect(service).toBeInstanceOf(EVMDiscoveryService);
    });

    it('should create service with custom config', () => {
      const config: EVMDiscoveryConfig = {
        enabled: false,
        eip6963Timeout: 500,
        preferEIP6963: false,
      };
      service = new EVMDiscoveryService(config, mockLogger);
      expect(service).toBeInstanceOf(EVMDiscoveryService);
    });
  });

  describe('discover', () => {
    beforeEach(() => {
      service = new EVMDiscoveryService(undefined, mockLogger);
    });

    it('should return empty results when disabled', async () => {
      service = new EVMDiscoveryService({ enabled: false }, mockLogger);

      const results = await service.discover();

      expect(results).toEqual({
        eip6963Wallets: [],
        eip1193Wallet: undefined,
        totalCount: 0,
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('EVM discovery disabled');
    });

    it('should skip discovery when not in browser environment', async () => {
      // Simulate non-browser environment
      const originalWindow = globalThis.window;
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
      });

      const results = await service.discover();

      expect(results.eip6963Wallets).toHaveLength(0);
      expect(results.eip1193Wallet).toBeUndefined();
      expect(results.totalCount).toBe(0);

      // Restore window
      globalThis.window = originalWindow;
    });

    describe('EIP-6963 discovery', () => {
      it('should discover EIP-6963 wallets', async () => {
        // Setup mock window with event handling
        const mockProvider = {
          request: vi.fn(),
        };

        const mockProviderDetail: EIP6963ProviderDetail = {
          info: {
            uuid: 'test-uuid',
            name: 'Test Wallet',
            icon: 'data:image/svg+xml,...',
            rdns: 'com.test.wallet',
          },
          provider: mockProvider,
        };

        // Setup event listener spy
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

        // Start discovery (don't await yet)
        const discoveryPromise = service.discover();

        // Simulate provider announcement
        const announceEvent = new CustomEvent('eip6963:announceProvider', {
          detail: mockProviderDetail,
        });

        // Get the handler that was registered
        const handler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'eip6963:announceProvider',
        )?.[1] as EventListener;

        if (handler) {
          handler(announceEvent);
        }

        // Advance timers to complete discovery (default timeout is 500ms)
        await vi.advanceTimersByTimeAsync(500);

        const results = await discoveryPromise;

        expect(results.eip6963Wallets).toHaveLength(1);
        expect(results.eip6963Wallets[0]).toMatchObject({
          id: 'com.test.wallet',
          name: 'Test Wallet',
          icon: 'data:image/svg+xml,...',
          type: 'eip6963',
          provider: mockProvider,
          metadata: {
            uuid: 'test-uuid',
            rdns: 'com.test.wallet',
          },
        });

        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'eip6963:requestProvider' }),
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith('eip6963:announceProvider', expect.any(Function));
      });

      it('should validate EIP-6963 provider structure', async () => {
        // Create service with mockLogger to capture warnings
        service = new EVMDiscoveryService({}, mockLogger);

        // Invalid provider details
        const invalidProviders = [
          { info: null, provider: {} }, // Missing info
          { info: { name: 'Test' }, provider: {} }, // Incomplete info
          { info: { uuid: '1', name: 'Test', icon: 'icon', rdns: 'com.test' }, provider: null }, // Missing provider
          { info: { uuid: '1', name: 'Test', icon: 'icon', rdns: 'com.test' }, provider: {} }, // Provider without request
        ];

        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

        // Start discovery
        const discoveryPromise = service.discover();

        // Get the handler
        const handler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'eip6963:announceProvider',
        )?.[1] as EventListener;

        // Send invalid providers
        for (const invalidProvider of invalidProviders) {
          const event = new CustomEvent('eip6963:announceProvider', {
            detail: invalidProvider,
          });
          if (handler) {
            handler(event);
          }
        }

        // Advance timers (default timeout is 500ms)
        await vi.advanceTimersByTimeAsync(500);

        const results = await discoveryPromise;

        // Should not include any invalid providers
        expect(results.eip6963Wallets).toHaveLength(0);
        expect(mockLogger.warn).toHaveBeenCalled();
      });
    });

    describe('EIP-1193 discovery', () => {
      it('should discover EIP-1193 provider from window.ethereum', async () => {
        // Use preferEIP6963: false to test EIP-1193 directly
        service = new EVMDiscoveryService({ preferEIP6963: false }, mockLogger);

        // Mock window.ethereum
        const mockEthereum = {
          request: vi.fn(),
          isMetaMask: true,
          version: '1.0.0',
        };

        Object.defineProperty(window, 'ethereum', {
          value: mockEthereum,
          writable: true,
          configurable: true,
        });

        const discoveryPromise = service.discover();
        await vi.advanceTimersByTimeAsync(500);
        const results = await discoveryPromise;

        expect(results.eip1193Wallet).toBeDefined();
        expect(results.eip1193Wallet).toMatchObject({
          id: 'eip1193-metamask',
          name: 'MetaMask',
          type: 'eip1193',
          provider: mockEthereum,
          metadata: {
            version: '1.0.0',
          },
        });

        // Cleanup
        (window as unknown as { ethereum?: unknown }).ethereum = undefined;
      });

      it('should identify different wallet brands', async () => {
        // Use preferEIP6963: false to test EIP-1193 directly
        service = new EVMDiscoveryService({ preferEIP6963: false }, mockLogger);

        const walletBrands = [
          { props: { isMetaMask: true }, expected: 'MetaMask' },
          { props: { isBraveWallet: true }, expected: 'Brave Wallet' },
          { props: { isCoinbaseWallet: true }, expected: 'Coinbase Wallet' },
          { props: { isRabby: true }, expected: 'Rabby Wallet' },
          { props: { isTokenPocket: true }, expected: 'TokenPocket' },
          { props: { isFrame: true }, expected: 'Frame' },
          { props: { isTrust: true }, expected: 'Trust Wallet' },
          { props: {}, expected: 'Unknown EVM Wallet' },
        ];

        for (const { props, expected } of walletBrands) {
          const mockEthereum = {
            request: vi.fn(),
            ...props,
          };

          Object.defineProperty(window, 'ethereum', {
            value: mockEthereum,
            writable: true,
            configurable: true,
          });

          const discoveryPromise = service.discover();
          await vi.advanceTimersByTimeAsync(500);
          const results = await discoveryPromise;

          expect(results.eip1193Wallet?.name).toBe(expected);

          // Cleanup
          (window as unknown as { ethereum?: unknown }).ethereum = undefined;
        }
      });

      it('should return null when window.ethereum is not present', async () => {
        // Use preferEIP6963: false with short timeout
        service = new EVMDiscoveryService(
          {
            preferEIP6963: false,
            eip6963Timeout: 50,
          },
          mockLogger,
        );

        // Ensure window.ethereum is not defined
        (window as unknown as { ethereum?: unknown }).ethereum = undefined;

        const discoveryPromise = service.discover();
        // Advance for EIP-6963 discovery that happens when EIP-1193 returns nothing
        await vi.advanceTimersByTimeAsync(50);
        const results = await discoveryPromise;

        expect(results.eip1193Wallet).toBeUndefined();
        expect(results.eip6963Wallets).toHaveLength(0);
        expect(mockLogger.debug).toHaveBeenCalledWith('No window.ethereum provider found');
      });
    });

    describe('discovery preference', () => {
      it('should prefer EIP-6963 when configured', async () => {
        service = new EVMDiscoveryService({ preferEIP6963: true, eip6963Timeout: 50 }, mockLogger);

        // Setup both EIP-6963 and EIP-1193 providers
        const mockEthereum = {
          request: vi.fn(),
          isMetaMask: true,
        };
        Object.defineProperty(window, 'ethereum', {
          value: mockEthereum,
          writable: true,
          configurable: true,
        });

        const mockProviderDetail: EIP6963ProviderDetail = {
          info: {
            uuid: 'test-uuid',
            name: 'EIP-6963 Wallet',
            icon: 'data:image/svg+xml,...',
            rdns: 'com.test.wallet',
          },
          provider: { request: vi.fn() },
        };

        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

        // Start discovery
        const discoveryPromise = service.discover();

        // Send EIP-6963 provider
        const handler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'eip6963:announceProvider',
        )?.[1] as EventListener;

        if (handler) {
          const event = new CustomEvent('eip6963:announceProvider', {
            detail: mockProviderDetail,
          });
          handler(event);
        }

        // Advance timers
        await vi.advanceTimersByTimeAsync(50);

        const results = await discoveryPromise;

        // Should have EIP-6963 wallet but not EIP-1193
        expect(results.eip6963Wallets).toHaveLength(1);
        expect(results.eip1193Wallet).toBeUndefined();

        // Cleanup
        (window as unknown as { ethereum?: unknown }).ethereum = undefined;
      });

      it('should fall back to EIP-1193 when no EIP-6963 wallets found', async () => {
        service = new EVMDiscoveryService({ preferEIP6963: true, eip6963Timeout: 50 }, mockLogger);

        // Only setup EIP-1193 provider
        const mockEthereum = {
          request: vi.fn(),
          isMetaMask: true,
        };
        Object.defineProperty(window, 'ethereum', {
          value: mockEthereum,
          writable: true,
          configurable: true,
        });

        // Start discovery (no EIP-6963 providers will respond)
        const discoveryPromise = service.discover();

        // Advance timers
        await vi.advanceTimersByTimeAsync(50);

        const results = await discoveryPromise;

        // Should fall back to EIP-1193
        expect(results.eip6963Wallets).toHaveLength(0);
        expect(results.eip1193Wallet).toBeDefined();
        expect(results.eip1193Wallet?.name).toBe('MetaMask');

        // Cleanup
        (window as unknown as { ethereum?: unknown }).ethereum = undefined;
      });
    });
  });

  describe('getAllWallets', () => {
    it('should return all discovered wallets as flat array', () => {
      service = new EVMDiscoveryService();

      const mockResults = {
        eip6963Wallets: [
          {
            id: 'wallet1',
            name: 'Wallet 1',
            icon: 'icon1',
            type: 'eip6963' as const,
            provider: {},
            metadata: {},
          },
          {
            id: 'wallet2',
            name: 'Wallet 2',
            icon: 'icon2',
            type: 'eip6963' as const,
            provider: {},
            metadata: {},
          },
        ],
        eip1193Wallet: {
          id: 'wallet3',
          name: 'Wallet 3',
          icon: 'icon3',
          type: 'eip1193' as const,
          provider: {},
          metadata: {},
        },
        totalCount: 3,
      };

      const allWallets = service.getAllWallets(mockResults);

      expect(allWallets).toHaveLength(3);
      expect(allWallets.map((w) => w.id)).toEqual(['wallet1', 'wallet2', 'wallet3']);
    });

    it('should handle results with no EIP-1193 wallet', () => {
      service = new EVMDiscoveryService();

      const mockResults = {
        eip6963Wallets: [
          {
            id: 'wallet1',
            name: 'Wallet 1',
            icon: 'icon1',
            type: 'eip6963' as const,
            provider: {},
            metadata: {},
          },
        ],
        eip1193Wallet: undefined,
        totalCount: 1,
      };

      const allWallets = service.getAllWallets(mockResults);

      expect(allWallets).toHaveLength(1);
      expect(allWallets[0].id).toBe('wallet1');
    });
  });
});
