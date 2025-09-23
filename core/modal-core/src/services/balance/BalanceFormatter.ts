/**
 * Balance formatting utilities
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for balance formatting functions
export class BalanceFormatter {
  /**
   * Format balance with proper decimal places
   */
  static format(value: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const quotient = value / divisor;
    const remainder = value % divisor;

    // Always show at least one decimal place for consistency
    if (remainder === 0n) {
      return `${quotient}.0`;
    }

    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    return `${quotient}.${trimmedRemainder}`;
  }

  /**
   * Parse formatted balance back to bigint
   */
  static parse(formatted: string, decimals: number): bigint {
    const [whole, decimal] = formatted.split('.');
    const paddedDecimal = (decimal || '0').padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(paddedDecimal);
  }

  /**
   * Format with specific number of decimal places
   */
  static formatFixed(value: bigint, decimals: number, places: number): string {
    const formatted = BalanceFormatter.format(value, decimals);
    const [whole, decimal] = formatted.split('.');
    const fixedDecimal = (decimal || '').padEnd(places, '0').slice(0, places);
    return `${whole}.${fixedDecimal}`;
  }

  /**
   * Format with automatic unit conversion (K, M, B, etc.)
   */
  static formatCompact(value: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const numValue = Number(value) / Number(divisor);

    if (numValue >= 1e9) {
      return `${(numValue / 1e9).toFixed(2)}B`;
    }
    if (numValue >= 1e6) {
      return `${(numValue / 1e6).toFixed(2)}M`;
    }
    if (numValue >= 1e3) {
      return `${(numValue / 1e3).toFixed(2)}K`;
    }

    return BalanceFormatter.formatFixed(value, decimals, 2);
  }
}
