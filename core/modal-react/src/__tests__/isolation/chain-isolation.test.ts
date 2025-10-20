/**
 * Chain isolation tests
 *
 * Verifies that importing from chain-specific modules doesn't pull in
 * dependencies from other chains, ensuring proper code splitting and
 * bundle size optimization.
 */

import { describe, expect, it } from 'vitest';

describe('Chain isolation', () => {
  describe('Aztec isolation', () => {
    it.skip('should not import EVM-specific code', async () => {
      const aztecModule = await import('../../aztec.js');
      const exports = Object.keys(aztecModule);

      // Check that no EVM-specific patterns are in the exports
      const evmPatterns = ['EVMConnect', 'useEvmWallet', 'ethereumMainnet', 'polygonMainnet'];
      for (const pattern of evmPatterns) {
        const hasEvmExport = exports.some((exp) => exp.includes(pattern));
        expect(hasEvmExport, `Found unexpected EVM export containing "${pattern}"`).toBe(false);
      }
    });

    it(
      'should not import Solana-specific code',
      async () => {
        const aztecModule = await import('../../aztec.js');
        const exports = Object.keys(aztecModule);

        // Check that no Solana-specific patterns are in the exports
        const solanaPatterns = ['SolanaConnect', 'useSolanaWallet', 'solanaMainnet', 'solanaDevnet'];
        for (const pattern of solanaPatterns) {
          const hasSolanaExport = exports.some((exp) => exp.includes(pattern));
          expect(hasSolanaExport, `Found unexpected Solana export containing "${pattern}"`).toBe(false);
        }
      },
      15000,
    ); // Increase timeout to 15s for dynamic import
  });

  describe('EVM isolation', () => {
    it('should not import Aztec-specific code', async () => {
      const evmModule = await import('../../evm.js');
      const exports = Object.keys(evmModule);

      // Check that no Aztec-specific patterns are in the exports
      const aztecPatterns = ['AztecConnect', 'useAztecWallet', 'aztecSandbox', 'useAztecContract'];
      for (const pattern of aztecPatterns) {
        const hasAztecExport = exports.some((exp) => exp.includes(pattern));
        expect(hasAztecExport, `Found unexpected Aztec export containing "${pattern}"`).toBe(false);
      }
    });

    it('should not import Solana-specific code', async () => {
      const evmModule = await import('../../evm.js');
      const exports = Object.keys(evmModule);

      // Check that no Solana-specific patterns are in the exports
      const solanaPatterns = ['SolanaConnect', 'useSolanaWallet', 'solanaMainnet'];
      for (const pattern of solanaPatterns) {
        const hasSolanaExport = exports.some((exp) => exp.includes(pattern));
        expect(hasSolanaExport, `Found unexpected Solana export containing "${pattern}"`).toBe(false);
      }
    });
  });

  describe('Solana isolation', () => {
    it('should not import Aztec-specific code', async () => {
      const solanaModule = await import('../../solana.js');
      const exports = Object.keys(solanaModule);

      // Check that no Aztec-specific patterns are in the exports
      const aztecPatterns = ['AztecConnect', 'useAztecWallet', 'aztecSandbox', 'useAztecContract'];
      for (const pattern of aztecPatterns) {
        const hasAztecExport = exports.some((exp) => exp.includes(pattern));
        expect(hasAztecExport, `Found unexpected Aztec export containing "${pattern}"`).toBe(false);
      }
    });

    it('should not import EVM-specific code', async () => {
      const solanaModule = await import('../../solana.js');
      const exports = Object.keys(solanaModule);

      // Check that no EVM-specific patterns are in the exports
      const evmPatterns = ['EVMConnect', 'useEvmWallet', 'ethereumMainnet', 'polygonMainnet'];
      for (const pattern of evmPatterns) {
        const hasEvmExport = exports.some((exp) => exp.includes(pattern));
        expect(hasEvmExport, `Found unexpected EVM export containing "${pattern}"`).toBe(false);
      }
    });
  });

  describe('Core isolation', () => {
    it('should not import any chain-specific code', async () => {
      const coreModule = await import('../../core.js');
      const exports = Object.keys(coreModule);

      // Check that no chain-specific patterns are in the exports
      const chainPatterns = [
        // Aztec
        'AztecConnect',
        'useAztecWallet',
        'aztecSandbox',
        // EVM
        'EVMConnect',
        'useEvmWallet',
        'ethereumMainnet',
        // Solana
        'SolanaConnect',
        'useSolanaWallet',
        'solanaMainnet',
        // Generic chain-aware hooks
        'useAccount',
        'useConnect',
        'useSwitchChain',
      ];

      for (const pattern of chainPatterns) {
        // More precise check - only match exact export names, not substrings
        // Exception: useConnectButtonState is allowed as it's a UI utility, not the chain-aware hook
        const hasChainExport = exports.some((exp) => {
          // Skip useConnectButtonState as it's a UI utility from modal-core
          if (pattern === 'useConnect' && exp === 'useConnectButtonState') {
            return false;
          }
          // For hooks, check exact match or with common suffixes
          if (pattern.startsWith('use')) {
            return (
              exp === pattern || exp.startsWith(`${pattern}Return`) || exp.startsWith(`${pattern}Options`)
            );
          }
          // For other patterns, still check if they're contained
          return exp.includes(pattern);
        });
        expect(hasChainExport, `Found unexpected chain export containing "${pattern}"`).toBe(false);
      }
    });
  });

  describe('Export consistency', () => {
    it('should have consistent core exports across all chain modules', async () => {
      const aztecModule = await import('../../aztec.js');
      const evmModule = await import('../../evm.js');
      const solanaModule = await import('../../solana.js');

      // Core exports that should be in all chain modules
      const coreExports = [
        'WalletMeshProvider',
        'WalletMeshModal',
        'WalletMeshErrorBoundary',
        'useConfig',
        'useTheme',
        'useSSR',
        'useWalletEvents',
        'createWalletMesh',
        'walletMeshStore',
        'ChainType',
        'TransportType',
      ];

      for (const exportName of coreExports) {
        expect(
          (aztecModule as Record<string, unknown>)[exportName],
          `Missing ${exportName} in aztec module`,
        ).toBeDefined();
        expect(
          (evmModule as Record<string, unknown>)[exportName],
          `Missing ${exportName} in evm module`,
        ).toBeDefined();
        expect(
          (solanaModule as Record<string, unknown>)[exportName],
          `Missing ${exportName} in solana module`,
        ).toBeDefined();
      }
    });

    it('should have unique chain-specific exports', async () => {
      const aztecModule = await import('../../aztec.js');
      const evmModule = await import('../../evm.js');
      const solanaModule = await import('../../solana.js');

      // Chain-specific exports that should only be in their respective modules
      expect(aztecModule.useAztecWallet).toBeDefined();
      expect((evmModule as Record<string, unknown>)['useAztecWallet']).toBeUndefined();
      expect((solanaModule as Record<string, unknown>)['useAztecWallet']).toBeUndefined();

      expect(evmModule.useEvmWallet).toBeDefined();
      expect((aztecModule as Record<string, unknown>)['useEvmWallet']).toBeUndefined();
      expect((solanaModule as Record<string, unknown>)['useEvmWallet']).toBeUndefined();

      expect(solanaModule.useSolanaWallet).toBeDefined();
      expect((aztecModule as Record<string, unknown>)['useSolanaWallet']).toBeUndefined();
      expect((evmModule as Record<string, unknown>)['useSolanaWallet']).toBeUndefined();
    });
  });
});
