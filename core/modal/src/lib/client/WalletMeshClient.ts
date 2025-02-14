import {
  ConnectionStatus,
  type WalletInfo,
  type ConnectedWallet,
  type WalletState,
  type DappInfo,
} from '../../types.js';
import type { WalletClient, WalletError, WalletSession } from './types.js';
import { SessionManager } from './SessionManager.js';
import type { Transport } from '../transports/types.js';
import type { Adapter } from '../adapters/types.js';
import { createTransport } from '../transports/index.js';
import { createAdapter } from '../adapters/createAdapter.js';

/**
 * Main client class for managing wallet connections and sessions
 *
 * Handles wallet connection lifecycle, session management, and state persistence.
 * Implements a singleton pattern to ensure only one instance exists per application.
 *
 * @example
 * ```typescript
 * const client = WalletMeshClient.getInstance({
 *   name: 'My dApp',
 *   icon: 'https://mydapp.com/icon.png'
 * });
 *
 * await client.initialize();
 * const wallet = await client.connectWallet(walletInfo);
 * ```
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
   * Gets or creates a WalletMeshClient instance. Implements singleton pattern.
   *
   * @param dappInfo - Information about the dApp to be shared with wallets
   * @returns The singleton WalletMeshClient instance
   * @throws {Error} If initialization fails
   *
   * @example
   * ```typescript
   * const client = WalletMeshClient.getInstance({
   *   name: 'My dApp',
   *   icon: 'https://mydapp.com/icon.png'
   * });
   * ```
   */
  static getInstance(dappInfo: DappInfo): WalletMeshClient {
    if (!WalletMeshClient.instance) {
      WalletMeshClient.instance = new WalletMeshClient(dappInfo);

      // Register page unload cleanup only once
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
   * Resets the singleton instance for testing or hard resets.
   * Cleans up existing connections and clears internal state.
   *
   * @remarks
   * This method should only be used for testing or when a complete reset is required.
   * Normal application flow should use {@link prepareForTransition} instead.
   */
  static resetInstance(): void {
    if (WalletMeshClient.instance) {
      WalletMeshClient.instance.reset();
      WalletMeshClient.instance = null;
    }
  }

  private constructor(dappInfo: DappInfo) {
    this.dappInfo = Object.freeze({ ...dappInfo });
    this.sessionManager = new SessionManager();
  }

  /**
   * Restore a saved session with retry logic and exponential backoff.
   *
   * @param session - The session to restore
   * @throws {Error} If session restoration fails after all retries
   * @throws {Error} If session configuration is invalid
   *
   * @remarks
   * This method implements an exponential backoff strategy with jitter for retries.
   * It will attempt to restore the session up to 3 times before giving up.
   *
   * @internal
   * This is an internal method used by {@link initialize}
   */
  private async restoreSession(session: WalletSession): Promise<void> {
    if (!session.transportConfig || !session.adapterConfig) {
      throw new Error('Missing transport or adapter configuration');
    }

    if (!session.wallet.state?.chain || !session.wallet.state?.address || !session.wallet.state?.sessionId) {
      throw new Error('Invalid session state');
    }

    // Create new transport and adapter instances
    const transport = createTransport(session.transportConfig);
    const adapter = createAdapter(session.adapterConfig);

    // Configure retry parameters
    const maxRetries = 3;
    const maxBackoff = 5000; // 5 seconds max backoff
    let attempt = 0;

    // Setup message handling first to catch early messages
    transport.onMessage((data) => {
      adapter.handleMessage(data);
    });

    while (attempt < maxRetries) {
      try {
        console.log(`[WalletMeshClient] Attempting session restore (attempt ${attempt + 1}/${maxRetries})`);

        // Connect transport
        await transport.connect();

        // Try to resume the session
        const restored = await adapter.resume(session.wallet.info, session.wallet.state);

        // On success, update session with new transport and adapter
        const restoredSession: WalletSession = {
          transport,
          adapter,
          wallet: restored,
          status: ConnectionStatus.Connected,
          transportConfig: session.transportConfig,
          adapterConfig: session.adapterConfig,
        };

        this.sessionManager.setSession(session.wallet.info.id, restoredSession, true);

        console.log('[WalletMeshClient] Session restored successfully:', {
          id: restored.info.id,
          chain: restored.state.chain,
          address: restored.state.address,
        });

        return;
      } catch (error) {
        attempt++;
        console.warn(`[WalletMeshClient] Restore attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error('[WalletMeshClient] Session restoration failed after all retries');
          // Only remove session after all retries fail
          this.sessionManager.removeSession(session.wallet.info.id);
          throw error;
        }

        // Exponential backoff with jitter and max limit
        const backoff = Math.min(Math.random() * 1000 * 2 ** attempt, maxBackoff);
        await new Promise((resolve) => setTimeout(resolve, backoff));

        // Clean up failed attempt before retry
        try {
          await transport.disconnect();
        } catch (cleanupError) {
          console.warn('[WalletMeshClient] Failed to cleanup transport:', cleanupError);
        }
      }
    }
  }

  /**
   * Initialize the client and attempt to restore any saved session.
   *
   * @returns Promise resolving to the restored wallet if successful, null otherwise
   * @throws {Error} If initialization fails
   *
   * @remarks
   * This method should be called before any other client operations.
   * If already initialized, it will return the current state.
   * If initialization is in progress, it will wait for completion.
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
      // Wait for existing initialization to complete
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

      // Look for a session to restore
      const restorable = sessions.find(
        (session) =>
          session.status === ConnectionStatus.Resuming &&
          session.transportConfig &&
          session.adapterConfig &&
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
   * Get the DApp information provided during instantiation.
   *
   * @returns Readonly DApp information object
   *
   * @remarks
   * The returned object is frozen to prevent modifications.
   */
  getDappInfo(): Readonly<DappInfo> {
    return this.dappInfo;
  }

  /**
   * Connect to a wallet using the provided configuration.
   *
   * @param walletInfo - Information about the wallet to connect to
   * @param transport - Transport instance for wallet communication
   * @param adapter - Adapter instance for wallet protocol handling
   * @param options - Connection options
   * @param options.persist - Whether to persist the session (default: false)
   * @returns Promise resolving to the connected wallet
   * @throws {Error} If client is not initialized
   * @throws {Error} If wallet ID is missing
   * @throws {Error} If wallet is already connected
   * @throws {Error} If connection fails
   *
   * @example
   * ```typescript
   * const transport = createTransport(config);
   * const adapter = createAdapter(config);
   * const wallet = await client.connectWallet(
   *   walletInfo,
   *   transport,
   *   adapter,
   *   { persist: true }
   * );
   * ```
   */
  async connectWallet(
    walletInfo: WalletInfo,
    transport: Transport,
    adapter: Adapter,
    options: { persist?: boolean } = {},
  ): Promise<ConnectedWallet> {
    if (!this.initialized) {
      throw new Error('Client must be initialized before connecting');
    }

    if (!walletInfo.id) {
      throw new Error('Wallet ID is required');
    }

    // Check if already connected
    const existingSession = this.sessionManager.getSession(walletInfo.id);
    if (existingSession?.status === ConnectionStatus.Connected) {
      throw new Error(`Wallet ${walletInfo.id} is already connected`);
    }

    try {
      await transport.connect();

      // Set up message routing and state change monitoring
      transport.onMessage((data) => {
        adapter.handleMessage(data);

        // Monitor for state changes in wallet messages
        if (typeof data === 'object' && data !== null) {
          const stateChanges: Partial<WalletState> = {};

          if ('chainId' in data) {
            stateChanges.chain = String(data.chainId);
          }
          if ('address' in data) {
            stateChanges.address = String(data.address);
          }
          if ('sessionId' in data) {
            stateChanges.sessionId = String(data.sessionId);
          }

          if (Object.keys(stateChanges).length > 0) {
            this.updateWalletState(walletInfo.id, stateChanges);
          }
        }
      });

      // Connect adapter
      const connectedWallet = await adapter.connect(walletInfo);

      // Store session
      const session: WalletSession = {
        transport,
        adapter,
        wallet: connectedWallet,
        status: ConnectionStatus.Connected,
        transportConfig: walletInfo.transport,
        adapterConfig: walletInfo.adapter,
      };
      this.sessionManager.setSession(walletInfo.id, session, options.persist);

      return connectedWallet;
    } catch (error) {
      // Ensure cleanup on failure
      await this.disconnectWallet(walletInfo.id);
      throw error instanceof Error ? error : new Error('Failed to connect wallet');
    }
  }

  /**
   * Updates wallet state and persists changes to storage.
   *
   * @param walletId - ID of the wallet to update
   * @param newState - Partial state object with changes
   *
   * @internal
   * This is an internal method used to handle wallet state updates
   */
  private updateWalletState(walletId: string, newState: Partial<WalletState>): void {
    const session = this.sessionManager.getSession(walletId);
    if (!session) return;

    // Update the wallet state with new values
    session.wallet.state = {
      ...session.wallet.state,
      ...newState,
    };

    // Persist the updated session
    this.sessionManager.setSession(walletId, session, true);
  }

  /**
   * Disconnects a specific wallet and optionally removes its session.
   *
   * @param walletId - ID of the wallet to disconnect
   * @param options - Disconnection options
   * @param options.removeSession - Whether to remove the session from storage (default: true)
   *
   * @remarks
   * If removeSession is false, the session will be kept for potential restoration.
   * The method includes a 5-second timeout for cleanup operations.
   *
   * @example
   * ```typescript
   * // Disconnect and remove session
   * await client.disconnectWallet(walletId);
   *
   * // Disconnect but keep session for later
   * await client.disconnectWallet(walletId, { removeSession: false });
   * ```
   */
  async disconnectWallet(
    walletId: string,
    options: { removeSession?: boolean } = { removeSession: true },
  ): Promise<void> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) return;

    // First clean up connections
    const cleanup = async () => {
      try {
        if (session.adapter) {
          await session.adapter.disconnect().catch((error) => {
            console.warn('[WalletMeshClient] Adapter disconnect failed:', error);
          });
        }
        if (session.transport) {
          await session.transport.disconnect().catch((error) => {
            console.warn('[WalletMeshClient] Transport disconnect failed:', error);
          });
        }
      } finally {
        // Only remove the session if explicitly requested
        if (options.removeSession) {
          console.log('[WalletMeshClient] Removing session for wallet:', walletId);
          this.sessionManager.removeSession(walletId);
        } else {
          console.log('[WalletMeshClient] Keeping session for wallet:', walletId);
          // Update session status but keep the session data
          this.sessionManager.updateSessionStatus(walletId, ConnectionStatus.Resuming);
        }
      }
    };

    try {
      // Attempt cleanup with timeout
      await Promise.race([
        cleanup(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnect timeout')), 5000)),
      ]);
    } catch (error) {
      console.warn('[WalletMeshClient] Disconnect cleanup timed out or failed:', error);
      // Only remove session if explicitly requested, even on failure
      if (options.removeSession) {
        this.sessionManager.removeSession(walletId);
      }
    }
  }

  /**
   * Gets provider for a specific wallet.
   *
   * @param walletId - ID of the wallet to get provider for
   * @returns Promise resolving to the wallet provider
   * @throws {Error} If no session is found for the wallet
   * @throws {Error} If no adapter is available for the wallet
   */
  async getProvider(walletId: string): Promise<unknown> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) {
      throw new Error(`No session found for wallet ${walletId}`);
    }
    if (!session.adapter) {
      throw new Error(`No adapter available for wallet ${walletId}`);
    }
    return session.adapter.getProvider();
  }

  /**
   * Reset internal state without clearing sessions.
   *
   * @internal
   * This is an internal method used for state management.
   * Preserves sessions but resets connection status.
   */
  private reset(): void {
    console.log('[WalletMeshClient] Resetting internal state');
    const sessions = this.sessionManager.getSessions();

    // Set all connected sessions to resuming state
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
   * Lists all currently connected wallets.
   *
   * @returns Array of connected wallet objects
   *
   * @example
   * ```typescript
   * const wallets = client.getConnectedWallets();
   * console.log('Connected wallets:', wallets.map(w => w.info.id));
   * ```
   */
  getConnectedWallets(): ConnectedWallet[] {
    return this.sessionManager
      .getSessions()
      .filter((s) => s.status === ConnectionStatus.Connected)
      .map((s) => s.wallet);
  }

  /**
   * Gets the currently connected wallet, if any.
   *
   * @returns The currently connected wallet or null if none connected
   *
   * @example
   * ```typescript
   * const wallet = client.getConnectedWallet();
   * if (wallet) {
   *   console.log('Connected to:', wallet.info.id);
   * }
   * ```
   */
  getConnectedWallet(): ConnectedWallet | null {
    const sessions = this.sessionManager.getSessions();
    const connectedSession = sessions.find((s) => s.status === ConnectionStatus.Connected);
    return connectedSession?.wallet || null;
  }

  /**
   * Handles wallet errors by logging them.
   *
   * @param error - The wallet error to handle
   *
   * @internal
   * This is an internal method used for error handling.
   */
  handleError(error: WalletError): void {
    console.error('[WalletMeshClient] Wallet error:', error);
  }

  /**
   * Prepares the client for page transitions by preserving wallet states.
   *
   * @remarks
   * This method should be called before page transitions to ensure wallet
   * sessions can be properly restored after navigation.
   *
   * - Marks connected sessions as resumable
   * - Preserves session data for restoration
   * - Resets internal state without clearing sessions
   *
   * @example
   * ```typescript
   * // Before page navigation
   * client.prepareForTransition();
   * // Navigate to new page...
   * ```
   */
  prepareForTransition(): void {
    if (!this.initialized) {
      return;
    }

    console.log('[WalletMeshClient] Preparing for page transition');
    const currentWallets = this.getConnectedWallets();

    for (const wallet of currentWallets) {
      // Just mark sessions as resuming, don't disconnect
      this.sessionManager.updateSessionStatus(wallet.info.id, ConnectionStatus.Resuming);
    }

    // Reset internal state but keep sessions
    this.reset();
    console.log('[WalletMeshClient] Prepared for transition, sessions preserved');
  }

  /**
   * Deinitialize the client.
   *
   * @deprecated Use {@link prepareForTransition} instead for page transitions
   * @remarks
   * This method is kept for backwards compatibility but will be removed in a future version.
   */
  deinitialize(): void {
    console.warn('[WalletMeshClient] deinitialize() is deprecated, use prepareForTransition()');
    this.prepareForTransition();
  }
}
