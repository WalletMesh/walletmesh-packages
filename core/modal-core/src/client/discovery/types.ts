/**
 * Types for the discovery system
 *
 * @module client/discovery/types
 * @packageDocumentation
 */

import type { QualifiedResponder } from '@walletmesh/discovery';

/**
 * Connection manager interface for the discovery protocol
 *
 * Provides connection lifecycle management for discovered wallets.
 * This interface abstracts the connection process, allowing for
 * dependency injection in tests and different implementations.
 *
 * @public
 */
export interface DiscoveryConnectionManager {
  /**
   * Connect to a discovered wallet
   *
   * @param qualifiedWallet - The qualified wallet responder from discovery
   * @param options - Connection options including chains and permissions
   * @returns Promise resolving to connection details
   */
  connect(
    qualifiedWallet: QualifiedResponder,
    options: {
      /** Requested blockchain networks */
      requestedChains: string[];
      /** Requested permissions from the wallet */
      requestedPermissions: string[];
    },
  ): Promise<{
    /** Unique connection identifier */
    connectionId: string;
    /** Connected accounts with addresses and chain IDs */
    accounts: Array<{ address: string; chainId: string }>;
  }>;

  /**
   * Disconnect from a wallet
   *
   * @param responderId - The ID of the wallet responder to disconnect
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(responderId: string): Promise<void>;
}
