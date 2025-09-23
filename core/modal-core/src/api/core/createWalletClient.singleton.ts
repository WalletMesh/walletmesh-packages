/**
 * Singleton instance manager for WalletClient
 *
 * Provides optional singleton behavior while maintaining flexibility
 * for multiple instances when needed.
 *
 * @module api/createWalletClient.singleton
 */

import type {
  CreateWalletMeshOptions,
  WalletMeshClient,
  WalletMeshConfig,
} from '../core/createWalletClient.js';
import { createWalletMesh } from '../core/createWalletClient.js';

// Instance storage - now stores Promises
const instances = new Map<string, Promise<WalletMeshClient>>();
const SINGLETON_KEY = '__default__';

/**
 * Get or create a WalletClient instance
 *
 * By default, returns a singleton instance. Pass a unique key to create
 * separate instances for different parts of your app.
 *
 * @param config - WalletMesh configuration
 * @param options - Creation options
 * @param instanceKey - Optional key for multiple instances
 * @returns Promise that resolves to WalletClient instance
 *
 * @example
 * ```typescript
 * // Singleton usage (recommended for most apps)
 * const client = await getWalletClientInstance({
 *   appName: 'My App'
 * });
 *
 * // Multiple instances (for advanced use cases)
 * const mainClient = await getWalletClientInstance(config, {}, 'main');
 * const adminClient = await getWalletClientInstance(adminConfig, {}, 'admin');
 * ```
 */
export async function getWalletClientInstance(
  config: WalletMeshConfig,
  options?: CreateWalletMeshOptions,
  instanceKey: string = SINGLETON_KEY,
): Promise<WalletMeshClient> {
  // Check if instance already exists
  const existing = instances.get(instanceKey);
  if (existing) {
    return existing;
  }

  // Create new instance
  const instancePromise = createWalletMesh(config, options);

  // Store promise
  instances.set(instanceKey, instancePromise);

  try {
    const instance = await instancePromise;

    // Add cleanup on destroy
    const originalDestroy = instance.destroy.bind(instance);
    instance.destroy = () => {
      originalDestroy();
      instances.delete(instanceKey);
    };

    return instance;
  } catch (error) {
    // Remove failed promise from cache
    instances.delete(instanceKey);
    throw error;
  }
}

/**
 * Clear all instances (useful for testing)
 */
export async function clearAllInstances(): Promise<void> {
  const promises = Array.from(instances.values());
  const resolvedInstances = await Promise.allSettled(promises);

  for (const result of resolvedInstances) {
    if (result.status === 'fulfilled') {
      result.value.destroy();
    }
  }
  instances.clear();
}

/**
 * Get existing instance without creating
 */
export function getExistingInstance(
  instanceKey: string = SINGLETON_KEY,
): Promise<WalletMeshClient> | undefined {
  return instances.get(instanceKey);
}
