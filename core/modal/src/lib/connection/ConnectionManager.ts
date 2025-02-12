import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../../types.js';
import { WalletMeshClient } from '../client/WalletMeshClient.js';
import { createTransport } from '../transports/index.js';
import { createAdapter } from '../adapters/createAdapter.js';
import { WalletError } from '../client/types.js';

const LOCAL_STORAGE_KEY = 'walletmesh_wallet_session';

export class ConnectionManager {
  private client: WalletMeshClient;
  private currentWallet: ConnectedWallet | null = null;
  private connectionStatus: ConnectionStatus;

  constructor() {
    this.client = new WalletMeshClient();
    this.connectionStatus = ConnectionStatus.Idle;
  }

  /**
   * Gets current connection state
   */
  getState() {
    return {
      wallet: this.currentWallet,
      status: this.connectionStatus
    };
  }

  /**
   * Retrieves stored session from localStorage
   */
  getStoredSession(): ConnectedWallet | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log('[ConnectionManager] Retrieved stored session:', stored);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('[ConnectionManager] Failed to parse stored session:', err);
      return null;
    }
  }

  /**
   * Saves session to localStorage
   */
  private saveSession(wallet: ConnectedWallet | null): void {
    console.log('[ConnectionManager] Saving session:', wallet);
    if (wallet) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallet));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(wallet: WalletInfo): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Connecting wallet:', wallet);
    
    if (this.connectionStatus !== ConnectionStatus.Idle) {
      throw new WalletError('Connection already in progress', 'client');
    }

    this.connectionStatus = ConnectionStatus.Connecting;

    try {
      console.log('[ConnectionManager] Creating transport and adapter');
      const transport = createTransport(wallet.transport);
      const adapter = createAdapter(wallet.adapter);

      console.log('[ConnectionManager] Initiating wallet connection');
      const connected = await this.client.connectWallet(wallet, transport, adapter);
      
      console.log('[ConnectionManager] Connection successful:', connected);
      this.currentWallet = connected;
      this.connectionStatus = ConnectionStatus.Connected;
      this.saveSession(connected);
      
      return connected;
    } catch (err) {
      console.error('[ConnectionManager] Connection failed:', err);
      this.currentWallet = null;
      this.connectionStatus = ConnectionStatus.Idle;
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Resumes a stored wallet connection
   */
  async resumeConnection(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Resuming connection:', sessionData);

    if (this.connectionStatus !== ConnectionStatus.Idle) {
      throw new WalletError('Connection already in progress', 'client');
    }

    this.connectionStatus = ConnectionStatus.Resuming;

    try {
      console.log('[ConnectionManager] Creating transport and adapter for resume');
      const transport = createTransport(sessionData.info.transport);
      const adapter = createAdapter(sessionData.info.adapter);

      console.log('[ConnectionManager] Initiating connection resume');
      const connected = await this.client.connectWallet(sessionData.info, transport, adapter);
      
      console.log('[ConnectionManager] Resume successful:', connected);
      this.currentWallet = connected;
      this.connectionStatus = ConnectionStatus.Connected;
      this.saveSession(connected);
      
      return connected;
    } catch (err) {
      console.error('[ConnectionManager] Resume failed:', err);
      this.currentWallet = null;
      this.connectionStatus = ConnectionStatus.Idle;
      this.saveSession(null);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to resume connection: ${error.message}`, 'client', error);
    }
  }

  /**
   * Disconnects the current wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    console.log('[ConnectionManager] Disconnecting wallet:', walletId);

    if (this.connectionStatus !== ConnectionStatus.Connected) {
      throw new WalletError('No wallet connected', 'client');
    }

    this.connectionStatus = ConnectionStatus.Disconnecting;

    try {
      console.log('[ConnectionManager] Disconnecting via client');
      await this.client.disconnectWallet(walletId);
      console.log('[ConnectionManager] Disconnection successful');
      this.currentWallet = null;
      this.connectionStatus = ConnectionStatus.Idle;
      this.saveSession(null);
    } catch (err) {
      console.error('[ConnectionManager] Disconnection failed:', err);
      this.connectionStatus = ConnectionStatus.Connected;
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to disconnect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Cleans up connection manager
   */
  cleanup(): void {
    console.log('[ConnectionManager] Cleaning up');
    this.currentWallet = null;
    this.connectionStatus = ConnectionStatus.Idle;
  }
}
