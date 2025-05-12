/**
 * Current version of the WalletMesh discovery protocol.
 * Used to ensure compatibility between different implementations.
 *
 * @type {string}
 * @readonly
 */
export const WM_PROTOCOL_VERSION = '1.0.0';

/**
 * Namespace for WalletMesh discovery protocol events.
 * Defines the event types used for cross-origin wallet discovery.
 *
 * @namespace
 * @readonly
 */
export const WmDiscovery = {
  /**
   * Event type for wallet ready announcements.
   * Emitted by wallets when they are ready to respond to discovery requests.
   */
  Ready: 'wm:discovery:ready',

  /**
   * Event type for discovery requests.
   * Emitted by applications to discover available wallets.
   */
  Request: 'wm:discovery:request',

  /**
   * Event type for discovery responses.
   * Emitted by wallets in response to discovery requests.
   */
  Response: 'wm:discovery:response',

  /**
   * Event type for acknowledgment events.
   * Emitted by applications to confirm receipt of wallet information.
   */
  Ack: 'wm:discovery:ack',
} as const;

/**
 * Configuration settings for the WalletMesh discovery protocol.
 *
 * @namespace
 * @readonly
 */
export const CONFIG = {
  /**
   * Time in milliseconds to debounce ready events.
   * This helps prevent flooding when multiple ready events are received.
   *
   * @type {number}
   * @default 100
   */
  readyDebounceMs: 100,
} as const;
