/**
 * Tests for @walletmesh/modal-react/solana exports
 *
 * Verifies that the Solana export contains all core functionality plus
 * Solana-specific hooks, components, and utilities, while excluding
 * other chain-specific functionality.
 */

import { describe, expect, it } from 'vitest';
import { testChainIsolation, testCoreExportsPresent, testExports } from '../utils/export-tester.js';

describe('@walletmesh/modal-react/solana exports', () => {
  const modulePath = '../../solana.js';

  describe('Core functionality', () => {
    it(
      'should re-export all core functionality',
      async () => {
        await testCoreExportsPresent(modulePath);
      },
      10000,
    ); // Increase timeout to 10s for dynamic import

    it('should include chain-aware core hooks', async () => {
      await testExports(modulePath, ['useAccount', 'useConnect', 'useSwitchChain']);
    });
  });

  describe('Solana-specific exports', () => {
    it('should export Solana hooks', async () => {
      await testExports(modulePath, [
        'useSolanaWallet',
        'useSolanaWalletRequired',
        'useTransaction',
        'usePublicProvider',
        'useWalletProvider',
        'useBalance',
      ]);
    });

    it('should export Solana components', async () => {
      await testExports(modulePath, ['SolanaConnectButton']);
    });

    it('should export Solana configuration utilities', async () => {
      await testExports(modulePath, [
        'createSolanaConfig',
        'createSolanaMainnetConfig',
        'createSolanaDevnetConfig',
      ]);
    });

    it('should export Solana chain configurations', async () => {
      await testExports(modulePath, [
        'solanaMainnet',
        'solanaDevnet',
        'solanaTestnet',
        'solanaChains',
        'solanaMainnets',
        'solanaTestChains',
      ]);
    });

    it('should export Solana-specific types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('SolanaWalletInfo' in moduleExports).toBeDefined();
      expect('SolanaTransactionParams' in moduleExports).toBeDefined();
    });
  });

  describe('Chain isolation', () => {
    it('should NOT export Aztec-specific functionality', async () => {
      await testExports(
        modulePath,
        [], // No expected exports for this test
        [
          // Aztec-specific hooks
          'useAztecWallet',
          'useAztecWalletRequired',
          'useAztecContract',
          'useAztecEvents',
          'useAztecBatch',
          'useAztecAuth',

          // Aztec components
          'AztecConnectButton',
          'AztecWalletMeshProvider',

          // Aztec config
          'createAztecConfig',
          'createAztecDevConfig',
          'createAztecProdConfig',

          // Aztec chains
          'aztecSandbox',
          'aztecTestnet',
          'aztecMainnet',
        ],
      );
    });

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

          // EVM config (note: Solana has its own versions)
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

    it('should only contain core and Solana exports', async () => {
      await testChainIsolation(modulePath, ['core', 'solana']);
    });
  });

  describe('Hook re-exports', () => {
    it('should export transaction types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('TransactionRequest' in moduleExports).toBeDefined();
      expect('TransactionResult' in moduleExports).toBeDefined();
      expect('TransactionStatus' in moduleExports).toBeDefined();
      expect('UseTransactionReturn' in moduleExports).toBeDefined();
    });

    it('should export provider types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('PublicProviderInfo' in moduleExports).toBeDefined();
      expect('WalletProviderInfo' in moduleExports).toBeDefined();
    });

    it('should export balance types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('TokenInfo' in moduleExports).toBeDefined();
      expect('UseBalanceOptions' in moduleExports).toBeDefined();
      expect('UseBalanceReturn' in moduleExports).toBeDefined();
      expect('BalanceInfo' in moduleExports).toBeDefined();
    });
  });
});
