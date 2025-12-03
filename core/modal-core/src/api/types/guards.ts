/**
 * Type guards for runtime type checking
 *
 * This module provides type guard functions that perform runtime validation
 * to ensure values conform to expected types. These guards are essential for:
 * - Validating data from external sources (API responses, user input)
 * - Narrowing TypeScript types in conditional blocks
 * - Ensuring type safety at runtime boundaries
 *
 * @remarks
 * All type guards follow the pattern: `isTypeName(value: unknown): value is Type`
 * This allows TypeScript to narrow the type when used in conditionals.
 *
 * @example
 * ```typescript
 * // Type narrowing with guards
 * function handleData(data: unknown) {
 *   if (isWalletInfo(data)) {
 *     // TypeScript knows data is WalletInfo here
 *     console.log(data.name, data.icon);
 *   } else if (isModalError(data)) {
 *     // TypeScript knows data is ModalError here
 *     console.error(data.code, data.message);
 *   }
 * }
 * ```
 *
 * @module types/guards
 * @public
 */

import type {
  ChainType,
  ConnectionResult,
  ConnectionState,
  ModalError,
  TransportType,
  WalletInfo,
} from '../../core/types.js';
import { ChainType as ChainTypeEnum } from '../../core/types.js';

/**
 * Check if a value is a valid WalletInfo object
 *
 * Validates that an object has all required WalletInfo properties:
 * - id: string identifier for the wallet
 * - name: display name of the wallet
 * - icon: URL or base64 icon data
 * - chains: array of supported chain types
 *
 * @param value - The value to check
 * @returns True if value is a valid WalletInfo object
 *
 * @example
 * ```typescript
 * const data = {
 *   id: 'metamask',
 *   name: 'MetaMask',
 *   icon: 'https://...',
 *   chains: ['evm']
 * };
 *
 * if (isWalletInfo(data)) {
 *   // Safe to use as WalletInfo
 *   connectToWallet(data);
 * }
 * ```
 *
 * @public
 */
export function isWalletInfo(value: unknown): value is WalletInfo {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['name'] === 'string' &&
    typeof obj['icon'] === 'string' &&
    Array.isArray(obj['chains']) &&
    obj['chains'].every((chain) => isChainType(chain))
  );
}

/**
 * Check if a value is a valid ChainType
 * @public
 */
export function isChainType(value: unknown): value is ChainType {
  return value === ChainTypeEnum.Evm || value === ChainTypeEnum.Solana || value === ChainTypeEnum.Aztec;
}

/**
 * Check if a value is a valid ConnectionResult
 *
 * Validates a complete connection result object containing:
 * - address: Primary wallet address
 * - accounts: Array of all available addresses
 * - chainId: Current chain identifier (string or number)
 * - chainType: Type of blockchain (evm, solana, aztec)
 * - walletId: Identifier of connected wallet
 * - walletInfo: Complete wallet metadata
 *
 * @param value - The value to check
 * @returns True if value is a valid ConnectionResult
 *
 * @example
 * ```typescript
 * // Validate connection response
 * const result = await wallet.connect();
 *
 * if (isConnectionResult(result)) {
 *   // Safe to access all properties
 *   console.log(`Connected to ${result.walletInfo.name}`);
 *   console.log(`Address: ${result.address}`);
 *   console.log(`Chain: ${result.chainId}`);
 * } else {
 *   throw new Error('Invalid connection result');
 * }
 * ```
 *
 * @public
 */
export function isConnectionResult(value: unknown): value is ConnectionResult {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  return (
    typeof obj['address'] === 'string' &&
    Array.isArray(obj['accounts']) &&
    obj['accounts'].every((acc) => typeof acc === 'string') &&
    (typeof obj['chainId'] === 'string' || typeof obj['chainId'] === 'number') &&
    isChainType(obj['chainType']) &&
    typeof obj['walletId'] === 'string' &&
    isWalletInfo(obj['walletInfo'])
  );
}

/**
 * Check if a value is a valid ModalError
 *
 * Validates that an object conforms to the ModalError structure:
 * - code: Error code string for programmatic handling
 * - message: Human-readable error message
 * - category: Error category ('general', 'wallet', 'network', 'user')
 * - fatal: Optional boolean indicating if error is recoverable
 * - data: Optional additional error context
 *
 * @param value - The value to check
 * @returns True if value is a valid ModalError
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (error) {
 *   if (isModalError(error)) {
 *     // Handle structured error
 *     if (error.category === 'user') {
 *       console.log('User cancelled:', error.message);
 *     } else if (error.fatal) {
 *       console.error('Fatal error:', error.code);
 *     }
 *   } else {
 *     // Handle unexpected error
 *     console.error('Unknown error:', error);
 *   }
 * }
 * ```
 *
 * @public
 */
export function isModalError(value: unknown): value is ModalError {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  return (
    typeof obj['code'] === 'string' &&
    typeof obj['message'] === 'string' &&
    typeof obj['category'] === 'string' &&
    ['general', 'wallet', 'network', 'user'].includes(obj['category'] as string)
  );
}

/**
 * Check if a value is a valid TransportType
 * @public
 */
export function isTransportType(value: unknown): value is TransportType {
  return value === 'popup' || value === 'extension';
}

/**
 * Check if a value is a valid modal view type
 * @public
 */
export function isModalViewType(
  value: unknown,
): value is 'walletSelection' | 'connecting' | 'connected' | 'error' {
  return value === 'walletSelection' || value === 'connecting' || value === 'connected' || value === 'error';
}

/**
 * Check if a value is a valid ConnectionState
 * @public
 */
