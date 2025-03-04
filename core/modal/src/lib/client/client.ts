/**
 * @packageDocumentation
 * Core client implementation for the WalletMesh Modal package.
 *
 * This module provides the central client interface for managing wallet connections,
 * handling session persistence, and coordinating the lifecycle of wallet interactions.
 * It implements a singleton pattern to ensure consistent state management across the application.
 */

import { ConnectionStatus, type WalletInfo, type ConnectedWallet, type DappInfo } from '../../types.js';
import type { WalletClient, WalletSession, ChainConnection } from './types.js';
import { SessionManager } from './SessionManager.js';
import type { Connector } from '../connectors/types.js';
import { createConnector } from '../connectors/createConnector.js';

/**
 * Core client class for managing wallet connections and sessions.
 *
 * The WalletMeshClient is the central coordinator for wallet interactions, responsible for:
 * - Managing wallet connections and disconnections
 * - Handling session persistence and restoration
 * - Coordinating between connectors and session management
 * - Providing wallet state and provider access
 *
 * @remarks
 * This class implements the Singleton pattern to ensure consistent state management
 * across the application. It automatically handles page transitions and cleanup
 * through browser lifecycle events.
 *
 * Key features:
 * - Automatic session restoration
 * - Connection state management
 * - Page transition handling
 * - Error recovery with retry logic
 *
 * @example
 * ```typescript
 * // Get client instance
 * const client = WalletMeshClient.getInstance({
 *   name: 'My DApp',
 *   description: 'DApp Description',
 *   icon: 'data:image/svg+xml,...'
 * });
 *
 * // Initialize and restore sessions
 * await client.initialize();
 *
 * // Connect a wallet
 * const connector = createConnector(walletConfig);
 * const wallet = await client.connectWallet(walletInfo, connector);
 * ```
 *
 * @see {@link SessionManager} for session persistence details
 * @see {@link Connector} for wallet connection handling
 */
export class WalletMeshClient implements WalletClient {
  private static instance: WalletMeshClient | null = null;
  private static cleanupCallbackRegistered = false;

  private readonly dappInfo: Readonly<DappInfo>;
  private readonly sessionManager: SessionManager;
  private initializing = false;
  private initialized = false;
  private lastRestoredWallet: ConnectedWallet | null = null;

  /**
   * Gets or creates the singleton instance of WalletMeshClient.
   *
   * @param dappInfo - Information about the dApp to share with wallets
   * @returns The singleton WalletMeshClient instance
   *
   * @remarks
   * This method ensures only one client instance exists and automatically
   * sets up cleanup handlers for page transitions.
   *
   * @example
   * ```typescript
   * const client = WalletMeshClient.getInstance({
   *   name: 'My DApp',
   *   description: 'DApp Description',
   *   icon: 'data:image/svg+xml,...'
   * });
   * ```
   */
  static getInstance(dappInfo: DappInfo): WalletMeshClient {
    if (!WalletMeshClient.instance) {
      WalletMeshClient.instance = new WalletMeshClient(dappInfo);

      if (!WalletMeshClient.cleanupCallbackRegistered) {
        const handleTransition = () => {
          if (WalletMeshClient.instance) {
            WalletMeshClient.instance.prepareForTransition();
          }
        };

        window.addEventListener('beforeunload', handleTransition);
        window.addEventListener('pagehide', handleTransition); // For Safari
        WalletMeshClient.cleanupCallbackRegistered = true;
      }
    }

    return WalletMeshClient.instance;
  }

  /**
   * Private constructor to enforce singleton pattern.
   * Initializes the client with dApp information and creates a session manager.
   *
   * @param dappInfo - Information about the dApp
   */
  private constructor(dappInfo: DappInfo) {
    // Validate origin matches current window location
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : null;
    if (currentOrigin && dappInfo.origin !== currentOrigin) {
      throw new Error(
        `Origin mismatch: DApp info specifies '${dappInfo.origin}' but is being served from '${currentOrigin}'. This is a security violation - the DApp must be served from its declared origin.`,
      );
    }

    this.dappInfo = Object.freeze({ ...dappInfo });
    this.sessionManager = new SessionManager();
  }

