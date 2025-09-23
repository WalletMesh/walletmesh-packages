import { describe, expect, it } from 'vitest';
import { ChainType } from '../types.js';
import { getChainTypeFromId } from './chainTypeUtils.js';

describe('chainTypeUtils', () => {
  describe('getChainTypeFromId', () => {
    it('should identify Aztec chains', () => {
      expect(getChainTypeFromId('aztec-mainnet')).toBe(ChainType.Aztec);
      expect(getChainTypeFromId('aztec-testnet')).toBe(ChainType.Aztec);
      expect(getChainTypeFromId('aztec-custom')).toBe(ChainType.Aztec);
      expect(getChainTypeFromId('aztec-dev-123')).toBe(ChainType.Aztec);
    });

    it('should identify Solana chains', () => {
      expect(getChainTypeFromId('solana-mainnet-beta')).toBe(ChainType.Solana);
      expect(getChainTypeFromId('solana-testnet')).toBe(ChainType.Solana);
      expect(getChainTypeFromId('solana-devnet')).toBe(ChainType.Solana);
      expect(getChainTypeFromId('solana-custom')).toBe(ChainType.Solana);
    });

    it('should default to EVM for numeric chain IDs', () => {
      expect(getChainTypeFromId('1')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('137')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('80001')).toBe(ChainType.Evm);
      expect(getChainTypeFromId(1)).toBe(ChainType.Evm);
      expect(getChainTypeFromId(137)).toBe(ChainType.Evm);
    });

    it('should default to EVM for unknown chain IDs', () => {
      expect(getChainTypeFromId('unknown')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('custom-chain')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('ethereum')).toBe(ChainType.Evm);
    });

    it('should handle edge cases', () => {
      expect(getChainTypeFromId('')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('0')).toBe(ChainType.Evm);
      expect(getChainTypeFromId('0x1')).toBe(ChainType.Evm);
    });
  });
});
