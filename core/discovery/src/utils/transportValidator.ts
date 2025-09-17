import type { TransportConfig } from '../types/core.js';
import { ProtocolError } from './protocolError.js';
import { ERROR_CODES } from '../core/constants.js';

/**
 * Regular expression for validating Chrome extension IDs.
 *
 * Chrome extension IDs are exactly 32 lowercase letters (a-z), generated
 * from the SHA-256 hash of the extension's public key.
 *
 * @example Valid Chrome extension ID
 * ```
 * "abcdefghijklmnopqrstuvwxyzabcdef"
 * ```
 *
 * @category Validation
 * @since 0.1.0
 * @see {@link https://developer.chrome.com/docs/extensions/mv3/manifest/key/} for Chrome extension ID format
 */
const CHROME_EXTENSION_ID_REGEX = /^[a-z]{32}$/;

/**
 * Regular expression for validating Firefox extension IDs.
 *
 * Firefox extension IDs support two formats:
 * 1. Email-like format: `extension-name@developer.domain`
 * 2. GUID format: `{12345678-1234-1234-1234-123456789012}`
 *
 * @example Valid Firefox extension IDs
 * ```
 * "my-extension@mozilla.org"
 * "{12345678-1234-1234-1234-123456789012}"
 * ```
 *
 * @category Validation
 * @since 0.1.0
 * @see {@link https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/} for Firefox extension ID format
 */
const FIREFOX_EXTENSION_ID_REGEX =
  /^(\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\}|[\w.-]+@[\w.-]+)$/i;

/**
 * Validates transport configuration for security and correctness.
 *
 * Comprehensive validation that ensures transport configurations meet security
 * requirements and protocol standards. Validates different transport types with
 * type-specific rules to prevent security vulnerabilities and ensure reliable
 * communication channels.
 *
 * ## Security Validation Rules
 * - **Extension IDs**: Must match browser-specific format patterns
 * - **HTTPS enforcement**: Popup and WebSocket URLs must use secure protocols
 * - **URL validation**: Prevents path traversal and malicious URL patterns
 * - **Port validation**: Ensures WebSocket ports are within valid ranges
 * - **Required fields**: Verifies all necessary fields are present per transport type
 *
 * ## Supported Transport Types
 * - `extension`: Browser extension with extension ID validation
 * - `popup`: Popup window with HTTPS URL validation
 * - `websocket`: WebSocket connection with WSS URL validation
 * - `injected`: Injected provider (no additional validation required)
 *
 * @param config - The transport configuration to validate
 * @throws {ProtocolError} If validation fails with specific error details
 *
 * @example Extension transport validation
 * ```typescript
 * validateTransportConfig({
 *   type: 'extension',
 *   extensionId: 'abcdefghijklmnopqrstuvwxyzabcdef' // Chrome format
 * });
 *
 * validateTransportConfig({
 *   type: 'extension',
 *   extensionId: 'my-wallet@mozilla.org' // Firefox format
 * });
 * ```
 *
 * @example Popup transport validation
 * ```typescript
 * validateTransportConfig({
 *   type: 'popup',
 *   popupUrl: 'https://wallet.example.com/connect'
 * });
 * ```
 *
 * @example WebSocket transport validation
 * ```typescript
 * validateTransportConfig({
 *   type: 'websocket',
 *   websocketUrl: 'wss://wallet.example.com:8080/connect'
 * });
 * ```
 *
 * @example Error handling
 * ```typescript
 * try {
 *   validateTransportConfig(config);
 * } catch (error) {
 *   if (error instanceof ProtocolError) {
 *     console.error('Validation failed:', error.message);
 *     console.error('Error code:', error.code);
 *     console.error('Details:', error.metadata);
 *   }
 * }
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link TransportConfig} for configuration structure
 * @see {@link ProtocolError} for error handling
 */
export function validateTransportConfig(config: TransportConfig): void {
  if (!config || typeof config !== 'object') {
    throw ProtocolError.invalidMessageFormat('Transport configuration must be an object');
  }

  const { type } = config;

  if (!type || typeof type !== 'string') {
    throw ProtocolError.missingRequiredField('transport.type');
  }

  switch (type) {
    case 'extension':
      validateExtensionTransport(config);
      break;
    case 'popup':
      validatePopupTransport(config);
      break;
    case 'websocket':
      validateWebsocketTransport(config);
      break;
    case 'postmessage':
    case 'iframe':
      // Postmessage and iframe providers don't require additional validation
      break;
    default:
      throw ProtocolError.invalidMessageFormat(`Unknown transport type: ${type}`);
  }
}

