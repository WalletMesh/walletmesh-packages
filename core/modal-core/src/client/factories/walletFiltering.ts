/**
 * Wallet filtering and modal preparation helpers
 *
 * @module client/factories/walletFiltering
 * @packageDocumentation
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletMeshClientConfig } from '../../internal/client/WalletMeshClient.js';
import type { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import type { WalletInfo } from '../../types.js';

/**
 * Determines the wallet list for modal based on configuration
 *
 * @param config - Client configuration
 * @param registry - Wallet registry
 * @param logger - Logger instance
 * @returns Array of wallet info for modal
 * @internal
 */
export function getWalletsForModal(
  config: WalletMeshClientConfig,
  registry: WalletRegistry,
  logger: Logger,
): WalletInfo[] {
  // Check if config.wallets is a direct WalletInfo array
  if (Array.isArray(config.wallets)) {
    const firstItem = config.wallets[0];
    if (firstItem && typeof firstItem === 'object' && 'id' in firstItem && 'chains' in firstItem) {
      // Direct wallet info array provided
      const walletInfos = config.wallets as WalletInfo[];
      logger.debug('Using direct wallet info from config', {
        walletCount: walletInfos.length,
        walletIds: walletInfos.map((w) => w.id),
      });
      return walletInfos;
    }
    // Otherwise it's an array of adapters/classes, fall through to use registry
  }

  // Get wallet info from registry (includes non-instantiated classes)
  const walletsForModal = registry.getAllWalletInfo();

  // Apply ordering if specified
  if (!Array.isArray(config.wallets) && config.wallets?.order) {
    applyWalletOrdering(walletsForModal, config.wallets.order, logger);
  }

  logger.debug('Generated wallet list for modal', {
    count: walletsForModal.length,
    wallets: walletsForModal.map((w) => ({ id: w.id, name: w.name })),
  });

  return walletsForModal;
}

/**
 * Applies wallet ordering to a wallet list
 *
 * @param wallets - Wallet list to sort (modified in place)
 * @param order - Desired wallet order
 * @param logger - Logger instance
 * @internal
 */
function applyWalletOrdering(wallets: WalletInfo[], order: string[], logger: Logger): void {
  wallets.sort((a, b) => {
    const aIndex = order.indexOf(a.id);
    const bIndex = order.indexOf(b.id);

    // Items in order list come first
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Items not in order list maintain relative order
    return 0;
  });

  logger.debug('Applied wallet ordering', {
    order,
    finalOrder: wallets.map((w) => w.id),
  });
}
