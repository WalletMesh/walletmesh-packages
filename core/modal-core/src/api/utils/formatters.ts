/**
 * Framework-agnostic formatting utilities for blockchain data
 *
 * This module provides common formatting functions for addresses, balances,
 * chain names, and other blockchain-related data. These utilities are used
 * across all framework packages (React, Svelte, Vue) to ensure consistent
 * formatting behavior.
 *
 * @module formatters
 * @public
 */

/**
 * Chain ID to name mapping for common blockchain networks
 * @public
 */
export const CHAIN_NAMES: Record<string, string> = {
  // Ethereum networks (hex format)
  '0x1': 'Ethereum',
  '0x89': 'Polygon',
  '0xa4b1': 'Arbitrum One',
  '0xa': 'Optimism',
  '0x38': 'BSC',
  '0xfa': 'Fantom',
  '0x43114': 'Avalanche',

  // Ethereum networks (decimal format)
  '1': 'Ethereum',
  '137': 'Polygon',
  '42161': 'Arbitrum One',
  '10': 'Optimism',
  '56': 'BSC',
  '250': 'Fantom',
  '43114': 'Avalanche',

  // Testnets
  '0x5': 'Goerli',
  '0xaa36a7': 'Sepolia',
  '5': 'Goerli',
  '11155111': 'Sepolia',

  // Solana networks
  'solana-mainnet': 'Solana',
  'solana-devnet': 'Solana Devnet',
  'solana-testnet': 'Solana Testnet',

  // Aztec networks
  'aztec-mainnet': 'Aztec',
  'aztec-testnet': 'Aztec Testnet',
};

/**
 * Collection of formatting utilities for blockchain data
 * @public
 */