/**
 * Validates extension transport configuration.
 *
 * Ensures that extension-based transport configurations have valid extension IDs
 * that conform to browser-specific format requirements. Supports both Chrome
 * and Firefox extension ID formats.
 *
 * @param config - The transport configuration to validate
 * @throws {ProtocolError} If extension ID is missing or invalid
 *
 * @example
 * ```typescript
 * // Valid Chrome extension ID
 * validateExtensionTransport({
 *   type: 'extension',
 *   extensionId: 'abcdefghijklmnopqrstuvwxyzabcdef'
 * });
 *
 * // Valid Firefox extension ID
 * validateExtensionTransport({
 *   type: 'extension',
 *   extensionId: 'wallet@mycompany.com'
 * });
 * ```
 *
 * @throws {ProtocolError} With code `MISSING_REQUIRED_FIELD` if extensionId is not provided
 * @throws {ProtocolError} With code `INVALID_MESSAGE_FORMAT` if extensionId format is invalid
 *
 * @category Validation
 * @since 0.1.0
 * @internal
 */
function validateExtensionTransport(config: TransportConfig): void {
  const { extensionId } = config;

  if (!extensionId || typeof extensionId !== 'string') {
    throw ProtocolError.missingRequiredField('transport.extensionId');
  }

  // Check for Chrome extension ID format (32 lowercase letters)
  if (!CHROME_EXTENSION_ID_REGEX.test(extensionId) && !FIREFOX_EXTENSION_ID_REGEX.test(extensionId)) {
    throw new ProtocolError(
      ERROR_CODES.INVALID_MESSAGE_FORMAT,
      {
        field: 'transport.extensionId',
        value: extensionId,
        format: 'Expected 32 lowercase letters (Chrome) or email/GUID format (Firefox)',
      },
      'Invalid extension ID format',
    );
  }
}

/**
 * Validates popup transport configuration.
 *
 * Ensures that popup-based transport configurations have secure URLs that
 * meet security requirements. Enforces HTTPS for production environments
 * while allowing localhost for development.
 *
 * @param config - The transport configuration to validate
 * @throws {ProtocolError} If popup URL is missing, invalid, or insecure
 *
 * @example Valid popup configurations
 * ```typescript
 * // Production URL (HTTPS required)
 * validatePopupTransport({
 *   type: 'popup',
 *   popupUrl: 'https://wallet.example.com/connect'
 * });
 *
 * // Development URL (localhost allowed)
 * validatePopupTransport({
 *   type: 'popup',
 *   popupUrl: 'http://localhost:3000/wallet'
 * });
 * ```
 *
 * @example Security violations
 * ```typescript
 * // Will throw: HTTP not allowed for non-localhost
 * validatePopupTransport({
 *   type: 'popup',
 *   popupUrl: 'http://wallet.example.com/connect'
 * });
 *
 * // Will throw: Suspicious URL patterns
 * validatePopupTransport({
 *   type: 'popup',
 *   popupUrl: 'https://wallet.example.com/../admin'
 * });
 * ```
 *
 * @throws {ProtocolError} With code `MISSING_REQUIRED_FIELD` if popupUrl is not provided
 * @throws {ProtocolError} With code `HTTPS_REQUIRED` if HTTP is used for non-localhost URLs
 * @throws {ProtocolError} With code `INVALID_MESSAGE_FORMAT` if URL format is invalid or contains suspicious patterns
 *
 * @category Validation
 * @since 0.1.0
 * @internal
 */
function validatePopupTransport(config: TransportConfig): void {
  const { url: popupUrl } = config;

  if (!popupUrl || typeof popupUrl !== 'string') {
    throw ProtocolError.missingRequiredField('transport.url');
  }

  try {
    const url = new URL(popupUrl);

    // Require HTTPS for security (allow localhost for development)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new ProtocolError(
        ERROR_CODES.HTTPS_REQUIRED,
        {
          url: popupUrl,
          protocol: url.protocol,
        },
        'Popup URLs must use HTTPS (except for localhost)',
      );
    }

    // Validate against suspicious patterns
    if (url.hostname.includes('..') || url.pathname.includes('..') || url.hostname.includes('\u0000')) {
      throw new ProtocolError(
        ERROR_CODES.INVALID_MESSAGE_FORMAT,
        {
          url: popupUrl,
          reason: 'Suspicious URL pattern detected',
        },
        'Invalid popup URL',
      );
    }
  } catch (error) {
    if (error instanceof ProtocolError) {
      throw error;
    }
    throw ProtocolError.invalidMessageFormat(`Invalid popup URL: ${popupUrl}`);
  }
}

