/**
 * @packageDocumentation
 * WalletMesh client implementation
 */

import { EventEmitter } from 'node:events';
import { ConnectionStatus } from '../types.js';
import type {
  DappInfo,
  WalletInfo,
  ConnectedWallet,
  Connector
} from '../types.js';
import { SessionManager } from './SessionManager.js';
import { defaultSessionStore } from '../store/sessionStore.js';
import { defaultSessionStoreAdapter } from '../store/sessionStoreAdapter.js';

/**
 * Core WalletMesh client
 */
export class WalletMeshClient extends EventEmitter {
  private static instance: WalletMeshClient;
  private initialized = false;
  private currentWallet: ConnectedWallet | null = null;
  private readonly sessionManager: SessionManager;
  
  private constructor(private readonly dappInfo: DappInfo) {
    super();
    this.validateOrigin();
    this.sessionManager = new SessionManager(defaultSessionStoreAdapter(defaultSessionStore));
  }

  /**
   * Gets singleton instance
   */
  static getInstance(dappInfo: DappInfo): WalletMeshClient {
    if (!WalletMeshClient.instance) {
      WalletMeshClient.instance = new WalletMeshClient(dappInfo);
    }
    return WalletMeshClient.instance;
  }

  /**
   * Resets singleton instance (for testing)
   */
  static resetInstance(): void {
    WalletMeshClient.instance = undefined as unknown as WalletMeshClient;
  }

  /**
   * Initializes client
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.sessionManager.initialize();
    this.initialized = true;
  }

  /**
   * Validates dapp origin
   */
  private validateOrigin(): void {
    if (typeof window === 'undefined') return;
    
    const windowOrigin = new URL(window.location.href).origin;
    if (windowOrigin !== this.dappInfo.origin) {
      throw new Error(
        `Origin mismatch: DApp info specifies '${this.dappInfo.origin}' but is being served from '${windowOrigin}'`
      );
    }
  }

  /**
   * Connects to wallet
   */
  async connectWallet(walletInfo: WalletInfo, connector: Connector): Promise<ConnectedWallet> {
    try {
      const connectedWallet = await connector.connect(walletInfo);
      this.currentWallet = connectedWallet;
      return connectedWallet;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to connect wallet');
    }
  }

  /**
   * Gets current wallet state
   */
  getState(): ConnectionStatus {
    return this.currentWallet?.connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;
  }

  /**
   * Disconnects current wallet
   */
  async disconnect(): Promise<void> {
    if (!this.currentWallet) return;

    try {
      await this.sessionManager.getSession(this.currentWallet.address)?.connector.disconnect();
      this.currentWallet = null;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to disconnect wallet');
    }
  }

  /**
   * Prepares for transition (e.g. page refresh)
   */
  prepareForTransition(): void {
    if (!this.currentWallet) return;

    const session = this.sessionManager.getSession(this.currentWallet.address);
    if (session) {
      this.sessionManager.updateSessionStatus(
        this.currentWallet.address,
        ConnectionStatus.CONNECTING
      );
    }
    this.initialized = false;
  }
}