  /**
   * Attempts to restore a previously saved wallet session.
   *
   * @param session - The session to restore
   * @throws {Error} If session state is invalid or restoration fails
   *
   * @remarks
   * Implements exponential backoff retry logic for session restoration:
   * - Maximum 3 retry attempts
   * - Random backoff with exponential increase
   * - Maximum backoff of 5 seconds
   *
   * @example
   * Internal usage:
   * ```typescript
   * const session = this.sessionManager.getSession(walletId);
   * await this.restoreSession(session);
   * ```
   */
  private async restoreSession(session: WalletSession): Promise<void> {
    if (
      !session.wallet.state?.networkId ||
      !session.wallet.state?.address ||
      !session.wallet.state?.sessionId
    ) {
      throw new Error('Invalid session state');
    }

    const connector = createConnector(session.wallet.info.connector);

    // Configure retry parameters
    const maxRetries = 3;
    const maxBackoff = 5000;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`[WalletMeshClient] Attempting session restore (attempt ${attempt + 1}/${maxRetries})`);

        // Try to resume the session
        const connectedWallet = await connector.resume(session.wallet.info, session.wallet.state);

        // On success, update session with new connector
        const restoredSession = {
          ...session,
          wallet: connectedWallet,
          connector: connector,
          status: ConnectionStatus.Connected,
          chainConnections: session.chainConnections,
          sessionToken: session.sessionToken,
          createdAt: session.createdAt,
          id: session.id,
        };

        // Always persist state returned by connector
        this.sessionManager.setSession(session.wallet.info.id, restoredSession, true);

        console.log('[WalletMeshClient] Session restored successfully:', {
          id: connectedWallet.info.id,
          networkId: connectedWallet.state.networkId,
          address: connectedWallet.state.address,
        });

