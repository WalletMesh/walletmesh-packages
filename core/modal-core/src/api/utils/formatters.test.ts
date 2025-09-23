import { describe, expect, it } from 'vitest';
import { CHAIN_NAMES, formatters } from './formatters.js';

describe('formatters', () => {
  describe('CHAIN_NAMES', () => {
    it('should contain common Ethereum networks', () => {
      expect(CHAIN_NAMES['0x1']).toBe('Ethereum');
      expect(CHAIN_NAMES['0x89']).toBe('Polygon');
      expect(CHAIN_NAMES['0xa']).toBe('Optimism');
      expect(CHAIN_NAMES['0xa4b1']).toBe('Arbitrum One');
    });

    it('should contain common testnets', () => {
      expect(CHAIN_NAMES['0x5']).toBe('Goerli');
      expect(CHAIN_NAMES['0xaa36a7']).toBe('Sepolia');
    });

    it('should contain Solana networks', () => {
      expect(CHAIN_NAMES['solana-mainnet']).toBe('Solana');
      expect(CHAIN_NAMES['solana-devnet']).toBe('Solana Devnet');
      expect(CHAIN_NAMES['solana-testnet']).toBe('Solana Testnet');
    });

    it('should contain Aztec networks', () => {
      expect(CHAIN_NAMES['aztec-mainnet']).toBe('Aztec');
      expect(CHAIN_NAMES['aztec-testnet']).toBe('Aztec Testnet');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten standard Ethereum address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const shortened = formatters.shortenAddress(address);

      expect(shortened).toBe('0x1234...7890');
    });

    it('should use custom start and end character counts', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const shortened = formatters.shortenAddress(address, 8, 6);

      expect(shortened).toBe('0x123456...567890');
    });

    it('should return original address if too short', () => {
      const shortAddress = '0x1234';
      const result = formatters.shortenAddress(shortAddress);

      expect(result).toBe('0x1234');
    });

    it('should handle empty string', () => {
      const result = formatters.shortenAddress('');

      expect(result).toBe('');
    });

    it('should handle null/undefined addresses', () => {
      expect(formatters.shortenAddress(null as string)).toBe(null);
      expect(formatters.shortenAddress(undefined as string)).toBe(undefined);
    });

    it('should work with non-Ethereum addresses', () => {
      const solanaAddress = 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz6Cu7ZUePKAq2A8Qt';
      const shortened = formatters.shortenAddress(solanaAddress);

      expect(shortened).toBe('DjVE6J...A8Qt');
    });
  });

  describe('formatBalance', () => {
    it('should format ETH balance from wei', () => {
      const weiBalance = '1234567890123456789'; // ~1.23 ETH
      const formatted = formatters.formatBalance(weiBalance, 18, 'ETH');

      expect(formatted).toBe('1.23 ETH');
    });

    it('should format balance without symbol', () => {
      const balance = '1000000000000000000'; // 1 ETH
      const formatted = formatters.formatBalance(balance, 18);

      expect(formatted).toBe('1');
    });

    it('should handle numeric input', () => {
      const balance = 1000000000000000000; // 1 ETH in wei
      const formatted = formatters.formatBalance(balance, 18, 'ETH');

      expect(formatted).toBe('1 ETH');
    });

    it('should format small balances correctly', () => {
      const smallBalance = '123456789012345'; // 0.000123... ETH
      const formatted = formatters.formatBalance(smallBalance, 18, 'ETH');

      expect(formatted).toBe('0.0001234 ETH');
    });

    it('should format very small balances', () => {
      const verySmallBalance = '1234567890123'; // Very small amount
      const formatted = formatters.formatBalance(verySmallBalance, 18, 'ETH');

      expect(formatted).toBe('<0.0001 ETH');
    });

    it('should format large balances with K notation', () => {
      const largeBalance = '1234567890123456789000'; // ~1,234 ETH
      const formatted = formatters.formatBalance(largeBalance, 18, 'ETH');

      expect(formatted).toBe('1.23K ETH');
    });

    it('should format very large balances with M notation', () => {
      const veryLargeBalance = '1234567890123456789000000'; // ~1.23M ETH
      const formatted = formatters.formatBalance(veryLargeBalance, 18, 'ETH');

      expect(formatted).toBe('1.23M ETH');
    });

    it('should handle zero balance', () => {
      const formatted = formatters.formatBalance('0', 18, 'ETH');

      expect(formatted).toBe('0 ETH');
    });

    it('should handle invalid input gracefully', () => {
      const formatted = formatters.formatBalance('invalid', 18, 'ETH');

      expect(formatted).toBe('0 ETH');
    });

    it('should handle different token decimals', () => {
      const usdcBalance = '1234567'; // 1.234567 USDC (6 decimals)
      const formatted = formatters.formatBalance(usdcBalance, 6, 'USDC');

      expect(formatted).toBe('1.23 USDC');
    });

    it('should format negative balances', () => {
      const negativeBalance = '-1000000000000000000';
      const formatted = formatters.formatBalance(negativeBalance, 18, 'ETH');

      expect(formatted).toBe('-1 ETH');
    });
  });

  describe('formatChainName', () => {
    it('should format known chain IDs to names', () => {
      expect(formatters.formatChainName('0x1')).toBe('Ethereum');
      expect(formatters.formatChainName('0x89')).toBe('Polygon');
      expect(formatters.formatChainName('solana-mainnet')).toBe('Solana');
    });

    it('should return chain ID for unknown networks', () => {
      expect(formatters.formatChainName('0x999')).toBe('Chain 0x999');
      expect(formatters.formatChainName('unknown-network')).toBe('Chain unknown-network');
    });

    it('should handle numeric chain IDs', () => {
      expect(formatters.formatChainName(1)).toBe('Chain 1');
      expect(formatters.formatChainName(137)).toBe('Chain 137');
    });

    it('should handle empty or invalid input', () => {
      expect(formatters.formatChainName('')).toBe('Unknown Chain');
      expect(formatters.formatChainName(null as string)).toBe('Unknown Chain');
      expect(formatters.formatChainName(undefined as string)).toBe('Unknown Chain');
    });
  });

  describe('formatTransactionHash', () => {
    it('should format Ethereum transaction hash', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const formatted = formatters.formatTransactionHash(hash);

      expect(formatted).toBe('0x1234...cdef');
    });

    it('should format Solana transaction signature', () => {
      const signature = '5j7s1QjVy9KqGv2UJyBKm7FqQy4NKyAV9Tj8CwYhRnLe3Rf8dGxK4Pz1Nm6Qr3Sw9Ty2Vh8';
      const formatted = formatters.formatTransactionHash(signature);

      expect(formatted).toBe('5j7s1Q...2Vh8');
    });

    it('should use custom length parameters', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const formatted = formatters.formatTransactionHash(hash, 8, 6);

      expect(formatted).toBe('0x123456...abcdef');
    });

    it('should handle short hashes', () => {
      const shortHash = '0x1234';
      const formatted = formatters.formatTransactionHash(shortHash);

      expect(formatted).toBe('0x1234');
    });
  });

  describe('formatWalletName', () => {
    it('should format wallet names with proper capitalization', () => {
      expect(formatters.formatWalletName('metamask')).toBe('MetaMask');
      expect(formatters.formatWalletName('walletconnect')).toBe('WalletConnect');
      expect(formatters.formatWalletName('coinbase')).toBe('Coinbase Wallet');
    });

    it('should handle unknown wallet IDs', () => {
      expect(formatters.formatWalletName('unknown')).toBe('Unknown');
      expect(formatters.formatWalletName('custom-wallet')).toBe('Custom Wallet');
    });

    it('should handle empty or invalid input', () => {
      expect(formatters.formatWalletName('')).toBe('Unknown Wallet');
      expect(formatters.formatWalletName(null as string)).toBe('Unknown Wallet');
      expect(formatters.formatWalletName(undefined as string)).toBe('Unknown Wallet');
    });

    it('should preserve already formatted names', () => {
      expect(formatters.formatWalletName('MetaMask')).toBe('MetaMask');
      expect(formatters.formatWalletName('Trust Wallet')).toBe('Trust Wallet');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle extreme values in formatBalance', () => {
      // Very large number
      const extremeBalance = '999999999999999999999999999999';
      const formatted = formatters.formatBalance(extremeBalance, 18, 'ETH');

      expect(formatted).toMatch(/ETH$/); // Should end with ETH
      expect(formatted).not.toBe('NaN ETH');
    });

    it('should handle scientific notation in formatBalance', () => {
      const scientificBalance = '1.23e18';
      const formatted = formatters.formatBalance(scientificBalance, 18, 'ETH');

      expect(formatted).toBe('1.23 ETH');
    });

    it('should handle decimal string inputs in formatBalance', () => {
      const decimalBalance = '1.5';
      const formatted = formatters.formatBalance(decimalBalance, 0, 'TOKEN');

      expect(formatted).toBe('1.5 TOKEN');
    });

    it('should maintain precision for important balances', () => {
      const preciseBalance = '1230000000000000000'; // 1.23 ETH exactly
      const formatted = formatters.formatBalance(preciseBalance, 18, 'ETH');

      expect(formatted).toBe('1.23 ETH');
    });

    it('should handle unicode characters in addresses', () => {
      const unicodeAddress = '0x123456789中文12345678901234567890';
      const formatted = formatters.shortenAddress(unicodeAddress);

      expect(formatted).toMatch(/^0x1234.*7890$/);
    });
  });
});
