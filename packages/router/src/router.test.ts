import { describe, expect, it, beforeEach, vi, type Mock } from 'vitest';
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

  return {
    call: async <T = unknown>(method: string, params?: unknown): Promise<T> => {
      return mockCall(method, params) as Promise<T>;
    },
    getSupportedMethods: async (): Promise<{ methods: string[] }> => {
      return mockCall('wm_getSupportedMethods');
    },
    getMockCall: () => mockCall,
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
  const mockSendResponse = vi.fn();
  const mockWallets = new Map<ChainId, MockWalletClient>();
  let mockClient1: MockWalletClient;
  let mockClient2: MockWalletClient;

  beforeEach(() => {
    mockClient1 = createMockWalletClient();
    mockClient2 = createMockWalletClient();
    mockWallets.clear();
    mockWallets.set('aztec:testnet', mockClient1);
    mockWallets.set('eip155:1', mockClient2);
  });

  it('creates a new router instance', () => {
    const router = new TestWalletRouter(
      mockSendResponse,
      mockWallets,
      createPermissivePermissions(),
      createDefaultPermissionApproval(),
    );
    expect(router).toBeInstanceOf(WalletRouter);
  });

  describe('Permission System', () => {
    it('passes origin to approval callback', async () => {
      const mockApprovalCallback = vi.fn().mockImplementation(async (context) => {
        expect(context.origin).toBe('test-origin');
        return context.requestedPermissions;
      });

      const router = new TestWalletRouter(
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
        mockSendResponse,
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
          mockSendResponse,
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
          mockSendResponse,
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

  describe('Method Invocation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockSendResponse,
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
        mockSendResponse,
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

  describe('Bulk Method Invocation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockSendResponse,
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

  describe('Session Validation', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockSendResponse,
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

    it('allows wildcard method for updatePermissions', async () => {
      const session = await router.testValidateSession(
        'updatePermissions',
        testSessionId,
        'aztec:testnet',
        '*',
        undefined,
        {},
      );
      expect(session).toBeDefined();
    });

    it('rejects wildcard method for non-updatePermissions operation', async () => {
      await expect(
        router.testValidateSession('call', testSessionId, 'aztec:testnet', '*', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('validates chain configuration in session', async () => {
      await expect(
        router.testValidateSession('call', testSessionId, 'invalid:chain', 'test_method', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.invalidSession.message);
    });
  });

  describe('Error Handling', () => {
    it('handles errors in connect approval', async () => {
      const mockApprovalCallback = vi
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Approval failed');
        })
        .mockImplementationOnce(() => {
          throw new RouterError('insufficientPermissions', 'connect');
        });

      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        createPermissivePermissions(),
        mockApprovalCallback,
      );

      // First call should fail with generic error
      await expect(
        router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        ),
      ).rejects.toThrow('Approval failed');

      // Second call should fail with RouterError
      await expect(
        router.testConnect(
          {},
          {
            permissions: {
              'aztec:testnet': ['aztec_getAccount'],
            },
          },
        ),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('handles errors in session validation', async () => {
      const mockPermissionCallback = vi.fn().mockResolvedValue(true);
      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        mockPermissionCallback,
        createDefaultPermissionApproval(),
        new TestSessionStore(),
      );

      // First call should succeed (connect)
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      // Reset mock after connect
      mockPermissionCallback.mockReset();
      mockPermissionCallback
        .mockImplementationOnce(() => {
          throw new Error('Permission check error');
        })
        .mockImplementationOnce(() => {
          throw new RouterError('insufficientPermissions', 'test');
        });

      // Second call should fail with generic error
      await expect(
        router.testValidateSession('call', sessionId, 'aztec:testnet', 'test', undefined, {}),
      ).rejects.toThrow('Permission check error');

      // Third call should fail with RouterError
      await expect(
        router.testValidateSession('call', sessionId, 'aztec:testnet', 'test', undefined, {}),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('handles errors in update permissions approval', async () => {
      const mockApprovalCallback = vi
        .fn()
        .mockImplementationOnce(createDefaultPermissionApproval()) // Allow connect
        .mockImplementationOnce(() => {
          throw new Error('Approval failed');
        })
        .mockImplementationOnce(createDefaultPermissionApproval()) // Allow connect
        .mockImplementationOnce(() => {
          throw new RouterError('insufficientPermissions', 'updatePermissions');
        });

      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        createPermissivePermissions(),
        mockApprovalCallback,
        new TestSessionStore(),
      );

      // First connect and update - generic error
      const { sessionId: sessionId1 } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      await expect(
        router.testUpdatePermissions(
          {},
          {
            sessionId: sessionId1,
            permissions: {
              'aztec:testnet': ['eth_accounts'],
            },
          },
        ),
      ).rejects.toThrow('Approval failed');

      // Second connect and update - RouterError
      const { sessionId: sessionId2 } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      await expect(
        router.testUpdatePermissions(
          {},
          {
            sessionId: sessionId2,
            permissions: {
              'aztec:testnet': ['eth_accounts'],
            },
          },
        ),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('handles errors in update permissions with invalid session', async () => {
      const mockApprovalCallback = vi
        .fn()
        .mockImplementationOnce(createDefaultPermissionApproval()) // Allow connect
        .mockImplementationOnce(() => {
          throw new Error('Approval failed');
        });

      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        createPermissivePermissions(),
        mockApprovalCallback,
      );

      // First call should succeed (connect)
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
      );

      // updatePermissions should fail
      await expect(
        router.testUpdatePermissions(
          {},
          {
            sessionId,
            permissions: {
              'aztec:testnet': ['eth_accounts'],
            },
          },
        ),
      ).rejects.toThrow('Approval failed');
    });

    it('handles errors in getSupportedMethods', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient
          .getMockCall()
          .mockRejectedValueOnce(new Error('Generic error')) // Generic error
          .mockRejectedValueOnce(new RouterError('unknownChain')); // RouterError
      }

      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );

      // First call should fail with generic error
      await expect(router.testGetSupportedMethods({}, { chainIds: ['aztec:testnet'] })).rejects.toThrow(
        RouterErrorMap.walletNotAvailable.message,
      );

      // Second call should fail with RouterError
      await expect(router.testGetSupportedMethods({}, { chainIds: ['aztec:testnet'] })).rejects.toThrow(
        RouterErrorMap.unknownChain.message,
      );
    });
  });

  describe('Bulk Call Error Handling', () => {
    let router: TestWalletRouter;
    let testSessionId: string;

    beforeEach(async () => {
      router = new TestWalletRouter(
        mockSendResponse,
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

    it('handles permission check failures in bulk calls', async () => {
      const mockPermissionCallback = vi
        .fn()
        .mockResolvedValueOnce(true) // First method allowed
        .mockResolvedValueOnce(false); // Second method denied

      const router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        mockPermissionCallback,
        createDefaultPermissionApproval(),
      );
      const { sessionId } = await router.testConnect(
        {},
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount', 'aztec_getBalance'],
          },
        },
      );

      await expect(
        router.testBulkCall(
          {},
          {
            chainId: 'aztec:testnet',
            calls: [{ method: 'aztec_getAccount' }, { method: 'aztec_getBalance' }],
            sessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.insufficientPermissions.message);
    });

    it('handles validation errors in bulk calls', async () => {
      await expect(
        router.testBulkCall(
          {},
          {
            chainId: 'invalid:chain',
            calls: [{ method: 'test_method' }],
            sessionId: testSessionId,
          },
        ),
      ).rejects.toThrow(RouterErrorMap.unknownChain.message);
    });
  });

  describe('Supported Methods', () => {
    let router: TestWalletRouter;

    beforeEach(() => {
      router = new TestWalletRouter(
        mockSendResponse,
        mockWallets,
        createPermissivePermissions(),
        createDefaultPermissionApproval(),
      );
    });

    it('returns router methods when no chainIds are provided', async () => {
      const result = await router.testGetSupportedMethods({}, {});
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

    it('retrieves methods for multiple chains', async () => {
      const mockClient1 = mockWallets.get('aztec:testnet');
      const mockClient2 = mockWallets.get('eip155:1');

      if (mockClient1) {
        mockClient1.getMockCall().mockResolvedValueOnce({
          methods: ['aztec_getAccount', 'aztec_sendTransaction'],
        });
      }

      if (mockClient2) {
        mockClient2.getMockCall().mockResolvedValueOnce({
          methods: ['eth_accounts', 'eth_sendTransaction'],
        });
      }

      const result = await router.testGetSupportedMethods(
        {},
        {
          chainIds: ['aztec:testnet', 'eip155:1'],
        },
      );

      expect(result).toEqual({
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
        'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
      });

      expect(mockClient1?.getMockCall()).toHaveBeenCalledWith('wm_getSupportedMethods');
      expect(mockClient2?.getMockCall()).toHaveBeenCalledWith('wm_getSupportedMethods');
    });

    it('propagates RouterError when any chain is invalid', async () => {
      await expect(
        router.testGetSupportedMethods(
          {},
          {
            chainIds: ['aztec:testnet', 'invalid:chain'],
          },
        ),
      ).rejects.toThrow(RouterErrorMap.unknownChain.message);
    });

    it('returns empty methods array for chains without getSupportedMethods', async () => {
      // Create a mock client without getSupportedMethods
      const mockCall = vi.fn().mockImplementation((_: string) => {
        return Promise.resolve('success');
      });

      const mockClientWithoutCapabilities: MockWalletClient = {
        call: async <T = unknown>(method: string, params?: unknown): Promise<T> => {
          return mockCall(method, params) as Promise<T>;
        },
        getMockCall: () => mockCall,
      };

      mockWallets.set('aztec:testnet', mockClientWithoutCapabilities);

      const result = await router.testGetSupportedMethods(
        {},
        {
          chainIds: ['aztec:testnet'],
        },
      );

      expect(result).toEqual({
        'aztec:testnet': [],
      });
    });

    it('handles discovery errors', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce(new RouterError('walletNotAvailable'));
      }

      await expect(
        router.testGetSupportedMethods(
          {},
          {
            chainIds: ['aztec:testnet'],
          },
        ),
      ).rejects.toThrow(RouterErrorMap.walletNotAvailable.message);
    });

    it('handles non-RouterError errors', async () => {
      const mockClient = mockWallets.get('aztec:testnet');
      if (mockClient) {
        mockClient.getMockCall().mockRejectedValueOnce(new Error('Unknown error'));
      }

      await expect(
        router.testGetSupportedMethods(
          {},
          {
            chainIds: ['aztec:testnet'],
          },
        ),
      ).rejects.toThrow(RouterErrorMap.walletNotAvailable.message);
    });
  });
});
