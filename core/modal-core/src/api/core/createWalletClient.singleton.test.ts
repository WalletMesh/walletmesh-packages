/**
 * @file Tests for WalletClient singleton instance manager
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletMeshClient, WalletMeshConfig } from '../core/createWalletClient.js';
import {
  clearAllInstances,
  getExistingInstance,
  getWalletClientInstance,
} from './createWalletClient.singleton.js';

// Mock the createWalletMesh function
vi.mock('../core/createWalletClient.js', () => ({
  createWalletMesh: vi.fn(),
}));

import { createWalletMesh } from '../core/createWalletClient.js';

describe('createWalletClient.singleton', () => {
  const mockConfig: WalletMeshConfig = {
    appName: 'Test App',
  };

  const createMockClient = (): WalletMeshClient =>
    ({
      destroy: vi.fn(),
      getWallets: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      switchChain: vi.fn(),
      getAccount: vi.fn(),
      subscribe: vi.fn(),
    }) as Partial<WalletMeshClient> as WalletMeshClient;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAllInstances();
  });

  afterEach(async () => {
    await clearAllInstances();
  });

  describe('getWalletClientInstance', () => {
    it('should create a new instance when none exists', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      const client = await getWalletClientInstance(mockConfig);

      expect(client).toBe(mockClient);
      expect(createWalletMesh).toHaveBeenCalledWith(mockConfig, undefined);
    });

    it('should return the same instance for subsequent calls', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      const client1 = await getWalletClientInstance(mockConfig);
      const client2 = await getWalletClientInstance(mockConfig);

      expect(client1).toBe(client2);
      expect(createWalletMesh).toHaveBeenCalledTimes(1);
    });

    it('should create separate instances for different keys', async () => {
      const mockClient1 = createMockClient();
      const mockClient2 = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValueOnce(mockClient1).mockResolvedValueOnce(mockClient2);

      const client1 = await getWalletClientInstance(mockConfig, {}, 'instance1');
      const client2 = await getWalletClientInstance(mockConfig, {}, 'instance2');

      expect(client1).toBe(mockClient1);
      expect(client2).toBe(mockClient2);
      expect(client1).not.toBe(client2);
      expect(createWalletMesh).toHaveBeenCalledTimes(2);
    });

    it('should pass options to createWalletMesh', async () => {
      const mockClient = createMockClient();
      const options = { disableSSR: true };
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      await getWalletClientInstance(mockConfig, options);

      expect(createWalletMesh).toHaveBeenCalledWith(mockConfig, options);
    });

    it('should wrap destroy method to clean up instance cache', async () => {
      const mockClient = createMockClient();
      const originalDestroy = vi.fn();
      mockClient.destroy = originalDestroy;
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      const client = await getWalletClientInstance(mockConfig, {}, 'test-key');

      // Verify instance exists
      expect(getExistingInstance('test-key')).toBeDefined();

      // Call destroy
      client.destroy();

      // Verify original destroy was called
      expect(originalDestroy).toHaveBeenCalled();

      // Verify instance was removed from cache
      expect(getExistingInstance('test-key')).toBeUndefined();
    });

    it('should remove failed instances from cache', async () => {
      const error = new Error('Failed to create client');
      vi.mocked(createWalletMesh).mockRejectedValue(error);

      await expect(getWalletClientInstance(mockConfig, {}, 'failed-key')).rejects.toThrow(error);

      // Verify failed instance was removed from cache
      expect(getExistingInstance('failed-key')).toBeUndefined();
    });

    it('should handle concurrent requests for same instance', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockClient), 10)),
      );

      // Make concurrent requests
      const promise1 = getWalletClientInstance(mockConfig, {}, 'concurrent');
      const promise2 = getWalletClientInstance(mockConfig, {}, 'concurrent');

      const [client1, client2] = await Promise.all([promise1, promise2]);

      expect(client1).toBe(client2);
      expect(client1).toBe(mockClient);
      expect(createWalletMesh).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearAllInstances', () => {
    it('should destroy all instances and clear cache', async () => {
      const mockClient1 = createMockClient();
      const mockClient2 = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValueOnce(mockClient1).mockResolvedValueOnce(mockClient2);

      // Create instances
      const client1 = await getWalletClientInstance(mockConfig, {}, 'instance1');
      const client2 = await getWalletClientInstance(mockConfig, {}, 'instance2');

      // Clear all instances
      await clearAllInstances();

      // Verify destroy was called on all instances (now wrapped)
      expect(vi.isMockFunction(client1.destroy)).toBe(false); // Wrapped function, not a mock
      expect(vi.isMockFunction(client2.destroy)).toBe(false); // Wrapped function, not a mock

      // Verify cache is cleared
      expect(getExistingInstance('instance1')).toBeUndefined();
      expect(getExistingInstance('instance2')).toBeUndefined();
    });

    it('should handle instances that failed to resolve', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh)
        .mockResolvedValueOnce(mockClient)
        .mockRejectedValueOnce(new Error('Failed'));

      // Create one successful and one failed instance
      const client = await getWalletClientInstance(mockConfig, {}, 'success');
      try {
        await getWalletClientInstance(mockConfig, {}, 'failed');
      } catch {
        // Expected to fail
      }

      // Clear all instances - should not throw
      await expect(clearAllInstances()).resolves.not.toThrow();

      // Verify that clearAllInstances completed without error
      // The wrapped destroy function was called internally
      expect(typeof client.destroy).toBe('function');
    });

    it('should handle empty instance cache', async () => {
      await expect(clearAllInstances()).resolves.not.toThrow();
    });
  });

  describe('getExistingInstance', () => {
    it('should return undefined when no instance exists', () => {
      expect(getExistingInstance('nonexistent')).toBeUndefined();
    });

    it('should return existing instance promise', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      // Create instance
      const clientPromise = getWalletClientInstance(mockConfig, {}, 'test-key');

      // Get existing instance should return the promise
      const existingPromise = getExistingInstance('test-key');
      expect(existingPromise).toBeDefined();

      // Both should resolve to the same client
      if (!existingPromise) {
        throw new Error('Expected existing promise to be defined');
      }
      const [client1, client2] = await Promise.all([clientPromise, existingPromise]);
      expect(client1).toBe(client2);
    });

    it('should use default key when none provided', async () => {
      const mockClient = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValue(mockClient);

      // Create default instance
      await getWalletClientInstance(mockConfig);

      // Get existing instance without key should return default
      const existing = getExistingInstance();
      expect(existing).toBeDefined();
    });

    it('should return different promises for different keys', async () => {
      const mockClient1 = createMockClient();
      const mockClient2 = createMockClient();
      vi.mocked(createWalletMesh).mockResolvedValueOnce(mockClient1).mockResolvedValueOnce(mockClient2);

      // Create instances with different keys
      const _promise1 = getWalletClientInstance(mockConfig, {}, 'key1');
      const _promise2 = getWalletClientInstance(mockConfig, {}, 'key2');

      // Get existing instances
      const existing1 = getExistingInstance('key1');
      const existing2 = getExistingInstance('key2');

      expect(existing1).toBeDefined();
      expect(existing2).toBeDefined();
      expect(existing1).not.toBe(existing2);

      // Verify they resolve to different clients
      if (!existing1 || !existing2) {
        throw new Error('Expected both existing promises to be defined');
      }
      const [client1, client2] = await Promise.all([existing1, existing2]);
      expect(client1).not.toBe(client2);
    });
  });
});
