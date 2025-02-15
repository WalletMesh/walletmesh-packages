/**
 * @file ConnectionManager.ts
 * @packageDocumentation
 * High-level connection management layer for the WalletMesh Modal package.
 *
 * This module provides a wrapper around the core client that adds:
 * - Timeout protection for all async operations
 * - Simplified connection interface for dApps
 * - Automatic error handling and recovery
 * - Connection state management
 *
 * The ConnectionManager acts as the primary interface between dApps
 * and the WalletMesh system, abstracting away the complexity of
 * direct client interactions.
 */

import type { WalletInfo, ConnectedWallet, DappInfo } from '../../types.js';
import type { TimeoutConfig } from '../utils/timeout.js';
import { WalletMeshClient } from '../client/client.js';
import { createConnector } from '../connectors/createConnector.js';
import { WalletError } from '../client/types.js';
import { withTimeout } from '../utils/timeout.js';

/**
 * Internal interface representing the current state of wallet connections.
 *
 * @property wallet - Currently connected wallet or null if none
 * @property initialized - Whether the connection manager has completed initialization
 *
 * @internal Used for state management and UI updates
 */
interface ConnectionState {
  wallet: ConnectedWallet | null;
  initialized: boolean;
}

/**
 * Configuration options for wallet disconnection.
 *
 * @property removeSession - Whether to remove the stored session after disconnecting.
 *                         If false, the session can be restored later.
 */
interface DisconnectOptions {
  removeSession?: boolean;
}

/**
 * High-level manager for wallet connections with timeout protection.
 *
 * The ConnectionManager serves as the primary interface for dApps to interact
 * with the WalletMesh system. It coordinates between multiple components:
 *
 * Architecture Role:
 * - Wraps WalletMeshClient for simplified access
 * - Manages connection timeouts and retries
 * - Coordinates session persistence
 * - Handles error recovery
 *
 * Key Features:
 * - Automatic timeout protection
 * - Connection state management
 * - Session restoration
 * - Error resilience
 * - Resource cleanup
 *
 * Security Features:
 * - Timeout protection against hanging operations
 * - Validation of wallet states
 * - Safe cleanup procedures
 * - Error boundary protection
 *
 * Provides a high-level interface for:
 * - Establishing wallet connections
 * - Managing connection state
 * - Handling session persistence
 * - Controlling connection timeouts
 * - Managing provider access
 *
 * @remarks
 * All async operations are protected by configurable timeouts to prevent
 * hanging operations. Default timeouts are:
 * - Connection: 30 seconds
 * - Operations: 10 seconds
 *
 * @example
 * ```typescript
 * const manager = new ConnectionManager({
 *   name: 'My dApp',
 *   icon: 'https://mydapp.com/icon.png'
 * }, {
 *   connectionTimeout: 45000,
 *   operationTimeout: 15000
 * });
 *
 * // Connect to a wallet
 * const wallet = await manager.connectWallet({
 *   id: 'my-wallet',
 *   name: 'My Wallet',
 *   // ... other wallet info
 * });
 *
 * // Later, disconnect
 * await manager.disconnectWallet(wallet.info.id);
 * ```
 */
export class ConnectionManager {
  private client: WalletMeshClient;
  private timeoutConfig: Required<TimeoutConfig>;

  /**
   * Creates a new ConnectionManager instance.
   *
   * @param dappInfo - Information about the dApp to share with wallets
   * @param config - Optional timeout configuration
   *
   * @remarks
   * The constructor initializes:
   * - WalletMeshClient singleton
   * - Default or custom timeouts
   * - Initial connection state
   *
   * Default timeouts:
   * ```typescript
   * {
   *   connectionTimeout: 30000, // 30 seconds
   *   operationTimeout: 10000   // 10 seconds
   * }
   * ```
   */
  constructor(dappInfo: DappInfo, config?: TimeoutConfig) {
    this.client = WalletMeshClient.getInstance(dappInfo);
    this.timeoutConfig = {
      connectionTimeout: 30000, // 30s default
      operationTimeout: 10000, // 10s default
      ...config,
    };
  }

  /**
   * Retrieves the current connection state.
   *
   * @returns Current connection state including connected wallet and initialization status
   *
   * @remarks
   * This is a synchronous operation that returns the cached state.
   * For real-time state, consider subscribing to state changes.
   *
   * @example
   * ```typescript
   * const { wallet, initialized } = manager.getState();
   * if (wallet) {
   *   console.log('Connected to:', wallet.info.name);
   * }
   * ```
   */
  getState(): ConnectionState {
    return {
      wallet: this.client.getConnectedWallet(),
      initialized: true,
    };
  }

