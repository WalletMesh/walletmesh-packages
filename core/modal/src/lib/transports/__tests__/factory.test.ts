/**
 * @file factory.test.ts
 * @packageDocumentation
 * Tests for the transport factory.
 */

import { describe, it, expect } from 'vitest';
import { createTransport } from '../createTransport.js';
import type { TransportConfig } from '../types.js';
import { TransportTypes } from '../types.js';
import type { ChromeExtensionConfig } from '../chrome/ChromeExtensionTransport.js';
import { ChromeExtensionTransport } from '../chrome/ChromeExtensionTransport.js';

describe('Transport Factory', () => {
  describe('createTransport', () => {
    it('should create ChromeExtensionTransport with valid config', () => {
      const config: TransportConfig<ChromeExtensionConfig> = {
        type: TransportTypes.CHROME_EXTENSION,
        config: {
          extensionId: 'test-extension-id',
          timeout: 1000,
          reconnectAttempts: 3,
          autoReconnect: true,
        },
      };

      const transport = createTransport(config);
      expect(transport).toBeInstanceOf(ChromeExtensionTransport);
      expect(transport.getType()).toBe(TransportTypes.CHROME_EXTENSION);
    });

    it('should throw on missing required config', () => {
      const config = {
        type: TransportTypes.CHROME_EXTENSION,
        config: {
          timeout: 1000,
        },
      } as TransportConfig<ChromeExtensionConfig>;

      expect(() => createTransport(config)).toThrow('Invalid Chrome extension transport configuration');
    });

    it('should throw on invalid extension ID', () => {
      const config: TransportConfig<ChromeExtensionConfig> = {
        type: TransportTypes.CHROME_EXTENSION,
        config: {
          extensionId: '', // Empty string is invalid
          timeout: 1000,
        },
      };

      expect(() => createTransport(config)).toThrow('Invalid Chrome extension transport configuration');
    });

    it('should throw on invalid transport type', () => {
      // Using unknown type to bypass type checking for testing invalid types
      const invalidConfig = {
        type: 'invalid_type',
        config: {},
      };

      expect(() => createTransport(invalidConfig as unknown as TransportConfig)).toThrow(
        'Unsupported transport type',
      );
    });

    it('should pass all configuration options to transport', () => {
      const transportConfig: ChromeExtensionConfig = {
        extensionId: 'test-extension-id',
        timeout: 1000,
        reconnectAttempts: 3,
        autoReconnect: true,
        portName: 'test-port',
        reconnectDelay: 500,
      };

      const config: TransportConfig<ChromeExtensionConfig> = {
        type: TransportTypes.CHROME_EXTENSION,
        config: transportConfig,
      };

      const transport = createTransport(config) as ChromeExtensionTransport;
      expect(transport).toBeInstanceOf(ChromeExtensionTransport);
      expect(transport.isConnected()).toBe(false);
      expect(transport.getType()).toBe(TransportTypes.CHROME_EXTENSION);
    });

    it('should handle minimal valid configuration', () => {
      const config: TransportConfig<ChromeExtensionConfig> = {
        type: TransportTypes.CHROME_EXTENSION,
        config: {
          extensionId: 'test-extension-id',
        },
      };

      const transport = createTransport(config);
      expect(transport).toBeInstanceOf(ChromeExtensionTransport);
      expect(transport.getType()).toBe(TransportTypes.CHROME_EXTENSION);
    });
  });
});
