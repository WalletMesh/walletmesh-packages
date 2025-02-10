import type { WalletInfo, ConnectedWallet } from '../../types.js';
import { WalletMeshClient } from '../client/WalletMeshClient.js';
import { createTransport } from '../transports/index.js';
import { createAdapter } from '../adapters/createAdapter.js';
import { WalletError } from '../client/types.js';

const LOCAL_STORAGE_KEY = 'walletmesh_wallet_session';

export class ConnectionManager {
  private client: WalletMeshClient;
  private activeConnection: AbortController | null = null;

  constructor() {
    this.client = new WalletMeshClient();
  }

  /**
   * Retrieves stored session from localStorage
   */
  getStoredSession(): ConnectedWallet | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Failed to parse stored session:', err);
      return null;
    }
  }

  /**
   * Saves session to localStorage
   */
  private saveSession(wallet: ConnectedWallet | null): void {
    if (wallet) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallet));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  /**
   * Aborts any active connection attempt
   */
  private abortActiveConnection(): void {
    if (this.activeConnection) {
      this.activeConnection.abort();
      this.activeConnection = null;
    }
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(wallet: WalletInfo): Promise<ConnectedWallet> {
    this.abortActiveConnection();
    this.activeConnection = new AbortController();
    const signal = this.activeConnection.signal;

    try {
      const transport = createTransport(wallet.transport);
      const adapter = createAdapter(wallet.adapter);
      
      const connectPromise = this.client.connectWallet(wallet, transport, adapter);
      const connected = await Promise.race([
        connectPromise,
        new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
        })
      ]);

      if (!signal.aborted) {
        this.saveSession(connected);
        return connected;
      }

      throw new Error('Connection aborted');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(
        `Failed to connect wallet: ${error.message}`,
        'client',
        error
      );
    } finally {
      if (this.activeConnection?.signal === signal) {
        this.activeConnection = null;
      }
    }
  }

  /**
   * Resumes a stored wallet connection
   */
  async resumeConnection(sessionData: ConnectedWallet): Promise<ConnectedWallet> {
    this.abortActiveConnection();
    this.activeConnection = new AbortController();
    const signal = this.activeConnection.signal;

    try {
      const transport = createTransport(sessionData.transport);
      const adapter = createAdapter(sessionData.adapter);
      
      const connectPromise = this.client.connectWallet(sessionData, transport, adapter);
      const connected = await Promise.race([
        connectPromise,
        new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
        })
      ]);

      if (!signal.aborted) {
        this.saveSession(connected);
        return connected;
      }

      throw new Error('Connection aborted');
    } catch (err) {
      this.saveSession(null);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(
        `Failed to resume connection: ${error.message}`,
        'client',
        error
      );
    } finally {
      if (this.activeConnection?.signal === signal) {
        this.activeConnection = null;
      }
    }
  }

  /**
   * Disconnects the current wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    this.abortActiveConnection();
    
    try {
      await this.client.disconnectWallet(walletId);
      this.saveSession(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(
        `Failed to disconnect wallet: ${error.message}`,
        'client',
        error
      );
    }
  }

  /**
   * Cleans up connection manager
   */
  cleanup(): void {
    this.abortActiveConnection();
  }
}
