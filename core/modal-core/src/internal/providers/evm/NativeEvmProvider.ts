import { ChainType } from '../../../types.js';
import type { Logger } from '../../core/logger/logger.js';
import { EvmProvider } from './EvmProvider.js';

interface ProviderRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Wrapper for native window.ethereum providers
 */
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
  removeAllListeners?(event?: string): void;
  isConnected?(): boolean;
}

export class NativeEvmProvider extends EvmProvider {
  constructor(
    private ethereum: EthereumProvider,
    chainId: string | undefined,
    logger: Logger,
  ) {
    const chainType = ChainType.Evm;
    super(
      chainType,
      {
        send: async (message: unknown) => {
          await this.ethereum.request(message as { method: string; params?: unknown[] });
        },
        onMessage: () => {}, // Callback for incoming messages - not applicable in direct provider mode
      },
      chainId || '0x1',
      logger,
    );
    this.updateChainId();
  }

  override async request<T = unknown>(args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    const ethereumArgs = {
      method: args.method,
      ...(Array.isArray(args.params) && { params: args.params }),
    };
    return this.ethereum.request(ethereumArgs) as Promise<T>;
  }

  override on(event: 'connect', handler: (info: { chainId: string }) => void): void;
  override on(event: 'disconnect', handler: (error: ProviderRpcError) => void): void;
  override on(event: 'chainChanged', handler: (chainId: string) => void): void;
  override on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  override on(event: string, handler: (...args: unknown[]) => void): void;
  override on(
    event: string,
    handler:
      | ((info: { chainId: string }) => void)
      | ((error: ProviderRpcError) => void)
      | ((chainId: string) => void)
      | ((accounts: string[]) => void)
      | ((...args: unknown[]) => void),
  ): void {
    this.ethereum.on(event, handler as (...args: unknown[]) => void);
  }

  removeListener(event: string, handler: (...args: unknown[]) => void): void {
    this.ethereum.removeListener(event, handler);
  }

  removeAllListeners(event?: string): void {
    if (this.ethereum.removeAllListeners) {
      this.ethereum.removeAllListeners(event);
    }
  }

  /**
   * Check if the provider is connected to the Ethereum network
   * This is part of the EIP-1193 standard that Ethereum wallets implement
   */
  isConnected(): boolean {
    return this.ethereum.isConnected?.() ?? true;
  }

  override async disconnect(): Promise<void> {
    // Most EVM wallets don't have a disconnect method
    // This is handled at the connector level
  }

  private async updateChainId(): Promise<void> {
    try {
      const chainId = (await this.ethereum.request({ method: 'eth_chainId' })) as string;
      // Convert hex to decimal string if needed
      const normalizedChainId = chainId.startsWith('0x') ? Number.parseInt(chainId, 16).toString() : chainId;
      this.updateContext({ chainId: normalizedChainId });
    } catch {
      // Ignore errors during initialization
    }
  }
}
