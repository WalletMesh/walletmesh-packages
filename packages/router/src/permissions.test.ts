import { describe, expect, it } from 'vitest';
import {
  createPermissivePermissions,
  createStringMatchPermissions,
  createPermissivePermissionApproval,
  createStringMatchPermissionApproval,
} from './permissions.js';
import type { PermissionContext, PermissionApprovalContext } from './types.js';

describe('Permission System', () => {
  describe('Permission Checking', () => {
    describe('createPermissivePermissions', () => {
      const permissions = createPermissivePermissions();

      it('allows all operations', async () => {
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });
    });

    describe('createStringMatchPermissions', () => {
      it('matches exact patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_sendTransaction']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });

      it('matches wildcard patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:*:eth_*']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });

      it('matches chain-only patterns for non-call operations', async () => {
        const permissions = createStringMatchPermissions(['eip155:1']);
        const context: PermissionContext = {
          operation: 'connect',
          chainId: 'eip155:1',
          params: ['eth_sendTransaction'],
          origin: 'test',
        };

        expect(await permissions(context)).toBe(true);
      });

      it('rejects non-matching patterns', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:eth_*']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'personal_sign',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['personal_sign'],
            },
          },
        };

        expect(await permissions(context)).toBe(false);
      });

      it('matches global wildcard', async () => {
        const permissions = createStringMatchPermissions(['*']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });

      it('matches method wildcard', async () => {
        const permissions = createStringMatchPermissions(['eip155:1:*']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:1',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });

      it('matches chain wildcard', async () => {
        const permissions = createStringMatchPermissions(['eip155:*:eth_sendTransaction']);
        const context: PermissionContext = {
          operation: 'call',
          chainId: 'eip155:5',
          method: 'eth_sendTransaction',
          params: {},
          origin: 'test',
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:5': ['eth_sendTransaction'],
            },
          },
        };

        expect(await permissions(context)).toBe(true);
      });
    });
  });

  describe('Permission Approval', () => {
    describe('createPermissivePermissionApproval', () => {
      const approval = createPermissivePermissionApproval();

      it('approves all requested permissions', async () => {
        const context: PermissionApprovalContext = {
          operation: 'connect',
          origin: 'test',
          requestedPermissions: {
            'eip155:1': ['eth_sendTransaction', 'eth_sign'],
            'eip155:5': ['eth_call'],
          },
        };

        const result = await approval(context);
        expect(result).toEqual(context.requestedPermissions);
      });

      it('handles empty permission requests', async () => {
        const context: PermissionApprovalContext = {
          operation: 'connect',
          origin: 'test',
          requestedPermissions: {},
        };

        const result = await approval(context);
        expect(result).toEqual({});
      });
    });

    describe('createStringMatchPermissionApproval', () => {
      it('filters permissions based on patterns', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:1:eth_*', 'eip155:5:eth_call']);

        const context: PermissionApprovalContext = {
          operation: 'connect',
          origin: 'test',
          requestedPermissions: {
            'eip155:1': ['eth_sendTransaction', 'eth_sign', 'personal_sign'],
            'eip155:5': ['eth_call', 'eth_sendTransaction'],
          },
        };

        const result = await approval(context);
        expect(result).toEqual({
          'eip155:1': ['eth_sendTransaction', 'eth_sign'],
          'eip155:5': ['eth_call'],
        });
      });

      it('handles wildcard patterns', async () => {
        const approval = createStringMatchPermissionApproval(['*:eth_call']);

        const context: PermissionApprovalContext = {
          operation: 'connect',
          origin: 'test',
          requestedPermissions: {
            'eip155:1': ['eth_call', 'eth_sign'],
            'eip155:5': ['eth_call'],
            'aztec:testnet': ['eth_call', 'aztec_deposit'],
          },
        };

        const result = await approval(context);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
          'eip155:5': ['eth_call'],
          'aztec:testnet': ['eth_call'],
        });
      });

      it('excludes chains with no approved methods', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:1:eth_*']);

        const context: PermissionApprovalContext = {
          operation: 'connect',
          origin: 'test',
          requestedPermissions: {
            'eip155:1': ['eth_call'],
            'eip155:5': ['personal_sign'], // Should be excluded
          },
        };

        const result = await approval(context);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
        });
        expect(result['eip155:5']).toBeUndefined();
      });

      it('handles permission updates', async () => {
        const approval = createStringMatchPermissionApproval(['eip155:*:eth_*']);

        const context: PermissionApprovalContext = {
          operation: 'updatePermissions',
          origin: 'test',
          requestedPermissions: {
            'eip155:1': ['eth_call', 'personal_sign'],
            'eip155:5': ['eth_sendTransaction'],
          },
          session: {
            id: '123',
            origin: 'test',
            permissions: {
              'eip155:1': ['eth_call'],
            },
          },
        };

        const result = await approval(context);
        expect(result).toEqual({
          'eip155:1': ['eth_call'],
          'eip155:5': ['eth_sendTransaction'],
        });
      });
    });
  });
});
