import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../../types.js';
import type { Transport } from '../transports/types.js';
import type { Adapter } from '../adapters/types.js';
import type { WalletSession, SessionOptions } from './types.js';
import { SessionManager } from './SessionManager.js';
import { WalletError } from './types.js';
import { createTransport, createAdapter } from '../factories.js';

/**
 * Main client for managing wallet connections
 */
export class WalletMeshClient {
  private sessionManager: SessionManager;

  constructor(options: SessionOptions = {}) {
    this.sessionManager = new SessionManager(options);
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (!walletInfo.id) {
      throw new WalletError('Wallet ID is required', 'client');
    }

    // Check if already connected
    const existingSession = this.sessionManager.getSession(walletInfo.id);
    if (existingSession?.status === ConnectionStatus.Connected) {
      throw new WalletError(
        `Wallet ${walletInfo.id} is already connected`,
        'client'
      );
    }

    try {
      // Create and connect transport
      const transport = createTransport(walletInfo.transport);
      await transport.connect();

      // Create adapter
      const adapter = createAdapter(walletInfo.adapter);

      // Set up message routing
      transport.onMessage((data) => {
        adapter.handleMessage(data);
      });

      // Connect adapter
      const connectedWallet = await adapter.connect(walletInfo);

      // Store session
      this.sessionManager.setSession(walletInfo.id, {
        transport,
        adapter,
        wallet: connectedWallet,
        status: ConnectionStatus.Connected,
        timestamp: Date.now()
      });

      return connectedWallet;
    } catch (err) {
      // Ensure cleanup on failure
      await this.disconnectWallet(walletInfo.id);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(
        `Failed to connect wallet: ${error.message}`,
        'client',
        error
      );
    }
  }

  /**
   * Disconnects a specific wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) return;

    try {
      await session.adapter.disconnect();
      await session.transport.disconnect();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(
        `Failed to disconnect wallet: ${error.message}`,
        'client',
        error
      );
    } finally {
      this.sessionManager.removeSession(walletId);
    }
  }

  /**
   * Gets provider for a specific wallet
   */
  async getProvider(walletId: string): Promise<unknown> {
    const session = this.sessionManager.getSession(walletId);
    if (!session) {
      throw new WalletError(`No session found for wallet ${walletId}`, 'client');
    }
    return session.adapter.getProvider();
  }

  /**
   * Lists all connected wallets
   */
  getConnectedWallets(): ConnectedWallet[] {
    return this.sessionManager
      .getSessions()
      .filter(s => s.status === ConnectionStatus.Connected)
      .map(s => s.wallet);
  }

  /**
   * Disconnects all wallets
   */
  async disconnectAll(): Promise<void> {
    const sessions = this.sessionManager.getSessions();
    await Promise.all(
      sessions.map(async session => {
        try {
          await this.disconnectWallet(session.wallet.id);
        } catch (err) {
          console.warn(`Failed to disconnect wallet ${session.wallet.id}:`, err);
        }
      })
    );
  }
}
