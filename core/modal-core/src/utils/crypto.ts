/**
 * Cryptographically secure ID and token generation utilities
 *
 * This module provides secure random generation methods for session IDs,
 * tokens, and other security-sensitive identifiers using the Web Crypto API.
 */

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';

/**
 * Generates a cryptographically secure session ID
 *
 * @param prefix - Optional prefix for the session ID (e.g., 'sess', 'user')
 * @returns A secure session ID string in format "[prefix_]uuid"
 * @throws Error if crypto.randomUUID is not available in the environment
 * @remarks Uses the Web Crypto API's randomUUID() method which generates a v4 UUID
 * @example
 * ```typescript
 * // Generate a plain UUID
 * const id = generateSessionId();
 * // Result: "550e8400-e29b-41d4-a716-446655440000"
 *
 * // Generate with prefix
 * const sessionId = generateSessionId('sess');
 * // Result: "sess_550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateSessionId(prefix?: string): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw ErrorFactory.configurationError(
      'crypto.randomUUID is not available. This environment does not support secure random generation.',
    );
  }

  const uuid = crypto.randomUUID();
  if (prefix) {
    return `${prefix}_${uuid}`;
  }
  return uuid;
}

/**
 * Options for generating IDs
 * @public
 */
export interface GenerateIdOptions {
  /** Optional prefix to prepend to the ID */
  prefix?: string;
  /** Whether to include a timestamp in the ID */
  timestamp?: boolean;
  /** Separator character between ID parts (default: '_') */
  separator?: string;
}

/**
 * Generates a cryptographically secure ID with optional formatting
 *
 * @param options - Options for ID generation
 * @returns A secure UUID string with optional formatting
 * @throws Error if crypto.randomUUID is not available in the environment
 * @remarks This function allows flexible ID generation with prefixes, timestamps, and custom separators
 * @example
 * ```typescript
 * // Simple UUID
 * const id = generateId();
 * // Result: "550e8400-e29b-41d4-a716-446655440000"
 *
 * // With prefix and timestamp
 * const txId = generateId({ prefix: 'tx', timestamp: true });
 * // Result: "tx_1703123456789_550e8400-e29b-41d4-a716-446655440000"
 *
 * // Custom separator
 * const walletId = generateId({ prefix: 'wallet', separator: '-' });
 * // Result: "wallet-550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateId(options: GenerateIdOptions = {}): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw ErrorFactory.configurationError(
      'crypto.randomUUID is not available. This environment does not support secure random generation.',
    );
  }

  const uuid = crypto.randomUUID();
  const separator = options.separator || '_';
  const parts: string[] = [];

  if (options.prefix) {
    parts.push(options.prefix);
  }

  if (options.timestamp) {
    parts.push(Date.now().toString());
  }

  parts.push(uuid);

  return parts.join(separator);
}

/**
 * Generates a cryptographically secure random token
 *
 * @param length - The desired length of the token in bytes (default: 32)
 * @returns A hex-encoded secure random token
 * @throws Error if crypto.getRandomValues is not available in the environment
 * @remarks The returned token will be twice the length parameter in characters (hex encoding)
 * @example
 * ```typescript
 * // Generate a 64-character hex token (32 bytes)
 * const token = generateSecureToken();
 * // Result: "a3f5e8d7b2c9f4e1a8d6c3b0e7f2a9d5c8b3e0f7a2d8c5b1e9f6a3d0c7b4e1f8"
 *
 * // Generate a 32-character hex token (16 bytes)
 * const shortToken = generateSecureToken(16);
 * // Result: "a3f5e8d7b2c9f4e1a8d6c3b0e7f2a9d5"
 * ```
 */
export function generateSecureToken(length = 32): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw ErrorFactory.configurationError(
      'crypto.getRandomValues is not available. This environment does not support secure random generation.',
    );
  }

  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);

  // Convert to hex string
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Checks if the crypto API is available in the current environment
 *
 * @returns true if crypto APIs are available, false otherwise
 * @remarks This function checks for both randomUUID and getRandomValues methods
 * which are required for all crypto operations in this module
 * @example
 * ```typescript
 * if (!isCryptoAvailable()) {
 *   console.warn('Crypto APIs not available, falling back to less secure methods');
 *   // Use alternative ID generation
 * } else {
 *   const secureId = generateSessionId();
 * }
 * ```
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Generates a secure nonce for cryptographic operations
 *
 * @param length - The desired length of the nonce in bytes (default: 16)
 * @returns A base64-encoded nonce
 * @throws Error if crypto.getRandomValues is not available in the environment
 * @remarks Nonces (number used once) are crucial for preventing replay attacks
 * in cryptographic protocols. This function generates cryptographically secure nonces
 * @example
 * ```typescript
 * // Generate a 16-byte nonce (default)
 * const nonce = generateNonce();
 * // Result: "a3f5e8d7b2c9f4e1a8d6c3b0"
 *
 * // Generate a 32-byte nonce for higher security
 * const strongNonce = generateNonce(32);
 * // Result: "a3f5e8d7b2c9f4e1a8d6c3b0e7f2a9d5c8b3e0f7a2d8c5b1"
 * ```
 */
export function generateNonce(length = 16): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw ErrorFactory.configurationError(
      'crypto.getRandomValues is not available. This environment does not support secure random generation.',
    );
  }

  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);

  // Convert to base64
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(buffer).toString('base64');
  }
  // Browser environment
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Generates a cryptographically secure random string of specified length
 *
 * @param length - The desired length of the string (default: 6)
 * @param charset - The character set to use (default: alphanumeric)
 * @returns A random string from the specified character set
 * @throws Error if crypto.getRandomValues is not available in the environment
 * @remarks This function is useful for generating verification codes, temporary passwords,
 * or other random identifiers that need to be human-readable
 * @example
 * ```typescript
 * // Generate a 6-character alphanumeric code
 * const code = generateRandomString();
 * // Result: "A3f5e8"
 *
 * // Generate an 8-character numeric PIN
 * const pin = generateRandomString(8, '0123456789');
 * // Result: "73829156"
 *
 * // Generate a 12-character password with special characters
 * const password = generateRandomString(12, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*');
 * // Result: "aB3!xY9@mN5$"
 * ```
 */
export function generateRandomString(
  length = 6,
  charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw ErrorFactory.configurationError(
      'crypto.getRandomValues is not available. This environment does not support secure random generation.',
    );
  }

  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);

  return Array.from(buffer)
    .map((byte) => charset[byte % charset.length])
    .join('');
}
