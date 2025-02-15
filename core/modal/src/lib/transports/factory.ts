/**
 * @file factory.ts
 * @packageDocumentation
 * Transport factory implementation.
 */

import type { Transport, TransportType, TransportConfig } from './types.js';
import { TransportTypes } from './types.js';
import type { ChromeExtensionConfig } from './chrome/ChromeExtensionTransport.js';
import { ChromeExtensionTransport } from './chrome/ChromeExtensionTransport.js';

/**
 * Type guard for Chrome extension configuration
 */
function isChromeConfig(config: unknown): config is ChromeExtensionConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'extensionId' in config &&
    typeof (config as ChromeExtensionConfig).extensionId === 'string'
  );
}

/**
 * Creates a transport instance based on configuration.
 *
 * @param config - Transport configuration
 * @returns Transport instance
 * @throws {Error} If transport type is invalid or configuration is incorrect
 */
export function createTransport<T extends TransportConfig>(config: T): Transport {
  switch (config.type) {
    case TransportTypes.CHROME_EXTENSION: {
      if (!isChromeConfig(config.config)) {
        throw new Error('Invalid Chrome extension transport configuration');
      }
      return new ChromeExtensionTransport(config.config);
    }
    // Add other transport types here as needed
    default:
      throw new Error(`Unsupported transport type: ${config.type}`);
  }
}

// Re-export types
export type { TransportType, TransportConfig };
export { TransportTypes };
