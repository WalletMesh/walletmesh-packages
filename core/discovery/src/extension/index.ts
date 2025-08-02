/**
 * @module discovery/extension
 *
 * Chrome extension components for WalletMesh discovery integration.
 *
 * This module provides both content script and background script components
 * for implementing the discovery protocol in Chrome extensions.
 *
 * @example Basic content script usage:
 * ```typescript
 * import { ContentScriptRelay } from '@walletmesh/discovery/extension';
 *
 * const relay = new ContentScriptRelay();
 * console.log('Relay ready:', relay.isReady());
 * ```
 *
 * @example Basic background script usage:
 * ```typescript
 * import { WalletDiscovery } from '@walletmesh/discovery/extension';
 *
 * const walletDiscovery = new WalletDiscovery({
 *   responderInfo: myWalletInfo,
 *   securityPolicy: mySecurityPolicy
 * });
 * await walletDiscovery.enable();
 * ```
 */

// Export content script components
export { ContentScriptRelay, getContentScriptRelay } from './ContentScriptRelay.js';

// Export background script components
export { WalletDiscovery } from './WalletDiscovery.js';

// Export extension-specific types
export type { WalletDiscoveryConfig, WalletDiscoveryStats } from './types.js';
