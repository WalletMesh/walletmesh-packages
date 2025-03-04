import type { WalletInfo, ConnectedWallet, WalletState } from '../../../types.js';
import type { Connector } from '../types.js';
import type { FakeConnectorOptions } from './types.js';
import { WalletError } from '../../client/types.js';

/**
 * Interface for interacting with the Fake protocol provider.
 */
export interface FakeAztecProvider {
  connect(sessionId?: string): Promise<{ address: string; sessionId: string }>;
  disconnect(): Promise<void>;
  getAccount(): Promise<string>;
  sendMessage(data: unknown): Promise<void>;
}

/**
 * Connector implementation for testing purposes.
 * Uses configurable options to simulate different behaviors.
 */
export class FakeAztecConnector implements Connector {
  private provider: FakeAztecProvider | null = null;
  private connected = false;
  private readonly options: FakeConnectorOptions;

  constructor(options: FakeConnectorOptions = {}) {
    this.options = {
      networkId: 'aztec-fake',
      shouldFail: false,
      responseDelay: 500,
      ...options,
    };
  }

  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'connector');
    }

    if (this.options.shouldFail) {
      throw new WalletError('Simulated connection failure', 'connector');
    }

    await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));

    try {
      this.provider = this.createProvider();
      const connection = await this.provider.connect();
      this.connected = true;

      // Log connection details
      console.log('[FakeAztecConnector] Connection established:', {
        address: connection.address,
        sessionId: connection.sessionId,
      });

      if (this.options.forceDisconnect) {
        setTimeout(() => {
          void this.disconnect();
        }, 100);
      }

      const state = {
        networkId: this.options.networkId || 'aztec-fake',
        address: this.options.customAddress || connection.address,
        sessionId: connection.sessionId,
      };

      // Log final wallet state for debugging
      console.log('[FakeAztecConnector] Returning wallet state:', state);

      return {
        info: walletInfo,
        state,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  async resume(walletInfo: WalletInfo, savedState: WalletState): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'connector');
    }

    if (this.options.shouldFail) {
      throw new WalletError('Simulated resume failure', 'connector');
    }

    // Validate saved state
    if (!savedState.address || !savedState.sessionId || !savedState.networkId) {
      throw new WalletError('Incomplete session state', 'connector');
    }

    await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));

    try {
      this.provider = this.createProvider();

      console.log('[FakeAztecConnector] Attempting to restore session:', {
        sessionId: savedState.sessionId,
        address: savedState.address,
        networkId: savedState.networkId,
      });

      const connection = await this.provider.connect(savedState.sessionId);

      if (connection.address.toLowerCase() !== savedState.address.toLowerCase()) {
        throw new Error('Restored address does not match saved state');
      }

      this.connected = true;
      console.log('[FakeAztecConnector] Session restored successfully');

      if (this.options.forceDisconnect) {
        setTimeout(() => {
          void this.disconnect();
        }, 100);
      }

      return {
        info: walletInfo,
        state: {
          networkId: savedState.networkId,
          address: connection.address,
          sessionId: connection.sessionId,
        },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume connection');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    if (this.options.shouldFail) {
      throw new WalletError('Simulated disconnect failure', 'connector');
    }

    await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));

    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.provider = null;
      this.connected = false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  async getProvider(): Promise<FakeAztecProvider> {
    if (!this.connected || !this.provider) {
      throw new WalletError('Not connected', 'connector');
    }
    return this.provider;
  }

  handleMessage(data: unknown): void {
    if (!this.connected || !this.provider) {
      console.warn('Received message while not connected');
      return;
    }

    this.provider.sendMessage(data).catch((err) => {
      console.error('Failed to send message to provider:', err);
    });
  }

  private createProvider(): FakeAztecProvider {
    return {
      connect: async (sessionId?: string) => {
        if (this.options.shouldFail) {
          throw new Error('Simulated provider connection failure');
        }

        await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));

        if (sessionId) {
          console.log('[FakeAztecConnector] Reconnecting with session:', sessionId);
          const address = sessionId.includes('0x') ? sessionId.split('_')[0] : '0x1234567890abcdef';

          if (!address || !address.startsWith('0x')) {
            throw new Error('Invalid session: missing or invalid address');
          }

          return {
            address: this.options.customAddress || address,
            sessionId,
          };
        }

        const address = this.options.customAddress || `0x${Math.random().toString(16).slice(2, 12)}`;
        const newSession = {
          address,
          sessionId: `${address}_${Date.now()}`,
        };
        console.log('[FakeAztecConnector] Created new session:', newSession);
        return newSession;
      },

      disconnect: async () => {
        if (this.options.shouldFail) {
          throw new Error('Simulated provider disconnect failure');
        }
        await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));
        console.log('[FakeAztecConnector] Disconnecting wallet');
        this.connected = false;
      },

      getAccount: async () => {
        if (!this.connected) {
          throw new WalletError('Wallet not connected', 'connector');
        }
        await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));
        return this.options.customAddress || '0x1234567890abcdef';
      },

      sendMessage: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, this.options.responseDelay || 0));
        console.log('[FakeAztecConnector] Sending message to wallet:', data);
      },
    };
  }
}
