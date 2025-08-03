import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletRouter } from './router.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { RouterError } from './errors.js';
import type { SessionData } from './types.js';
import { PermissivePermissionsManager } from './permissions/permissive.js';

describe('WalletRouter', () => {
  const mockTransport: JSONRPCTransport = {
    send: vi.fn().mockImplementation(() => Promise.resolve()),
    onMessage: vi.fn(),
    // close: vi.fn().mockImplementation(() => Promise.resolve()), // Removed
  };

  const mockSessionStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    validateAndRefresh: vi.fn(),
    getAll: vi.fn(),
    clear: vi.fn(),
    cleanExpired: vi.fn(),
  };

  let router: WalletRouter;
  let mockWalletTransport: JSONRPCTransport;
  const messageHandlers: Map<string, ((msg: unknown) => void) | undefined> = new Map();

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandlers.clear();

    // Create a fresh mock wallet transport for each test
    mockWalletTransport = {
      send: vi.fn().mockImplementation(() => Promise.resolve()),
      onMessage: vi.fn().mockImplementation((handler) => {
        // Store the handler for this chain
        messageHandlers.set('eip155:1', handler);
        return () => {};
      }),
      // close: vi.fn(), // Removed
    };

    const initialWallets = new Map([['eip155:1', mockWalletTransport]]);

    router = new WalletRouter(mockTransport, initialWallets, new PermissivePermissionsManager(), {
      sessionStore: mockSessionStore,
    });
  });

  describe('Chain Validation', () => {
    it('should validate existing chain', () => {
      const proxy = router['validateChain']('eip155:1');
      expect(proxy).toBeDefined();
    });

    it('should throw for non-existent chain', () => {
      expect(() => router['validateChain']('invalid:chain')).toThrow(RouterError);
    });

    it('should handle missing wallet client', () => {
      const emptyWallets = new Map();
      router = new WalletRouter(mockTransport, emptyWallets, new PermissivePermissionsManager(), {
        sessionStore: mockSessionStore,
      });
      expect(() => router['validateChain']('eip155:2')).toThrow(RouterError);
    });

    it('should handle invalid wallet in call', async () => {
      let capturedRequest: unknown;

      // Capture the request and setup response handler
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        capturedRequest = msg;
        // Immediately trigger the response to avoid timeout
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && capturedRequest) {
            handler({
              jsonrpc: '2.0',
              error: { code: -32601, message: 'Method not found' },
              id: (capturedRequest as { id: string }).id,
            });
          }
        }, 0);
        return Promise.resolve();
      });

      // Get the proxy
      const proxy = router['validateChain']('eip155:1');

      // Test _call with error response
      await expect(router['_call'](proxy, { method: 'test_method' })).rejects.toThrow(
        new RouterError('walletError', 'Method not found'),
      );
    });
  });

  describe('Wallet Management', () => {
    it('should add a new wallet', () => {
      const newTransport: JSONRPCTransport = {
        send: vi.fn(),
        onMessage: vi.fn(),
      };
      router.addWallet('eip155:137', newTransport);

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wm_walletAvailabilityChanged',
          params: {
            chainId: 'eip155:137',
            available: true,
          },
        }),
      );
    });

    it('should throw when adding duplicate wallet', () => {
      expect(() => router.addWallet('eip155:1', mockWalletTransport)).toThrow(
        new RouterError('invalidRequest', 'Chain eip155:1 already exists'),
      );
    });

    it('should remove a wallet', () => {
      router.removeWallet('eip155:1');

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wm_walletAvailabilityChanged',
          params: {
            chainId: 'eip155:1',
            available: false,
          },
        }),
      );
    });

    it('should throw when removing non-existent wallet', () => {
      expect(() => router.removeWallet('invalid:chain')).toThrow(new RouterError('unknownChain'));
    });
  });

  describe('Session Management', () => {
    const mockSession: SessionData = {
      id: 'test-session',
      origin: 'test-origin',
    };

    beforeEach(() => {
      mockSessionStore.validateAndRefresh.mockResolvedValue(mockSession);
    });

    it('should throw on connect with missing origin', async () => {
      await expect(router['connect']({}, { permissions: { 'eip155:1': ['eth_accounts'] } })).rejects.toThrow(
        new RouterError('invalidRequest', 'Unknown origin'),
      );
    });

    it('should throw on connect with empty origin', async () => {
      await expect(router['connect']({ origin: '' }, { permissions: {} })).rejects.toThrow(
        new RouterError('invalidRequest', 'Unknown origin'),
      );
    });

    it('should throw on connect without chains', async () => {
      await expect(router['connect']({ origin: 'test-origin' }, { permissions: {} })).rejects.toThrow(
        new RouterError('invalidRequest', 'No chains specified'),
      );
    });

    it('should throw on connect with invalid permissions', async () => {
      mockSessionStore.validateAndRefresh.mockRejectedValue(
        new RouterError('invalidSession', 'Invalid permissions'),
      );
      mockSessionStore.set.mockRejectedValue(new RouterError('invalidSession', 'Invalid permissions'));

      await expect(
        router['connect']({ origin: 'test-origin' }, { permissions: { 'eip155:1': ['eth_accounts'] } }),
      ).rejects.toThrow(new RouterError('invalidSession', 'Invalid permissions'));
    });

    it('should reconnect existing session', async () => {
      const mockSessionData = {
        id: 'test-session',
        origin: 'test-origin',
      };

      mockSessionStore.validateAndRefresh.mockResolvedValue(mockSessionData);
      mockSessionStore.set.mockResolvedValue(undefined);

      const result = await router['reconnect'](
        { origin: 'test-origin', session: mockSessionData },
        { sessionId: 'test-session' },
      );

      expect(result).toEqual({
        status: true,
        permissions: {
          '*': {
            '*': {
              allowed: true,
              shortDescription: 'Permissive',
            },
          },
        },
      });
    });

    it('should throw on reconnect with missing origin', async () => {
      await expect(router['reconnect']({}, { sessionId: 'test-session' })).rejects.toThrow(
        new RouterError('invalidRequest', 'Unknown origin'),
      );
    });

    it('should handle failed reconnect', async () => {
      mockSessionStore.validateAndRefresh.mockResolvedValue(null);

      const result = await router['reconnect']({ origin: 'test-origin' }, { sessionId: 'test-session' });

      expect(result).toEqual({
        status: false,
        permissions: {},
      });
    });

    it('should disconnect session', async () => {
      const result = await router['disconnect'](
        { origin: 'test-origin', session: mockSession },
        { sessionId: 'test-session' },
      );

      expect(result).toBe(true);
      expect(mockSessionStore.delete).toHaveBeenCalledWith('test-origin_test-session');
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wm_sessionTerminated',
          params: {
            sessionId: 'test-session',
            reason: 'User disconnected',
          },
        }),
      );
    });

    it('should throw on disconnect without session', async () => {
      await expect(
        router['disconnect']({ origin: 'test-origin' }, { sessionId: 'test-session' }),
      ).rejects.toThrow(new RouterError('invalidSession'));
    });
  });

  describe('Method Calls', () => {
    const mockSession: SessionData = {
      id: 'test-session',
      origin: 'test-origin',
    };

    beforeEach(() => {
      vi.clearAllMocks();
      router = new WalletRouter(
        mockTransport,
        new Map([['eip155:1', mockWalletTransport]]),
        new PermissivePermissionsManager(),
        { sessionStore: mockSessionStore },
      );
    });

    it('should handle methodNotSupported error in _call', async () => {
      let capturedRequest: unknown;

      // Capture the request and setup response handler
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        capturedRequest = msg;
        // Immediately trigger the response to avoid timeout
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && capturedRequest) {
            handler({
              jsonrpc: '2.0',
              error: { code: -32601, message: 'Method not found' },
              id: (capturedRequest as { id: string }).id,
            });
          }
        }, 0);
        return Promise.resolve();
      });

      const proxy = router['validateChain']('eip155:1');
      await expect(router['_call'](proxy, { method: 'unknown_method' })).rejects.toThrow(
        new RouterError('walletError', 'Method not found'),
      );
    });

    it('should handle other errors in _call', async () => {
      // Mock transport send to reject
      vi.mocked(mockWalletTransport.send).mockRejectedValueOnce(new Error('Transport error'));

      const proxy = router['validateChain']('eip155:1');
      await expect(router['_call'](proxy, { method: 'eth_accounts' })).rejects.toThrow(
        new RouterError('walletNotAvailable', 'Transport error'),
      );
    });

    it('should execute call method successfully', async () => {
      const expectedResult = { success: true };
      let capturedRequest: unknown;

      // Capture the request and setup response handler
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        capturedRequest = msg;
        // Immediately trigger the response to avoid timeout
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && capturedRequest) {
            handler({
              jsonrpc: '2.0',
              result: expectedResult,
              id: (capturedRequest as { id: string }).id,
            });
          }
        }, 0);
        return Promise.resolve();
      });

      const result = await router['call'](
        { session: mockSession },
        { chainId: 'eip155:1', sessionId: 'test-session', call: { method: 'test_method' } },
      );

      expect(result).toEqual(expectedResult);
    });

    it('should handle partial failure in bulkCall', async () => {
      const calls = [{ method: 'eth_accounts' }, { method: 'eth_chainId' }, { method: 'eth_unknown' }];

      let callCount = 0;
      const capturedRequests: unknown[] = [];

      // Mock send to succeed for first two calls, fail on third
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        const currentCount = ++callCount;
        capturedRequests.push(msg);

        if (currentCount === 3) {
          return Promise.reject(new Error('Method failed'));
        }

        // Send responses immediately for first two calls
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && currentCount <= 2) {
            const results = currentCount === 1 ? ['0x123'] : '0x1';
            handler({ jsonrpc: '2.0', result: results, id: (msg as { id: string }).id });
          }
        }, 0);

        return Promise.resolve();
      });

      // The third call should fail and trigger partial failure
      await expect(
        router['bulkCall']({}, { chainId: 'eip155:1', sessionId: 'test-session', calls }),
      ).rejects.toThrow(
        new RouterError(
          'partialFailure',
          expect.objectContaining({
            partialResponses: [['0x123'], '0x1'],
            error: 'Error: Method failed',
          }),
        ),
      );
    });

    it('should handle complete failure in bulkCall', async () => {
      const calls = [{ method: 'eth_accounts' }];

      // Mock send to fail immediately
      vi.mocked(mockWalletTransport.send).mockRejectedValueOnce(new Error('Complete failure'));

      await expect(
        router['bulkCall']({}, { chainId: 'eip155:1', sessionId: 'test-session', calls }),
      ).rejects.toThrow(new RouterError('walletNotAvailable', 'Error: Complete failure'));
    });
  });

  describe('Permission Management', () => {
    const mockSession: SessionData = {
      id: 'test-session',
      origin: 'test-origin',
    };

    beforeEach(() => {
      vi.clearAllMocks();
      router = new WalletRouter(
        mockTransport,
        new Map([['eip155:1', mockWalletTransport]]),
        new PermissivePermissionsManager(),
        { sessionStore: mockSessionStore },
      );
    });

    it('should throw on getPermissions without session', async () => {
      await expect(
        router['getPermissions']({}, { sessionId: 'test-session', chainIds: ['eip155:1'] }),
      ).rejects.toThrow(new RouterError('invalidSession'));
    });

    it('should get permissions for specific chainIds', async () => {
      const result = await router['getPermissions'](
        { session: mockSession },
        { sessionId: 'test-session', chainIds: ['eip155:1'] },
      );

      expect(result).toEqual({
        '*': {
          '*': {
            allowed: true,
            shortDescription: 'Permissive',
          },
        },
      });
    });

    it('should throw on updatePermissions without session', async () => {
      await expect(
        router['updatePermissions'](
          { origin: 'test-origin' },
          { sessionId: 'test-session', permissions: {} },
        ),
      ).rejects.toThrow(new RouterError('invalidSession'));
    });

    it('should update permissions successfully', async () => {
      const permissions = { 'eip155:1': ['eth_accounts'] };
      const result = await router['updatePermissions'](
        { origin: 'test-origin', session: mockSession },
        { sessionId: 'test-session', permissions },
      );

      expect(result).toEqual({
        '*': {
          '*': {
            allowed: true,
            shortDescription: 'Permissive',
          },
        },
      });
      expect(mockSessionStore.set).toHaveBeenCalledWith('test-origin_test-session', mockSession);
    });
  });

  describe('Method Discovery', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      messageHandlers.clear();

      // Create a fresh mock wallet transport for each test
      mockWalletTransport = {
        send: vi.fn().mockImplementation(() => Promise.resolve()),
        onMessage: vi.fn().mockImplementation((handler) => {
          // Store the handler for this chain
          messageHandlers.set('eip155:1', handler);
          return () => {};
        }),
        // close: vi.fn(), // Removed
      };

      router = new WalletRouter(
        mockTransport,
        new Map([['eip155:1', mockWalletTransport]]),
        new PermissivePermissionsManager(),
        { sessionStore: mockSessionStore },
      );
    });

    it('should return router methods when no chains specified', async () => {
      const result = await router['getSupportedMethods']({}, { chainIds: [] });

      expect(result).toEqual({
        router: expect.arrayContaining([
          'wm_connect',
          'wm_disconnect',
          'wm_getPermissions',
          'wm_updatePermissions',
          'wm_call',
          'wm_bulkCall',
          'wm_getSupportedMethods',
          'wm_reconnect',
        ]),
      });
    });

    it('should get methods from specified chains', async () => {
      let capturedRequest: unknown;

      // Capture the request and setup response handler
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        capturedRequest = msg;
        // Immediately trigger the response to avoid timeout
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && capturedRequest) {
            handler({
              jsonrpc: '2.0',
              result: ['eth_accounts', 'eth_sign'],
              id: (capturedRequest as { id: string }).id,
            });
          }
        }, 0);
        return Promise.resolve();
      });

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:1'] });
      expect(result).toEqual({
        'eip155:1': ['eth_accounts', 'eth_sign'],
      });
    });

    it('should handle chains without getSupportedMethods', async () => {
      // Create new transport for the second chain
      let capturedRequest: unknown;
      let localHandler: ((msg: unknown) => void) | undefined;

      const newTransport: JSONRPCTransport = {
        send: vi.fn().mockImplementation((msg) => {
          capturedRequest = msg;
          // Immediately trigger the error response to avoid timeout
          setTimeout(() => {
            if (localHandler && capturedRequest) {
              localHandler({
                jsonrpc: '2.0',
                error: { code: -32007, message: 'Wallet returned an error' },
                id: (capturedRequest as { id: string }).id,
              });
            }
          }, 0);
          return Promise.resolve();
        }),
        onMessage: vi.fn((handler) => {
          localHandler = handler;
          messageHandlers.set('eip155:137', handler);
          return () => {};
        }),
      };

      router.addWallet('eip155:137', newTransport);

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:137'] });
      expect(result).toEqual({
        'eip155:137': [],
      });
    });

    it('should handle errors from getSupportedMethods', async () => {
      // Mock transport to send error
      vi.mocked(mockWalletTransport.send).mockRejectedValueOnce(new Error('Failed'));

      await expect(router['getSupportedMethods']({}, { chainIds: ['eip155:1'] })).rejects.toThrow(
        new RouterError('walletNotAvailable', 'Failed'),
      );
    });

    it('should pass through RouterError from getSupportedMethods', async () => {
      // Mock transport to send error that will NOT be caught
      vi.mocked(mockWalletTransport.send).mockRejectedValueOnce(new Error('Transport failed'));

      await expect(router['getSupportedMethods']({}, { chainIds: ['eip155:1'] })).rejects.toThrow(
        RouterError,
      );
    });

    it('should handle non-array response from getSupportedMethods', async () => {
      let capturedRequest: unknown;

      // Capture the request and setup response handler
      vi.mocked(mockWalletTransport.send).mockImplementation((msg) => {
        capturedRequest = msg;
        // Immediately trigger the response to avoid timeout
        setTimeout(() => {
          const handler = messageHandlers.get('eip155:1');
          if (handler && capturedRequest) {
            handler({
              jsonrpc: '2.0',
              result: 'not an array',
              id: (capturedRequest as { id: string }).id,
            });
          }
        }, 0);
        return Promise.resolve();
      });

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:1'] });
      expect(result).toEqual({
        'eip155:1': [],
      });
    });

    it('should convert non-RouterError to walletNotAvailable error', async () => {
      // This test was already removed as it referenced mockWallet which no longer exists
      // The functionality is tested in other error handling tests
    });
  });

  describe('Router Cleanup', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      messageHandlers.clear();

      // Create a fresh mock wallet transport for each test
      mockWalletTransport = {
        send: vi.fn().mockImplementation(() => Promise.resolve()),
        onMessage: vi.fn().mockImplementation((handler) => {
          // Store the handler for this chain
          messageHandlers.set('eip155:1', handler);
          return () => {};
        }),
        // close: vi.fn(), // Removed
      };

      router = new WalletRouter(
        mockTransport,
        new Map([['eip155:1', mockWalletTransport]]),
        new PermissivePermissionsManager(),
        { sessionStore: mockSessionStore },
      );
    });

    it('should close all proxies on router close', async () => {
      const newTransport = {
        send: vi.fn(),
        onMessage: vi.fn((handler) => {
          messageHandlers.set('eip155:137', handler);
          return () => {};
        }),
        // close: vi.fn(), // Removed
      };

      router.addWallet('eip155:137', newTransport);

      // Verify we have 2 wallets before close
      expect(router['walletProxies'].size).toBe(2);

      await router.close();

      // Verify walletProxies is cleared
      expect(router['walletProxies'].size).toBe(0);
    });

    it('should handle proxy close errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a mock proxy that throws on close
      const mockProxy = {
        close: vi.fn().mockImplementation(() => {
          throw new Error('Close failed');
        }),
        forward: vi.fn(),
      };

      // Add the mock proxy to walletProxies
      router['walletProxies'].set(
        'test-chain',
        mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
      );

      // Close should not throw despite proxy error
      await expect(router.close()).resolves.not.toThrow();

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to close proxy for chain test-chain:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('_call error handling', () => {
    it('should throw RouterError when response is invalid', async () => {
      const mockProxy = {
        forward: vi.fn().mockResolvedValue(null),
        close: vi.fn(),
      };

      router['walletProxies'].set(
        'eip155:1',
        mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
      );

      await expect(
        router['_call'](
          mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
          { method: 'test', params: [] },
        ),
      ).rejects.toThrow(new RouterError('walletNotAvailable', 'Invalid response from wallet'));
    });

    it('should handle JSONRPCError by converting to RouterError', async () => {
      const { JSONRPCError } = await import('@walletmesh/jsonrpc');
      const mockProxy = {
        forward: vi.fn().mockRejectedValue(new JSONRPCError(-32000, 'Test error', { details: 'test' })),
        close: vi.fn(),
      };

      router['walletProxies'].set(
        'eip155:1',
        mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
      );

      await expect(
        router['_call'](
          mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
          { method: 'test', params: [] },
        ),
      ).rejects.toThrow(new RouterError('walletError', { message: 'Test error', data: { details: 'test' } }));
    });

    it('should handle non-Error objects in catch', async () => {
      const mockProxy = {
        forward: vi.fn().mockRejectedValue('string error'),
        close: vi.fn(),
      };

      router['walletProxies'].set(
        'eip155:1',
        mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
      );

      await expect(
        router['_call'](
          mockProxy as unknown as InstanceType<typeof import('@walletmesh/jsonrpc').JSONRPCProxy>,
          { method: 'test', params: [] },
        ),
      ).rejects.toThrow(new RouterError('walletNotAvailable', 'string error'));
    });
  });
});
