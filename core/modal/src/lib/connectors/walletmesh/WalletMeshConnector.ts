import type { WalletInfo, ConnectedWallet } from '../../../types.js';
import type { Transport } from '../../transports/types.js';
import { TransportType, type TransportConfig } from '../../transports/types.js';
import { BaseConnector } from './base.js';
import { createTransport } from '../../transports/index.js';
import { WalletError } from '../../client/types.js';
import { MessageTypes, isWalletMessage } from './messages.js';

/**
 * Default WalletMesh connector implementation.
 *
 * Handles communication with WalletMesh-compatible wallets using various
 * transport mechanisms (PostMessage, WebSocket, etc.) based on the wallet type.
 * Sets up protocol-specific message routing and connection validation.
 */
export class WalletMeshConnector extends BaseConnector {
  private provider: unknown | null = null;

  protected async createTransport(walletInfo: WalletInfo): Promise<Transport> {
    const config: TransportConfig = {
      type: TransportType.PostMessage,
      options: {},
    };

    if (walletInfo.url) {
      // Web wallet - use PostMessage with origin from URL
      const origin = new URL(walletInfo.url).origin;
      config.options = { origin };
    } else if ('extensionId' in walletInfo && typeof walletInfo.extensionId === 'string') {
      // Extension wallet - use Extension transport
      config.type = TransportType.Extension;
      config.options = { extensionId: walletInfo.extensionId };
    }

    return createTransport(config);
  }

  /**
   * Validates wallet connection state and initializes protocol handshake.
   */
  protected async validateConnection(wallet: ConnectedWallet): Promise<void> {
    // Basic validation
    if (!wallet.info.id || !wallet.info.name) {
      throw new WalletError('Invalid wallet info', 'connector');
    }

    // Send protocol handshake
    await this.send({
      type: MessageTypes.HANDSHAKE,
      version: '1.0.0',
      wallet: wallet.info.id,
    });

    // Wait for response with timeout
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Handshake timeout'));
      }, 5000);

      this.addMessageHandler((data) => {
        if (!isWalletMessage(data)) return;

        if (data.type === MessageTypes.HANDSHAKE_COMPLETE) {
          clearTimeout(timeout);
          resolve();
        } else if (data.type === MessageTypes.HANDSHAKE_FAILED) {
          clearTimeout(timeout);
          reject(new Error(data.error));
        }
      });
    });
  }

  protected async getChainProvider(): Promise<unknown> {
    if (!this.provider) {
      await this.send({
        type: MessageTypes.GET_PROVIDER,
      });

      this.provider = await new Promise<unknown>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Provider request timeout'));
        }, 5000);

        this.addMessageHandler((data) => {
          if (!isWalletMessage(data)) return;

          if (data.type === MessageTypes.PROVIDER_READY) {
            clearTimeout(timeout);
            resolve(data.provider);
          } else if (data.type === MessageTypes.PROVIDER_ERROR) {
            clearTimeout(timeout);
            reject(new Error(data.error));
          }
        });
      });
    }

    return this.provider;
  }

  /**
   * Override to include provider cleanup.
   */
  override async disconnect(): Promise<void> {
    this.provider = null;
    await super.disconnect();
  }
}
