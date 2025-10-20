/**
 * Integration tests for chain-specific usage
 *
 * Verifies that components and hooks from chain-specific imports
 * work correctly in realistic usage scenarios.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock modal-core - comment out to use global mock from setup
// Note: This test file doesn't need special mocks, so we'll rely on the global mock from setup.ts

describe('Chain-specific usage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Aztec-specific imports', () => {
    // NOTE: Provider rendering test removed to prevent OOM issues
    // The AztecWalletMeshProvider rendering is tested elsewhere with proper mocks
    // This test suite focuses on configuration utilities and imports

    it('should provide Aztec configuration utilities', async () => {
      const { createAztecConfig } = await import('../../aztec.js');

      const config = createAztecConfig({
        appName: 'Test App',
        chains: [{ chainId: 'aztec:31337', required: false, label: 'Sandbox' }],
      });

      expect(config.appName).toBe('Test App');
      expect(config.chains).toBeDefined();
      expect(config.chains?.[0]?.chainId).toBe('aztec:31337');
    });

    it('should have Aztec chain configurations', async () => {
      const aztecModule = await import('../../aztec.js');

      expect(aztecModule.aztecSandbox).toBeDefined();
      expect(aztecModule.aztecSandbox.chainId).toBe('aztec:31337');
    });
  });

  describe('EVM-specific imports', () => {
    it('should provide EVM configuration utilities', async () => {
      const { createEVMConfig } = await import('../../evm.js');

      const config = createEVMConfig({
        appName: 'Test EVM App',
        chains: ['ethereum', 'polygon'],
      });

      expect(config.appName).toBe('Test EVM App');
      expect(config.chains).toBeDefined();
      expect(Array.isArray(config.chains)).toBe(true);
    });

    it('should have EVM chain configurations', async () => {
      const evmModule = await import('../../evm.js');

      expect(evmModule.ethereumMainnet).toBeDefined();
      expect(evmModule.polygonMainnet).toBeDefined();
      expect(evmModule.arbitrumOne).toBeDefined();
    });

    it('should export EVM chain helper functions', async () => {
      const evmModule = await import('../../evm.js');

      expect(typeof evmModule.createAllChainsConfig).toBe('function');
      expect(typeof evmModule.isChainSupported).toBe('function');
      expect(typeof evmModule.getRequiredChains).toBe('function');
    });
  });

  describe('Solana-specific imports', () => {
    it('should provide Solana configuration utilities', async () => {
      const { createSolanaConfig } = await import('../../solana.js');

      const config = createSolanaConfig({
        appName: 'Test Solana App',
        network: 'mainnet-beta',
      });

      expect(config.appName).toBe('Test Solana App');
      expect(config.chains).toBeDefined();
    });

    it('should have Solana chain configurations', async () => {
      const solanaModule = await import('../../solana.js');

      expect(solanaModule.solanaMainnet).toBeDefined();
      expect(solanaModule.solanaDevnet).toBeDefined();
      expect(solanaModule.solanaTestnet).toBeDefined();
    });
  });

  describe('Multi-chain imports from /all', () => {
    it('should have all chain configurations from /all export', async () => {
      const allModule = await import('../../all.js');

      // Should have Aztec chains
      expect(allModule.aztecSandbox).toBeDefined();
      expect(allModule.aztecMainnet).toBeDefined();

      // Should have EVM chains
      expect(allModule.ethereumMainnet).toBeDefined();
      expect(allModule.polygonMainnet).toBeDefined();

      // Should have Solana chains
      expect(allModule.solanaMainnet).toBeDefined();
      expect(allModule.solanaDevnet).toBeDefined();
    });

    it('should have all chain-specific hooks from /all export', async () => {
      const allModule = await import('../../all.js');

      // Should have Aztec hooks
      expect(typeof allModule.useAztecWallet).toBe('function');
      expect(typeof allModule.useAztecContract).toBe('function');

      // Should have EVM hooks
      expect(typeof allModule.useEvmWallet).toBe('function');

      // Should have Solana hooks
      expect(typeof allModule.useSolanaWallet).toBe('function');
    });

    it('should have all configuration utilities from /all export', async () => {
      const allModule = await import('../../all.js');

      // Should have all config creators
      expect(typeof allModule.createAztecConfig).toBe('function');
      expect(typeof allModule.createEVMConfig).toBe('function');
      expect(typeof allModule.createSolanaConfig).toBe('function');
    });
  });

  describe('Core-only imports', () => {
    it('should not have any chain-specific functionality', async () => {
      const coreModule = await import('../../core.js');

      // Should NOT have chain-specific hooks
      expect((coreModule as unknown as Record<string, unknown>)['useAztecWallet']).toBeUndefined();
      expect((coreModule as unknown as Record<string, unknown>)['useEvmWallet']).toBeUndefined();
      expect((coreModule as unknown as Record<string, unknown>)['useSolanaWallet']).toBeUndefined();

      // Should NOT have chain-specific configs
      expect((coreModule as unknown as Record<string, unknown>)['createAztecConfig']).toBeUndefined();
      expect((coreModule as unknown as Record<string, unknown>)['createEVMConfig']).toBeUndefined();
      expect((coreModule as unknown as Record<string, unknown>)['createSolanaConfig']).toBeUndefined();

      // Should have core functionality
      expect(typeof coreModule.WalletMeshProvider).toBe('function');
      expect(typeof coreModule.useConfig).toBe('function');
      expect(typeof coreModule.useTheme).toBe('function');
    });
  });
});
