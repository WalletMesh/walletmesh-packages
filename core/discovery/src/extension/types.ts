/**
 * @module discovery/wallet/types
 *
 * Type definitions for the secure wallet discovery implementation.
 */

import type { DiscoveryResponseEvent } from '../types/core.js';
import type { ResponderInfo } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';

/**
 * Configuration for WalletDiscovery initialization.
 *
 * @example
 * ```typescript
 * const config: WalletDiscoveryConfig = {
 *   responderInfo: createResponderInfo.aztec({
 *     uuid: crypto.randomUUID(),
 *     rdns: 'com.example.wallet',
 *     name: 'My Aztec Wallet',
 *     type: 'extension'
 *   }),
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowedOrigins: ['https://trusted-dapp.com']
 *   }
 * };
 * ```
 *
 * @category Wallet
 * @since 0.2.0
 */
export interface WalletDiscoveryConfig {
  /** Full wallet capabilities and information (stays secure in background) */
  responderInfo: ResponderInfo;

  /** Security policy for origin validation and rate limiting */
  securityPolicy?: SecurityPolicy;

  /** Optional callback for custom announcement handling */
  onAnnouncement?: (announcement: DiscoveryResponseEvent, tabId: number) => void;
}

/**
 * Statistics and status information for wallet discovery.
 *
 * Provides insight into discovery activity and security events
 * for monitoring and debugging purposes.
 *
 * @category Wallet
 * @since 0.2.0
 */
export interface WalletDiscoveryStats {
  /** Whether discovery is currently active */
  isEnabled: boolean;

  /** Number of discovery requests processed */
  requestsProcessed: number;

  /** Number of announcements sent */
  announcementsSent: number;

  /** Number of requests rejected for security reasons */
  requestsRejected: number;

  /** Currently connected origins */
  connectedOrigins: string[];
}
