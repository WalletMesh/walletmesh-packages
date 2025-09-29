/**
 * Browser extension specific exports for the Discovery Protocol.
 *
 * This module provides components specifically designed for browser extension
 * implementations including content script relays and wallet discovery helpers.
 *
 * @example
 * ```typescript
 * import { ContentScriptRelay, WalletDiscovery } from '@walletmesh/discovery/extension';
 *
 * // In content script
 * const relay = new ContentScriptRelay();
 * relay.startRelaying();
 *
 * // In background script
 * const discovery = new WalletDiscovery({
 *   walletInfo: myWalletInfo,
 *   securityPolicy: mySecurityPolicy
 * });
 * discovery.startListening();
 * ```
 *
 * @module extension
 * @since 0.1.0
 */

// Export browser extension specific components
export { ContentScriptRelay, getContentScriptRelay, WalletDiscovery } from './extension/index.js';
export type { WalletDiscoveryConfig, WalletDiscoveryStats } from './extension/index.js';

// Re-export commonly needed types for extensions
export type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
} from './types/core.js';
export type { ResponderInfo } from './types/capabilities.js';
export type { SecurityPolicy } from './types/security.js';

// Re-export security utilities commonly used in extensions
export { createSecurityPolicy, validateOrigin } from './security.js';
// Re-export security presets for convenience
export { SECURITY_PRESETS } from './presets/security.js';
