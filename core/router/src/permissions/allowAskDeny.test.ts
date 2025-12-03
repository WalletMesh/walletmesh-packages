import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BulkCallParams,
  CallParams,
  ChainPermissions,
  HumanReadableChainPermissions,
  RouterContext,
  RouterMethodMap,
  SessionData,
} from '../types.js';
import { AllowAskDenyManager, AllowAskDenyState } from './allowAskDeny.js';

describe('AllowAskDenyManager', () => {
  let manager: AllowAskDenyManager;
  const mockSession: SessionData = {
    id: 'test-session',
    origin: 'test-origin',
    createdAt: Date.now(),
  };
  const mockContext: RouterContext = {
    session: mockSession,
    origin: 'test-origin',
  };

  beforeEach(() => {
    // Initialize with some test permissions
    const initialState = new Map([
      [
        'eip155:1',
        new Map([
          ['eth_sendTransaction', AllowAskDenyState.ASK],
          ['eth_accounts', AllowAskDenyState.ALLOW],
          ['eth_signMessage', AllowAskDenyState.DENY],
        ]),
      ],
    ]);

    const askCallback = vi.fn(async (_context, _request) => true);
    const approveCallback = vi.fn(
      (_context, permissionRequest: ChainPermissions): Promise<HumanReadableChainPermissions> => {
        const result: HumanReadableChainPermissions = {};
        for (const [chainId, methods] of Object.entries(permissionRequest)) {
          result[chainId] = {};
          for (const method of methods) {
            result[chainId][method] = {
              allowed: true,
              shortDescription: AllowAskDenyState.ALLOW,
            };
          }
        }
        return Promise.resolve(result);
      },
    );
    manager = new AllowAskDenyManager(approveCallback, askCallback, initialState);

    vi.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('should return all permissions when no chainIds provided', async () => {
      const permissions = await manager.getPermissions(mockContext);
      expect(permissions['eip155:1']).toEqual({
        eth_sendTransaction: { allowed: true, shortDescription: AllowAskDenyState.ASK },
        eth_accounts: { allowed: true, shortDescription: AllowAskDenyState.ALLOW },
        eth_signMessage: { allowed: false, shortDescription: AllowAskDenyState.DENY },
      });
    });

    it('should return filtered permissions when chainIds provided', async () => {
      const permissions = await manager.getPermissions(mockContext, ['eip155:1']);
      expect(permissions['eip155:1']).toBeDefined();
      expect(Object.keys(permissions)).toHaveLength(1);
    });

    it('should return empty object when no session or origin', async () => {
      const permissions = await manager.getPermissions({} as RouterContext);
      expect(permissions).toEqual({});
    });
  });

  describe('checkCallPermissions', () => {
    const createCallRequest = (method: string): JSONRPCRequest<RouterMethodMap, 'wm_call', CallParams> => ({
      jsonrpc: '2.0',
      id: 1,
      method: 'wm_call',
      params: {
        chainId: 'eip155:1',
        sessionId: mockSession.id,
        call: {
          method,
          params: [],
        },
      },
    });

    it('should allow permitted methods', async () => {
      const result = await manager.checkCallPermissions(mockContext, createCallRequest('eth_accounts'));
      expect(result).toBe(true);
    });

    it('should deny forbidden methods', async () => {
      const result = await manager.checkCallPermissions(mockContext, createCallRequest('eth_signMessage'));
      expect(result).toBe(false);
    });

    it('should prompt for ASK state methods', async () => {
      const result = await manager.checkCallPermissions(
        mockContext,
        createCallRequest('eth_sendTransaction'),
      );
      expect(result).toBe(true);
      expect(manager.askPermissions).toHaveBeenCalled();
    });

    it('should deny when chainId is missing', async () => {
      const result = await manager.checkCallPermissions(mockContext, {
        jsonrpc: '2.0',
        id: 1,
        method: 'wm_call',
        params: {
          sessionId: mockSession.id,
          call: {
            method: 'eth_accounts',
            params: [],
          },
        },
      } as unknown as JSONRPCRequest<RouterMethodMap, 'wm_call', CallParams>);
      expect(result).toBe(false);
    });
  });

  describe('checkBulkCallPermissions', () => {
    const createBulkCallRequest = (
      methods: string[],
    ): JSONRPCRequest<RouterMethodMap, 'wm_bulkCall', BulkCallParams> => ({
      jsonrpc: '2.0',
      id: 1,
      method: 'wm_bulkCall',
      params: {
        chainId: 'eip155:1',
        sessionId: mockSession.id,
        calls: methods.map((method) => ({
          method,
          params: [],
        })),
      },
    });

    it('should allow when all methods are allowed', async () => {
      const result = await manager.checkBulkCallPermissions(
        mockContext,
        createBulkCallRequest(['eth_accounts']),
      );
      expect(result).toBe(true);
    });

    it('should deny when any method is denied', async () => {
      const result = await manager.checkBulkCallPermissions(
        mockContext,
        createBulkCallRequest(['eth_accounts', 'eth_signMessage']),
      );
      expect(result).toBe(false);
    });

    it('should prompt when any method is in ASK state', async () => {
      const result = await manager.checkBulkCallPermissions(
        mockContext,
        createBulkCallRequest(['eth_accounts', 'eth_sendTransaction']),
      );
      expect(result).toBe(true);
      expect(manager.askPermissions).toHaveBeenCalled();
    });

    it('should deny when chainId is missing', async () => {
      const result = await manager.checkBulkCallPermissions(mockContext, {
        jsonrpc: '2.0',
        id: 1,
        method: 'wm_bulkCall',
        params: {
          chainId: undefined as unknown as string,
          sessionId: mockSession.id,
          calls: [
            {
              method: 'eth_accounts',
              params: [],
            },
          ],
        },
      } as JSONRPCRequest<RouterMethodMap, 'wm_bulkCall', BulkCallParams>);
      expect(result).toBe(false);
    });

    it('should deny when no call methods', async () => {
      const result = await manager.checkBulkCallPermissions(mockContext, createBulkCallRequest([]));
      expect(result).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    it('should handle wm_call', async () => {
      const result = await manager.checkPermissions(mockContext, {
        jsonrpc: '2.0',
        id: 1,
        method: 'wm_call',
        params: {
          chainId: 'eip155:1',
          sessionId: mockSession.id,
          call: {
            method: 'eth_accounts',
            params: [],
          },
        },
      } as JSONRPCRequest<RouterMethodMap, 'wm_call', CallParams>);
      expect(result).toBe(true);
    });

    it('should handle wm_bulkCall', async () => {
      const result = await manager.checkPermissions(mockContext, {
        jsonrpc: '2.0',
        id: 1,
        method: 'wm_bulkCall',
        params: {
          chainId: 'eip155:1',
          sessionId: mockSession.id,
          calls: [
            {
              method: 'eth_accounts',
              params: [],
            },
          ],
        },
      } as JSONRPCRequest<RouterMethodMap, 'wm_bulkCall', BulkCallParams>);
      expect(result).toBe(true);
    });

    it('should return true for unknown methods', async () => {
      const result = await manager.checkPermissions(mockContext, {
        jsonrpc: '2.0',
        id: 1,
        method: 'unknown_method',
        params: {},
      } as JSONRPCRequest<RouterMethodMap, keyof RouterMethodMap>);
      expect(result).toBe(true);
    });
  });
});
