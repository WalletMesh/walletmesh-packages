/**
 * @file ConnectionManager.ts
 * @packageDocumentation
 * High-level connection management layer for the WalletMesh Modal package.
 */

import { ConnectionStatus, type WalletInfo, type ConnectedWallet, type DappInfo } from '../../types.js';
import type { TimeoutConfig } from '../utils/timeout.js';
import { WalletMeshClient } from '../client/client.js';
import { createConnector } from '../connectors/createConnector.js';
import { SessionManager } from '../client/SessionManager.js';
import { WalletError } from '../client/types.js';
import { withTimeout } from '../utils/timeout.js';

/**
 * High-level manager for wallet connections with timeout protection.
 */
export class ConnectionManager {
  private client: WalletMeshClient;
  private timeoutConfig: Required<TimeoutConfig>;
  private sessionManager: SessionManager;

  constructor(dappInfo: DappInfo, config?: TimeoutConfig) {
    this.client = WalletMeshClient.getInstance(dappInfo);
    this.timeoutConfig = {
      connectionTimeout: 30000, // 30s default
      operationTimeout: 10000, // 10s default
      ...config,
    };
    this.sessionManager = new SessionManager();
  }

  /**
   * Initializes the connection manager and attempts to restore any valid sessions.
   */
  async initialize(): Promise<ConnectedWallet | null> {
    console.log('[ConnectionManager] Starting initialization');

    try {
      // Initialize client first to ensure it's ready
      await withTimeout(
        this.client.initialize(),
        this.timeoutConfig.operationTimeout,
        'client initialization',
      );

      // Look for any valid session, not just resuming ones
      const sessions = this.sessionManager.getSessions();
      const restorable = sessions.find(
        (s) =>
          s.wallet.state.sessionId &&
          s.wallet.info.connector &&
          (s.status === ConnectionStatus.Connected || s.status === ConnectionStatus.Resuming),
      );

      if (restorable) {
        console.log('[ConnectionManager] Found valid session, attempting to reconnect:', {
          id: restorable.wallet.info.id,
          address: restorable.wallet.state.address,
          status: restorable.status,
        });

        try {
          // Update status to show we're attempting reconnection
          this.sessionManager.updateSessionStatus(restorable.id, ConnectionStatus.Resuming);

          // Create new connector for the session
          const connector = createConnector(restorable.wallet.info.connector);

          // Attempt to resume the actual wallet connection
          console.log('[ConnectionManager] Attempting to resume wallet connection:', {
            id: restorable.wallet.info.id,
            connector: restorable.wallet.info.connector.type,
          });

          const reconnected = await withTimeout(
            connector.resume(restorable.wallet.info, restorable.wallet.state),
            this.timeoutConfig.connectionTimeout,
            'reconnection',
          );

          // Update session with reconnected wallet
          const updatedSession = {
            ...restorable,
            wallet: reconnected,
            connector,
            status: ConnectionStatus.Connected,
          };

          console.log('[ConnectionManager] Successfully reconnected wallet:', {
            id: reconnected.info.id,
            address: reconnected.state.address,
          });

          this.sessionManager.setSession(restorable.id, updatedSession);
          return reconnected;
        } catch (err) {
          console.error('[ConnectionManager] Failed to reconnect wallet:', err);
          // Clean up failed session
          this.sessionManager.removeSession(restorable.id);
          return null;
        }
      }

      console.log('[ConnectionManager] No valid sessions found to restore');
      return null;
    } catch (error) {
      // Log initialization errors but don't throw
      console.error('[ConnectionManager] Initialization failed:', error);

      if (error instanceof Error) {
        console.error('[ConnectionManager] Error details:', error.message);
      }

      // Clean up any partial state
      const sessions = this.sessionManager.getSessions();
      for (const session of sessions) {
        if (session.status === ConnectionStatus.Resuming) {
          this.sessionManager.removeSession(session.id);
        }
      }

      return null;
    }
  }

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
        chain: wallet.state.networkId,
        address: wallet.state.address,
        sessionId: wallet.state.sessionId,
      });

      // Create a new session token
      const sessionToken = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        walletType: wallet.info.id,
        publicKey: '',
        permissions: [],
        accounts: [wallet.state.address || ''],
        chainIds: wallet.state.networkId ? [Number(wallet.state.networkId)] : [],
        nonce: crypto.randomUUID(),
        signature: '',
      };

      this.sessionManager.setSession(walletInfo.id, {
        id: walletInfo.id,
        createdAt: Date.now(),
        wallet,
        connector,
        chainConnections: new Map(),
        sessionToken,
        status: wallet.state.sessionId ? ConnectionStatus.Connected : ConnectionStatus.Idle,
      });

      return wallet;
    } catch (err) {
      console.error('[ConnectionManager] Connection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
    }
  }

  async disconnectWallet(
    walletId: string,
    options: { removeSession?: boolean } = { removeSession: true },
  ): Promise<void> {
    console.log('[ConnectionManager] Disconnecting wallet:', walletId, options);

    try {
      await withTimeout(
        this.client.disconnectWallet(walletId),
        this.timeoutConfig.operationTimeout,
        'wallet disconnection',
      );
      console.log('[ConnectionManager] Disconnection successful');

      if (options.removeSession) {
        this.sessionManager.removeSession(walletId);
      }
    } catch (err) {
      console.error('[ConnectionManager] Disconnection failed:', err);
      // Still try to disconnect even if it fails
      this.client.disconnectWallet(walletId).catch(console.error);
    }
  }

  async getProvider(walletId: string): Promise<unknown> {
    return withTimeout(
      this.client.getChainProvider(walletId),
      this.timeoutConfig.operationTimeout,
      'get provider',
    );
  }

  getState() {
    return {
      wallet: this.client.getConnectedWallet(),
      initialized: true,
    };
  }

  cleanup(): void {
    console.log('[ConnectionManager] Component cleanup started');
    try {
      const connectedWallet = this.client.getConnectedWallet();
      if (connectedWallet) {
        console.log('[ConnectionManager] Cleaning up wallet:', connectedWallet.info.id);
        this.disconnectWallet(connectedWallet.info.id, { removeSession: false })
          .then(() => console.log('[ConnectionManager] Wallet cleanup successful'))
          .catch((err) => {
            console.error('[ConnectionManager] Failed to cleanup wallet connection:', err);
          });
      }

      this.client.deinitialize();
      console.log('[ConnectionManager] Cleanup complete');
    } catch (err) {
      console.error('[ConnectionManager] Cleanup failed:', err);
    }
  }
}
