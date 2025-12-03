/**
 * Tests for transport factory
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupMocks, testSetupPatterns } from '../../testing/index.js';
import { type ChromeExtensionConfig, type PopupConfig, TransportType } from '../../types.js';
import { ChromeExtensionTransport, PopupWindowTransport } from '../transports/index.js';
import { createTransport } from './transport.js';

// Mock the transport classes using centralized mock pattern
vi.mock('../transports/index.js', () => {
  const popupWindowSpy = vi.fn();
  const chromeExtensionTransportSpy = vi.fn();

  return {
    PopupWindowTransport: popupWindowSpy,
    ChromeExtensionTransport: chromeExtensionTransportSpy,
  };
});

// Setup mocks using centralized mock system
setupMocks.serviceFactories();
setupMocks.errorFactory();

describe('createTransport', () => {
  // Use minimal test setup pattern to preserve vi.mock implementations
  const testEnv = testSetupPatterns.minimal();

  beforeEach(async () => {
    await testEnv.setup();
    vi.clearAllMocks(); // Clear mock calls between tests
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  it('should create a PopupTransport with default config', () => {
    createTransport(TransportType.Popup);

    expect(PopupWindowTransport).toHaveBeenCalled();
    const calls = (PopupWindowTransport as vi.MockedFunction<typeof PopupWindowTransport>).mock.calls;
    expect(calls[0][0]).toEqual({}); // config
    expect(calls[0][1]).toHaveProperty('debug'); // logger
    // errorHandler might be undefined in test environment
  });

  it('should create a PopupTransport with custom config', () => {
    const config: PopupConfig = {
      url: 'https://example.com/popup',
      timeout: 5000,
    };

    createTransport(TransportType.Popup, config);

    expect(PopupWindowTransport).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        debug: expect.any(Function),
      }),
      undefined, // errorHandler is undefined in the mock
    );
  });

  it('should create a ChromeExtensionTransport with valid config', () => {
    const config: ChromeExtensionConfig = {
      extensionId: 'abcdefghijklmnopqrstuvwxyz',
      timeout: 5000,
    };

    createTransport(TransportType.Extension, config);

    expect(ChromeExtensionTransport).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        debug: expect.any(Function),
      }),
      undefined,
    );
  });

  it('should throw an error when creating a ChromeExtensionTransport without extensionId', () => {
    expect(() => {
      createTransport(TransportType.Extension, {});
    }).toThrow('Invalid transport configuration for extension');
  });

  it('should throw configuration error when extensionId is missing from Chrome extension config', () => {
    const config: ChromeExtensionConfig = {
      // Missing extensionId but has other properties
      timeout: 5000,
    } as ChromeExtensionConfig;

    expect(() => {
      createTransport(TransportType.Extension, config);
    }).toThrow('Invalid transport configuration for extension');
  });

  it('should throw configuration error when extensionId is empty string', () => {
    const config: ChromeExtensionConfig = {
      extensionId: '', // Empty string
      timeout: 5000,
    };

    expect(() => {
      createTransport(TransportType.Extension, config);
    }).toThrow('Invalid transport configuration for extension');
  });

  it('should create PopupTransport with minimal config', () => {
    const config: PopupConfig = {
      url: 'https://example.com/popup',
      timeout: 3000,
    };

    createTransport(TransportType.Popup, config);

    // Verify transport was created with logger and error handler
    expect(PopupWindowTransport).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        debug: expect.any(Function),
      }),
      undefined,
    );
  });

  it('should create Chrome extension transport with minimal config', () => {
    const config: ChromeExtensionConfig = {
      extensionId: 'abcdefghijklmnopqrstuvwxyz',
      timeout: 3000,
    };

    createTransport(TransportType.Extension, config);

    // Verify transport was created
    expect(ChromeExtensionTransport).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        debug: expect.any(Function),
      }),
      undefined,
    );
  });

  it('should throw an error for unsupported transport type', () => {
    expect(() => {
      // @ts-expect-error - Testing invalid type
      createTransport('INVALID_TYPE');
    }).toThrow('Unsupported transport type');
  });

  it('should validate configuration and throw error for invalid popup config', () => {
    const invalidConfig = {
      url: 'not-a-valid-url', // Invalid URL should fail schema validation
      timeout: 'invalid', // Should be number
      // biome-ignore lint/suspicious/noExplicitAny: Intentionally invalid config for testing validation
    } as any;

    expect(() => {
      createTransport(TransportType.Popup, invalidConfig);
    }).toThrow('Invalid transport configuration for popup');
  });

  it('should validate configuration and throw error for invalid extension config', () => {
    const invalidConfig = {
      extensionId: 123, // Should be string
      timeout: 'invalid', // Should be number
      // biome-ignore lint/suspicious/noExplicitAny: Intentionally invalid config for testing validation
    } as any;

    expect(() => {
      createTransport(TransportType.Extension, invalidConfig);
    }).toThrow('Invalid transport configuration for extension');
  });

  it('should handle unknown transport types with base validation', () => {
    // Test the default case in the switch statement for validation
    expect(() => {
      // @ts-expect-error - Testing with mock unknown type
      createTransport('unknown' as TransportType, { invalidProperty: true });
    }).toThrow('Unsupported transport type');
  });
});
