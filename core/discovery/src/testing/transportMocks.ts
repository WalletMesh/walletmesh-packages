/**
 * Transport configuration testing utilities.
 *
 * Provides factory functions for creating valid and invalid transport
 * configurations for testing transport validation, connection setup,
 * and error handling scenarios.
 *
 * @module transportMocks
 * @category Testing
 * @since 1.0.0
 */

import type { TransportConfig } from '../types/core.js';

/**
 * Options for creating test transport configurations.
 */
export interface TestTransportOptions {
  /** Transport type to create */
  type?: 'extension' | 'popup' | 'websocket' | 'postmessage' | 'iframe';
  /** Override specific fields */
  overrides?: Partial<TransportConfig>;
  /** Whether to create an invalid configuration */
  invalid?: boolean;
}

/**
 * Create a valid test transport configuration.
 *
 * Generates transport configurations suitable for testing discovery
 * protocol functionality. All configurations are valid by default
 * unless specifically requested otherwise.
 *
 * @param options - Configuration options
 * @returns A valid TransportConfig object
 *
 * @example
 * ```typescript
 * import { createTestTransportConfig } from '@walletmesh/discovery/testing';
 *
 * // Create extension transport config
 * const extensionConfig = createTestTransportConfig({ type: 'extension' });
 *
 * // Create with custom extension ID
 * const customConfig = createTestTransportConfig({
 *   type: 'extension',
 *   overrides: { extensionId: 'abcdefghijklmnopqrstuvwxyz123456' }
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestTransportConfig(options: TestTransportOptions = {}): TransportConfig {
  const { type = 'extension', overrides = {} } = options;

  let baseConfig: TransportConfig;

  switch (type) {
    case 'extension':
      baseConfig = {
        type: 'extension',
        extensionId: 'abcdefghijklmnopqrstuvwxyz123456', // Valid Chrome extension ID format
      };
      break;

    case 'popup':
      baseConfig = {
        type: 'popup',
        url: 'https://wallet.example.com/popup',
      };
      break;

    case 'websocket':
      baseConfig = {
        type: 'websocket',
        url: 'wss://wallet.example.com/ws',
      };
      break;

    case 'postmessage':
      baseConfig = {
        type: 'postmessage',
      };
      break;

    case 'iframe':
      baseConfig = {
        type: 'iframe',
        url: 'https://wallet.example.com/iframe',
      };
      break;

    default:
      throw new Error(`Unknown transport type: ${type}`);
  }

  return { ...baseConfig, ...overrides };
}

/**
 * Create an invalid test transport configuration.
 *
 * Generates transport configurations with various validation errors
 * for testing error handling and validation logic.
 *
 * @param errorType - Type of validation error to create
 * @param options - Additional configuration options
 * @returns An invalid TransportConfig object
 *
 * @example
 * ```typescript
 * import { createInvalidTransportConfig } from '@walletmesh/discovery/testing';
 *
 * // Invalid extension ID format
 * const invalidExtension = createInvalidTransportConfig('invalid-extension-id');
 *
 * // Missing required field
 * const missingField = createInvalidTransportConfig('missing-field', { type: 'popup' });
 *
 * // Invalid URL format
 * const invalidUrl = createInvalidTransportConfig('invalid-url');
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createInvalidTransportConfig(
  errorType: 'invalid-extension-id' | 'missing-field' | 'invalid-url' | 'invalid-type' | 'insecure-url',
  options: { type?: TransportConfig['type'] } = {},
): TransportConfig {
  switch (errorType) {
    case 'invalid-extension-id':
      return {
        type: 'extension',
        extensionId: 'invalid-id-format', // Too short, wrong format
      };

    case 'missing-field':
      switch (options.type) {
        case 'extension':
          return { type: 'extension' } as TransportConfig; // Missing extensionId
        case 'popup':
          return { type: 'popup' } as TransportConfig; // Missing popupUrl
        case 'websocket':
          return { type: 'websocket' } as TransportConfig; // Missing websocketUrl
        default:
          return { type: 'extension' } as TransportConfig;
      }

    case 'invalid-url':
      return {
        type: 'popup',
        url: 'not-a-valid-url',
      };

    case 'insecure-url':
      return {
        type: 'popup',
        url: 'http://insecure.example.com/popup', // HTTP instead of HTTPS
      };

    case 'invalid-type':
      return {
        type: 'unknown-transport-type' as TransportConfig['type'],
      };

    default:
      throw new Error(`Unknown error type: ${errorType}`);
  }
}

/**
 * Collection of predefined transport configurations for common testing scenarios.
 */
