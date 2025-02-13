import { ConnectionStatus, type WalletInfo, type ConnectedWallet, type WalletState } from '../../types.js';
import type { SessionOptions } from './types.js';
import { SessionManager } from './SessionManager.js';
import { type WalletClient, WalletError } from './types.js';
import type { Transport } from '../transports/types.js';
import type { Adapter } from '../adapters/types.js';

/**
 * Main client for managing wallet connections
 */
export class WalletMeshClient implements WalletClient {
  private sessionManager: SessionManager;

  constructor(options: SessionOptions = {}) {
    this.sessionManager = new SessionManager(options);
  }

  /**
   * Resumes a previously connected wallet session
   */
  async resumeWallet(
    walletInfo: WalletInfo,
    _walletState: WalletState,
    transport: Transport,
    adapter: Adapter,
  ): Promise<ConnectedWallet> {
    const session = this.sessionManager.getSession(walletInfo.id);
    if (!session?.wallet) {
      throw new WalletError(`No valid session found for wallet ${walletInfo.id}`, 'client');
    }

    try {
      await transport.connect();

      // Set up message routing
      transport.onMessage((data: unknown) => {
        adapter.handleMessage(data);
      });

      // Resume using provided transport and adapter
      const connectedWallet = await adapter.connect(session.wallet.info);

      // Update session with new transport and adapter
      this.sessionManager.setSession(walletInfo.id, {
        transport,
        adapter,
        wallet: connectedWallet,
        status: ConnectionStatus.Connected,
      });

      return connectedWallet;
    } catch (err) {
      // Ensure cleanup on failure
      await this.disconnectWallet(walletInfo.id);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to resume wallet session: ${error.message}`, 'client', error);
    }
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(
    walletInfo: WalletInfo,
    transport: Transport,
    adapter: Adapter,
    options: { persist?: boolean } = {},
  ): Promise<ConnectedWallet> {
    if (!walletInfo.id) {
      throw new WalletError('Wallet ID is required', 'client');
    }

    // Check if already connected
    const existingSession = this.sessionManager.getSession(walletInfo.id);
    if (existingSession?.status === ConnectionStatus.Connected) {
      throw new WalletError(`Wallet ${walletInfo.id} is already connected`, 'client');
    }

    try {
      await transport.connect();

      // Set up message routing
      transport.onMessage((data) => {
        adapter.handleMessage(data);
      });

      // Connect adapter
      const connectedWallet = await adapter.connect(walletInfo);

      // Store session
      this.sessionManager.setSession(
        walletInfo.id,
        {
          transport,
          adapter,
          wallet: connectedWallet,
          status: ConnectionStatus.Connected,
        },
        options.persist,
      );

      return connectedWallet;
    } catch (err) {
      // Ensure cleanup on failure
      await this.disconnectWallet(walletInfo.id);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
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
      throw new WalletError(`Failed to disconnect wallet: ${error.message}`, 'client', error);
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
      .filter((s) => s.status === ConnectionStatus.Connected)
      .map((s) => s.wallet);
  }

  /**
   * Disconnects all wallets
   */
  async disconnectAll(): Promise<void> {
    const sessions = this.sessionManager.getSessions();
    await Promise.all(
      sessions.map(async (session) => {
        try {
          await this.disconnectWallet(session.wallet.info.id);
        } catch (err) {
          console.warn(`Failed to disconnect wallet ${session.wallet.info.id}:`, err);
        }
      }),
    );
  }

  /**
   * Gets current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    const sessions = this.sessionManager.getSessions();
    if (sessions.length === 0) return ConnectionStatus.Idle;
    if (sessions.some((s) => s.status === ConnectionStatus.Connecting)) return ConnectionStatus.Connecting;
    if (sessions.some((s) => s.status === ConnectionStatus.Connected)) return ConnectionStatus.Connected;
    if (sessions.some((s) => s.status === ConnectionStatus.Disconnecting))
      return ConnectionStatus.Disconnecting;
    return ConnectionStatus.Idle;
  }

  /**
   * Gets current connected wallet
   */
  getConnectedWallet(): ConnectedWallet | null {
    const sessions = this.sessionManager.getSessions();
    const connectedSession = sessions.find((s) => s.status === ConnectionStatus.Connected);
    return connectedSession?.wallet || null;
  }

  /**
   * Handles wallet errors
   */
  handleError(error: WalletError): void {
    console.error('Wallet error:', error);
    // Additional error handling logic can be added here
  }
}