export function isConnectionState(value: unknown): value is ConnectionState {
  return value === 'disconnected' || value === 'connecting' || value === 'connected';
}

/**
 * Type guard to check if an error has a code property
 *
 * Useful for handling errors from various sources that may or may not
 * have error codes. Supports both string and numeric error codes.
 *
 * @param error - The error to check
 * @returns True if error has a code property (string or number)
 *
 * @example
 * ```typescript
 * catch (error) {
 *   if (hasErrorCode(error)) {
 *     // TypeScript knows error.code exists
 *     switch (error.code) {
 *       case 'USER_REJECTED':
 *       case 4001: // MetaMask user rejection code
 *         handleUserRejection();
 *         break;
 *       default:
 *         handleGenericError(error.code);
 *     }
 *   }
 * }
 * ```
 *
 * @public
 */
export function hasErrorCode(error: unknown): error is { code: string | number } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (typeof (error as Record<string, unknown>)['code'] === 'string' ||
      typeof (error as Record<string, unknown>)['code'] === 'number')
  );
}

/**
 * Type guard to check if an error has a message property
 * @public
 */
export function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>)['message'] === 'string'
  );
}

/**
 * Type guard for checking if value is a string
 * @public
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 * @public
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard for checking if value is a boolean
 * @public
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if value is an object (non-null)
 *
 * Validates that a value is a plain object, excluding arrays and null.
 * Useful for safely accessing object properties without runtime errors.
 *
 * @param value - The value to check
 * @returns True if value is a non-null object (not an array)
 *
 * @example
 * ```typescript
 * function processConfig(config: unknown) {
 *   if (isObject(config)) {
 *     // Safe to access properties
 *     const timeout = config.timeout ?? 5000;
 *     const retries = config.retries ?? 3;
 *   } else {
 *     throw new Error('Config must be an object');
 *   }
 * }
 * ```
 *
 * @public
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard for checking if value is an array
 * @public
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a provider is an EVM provider
 *
 * EVM providers follow the EIP-1193 standard and have a request() method
 * for sending JSON-RPC requests to the wallet. This is the natural interface
 * for Ethereum and EVM-compatible chains.
 *
 * @param provider - The provider to check
 * @returns True if provider has the EVM provider interface
 *
 * @example
 * ```typescript
 * // Use provider-specific methods based on type
 * if (isEvmProvider(provider)) {
 *   // Safe to use EIP-1193 request method
 *   const accounts = await provider.request({ method: 'eth_requestAccounts' });
 *   const chainId = await provider.request({ method: 'eth_chainId' });
 * } else if (isSolanaProvider(provider)) {
 *   // Use Solana-specific methods
 *   const connection = await provider.connect();
 *   const signature = await provider.signTransaction(transaction);
 * }
 * ```
 *
 * @public
 */
export function isEvmProvider(provider: unknown): provider is {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
} {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'request' in provider &&
    typeof (provider as Record<string, unknown>)['request'] === 'function'
  );
}

/**
 * Type guard to check if a provider is a Solana provider
 *
 * Solana providers follow the Solana Wallet Standard and have Solana-specific
 * methods like connect(), signTransaction(), and signMessage(). They typically
 * work with publicKey instead of addresses.
 *
 * @param provider - The provider to check
 * @returns True if provider has the Solana provider interface
 *
 * @example
 * ```typescript
 * if (isSolanaProvider(provider)) {
 *   // Use Solana-specific methods
 *   const connection = await provider.connect();
 *   console.log('Connected pubkey:', connection.publicKey);
 *
 *   const signature = await provider.signTransaction(transaction);
 *   const messageSignature = await provider.signMessage('Hello Solana!');
 * }
 * ```
 *
 * @public
 */
export function isSolanaProvider(provider: unknown): provider is {
  connect: () => Promise<{ publicKey: string }>;
  signTransaction: (transaction: unknown) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  getPublicKey: () => string | null;
} {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'connect' in provider &&
    'signTransaction' in provider &&
    'signMessage' in provider &&
    'getPublicKey' in provider &&
    typeof (provider as Record<string, unknown>)['connect'] === 'function' &&
    typeof (provider as Record<string, unknown>)['signTransaction'] === 'function' &&
    typeof (provider as Record<string, unknown>)['signMessage'] === 'function' &&
    typeof (provider as Record<string, unknown>)['getPublicKey'] === 'function'
  );
}

/**
 * Type guard to check if a provider is an Aztec router provider
 *
 * Aztec providers use the WalletRouterProvider pattern with a call() method
 * instead of the EIP-1193 request() pattern. This allows for more flexible
 * routing and privacy-preserving communication patterns.
 *
 * @param provider - The provider to check
 * @returns True if provider has the Aztec router provider interface
 *
 * @example
 * ```typescript
 * if (isAztecRouterProvider(provider)) {
 *   // Use Aztec router call pattern
 *   const response = await provider.call({
 *     method: 'aztec_getAddress',
 *     params: []
 *   });
 *
 *   const txHash = await provider.call({
 *     method: 'aztec_sendTransaction',
 *     params: [transactionData]
 *   });
 * }
 * ```
 *
 * @public
 */
export function isAztecRouterProvider(provider: unknown): provider is {
  call: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  connect: () => Promise<{ sessionId: string; permissions: Record<string, string[]> }>;
  disconnect: () => Promise<void>;
} {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'call' in provider &&
    'connect' in provider &&
    'disconnect' in provider &&
    typeof (provider as Record<string, unknown>)['call'] === 'function' &&
    typeof (provider as Record<string, unknown>)['connect'] === 'function' &&
    typeof (provider as Record<string, unknown>)['disconnect'] === 'function'
  );
}