export const testTransportConfigs = {
  /**
   * Valid Chrome extension transport configuration.
   */
  chromeExtension: (): TransportConfig => createTestTransportConfig({ type: 'extension' }),

  /**
   * Valid Firefox extension transport configuration.
   */
  firefoxExtension: (): TransportConfig =>
    createTestTransportConfig({
      type: 'extension',
      overrides: { extensionId: '{12345678-1234-1234-1234-123456789abc}' }, // Firefox GUID format
    }),

  /**
   * Valid popup transport configuration.
   */
  popup: (): TransportConfig => createTestTransportConfig({ type: 'popup' }),

  /**
   * Valid WebSocket transport configuration.
   */
  websocket: (): TransportConfig => createTestTransportConfig({ type: 'websocket' }),

  /**
   * Valid postmessage provider transport configuration.
   */
  postmessage: (): TransportConfig => createTestTransportConfig({ type: 'postmessage' }),

  /**
   * Transport config with wallet adapter configuration.
   */
  withAdapter: (): TransportConfig =>
    createTestTransportConfig({
      type: 'extension',
      overrides: {
        metadata: {
          walletAdapter: 'TestWalletAdapter',
          adapterConfig: {
            apiVersion: '1.0',
            features: ['signing', 'encryption'],
          },
        },
      },
    }),

  /**
   * Collection of invalid transport configurations for error testing.
   */
  invalid: {
    extensionId: (): TransportConfig => createInvalidTransportConfig('invalid-extension-id'),
    missingExtensionId: (): TransportConfig =>
      createInvalidTransportConfig('missing-field', { type: 'extension' }),
    missingPopupUrl: (): TransportConfig => createInvalidTransportConfig('missing-field', { type: 'popup' }),
    missingWebsocketUrl: (): TransportConfig =>
      createInvalidTransportConfig('missing-field', { type: 'websocket' }),
    invalidUrl: (): TransportConfig => createInvalidTransportConfig('invalid-url'),
    insecureUrl: (): TransportConfig => createInvalidTransportConfig('insecure-url'),
    invalidType: (): TransportConfig => createInvalidTransportConfig('invalid-type'),
  },
};

/**
 * Create multiple transport configurations for testing.
 *
 * Useful for testing scenarios that involve multiple transport options
 * or fallback mechanisms.
 *
 * @param types - Array of transport types to create
 * @param options - Shared options for all configurations
 * @returns Array of TransportConfig objects
 *
 * @example
 * ```typescript
 * import { createMultipleTransportConfigs } from '@walletmesh/discovery/testing';
 *
 * // Create configs for all transport types
 * const allTransports = createMultipleTransportConfigs(['extension', 'popup', 'websocket', 'injected']);
 *
 * // Test multi-transport responder
 * const responder = createDiscoveryResponder({
 *   responderInfo: {
 *     // ... other fields ...
 *     transportConfig: allTransports[0] // Primary transport
 *   }
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createMultipleTransportConfigs(
  types: Array<'extension' | 'popup' | 'websocket' | 'postmessage' | 'iframe'>,
  options: Omit<TestTransportOptions, 'type'> = {},
): TransportConfig[] {
  return types.map((type) => createTestTransportConfig({ ...options, type }));
}

/**
 * Validate that a transport configuration matches expected criteria.
 *
 * Utility function for asserting transport configuration properties in tests.
 *
 * @param config - Transport configuration to validate
 * @param expected - Expected properties
 * @returns True if configuration matches criteria
 *
 * @example
 * ```typescript
 * import { validateTestTransportConfig } from '@walletmesh/discovery/testing';
 *
 * const config = createTestTransportConfig({ type: 'extension' });
 *
 * expect(validateTestTransportConfig(config, {
 *   type: 'extension',
 *   hasExtensionId: true
 * })).toBe(true);
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function validateTestTransportConfig(
  config: TransportConfig,
  expected: {
    type?: TransportConfig['type'];
    hasExtensionId?: boolean;
    hasPopupUrl?: boolean;
    hasWebsocketUrl?: boolean;
    hasWalletAdapter?: boolean;
  },
): boolean {
  if (expected.type && config.type !== expected.type) {
    return false;
  }

  if (expected.hasExtensionId && !('extensionId' in config && config.extensionId)) {
    return false;
  }

  if (expected.hasPopupUrl && !('popupUrl' in config && config.popupUrl)) {
    return false;
  }

  if (expected.hasWebsocketUrl && !('websocketUrl' in config && config.websocketUrl)) {
    return false;
  }

  if (expected.hasWalletAdapter && !('walletAdapter' in config && config.walletAdapter)) {
    return false;
  }

  return true;
}
