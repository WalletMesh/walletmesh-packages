/**
 * @file Tests for ChainNativeSymbols utility class
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ChainNativeSymbols } from './ChainNativeSymbols.js';

describe('ChainNativeSymbols', () => {
  describe('getSymbol', () => {
    it('should return ETH for Ethereum mainnet', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:1')).toBe('ETH');
    });

    it('should return MATIC for Polygon mainnet', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:137')).toBe('MATIC');
    });

    it('should return BNB for BSC mainnet', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:56')).toBe('BNB');
    });

    it('should return AVAX for Avalanche mainnet', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:43114')).toBe('AVAX');
    });

    it('should return FTM for Fantom mainnet', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:250')).toBe('FTM');
    });

    it('should return SOL for Solana networks', () => {
      expect(ChainNativeSymbols.getSymbol('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('SOL');
      expect(ChainNativeSymbols.getSymbol('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')).toBe('SOL');
      expect(ChainNativeSymbols.getSymbol('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1')).toBe('SOL');
    });

    it('should return ETH for Aztec networks', () => {
      expect(ChainNativeSymbols.getSymbol('aztec:mainnet')).toBe('ETH');
      expect(ChainNativeSymbols.getSymbol('aztec:testnet')).toBe('ETH');
      expect(ChainNativeSymbols.getSymbol('aztec:31337')).toBe('ETH');
    });

    it('should return ETH as default for unknown chains', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:999999')).toBe('ETH');
      expect(ChainNativeSymbols.getSymbol('unknown:chain')).toBe('ETH');
    });

    it('should handle CAIP-2 chain IDs', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:1')).toBe('ETH');
      expect(ChainNativeSymbols.getSymbol('eip155:137')).toBe('MATIC');
      expect(ChainNativeSymbols.getSymbol('eip155:56')).toBe('BNB');
    });

    it('should handle testnet chains', () => {
      expect(ChainNativeSymbols.getSymbol('eip155:11155111')).toBe('ETH'); // Sepolia
      expect(ChainNativeSymbols.getSymbol('eip155:97')).toBe('BNB'); // BSC Testnet
      expect(ChainNativeSymbols.getSymbol('eip155:43113')).toBe('AVAX'); // Fuji Testnet
      expect(ChainNativeSymbols.getSymbol('eip155:84532')).toBe('ETH'); // Base Sepolia
    });
  });

  describe('hasSymbol', () => {
    it('should return true for known chains', () => {
      expect(ChainNativeSymbols.hasSymbol('eip155:1')).toBe(true);
      expect(ChainNativeSymbols.hasSymbol('eip155:137')).toBe(true);
      expect(ChainNativeSymbols.hasSymbol('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(true);
    });

    it('should return false for unknown chains', () => {
      expect(ChainNativeSymbols.hasSymbol('eip155:999999')).toBe(false);
      expect(ChainNativeSymbols.hasSymbol('unknown:chain')).toBe(false);
    });

    it('should handle CAIP-2 chain IDs', () => {
      expect(ChainNativeSymbols.hasSymbol('eip155:1')).toBe(true);
      expect(ChainNativeSymbols.hasSymbol('eip155:999999')).toBe(false);
    });
  });

  describe('addSymbol', () => {
    beforeEach(() => {
      // Clean up any test symbols before each test
      if (ChainNativeSymbols.hasSymbol('test-chain')) {
        // The symbols are stored privately, so we can't directly remove them
        // but we can verify they work correctly
      }
    });

    it('should add a new chain symbol', () => {
      ChainNativeSymbols.addSymbol('test-chain', 'TEST');

      expect(ChainNativeSymbols.hasSymbol('test-chain')).toBe(true);
      expect(ChainNativeSymbols.getSymbol('test-chain')).toBe('TEST');
    });

    it('should override existing chain symbol', () => {
      ChainNativeSymbols.addSymbol('eip155:1', 'NEWETH');

      expect(ChainNativeSymbols.getSymbol('eip155:1')).toBe('NEWETH');

      // Reset to original
      ChainNativeSymbols.addSymbol('eip155:1', 'ETH');
    });

    it('should handle CAIP-2 chain IDs', () => {
      ChainNativeSymbols.addSymbol('eip155:999', 'CUSTOM');

      expect(ChainNativeSymbols.hasSymbol('eip155:999')).toBe(true);
      expect(ChainNativeSymbols.getSymbol('eip155:999')).toBe('CUSTOM');
    });

    it('should handle string chain IDs', () => {
      ChainNativeSymbols.addSymbol('eip155:888', 'NUMERIC');

      // Should be accessible with the exact ID
      expect(ChainNativeSymbols.getSymbol('eip155:888')).toBe('NUMERIC');
    });
  });

  describe('getChainsBySymbol', () => {
    it('should return chains for ETH', () => {
      const ethChains = ChainNativeSymbols.getChainsBySymbol('ETH');

      expect(ethChains).toContain('eip155:1');
      expect(ethChains).toContain('eip155:11155111'); // Sepolia
      expect(ethChains).toContain('eip155:10'); // Optimism
      expect(ethChains).toContain('eip155:42161'); // Arbitrum
      expect(ethChains).toContain('aztec:mainnet');
      expect(ethChains).toContain('eip155:8453'); // Base
    });

    it('should return chains for MATIC', () => {
      const maticChains = ChainNativeSymbols.getChainsBySymbol('MATIC');

      expect(maticChains).toContain('eip155:137');
      // Mumbai testnet removed - deprecated
      expect(maticChains).toHaveLength(1);
    });

    it('should return chains for SOL', () => {
      const solChains = ChainNativeSymbols.getChainsBySymbol('SOL');

      expect(solChains).toContain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
      expect(solChains).toContain('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z');
      expect(solChains).toContain('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
    });

    it('should return empty array for unknown symbol', () => {
      const unknownChains = ChainNativeSymbols.getChainsBySymbol('UNKNOWN');
      expect(unknownChains).toEqual([]);
    });

    it('should return chains for BNB', () => {
      const bnbChains = ChainNativeSymbols.getChainsBySymbol('BNB');

      expect(bnbChains).toContain('eip155:56');
      expect(bnbChains).toContain('eip155:97'); // BSC Testnet
    });

    it('should return chains for AVAX', () => {
      const avaxChains = ChainNativeSymbols.getChainsBySymbol('AVAX');

      expect(avaxChains).toContain('eip155:43114');
      expect(avaxChains).toContain('eip155:43113'); // Fuji
    });

    it('should work with dynamically added symbols', () => {
      ChainNativeSymbols.addSymbol('custom-chain-1', 'CUSTOM');
      ChainNativeSymbols.addSymbol('custom-chain-2', 'CUSTOM');

      const customChains = ChainNativeSymbols.getChainsBySymbol('CUSTOM');
      expect(customChains).toContain('custom-chain-1');
      expect(customChains).toContain('custom-chain-2');
    });
  });

  describe('comprehensive coverage', () => {
    it('should handle all predefined EVM chains', () => {
      const evmChains = [
        'eip155:1',
        'eip155:11155111', // Ethereum
        'eip155:137', // Polygon
        'eip155:10', // Optimism
        'eip155:42161', // Arbitrum
        'eip155:56',
        'eip155:97', // BSC
        'eip155:43114',
        'eip155:43113', // Avalanche
        'eip155:250',
        'eip155:4002', // Fantom
        'eip155:25',
        'eip155:338', // Cronos
        'eip155:100', // Gnosis
        'eip155:1284',
        'eip155:1285',
        'eip155:1287', // Moonbeam family
        'eip155:42220',
        'eip155:44787', // Celo
        'eip155:1313161554',
        'eip155:1313161555', // Aurora
        'eip155:8453', // Base
        'eip155:84532', // Base Sepolia
        'eip155:11155420', // Optimism Sepolia
        'eip155:421614', // Arbitrum Sepolia
      ];

      for (const chainId of evmChains) {
        expect(ChainNativeSymbols.hasSymbol(chainId)).toBe(true);
        expect(ChainNativeSymbols.getSymbol(chainId)).toBeTruthy();
      }
    });

    it('should handle all predefined Solana chains', () => {
      const solanaChains = [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      ];

      for (const chainId of solanaChains) {
        expect(ChainNativeSymbols.hasSymbol(chainId)).toBe(true);
        expect(ChainNativeSymbols.getSymbol(chainId)).toBe('SOL');
      }
    });

    it('should handle all predefined Aztec chains', () => {
      const aztecChains = ['aztec:mainnet', 'aztec:testnet', 'aztec:31337'];

      for (const chainId of aztecChains) {
        expect(ChainNativeSymbols.hasSymbol(chainId)).toBe(true);
        expect(ChainNativeSymbols.getSymbol(chainId)).toBe('ETH');
      }
    });
  });
});
