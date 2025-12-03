/**
 * Transport Configuration Schema Tests
 *
 * Demonstrates excellent nested test organization by schema type and validation scenario.
 * Organized by:
 * - Base Schema Validation (core transport config)
 * - Transport-Specific Schemas (popup, chrome extension)
 * - Union Schema Validation (combined transport configs)
 *
 * This structure makes it easy to locate and maintain specific validation tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  baseTransportConfigSchema,
  popupConfigSchema,
  chromeExtensionConfigSchema,
  transportConfigSchema,
} from '../configs.js';

describe('Transport Configuration Schemas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('Base Schema Validation', () => {
    describe('baseTransportConfigSchema', () => {
      describe('Valid Configurations', () => {
        it('should validate valid base transport config', () => {
          const validConfig = {
            url: 'https://example.com',
            timeout: 5000,
            reconnect: true,
            reconnectInterval: 1000,
          };

          expect(() => baseTransportConfigSchema.parse(validConfig)).not.toThrow();
        });

        it('should validate empty config', () => {
          expect(() => baseTransportConfigSchema.parse({})).not.toThrow();
        });
      });

      describe('Invalid Configurations', () => {
        it('should reject invalid URL', () => {
          const invalidConfig = {
            url: 'not-a-url',
          };

          expect(() => baseTransportConfigSchema.parse(invalidConfig)).toThrow();
        });

        describe('Timeout Validation', () => {
          it('should reject negative timeout', () => {
            const invalidConfig = {
              timeout: -1000,
            };

            expect(() => baseTransportConfigSchema.parse(invalidConfig)).toThrow();
          });

          it('should reject non-integer timeout', () => {
            const invalidConfig = {
              timeout: 1000.5,
            };

            expect(() => baseTransportConfigSchema.parse(invalidConfig)).toThrow();
          });
        });
      });
    });
  });

  describe('Transport-Specific Schemas', () => {
    describe('popupConfigSchema', () => {
      describe('Valid Popup Configurations', () => {
        it('should validate valid popup config', () => {
          const validConfig = {
            url: 'https://example.com',
            width: 800,
            height: 600,
            target: '_blank',
            features: 'resizable=yes',
          };

          expect(() => popupConfigSchema.parse(validConfig)).not.toThrow();
        });
      });

      describe('Inheritance and Validation', () => {
        it('should inherit base config validation', () => {
          const configWithInvalidUrl = {
            url: 'not-a-url',
            width: 800,
          };

          expect(() => popupConfigSchema.parse(configWithInvalidUrl)).toThrow();
        });

        it('should reject negative dimensions', () => {
          const invalidConfig = {
            width: -800,
            height: 600,
          };

          expect(() => popupConfigSchema.parse(invalidConfig)).toThrow();
        });
      });
    });
  });

  describe('chromeExtensionConfigSchema', () => {
    describe('Valid Extension Configurations', () => {
      it('should validate valid chrome extension config', () => {
        const validConfig = {
          extensionId: 'abcdefghijklmnopqrstuvwxyz123456',
          retries: 3,
          retryDelay: 1000,
        };

        expect(() => chromeExtensionConfigSchema.parse(validConfig)).not.toThrow();
      });
    });

    describe('Extension ID Validation', () => {
      it('should require extensionId', () => {
        const invalidConfig = {
          retries: 3,
        };

        expect(() => chromeExtensionConfigSchema.parse(invalidConfig)).toThrow();
      });

      it('should reject empty extensionId', () => {
        const invalidConfig = {
          extensionId: '',
        };

        expect(() => chromeExtensionConfigSchema.parse(invalidConfig)).toThrow();
      });
    });

    describe('Retry Configuration Validation', () => {
      it('should reject negative retries', () => {
        const invalidConfig = {
          extensionId: 'valid-id',
          retries: -1,
        };

        expect(() => chromeExtensionConfigSchema.parse(invalidConfig)).toThrow();
      });
    });
  });
});

describe('Union Schema Validation', () => {
  describe('transportConfigSchema', () => {
    describe('Valid Transport Configurations', () => {
      it('should validate popup transport config', () => {
        const validConfig = {
          type: 'popup' as const,
          config: {
            width: 800,
            height: 600,
          },
        };

        expect(() => transportConfigSchema.parse(validConfig)).not.toThrow();
      });

      it('should validate chrome extension transport config', () => {
        const validConfig = {
          type: 'chrome-extension' as const,
          config: {
            extensionId: 'valid-extension-id',
          },
        };

        expect(() => transportConfigSchema.parse(validConfig)).not.toThrow();
      });
    });

    describe('Invalid Transport Configurations', () => {
      it('should reject invalid transport type', () => {
        const invalidConfig = {
          type: 'invalid-type',
          config: {},
        };

        expect(() => transportConfigSchema.parse(invalidConfig)).toThrow();
      });

      it('should reject mismatched type and config', () => {
        const invalidConfig = {
          type: 'chrome-extension' as const,
          config: {
            width: 800, // popup config for chrome-extension type
          },
        };

        expect(() => transportConfigSchema.parse(invalidConfig)).toThrow();
      });
    });
  });
});
