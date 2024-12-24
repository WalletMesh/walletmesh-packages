import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSONRPCWalletClient, type WalletMethodMap } from './jsonrpc-adapter.js';
import type { JSONRPCPeer } from '@walletmesh/jsonrpc';

describe('JSONRPCWalletClient', () => {
  // Create a mock JSONRPCPeer
  let mockCallMethod: ReturnType<typeof vi.fn>;
  let mockOn: ReturnType<typeof vi.fn>;
  let mockClient: JSONRPCPeer<WalletMethodMap>;

  beforeEach(() => {
    mockCallMethod = vi.fn();
    mockOn = vi.fn().mockReturnValue(() => {}); // Returns cleanup function
    mockClient = {
      callMethod: mockCallMethod,
      on: mockOn,
    } as unknown as JSONRPCPeer<WalletMethodMap>;
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

  describe('event handling', () => {
    it('registers event handlers with on()', () => {
      const client = new JSONRPCWalletClient(mockClient);
      const handler = vi.fn();

      client.on('accountsChanged', handler);

      expect(mockOn).toHaveBeenCalledWith('accountsChanged', handler);
    });

    it('supports multiple handlers for the same event', () => {
      const client = new JSONRPCWalletClient(mockClient);
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      client.on('accountsChanged', handler1);
      client.on('accountsChanged', handler2);

      expect(mockOn).toHaveBeenCalledWith('accountsChanged', handler1);
      expect(mockOn).toHaveBeenCalledWith('accountsChanged', handler2);
    });

    it('removes event handlers with off()', () => {
      const client = new JSONRPCWalletClient(mockClient);
      const handler = vi.fn();
      const mockCleanup = vi.fn();
      mockOn.mockReturnValue(mockCleanup);

      client.on('accountsChanged', handler);
      client.off('accountsChanged', handler);

      expect(mockCleanup).toHaveBeenCalled();
    });

    it('handles off() with non-existent handler', () => {
      const client = new JSONRPCWalletClient(mockClient);
      const handler = vi.fn();

      // Should not throw when removing non-existent handler
      client.off('accountsChanged', handler);
    });

    it('properly cleans up event handlers', () => {
      const client = new JSONRPCWalletClient(mockClient);
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const mockCleanup1 = vi.fn();
      const mockCleanup2 = vi.fn();

      mockOn.mockReturnValueOnce(mockCleanup1);
      mockOn.mockReturnValueOnce(mockCleanup2);

      client.on('accountsChanged', handler1);
      client.on('accountsChanged', handler2);

      client.off('accountsChanged', handler1);
      expect(mockCleanup1).toHaveBeenCalled();
      expect(mockCleanup2).not.toHaveBeenCalled();

      client.off('accountsChanged', handler2);
      expect(mockCleanup2).toHaveBeenCalled();
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
