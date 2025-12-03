/**
 * Balance service types and interfaces
 *
 * This module defines the core types and interfaces used by the BalanceService
 * for querying, caching, and formatting blockchain balance information across
 * different chains and token types.
 *
 * @module services/balance/types
 * @category Services
 */

/**
 * Balance information for native currencies and tokens
 *
 * Represents balance data in both raw and human-readable formats. This interface
 * is used for both native blockchain currencies (ETH, SOL, etc.) and tokens
 * (ERC20, SPL, etc.).
 *
 * @example Native balance (ETH)
 * ```typescript
 * const ethBalance: BalanceInfo = {
 *   value: "1234567890000000000",    // 1.23456789 ETH in wei
 *   formatted: "1.234",               // Human-readable format
 *   symbol: "ETH",                    // Currency symbol
 *   decimals: 18                      // Ethereum uses 18 decimals
 * };
 * ```
 *
 * @example Token balance (USDC)
 * ```typescript
 * const usdcBalance: BalanceInfo = {
 *   value: "1000500000",              // 1,000.50 USDC (6 decimals)
 *   formatted: "1,000.50",            // Human-readable with formatting
 *   symbol: "USDC",                   // Token symbol
 *   decimals: 6                       // USDC uses 6 decimals
 * };
 * ```
 */
export interface BalanceInfo {
  /**
   * The balance value in the smallest unit (e.g., wei for ETH, lamports for SOL)
   *
   * This is the raw blockchain value without decimal conversion. Always represented
   * as a string to avoid JavaScript number precision issues with large values.
   *
   * @remarks
   * - For ETH: value in wei (10^18 wei = 1 ETH)
   * - For SOL: value in lamports (10^9 lamports = 1 SOL)
   * - For USDC: value in smallest unit (10^6 = 1 USDC)
   */
  value: string;

  /**
   * The balance as a human-readable decimal string
   *
   * This is the formatted balance with proper decimal placement and optional
   * thousands separators. The formatting is handled by chain-specific services
   * to ensure proper display for each blockchain's conventions.
   *
   * @example "1,234.56789", "0.001", "1000000"
   */
  formatted: string;

  /**
   * The symbol of the currency or token
   *
   * For native currencies, this is the blockchain's native symbol (ETH, SOL, etc.).
   * For tokens, this is the token's symbol as defined in its contract.
   *
   * @example "ETH", "USDC", "SOL", "WBTC"
   */
  symbol: string;

  /**
   * The number of decimals for the currency/token
   *
   * Indicates how many decimal places the smallest unit represents.
   * This is crucial for proper value conversion and display.
   *
   * @example 18 for ETH, 6 for USDC, 9 for SOL
   */
  decimals: number;
}

/**
 * Token information for balance queries
 *
 * Contains the minimum required information to query a token's balance.
 * Only the contract address is required - other metadata can be fetched
 * automatically from the blockchain if not provided.
 *
 * @example ERC20 token on Ethereum
 * ```typescript
 * const usdcToken: TokenInfo = {
 *   address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
 *   symbol: "USDC",     // Optional, can be fetched
 *   name: "USD Coin",   // Optional
 *   decimals: 6         // Optional, can be fetched
 * };
 * ```
 *
 * @example SPL token on Solana
 * ```typescript
 * const solToken: TokenInfo = {
 *   address: "So11111111111111111111111111111111111111112",
 *   symbol: "SOL",
 *   decimals: 9
 * };
 * ```
 */
export interface TokenInfo {
  /**
   * Token contract address
   *
   * The on-chain address of the token contract. Format varies by blockchain:
   * - EVM: 0x-prefixed hexadecimal address (e.g., "0x...")
   * - Solana: Base58-encoded address
   * - Aztec: Aztec-specific address format
   */
  address: string;

  /**
   * Token symbol (optional, will be fetched if not provided)
   *
   * The token's trading symbol. If not provided, the service will attempt
   * to fetch it from the token contract. Providing it upfront improves
   * performance by avoiding an extra RPC call.
   *
   * @example "USDC", "WETH", "DAI"
   */
  symbol?: string;

  /**
   * Token name (optional)
   *
   * The full name of the token. This is primarily for display purposes
   * and does not affect balance queries.
   *
   * @example "USD Coin", "Wrapped Ether", "Dai Stablecoin"
   */
  name?: string;

  /**
   * Token decimals (optional, will be fetched if not provided)
   *
   * The number of decimal places the token uses. Critical for proper
   * balance display. If not provided, will be fetched from the contract.
   *
   * @remarks
   * Common decimal values:
   * - 18: Most ERC20 tokens (ETH standard)
   * - 6: USDC, USDT (stablecoins)
   * - 8: WBTC (Bitcoin representation)
   * - 9: Solana SPL tokens
   */
  decimals?: number;
}

/**
 * Token metadata retrieved from blockchain
 *
 * Complete token information fetched from a token contract. This interface
 * represents the full metadata available on-chain for a token.
 *
 * @example
 * ```typescript
 * const metadata: TokenMetadata = {
 *   symbol: "USDC",
 *   name: "USD Coin",
 *   decimals: 6,
 *   totalSupply: "32451936029610000"  // 32.45B USDC
 * };
 * ```
 */
export interface TokenMetadata {
  /**
   * Token symbol
   *
   * The official trading symbol as defined in the token contract.
   */
  symbol: string;

  /**
   * Token name
   *
   * The full descriptive name of the token from the contract.
   */
  name: string;

  /**
   * Token decimals
   *
   * The number of decimal places defined in the token contract.
   * Used for converting between smallest unit and display values.
   */
  decimals: number;

  /**
   * Total supply (optional)
   *
   * The total supply of tokens in circulation, in the smallest unit.
   * May not be available for all tokens (e.g., tokens with dynamic supply).
   *
   * @example "1000000000000" for 1M tokens with 6 decimals
   */
  totalSupply?: string;
}

/**
 * Balance query options
 *
 * Configuration options for individual balance queries. These options override
 * the default service configuration for specific queries, allowing fine-grained
 * control over caching behavior.
 *
 * @example Force fresh data
 * ```typescript
 * const options: BalanceQueryOptions = {
 *   useCache: false  // Bypass cache, fetch fresh data
 * };
 * ```
 *
 * @example Quick cache for UI updates
 * ```typescript
 * const options: BalanceQueryOptions = {
 *   useCache: true,
 *   staleTime: 5000  // Consider data fresh for 5 seconds
 * };
 * ```
 */
export interface BalanceQueryOptions {
  /**
   * Whether to use cache
   *
   * Controls whether to check the cache before making an RPC call.
   * Set to false to force a fresh fetch from the blockchain.
   *
   * @default true
   */
  useCache?: boolean;

  /**
   * Cache time in milliseconds
   *
   * How long the fetched balance should be kept in cache before
   * being automatically removed. Overrides the service's default.
   *
   * @default 300000 (5 minutes)
   * @example 60000 for 1 minute, 3600000 for 1 hour
   */
  cacheTime?: number;

  /**
   * Stale time in milliseconds
   *
   * How long cached data is considered fresh. Within this time,
   * cached data is returned immediately without checking the blockchain.
   * After this time, data is still returned from cache but a background
   * refresh may be triggered.
   *
   * @default 30000 (30 seconds)
   * @example 5000 for 5 seconds (frequent updates), 300000 for 5 minutes (stable values)
   */
  staleTime?: number;
}