        return;
      } catch (error) {
        attempt++;
        console.warn(`[WalletMeshClient] Restore attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('[WalletMeshClient] Session restoration failed after all retries');
          this.sessionManager.removeSession(session.wallet.info.id);
          throw error;
        }

        const backoff = Math.min(Math.random() * 1000 * 2 ** attempt, maxBackoff);
        await new Promise((resolve) => setTimeout(resolve, backoff));

        try {
          await connector.disconnect();
        } catch (cleanupError) {
          console.warn('[WalletMeshClient] Failed to cleanup connector:', cleanupError);
        }
      }
    }
  }

  /**
   * Initializes the client and attempts to restore any saved sessions.
   *
   * @returns Promise resolving to the restored wallet if successful, null otherwise
   * @throws {Error} If initialization fails
   *
   * @remarks
   * - Prevents multiple simultaneous initializations
   * - Attempts to restore the most recently active session
   * - Handles initialization failures gracefully
   *
   * @example
   * ```typescript
   * const client = WalletMeshClient.getInstance(dappInfo);
   * const restoredWallet = await client.initialize();
   * if (restoredWallet) {
   *   console.log('Session restored:', restoredWallet.info.id);
   * }
   * ```
   */
  async initialize(): Promise<ConnectedWallet | null> {
    if (this.initializing) {
      console.log('[WalletMeshClient] Initialization already in progress');
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.lastRestoredWallet;
    }

    if (this.initialized) {
      console.log('[WalletMeshClient] Already initialized, returning current state');
      return this.lastRestoredWallet;
    }

    this.initializing = true;
    console.log('[WalletMeshClient] Starting initialization');

    try {
      const sessions = this.sessionManager.getSessions();
      console.log('[WalletMeshClient] Found sessions:', sessions.length);

      const restorable = sessions.find(
        (session) =>
          session.status === ConnectionStatus.Resuming &&
          session.wallet.info.connector &&
          session.wallet.state?.sessionId,
      );

      if (restorable) {
        console.log('[WalletMeshClient] Found restorable session:', {
          id: restorable.wallet.info.id,
          address: restorable.wallet.state.address,
        });

        try {
          await this.restoreSession(restorable);
          this.lastRestoredWallet = restorable.wallet;
        } catch (error) {
          console.error('[WalletMeshClient] Session restoration failed:', error);
          this.lastRestoredWallet = null;
        }
      } else {
        console.log('[WalletMeshClient] No restorable sessions found');
        this.lastRestoredWallet = null;
      }

      this.initialized = true;
      console.log(
        '[WalletMeshClient] Initialization complete, restored wallet:',
        this.lastRestoredWallet ? this.lastRestoredWallet.info.id : 'none',
      );

      return this.lastRestoredWallet;
    } catch (error) {
      console.error('[WalletMeshClient] Initialization failed:', error);
      this.initialized = false;
      this.lastRestoredWallet = null;
      throw error instanceof Error ? error : new Error('Failed to initialize client');
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Gets the dApp information associated with this client instance.
   *
   * @returns Immutable dApp information object
   *
   * @remarks
   * The returned object is frozen to prevent modifications after initialization.
   */
  getDappInfo(): Readonly<DappInfo> {
    return this.dappInfo;
  }

  /**
   * Establishes a connection with a wallet.
   *
   * @param walletInfo - Information about the wallet to connect
   * @param connector - The connector instance to use
   * @returns Promise resolving to the connected wallet
   * @throws {Error} If client is not initialized or connection fails
   *
   * @remarks
   * - Requires prior client initialization
   * - Prevents duplicate connections
   * - Automatically persists successful connections
   * - Handles cleanup on failure
   *
   * @example
   * ```typescript
   * const connector = createConnector({
   *   type: 'wm_aztec',
   *   options: { chainId: 'aztec:testnet' }
   * });
   *
   * const wallet = await client.connectWallet({
   *   id: 'my-wallet',
   *   name: 'My Wallet'
   * }, connector);
   * ```
   */
  async connectWallet(walletInfo: WalletInfo, connector: Connector): Promise<ConnectedWallet> {
    if (!this.initialized) {
      throw new Error('Client must be initialized before connecting');
    }

    if (!walletInfo.id) {
      throw new Error('Wallet ID is required');
    }

    const existingSession = this.sessionManager.getSession(walletInfo.id);
    if (existingSession?.status === ConnectionStatus.Connected) {
      throw new Error(`Wallet ${walletInfo.id} is already connected`);
    }

    try {
      // Connect and get wallet state
      const connectedWallet = await connector.connect(walletInfo);

      // Store session with timestamp and always persist state
      const session: WalletSession = {
        id: walletInfo.id,
        connector: connector,
        wallet: connectedWallet,
        status: ConnectionStatus.Connected,
        createdAt: Date.now(),
        chainConnections: new Map(),
        sessionToken: {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          walletType: connectedWallet.info.id,
          publicKey: '',
          permissions: [],
          accounts: [],
          chainIds: [],
          nonce: crypto.randomUUID(),
          signature: '',
        },
      };
      this.sessionManager.setSession(walletInfo.id, session, true);

      return connectedWallet;
    } catch (error) {
      await this.disconnectWallet(walletInfo.id);
      throw error instanceof Error ? error : new Error('Failed to connect wallet');
    }
  }

  /**
   * Disconnects a wallet and cleans up its resources.
   *
   * @param walletId - ID of the wallet to disconnect
   *
   * @remarks
   * - Implements timeout protection (5 seconds)
   * - Always removes session even if disconnect fails
   * - Handles cleanup of connector resources
   *
   * @example
   * ```typescript
   * await client.disconnectWallet('wallet-123');
   * ```
   */
  async disconnectWallet(walletId: string): Promise<void> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) return;

    const cleanup = async () => {
      try {
        if (session.connector) {
          await session.connector.disconnect();
        }
      } finally {
        // Always remove session on successful disconnect
        console.log('[WalletMeshClient] Removing session for wallet:', walletId);
        this.sessionManager.removeSession(walletId);
      }
    };

    try {
      await Promise.race([
        cleanup(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnect timeout')), 5000)),
      ]);
    } catch (error) {
      console.warn('[WalletMeshClient] Disconnect cleanup timed out or failed:', error);
      // Still remove session on failure
      this.sessionManager.removeSession(walletId);
    }
  }

  /**
   * Gets the blockchain-specific provider for a connected wallet.
   *
   * @param walletId - ID of the wallet
   * @returns Promise resolving to the provider instance
   * @throws {Error} If no session exists or no connector is available
   *
   * @example
   * ```typescript
   * const provider = await client.getProvider('wallet-123');
   * // Use provider for blockchain interactions
   * const accounts = await provider.request({ method: 'eth_accounts' });
   * ```
   */
  async getChainProvider(walletId: string): Promise<unknown> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) {
      throw new Error(`No session found for wallet ${walletId}`);
    }
    if (!session.connector) {
      throw new Error(`No connector available for wallet ${walletId}`);
    }
    return session.connector.getProvider();
  }

  /**
   * Gets all chain connections for a specific wallet.
   *
   * @param walletId - ID of the wallet
   * @returns Promise resolving to a map of chain connections or undefined if not found
   */
  async getWalletConnections(walletId: string): Promise<Map<number, ChainConnection> | undefined> {
    return this.sessionManager.getWalletConnections(walletId);
  }

  /**
   * Resets the client's internal state.
   *
   * @remarks
   * - Updates connected sessions to resumable state
   * - Clears initialization flags
   * - Preserves sessions for potential restoration
   *
   * @internal
   */
  private reset(): void {
    console.log('[WalletMeshClient] Resetting internal state');
    const sessions = this.sessionManager.getSessions();

    for (const session of sessions) {
      if (session.status === ConnectionStatus.Connected) {
        this.sessionManager.updateSessionStatus(session.wallet.info.id, ConnectionStatus.Resuming);
      }
    }

    this.initializing = false;
    this.initialized = false;
    this.lastRestoredWallet = null;
    console.log('[WalletMeshClient] Internal state reset complete');
  }

  /**
   * Gets all currently connected wallets.
   *
   * @returns Array of connected wallet instances
   *
   * @example
   * ```typescript
   * const wallets = client.getConnectedWallets();
   * console.log('Connected wallets:', wallets.length);
   * ```
   */
  getConnectedWallets(): ConnectedWallet[] {
    return this.sessionManager
      .getSessions()
      .filter((s) => s.status === ConnectionStatus.Connected)
      .map((s) => s.wallet);
  }

  /**
   * Gets the primary connected wallet.
   *
   * @returns The currently connected wallet or null if none connected
   *
   * @remarks
   * Returns the first connected wallet if multiple are connected.
   *
   * @example
   * ```typescript
   * const wallet = client.getConnectedWallet();
   * if (wallet) {
   *   console.log('Connected to:', wallet.info.name);
   * }
   * ```
   */
  getConnectedWallet(): ConnectedWallet | null {
    const sessions = this.sessionManager.getSessions();
    const connectedSession = sessions.find((s) => s.status === ConnectionStatus.Connected);
    return connectedSession?.wallet || null;
  }

  /**
   * Handles wallet-related errors.
   *
   * @param error - The error to handle
   *
   * @remarks
   * Currently logs errors to console, but could be extended
   * to implement more sophisticated error handling.
   */
  handleWalletError(error: Error): void {
    console.error('[WalletMeshClient] Wallet error:', error);
  }

  /**
   * Prepares the client for a page transition.
   *
   * @remarks
   * - Updates connected sessions to resumable state
   * - Preserves sessions for restoration after navigation
   * - Resets internal state
   *
   * This method is automatically called on 'beforeunload'
   * and 'pagehide' events.
   */
  prepareForTransition(): void {
    if (!this.initialized) {
      return;
    }

    console.log('[WalletMeshClient] Preparing for page transition');
    const currentWallets = this.getConnectedWallets();

    for (const wallet of currentWallets) {
      this.sessionManager.updateSessionStatus(wallet.info.id, ConnectionStatus.Resuming);
    }

    this.reset();
    console.log('[WalletMeshClient] Prepared for transition, sessions preserved');
  }

  /**
   * @deprecated Use {@link prepareForTransition} instead
   * Legacy method for backwards compatibility
   */
  deinitialize(): void {
    console.warn('[WalletMeshClient] deinitialize() is deprecated, use prepareForTransition()');
    this.prepareForTransition();
  }

  /**
   * Resets the singleton instance.
   *
   * @remarks
   * - Resets the current instance's state
   * - Clears the singleton instance
   * - Primarily used for testing
   *
   * @internal
   */
  static resetInstance(): void {
    if (WalletMeshClient.instance) {
      WalletMeshClient.instance.reset();
      WalletMeshClient.instance = null;
    }
  }
}
