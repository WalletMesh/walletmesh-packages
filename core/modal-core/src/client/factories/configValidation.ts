/**
 * Configuration validation helpers
 *
 * @module client/factories/configValidation
 * @packageDocumentation
 */

import type { WalletMeshClientConfig } from '../../internal/client/WalletMeshClient.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';

/**
 * Validates client configuration and throws if invalid
 *
 * @param config - Client configuration to validate
 * @throws {ModalError} If configuration is invalid
 * @internal
 */
export function validateClientConfig(config: WalletMeshClientConfig): void {
  if (!config.appName) {
    throw ErrorFactory.configurationError('appName is required in WalletMeshClient configuration');
  }

  // Additional validation can be added here as needed
}
