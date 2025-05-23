import { describe, expect, it, beforeEach, vi } from 'vitest';
import { WalletRouterProvider } from './provider.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { RouterError } from './errors.js';
import { OperationBuilder } from './operation.js';

describe('WalletRouterProvider', () => {
  const mockCallMethod = vi.fn();
  const mockSendRequest = vi.fn();

  let provider: WalletRouterProvider;

  beforeEach(() => {
    mockCallMethod.mockClear();
    mockSendRequest.mockClear();

    // Create provider with mocked callMethod
    const mockTransport: JSONRPCTransport = {
      send: mockSendRequest,
      onMessage: vi.fn(),
    };
    provider = new WalletRouterProvider(mockTransport);
    // @ts-ignore - mock private method
    provider.callMethod = mockCallMethod;
  });

  describe('Session Management', () => {
    it('connects to a chain', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      const result = await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
      });
      expect(result).toStrictEqual({ sessionId });
      expect(provider.sessionId).toBe(sessionId);
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_connect',
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
        undefined,
      );
    });

    it('disconnects current session', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });
      await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
      });

      await provider.disconnect();
      expect(provider.sessionId).toBeUndefined();
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_disconnect',
        {
          sessionId: 'test-session',
        },
        undefined,
      );
    });

    it('gets all chain permissions', async () => {
      const sessionId = 'test-session';
      const permissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
        'eip155:1': ['eth_accounts', 'eth_call'],
      };
      mockCallMethod.mockResolvedValueOnce({ sessionId }).mockResolvedValueOnce(permissions);

      await provider.connect({
        'aztec:testnet': permissions['aztec:testnet'],
        'eip155:1': permissions['eip155:1'],
      });
      const result = await provider.getPermissions();

      expect(result).toEqual(permissions);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_getPermissions',
        {
          sessionId: 'test-session',
        },
        undefined,
      );
    });

    it('gets permissions for specific chains', async () => {
      const sessionId = 'test-session';
      const permissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };
      mockCallMethod.mockResolvedValueOnce({ sessionId }).mockResolvedValueOnce(permissions);

      await provider.connect({
        'aztec:testnet': permissions['aztec:testnet'],
        'eip155:1': ['eth_accounts'],
      });
      const result = await provider.getPermissions(['aztec:testnet']);

      expect(result).toEqual(permissions);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_getPermissions',
        {
          sessionId: 'test-session',
          chainIds: ['aztec:testnet'],
        },
        undefined,
      );
    });

    it('returns empty permissions when not connected', async () => {
      const allPerms = await provider.getPermissions();
      expect(allPerms).toEqual({});

      const chainPerms = await provider.getPermissions(['aztec:testnet']);
      expect(chainPerms).toEqual({});

      expect(mockCallMethod).not.toHaveBeenCalled();
    });

    it('updates permissions for multiple chains', async () => {
      const sessionId = 'test-session';
      const newPermissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
        'eip155:1': ['eth_accounts', 'eth_call'],
      };
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
        'eip155:1': ['eth_accounts'],
      });
      await provider.updatePermissions(newPermissions);

      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_updatePermissions',
        {
          sessionId: 'test-session',
          permissions: newPermissions,
        },
        undefined,
      );
    });

    it('throws when updating permissions without connection', async () => {
      await expect(
        provider.updatePermissions({
          'aztec:testnet': ['aztec_getAccount'],
        }),
      ).rejects.toThrow(new RouterError('invalidSession'));
    });
  });

  describe('Method Invocation', () => {
    const sessionId = 'test-session';

    beforeEach(async () => {
      mockCallMethod.mockResolvedValueOnce({ sessionId });
      await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
      });
    });

    it('supports timeout parameter', async () => {
      const expectedResult = { address: '0x123' };
      mockCallMethod.mockResolvedValueOnce(expectedResult);

      const result = await provider.call('aztec:testnet', { method: 'aztec_getAccount' }, 5000);

      expect(result).toEqual(expectedResult);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_call',
        {
          chainId: 'aztec:testnet',
          sessionId: 'test-session',
          call: {
            method: 'aztec_getAccount',
          },
        },
        5000,
      );
    });

    it('executes bulk method calls', async () => {
      const expectedResults = [{ address: '0x123' }, { balance: '1000' }];
      mockCallMethod.mockResolvedValueOnce(expectedResults);

      const result = await provider.bulkCall('aztec:testnet', [
        { method: 'aztec_getAccount' },
        { method: 'aztec_getBalance' },
      ]);

      expect(result).toEqual(expectedResults);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_bulkCall',
        {
          chainId: 'aztec:testnet',
          sessionId: 'test-session',
          calls: [{ method: 'aztec_getAccount' }, { method: 'aztec_getBalance' }],
        },
        undefined,
      );
    });

    it('throws when executing bulk calls without connection', async () => {
      await provider.disconnect();
      await expect(provider.bulkCall('aztec:testnet', [{ method: 'aztec_getAccount' }])).rejects.toThrow(
        new RouterError('invalidSession'),
      );
    });

    it('invokes methods on the wallet', async () => {
      const expectedResult = { address: '0x123' };
      mockCallMethod.mockResolvedValueOnce(expectedResult);

      const result = await provider.call('aztec:testnet', { method: 'aztec_getAccount' });

      expect(result).toEqual(expectedResult);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_call',
        {
          chainId: 'aztec:testnet',
          sessionId: 'test-session',
          call: {
            method: 'aztec_getAccount',
          },
        },
        undefined,
      );
    });

    it('throws when invoking methods without connection', async () => {
      await provider.disconnect();
      await expect(provider.call('aztec:testnet', { method: 'aztec_getAccount' })).rejects.toThrow(
        new RouterError('invalidSession'),
      );
    });
  });

  describe('Session Management Edge Cases', () => {
    it('safely handles disconnect when not connected', async () => {
      await provider.disconnect();
      expect(provider.sessionId).toBeUndefined();
      expect(mockCallMethod).not.toHaveBeenCalled();
    });

    it('supports timeout parameter in connect', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      await provider.connect(
        {
          'aztec:testnet': ['aztec_getAccount'],
        },
        5000,
      );
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_connect',
        {
          permissions: {
            'aztec:testnet': ['aztec_getAccount'],
          },
        },
        5000,
      );
    });

    it('supports timeout parameter in disconnect', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });
      await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
      });
      mockCallMethod.mockClear();

      await provider.disconnect(5000);
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_disconnect',
        {
          sessionId: 'test-session',
        },
        5000,
      );
    });

    it('supports timeout parameter in getPermissions', async () => {
      const sessionId = 'test-session';
      const permissions = {
        'aztec:testnet': ['aztec_getAccount'],
        'eip155:1': ['eth_accounts'],
      };
      mockCallMethod.mockResolvedValueOnce({ sessionId }).mockResolvedValueOnce(permissions);

      await provider.connect({
        'aztec:testnet': permissions['aztec:testnet'],
        'eip155:1': permissions['eip155:1'],
      });

      // Get all permissions with timeout
      await provider.getPermissions(undefined, 5000);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_getPermissions',
        {
          sessionId: 'test-session',
        },
        5000,
      );

      // Get specific chain permissions with timeout
      await provider.getPermissions(['aztec:testnet'], 5000);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_getPermissions',
        {
          sessionId: 'test-session',
          chainIds: ['aztec:testnet'],
        },
        5000,
      );
    });

    it('supports timeout parameter in updatePermissions', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      await provider.connect({
        'aztec:testnet': ['aztec_getAccount'],
        'eip155:1': ['eth_accounts'],
      });

      const permissions = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
        'eip155:1': ['eth_accounts', 'eth_call'],
      };
      await provider.updatePermissions(permissions, 5000);
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_updatePermissions',
        {
          sessionId: 'test-session',
          permissions,
        },
        5000,
      );
    });
  });

  describe('Operation Builder', () => {
    it('creates operation builder with correct chain ID', async () => {
      // Connect first to establish a session
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });
      await provider.connect({
        'eip155:1': ['eth_getBalance'],
      });

      const builder = provider.chain('eip155:1');
      expect(builder).toBeInstanceOf(OperationBuilder);

      // Verify the builder works by executing a call
      mockCallMethod.mockResolvedValueOnce('0x123');
      const result = await builder.call('eth_getBalance', ['0xabc']).execute();

      expect(result).toBe('0x123');
      expect(mockCallMethod).toHaveBeenLastCalledWith(
        'wm_call',
        {
          chainId: 'eip155:1',
          sessionId: 'test-session',
          call: {
            method: 'eth_getBalance',
            params: ['0xabc'],
          },
        },
        undefined,
      );
    });
  });

  describe('Capabilities', () => {
    beforeEach(async () => {
      // Clear any previous mock calls
      mockCallMethod.mockClear();
    });

    it('gets router methods when no chains specified', async () => {
      const expectedMethods = {
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
      };
      mockCallMethod.mockResolvedValueOnce(expectedMethods);

      const result = await provider.getSupportedMethods();
      expect(result).toEqual(expectedMethods);
      expect(mockCallMethod).toHaveBeenCalledWith('wm_getSupportedMethods', {}, undefined);
    });

    it('gets methods for multiple chains', async () => {
      const expectedMethods = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
        'eip155:1': ['eth_accounts', 'eth_sendTransaction'],
      };
      mockCallMethod.mockResolvedValueOnce(expectedMethods);

      const result = await provider.getSupportedMethods(['aztec:testnet', 'eip155:1']);
      expect(result).toEqual(expectedMethods);
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_getSupportedMethods',
        {
          chainIds: ['aztec:testnet', 'eip155:1'],
        },
        undefined,
      );
    });

    it('supports timeout parameter in getSupportedMethods', async () => {
      const expectedMethods = {
        'aztec:testnet': ['aztec_getAccount', 'aztec_sendTransaction'],
      };
      mockCallMethod.mockResolvedValueOnce(expectedMethods);

      await provider.getSupportedMethods(['aztec:testnet'], 5000);
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_getSupportedMethods',
        {
          chainIds: ['aztec:testnet'],
        },
        5000,
      );
    });
  });
});
