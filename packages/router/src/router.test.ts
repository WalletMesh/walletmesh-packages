import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { WalletRouter } from './router.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { RouterError } from './errors.js';
import type { WalletClient, SessionData } from './types.js';
import { PermissivePermissionsManager } from './permissions/permissive.js';

describe('WalletRouter', () => {
  const mockTransport: JSONRPCTransport = {
    send: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const mockWalletClient: WalletClient = {
    call: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getSupportedMethods: vi.fn(),
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
  const initialWallets = new Map([['eip155:1', mockWalletClient]]);

  beforeEach(() => {
    vi.clearAllMocks();

    router = new WalletRouter(
      mockTransport,
      new Map(initialWallets),
      new PermissivePermissionsManager(),
      mockSessionStore,
    );
  });

  describe('Chain Validation', () => {
    it('should validate existing chain', () => {
      const client = router['validateChain']('eip155:1');
      expect(client).toBe(mockWalletClient);
    });

    it('should throw for non-existent chain', () => {
      expect(() => router['validateChain']('invalid:chain')).toThrow(new RouterError('unknownChain'));
    });

    it('should handle missing wallet client', () => {
      const emptyWallets = new Map();
      router = new WalletRouter(
        mockTransport,
        emptyWallets,
        new PermissivePermissionsManager(),
        mockSessionStore,
      );
      expect(() => router['validateChain']('eip155:2')).toThrow(new RouterError('unknownChain'));
    });

    it('should handle invalid wallet client in call', async () => {
      const invalidWallet: WalletClient = {
        call: null as unknown as WalletClient['call'],
      };
      const invalidWallets = new Map([['eip155:2', invalidWallet]]);
      router = new WalletRouter(
        mockTransport,
        invalidWallets,
        new PermissivePermissionsManager(),
        mockSessionStore,
      );

      await expect(router['_call'](invalidWallet, { method: 'test_method' })).rejects.toThrow(
        new RouterError('walletNotAvailable', 'TypeError: client.call is not a function'),
      );
    });
  });

  describe('Wallet Management', () => {
    it('should add a new wallet', () => {
      const newWallet = { ...mockWalletClient };
      router.addWallet('eip155:137', newWallet);

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
      expect(() => router.addWallet('eip155:1', mockWalletClient)).toThrow(
        new RouterError('invalidRequest', 'Chain eip155:1 already configured'),
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
        new Map(initialWallets),
        new PermissivePermissionsManager(),
        mockSessionStore,
      );
    });

    it('should handle methodNotSupported error in _call', async () => {
      const methodNotSupportedError = { code: -32601, message: 'Method not supported' };
      (mockWalletClient.call as Mock).mockRejectedValue(methodNotSupportedError);

      await expect(router['_call'](mockWalletClient, { method: 'unknown_method' })).rejects.toThrow(
        new RouterError('methodNotSupported', 'unknown_method'),
      );
    });

    it('should handle other errors in _call', async () => {
      const error = new Error('Wallet error');
      (mockWalletClient.call as Mock).mockRejectedValue(error);

      await expect(router['_call'](mockWalletClient, { method: 'eth_accounts' })).rejects.toThrow(
        new RouterError('walletNotAvailable', 'Error: Wallet error'),
      );
    });

    it('should execute call method successfully', async () => {
      const expectedResult = { success: true };
      (mockWalletClient.call as Mock).mockResolvedValue(expectedResult);

      const result = await router['call'](
        { session: mockSession },
        { chainId: 'eip155:1', sessionId: 'test-session', call: { method: 'test_method' } },
      );

      expect(result).toEqual(expectedResult);
      expect(mockWalletClient.call).toHaveBeenCalledWith('test_method', undefined);
    });

    it('should handle partial failure in bulkCall', async () => {
      const calls = [{ method: 'eth_accounts' }, { method: 'eth_chainId' }, { method: 'eth_unknown' }];

      (mockWalletClient.call as Mock)
        .mockResolvedValueOnce(['0x123'])
        .mockResolvedValueOnce('0x1')
        .mockRejectedValue(new Error('Method failed'));

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
      (mockWalletClient.call as Mock).mockRejectedValue(new Error('Complete failure'));

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
        new Map(initialWallets),
        new PermissivePermissionsManager(),
        mockSessionStore,
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

      router = new WalletRouter(
        mockTransport,
        new Map(initialWallets),
        new PermissivePermissionsManager(),
        mockSessionStore,
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
      (mockWalletClient.getSupportedMethods as Mock).mockResolvedValue(['eth_accounts', 'eth_sign']);

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:1'] });

      expect(result).toEqual({
        'eip155:1': ['eth_accounts', 'eth_sign'],
      });
    });

    it('should handle chains without getSupportedMethods', async () => {
      const mockWalletWithoutMethods = { call: vi.fn() };
      router.addWallet('eip155:137', mockWalletWithoutMethods);

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:137'] });

      expect(result).toEqual({
        'eip155:137': [],
      });
    });

    it('should handle errors from getSupportedMethods', async () => {
      (mockWalletClient.getSupportedMethods as Mock).mockRejectedValue(new Error('Failed'));

      await expect(router['getSupportedMethods']({}, { chainIds: ['eip155:1'] })).rejects.toThrow(
        new RouterError('walletNotAvailable', 'Failed'),
      );
    });

    it('should pass through RouterError from getSupportedMethods', async () => {
      const routerError = new RouterError('methodNotSupported', 'Not supported');
      (mockWalletClient.getSupportedMethods as Mock).mockRejectedValue(routerError);

      await expect(router['getSupportedMethods']({}, { chainIds: ['eip155:1'] })).rejects.toThrow(
        routerError,
      );
    });

    it('should handle non-array response from getSupportedMethods', async () => {
      (mockWalletClient.getSupportedMethods as Mock).mockResolvedValue('not an array');

      const result = await router['getSupportedMethods']({}, { chainIds: ['eip155:1'] });

      expect(result).toEqual({
        'eip155:1': [],
      });
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      router = new WalletRouter(
        mockTransport,
        new Map(initialWallets),
        new PermissivePermissionsManager(),
        mockSessionStore,
      );
    });

    it('should cleanup existing listeners before setting up new ones', () => {
      const mockCleanup = vi.fn();
      const mockWallet2 = { ...mockWalletClient };

      // Setup initial wallet
      router.addWallet('eip155:137', mockWalletClient);

      // Manually set a cleanup function
      (router as unknown as { walletEventCleanups: Map<string, () => void> }).walletEventCleanups.set(
        'eip155:137',
        mockCleanup,
      );

      // Add another wallet to trigger setupWalletEventListeners
      router.addWallet('eip155:2', mockWallet2);

      // Verify cleanup was called
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should setup and cleanup wallet event listeners', () => {
      const mockHandler = vi.fn();
      mockWalletClient.on = vi.fn((event, handler) => {
        if (event === 'disconnect') {
          mockHandler.mockImplementation(handler);
        }
      });

      // Add wallet to trigger event setup
      router.addWallet('eip155:137', mockWalletClient);

      // Trigger disconnect event
      mockHandler();

      // Check if event was forwarded
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wm_walletStateChanged',
          params: {
            chainId: 'eip155:137',
            changes: { connected: false },
          },
        }),
      );

      // Remove wallet to trigger cleanup
      router.removeWallet('eip155:137');
      expect(mockWalletClient.off).toHaveBeenCalled();
    });

    it('should handle wallets without event support', () => {
      const mockWalletWithoutEvents = { call: vi.fn() };
      router.addWallet('eip155:137', mockWalletWithoutEvents);
      router.removeWallet('eip155:137');
      // Should not throw errors
    });

    it('should handle wallets with on but without off', () => {
      const mockWalletWithoutOff = {
        call: vi.fn(),
        on: vi.fn(),
      };
      router.addWallet('eip155:137', mockWalletWithoutOff);

      // Trigger event setup
      const calls = (mockWalletWithoutOff.on as Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0]?.[0]).toBe('disconnect');

      // Trigger the handler to ensure it works
      const handler = calls[0]?.[1];
      if (handler) {
        handler();
      }

      // Remove wallet - should not throw even though off is missing
      router.removeWallet('eip155:137');
    });

    it('should handle wallets with null event handlers', () => {
      const mockWalletWithNullHandlers: WalletClient = {
        call: vi.fn(),
      };
      router.addWallet('eip155:137', mockWalletWithNullHandlers);

      // Should not throw when setting up event listeners
      router.addWallet('eip155:2', mockWalletClient);

      // Should not throw when removing wallet
      router.removeWallet('eip155:137');
    });
  });
});
