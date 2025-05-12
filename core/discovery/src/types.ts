import type { WM_PROTOCOL_VERSION } from './constants.js';
import type { EventTarget } from 'happy-dom';

/**
 * Base interface for wallet information
 * @interface BaseWalletInfo
 * @property {string} name - The human-readable name of the wallet
 * @property {string} icon - Base64 data URI of the wallet's icon (must start with "data:")
 * @property {string} rdns - Reverse DNS identifier for the wallet (e.g., 'com.example.wallet')
 * @property {string[]} [technologies] - Optional list of supported blockchain technologies
 */
export interface BaseWalletInfo {
  name: string;
  icon: string;
  rdns: string;
  technologies?: string[] | undefined;
}

/**
 * Interface for extension-based wallet information
 * @interface ExtensionWalletInfo
 * @extends {BaseWalletInfo}
 * @property {string} [extensionId] - Optional browser extension ID
 * @property {string} [code] - Optional verification code for extension communication
 * @property {never} [url] - URL is not allowed for extension wallets
 */
export interface ExtensionWalletInfo extends BaseWalletInfo {
  extensionId?: string | undefined;
  code?: string | undefined;
  url?: never | undefined; // Cannot have URL
}

/**
 * Interface for web-based wallet information
 * @interface WebWalletInfo
 * @extends {BaseWalletInfo}
 * @property {string} [url] - Optional URL of the web wallet
 * @property {never} [code] - Code is not allowed for web wallets
 * @property {never} [extensionId] - Extension ID is not allowed for web wallets
 */
export interface WebWalletInfo extends BaseWalletInfo {
  url?: string | undefined;
  code?: never | undefined; // Cannot have code
  extensionId?: never | undefined; // Cannot have extensionId
}

/**
 * Union type representing either an extension or web wallet
 * @type {WalletInfo}
 */
export type WalletInfo = ExtensionWalletInfo | WebWalletInfo;

/**
 * Interface for discovery request events
 * @interface DiscoveryRequestEvent
 * @property {typeof WM_PROTOCOL_VERSION} version - Protocol version for compatibility
 * @property {string} discoveryId - Unique identifier for this discovery session
 * @property {string[]} [technologies] - Optional list of required technologies
 */
export interface DiscoveryRequestEvent {
  version: typeof WM_PROTOCOL_VERSION;
  discoveryId: string;
  technologies?: string[] | undefined;
}

/**
 * Interface for discovery response events
 * @interface DiscoveryResponseEvent
 * @property {typeof WM_PROTOCOL_VERSION} version - Protocol version for compatibility
 * @property {string} discoveryId - Unique identifier for this discovery session
 * @property {WalletInfo} wallet - Information about the discovered wallet
 * @property {string} walletId - Unique identifier for the responding wallet
 */
export interface DiscoveryResponseEvent {
  version: typeof WM_PROTOCOL_VERSION;
  discoveryId: string;
  wallet: WalletInfo;
  walletId: string;
}

/**
 * Interface for discovery acknowledgment events
 * @interface DiscoveryAckEvent
 * @property {typeof WM_PROTOCOL_VERSION} version - Protocol version for compatibility
 * @property {string} discoveryId - Unique identifier for this discovery session
 * @property {string} walletId - Unique identifier of the acknowledged wallet
 */
export interface DiscoveryAckEvent {
  version: typeof WM_PROTOCOL_VERSION;
  discoveryId: string;
  walletId: string;
}

/**
 * Interface for discovery listener options
 * @interface DiscoveryListenerOptions
 * @property {string[]} [technologies] - Optional list of required technologies
 * @property {string} [discoveryId] - Optional custom discovery session identifier
 * @property {(wallet: WalletInfo) => void} [callback] - Optional callback for wallet discovery
 * @property {EventTarget} [eventTarget] - Optional custom event target (defaults to window)
 */
export interface DiscoveryListenerOptions {
  technologies?: string[];
  discoveryId?: string;
  callback?: ((wallet: WalletInfo) => void) | undefined;
  eventTarget?: EventTarget;
}

/**
 * Interface for discovery announcer options
 * @interface DiscoveryAnnouncerOptions
 * @property {WalletInfo} walletInfo - Information about the wallet to announce
 * @property {string[]} [supportedTechnologies] - Optional list of supported technologies
 * @property {(origin: string) => boolean} [callback] - Optional callback for origin validation
 * @property {EventTarget} [eventTarget] - Optional custom event target (defaults to window)
 */
export interface DiscoveryAnnouncerOptions {
  walletInfo: WalletInfo;
  supportedTechnologies?: string[];
  callback?: ((origin: string) => boolean) | undefined;
  eventTarget?: EventTarget;
}
