/**
 * @module discovery/extension
 *
 * Browser extension components for WalletMesh discovery integration.
 *
 * This module provides both content script and background script components
 * for implementing the discovery protocol in browser extensions (Chrome, Firefox, Edge, etc.).
 *
 * @example Basic content script usage:
 * ```typescript
 * import { ContentScriptRelay } from '@walletmesh/discovery/extension';
 *
 * const relay = new ContentScriptRelay();
 * console.log('Relay ready:', relay.isReady());
 * ```
 *
 * @example Basic background script usage with cross-browser support:
 * ```typescript
 * import { WalletDiscovery, getBrowserAPI } from '@walletmesh/discovery/extension';
 *
 * const api = getBrowserAPI();
 * const walletDiscovery = new WalletDiscovery({
 *   responderInfo: myWalletInfo,
 *   securityPolicy: mySecurityPolicy
 * });
 *
 * // Listen for messages using the appropriate API
 * api.runtime.onMessage.addListener((message, sender) => {
 *   // Handle discovery requests
 * });
 *
 * await walletDiscovery.enable();
 * ```
 */

// Export content script components
export { ContentScriptRelay, getContentScriptRelay } from './ContentScriptRelay.js';

// Export background script components
export { WalletDiscovery } from './WalletDiscovery.js';

// Export browser API abstraction
export {
  getBrowserAPI,
  isExtensionEnvironment,
  getExtensionId,
  type BrowserAPI,
  type BrowserRuntime,
  type BrowserTabs,
  type MessageSender,
} from './browserApi.js';

// Export extension-specific types
export type { WalletDiscoveryConfig, WalletDiscoveryStats } from './types.js';
