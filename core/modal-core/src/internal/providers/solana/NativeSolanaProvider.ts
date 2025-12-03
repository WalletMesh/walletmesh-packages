import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { Logger } from '../../core/logger/logger.js';
import { SolanaProvider } from './SolanaProvider.js';
// Define Solana types locally since they're not in the main providers types
interface SolanaPublicKey {
  toString(): string;
  toBytes(): Uint8Array;
  equals(other: SolanaPublicKey): boolean;
}

interface SolanaSignInInput {
  domain?: string;
  address?: string;
  statement?: string;
  uri?: string;
  version?: string;
  chainId?: string;
  nonce?: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

interface SolanaSignInOutput {
  account: {
    address: string;
    publicKey: Uint8Array;
    chains: string[];
    features: string[];
  };
  signature: Uint8Array;
  signedMessage: Uint8Array;
}

interface PublicKey {
  toString(): string;
  toBase58?(): string;
  toBytes?(): Uint8Array;
}

interface WalletSolanaTransaction {
  // Minimal interface for Solana transactions
  serialize?: () => Buffer | Uint8Array;
  signatures?: Array<{ signature: Buffer | null }>;
}

interface SolanaWallet {
  publicKey?: PublicKey;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  signTransaction(transaction: WalletSolanaTransaction): Promise<WalletSolanaTransaction>;
  signAllTransactions?(transactions: WalletSolanaTransaction[]): Promise<WalletSolanaTransaction[]>;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

/**
 * Wrapper for native Solana wallet providers
 */
export class NativeSolanaProvider extends SolanaProvider {
  private walletPublicKey: PublicKey | null = null;

  get walletPublicKeyAdapter(): SolanaPublicKey | null {
    const key = this.walletPublicKey || this.wallet.publicKey || null;
    if (!key) return null;

    // Adapt the wallet's PublicKey to SolanaProvider's PublicKey interface
    return {
      toString: key.toString.bind(key),
      toBytes: key.toBytes?.bind(key) || (() => new Uint8Array()),
      equals: (other: SolanaPublicKey) => key.toString() === other.toString(),
    };
  }

  /**
   * Check if the wallet is connected
   * This is part of the Solana Wallet Standard
   */
  get connected(): boolean {
    return this.walletPublicKey != null || this.wallet.publicKey != null;
  }

  constructor(
    private wallet: SolanaWallet,
    chainId: string | undefined,
    logger: Logger,
  ) {
    super(
      ChainType.Solana,
      {
        send: async (message: unknown) => {
          // Convert to request format
          const request = message as { method: string; params?: unknown[] };
          await this.request(request);
        },
        onMessage: () => {}, // Callback for incoming messages - not applicable in direct provider mode
      },
      chainId || 'solana-mainnet',
      logger,
    );
    this.walletPublicKey = this.wallet.publicKey || null;
  }

  async request<T = unknown>(args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    const { method, params } = args;
    const paramsArray = Array.isArray(params) ? params : [];

    switch (method) {
      case 'connect': {
        const connectOptions = paramsArray[0] as { onlyIfTrusted?: boolean } | undefined;
        const result = await this.wallet.connect(connectOptions);
        this.walletPublicKey = result.publicKey;
        return result.publicKey.toString() as T;
      }

      case 'disconnect':
        await this.wallet.disconnect();
        this.walletPublicKey = null;
        return undefined as T;

      case 'getAccounts':
        return (this.walletPublicKeyAdapter ? [this.walletPublicKeyAdapter.toString()] : []) as T;

      case 'signMessage':
        return this.wallet.signMessage(paramsArray[0] as Uint8Array) as T;

      case 'signTransaction':
        return this.wallet.signTransaction(paramsArray[0] as WalletSolanaTransaction) as T;

      case 'signAllTransactions':
        if (!this.wallet.signAllTransactions) {
          throw ErrorFactory.configurationError('signAllTransactions not supported');
        }
        return this.wallet.signAllTransactions(paramsArray[0] as WalletSolanaTransaction[]) as T;

      default:
        throw ErrorFactory.configurationError(`Unsupported method: ${method}`);
    }
  }

  override on(event: 'connect', handler: (publicKey: SolanaPublicKey) => void): void;
  override on(event: 'disconnect', handler: () => void): void;
  override on(event: 'accountChanged', handler: (publicKey: SolanaPublicKey | null) => void): void;
  override on(event: string, handler: (...args: unknown[]) => void): void;
  override on(
    event: string,
    handler:
      | ((publicKey: SolanaPublicKey) => void)
      | (() => void)
      | ((publicKey: SolanaPublicKey | null) => void)
      | ((...args: unknown[]) => void),
  ): void {
    // Map wallet events to standard events
    if (event === 'connect' || event === 'accountChanged') {
      this.wallet.on(event, (...args: unknown[]) => {
        if (args[0]) {
          this.walletPublicKey = args[0] as PublicKey;
        }
        (handler as (...args: unknown[]) => void)(...args);
      });
    } else if (event === 'disconnect') {
      this.wallet.on(event, () => {
        this.walletPublicKey = null;
        (handler as () => void)();
      });
    } else {
      this.wallet.on(event, handler as (...args: unknown[]) => void);
    }
  }

  removeListener(event: string, handler: (...args: unknown[]) => void): void {
    this.wallet.removeListener(event, handler);
  }

  override removeAllListeners(event?: string): void {
    // Most Solana wallets don't support removeAllListeners
    // This is a limitation we have to work with
    // However, we must keep base class listener tracking in sync
    super.removeAllListeners(event);
  }

  // Implement abstract methods from SolanaProvider
  override async connect(): Promise<{ publicKey: string }> {
    const result = await this.wallet.connect();
    this.walletPublicKey = result.publicKey;
    return {
      publicKey: this.walletPublicKeyAdapter?.toString() || '',
    };
  }

  override async disconnect(): Promise<void> {
    await this.wallet.disconnect();
    this.walletPublicKey = null;
  }

  async signIn(_input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
    // Most wallets don't support SIWS yet
    throw ErrorFactory.configurationError('Sign In with Solana not supported by this wallet');
  }

  override async signMessage(message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    const result = await this.wallet.signMessage(messageBytes);
    return Buffer.from(result.signature).toString('hex');
  }

  override async signTransaction(transaction: unknown): Promise<string> {
    const result = await this.wallet.signTransaction(transaction as WalletSolanaTransaction);
    return JSON.stringify(result);
  }

  async signAllTransactions(transactions: unknown[]): Promise<string[]> {
    if (!this.wallet.signAllTransactions) {
      // Fallback to signing one by one
      const signed = [];
      for (const tx of transactions) {
        signed.push(await this.signTransaction(tx));
      }
      return signed;
    }
    const results = await this.wallet.signAllTransactions(transactions as WalletSolanaTransaction[]);
    return results.map((result) => JSON.stringify(result));
  }
}
