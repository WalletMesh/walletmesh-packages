/**
 * Common provider interface shared by all provider systems
 *
 * This module defines the base interface that all provider systems must implement,
 * ensuring consistency across the WalletProvider and BlockchainProvider systems.
 *
 * @module api/types/commonProvider
 * @packageDocumentation
 */

/**
 * Common provider interface shared by all provider systems
 *
 * This interface defines the minimal set of methods that all providers
 * (both WalletProvider and BlockchainProvider systems) must implement.
 *
 * @remarks
 * This interface serves as the foundation for both:
 * - WalletProvider system (api/types/providers.ts) - Simple JSON-RPC communication
 * - BlockchainProvider system (api/types/chainProviders.ts) - Rich blockchain operations
 *
 * @public
 */
export interface CommonProviderInterface {
  /**
   * Get connected accounts/addresses
   *
   * @returns Promise resolving to array of account addresses
   */
  getAccounts(): Promise<string[]>;

  /**
   * Get current chain ID
   *
   * @returns Promise resolving to chain ID as string or number
   */
  getChainId(): Promise<string | number>;

  /**
   * Disconnect from provider
   *
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Add event listener
   *
   * @param event - Event name to listen for
   * @param listener - Callback function to invoke when event occurs
   */
  on(event: string, listener: (...args: unknown[]) => void): void;

  /**
   * Remove event listener
   *
   * @param event - Event name to stop listening for
   * @param listener - Callback function to remove
   */
  off(event: string, listener: (...args: unknown[]) => void): void;

  /**
   * Remove all event listeners
   *
   * @param event - Optional event name to remove all listeners for.
   *                If not provided, removes all listeners for all events.
   */
  removeAllListeners(event?: string): void;
}
