import {
  type ConnectedWallet,
  type WalletConnectorConfig,
  type WalletInfo,
  ConnectionState,
} from '../types.js';
import { createConnector } from './createConnector.js';
import { createClientError } from './errors.js';

/**
 * Core WalletMesh client implementation
 */
export class WalletMeshClient {
  private _isConnected = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Connects to a wallet
   */
  async connect(config: WalletConnectorConfig): Promise<ConnectedWallet> {
    try {
      const connector = await createConnector(config);
      const walletInfo: WalletInfo = {
        address: '',
        chainId: config.defaultChainId ?? 1,
        publicKey: '',
      };

      const wallet = await connector.connect(walletInfo);
      this._isConnected = true;
      return wallet;
    } catch (error) {
      throw createClientError.connectFailed('Failed to connect wallet', {
        cause: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }

  /**
   * Disconnects current wallet
   */
  async disconnect(): Promise<void> {
    this._isConnected = false;
  }

  /**
   * Gets current connection state
   */
  getState(): ConnectionState {
    return this._isConnected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED;
  }
}
