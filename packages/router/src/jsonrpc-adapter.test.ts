import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSONRPCWalletClient, type WalletMethodMap } from './jsonrpc-adapter.js';
import type { JSONRPCClient } from '@walletmesh/jsonrpc';

describe('JSONRPCWalletClient', () => {
  // Create a mock JSONRPCClient
  const mockCallMethod = vi.fn();
  const mockClient = {
    callMethod: mockCallMethod,
  } as unknown as JSONRPCClient<WalletMethodMap>;

  beforeEach(() => {
    mockCallMethod.mockReset();
  });

  describe('call', () => {
    it('handles undefined params', async () => {
      const client = new JSONRPCWalletClient(mockClient);
      mockCallMethod.mockResolvedValueOnce('result');

      const result = await client.call('test_method');

      expect(mockCallMethod).toHaveBeenCalledWith('test_method', undefined);
      expect(result).toBe('result');
    });

    it('handles array params', async () => {
      const client = new JSONRPCWalletClient(mockClient);
      const params = ['param1', 'param2'];
      mockCallMethod.mockResolvedValueOnce('result');

      const result = await client.call('test_method', params);

      expect(mockCallMethod).toHaveBeenCalledWith('test_method', params);
      expect(result).toBe('result');
    });

    it('handles object params', async () => {
      const client = new JSONRPCWalletClient(mockClient);
      const params = { key: 'value' };
      mockCallMethod.mockResolvedValueOnce('result');

      const result = await client.call('test_method', params);

      expect(mockCallMethod).toHaveBeenCalledWith('test_method', params);
      expect(result).toBe('result');
    });

    it('converts invalid params to undefined', async () => {
      const client = new JSONRPCWalletClient(mockClient);
      mockCallMethod.mockResolvedValueOnce('result');

      // Test with a number which is not a valid JSONRPCParams type
      const result = await client.call('test_method', 123);

      expect(mockCallMethod).toHaveBeenCalledWith('test_method', undefined);
      expect(result).toBe('result');
    });
  });

  describe('getSupportedMethods', () => {
    it('calls wm_getSupportedMethods method', async () => {
      const client = new JSONRPCWalletClient(mockClient);
      const expectedCapabilities = { methods: ['method1', 'method2'] };
      mockCallMethod.mockResolvedValueOnce(expectedCapabilities);

      const result = await client.getSupportedMethods();

      expect(mockCallMethod).toHaveBeenCalledWith('wm_getSupportedMethods');
      expect(result).toEqual(expectedCapabilities);
    });
  });
});
