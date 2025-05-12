import { DiscoveryListener, createDiscoveryListener } from './server.js';
import { DiscoveryAnnouncer, createExtensionWalletAnnouncer, createWebWalletAnnouncer } from './client.js';
import type {
  WalletInfo,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryAckEvent,
  DiscoveryListenerOptions,
  DiscoveryAnnouncerOptions,
  ExtensionWalletInfo,
  WebWalletInfo,
} from './types.js';
import { isDiscoveryRequestEvent, isDiscoveryResponseEvent, isDiscoveryAckEvent } from './guards.js';
import { WmDiscovery, CONFIG } from './constants.js';

/**
 * Cross-origin wallet discovery protocol implementation for WalletMesh.
 * Enables wallets to announce their presence and allows dApps to discover available wallets
 * in a secure, cross-origin manner.
 *
 * @packageDocumentation
 * @module @walletmesh/discovery
 */

// Re-export core classes and factory functions
export {
  DiscoveryListener,
  DiscoveryAnnouncer,
  createDiscoveryListener,
  createExtensionWalletAnnouncer,
  createWebWalletAnnouncer,
};

// Re-export type guards
export { isDiscoveryRequestEvent, isDiscoveryResponseEvent, isDiscoveryAckEvent };

// Re-export constants
export { WmDiscovery, CONFIG };

// Type exports
export type {
  WalletInfo,
  ExtensionWalletInfo,
  WebWalletInfo,
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryAckEvent,
  DiscoveryListenerOptions,
  DiscoveryAnnouncerOptions,
};
