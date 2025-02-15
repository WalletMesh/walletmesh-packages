/**
 * @file ChromeExtensionTransport.integration.test.ts
 * @packageDocumentation
 * Integration tests for Chrome extension transport.
 */

import '../../../../__tests__/setup-integration.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChromeExtensionTransport } from '../ChromeExtensionTransport.js';
import type { ChromeMessage, ChromePort } from '../types.js';
import {
  hasChromeRuntime,
  createTestMessage,
  createDisconnectMessage,
  verifyMessages,
} from './test-helpers.js';

describe('ChromeExtensionTransport Integration', () => {
  const mockConfig = {
    extensionId: 'test-extension-id',
    timeout: 100,
    reconnectAttempts: 2,
    reconnectDelay: 50,
    autoReconnect: true,
  };

  let transport: ChromeExtensionTransport;
  let mockPort: ChromePort;
  let messageHandlers: Array<(message: ChromeMessage) => void> = [];
  let disconnectHandlers: Array<(() => void) & { portName?: string }> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    messageHandlers = [];
    disconnectHandlers = [];
  });

  afterEach(async () => {
    if (transport) {
      await transport.disconnect();
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Connection Lifecycle', () => {
    it('should handle connection loss and auto-reconnect', async () => {
      let connectionAttempts = 0;
      const messageLog: ChromeMessage[] = [];

      // Create mock port factory
      const createMockPort = (): ChromePort => {
        const portName = `port-${crypto.randomUUID()}`;
        const port: ChromePort = {
          name: portName,
          disconnect: vi.fn(),
          onMessage: {
            addListener: vi.fn((handler) => messageHandlers.push(handler)),
            removeListener: vi.fn(),
          },
          onDisconnect: {
            addListener: vi.fn((handler) => {
              const wrappedHandler = () => {
                handler();
              };
              wrappedHandler.portName = portName;
              disconnectHandlers.push(wrappedHandler);
            }),
            removeListener: vi.fn(),
          },
          postMessage: vi.fn((message: ChromeMessage) => {
            messageLog.push(message);
          }),
        };
        return port;
      };

      // Setup runtime with proper initialization
      mockPort = createMockPort();
      if (hasChromeRuntime(window)) {
        window.chrome.runtime.connect = vi.fn(() => {
          connectionAttempts++;
          return createMockPort();
        });
      }

      transport = new ChromeExtensionTransport(mockConfig);

      // Initial connection
      await transport.connect();
      expect(transport.isConnected()).toBe(true);

      // Send test messages
      const testMessages = Array.from({ length: 3 }, (_, i) => createTestMessage(i));
      for (const message of testMessages) {
        await transport.send(message.payload);
      }

      // Trigger disconnect and advance timers
      if (disconnectHandlers[0]) {
        disconnectHandlers[0]();
      }

      // Advance past reconnection attempts
      vi.advanceTimersByTime(mockConfig.reconnectDelay * (mockConfig.reconnectAttempts + 1));

      // Verify attempts and messages
      expect(connectionAttempts).toBeGreaterThanOrEqual(2);
      expect(messageLog.length).toBeGreaterThanOrEqual(testMessages.length);
      expect(verifyMessages(messageLog.slice(0, testMessages.length), testMessages)).toBe(true);
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      const connectCalls = new Set<string>();
      const disconnectCalls = new Set<string>();
      const cycles = 3;

      // Setup mock port
      mockPort = {
        name: 'test-port',
        disconnect: vi.fn(() => {
          disconnectCalls.add(crypto.randomUUID());
        }),
        onMessage: {
          addListener: vi.fn((handler) => messageHandlers.push(handler)),
          removeListener: vi.fn(),
        },
        onDisconnect: {
          addListener: vi.fn((handler) => {
            const wrappedHandler = () => {
              handler();
            };
            wrappedHandler.portName = 'test-port';
            disconnectHandlers.push(wrappedHandler);
          }),
          removeListener: vi.fn(),
        },
        postMessage: vi.fn(),
      };

      if (hasChromeRuntime(window)) {
        window.chrome.runtime.connect = vi.fn(() => {
          connectCalls.add(crypto.randomUUID());
          return mockPort;
        });
      }

      transport = new ChromeExtensionTransport(mockConfig);

      // Perform rapid connect/disconnect cycles
      for (let i = 0; i < cycles; i++) {
        await transport.connect();
        await transport.disconnect();

        // Send disconnect message to simulate port disconnect
        const disconnectMessage = createDisconnectMessage();
        for (const handler of messageHandlers) {
          handler(disconnectMessage);
        }
        vi.advanceTimersByTime(10);
      }

      // Verify connect/disconnect calls
      expect(connectCalls.size).toBe(cycles);
      expect(disconnectCalls.size).toBeGreaterThanOrEqual(cycles);
      expect(transport.isConnected()).toBe(false);
    });
  });
});
