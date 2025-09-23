/**
 * Mock JSONRPCTransport for testing purposes
 *
 * @internal
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';

export interface MockTransportConfig {
  chainType: ChainType;
  accounts: string[];
  chainId: string;
  rejectionRate?: number;
}

/**
 * Mock transport that simulates wallet behavior for testing
 */
export class MockTransport implements JSONRPCTransport {
  private messageHandler: ((message: unknown) => void) | null = null;

  constructor(private config: MockTransportConfig) {}

  async send(message: unknown): Promise<void> {
    const request = message as { method: string; params?: unknown[]; id?: string | number };

    // Simulate random rejection
    if (Math.random() < (this.config.rejectionRate || 0)) {
      throw ErrorFactory.userRejected(request.method);
    }

    // Simulate response via callback (which is how JSONRPCTransport works)
    let result: unknown;

    switch (request.method) {
      case 'eth_accounts':
        result = this.config.chainType === ChainType.Evm ? this.config.accounts : [];
        break;

      case 'eth_requestAccounts':
        result = this.config.chainType === ChainType.Evm ? this.config.accounts : [];
        break;

      case 'eth_chainId':
        result =
          this.config.chainType === ChainType.Evm
            ? `0x${Number.parseInt(this.config.chainId).toString(16)}`
            : '0x1';
        break;

      case 'eth_getBalance':
        result = '0x1000000000000000000'; // 1 ETH in wei
        break;

      case 'eth_sendTransaction':
        result = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // Mock tx hash
        break;

      case 'eth_signMessage':
        result = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'; // Mock signature
        break;

      case 'wallet_switchEthereumChain': {
        // Update chain ID if successful
        const params = request.params as [{ chainId: string }] | undefined;
        if (params?.[0]) {
          this.config.chainId = params[0].chainId;
        }
        result = null;
        break;
      }

      case 'solana_getAccounts':
        result = this.config.chainType === ChainType.Solana ? this.config.accounts : [];
        break;

      case 'solana_connect':
        result =
          this.config.chainType === ChainType.Solana
            ? { publicKey: this.config.accounts[0] || 'mock-solana-address' }
            : null;
        break;

      case 'solana_signTransaction':
        result = 'mock-signed-transaction-data';
        break;

      case 'solana_signMessage':
        result = { signature: new Uint8Array(64) };
        break;

      case 'solana_disconnect':
        result = undefined;
        break;

      default:
        throw ErrorFactory.configurationError(`MockTransport: Unsupported method ${request.method}`);
    }

    // Simulate the response via the message handler
    if (this.messageHandler && request.id !== undefined) {
      this.messageHandler({
        id: request.id,
        result,
      });
    }
  }

  onMessage(handler: (message: unknown) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Update mock configuration
   */
  updateConfig(updates: Partial<MockTransportConfig>): void {
    Object.assign(this.config, updates);
  }

  /**
   * Simulate an event from the wallet
   */
  simulateEvent(event: string, data: unknown): void {
    if (this.messageHandler) {
      this.messageHandler({
        method: event,
        params: data,
      });
    }
  }

  /**
   * Simulate accounts changed event
   */
  simulateAccountsChanged(accounts: string[]): void {
    this.config.accounts = accounts;
    this.simulateEvent('accountsChanged', accounts);
  }

  /**
   * Simulate chain changed event
   */
  simulateChainChanged(chainId: string): void {
    this.config.chainId = chainId;
    this.simulateEvent('chainChanged', chainId);
  }

  /**
   * Simulate disconnect event
   */
  simulateDisconnect(): void {
    this.simulateEvent('disconnect', { code: 1000, message: 'User disconnected' });
  }
}
