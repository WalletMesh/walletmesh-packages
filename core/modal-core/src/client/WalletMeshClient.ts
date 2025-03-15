/**
 * @packageDocumentation
 * Core client implementation for the WalletMesh Modal package.
 */

import type {
  ConnectedWallet,
  DappInfo,
  WalletInfo,
  WalletSession,
  ChainConnection,
  WalletClient,
  WalletError,
} from '../types.js';
import { ConnectionStatus } from '../types.js';
import type { Connector } from './types.js';
import { SessionManager } from './SessionManager.js';
import { defaultSessionStore } from '../store/sessionStore.js';
import { defaultSessionStoreAdapter } from '../store/sessionStoreAdapter.js';

/**
 * Core client class for managing wallet connections and sessions.
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
   */
  static getInstance(dappInfo: DappInfo): WalletMeshClient {
    if (!WalletMeshClient.instance) {
      WalletMeshClient.instance = new WalletMeshClient(dappInfo);

      if (!WalletMeshClient.cleanupCallbackRegistered && typeof window !== 'undefined') {
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
    this.sessionManager = new SessionManager(defaultSessionStoreAdapter(defaultSessionStore));
  }

  /**
   * Gets the dApp information.
   */
  getDappInfo(): Readonly<DappInfo> {
    return this.dappInfo;
  }

  /**
   * Initializes the client and restores sessions.
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
   * Establishes a connection with a wallet.
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
   * Disconnects a wallet and cleans up resources.
   */
  async disconnectWallet(walletId: string): Promise<void> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) return;

    const cleanup = async () => {
      try {
        if (session.connector) {
          await (session.connector as Connector).disconnect();
        }
      } finally {
        // Always remove session
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
   * Gets all chain connections for a specific wallet.
   */
  async getWalletConnections(walletId: string): Promise<Map<number, ChainConnection> | undefined> {
    return this.sessionManager.getWalletConnections(walletId);
  }

  /**
   * Gets the blockchain-specific provider for a wallet.
   */
  async getChainProvider(walletId: string): Promise<unknown> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) {
      throw new Error(`No session found for wallet ${walletId}`);
    }
    if (!session.connector) {
      throw new Error(`No connector available for wallet ${walletId}`);
    }
    return (session.connector as Connector).getProvider();
  }

  /**
   * Gets all currently connected wallets.
   */
  getConnectedWallets(): ConnectedWallet[] {
    return this.sessionManager
      .getSessions()
      .filter((s) => s.status === ConnectionStatus.Connected)
      .map((s) => s.wallet);
  }

  /**
   * Gets the primary connected wallet.
   */
  getConnectedWallet(): ConnectedWallet | null {
    const sessions = this.sessionManager.getSessions();
    const connectedSession = sessions.find((s) => s.status === ConnectionStatus.Connected);
    return connectedSession?.wallet || null;
  }

  /**
   * Handles wallet-related errors.
   */
  handleWalletError(error: WalletError): void {
    console.error('[WalletMeshClient] Wallet error:', error);
  }

  /**
   * Prepares the client for a page transition.
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
   * Resets the client's internal state.
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
   * Resets the singleton instance (primarily for testing).
   */
  static resetInstance(): void {
    if (WalletMeshClient.instance) {
      WalletMeshClient.instance.reset();
      WalletMeshClient.instance = null;
    }
  }
}
