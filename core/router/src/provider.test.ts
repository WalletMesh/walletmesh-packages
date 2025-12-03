import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouterError } from './errors.js';
import { OperationBuilder } from './operation.js';
import { WalletRouterProvider } from './provider.js';

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

    it('reconnects with valid session', async () => {
      const sessionId = 'test-session-123';
      const permissions = {
        'eip155:1': {
          eth_accounts: {
            allowed: true,
            shortDescription: 'View Accounts',
            longDescription: 'Allow viewing your Ethereum addresses',
          },
        },
      };
      mockCallMethod.mockResolvedValueOnce({ status: true, permissions });

      const result = await provider.reconnect(sessionId);

      expect(result.status).toBe(true);
      expect(result.permissions).toEqual(permissions);
      expect(provider.sessionId).toBe(sessionId);
      expect(mockCallMethod).toHaveBeenCalledWith('wm_reconnect', { sessionId }, undefined);
    });

    it('reconnects with timeout parameter', async () => {
      const sessionId = 'test-session-123';
      const permissions = {};
      mockCallMethod.mockResolvedValueOnce({ status: true, permissions });

      await provider.reconnect(sessionId, 5000);

      expect(mockCallMethod).toHaveBeenCalledWith('wm_reconnect', { sessionId }, 5000);
    });

    it('emits connection:restored event on successful reconnection', async () => {
      const sessionId = 'test-session-123';
      const permissions = { 'eip155:1': {} };
      const emitSpy = vi.spyOn(provider, 'emit');

      mockCallMethod.mockResolvedValueOnce({ status: true, permissions });

      await provider.reconnect(sessionId);

      expect(emitSpy).toHaveBeenCalledWith('connection:restored', {
        sessionId,
        permissions,
      });
    });

    it('does not emit event when reconnection status is false', async () => {
      const sessionId = 'test-session-123';
      const emitSpy = vi.spyOn(provider, 'emit');

      mockCallMethod.mockResolvedValueOnce({ status: false, permissions: {} });

      await provider.reconnect(sessionId);

      expect(emitSpy).not.toHaveBeenCalledWith('connection:restored', expect.anything());
    });

    it('throws on invalid session during reconnection', async () => {
      const sessionId = 'invalid-session';
      mockCallMethod.mockRejectedValueOnce(new RouterError('invalidSession'));

      await expect(provider.reconnect(sessionId)).rejects.toThrow(new RouterError('invalidSession'));
      expect(provider.sessionId).toBeUndefined();
    });

    it('clears session ID when reconnection fails', async () => {
      const sessionId = 'test-session-123';
      // First set a session ID
      mockCallMethod.mockResolvedValueOnce({ sessionId });
      await provider.connect({ 'eip155:1': ['eth_accounts'] });
      expect(provider.sessionId).toBe(sessionId);

      // Now try to reconnect with invalid session
      const invalidSession = 'invalid-session';
      mockCallMethod.mockRejectedValueOnce(new Error('Session not found'));

      await expect(provider.reconnect(invalidSession)).rejects.toThrow('Session not found');
      expect(provider.sessionId).toBeUndefined();
    });

    it('requires sessionId parameter for reconnection', async () => {
      await expect(provider.reconnect('')).rejects.toThrow('Session ID is required for reconnection');
      expect(provider.sessionId).toBeUndefined();
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

  describe('registerMethodSerializer', () => {
    it('should register a serializer for a method', () => {
      const serializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };

      // Should not throw
      expect(() => provider.registerMethodSerializer('test_method', serializer)).not.toThrow();
    });

    it('should register a serializer through the overloaded method signature', () => {
      const serializers = {
        aztec_sendTransaction: {
          params: {
            serialize: vi.fn().mockResolvedValue('serialized'),
            deserialize: vi.fn(),
          },
        },
        aztec_call: {
          params: {
            serialize: vi.fn().mockResolvedValue('serialized'),
            deserialize: vi.fn(),
          },
        },
      };

      // Should not throw
      expect(() => {
        provider.registerMethodSerializer('aztec_sendTransaction', serializers.aztec_sendTransaction);
        provider.registerMethodSerializer('aztec_call', serializers.aztec_call);
      }).not.toThrow();
    });

    it('should use registered serializer during method calls', async () => {
      // Create a custom provider to test serialization directly
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      await provider.connect({ 'test-chain': ['test_method'] });

      // Register a serializer
      const serializedParams = { custom: 'serialized-data' };
      const serializer = {
        params: {
          serialize: vi.fn().mockResolvedValue(serializedParams),
          deserialize: vi.fn(),
        },
      };

      provider.registerMethodSerializer('test_method', serializer);

      // Mock the callMethod to return a result
      mockCallMethod.mockResolvedValueOnce('test-result');

      // Make a call
      const originalParams = { data: 'original' };
      await provider.call('test-chain', {
        method: 'test_method',
        params: originalParams,
      });

      // Verify serializer was called
      expect(serializer.params?.serialize).toHaveBeenCalledWith('test_method', originalParams);

      // Verify the serialized params were sent to callMethod
      expect(mockCallMethod).toHaveBeenCalledWith(
        'wm_call',
        {
          sessionId: 'test-session',
          chainId: 'test-chain',
          call: {
            method: 'test_method',
            params: serializedParams, // Serialized params should be used
          },
        },
        undefined,
      );
    });

    it('should handle serialization errors', async () => {
      const sessionId = 'test-session';
      mockCallMethod.mockResolvedValueOnce({ sessionId });

      await provider.connect({ 'test-chain': ['test_method'] });

      // Register a serializer that throws
      const serializationError = new Error('Serialization failed');
      const serializer = {
        params: {
          serialize: vi.fn().mockRejectedValue(serializationError),
          deserialize: vi.fn(),
        },
      };

      provider.registerMethodSerializer('test_method', serializer);

      // Clear previous calls
      mockCallMethod.mockClear();

      // Make a call - should throw the serialization error
      await expect(
        provider.call('test-chain', {
          method: 'test_method',
          params: { data: 'test' },
        }),
      ).rejects.toThrow(serializationError);

      // Verify callMethod was never called due to serialization error
      expect(mockCallMethod).not.toHaveBeenCalled();
    });
  });
});
