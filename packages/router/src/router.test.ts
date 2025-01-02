import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { WalletRouter } from './router.js';
import { RouterError } from './errors.js';
import type { WalletClient, SessionData } from './types.js';

describe('WalletRouter', () => {
  const mockTransport = {
    send: vi.fn(),
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

  const mockPermissionCallback = vi.fn();
  const mockPermissionApprovalCallback = vi.fn();

  let router: WalletRouter;
  const initialWallets = new Map([['eip155:1', mockWalletClient]]);

  beforeEach(() => {
    vi.clearAllMocks();
    router = new WalletRouter(
      mockTransport,
      new Map(initialWallets),
      mockPermissionCallback,
      mockPermissionApprovalCallback,
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
      permissions: {
        'eip155:1': ['eth_accounts'],
      },
    };

    beforeEach(() => {
      mockSessionStore.validateAndRefresh.mockResolvedValue(mockSession);
      mockPermissionApprovalCallback.mockResolvedValue(mockSession.permissions);
    });

    it('should connect new session', async () => {
      const result = await router['connect'](
        { origin: 'test-origin' },
        { permissions: { 'eip155:1': ['eth_accounts'] } },
      );

      expect(result).toEqual({
        sessionId: expect.any(String),
        permissions: mockSession.permissions,
      });
      expect(mockSessionStore.set).toHaveBeenCalled();
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
      mockPermissionApprovalCallback.mockRejectedValue(new Error('Invalid permissions'));

      await expect(
        router['connect']({ origin: 'test-origin' }, { permissions: { 'eip155:1': ['eth_accounts'] } }),
      ).rejects.toThrow('Invalid permissions');
    });

    it('should reconnect existing session', async () => {
      const result = await router['reconnect']({ origin: 'test-origin' }, { sessionId: 'test-session' });

      expect(result).toEqual({
        status: true,
        permissions: mockSession.permissions,
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

    it('should throw on reconnect without permissions', async () => {
      mockSessionStore.validateAndRefresh.mockResolvedValue({ id: 'test', origin: 'test' });

      await expect(
        router['reconnect']({ origin: 'test-origin' }, { sessionId: 'test-session' }),
      ).rejects.toThrow(new RouterError('invalidSession', 'No permissions found in session'));
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

  describe('Permission Management', () => {
    const mockSession: SessionData = {
      id: 'test-session',
      origin: 'test-origin',
      permissions: {
        'eip155:1': ['eth_accounts'],
      },
    };

    it('should get permissions for specific chains', async () => {
      const result = await router['getPermissions'](
        { session: mockSession },
        { sessionId: 'test-session', chainIds: ['eip155:1'] },
      );

      expect(result).toEqual({
        'eip155:1': ['eth_accounts'],
      });
    });

    it('should throw when getting permissions for invalid chain', async () => {
      await expect(
        router['getPermissions'](
          { session: mockSession },
          { sessionId: 'test-session', chainIds: ['invalid:chain'] },
        ),
      ).rejects.toThrow(new RouterError('invalidSession', 'Chain invalid:chain not found in session'));
    });

    it('should get all permissions when no chains specified', async () => {
      const result = await router['getPermissions']({ session: mockSession }, { sessionId: 'test-session' });

      expect(result).toEqual(mockSession.permissions);
    });

    it('should return empty object when no chains specified and no permissions', async () => {
      const sessionWithoutPerms: SessionData = {
        id: 'test-session',
        origin: 'test-origin',
      };

      const result = await router['getPermissions'](
        { session: sessionWithoutPerms },
        { sessionId: 'test-session' },
      );

      expect(result).toEqual({});
    });

    it('should throw when getting permissions without session', async () => {
      await expect(router['getPermissions']({}, { sessionId: 'test-session' })).rejects.toThrow(
        new RouterError('invalidSession'),
      );
    });

    it('should update permissions', async () => {
      const newPermissions = {
        'eip155:1': ['eth_accounts', 'eth_sign'],
      };
      mockPermissionApprovalCallback.mockResolvedValue(newPermissions);

      const result = await router['updatePermissions'](
        { origin: 'test-origin', session: mockSession },
        { sessionId: 'test-session', permissions: newPermissions },
      );

      expect(result).toEqual(newPermissions);
      expect(mockSessionStore.set).toHaveBeenCalledWith(
        'test-origin_test-session',
        expect.objectContaining({ permissions: newPermissions }),
      );
    });

    it('should throw when updating permissions without session', async () => {
      await expect(
        router['updatePermissions'](
          { origin: 'test-origin' },
          { sessionId: 'test-session', permissions: {} },
        ),
      ).rejects.toThrow(new RouterError('invalidSession'));
    });
  });

  describe('Method Calls', () => {
    const mockSession: SessionData = {
      id: 'test-session',
      origin: 'test-origin',
      permissions: {
        'eip155:1': ['eth_accounts'],
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
      (mockWalletClient.call as Mock).mockResolvedValue('0x123');
      router = new WalletRouter(
        mockTransport,
        new Map(initialWallets),
        mockPermissionCallback,
        mockPermissionApprovalCallback,
        mockSessionStore,
      );
    });

    it('should execute single call', async () => {
      const result = await router['call'](
        { session: mockSession },
        {
          chainId: 'eip155:1',
          sessionId: 'test-session',
          call: { method: 'eth_accounts' },
        },
      );

      expect(result).toBe('0x123');
      expect(mockWalletClient.call).toHaveBeenCalledWith('eth_accounts', undefined);
    });

    it('should handle method not supported error', async () => {
      (mockWalletClient.call as Mock).mockRejectedValue({ code: -32601 });

      await expect(
        router['call'](
          { session: mockSession },
          {
            chainId: 'eip155:1',
            sessionId: 'test-session',
            call: { method: 'eth_unsupported' },
          },
        ),
      ).rejects.toThrow(new RouterError('methodNotSupported', 'eth_unsupported'));
    });

    it('should execute bulk calls', async () => {
      const result = await router['bulkCall'](
        { session: mockSession },
        {
          chainId: 'eip155:1',
          sessionId: 'test-session',
          calls: [{ method: 'eth_accounts' }, { method: 'eth_accounts' }],
        },
      );

      expect(result).toEqual(['0x123', '0x123']);
      expect(mockWalletClient.call).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in bulk calls', async () => {
      (mockWalletClient.call as Mock)
        .mockResolvedValueOnce('0x123')
        .mockRejectedValueOnce(new Error('Failed'));

      await expect(
        router['bulkCall'](
          { session: mockSession },
          {
            chainId: 'eip155:1',
            sessionId: 'test-session',
            calls: [{ method: 'eth_accounts' }, { method: 'eth_accounts' }],
          },
        ),
      ).rejects.toThrow(new RouterError('partialFailure'));
    });

    it('should handle complete failure in bulk calls', async () => {
      (mockWalletClient.call as Mock).mockRejectedValue(new Error('Failed'));

      await expect(
        router['bulkCall'](
          { session: mockSession },
          {
            chainId: 'eip155:1',
            sessionId: 'test-session',
            calls: [{ method: 'eth_accounts' }],
          },
        ),
      ).rejects.toThrow(new RouterError('walletNotAvailable', 'Failed'));
    });
  });

  describe('Method Discovery', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      router = new WalletRouter(
        mockTransport,
        new Map(initialWallets),
        mockPermissionCallback,
        mockPermissionApprovalCallback,
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
        mockPermissionCallback,
        mockPermissionApprovalCallback,
        mockSessionStore,
      );
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
  });
});
