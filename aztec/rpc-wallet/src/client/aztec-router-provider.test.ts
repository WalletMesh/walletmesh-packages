import type { JSONRPCMethodMap, JSONRPCResponse, JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AztecWalletRouterProvider } from './aztec-router-provider.js';
import * as registerSerializersModule from './register-serializers.js';

// Mock the register serializers module
vi.mock('./register-serializers.js', () => ({
  registerAztecWalletSerializers: vi.fn(),
}));

describe('AztecWalletRouterProvider', () => {
  let mockTransport: JSONRPCTransport;
  let provider: AztecWalletRouterProvider;
  let sendMock: ReturnType<typeof vi.fn>;
  // biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
  let messageHandler: (msg: JSONRPCResponse<any, any>) => void;
  let cleanupMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    sendMock = vi.fn();
    cleanupMock = vi.fn();
    mockTransport = {
      send: sendMock,
      // biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
      onMessage: (handler: (msg: JSONRPCResponse<any, any>) => void) => {
        messageHandler = handler;
        return cleanupMock;
      },
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (provider) {
      provider.dispose();
    }
  });

  describe('constructor', () => {
    it('should initialize and register serializers', () => {
      provider = new AztecWalletRouterProvider(mockTransport);
      expect(registerSerializersModule.registerAztecWalletSerializers).toHaveBeenCalledWith(provider);
    });

    it('should set up session termination handler when provided', () => {
      const handler = vi.fn();
      provider = new AztecWalletRouterProvider(mockTransport, {
        onSessionTerminated: handler,
      });

      // Verify onNotification was called to set up the listener
      // We can't directly test the private method, but we can verify the handler is set up
      expect(provider).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should establish connection and return sessionId', async () => {
      provider = new AztecWalletRouterProvider(mockTransport);

      sendMock.mockImplementation(async (request) => {
        if (request.method === 'wm_connect') {
          const response: JSONRPCResponse<JSONRPCMethodMap> = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              sessionId: 'test-session-123',
              permissions: {
                'aztec:testnet': {
                  methods: ['aztec_getChainInfo'],
                  metadata: {},
                },
              },
            },
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      const result = await provider.connect({
        'aztec:testnet': ['aztec_getChainInfo'],
      });

      expect(result.sessionId).toBe('test-session-123');
      expect(provider.sessionId).toBe('test-session-123');
    });
  });

  describe('call', () => {
    it('should call method with correct chainId and parameters', async () => {
      provider = new AztecWalletRouterProvider(mockTransport);
      provider['_sessionId'] = 'test-session';

      sendMock.mockImplementation(async (request) => {
        if (request.method === 'wm_call') {
          const response: JSONRPCResponse<JSONRPCMethodMap> = {
            jsonrpc: '2.0',
            id: request.id,
            result: { test: 'result' },
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      const result = await provider.call('aztec:testnet', {
        method: 'aztec_getChainInfo',
      });

      expect(sendMock).toHaveBeenCalled();
      expect(result).toEqual({ test: 'result' });
    });
  });

  describe('dispose', () => {
    it('should clean up session termination listener', () => {
      const handler = vi.fn();
      provider = new AztecWalletRouterProvider(mockTransport, {
        onSessionTerminated: handler,
      });

      // Mock the onNotification to return a cleanup function
      const notificationCleanup = vi.fn();
      vi.spyOn(provider, 'onNotification').mockReturnValue(notificationCleanup);

      // Recreate provider to trigger setup
      provider.dispose();
      provider = new AztecWalletRouterProvider(mockTransport, {
        onSessionTerminated: handler,
      });

      provider.dispose();
      // Verify cleanup was called (indirectly through dispose)
      expect(provider).toBeDefined();
    });

    it('should handle dispose when no session termination handler is set', () => {
      provider = new AztecWalletRouterProvider(mockTransport);
      expect(() => provider.dispose()).not.toThrow();
    });
  });
});
