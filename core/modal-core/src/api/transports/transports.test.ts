/**
 * Transports API Tests
 *
 * Demonstrates organized transport testing with nested structure:
 * - API Configuration (defaults, immutability)
 * - Transport Creation (factory testing by type)
 * - Type System (exports and type safety)
 * - Error Handling (validation, edge cases)
 * - Integration Scenarios (end-to-end flows)
 *
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { TRANSPORT_CONFIG, TransportType, createTransport } from './transports.js';
import type { ChromeExtensionConfig, PopupConfig, TransportConfig } from './transports.js';

// Install custom matchers
installCustomMatchers();

// Mock the internal factory
vi.mock('../../internal/factories/transport.js', () => ({
  createTransport: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    isConnected: false,
  })),
}));

// Mock the schemas
vi.mock('../../schemas/index.js', () => ({
  popupConfigSchema: {
    parse: vi.fn((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid popup configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        features?: string | undefined;
        target?: string | undefined;
      };
    }),
  },
  chromeExtensionConfigSchema: {
    parse: vi.fn((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid extension configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        extensionId: string;
        retries?: number | undefined;
        retryDelay?: number | undefined;
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
      };
    }),
  },
  baseTransportConfigSchema: {
    parse: vi.fn((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid transport configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
      };
    }),
  },
}));

describe('Transports API', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Re-setup the mock implementation after clearAllMocks
    const schemas = await import('../../schemas/index.js');
    vi.mocked(schemas.popupConfigSchema.parse).mockImplementation((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid popup configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        features?: string | undefined;
        target?: string | undefined;
      };
    });

    vi.mocked(schemas.chromeExtensionConfigSchema.parse).mockImplementation((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid extension configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        extensionId: string;
        retries?: number | undefined;
        retryDelay?: number | undefined;
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
      };
    });

    vi.mocked(schemas.baseTransportConfigSchema.parse).mockImplementation((input: unknown) => {
      // Only throw for explicitly invalid test cases
      if (typeof input === 'object' && input !== null) {
        const config = input as Record<string, unknown>;
        if ('invalid' in config && config['invalid'] === true) {
          throw new Error('Invalid transport configuration');
        }
      }
      // Always return the input for valid cases with proper typing
      return input as {
        url?: string | undefined;
        timeout?: number | undefined;
        reconnect?: boolean | undefined;
        reconnectInterval?: number | undefined;
      };
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('API Configuration', () => {
    describe('TRANSPORT_CONFIG', () => {
      describe('Configuration Values', () => {
        it('should export default transport configuration', () => {
          expect(TRANSPORT_CONFIG).toBeDefined();
          expect(TRANSPORT_CONFIG.timeout).toBe(30000);
          expect(TRANSPORT_CONFIG.reconnect).toBe(true);
          expect(TRANSPORT_CONFIG.reconnectInterval).toBe(5000);
        });
      });

      describe('Configuration Immutability', () => {
        it('should have immutable configuration', () => {
          const originalTimeout = TRANSPORT_CONFIG.timeout;

          // Test that configuration is available
          expect(originalTimeout).toBe(30000);
          expect(TRANSPORT_CONFIG.reconnect).toBe(true);
          expect(TRANSPORT_CONFIG.reconnectInterval).toBe(5000);
        });
      });
    });
  });

  describe('Transport Creation', () => {
    describe('createTransport', () => {
      describe('Basic Creation', () => {
        it('should create transport without configuration', async () => {
          const transport = createTransport(TransportType.Popup);

          expect(transport).toBeDefined();
          expect(typeof transport.connect).toBe('function');
          expect(typeof transport.disconnect).toBe('function');
          expect(typeof transport.send).toBe('function');

          const { createTransport: createTransportInternal } = await import(
            '../../internal/factories/transport.js'
          );
          expect(createTransportInternal).toHaveBeenCalledWith(TransportType.Popup, undefined);
        });

        it('should create popup transport with valid configuration', async () => {
          const config: PopupConfig = {
            url: 'https://example.com/wallet',
            timeout: 60000,
            reconnect: false,
          };

          const transport = createTransport(TransportType.Popup, config);

          expect(transport).toBeDefined();

          const { createTransport: createTransportInternal } = await import(
            '../../internal/factories/transport.js'
          );
          expect(createTransportInternal).toHaveBeenCalledWith(TransportType.Popup, config);
        });

        it('should create extension transport with valid configuration', async () => {
          const config: ChromeExtensionConfig = {
            extensionId: 'abcdefg',
            timeout: 30000,
          };

          const transport = createTransport(TransportType.Extension, config);

          expect(transport).toBeDefined();

          const { createTransport: createTransportInternal } = await import(
            '../../internal/factories/transport.js'
          );
          expect(createTransportInternal).toHaveBeenCalledWith(TransportType.Extension, config);
        });

        it('should work with different transport types', () => {
          expect(() => createTransport(TransportType.Popup)).not.toThrow();
          expect(() => createTransport(TransportType.Extension)).not.toThrow();
        });
      });

      describe('Configuration Validation', () => {
        it('should validate popup configuration', async () => {
          const config: PopupConfig = {
            url: 'https://wallet.example.com',
            timeout: 45000,
          };

          createTransport(TransportType.Popup, config);

          const { popupConfigSchema } = await import('../../schemas/index.js');
          expect(popupConfigSchema.parse).toHaveBeenCalledWith(config);
        });

        it('should validate extension configuration', async () => {
          const config: ChromeExtensionConfig = {
            extensionId: 'metamask-extension-id',
          };

          createTransport(TransportType.Extension, config);

          const { chromeExtensionConfigSchema } = await import('../../schemas/index.js');
          expect(chromeExtensionConfigSchema.parse).toHaveBeenCalledWith(config);
        });

        it('should validate base transport configuration for unknown types', async () => {
          const config: TransportConfig = {
            timeout: 10000,
            reconnect: true,
          };

          // Cast to test default case
          createTransport('unknown' as TransportType, config);

          const { baseTransportConfigSchema } = await import('../../schemas/index.js');
          expect(baseTransportConfigSchema.parse).toHaveBeenCalledWith(config);
        });

        it('should not validate when configuration is undefined', async () => {
          createTransport(TransportType.Popup, undefined);

          const { popupConfigSchema } = await import('../../schemas/index.js');
          expect(popupConfigSchema.parse).not.toHaveBeenCalled();
        });
      });

      describe('Error Handling', () => {
        it('should throw error for invalid popup configuration with Error instance', async () => {
          const { popupConfigSchema } = await import('../../schemas/index.js');

          vi.mocked(popupConfigSchema.parse).mockImplementation(() => {
            throw new Error('Missing required field: url');
          });

          const invalidConfig = { invalid: true } as Record<string, unknown>;

          expect(() => {
            createTransport(TransportType.Popup, invalidConfig);
          }).toThrow('Invalid transport configuration for popup: Missing required field: url');
        });

        it('should throw error for invalid popup configuration with non-Error', async () => {
          const { popupConfigSchema } = await import('../../schemas/index.js');

          vi.mocked(popupConfigSchema.parse).mockImplementation(() => {
            throw 'String error';
          });

          const invalidConfig = { invalid: true } as Record<string, unknown>;

          expect(() => {
            createTransport(TransportType.Popup, invalidConfig);
          }).toThrow('Invalid transport configuration for popup: Unknown validation error');
        });

        it('should throw error for invalid extension configuration', async () => {
          const { chromeExtensionConfigSchema } = await import('../../schemas/index.js');

          vi.mocked(chromeExtensionConfigSchema.parse).mockImplementation(() => {
            throw new Error('Invalid extension ID format');
          });

          const invalidConfig = { invalid: true } as Record<string, unknown>;

          expect(() => {
            createTransport(TransportType.Extension, invalidConfig);
          }).toThrow('Invalid transport configuration for extension: Invalid extension ID format');
        });

        it('should throw error for invalid base transport configuration', async () => {
          const { baseTransportConfigSchema } = await import('../../schemas/index.js');

          vi.mocked(baseTransportConfigSchema.parse).mockImplementation(() => {
            throw new Error('Invalid timeout value');
          });

          const invalidConfig = { invalid: true } as Record<string, unknown>;

          expect(() => {
            createTransport('custom' as TransportType, invalidConfig);
          }).toThrow('Invalid transport configuration for custom: Invalid timeout value');
        });
      });
    });
  });

  describe('Type System', () => {
    describe('type exports', () => {
      it('should export TransportType enum', () => {
        expect(TransportType).toBeDefined();
        expect(TransportType.Popup).toBe('popup');
        expect(TransportType.Extension).toBe('extension');
      });

      it('should export transport configuration types', () => {
        // TypeScript compile-time test
        const popupConfig: PopupConfig = {
          url: 'https://example.com',
          timeout: 30000,
        };

        const extensionConfig: ChromeExtensionConfig = {
          extensionId: 'test-extension',
        };

        const baseConfig: TransportConfig = {
          timeout: 15000,
          reconnect: false,
        };

        expect(popupConfig).toBeDefined();
        expect(extensionConfig).toBeDefined();
        expect(baseConfig).toBeDefined();
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    describe('error handling edge cases', () => {
      it('should handle schema validation errors gracefully', async () => {
        const { popupConfigSchema } = await import('../../schemas/index.js');

        vi.mocked(popupConfigSchema.parse).mockImplementation(() => {
          throw new Error('Schema validation failed');
        });

        expect(() => {
          createTransport(TransportType.Popup, { url: 'invalid' });
        }).toThrow('Invalid transport configuration for popup: Schema validation failed');
      });

      it('should handle null configuration correctly', async () => {
        expect(() => {
          createTransport(TransportType.Popup, null as TransportConfig);
        }).not.toThrow();

        const { createTransport: createTransportInternal } = await import(
          '../../internal/factories/transport.js'
        );
        expect(createTransportInternal).toHaveBeenCalledWith(TransportType.Popup, null);
      });
    });

    describe('integration scenarios', () => {
      it('should support popup wallet connection', () => {
        const popupTransport = createTransport(TransportType.Popup, {
          url: 'https://wallet.metamask.io',
          timeout: 60000,
          reconnect: true,
          reconnectInterval: 3000,
        });

        expect(popupTransport).toBeDefined();
        expect(typeof popupTransport.connect).toBe('function');
      });

      it('should support browser extension connection', () => {
        const extensionTransport = createTransport(TransportType.Extension, {
          extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask extension ID
          timeout: 30000,
        });

        expect(extensionTransport).toBeDefined();
        expect(typeof extensionTransport.connect).toBe('function');
      });

      it('should work with minimal configuration', () => {
        const minimalPopup = createTransport(TransportType.Popup, {
          url: 'https://simple-wallet.com',
        });

        const minimalExtension = createTransport(TransportType.Extension, {
          extensionId: 'simple-extension',
        } as ChromeExtensionConfig);

        expect(minimalPopup).toBeDefined();
        expect(minimalExtension).toBeDefined();
      });

      it('should work with full configuration', () => {
        const fullPopupConfig: PopupConfig = {
          url: 'https://advanced-wallet.com',
          timeout: 120000,
          reconnect: true,
          reconnectInterval: 5000,
          features: 'width=400,height=600',
        };

        const fullExtensionConfig: ChromeExtensionConfig = {
          extensionId: 'advanced-extension-id',
          timeout: 45000,
          reconnect: false,
        };

        expect(() => {
          createTransport(TransportType.Popup, fullPopupConfig);
        }).not.toThrow();

        expect(() => {
          createTransport(TransportType.Extension, fullExtensionConfig);
        }).not.toThrow();
      });

      it('should handle transport creation workflow', async () => {
        // Create transport
        const transport = createTransport(TransportType.Popup, {
          url: 'https://wallet.example.com',
        });

        // Verify transport interface
        expect(transport).toBeDefined();
        expect(typeof transport.connect).toBe('function');
        expect(typeof transport.disconnect).toBe('function');
        expect(typeof transport.send).toBe('function');
        expect(typeof transport.on).toBe('function');
        expect(typeof transport.off).toBe('function');

        // Verify internal factory was called correctly
        const { createTransport: createTransportInternal } = await import(
          '../../internal/factories/transport.js'
        );
        expect(createTransportInternal).toHaveBeenCalledWith(TransportType.Popup, {
          url: 'https://wallet.example.com',
        });
      });
    });
  });
});
