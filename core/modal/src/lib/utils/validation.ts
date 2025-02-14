/**
 * Collection of validation utilities for message handling and security.
 *
 * Provides standardized validation functions used across transport
 * and adapter implementations to ensure message integrity and
 * enforce security policies.
 *
 * @example
 * ```typescript
 * import { messageValidation } from './validation';
 *
 * // Validate message format
 * if (!messageValidation.isValidMessage(receivedData)) {
 *   throw new Error('Invalid message format');
 * }
 *
 * // Check message origin
 * if (!messageValidation.isValidOrigin(event.origin, allowedOrigin)) {
 *   throw new Error('Invalid message origin');
 * }
 * ```
 */
export const messageValidation = {
  /**
   * Validates message structure and content.
   *
   * @param message - Message to validate
   * @returns True if message is valid, false otherwise
   *
   * @remarks
   * Performs basic validation:
   * - Ensures message is not null/undefined
   * - Verifies message is an object type
   * - Additional validation can be added as needed
   *
   * @example
   * ```typescript
   * const isValid = messageValidation.isValidMessage({
   *   type: 'request',
   *   data: { ... }
   * });
   * ```
   */
  isValidMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }
    return true;
  },

  /**
   * Validates message origin for security.
   *
   * @param messageOrigin - Origin of received message
   * @param allowedOrigin - Permitted origin (optional)
   * @returns True if origin is valid, false otherwise
   *
   * @remarks
   * Security considerations:
   * - If allowedOrigin is not specified, all origins are accepted
   * - Exact string matching is used for origin comparison
   * - Origin validation is critical for cross-origin security
   *
   * @example
   * ```typescript
   * const isValid = messageValidation.isValidOrigin(
   *   'https://wallet.example.com',
   *   'https://wallet.example.com'
   * );
   * ```
   */
  isValidOrigin(messageOrigin: string, allowedOrigin?: string): boolean {
    if (!allowedOrigin) return true;
    return messageOrigin === allowedOrigin;
  },
};

/**
 * Standard error messages for validation failures.
 *
 * Provides consistent error messaging across the application
 * for common validation and connection errors.
 *
 * @example
 * ```typescript
 * if (!transport.isConnected()) {
 *   throw new Error(errorMessages.notConnected);
 * }
 *
 * if (!isValidMessage(data)) {
 *   throw new Error(errorMessages.invalidMessage);
 * }
 * ```
 */
export const errorMessages = {
  notConnected: 'Transport not connected',
  invalidMessage: 'Invalid message format',
  invalidOrigin: 'Invalid message origin',
};

/**
 * Validates and normalizes URLs for security.
 *
 * @param url - URL string to validate and format
 * @returns Normalized HTTPS URL or empty string if invalid
 *
 * @remarks
 * Security features:
 * - Forces HTTPS protocol
 * - Validates URL structure
 * - Handles malformed URLs gracefully
 * - Returns empty string for invalid URLs
 *
 * @example
 * ```typescript
 * // Converts to HTTPS and validates
 * const secureUrl = validateUrl('http://example.com');
 * // Returns: 'https://example.com'
 *
 * // Handles invalid URLs
 * const invalidUrl = validateUrl('not-a-url');
 * // Returns: ''
 * ```
 */
export const validateUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') {
      urlObj.protocol = 'https:';
    }
    return urlObj.toString();
  } catch (e) {
    return '';
  }
};
