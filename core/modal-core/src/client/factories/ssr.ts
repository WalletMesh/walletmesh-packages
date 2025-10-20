/**
 * SSR-related factory helpers
 *
 * @module client/factories/ssr
 * @packageDocumentation
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletMeshClient as PublicWalletMeshClient } from '../../internal/client/WalletMeshClient.js';
import { createSSRController } from '../../api/utilities/ssr.js';

/**
 * Creates an SSR-safe client that provides no-op implementations
 *
 * This function uses the explicit SSRController class instead of a Proxy,
 * which provides better debugging, clearer code, and improved IDE support.
 *
 * @param logger - Logger instance
 * @returns SSR-safe client implementation
 * @internal
 */
export function createSSRSafeClient(logger: Logger): PublicWalletMeshClient {
  logger.debug('Creating SSR-safe client using SSRController class');

  // Use the explicit SSRController class from ssr utilities
  // This replaces the previous Proxy pattern with clearer, more maintainable code
  return createSSRController() as PublicWalletMeshClient;
}
