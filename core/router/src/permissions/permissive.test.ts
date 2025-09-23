import { describe, expect, it } from 'vitest';
import type { RouterContext } from '../types.js';
import { PermissivePermissionsManager } from './permissive.js';

describe('PermissivePermissionsManager', () => {
  const manager = new PermissivePermissionsManager();
  const mockContext = {} as RouterContext;
  const mockRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'test_method',
    params: {},
  };

  it('should always return true for checkPermissions', async () => {
    const result = await manager.checkPermissions(mockContext, mockRequest);
    expect(result).toBe(true);
  });

  it('should return wildcard permissions for getPermissions', async () => {
    const permissions = await manager.getPermissions();
    expect(permissions).toEqual({
      '*': {
        '*': {
          allowed: true,
          shortDescription: 'Permissive',
        },
      },
    });
  });

  it('should return wildcard permissions for approvePermissions', async () => {
    const permissions = await manager.approvePermissions(mockContext, {
      'eip155:1': ['eth_sendTransaction'],
    });
    expect(permissions).toEqual({
      '*': {
        '*': {
          allowed: true,
          shortDescription: 'Permissive',
        },
      },
    });
  });
});
