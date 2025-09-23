/**
 * @file Tests for providers API exports
 */

import { describe, expect, it } from 'vitest';

describe('providers API exports', () => {
  it('should export BaseWalletProvider class', async () => {
    const module = await import('./providers.js');
    expect(module.BaseWalletProvider).toBeDefined();
    expect(typeof module.BaseWalletProvider).toBe('function');
  });

  it('should export EvmProvider class', async () => {
    const module = await import('./providers.js');
    expect(module.EvmProvider).toBeDefined();
    expect(typeof module.EvmProvider).toBe('function');
  });

  it('should export SolanaProvider class', async () => {
    const module = await import('./providers.js');
    expect(module.SolanaProvider).toBeDefined();
    expect(typeof module.SolanaProvider).toBe('function');
  });

  it('should not export AztecProvider class (deprecated)', async () => {
    const module = await import('./providers.js');
    // AztecProvider has been removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
    expect(module.AztecProvider).toBeUndefined();
  });

  it('should export ProviderRegistry class', async () => {
    const module = await import('./providers.js');
    expect(module.ProviderRegistry).toBeDefined();
    expect(typeof module.ProviderRegistry).toBe('function');
  });

  it('should export provider utility functions', async () => {
    const module = await import('./providers.js');
    expect(module.registerBuiltinProviders).toBeDefined();
    expect(module.ensureBuiltinProviders).toBeDefined();
    expect(typeof module.registerBuiltinProviders).toBe('function');
    expect(typeof module.ensureBuiltinProviders).toBe('function');
  });

  it('should export wrapper classes', async () => {
    const module = await import('./providers.js');
    expect(module.PublicProviderWrapper).toBeDefined();
    expect(module.WalletProviderFallbackWrapper).toBeDefined();
    expect(typeof module.PublicProviderWrapper).toBe('function');
    expect(typeof module.WalletProviderFallbackWrapper).toBe('function');
  });

  it('should have all expected provider exports', async () => {
    const module = await import('./providers.js');
    const exports = Object.keys(module);

    const expectedProviderExports = [
      'BaseWalletProvider',
      'EvmProvider',
      'SolanaProvider',
      // 'AztecProvider', // Removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
      'ProviderRegistry',
      'registerBuiltinProviders',
      'ensureBuiltinProviders',
      'PublicProviderWrapper',
      'WalletProviderFallbackWrapper',
    ];

    for (const expectedExport of expectedProviderExports) {
      expect(exports).toContain(expectedExport);
    }
  });

  it('should only export functions and constructors', async () => {
    const module = await import('./providers.js');
    const functionalExports = [
      'BaseWalletProvider',
      'EvmProvider',
      'SolanaProvider',
      'ProviderRegistry',
      'registerBuiltinProviders',
      'ensureBuiltinProviders',
      'PublicProviderWrapper',
      'WalletProviderFallbackWrapper',
      'ProviderAdapter',
      'AztecProviderAdapter',
      'EIP1193ProviderAdapter',
      'SolanaProviderAdapter',
      'DiscoveryTransport',
    ];

    for (const exportName of functionalExports) {
      if (module[exportName as keyof typeof module]) {
        const exportValue = module[exportName as keyof typeof module];
        expect(typeof exportValue).toBe('function');
      }
    }
  });
});
