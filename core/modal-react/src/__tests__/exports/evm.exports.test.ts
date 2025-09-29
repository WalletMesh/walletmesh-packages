/**
 * Tests for @walletmesh/modal-react/evm exports
 *
 * Verifies that the EVM export contains all core functionality plus
 * EVM-specific hooks, components, and utilities, while excluding
 * other chain-specific functionality.
 */

import { describe, expect, it } from 'vitest';
import { testChainIsolation, testCoreExportsPresent, testExports } from '../utils/export-tester.js';

describe('@walletmesh/modal-react/evm exports', () => {
  const modulePath = '../../evm.js';

  describe('Core functionality', () => {
    it('should re-export all core functionality', async () => {
      await testCoreExportsPresent(modulePath);
    });

    it('should include chain-aware core hooks', async () => {
      await testExports(modulePath, ['useAccount', 'useConnect', 'useSwitchChain']);
    });
  });

  describe('EVM-specific exports', () => {
    it('should export EVM hooks', async () => {
      await testExports(modulePath, [
        'useEvmWallet',
        'useEvmWalletRequired',
        'useBalance',
        'useTransaction',
        'usePublicProvider',
        'useWalletProvider',
      ]);
    });

    it('should export EVM components', async () => {
      await testExports(modulePath, ['EVMConnectButton', 'WalletMeshChainSwitchButton']);
    });

    it('should export EVM configuration utilities', async () => {
      await testExports(modulePath, ['createEVMConfig', 'createMainnetConfig', 'createTestnetConfig']);
    });

    it('should export EVM provider', async () => {
      await testExports(modulePath, ['EvmProvider']);
    });

    it('should export EVM chain configurations', async () => {
      await testExports(modulePath, [
        // Individual chains
        'ethereumMainnet',
        'ethereumSepolia',
        'ethereumHolesky',
        'polygonMainnet',
        'polygonAmoy',
        'arbitrumOne',
        'arbitrumSepolia',
        'optimismMainnet',
        'optimismSepolia',
        'baseMainnet',
        'baseSepolia',

        // Chain arrays
        'evmMainnets',
        'evmTestnets',
        'evmChains',
      ]);
    });

    it('should export EVM chain helper functions', async () => {
      await testExports(modulePath, [
        'createEvmMainnetConfig',
        'createEvmTestnetConfig',
        'createAllChainsConfig',
        'markChainsRequired',
        'filterChainsByGroup',
        'isChainSupported',
        'getRequiredChains',
      ]);
    });

    it('should export EVM-specific types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('EvmWalletInfo' in moduleExports).toBeDefined();
      expect('EVMTransactionParams' in moduleExports).toBeDefined();
      expect('TokenInfo' in moduleExports).toBeDefined();
      expect('BalanceInfo' in moduleExports).toBeDefined();
      expect('TransactionRequest' in moduleExports).toBeDefined();
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

    it('should only contain core and EVM exports', async () => {
      await testChainIsolation(modulePath, ['core', 'evm']);
    });
  });

  describe('Hook re-exports', () => {
    it('should export transaction types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('TransactionStatus' in moduleExports).toBeDefined();
      expect('TransactionError' in moduleExports).toBeDefined();
      expect('UseTransactionReturn' in moduleExports).toBeDefined();
    });

    it('should export balance types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('UseBalanceOptions' in moduleExports).toBeDefined();
      expect('UseBalanceReturn' in moduleExports).toBeDefined();
    });

    it('should export provider types', async () => {
      const moduleExports = await import(modulePath);

      // Check for type exports
      expect('PublicProviderInfo' in moduleExports).toBeDefined();
      expect('WalletProviderInfo' in moduleExports).toBeDefined();
    });
  });
});