export const formatters = {
  /**
   * Shorten an Ethereum address to a readable format
   * @param address - The address to shorten
   * @param startChars - Number of characters to show at start (default: 6)
   * @param endChars - Number of characters to show at end (default: 4)
   * @returns Shortened address in format "0x1234...5678"
   *
   * @example
   * ```typescript
   * formatters.shortenAddress('0x1234567890123456789012345678901234567890')
   * // Returns: "0x1234...7890"
   * ```
   */
  shortenAddress: (address: string, startChars = 6, endChars = 4): string => {
    if (!address || address.length < startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  },

  /**
   * Format a balance with proper decimals and units
   * @param balance - The balance to format (in wei or smallest unit)
   * @param decimals - Number of decimals to convert from (default: 18)
   * @param symbol - Token symbol to append (default: '')
   * @returns Formatted balance string
   *
   * @example
   * ```typescript
   * formatters.formatBalance('1234567890123456789', 18, 'ETH')
   * // Returns: "1.23 ETH"
   * ```
   */
  formatBalance: (balance: string | number, decimals = 18, symbol = ''): string => {
    try {
      const num = typeof balance === 'string' ? Number.parseFloat(balance) : balance;

      if (Number.isNaN(num)) {
        return `0${symbol ? ` ${symbol}` : ''}`;
      }

      // Convert from wei to standard units
      const value = num / 10 ** decimals;

      // Format with appropriate decimal places
      let formatted: string;
      if (value === 0) {
        formatted = '0';
      } else if (value < 0 && value > -0.0001) {
        formatted = '< 0.0001';
      } else if (value > 0 && value < 0.0001) {
        formatted = '<0.0001';
      } else if (Math.abs(value) < 1) {
        // Format small values with appropriate precision
        if (Math.abs(value) < 0.001) {
          // For very small values, use 7 decimal places but truncate (not round) to avoid rounding errors
          const str = value.toString();
          const match = str.match(/^(-?\d+\.\d{1,7})/);
          formatted = match?.[1]?.replace(/\.?0+$/, '') || value.toFixed(7).replace(/\.?0+$/, '');
        } else {
          formatted = value.toFixed(4).replace(/\.?0+$/, '');
        }
      } else if (Math.abs(value) < 1000) {
        // Remove trailing zeros after decimal point
        formatted = value.toFixed(2).replace(/\.?0+$/, '');
      } else if (Math.abs(value) < 1000000) {
        // For thousands, use K notation
        formatted = `${(value / 1000).toFixed(2).replace(/\.?0+$/, '')}K`;
      } else if (Math.abs(value) < 1000000000) {
        // For millions, use M notation
        formatted = `${(value / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`;
      } else {
        // For billions and above, use B notation
        formatted = `${(value / 1000000000).toFixed(2).replace(/\.?0+$/, '')}B`;
      }

      return `${formatted}${symbol ? ` ${symbol}` : ''}`;
    } catch {
      return `0${symbol ? ` ${symbol}` : ''}`;
    }
  },

  /**
   * Format a chain ID to a human-readable name
   * @param chainId - The chain ID (string or number)
   * @returns Human-readable chain name
   *
   * @example
   * ```typescript
   * formatters.formatChainName('0x1')
   * // Returns: "Ethereum"
   *
   * formatters.formatChainName('0x999')
   * // Returns: "Chain 0x999"
   * ```
   */
  formatChainName: (chainId: string | number): string => {
    if (!chainId && chainId !== 0) {
      return 'Unknown Chain';
    }
    const id = chainId.toString();
    if (!id) {
      return 'Unknown Chain';
    }
    // For numeric input, always return "Chain X" format
    if (typeof chainId === 'number') {
      return `Chain ${chainId}`;
    }
    return CHAIN_NAMES[id] || `Chain ${id}`;
  },

  /**
   * Format a transaction hash to a shortened format
   * @param hash - The transaction hash
   * @param chars - Number of characters to show at start and end (default: 6)
   * @returns Shortened transaction hash
   *
   * @example
   * ```typescript
   * formatters.formatTxHash('0x1234567890abcdef1234567890abcdef12345678', 8)
   * // Returns: "0x12345678...12345678"
   * ```
   */
  formatTxHash: (hash: string, chars = 6): string => {
    if (!hash || hash.length < chars * 2) {
      return hash;
    }
    return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
  },

  /**
   * Format a timestamp to a readable date
   * @param timestamp - The timestamp (number or Date object)
   * @param format - The format type ('short', 'long', or 'relative')
   * @returns Formatted date string
   *
   * @example
   * ```typescript
   * formatters.formatDate(Date.now(), 'relative')
   * // Returns: "2 hours ago"
   *
   * formatters.formatDate(Date.now(), 'short')
   * // Returns: "Dec 19, 2:30 PM"
   * ```
   */
  formatDate: (timestamp: number | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;

    if (format === 'relative') {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    }

    if (format === 'long') {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format a number with proper locale formatting
   * @param num - The number to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted number string
   *
   * @example
   * ```typescript
   * formatters.formatNumber(1234.567, 2)
   * // Returns: "1,234.57"
   * ```
   */
  formatNumber: (num: string | number, decimals = 2): string => {
    const value = typeof num === 'string' ? Number.parseFloat(num) : num;

    if (Number.isNaN(value)) {
      return '0';
    }

    return value.toLocaleString(undefined, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  },

  /**
   * Format a currency amount with proper locale formatting
   * @param amount - The amount to format
   * @param currency - The currency code (default: 'USD')
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted currency string
   *
   * @example
   * ```typescript
   * formatters.formatCurrency(1234.56, 'USD', 2)
   * // Returns: "$1,234.56"
   * ```
   */
  formatCurrency: (amount: string | number, currency = 'USD', decimals = 2): string => {
    const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount;

    if (Number.isNaN(value)) {
      return '$0.00';
    }

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Format a transaction hash to a shortened format
   * @param hash - The transaction hash
   * @param startChars - Number of characters to show at start (default: 6)
   * @param endChars - Number of characters to show at end (default: 4)
   * @returns Shortened transaction hash
   *
   * @example
   * ```typescript
   * formatters.formatTransactionHash('0x1234567890abcdef1234567890abcdef12345678')
   * // Returns: "0x1234...5678"
   * ```
   */
  formatTransactionHash: (hash: string, startChars = 6, endChars = 4): string => {
    if (!hash || hash.length < startChars + endChars) {
      return hash;
    }
    // Use the actual startChars value, not a hardcoded limit
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  },

  /**
   * Format wallet name with proper capitalization
   * @param walletId - The wallet ID or name
   * @returns Formatted wallet name
   *
   * @example
   * ```typescript
   * formatters.formatWalletName('metamask')
   * // Returns: "MetaMask"
   *
   * formatters.formatWalletName('walletconnect')
   * // Returns: "WalletConnect"
   * ```
   */
  formatWalletName: (walletId: string): string => {
    if (!walletId) {
      return 'Unknown Wallet';
    }

    // Common wallet name mappings
    const walletNames: Record<string, string> = {
      metamask: 'MetaMask',
      walletconnect: 'WalletConnect',
      coinbase: 'Coinbase Wallet',
      trust: 'Trust Wallet',
      rainbow: 'Rainbow',
      argent: 'Argent',
      ledger: 'Ledger',
      trezor: 'Trezor',
      phantom: 'Phantom',
    };

    // Check if we have a predefined name
    const lowercaseId = walletId.toLowerCase();
    if (walletNames[lowercaseId]) {
      return walletNames[lowercaseId];
    }

    // If already properly formatted, return as is
    if (walletId.includes(' ') || /[A-Z]/.test(walletId)) {
      return walletId;
    }

    // Otherwise, capitalize each word
    return walletId
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
};
