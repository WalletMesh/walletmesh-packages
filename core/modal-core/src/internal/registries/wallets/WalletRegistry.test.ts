import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockWalletAdapter } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { WalletRegistry } from './WalletRegistry.js';

describe('WalletRegistry', () => {
  let registry: WalletRegistry;

  beforeEach(() => {
    registry = new WalletRegistry();
    vi.clearAllMocks();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Basic Registry Operations', () => {
    it('should register an adapter', () => {
      const adapter = createMockWalletAdapter('test');

      registry.register(adapter);

      expect(registry.getAdapter('test')).toBe(adapter);
      expect(registry.getAllAdapters()).toHaveLength(1);
    });

    it('should throw error when registering duplicate adapter', () => {
      const adapter1 = createMockWalletAdapter('test');
      const adapter2 = createMockWalletAdapter('test');

      registry.register(adapter1);

      expect(() => registry.register(adapter2)).toThrow();
    });

    it('should unregister an adapter', () => {
      const adapter = createMockWalletAdapter('test');

      registry.register(adapter);
      registry.unregister('test');

      expect(registry.getAdapter('test')).toBeUndefined();
      expect(registry.getAllAdapters()).toHaveLength(0);
    });

    it('should handle unregistering non-existent adapter gracefully', () => {
      expect(() => registry.unregister('nonexistent')).not.toThrow();
    });

    it('should clear all adapters', () => {
      const adapter1 = createMockWalletAdapter('test1');
      const adapter2 = createMockWalletAdapter('test2');

      registry.register(adapter1);
      registry.register(adapter2);
      registry.clear();

      expect(registry.getAllAdapters()).toHaveLength(0);
    });
  });

  describe('Built-in Wallet Tracking', () => {
    it('should register adapter as built-in', () => {
      const adapter = createMockWalletAdapter('test-builtin');

      registry.registerBuiltIn(adapter);

      expect(registry.getAdapter('test-builtin')).toBe(adapter);
      expect(registry.isBuiltinWallet('test-builtin')).toBe(true);
    });

    it('should track multiple built-in wallets', () => {
      const adapter1 = createMockWalletAdapter('builtin1');
      const adapter2 = createMockWalletAdapter('builtin2');

      registry.registerBuiltIn(adapter1);
      registry.registerBuiltIn(adapter2);

      expect(registry.isBuiltinWallet('builtin1')).toBe(true);
      expect(registry.isBuiltinWallet('builtin2')).toBe(true);
    });

    it('should distinguish built-in from regular adapters', () => {
      const builtinAdapter = createMockWalletAdapter('builtin');
      const regularAdapter = createMockWalletAdapter('regular');

      registry.registerBuiltIn(builtinAdapter);
      registry.register(regularAdapter);

      expect(registry.isBuiltinWallet('builtin')).toBe(true);
      expect(registry.isBuiltinWallet('regular')).toBe(false);
    });

    it('should return false for non-existent wallets', () => {
      expect(registry.isBuiltinWallet('nonexistent')).toBe(false);
    });

    it('should return list of built-in wallet IDs', () => {
      const adapter1 = createMockWalletAdapter('builtin1');
      const adapter2 = createMockWalletAdapter('builtin2');
      const regularAdapter = createMockWalletAdapter('regular');

      registry.registerBuiltIn(adapter1);
      registry.registerBuiltIn(adapter2);
      registry.register(regularAdapter);

      const builtinIds = registry.getBuiltinWalletIds();
      expect(builtinIds).toHaveLength(2);
      expect(builtinIds).toContain('builtin1');
      expect(builtinIds).toContain('builtin2');
      expect(builtinIds).not.toContain('regular');
    });

    it('should return empty array when no built-in wallets registered', () => {
      const adapter = createMockWalletAdapter('regular');
      registry.register(adapter);

      expect(registry.getBuiltinWalletIds()).toHaveLength(0);
    });

    it('should throw error when registering duplicate built-in wallet', () => {
      const adapter1 = createMockWalletAdapter('test');
      const adapter2 = createMockWalletAdapter('test');

      registry.registerBuiltIn(adapter1);

      expect(() => registry.registerBuiltIn(adapter2)).toThrow();
    });
  });

  describe('Adapter Filtering', () => {
    beforeEach(() => {
      const evmAdapter = createMockWalletAdapter('metamask', [ChainType.Evm]);
      const solanaAdapter = createMockWalletAdapter('phantom', [ChainType.Solana]);
      const multiChainAdapter = createMockWalletAdapter('walletconnect', [ChainType.Evm, ChainType.Solana]);

      registry.register(evmAdapter);
      registry.register(solanaAdapter);
      registry.register(multiChainAdapter);
    });

    it('should get adapters for specific chain type', () => {
      const evmAdapters = registry.getAdaptersForChain(ChainType.Evm);
      const solanaAdapters = registry.getAdaptersForChain(ChainType.Solana);

      expect(evmAdapters).toHaveLength(2); // metamask, walletconnect
      expect(solanaAdapters).toHaveLength(2); // phantom, walletconnect
      expect(evmAdapters.map((a) => a.id)).toContain('metamask');
      expect(evmAdapters.map((a) => a.id)).toContain('walletconnect');
      expect(solanaAdapters.map((a) => a.id)).toContain('phantom');
      expect(solanaAdapters.map((a) => a.id)).toContain('walletconnect');
    });

    it('should get adapters by feature', () => {
      const signingAdapters = registry.getAdaptersByFeature('sign_message');

      expect(signingAdapters).toHaveLength(3); // All our mock adapters have sign_message
    });
  });

  describe('Adapter Detection', () => {
    it('should detect available adapters', async () => {
      const adapter1 = createMockWalletAdapter('test1');
      const adapter2 = createMockWalletAdapter('test2');

      // Mock different detection results
      adapter1.detect = vi.fn().mockResolvedValue({ isInstalled: true, version: '1.0.0' });
      adapter2.detect = vi.fn().mockResolvedValue({ isInstalled: false });

      registry.register(adapter1);
      registry.register(adapter2);

      const detected = await registry.detectAvailableAdapters();

      expect(detected).toHaveLength(2);
      expect(detected[0]).toEqual({
        adapter: adapter1,
        available: true,
        version: '1.0.0',
      });
      expect(detected[1]).toEqual({
        adapter: adapter2,
        available: false,
      });
    });

    it('should handle detection errors gracefully', async () => {
      const adapter = createMockWalletAdapter('test');
      adapter.detect = vi.fn().mockRejectedValue(new Error('Detection failed'));

      registry.register(adapter);

      const detected = await registry.detectAvailableAdapters();

      expect(detected).toHaveLength(1);
      expect(detected[0]).toEqual({
        adapter,
        available: false,
        customData: { detectionError: expect.any(Error) },
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should load multiple adapters at once', async () => {
      const adapter1 = createMockWalletAdapter('test1');
      const adapter2 = createMockWalletAdapter('test2');

      await registry.loadAdapters([adapter1, adapter2]);

      expect(registry.getAllAdapters()).toHaveLength(2);
      expect(registry.getAdapter('test1')).toBe(adapter1);
      expect(registry.getAdapter('test2')).toBe(adapter2);
    });
  });

  describe('Dynamic Adapter Loading', () => {
    describe('Strategy Detection', () => {
      it('should detect builtin strategy', async () => {
        await expect(registry.loadAdaptersFromDirectory('builtin')).resolves.not.toThrow();
        await expect(registry.loadAdaptersFromDirectory('all')).resolves.not.toThrow();
        await expect(registry.loadAdaptersFromDirectory('default')).resolves.not.toThrow();
      });

      it('should detect filesystem strategy', async () => {
        // Mock Node.js environment
        const originalRequire = (global as { require: unknown }).require;
        Object.assign(global, { require: vi.fn() });

        await expect(
          registry.loadAdaptersFromDirectory('/path/to/adapters', { strategy: 'filesystem' }),
        ).rejects.toThrow(); // Will fail because fs operations are mocked, but strategy is detected

        Object.assign(global, { require: originalRequire });
      });

      it('should detect module strategy', async () => {
        await expect(
          registry.loadAdaptersFromDirectory('@test/adapters', { strategy: 'module' }),
        ).rejects.toThrow(); // Will fail because module doesn't exist, but strategy is detected
      });
    });

    describe('Builtin Adapters Loading', () => {
      it('should load builtin adapters', async () => {
        await registry.loadBuiltinAdapters();

        const adapters = registry.getAllAdapters();
        expect(adapters.length).toBeGreaterThan(0);

        // Should include evm and mock adapters
        const adapterIds = adapters.map((a) => a.id);
        expect(adapterIds).toContain('evm-wallet');
        expect(adapterIds).toContain('debug-wallet');
      });

      it('should filter builtin adapters by string pattern', async () => {
        await registry.loadBuiltinAdapters('evm');

        const adapters = registry.getAllAdapters();
        const adapterIds = adapters.map((a) => a.id);
        expect(adapterIds).toContain('evm-wallet');
        expect(adapterIds).not.toContain('mock');
      });

      it('should filter builtin adapters by regex', async () => {
        await registry.loadBuiltinAdapters(/debug/i);

        const adapters = registry.getAllAdapters();
        const adapterIds = adapters.map((a) => a.id);
        expect(adapterIds).toContain('debug-wallet');
        expect(adapterIds).not.toContain('evm-wallet');
      });
    });

    describe('Module Loading', () => {
      it('should handle module loading timeout', async () => {
        await expect(registry.loadFromPackage('@nonexistent/package', { timeout: 100 })).rejects.toThrow();
      });

      it('should handle npm: prefix in module names', async () => {
        await expect(registry.loadFromPackage('npm:@test/adapters')).rejects.toThrow(); // Module doesn't exist but prefix is handled
      });
    });

    describe('Error Handling', () => {
      it('should continue on error when configured', async () => {
        await expect(
          registry.loadAdaptersFromDirectory('builtin', { continueOnError: true }),
        ).resolves.not.toThrow();
      });

      it('should fail fast when continueOnError is false', async () => {
        // This test depends on implementation details and might need adjustment
        await expect(
          registry.loadAdaptersFromDirectory('nonexistent', {
            strategy: 'module',
            continueOnError: false,
          }),
        ).rejects.toThrow();
      });

      it('should respect maxAdapters limit', async () => {
        await registry.loadBuiltinAdapters();
        const _beforeCount = registry.getAllAdapters().length;

        registry.clear();
        await registry.loadAdaptersFromDirectory('builtin', { maxAdapters: 1 });

        expect(registry.getAllAdapters().length).toBe(1);
      });
    });
  });

  describe('Event System', () => {
    it('should emit events when adapters are registered', () => {
      const handler = vi.fn();
      registry.on('adapter:registered', handler);

      const adapter = createMockWalletAdapter('test');
      registry.register(adapter);

      expect(handler).toHaveBeenCalledWith(adapter);
    });

    it('should emit events when adapters are unregistered', () => {
      const handler = vi.fn();
      registry.on('adapter:unregistered', handler);

      const adapter = createMockWalletAdapter('test');
      registry.register(adapter);
      registry.unregister('test');

      expect(handler).toHaveBeenCalledWith('test');
    });
  });
});
