/**
 * Adapter registration helpers
 *
 * @module client/factories/adapterRegistration
 * @packageDocumentation
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletMeshClientConfig } from '../../internal/client/WalletMeshClient.js';
import type { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import type { WalletAdapter } from '../../internal/wallets/base/WalletAdapter.js';
import type { WalletInfo } from '../../types.js';
import { EvmAdapter } from '../../internal/wallets/evm/EvmAdapter.js';

/**
 * Registers built-in wallet adapters with the registry
 *
 * @param registry - Wallet registry to register adapters with
 * @param config - Client configuration
 * @param logger - Logger instance
 * @internal
 */
export function registerBuiltinAdapters(
  registry: WalletRegistry,
  config: WalletMeshClientConfig,
  logger: Logger,
): void {
  logger.debug('Registering built-in adapters');

  // Create default adapters
  const defaultAdapters = [
    new EvmAdapter(),
    // Additional built-in adapters can be added here
  ];

  // Apply wallet filters
  const adaptersToRegister = applyWalletFilters(defaultAdapters, config, logger);

  // Register the filtered adapters
  for (const adapter of adaptersToRegister) {
    registry.register(adapter);
    logger.debug('Registered adapter', {
      id: adapter.id,
      name: adapter.metadata.name,
    });
  }

  logger.info('Built-in adapters registered', {
    count: adaptersToRegister.length,
    adapters: adaptersToRegister.map((a) => a.id),
  });
}

/**
 * Registers custom wallet adapters with the registry
 *
 * @param registry - Wallet registry to register adapters with
 * @param config - Client configuration
 * @param logger - Logger instance
 * @internal
 */
export function registerCustomAdapters(
  registry: WalletRegistry,
  config: WalletMeshClientConfig,
  logger: Logger,
): void {
  let customAdapters: Array<WalletAdapter | unknown> | undefined;

  // Handle both new array format and old custom format
  if (Array.isArray(config.wallets)) {
    // Direct array of adapters/classes (unless it's WalletInfo[])
    const firstItem = config.wallets[0];
    if (
      firstItem &&
      (typeof firstItem === 'function' ||
        (typeof firstItem === 'object' && 'id' in firstItem && 'metadata' in firstItem))
    ) {
      customAdapters = config.wallets as Array<WalletAdapter | unknown>;
    }
  } else if (config.wallets && typeof config.wallets === 'object' && 'custom' in config.wallets) {
    customAdapters = (config.wallets as { custom: Array<WalletAdapter | unknown> }).custom;
  }

  if (!customAdapters || !Array.isArray(customAdapters)) {
    return;
  }

  logger.debug('Registering custom adapters', {
    count: customAdapters.length,
  });

  for (const adapterOrClass of customAdapters) {
    // Check if it's a class (has getWalletInfo static method) or an instance
    if (typeof adapterOrClass === 'function' && 'getWalletInfo' in adapterOrClass) {
      // It's a class - get wallet info without instantiation
      const walletInfo = (adapterOrClass as { getWalletInfo(): WalletInfo }).getWalletInfo();
      logger.debug('Registering wallet adapter class', {
        id: walletInfo.id,
        name: walletInfo.name,
        chains: walletInfo.chains,
      });

      // Store the class for lazy instantiation
      // The registry will instantiate when needed
      registry.registerClass(adapterOrClass as never, walletInfo);
    } else if (typeof adapterOrClass === 'object' && adapterOrClass !== null && 'id' in adapterOrClass) {
      // It's an instance - register directly (backward compatibility)
      const adapter = adapterOrClass as WalletAdapter;
      registry.register(adapter);
      logger.debug('Registered custom adapter instance', {
        id: adapter.id,
        name: adapter.metadata.name,
        chains: adapter.capabilities.chains.map((c) => c.type),
      });
    }
  }
}

/**
 * Applies wallet filters from configuration
 *
 * @param adapters - Array of adapters to filter
 * @param config - Client configuration
 * @param logger - Logger instance
 * @returns Filtered array of adapters
 * @internal
 */
function applyWalletFilters(
  adapters: WalletAdapter[],
  config: WalletMeshClientConfig,
  logger: Logger,
): WalletAdapter[] {
  // If config.wallets is an array, no filtering
  if (Array.isArray(config.wallets)) {
    return adapters;
  }

  const walletConfig = config.wallets;
  let result = adapters;

  // Apply custom filter function
  if (walletConfig?.filter) {
    result = result.filter(walletConfig.filter);
    logger.debug('Applied wallet filter', {
      originalCount: adapters.length,
      filteredCount: result.length,
    });
  }

  // Apply include filter
  if (walletConfig?.include) {
    result = result.filter((adapter) => walletConfig.include?.includes(adapter.id) ?? false);
    logger.debug('Applied wallet include filter', {
      includeList: walletConfig.include,
      filteredCount: result.length,
    });
  }

  // Apply exclude filter
  if (walletConfig?.exclude) {
    result = result.filter((adapter) => !(walletConfig.exclude?.includes(adapter.id) ?? false));
    logger.debug('Applied wallet exclude filter', {
      excludeList: walletConfig.exclude,
      filteredCount: result.length,
    });
  }

  return result;
}