/**
 * Validates websocket transport configuration.
 *
 * Ensures that WebSocket-based transport configurations use secure protocols
 * and valid URLs. Enforces WSS for production environments while allowing
 * WS for localhost development. Validates port ranges and URL structure.
 *
 * @param config - The transport configuration to validate
 * @throws {ProtocolError} If WebSocket URL is missing, invalid, or insecure
 *
 * @example Valid WebSocket configurations
 * ```typescript
 * // Production WebSocket (WSS required)
 * validateWebsocketTransport({
 *   type: 'websocket',
 *   websocketUrl: 'wss://wallet.example.com:8080/connect'
 * });
 *
 * // Development WebSocket (WS allowed for localhost)
 * validateWebsocketTransport({
 *   type: 'websocket',
 *   websocketUrl: 'ws://localhost:8080/wallet'
 * });
 * ```
 *
 * @example Security and format violations
 * ```typescript
 * // Will throw: WS not allowed for non-localhost
 * validateWebsocketTransport({
 *   type: 'websocket',
 *   websocketUrl: 'ws://wallet.example.com:8080/connect'
 * });
 *
 * // Will throw: Invalid protocol
 * validateWebsocketTransport({
 *   type: 'websocket',
 *   websocketUrl: 'https://wallet.example.com/websocket'
 * });
 *
 * // Will throw: Invalid port
 * validateWebsocketTransport({
 *   type: 'websocket',
 *   websocketUrl: 'wss://wallet.example.com:99999/connect'
 * });
 * ```
 *
 * @throws {ProtocolError} With code `MISSING_REQUIRED_FIELD` if websocketUrl is not provided
 * @throws {ProtocolError} With code `INVALID_MESSAGE_FORMAT` if protocol is not ws:// or wss://
 * @throws {ProtocolError} With code `HTTPS_REQUIRED` if WS is used for non-localhost URLs
 * @throws {ProtocolError} With code `INVALID_MESSAGE_FORMAT` if port is invalid (not 1-65535)
 *
 * @category Validation
 * @since 0.1.0
 * @internal
 */
function validateWebsocketTransport(config: TransportConfig): void {
  const { url: websocketUrl } = config;

  if (!websocketUrl || typeof websocketUrl !== 'string') {
    throw ProtocolError.missingRequiredField('transport.url');
  }

  try {
    const url = new URL(websocketUrl);

    // Require WSS for security (allow ws for localhost in development)
    if (!['ws:', 'wss:'].includes(url.protocol)) {
      throw new ProtocolError(
        ERROR_CODES.INVALID_MESSAGE_FORMAT,
        {
          url: websocketUrl,
          protocol: url.protocol,
        },
        'WebSocket URLs must use ws:// or wss:// protocol',
      );
    }

    if (url.protocol === 'ws:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new ProtocolError(
        ERROR_CODES.HTTPS_REQUIRED,
        {
          url: websocketUrl,
          protocol: url.protocol,
        },
        'WebSocket URLs must use WSS (except for localhost)',
      );
    }

    // Validate port range
    if (url.port) {
      const port = Number.parseInt(url.port, 10);
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new ProtocolError(
          ERROR_CODES.INVALID_MESSAGE_FORMAT,
          {
            url: websocketUrl,
            port: url.port,
          },
          'Invalid WebSocket port',
        );
      }
    }
  } catch (error) {
    if (error instanceof ProtocolError) {
      throw error;
    }
    throw ProtocolError.invalidMessageFormat(`Invalid WebSocket URL: ${websocketUrl}`);
  }
}

/**
 * Check if a transport configuration is valid without throwing.
 *
 * Non-throwing validation function that returns a boolean result instead
 * of throwing errors. Useful for conditional logic and validation checks
 * where you want to handle invalid configurations gracefully.
 *
 * This function acts as a type guard, narrowing the type to `TransportConfig`
 * when it returns `true`.
 *
 * @param config - The transport configuration to validate (unknown type)
 * @returns `true` if config is valid, `false` otherwise
 *
 * @example Basic validation check
 * ```typescript
 * if (isValidTransportConfig(config)) {
 *   // TypeScript now knows config is TransportConfig
 *   console.log('Transport type:', config.type);
 *   // Use the transport config safely
 * } else {
 *   console.error('Invalid transport configuration');
 * }
 * ```
 *
 * @example Filtering valid configs
 * ```typescript
 * const validConfigs = transportConfigs.filter(isValidTransportConfig);
 * // validConfigs has type TransportConfig[]
 * ```
 *
 * @example Pre-validation before processing
 * ```typescript
 * function processTransport(config: unknown) {
 *   if (!isValidTransportConfig(config)) {
 *     throw new Error('Invalid transport configuration provided');
 *   }
 *
 *   // Process the validated config
 *   switch (config.type) {
 *     case 'extension':
 *       return connectToExtension(config.extensionId);
 *     case 'popup':
 *       return openPopup(config.popupUrl);
 *     // ... other cases
 *   }
 * }
 * ```
 *
 * @category Validation
 * @since 0.1.0
 * @see {@link validateTransportConfig} for throwing validation with detailed errors
 */
export function isValidTransportConfig(config: unknown): config is TransportConfig {
  try {
    validateTransportConfig(config as TransportConfig);
    return true;
  } catch {
    return false;
  }
}
