import { describe, it, expect } from 'vitest';
import { getChainName } from './chainNameResolver.js';
import { ChainType } from '../types.js';

describe('chainNameResolver', () => {
  describe('getChainName', () => {
    describe('EVM chains (eip155 namespace)', () => {
      it('should resolve Ethereum mainnet', () => {
        expect(getChainName('eip155:1')).toBe('Ethereum');
        expect(getChainName(1)).toBe('Ethereum');
        expect(getChainName('1')).toBe('Ethereum');
      });

      it('should resolve Polygon', () => {
        expect(getChainName('eip155:137')).toBe('Polygon');
        expect(getChainName(137)).toBe('Polygon');
        expect(getChainName('137')).toBe('Polygon');
      });

      it('should resolve BSC', () => {
        expect(getChainName('eip155:56')).toBe('BSC');
        expect(getChainName(56)).toBe('BSC');
        expect(getChainName('56')).toBe('BSC');
      });

      it('should resolve Arbitrum', () => {
        expect(getChainName('eip155:42161')).toBe('Arbitrum');
        expect(getChainName(42161)).toBe('Arbitrum');
        expect(getChainName('42161')).toBe('Arbitrum');
      });

      it('should resolve Optimism', () => {
        expect(getChainName('eip155:10')).toBe('Optimism');
        expect(getChainName(10)).toBe('Optimism');
        expect(getChainName('10')).toBe('Optimism');
      });
    });

    describe('Solana chains (solana namespace)', () => {
      it('should resolve Solana mainnet', () => {
        expect(getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('Solana');
      });

      it('should resolve Solana testnet', () => {
        expect(getChainName('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')).toBe('Solana Testnet');
      });

      it('should resolve Solana devnet', () => {
        expect(getChainName('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1')).toBe('Solana Devnet');
      });
    });

    describe('Aztec chains (aztec namespace)', () => {
      it('should resolve Aztec Sandbox', () => {
        expect(getChainName('aztec:31337')).toBe('Aztec Sandbox');
      });

      it('should resolve Aztec Testnet', () => {
        expect(getChainName('aztec:testnet')).toBe('Aztec Testnet');
      });

      it('should resolve Aztec Mainnet', () => {
        expect(getChainName('aztec:mainnet')).toBe('Aztec Mainnet');
      });
    });

    describe('Input format handling', () => {
      it('should handle string input', () => {
        expect(getChainName('eip155:1')).toBe('Ethereum');
        expect(getChainName('137')).toBe('Polygon'); // Numeric string gets normalized to eip155:137
      });

      it('should handle number input', () => {
        expect(getChainName(1)).toBe('Ethereum');
        expect(getChainName(137)).toBe('Polygon');
      });

      it('should handle CAIP-2 format', () => {
        expect(getChainName('eip155:1')).toBe('Ethereum');
        expect(getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('Solana');
        expect(getChainName('aztec:31337')).toBe('Aztec Sandbox');
      });

      it('should convert numeric string to CAIP-2 format match', () => {
        // When passed '1' (numeric string), it gets normalized to 'eip155:1' and matches
        expect(getChainName('1')).toBe('Ethereum');

        // CAIP-2 format should also work directly
        expect(getChainName('eip155:1')).toBe('Ethereum');
      });
    });

    describe('chainType parameter (optional)', () => {
      it('should work without chainType parameter', () => {
        expect(getChainName('eip155:1')).toBe('Ethereum');
        expect(getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('Solana');
      });

      it('should work with chainType parameter (kept for API compatibility)', () => {
        expect(getChainName('eip155:1', ChainType.Evm)).toBe('Ethereum');
        expect(getChainName('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', ChainType.Solana)).toBe('Solana');
        expect(getChainName('aztec:31337', ChainType.Aztec)).toBe('Aztec Sandbox');
      });

      it('should ignore chainType parameter as it is unused', () => {
        // chainType parameter is not used in implementation, just kept for API compatibility
        expect(getChainName('eip155:1', ChainType.Solana)).toBe('Ethereum');
        expect(getChainName('aztec:31337', ChainType.Evm)).toBe('Aztec Sandbox');
      });
    });

    describe('Unknown chains', () => {
      it('should return chainId as-is for unknown chains', () => {
        expect(getChainName('unknown:123')).toBe('unknown:123');
        expect(getChainName('eip155:999999')).toBe('eip155:999999');
        expect(getChainName('solana:unknown')).toBe('solana:unknown');
      });

      it('should return stringified chainId for unknown numeric chains', () => {
        expect(getChainName(999999)).toBe('999999');
        expect(getChainName('999999')).toBe('999999');
      });

      it('should handle non-CAIP-2 formats gracefully', () => {
        expect(getChainName('not-a-chain')).toBe('not-a-chain');
        expect(getChainName('123-abc')).toBe('123-abc');
      });
    });

    describe('Edge cases', () => {
      it('should handle zero as chainId', () => {
        expect(getChainName(0)).toBe('0');
        expect(getChainName('0')).toBe('0');
      });

      it('should handle empty string', () => {
        expect(getChainName('')).toBe('');
      });

      it('should handle very large numbers', () => {
        const largeNum = Number.MAX_SAFE_INTEGER;
        expect(getChainName(largeNum)).toBe(String(largeNum));
      });

      it('should handle negative numbers', () => {
        expect(getChainName(-1)).toBe('-1');
        expect(getChainName('-1')).toBe('-1');
      });
    });

    describe('Consistency across input formats', () => {
      it('should return same result for numeric and string inputs for known chains', () => {
        // EIP-155 chains should normalize
        expect(getChainName(1)).toBe('Ethereum');
        expect(getChainName(137)).toBe('Polygon');
        expect(getChainName(56)).toBe('BSC');
      });

      it('should handle CAIP-2 format consistently', () => {
        expect(getChainName('eip155:1')).toBe('Ethereum');
        expect(getChainName('eip155:137')).toBe('Polygon');
        expect(getChainName('eip155:56')).toBe('BSC');
      });
    });
  });
});
