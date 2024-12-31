import { describe, expect, it } from 'vitest';
import type { RouterContext, RouterMethodMap } from './types.js';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import {
  createPermissivePermissions,
  createStringMatchPermissions,
  createPermissivePermissionApproval,
  createStringMatchPermissionApproval,
} from './permissions.js';

describe('Permission System', () => {
  describe('Permission Checking', () => {
    describe('createPermissivePermissions', () => {
      const permissions = createPermissivePermissions();

      it('allows all operations', async () => {
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_call',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            call: {
              method: 'eth_sendTransaction',
              params: {},
            },
          },
        };

        expect(await permissions(context, request)).toBe(true);
      });
    });

    describe('createStringMatchPermissions', () => {
      it('matches exact patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_sendTransaction']);
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_call',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            call: {
              method: 'eth_sendTransaction',
              params: {},
            },
          },
        };

        expect(await permissions(context, request)).toBe(true);
      });

      it('matches wildcard patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:*:eth_*']);
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_call',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            call: {
              method: 'eth_sendTransaction',
              params: {},
            },
          },
        };

        expect(await permissions(context, request)).toBe(true);
      });

      it('matches non-call operations', async () => {
        const permissions = createStringMatchPermissions(['wm_connect']);
        const context: RouterContext = {
          origin: 'test',
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_connect',
          params: {
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context, request)).toBe(true);
      });

      it('rejects non-matching patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_*']);
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['personal_sign'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_call',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            call: {
              method: 'personal_sign',
              params: {},
            },
          },
        };

        expect(await permissions(context, request)).toBe(false);
      });

      it('matches bulk calls', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_*']);
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_getBalance', 'eth_getBlockNumber'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_bulkCall',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            calls: [
              {
                method: 'eth_getBalance',
                params: ['0x123'],
              },
              {
                method: 'eth_getBlockNumber',
                params: [],
              },
            ],
          },
        };

        expect(await permissions(context, request)).toBe(true);
      });

      it('denies call operations without session permissions', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_*']);
        const context: RouterContext = {
          origin: 'test',
          // No session provided
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_call',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            call: {
              method: 'eth_sendTransaction',
              params: {},
            },
          },
        };

        expect(await permissions(context, request)).toBe(false);
      });

      it('denies bulk call operations without session permissions', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_*']);
        const context: RouterContext = {
          origin: 'test',
          // No session provided
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_bulkCall',
          params: {
            chainId: 'eip155:1',
            sessionId: '123',
            calls: [
              {
                method: 'eth_getBalance',
                params: ['0x123'],
              },
            ],
          },
        };

        expect(await permissions(context, request)).toBe(false);
      });

      it('denies non-matching method types', async () => {
        const permissions = createStringMatchPermissions(['wm_connect']);
        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_getBalance'],
            },
          },
        };

        const request: JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap> = {
          jsonrpc: '2.0',
          id: 1,
          method: 'wm_disconnect',
          params: {},
        };

        expect(await permissions(context, request)).toBe(false);
      });
    });
  });

  describe('Permission Approval', () => {
    describe('createPermissivePermissionApproval', () => {
      const approval = createPermissivePermissionApproval();

      it('approves all requested permissions', async () => {
        const context: RouterContext = {
          origin: 'test',
        };

        const requestedPermissions = {
          'eip155:1': ['eth_sendTransaction', 'eth_sign'],
          'eip155:5': ['eth_call'],
        };

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual(requestedPermissions);
      });

      it('handles empty permission requests', async () => {
        const context: RouterContext = {
          origin: 'test',
        };

        const requestedPermissions = {};

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual({});
      });
    });

    describe('createStringMatchPermissionApproval', () => {
      it('filters permissions based on patterns', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:1:eth_*', 'eip155:5:eth_call']);

        const context: RouterContext = {
          origin: 'test',
        };

        const requestedPermissions = {
          'eip155:1': ['eth_sendTransaction', 'eth_sign', 'personal_sign'],
          'eip155:5': ['eth_call', 'eth_sendTransaction'],
        };

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual({
          'eip155:1': ['eth_sendTransaction', 'eth_sign'],
          'eip155:5': ['eth_call'],
        });
      });

      it('handles wildcard patterns', async () => {
        const approval = createStringMatchPermissionApproval(['*:eth_call']);

        const context: RouterContext = {
          origin: 'test',
        };

        const requestedPermissions = {
          'eip155:1': ['eth_call', 'eth_sign'],
          'eip155:5': ['eth_call'],
          'aztec:testnet': ['eth_call', 'aztec_deposit'],
        };

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
          'eip155:5': ['eth_call'],
          'aztec:testnet': ['eth_call'],
        });
      });

      it('excludes chains with no approved methods', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:1:eth_*']);

        const context: RouterContext = {
          origin: 'test',
        };

        const requestedPermissions = {
          'eip155:1': ['eth_call'],
          'eip155:5': ['personal_sign'], // Should be excluded
        };

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
        });
        expect(result['eip155:5']).toBeUndefined();
      });

      it('handles permission updates', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:*:eth_*']);

        const context: RouterContext = {
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_call'],
            },
          },
        };

        const requestedPermissions = {
          'eip155:1': ['eth_call', 'personal_sign'],
          'eip155:5': ['eth_sendTransaction'],
        };

        const result = await approval(context, requestedPermissions);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
          'eip155:5': ['eth_sendTransaction'],
        });
      });
    });
  });
});
