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
   * Aborts any active connection attempt
   */
  private abortActiveConnection(): void {
    if (this.activeConnection) {
      console.log('[ConnectionManager] Aborting active connection');
      this.activeConnection.abort();
      this.activeConnection = null;
    }
  }

  /**
   * Connects to a wallet
   */
  async connectWallet(wallet: WalletInfo): Promise<ConnectedWallet> {
    console.log('[ConnectionManager] Connecting wallet:', wallet);
    this.abortActiveConnection();
    this.activeConnection = new AbortController();
    const signal = this.activeConnection.signal;

    try {
      console.log('[ConnectionManager] Creating transport with config:', wallet.transport);
      const transport = createTransport(wallet.transport);
      console.log('[ConnectionManager] Creating adapter with config:', wallet.adapter);
      const adapter = createAdapter(wallet.adapter);

      console.log('[ConnectionManager] Initiating wallet connection');
      const connectPromise = this.client.connectWallet(wallet, transport, adapter);
      const connected = await Promise.race([
        connectPromise,
        new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
        }),
      ]);

      if (!signal.aborted) {
        console.log('[ConnectionManager] Connection successful:', connected);
        this.saveSession(connected);
        return connected;
      }

      console.warn('[ConnectionManager] Connection aborted');
      throw new Error('Connection aborted');
    } catch (err) {
      console.error('[ConnectionManager] Connection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to connect wallet: ${error.message}`, 'client', error);
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
    console.log('[ConnectionManager] Resuming connection:', sessionData);
    this.abortActiveConnection();
    this.activeConnection = new AbortController();
    const signal = this.activeConnection.signal;

    try {
      console.log('[ConnectionManager] Creating transport for resume');
      const transport = createTransport(sessionData.info.transport);
      console.log('[ConnectionManager] Creating adapter for resume');
      const adapter = createAdapter(sessionData.info.adapter);

      console.log('[ConnectionManager] Initiating connection resume');
      const connectPromise = this.client.connectWallet(sessionData.info, transport, adapter);
      const connected = await Promise.race([
        connectPromise,
        new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Connection aborted')));
        }),
      ]);

      if (!signal.aborted) {
        console.log('[ConnectionManager] Resume successful:', connected);
        this.saveSession(connected);
        return connected;
      }

      console.warn('[ConnectionManager] Resume aborted');
      throw new Error('Connection aborted');
    } catch (err) {
      console.error('[ConnectionManager] Resume failed:', err);
      this.saveSession(null);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to resume connection: ${error.message}`, 'client', error);
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
    console.log('[ConnectionManager] Disconnecting wallet:', walletId);
    this.abortActiveConnection();

    try {
      await this.client.disconnectWallet(walletId);
      console.log('[ConnectionManager] Disconnection successful');
      this.saveSession(null);
    } catch (err) {
      console.error('[ConnectionManager] Disconnection failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new WalletError(`Failed to disconnect wallet: ${error.message}`, 'client', error);
    }
  }

  /**
   * Cleans up connection manager
   */
  cleanup(): void {
    console.log('[ConnectionManager] Cleaning up');
    this.abortActiveConnection();
  }
}