  /**
   * Establishes a connection with a wallet.
   *
   * @param wallet - Wallet information and configuration
   * @returns Promise resolving to the connected wallet details
   * @throws {WalletError} If connection fails or times out
   *
   * @remarks
   * Connection process:
   * 1. Creates connector instance
   * 2. Initiates connection with timeout
   * 3. Persists successful connection
   * 4. Validates connection state
   *
   * @example
   * ```typescript
   * try {
   *   const wallet = await manager.connectWallet({
   *     id: 'wallet-id',
   *     name: 'Wallet Name',
   *     connector: { type: 'wm_aztec' }
   *   });
   *
   *   console.log('Connected:', wallet.state.address);
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   */
  async connectWallet(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Connecting wallet:', walletInfo);

    try {
      console.log('[ConnectionManager] Creating connector and initiating connection');
      const connector = createConnector(walletInfo.connector);
      const wallet = await withTimeout(
        this.client.connectWallet(walletInfo, connector),
        this.timeoutConfig.connectionTimeout,
        'wallet connection',
      );

      console.log('[ConnectionManager] Connection successful:', {
        chain: wallet.state.chain,
        address: wallet.state.address,
        sessionId: wallet.state.sessionId,
      });
      return wallet;
    } catch (err) {
      console.error('[ConnectionManager] Connection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Disconnects a specific wallet connection.
   *
   * @param walletId - ID of the wallet to disconnect
   * @param options - Configuration for the disconnection process
   * @throws {WalletError} If disconnection times out
   *
   * @remarks
   * - Always attempts cleanup even if disconnection fails
   * - Can preserve session for later restoration
   * - Includes timeout protection
   *
   * @example
   * ```typescript
   * // Disconnect and remove session
   * await manager.disconnectWallet(walletId);
   *
   * // Disconnect but keep session for later
   * await manager.disconnectWallet(walletId, {
   *   removeSession: false
   * });
   * ```
   */
  async disconnectWallet(
    walletId: string,
    options: DisconnectOptions = { removeSession: true },
  ): Promise<void> {
    console.log('[ConnectionManager] Disconnecting wallet:', walletId, options);

    try {
      await withTimeout(
        this.client.disconnectWallet(walletId),
        this.timeoutConfig.operationTimeout,
        'wallet disconnection',
      );
      console.log('[ConnectionManager] Disconnection successful');
    } catch (err) {
      console.error('[ConnectionManager] Disconnection failed:', err);
      // Still try to disconnect even if it fails
      this.client.disconnectWallet(walletId).catch(console.error);
    }
  }

  /**
   * Retrieves a wallet's provider instance.
   *
   * @param walletId - ID of the wallet to get provider for
   * @returns Promise resolving to the provider instance
   * @throws {WalletError} If provider is unavailable or request times out
   *
   * @remarks
   * The provider gives access to wallet-specific functionality
   * and should only be used by trusted internal code.
   *
   * @example
   * ```typescript
   * try {
   *   const provider = await manager.getProvider(walletId);
   *   const accounts = await provider.request({
   *     method: 'eth_accounts'
   *   });
   * } catch (error) {
   *   console.error('Provider error:', error);
   * }
   * ```
   */
  async getProvider(walletId: string): Promise<unknown> {
    console.log('[ConnectionManager] Getting provider for wallet:', walletId);

    try {
      const provider = await withTimeout(
        this.client.getProvider(walletId),
        this.timeoutConfig.operationTimeout,
        'get provider',
      );
      console.log('[ConnectionManager] Provider retrieved successfully');
      return provider;
    } catch (err) {
      console.error('[ConnectionManager] Failed to get provider:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to get wallet provider: ${error.message}`, 'client', error);
    }
  }

  /**
   * Initializes the connection manager and restores previous session.
   *
   * @returns Promise resolving to restored wallet or null
   *
   * @remarks
   * Initialization process:
   * 1. Attempts to initialize client with timeout
   * 2. Validates restored wallet state
   * 3. Handles initialization failures gracefully
   *
   * @example
   * ```typescript
   * const restored = await manager.initialize();
   * if (restored) {
   *   console.log('Session restored:', {
   *     wallet: restored.info.name,
   *     address: restored.state.address
   *   });
   * } else {
   *   console.log('No session to restore');
   * }
   * ```
   */
  async initialize(): Promise<ConnectedWallet | null> {
    console.log('[ConnectionManager] Starting initialization');

    try {
      // First try to initialize the client with a timeout
      const restoredWallet = await withTimeout(
        this.client.initialize(),
        this.timeoutConfig.connectionTimeout,
        'initialization',
      );

      if (restoredWallet) {
        // Validate the restored wallet has required fields
        if (!restoredWallet.state?.address || !restoredWallet.state?.sessionId) {
          throw new Error('Incomplete wallet state');
        }

        console.log('[ConnectionManager] Session restored successfully:', {
          id: restoredWallet.info.id,
          address: restoredWallet.state.address,
          sessionId: restoredWallet.state.sessionId,
        });

        return restoredWallet;
      }

      console.log('[ConnectionManager] No session to restore');
      return null;
    } catch (error) {
      // Log the error but don't throw - let the caller handle the failure
      console.error('[ConnectionManager] Initialization failed:', error);
      return null;
    }
  }

  /**
   * Performs cleanup of active connections and resources.
   *
   * Called during:
   * - Component unmount
   * - Page transitions
   * - Application shutdown
   *
   * @remarks
   * Cleanup process:
   * 1. Identifies active connections
   * 2. Disconnects wallets but preserves sessions
   * 3. Deinitializes client
   * 4. Handles cleanup failures gracefully
   *
   * @example
   * ```typescript
   * // In React component
   * useEffect(() => {
   *   return () => {
   *     manager.cleanup();
   *   };
   * }, [manager]);
   * ```
   */
  cleanup(): void {
    console.log('[ConnectionManager] Component cleanup started');
    try {
      const connectedWallet = this.client.getConnectedWallet();
      if (connectedWallet) {
        console.log('[ConnectionManager] Cleaning up wallet:', connectedWallet.info.id);
        // Clean up connections but preserve session during cleanup
        this.disconnectWallet(connectedWallet.info.id, { removeSession: false })
          .then(() => console.log('[ConnectionManager] Wallet cleanup successful'))
          .catch((err) => {
            console.error('[ConnectionManager] Failed to cleanup wallet connection:', err);
          });
      }

      // Deinitialize client but don't clear sessions
      this.client.deinitialize();
      console.log('[ConnectionManager] Cleanup complete');
    } catch (err) {
      console.error('[ConnectionManager] Cleanup failed:', err);
    }
  }
}
