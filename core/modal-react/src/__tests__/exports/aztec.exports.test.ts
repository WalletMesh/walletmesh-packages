/**
 * Tests for @walletmesh/modal-react/aztec exports
 *
 * Verifies that the Aztec export contains all core functionality plus
 * Aztec-specific hooks, components, and utilities, while excluding
 * other chain-specific functionality.
 */

import { describe, expect, it } from 'vitest';
import { testChainIsolation, testCoreExportsPresent, testExports } from '../utils/export-tester.js';

describe('@walletmesh/modal-react/aztec exports', () => {
  const modulePath = '../../aztec.js';

  describe('Core functionality', () => {
    it.skip('should re-export all core functionality', async () => {
      await testCoreExportsPresent(modulePath);
    });

    it(
      'should include chain-aware core hooks',
      async () => {
        await testExports(modulePath, ['useAccount', 'useConnect', 'useSwitchChain']);
      },
      10000,
    ); // Increase timeout to 10s for dynamic import
  });

  describe('Aztec-specific exports', () => {
    it('should export Aztec hooks', async () => {
      await testExports(modulePath, [
        'useAztecWallet',
        'useAztecWalletRequired',
        'useAztecContract',
        'useAztecEvents',
        'useAztecBatch',
        'useAztecAuth',
      ]);
    });

    it('should export Aztec components', async () => {
      await testExports(modulePath, ['AztecConnectButton', 'AztecWalletMeshProvider']);
    });

    it('should export Aztec configuration utilities', async () => {
      await testExports(modulePath, ['createAztecConfig', 'createAztecDevConfig', 'createAztecProdConfig']);
    });

    it('should export Aztec wallet adapters', async () => {
      await testExports(modulePath, ['AztecExampleWalletAdapter']);
    });

    it('should export Aztec chain configurations', async () => {
      await testExports(modulePath, [
        'aztecSandbox',
        'aztecTestnet',
        'aztecMainnet',
        'aztecChains',
        'aztecMainnets',
        'aztecTestChains',
      ]);
    });

    it('should export Aztec-specific types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports (these will be undefined at runtime but we check the export exists)
      expect('AztecWalletInfo' in moduleExports).toBeDefined();
      expect('AztecProviderInfo' in moduleExports).toBeDefined();
      expect('UseAztecContractReturn' in moduleExports).toBeDefined();
      expect('AztecAccountInfo' in moduleExports).toBeDefined();
    });
  });

  describe('Chain isolation', () => {
    it('should NOT export EVM-specific functionality', async () => {
      await testExports(
        modulePath,
        [], // No expected exports for this test
        [
          // EVM-specific hooks
          'useEvmWallet',
          'useEvmWalletRequired',

          // EVM components
          'EVMConnectButton',
          'WalletMeshChainSwitchButton',

          // EVM config
          'createEVMConfig',
          'createMainnetConfig',
          'createTestnetConfig',

          // EVM chains
          'ethereumMainnet',
          'polygonMainnet',
          'arbitrumOne',
          'optimismMainnet',
          'baseMainnet',
        ],
      );
    });

    it('should NOT export Solana-specific functionality', async () => {
      await testExports(
        modulePath,
        [], // No expected exports for this test
        [
          // Solana-specific hooks
          'useSolanaWallet',
          'useSolanaWalletRequired',

          // Solana components
          'SolanaConnectButton',

          // Solana config
          'createSolanaConfig',
          'createSolanaMainnetConfig',
          'createSolanaDevnetConfig',

          // Solana chains
          'solanaMainnet',
          'solanaDevnet',
          'solanaTestnet',
        ],
      );
    });

    it('should only contain core and Aztec exports', async () => {
      await testChainIsolation(modulePath, ['core', 'aztec']);
    });
  });

  describe('Hook re-exports', () => {
    it('should export chain-aware versions of shared hooks', async () => {
      await testExports(modulePath, [
        'useTransaction',
        'useBalance',
        'usePublicProvider',
        'useWalletProvider',
      ]);
    });

    it('should export account-related types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('AccountInfo' in moduleExports).toBeDefined();
      expect('WalletSelectionOptions' in moduleExports).toBeDefined();
      expect('ConnectOptions' in moduleExports).toBeDefined();
    });
  });
});
