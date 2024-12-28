import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { WalletRouter } from './router.js';
import { RouterError, RouterErrorMap } from './errors.js';
import type {
  ChainId,
  RouterContext,
  RouterMethodMap,
  WalletClient,
  OperationType,
  PermissionApprovalCallback,
} from './types.js';
import { JSONRPCError } from '@walletmesh/jsonrpc';
import { createPermissivePermissions } from './permissions.js';
import { TestSessionStore } from './test-utils.js';

interface MockWalletClient extends WalletClient {
  getMockCall(): Mock;
  emit?(event: string, data: unknown): void;
  off?(event: string, handler: (data: unknown) => void): void;
}

// Default permission approval callback that approves all requested permissions
function createDefaultPermissionApproval(): PermissionApprovalCallback {
  return async (context) => context.requestedPermissions;
}

// Permission approval callback that denies all permissions
function createDenyingPermissionApproval(): PermissionApprovalCallback {
  return async () => {
    throw new Error('Permission denied');
  };
}

function createMockWalletClient(): MockWalletClient {
  const mockCall = vi.fn().mockImplementation((method: string) => {
    if (method === 'wm_getSupportedMethods') {
      return Promise.resolve({ methods: ['aztec_getAccount', 'aztec_sendTransaction'] });
    }
    return Promise.resolve('success');
  });

  const eventHandlers = new Map<string, Set<(data: unknown) => void>>();

  return {
    call: async <T = unknown>(method: string, params?: unknown): Promise<T> => {
      return mockCall(method, params) as Promise<T>;
    },
    getSupportedMethods: async (): Promise<string[]> => {
      return ['aztec_getAccount', 'aztec_sendTransaction'];
    },
    getMockCall: () => mockCall,
    on(event: string, handler: (data: unknown) => void): void {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set());
      }
      eventHandlers.get(event)?.add(handler);
    },
    off(event: string, handler: (data: unknown) => void): void {
      eventHandlers.get(event)?.delete(handler);
    },
    emit(event: string, data: unknown): void {
      const handlers = eventHandlers.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(data);
        }
      }
    },
  };
}

// Test class that exposes protected methods
class TestWalletRouter extends WalletRouter {
  // Expose session store for testing
  public getSessionStore(): TestSessionStore {
    return this.sessionStore as TestSessionStore;
  }

  public testConnect(context: RouterContext, params: RouterMethodMap['wm_connect']['params']) {
    return this.connect(context, params);
  }

  public testValidateSession(
    operation: OperationType,
    sessionId: string,
    chainId: string,
    method: string,
    params?: unknown,
    context?: RouterContext,
  ) {
    return this.validateSession(operation, sessionId, chainId, method, params, context);
  }

  public testDisconnect(context: RouterContext, params: RouterMethodMap['wm_disconnect']['params']) {
    return this.disconnect(context, params);
  }

  public testGetPermissions(context: RouterContext, params: RouterMethodMap['wm_getPermissions']['params']) {
    return this.getPermissions(context, params);
  }

  public testUpdatePermissions(
    context: RouterContext,
    params: RouterMethodMap['wm_updatePermissions']['params'],
  ) {
    return this.updatePermissions(context, params);
  }

  public testCall(context: RouterContext, params: RouterMethodMap['wm_call']['params']) {
    return this.call(context, params);
  }

  public testBulkCall(context: RouterContext, params: RouterMethodMap['wm_bulkCall']['params']) {
    return this.bulkCall(context, params);
  }

  public testGetSupportedMethods(
    context: RouterContext,
    params: RouterMethodMap['wm_getSupportedMethods']['params'],
  ) {
    return this.getSupportedMethods(context, params);
  }

  public testReconnect(context: RouterContext, params: RouterMethodMap['wm_reconnect']['params']) {
    return this.reconnect(context, params);
  }
}

