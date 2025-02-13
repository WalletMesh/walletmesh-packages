import type { WalletInfo, ConnectedWallet } from '../../types.js';
import { WalletMeshClient } from '../client/WalletMeshClient.js';
import { createTransport } from '../transports/index.js';
import { createAdapter } from '../adapters/createAdapter.js';
import { WalletError } from '../client/types.js';

export class ConnectionManager {
  private client: WalletMeshClient;

  constructor() {
    this.client = new WalletMeshClient();
  }

  /**
   * Gets current connection state
   */
  getState() {
    const connectedWallet = this.client.getConnectedWallet();
    return {
      wallet: connectedWallet,
      status: this.client.getConnectionStatus()
    };
  }

  /**
   * Gets a stored session
   */
  getStoredSession(): ConnectedWallet | null {
    const sessions = this.client.getConnectedWallets();
    return sessions[0] || null;
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(wallet: WalletInfo): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Connecting wallet:', wallet);

    try {
      console.log('[ConnectionManager] Creating transport and adapter');
      const transport = createTransport(wallet.transport);
      const adapter = createAdapter(wallet.adapter);

      console.log('[ConnectionManager] Initiating wallet connection');
      const connected = await this.client.connectWallet(wallet, transport, adapter, { persist: true });

      console.log('[ConnectionManager] Connection successful:', connected);
      return connected;
    } catch (err) {
      console.error('[ConnectionManager] Connection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Resumes a stored wallet connection
   */
  async resumeConnection(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Resuming connection:', sessionData);

    try {
      console.log('[ConnectionManager] Creating transport and adapter for resume');
      const transport = createTransport(sessionData.info.transport);
      const adapter = createAdapter(sessionData.info.adapter);

      console.log('[ConnectionManager] Initiating connection resume');
      const connected = await this.client.resumeWallet(
        sessionData.info,
        sessionData.state,
        transport,
        adapter
      );

      console.log('[ConnectionManager] Resume successful:', connected);
      return connected;
    } catch (err) {
      console.error('[ConnectionManager] Resume failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to resume connection: ${error.message}`, 'client', error);
    }
  }

  /**
   * Disconnects the current wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    console.log('[ConnectionManager] Disconnecting wallet:', walletId);

    try {
      console.log('[ConnectionManager] Disconnecting via client');
      await this.client.disconnectWallet(walletId);
      console.log('[ConnectionManager] Disconnection successful');
    } catch (err) {
      console.error('[ConnectionManager] Disconnection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to disconnect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Gets a wallet's provider
   */
  async getProvider(walletId: string): Promise<unknown> {
    console.log('[ConnectionManager] Getting provider for wallet:', walletId);

    try {
      const provider = await this.client.getProvider(walletId);
      console.log('[ConnectionManager] Provider retrieved successfully');
      return provider;
    } catch (err) {
      console.error('[ConnectionManager] Failed to get provider:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to get wallet provider: ${error.message}`, 'client', error);
    }
  }

  /**
   * Cleans up connection manager
   */
  cleanup(): void {
    console.log('[ConnectionManager] Cleaning up');
    void this.client.disconnectAll();
  }
}
