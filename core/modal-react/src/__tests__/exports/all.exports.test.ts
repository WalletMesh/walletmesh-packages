/**
 * Tests for @walletmesh/modal-react/all exports
 *
 * Verifies that the "all" export contains the complete functionality
 * from all chains (core + Aztec + EVM + Solana).
 */

import { describe, expect, it } from 'vitest';
import { testCoreExportsPresent, testExports } from '../utils/export-tester.js';

describe('@walletmesh/modal-react/all exports', () => {
  const modulePath = '../../all.js';

  describe('Core functionality', () => {
    it('should include all core exports', async () => {
      await testCoreExportsPresent(modulePath);
    });

    it('should include chain-aware core hooks', async () => {
      await testExports(modulePath, ['useAccount', 'useConnect', 'useSwitchChain']);
    }, 10000); // Increase timeout to 10s for dynamic import
  });

  describe('Aztec functionality', () => {
    it('should include all Aztec hooks', async () => {
      await testExports(modulePath, [
        'useAztecWallet',
        'useAztecWalletRequired',
        'useAztecContract',
        'useAztecEvents',
        'useAztecBatch',
        'useAztecAuth',
      ]);
    });

    it('should include Aztec components and config', async () => {
      await testExports(modulePath, [
        'AztecConnectButton',
        'AztecWalletMeshProvider',
        'createAztecConfig',
        'createAztecDevConfig',
        'createAztecProdConfig',
        'AztecExampleWalletAdapter',
      ]);
    });

    it('should include Aztec chains', async () => {
      await testExports(modulePath, ['aztecSandbox', 'aztecTestnet', 'aztecMainnet', 'aztecChains']);
    });
  });

  describe('EVM functionality', () => {
    it('should include all EVM hooks', async () => {
      await testExports(modulePath, [
        'useEvmWallet',
        'useEvmWalletRequired',
        'useBalance',
        'useTransaction',
        'usePublicProvider',
        'useWalletProvider',
      ]);
    });

    it('should include EVM components and config', async () => {
      await testExports(modulePath, [
        'EVMConnectButton',
        'WalletMeshChainSwitchButton',
        'createEVMConfig',
        'createMainnetConfig',
        'createTestnetConfig',
        'EvmProvider',
      ]);
    });

    it('should include EVM chains', async () => {
      await testExports(modulePath, [
        'ethereumMainnet',
        'ethereumSepolia',
        'polygonMainnet',
        'arbitrumOne',
        'optimismMainnet',
        'baseMainnet',
        'evmMainnets',
        'evmTestnets',
        'evmChains',
      ]);
    });
  });

  describe('Solana functionality', () => {
    it('should include all Solana hooks', async () => {
      await testExports(modulePath, ['useSolanaWallet', 'useSolanaWalletRequired']);
    });

    it('should include Solana components and config', async () => {
      await testExports(modulePath, [
        'SolanaConnectButton',
        'createSolanaConfig',
        'createSolanaMainnetConfig',
        'createSolanaDevnetConfig',
      ]);
    });

    it('should include Solana chains', async () => {
      await testExports(modulePath, ['solanaMainnet', 'solanaDevnet', 'solanaTestnet', 'solanaChains']);
    });
  });

  describe('Shared functionality', () => {
    it('should include shared hooks from all chains', async () => {
      // These hooks are exported by multiple chains
      // The "all" export should have them available
      await testExports(modulePath, [
        'useTransaction',
        'useBalance',
        'usePublicProvider',
        'useWalletProvider',
      ]);
    });
  });

  describe('Complete coverage', () => {
    it('should be the union of all chain exports', async () => {
      // Import all modules
      const allExports = await import(modulePath);
      const coreExports = await import('../../core.js');
      const aztecExports = await import('../../aztec.js');
      const evmExports = await import('../../evm.js');
      const solanaExports = await import('../../solana.js');

      // Get all export names
      const allExportNames = Object.keys(allExports);

      // Verify that all exports has at least as many exports as any individual module
      const coreExportCount = Object.keys(coreExports).length;
      const aztecSpecificCount = Object.keys(aztecExports).filter(
        (key) => !Object.hasOwn(coreExports, key),
      ).length;
      const evmSpecificCount = Object.keys(evmExports).filter(
        (key) => !Object.hasOwn(coreExports, key),
      ).length;
      const solanaSpecificCount = Object.keys(solanaExports).filter(
        (key) => !Object.hasOwn(coreExports, key),
      ).length;

      // The all export should have most exports (some may overlap)
      expect(allExportNames.length).toBeGreaterThanOrEqual(coreExportCount);
      expect(allExportNames.length).toBeGreaterThanOrEqual(
        coreExportCount + Math.max(aztecSpecificCount, evmSpecificCount, solanaSpecificCount),
      );
    });
  });
});