describe('WalletRouter', () => {
  const mockTransport = { send: vi.fn() };
  const mockWallets = new Map<ChainId, MockWalletClient>();
  let mockClient1: MockWalletClient;
  let mockClient2: MockWalletClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient1 = createMockWalletClient();
    mockClient2 = createMockWalletClient();
    mockWallets.clear();
    mockWallets.set('aztec:testnet', mockClient1);
    mockWallets.set('eip155:1', mockClient2);
  });

  it('creates a new router instance', () => {
    const router = new TestWalletRouter(
      mockTransport,
      mockWallets,
      createPermissivePermissions(),
      createDefaultPermissionApproval(),
    );
    expect(router).toBeInstanceOf(WalletRouter);
  });

  describe('Event Handling', () => {
    it('emits session terminated event on disconnect', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      await router.testDisconnect({}, { sessionId });

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          event: 'wm_sessionTerminated',
          params: {
            sessionId,
            reason: 'User disconnected',
          },
        }),
      );
    });

    it('emits permissions changed event on update', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      const newPermissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };

      await router.testUpdatePermissions({}, { sessionId, permissions: newPermissions });

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          event: 'wm_permissionsChanged',
          params: {
            sessionId,
            permissions: newPermissions,
          },
        }),
      );
    });

    it('forwards wallet state change events', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      const mockWallet = createMockWalletClient();
      mockWallets.set('test:chain', mockWallet);

      // Connect to trigger event listener setup
      await router.testConnect(
        {},
        {
          permissions: {
            'test:chain': ['test_method'],
          },
        },
      );

      // Simulate wallet events
      mockWallet.emit?.('accountsChanged', ['0x123']);
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          event: 'wm_walletStateChanged',
          params: {
            chainId: 'test:chain',
            changes: { accounts: ['0x123'] },
          },
        }),
      );

      mockWallet.emit?.('networkChanged', 'testnet');
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          event: 'wm_walletStateChanged',
          params: {
            chainId: 'test:chain',
            changes: { networkId: 'testnet' },
          },
        }),
      );

      // Test disconnect event
      mockWallet.emit?.('disconnect', {});
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonrpc: '2.0',
          event: 'wm_walletStateChanged',
          params: {
            chainId: 'test:chain',
            changes: { connected: false },
          },
        }),
      );
    });

    it('cleans up event listeners on disconnect', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      const mockWallet = createMockWalletClient();
      mockWallets.set('test:chain', mockWallet);

      // Connect to trigger event listener setup
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'test:chain': ['test_method'],
          },
        },
      );

      // Disconnect should clean up listeners
      await router.testDisconnect({}, { sessionId });

      // Events should no longer be forwarded
      mockWallet.emit?.('accountsChanged', ['0x123']);
      expect(mockTransport.send).not.toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'wm_walletStateChanged',
        }),
      );
    });
  });

  describe('Permission System', () => {
    it('passes origin to approval callback', async () => {
      const mockApprovalCallback = vi.fn().mockImplementation(async (context) => {
        expect(context.origin).toBe('test-origin');
        return context.requestedPermissions;
      });

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        mockApprovalCallback,
      );

      await router.testConnect(
        { origin: 'test-origin' },
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      expect(mockApprovalCallback).toHaveBeenCalled();
    });

    it('uses unknown as default origin', async () => {
      const mockApprovalCallback = vi.fn().mockImplementation(async (context) => {
        expect(context.origin).toBe('unknown');
        return context.requestedPermissions;
      });

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        mockApprovalCallback,
      );

      await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      expect(mockApprovalCallback).toHaveBeenCalled();
    });

    it('rejects connect operation when permission approval fails', async () => {
      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const mockApprovalCallback = vi.fn().mockImplementation(createDenyingPermissionApproval());
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        mockApprovalCallback,
      );

      await expect(
        router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        ),
      ).rejects.toThrow('Permission denied');
    });

    it('approves requested permissions with approval callback', async () => {
      const requestedPermissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };
      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const mockApprovalCallback = vi.fn().mockImplementation(async (context) => {
        expect(context.requestedPermissions).toEqual(requestedPermissions);
        return requestedPermissions;
      });

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        mockApprovalCallback,
      );

      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: requestedPermissions,
        },
      );

      expect(mockApprovalCallback).toHaveBeenCalledTimes(1);
      const result = await router.testGetPermissions({}, { sessionId });
      expect(result).toEqual(requestedPermissions);
    });

    it('allows approval callback to modify requested permissions', async () => {
      const requestedPermissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };
      const approvedPermissions = {
        'aztec:testnet': ['aztec_getAccount'], // Only approve read access
      };

      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const mockApprovalCallback = vi.fn().mockImplementation(async () => approvedPermissions);

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        mockApprovalCallback,
      );

      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: requestedPermissions,
        },
      );

      expect(mockApprovalCallback).toHaveBeenCalledTimes(1);
      const result = await router.testGetPermissions({}, { sessionId });
      expect(result).toEqual(approvedPermissions);
    });
  });

  describe('Session Management', () => {
    let router: TestWalletRouter;

    beforeEach(() => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
    });

    it('creates a new session', async () => {
      const result = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );
      expect(result.sessionId).toBeDefined();
    });

    it('throws on empty permissions map', async () => {
      await expect(
        router.testConnect(
          {},
          {
            permissions: {},
          },
        ),
      ).rejects.toThrow(RouterErrorMap.invalidRequest.message);
    });

    it('handles sessions without expiry', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
        new TestSessionStore(),
      );
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      // Set no expiry in session store
      const store = router.getSessionStore();
      store.setExpiry(`unknown_${sessionId}`, undefined);

      // Should still validate successfully
      await expect(
        router.testValidateSession('call', sessionId, 'aztec:testnet', 'aztec_getAccount', undefined, {}),
      ).resolves.toBeDefined();
    });

    it('handles expired sessions in validateSession', async () => {
      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        createDefaultPermissionApproval(),
        new TestSessionStore(),
      );

      // Create a session and reset mock
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      mockPermissionCallback.mockClear(); // Reset mock after connect

      // Set expired session in store
      const store = router.getSessionStore();
      store.setExpiry(`unknown_${sessionId}`, Date.now() - 1000); // 1 second ago

      // Should fail with expired session and delete it
      await expect(
        router.testValidateSession('call', sessionId, 'aztec:testnet', 'aztec_getAccount', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);

      // Session should be deleted
      expect(await store.get(`unknown_${sessionId}`)).toBeUndefined();

      // Subsequent calls should fail with invalid session
      await expect(
        router.testValidateSession('call', sessionId, 'aztec:testnet', 'aztec_getAccount', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);

      // Permission callback should not be called for expired sessions
      expect(mockPermissionCallback).not.toHaveBeenCalled();
    });

    it('throws on invalid session in disconnect', async () => {
      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
        new TestSessionStore(),
      );
      await expect(router.testDisconnect({}, { sessionId: 'invalid-session' })).rejects.toThrow(
        RouterErrorMap.invalidSession.message,
      );
    });

    it('handles session disconnection', async () => {
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      await router.testDisconnect({}, { sessionId });

      await expect(router.testGetPermissions({}, { sessionId })).rejects.toThrow(
        RouterErrorMap.invalidSession.message,
      );
    });

    describe('Session Reconnection', () => {
      it('successfully reconnects to an existing session', async () => {
        const { sessionId } = await router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        );

        const result = await router.testReconnect({}, { sessionId });
        expect(result.status).toBe(true);
        expect(result.permissions).toEqual({
          'aztec:testnet': ['aztec_getAccount'],
        });
      });

      it('fails to reconnect to expired session', async () => {
        const testStore = new TestSessionStore();
        const router = new TestWalletRouter(
          mockTransport,
          mockWallets,
          createPermissivePermissions(),
          createDefaultPermissionApproval(),
          testStore,
        );

        const { sessionId } = await router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        );

        // Set expired session in store
        testStore.setExpiry(`unknown_${sessionId}`, Date.now() - 1000); // 1 second ago

        const result = await router.testReconnect({}, { sessionId });
        expect(result.status).toBe(false);
        expect(result.permissions).toEqual({});

        // Session should be deleted
        expect(await testStore.get(`unknown_${sessionId}`)).toBeUndefined();
      });

      it('fails to reconnect to non-existent session', async () => {
        const result = await router.testReconnect({}, { sessionId: 'non-existent' });
        expect(result.status).toBe(false);
        expect(result.permissions).toEqual({});
      });

      it('returns session permissions on successful reconnect', async () => {
        const permissions = {
          'aztec:testnet': ['aztec_getAccount'],
        };

        const { sessionId } = await router.testConnect({}, { permissions });

        const result = await router.testReconnect({}, { sessionId });
        expect(result.status).toBe(true);
        expect(result.permissions).toEqual(permissions);
      });

      it('returns false for expired session', async () => {
        const testStore = new TestSessionStore();
        const router = new TestWalletRouter(
          mockTransport,
          mockWallets,
          createPermissivePermissions(),
          createDefaultPermissionApproval(),
          testStore,
        );

        const { sessionId } = await router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        );

        // Set expired session in store
        testStore.setExpiry(`unknown_${sessionId}`, Date.now() - 1000);

        const result = await router.testReconnect({}, { sessionId });
        expect(result.status).toBe(false);
        expect(result.permissions).toEqual({});
      });

      it('returns false for non-existent session', async () => {
        const result = await router.testReconnect({}, { sessionId: 'non-existent' });
        expect(result.status).toBe(false);
        expect(result.permissions).toEqual({});
      });
    });
  });

  describe('Validation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
      const result = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );
      testSessionId = result.sessionId;
    });

    it('validates chain configuration in session', async () => {
      // Test non-configured chain
      await expect(
        router.testValidateSession(
          'call',
          testSessionId,
          'non-configured-chain',
          'test_method',
          undefined,
          {},
        ),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);
    });

    it('validates permissions through permission callback', async () => {
      const mockPermissionCallback = vi.fn()
        .mockImplementation(async (context) => {
          // Deny if chain has no methods configured
          return context.session?.permissions[context.chainId]?.length > 0;
        });

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        createDefaultPermissionApproval(),
      );

      // Create session with empty permissions
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': [], // Empty permissions array
          },
        },
      );

      // Should be denied by permission callback
      await expect(
        router.testValidateSession(
          'call',
          sessionId,
          'aztec:testnet',
          'test_method',
          undefined,
          {},
        ),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('handles wildcard chainId and method for updatePermissions', async () => {
      // Should reject wildcard method for non-updatePermissions operations
      await expect(
        router.testValidateSession('call', testSessionId, 'aztec:testnet', '*', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);

      // Should allow wildcard chainId and method for updatePermissions
      await expect(
        router.testValidateSession('updatePermissions', testSessionId, '*', '*', undefined, {}),
      ).resolves.toBeDefined();

      // Should allow wildcard chainId with specific method for updatePermissions
      await expect(
        router.testValidateSession('updatePermissions', testSessionId, '*', 'aztec_getAccount', undefined, {}),
      ).resolves.toBeDefined();
    });

    it('throws on unknown chain', async () => {
      // First connect with the unknown chain to create a valid session
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'unknown:chain': ['test_method'],
          },
        },
      );

      // Remove the chain from wallets to simulate unknown chain
      mockWallets.delete('unknown:chain');

      await expect(
        router.testCall(
          {},
          {
            chainId: 'unknown:chain',
            call: { method: 'test_method', params: {} },
            sessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.unknownChain.message);
    });
  });

  describe('Event Cleanup', () => {
    let router: TestWalletRouter;

    beforeEach(() => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
    });

    it('initializes event listeners for new chains and skips wallets without event support', async () => {
      // Create a new router instance with access to private members
      class TestRouterWithAccess extends TestWalletRouter {
        public getWalletEventCleanups() {
          return this['walletEventCleanups'];
        }

        public getWallets() {
          return this['wallets'] as Map<ChainId, WalletClient>;
        }

        public setupListeners(): void {
          this.setupWalletEventListeners(this.getWallets());
        }
      }

      // Create router with empty wallets map
      const router = new TestRouterWithAccess(
        mockTransport,
        new Map(),
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      // Verify walletEventCleanups is initially empty
      expect(router.getWalletEventCleanups().size).toBe(0);

      // Create wallet without event capabilities (no 'on' method)
      const mockWalletNoEvents: MockWalletClient = {
        call: vi.fn(),
        getMockCall: vi.fn(),
      };

      // Create wallet with event capabilities
      const mockWalletWithEvents = createMockWalletClient();
      const mockOn = vi.fn();
      mockWalletWithEvents.on = mockOn;

      // Add wallets to map but don't set up listeners yet
      router.getWallets().set('test:chain1', mockWalletNoEvents);
      router.getWallets().set('test:chain2', mockWalletWithEvents);

      // Verify walletEventCleanups is still empty
      expect(router.getWalletEventCleanups().size).toBe(0);

      // Set up listeners
      router.setupListeners();

      // Verify walletEventCleanups was initialized only for wallet with events
      expect(router.getWalletEventCleanups().has('test:chain1')).toBe(false); // No events for this wallet
      expect(router.getWalletEventCleanups().has('test:chain2')).toBe(true);
      expect(router.getWalletEventCleanups().get('test:chain2')?.size).toBe(3); // 3 events

      // Verify event listeners were set up for wallet with events
      expect(mockOn).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('networkChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('handles event listener setup and cleanup scenarios', async () => {
      const mockWallet = createMockWalletClient();
      const mockOn = vi.fn();
      const mockOff = vi.fn();
      const mockEmit = vi.fn();

      // Create a wallet with trackable event handlers
      const mockWalletWithTracking: MockWalletClient = {
        ...mockWallet,
        on: mockOn,
        off: mockOff,
        emit: mockEmit,
      };

      // Create a wallet without off method
      const mockWalletWithoutOff: Omit<MockWalletClient, 'off'> = {
        ...mockWallet,
        on: mockOn,
      } as MockWalletClient;

      // Clear all wallets
      mockWallets.clear();

      // Create a new router instance with access to private members
      class TestRouterWithAccess extends TestWalletRouter {
        public getWalletEventCleanups() {
          return this['walletEventCleanups'];
        }

        public getWallets() {
          return this['wallets'] as Map<ChainId, WalletClient>;
        }

        public setupListeners(): void {
          this.setupWalletEventListeners(this.getWallets());
        }
      }

      // Create router with empty wallets map
      const router = new TestRouterWithAccess(
        mockTransport,
        new Map(),
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      // Add wallet to map but don't set up listeners yet
      const wallets = router.getWallets();
      wallets.set('test:chain', mockWalletWithTracking);

      // Verify walletEventCleanups is empty before setup
      expect(router.getWalletEventCleanups().has('test:chain')).toBe(false);

      // Set up listeners
      router.setupListeners();

      // Verify walletEventCleanups was initialized
      expect(router.getWalletEventCleanups().has('test:chain')).toBe(true);
      expect(router.getWalletEventCleanups().get('test:chain')?.size).toBe(3); // 3 events

      // Add second wallet but don't set up listeners yet
      wallets.set('test:chain2', mockWalletWithoutOff);

      // Verify walletEventCleanups doesn't have second chain yet
      expect(router.getWalletEventCleanups().has('test:chain2')).toBe(false);

      // Set up listeners again
      router.setupListeners();

      // Verify both chains have event cleanups
      expect(router.getWalletEventCleanups().has('test:chain')).toBe(true);
      expect(router.getWalletEventCleanups().has('test:chain2')).toBe(true);
      expect(router.getWalletEventCleanups().get('test:chain')?.size).toBe(3);
      expect(router.getWalletEventCleanups().get('test:chain2')?.size).toBe(3);

      // Verify initial event listeners were set up
      expect(mockOn).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('networkChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));

      // Clear mocks to track new events
      vi.clearAllMocks();

      // Connect again to trigger new listener setup
      await router.testConnect(
        {},
        {
          permissions: {
            'test:chain': ['test_method'],
            'test:chain2': ['test_method'],
          },
        },
      );

      // Verify old listeners were cleaned up and new ones were set
      expect(mockOff).toHaveBeenCalled(); // Should be called for wallet with off method
      expect(mockOn).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('networkChanged', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('handles validateChain edge cases and event cleanup', async () => {
      // First connect with permissions for both chains
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'test:chain': ['test_method'],
            'test:chain2': ['test_method'],
          },
        },
      );

      // Remove wallets to trigger unknownChain error
      mockWallets.delete('test:chain');

      await expect(
        router.testCall(
          {},
          {
            chainId: 'test:chain',
            call: { method: 'test_method', params: {} },
            sessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.unknownChain.message);

      // Remove second wallet
      mockWallets.delete('test:chain2');

      await expect(
        router.testCall(
          {},
          {
            chainId: 'test:chain2',
            call: { method: 'test_method', params: {} },
            sessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.unknownChain.message);

      // Test cleanup with invalid wallet
      await router.testConnect(
        {},
        {
          permissions: {
            'test:chain': ['test_method'],
            'test:chain2': ['test_method'],
          },
        },
      );
    });
  });

  describe('Method Invocation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
      const result = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );
      testSessionId = result.sessionId;
    });

    it('forwards method calls to wallet', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      const result = await router.testCall(
        {},
        {
          chainId: 'aztec:testnet',
          call: { method: 'aztec_getAccount', params: {} },
          sessionId: testSessionId,
        },
      );

      expect(result).toBe('success');
      expect((mockClient as MockWalletClient).getMockCall()).toHaveBeenCalledWith('aztec_getAccount', {});
    });

    it('gets permissions for specific chains', async () => {
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
            'eip155:1': ['eth_accounts'],
          },
        },
      );

      const result = await router.testGetPermissions(
        {},
        {
          sessionId,
          chainIds: ['aztec:testnet'],
        },
      );

      expect(result).toEqual({
        'aztec:testnet': ['aztec_getAccount'],
      });
    });

    it('gets all chain permissions', async () => {
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
            'eip155:1': ['eth_accounts'],
          },
        },
      );

      const result = await router.testGetPermissions(
        {},
        {
          sessionId,
        },
      );

      expect(result).toEqual({
        'aztec:testnet': ['aztec_getAccount'],
        'eip155:1': ['eth_accounts'],
      });
    });

    it('updates permissions with approval callback', async () => {
      const initialPermissions = {
        'aztec:testnet': ['aztec_getAccount'],
      };
      const requestedPermissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };
      const approvedPermissions = {
        'aztec:testnet': ['aztec_getAccount'], // Only approve read access
      };

      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const mockApprovalCallback = vi
        .fn()
        .mockImplementationOnce(async () => initialPermissions) // For initial connect
        .mockImplementationOnce(async (context) => {
          expect(context.requestedPermissions).toEqual(requestedPermissions);
          return approvedPermissions;
        }); // For update

      const router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        mockPermissionCallback,
        mockApprovalCallback,
      );

      // Initial connect
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: initialPermissions,
        },
      );

      // Update permissions
      await router.testUpdatePermissions(
        {},
        {
          sessionId,
          permissions: requestedPermissions,
        },
      );

      // Verify approval callback was called twice
      expect(mockApprovalCallback).toHaveBeenCalledTimes(2);

      // Verify final permissions match what was approved
      const result = await router.testGetPermissions(
        {},
        {
          sessionId,
        },
      );
      expect(result).toEqual(approvedPermissions);
    });

    it('throws on invalid chain ID in getPermissions', async () => {
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      await expect(
        router.testGetPermissions(
          {},
          {
            sessionId,
            chainIds: ['invalid:chain'],
          },
        ),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);
    });

    it('handles permission updates for invalid session', async () => {
      await expect(
        router.testUpdatePermissions(
          {},
          {
            sessionId: 'invalid-session',
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        ),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);
    });

    it('handles wallet errors', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce(new JSONRPCError(-32601, 'Method not found'));
      }

      await expect(
        router.testCall(
          {},
          {
            chainId: 'aztec:testnet',
            call: { method: 'aztec_sendTransaction', params: {} },
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.methodNotSupported.message);
    });

    it('handles network errors', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce(new Error('Network error'));
      }

      await expect(
        router.testCall(
          {},
          {
            chainId: 'aztec:testnet',
            call: { method: 'aztec_getAccount', params: {} },
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.walletNotAvailable.message);
    });
  });

  describe('Supported Methods', () => {
    let router: TestWalletRouter;

    beforeEach(() => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
    });

    it('returns router methods when no chainIds provided or undefined', async () => {
      // Test with empty array
      let result = await router.testGetSupportedMethods({}, { chainIds: [] });
      expect(result).toEqual({
        router: [
          'wm_connect',
          'wm_disconnect',
          'wm_getPermissions',
          'wm_updatePermissions',
          'wm_call',
          'wm_bulkCall',
          'wm_getSupportedMethods',
          'wm_reconnect',
        ],
      });

      // Test with omitted chainIds
      result = await router.testGetSupportedMethods({}, {});
      expect(result).toEqual({
        router: [
          'wm_connect',
          'wm_disconnect',
          'wm_getPermissions',
          'wm_updatePermissions',
          'wm_call',
          'wm_bulkCall',
          'wm_getSupportedMethods',
          'wm_reconnect',
        ],
      });
    });

    it('handles various getSupportedMethods scenarios', async () => {
      // Test wallet without getSupportedMethods
      const mockWalletNoMethods: MockWalletClient = {
        call: vi.fn(),
        getMockCall: vi.fn(),
      };
      mockWallets.set('test:chain1', mockWalletNoMethods);

      // Test wallet returning non-array
      const mockWalletBadReturn: MockWalletClient = {
        ...createMockWalletClient(),
        getSupportedMethods: async () => {
          // biome-ignore lint/suspicious/noExplicitAny: test case
          return undefined as any;
        },
      };
      mockWallets.set('test:chain2', mockWalletBadReturn);

      // Test wallet returning string array
      const mockWalletGoodReturn: MockWalletClient = {
        ...createMockWalletClient(),
        getSupportedMethods: async () => {
          return ['method1', 'method2'];
        },
      };
      mockWallets.set('test:chain3', mockWalletGoodReturn);

      const result = await router.testGetSupportedMethods({}, {
        chainIds: ['test:chain1', 'test:chain2', 'test:chain3']
      });

      expect(result).toEqual({
        'test:chain1': [],  // No getSupportedMethods
        'test:chain2': [],  // Bad return value
        'test:chain3': ['method1', 'method2']  // Good return value
      });
    });

    it('handles wallet errors in getSupportedMethods', async () => {
      const mockWallet = createMockWalletClient();
      mockWallet.getSupportedMethods = vi.fn().mockRejectedValue(new Error('Failed to get methods'));
      mockWallets.set('test:chain', mockWallet);

      await expect(router.testGetSupportedMethods({}, { chainIds: ['test:chain'] })).rejects.toThrow(
        RouterErrorMap.walletNotAvailable.message,
      );
    });

    it('handles RouterError in getSupportedMethods', async () => {
      const mockWallet = createMockWalletClient();
      mockWallet.getSupportedMethods = vi.fn().mockRejectedValue(new RouterError('unknownChain'));
      mockWallets.set('test:chain', mockWallet);

      await expect(router.testGetSupportedMethods({}, { chainIds: ['test:chain'] })).rejects.toThrow(
        RouterErrorMap.unknownChain.message,
      );
    });
  });

  describe('Bulk Method Invocation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockTransport,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
      const result = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount', 'aztec_getBalance'],
          },
        },
      );
      testSessionId = result.sessionId;
    });

    it('successfully executes multiple method calls', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient
          .getMockCall()
          .mockResolvedValueOnce('account_result')
          .mockResolvedValueOnce('balance_result');
      }

      const result = await router.testBulkCall(
        {},
        {
          chainId: 'aztec:testnet',
          calls: [
            { method: 'aztec_getAccount', params: {} },
            { method: 'aztec_getBalance', params: {} },
          ],
          sessionId: testSessionId,
        },
      );

      expect(result).toEqual(['account_result', 'balance_result']);
      expect(mockClient?.getMockCall()).toHaveBeenCalledTimes(2);
    });

    it('handles partial failures with responses', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient
          .getMockCall()
          .mockResolvedValueOnce('first_success')
          .mockRejectedValueOnce(new Error('Second call failed'));
      }

      await expect(
        router.testBulkCall(
          {},
          {
            chainId: 'aztec:testnet',
            calls: [
              { method: 'aztec_getAccount', params: {} },
              { method: 'aztec_getBalance', params: {} },
            ],
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.partialFailure.message);
    });

    it('handles non-JSONRPC errors in _call', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce('Unknown error type');
      }

      await expect(
        router.testCall(
          {},
          {
            chainId: 'aztec:testnet',
            call: { method: 'aztec_getAccount', params: {} },
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.walletNotAvailable.message);
    });

    it('handles non-JSONRPC errors in bulk call with no responses', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce('Unknown error type');
      }

      await expect(
        router.testBulkCall(
          {},
          {
            chainId: 'aztec:testnet',
            calls: [{ method: 'aztec_getAccount', params: {} }],
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.walletNotAvailable.message);
    });

    it('handles JSONRPC errors with partial responses', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient
          .getMockCall()
          .mockResolvedValueOnce('first_success')
          .mockRejectedValueOnce(new JSONRPCError(-32601, 'Method not found', 'Additional data'));
      }

      await expect(
        router.testBulkCall(
          {},
          {
            chainId: 'aztec:testnet',
            calls: [
              { method: 'aztec_getAccount', params: {} },
              { method: 'aztec_getBalance', params: {} },
            ],
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.partialFailure.message);
    });
  });
});
