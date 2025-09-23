/**
 * Solana Discovery Types
 *
 * Type definitions for discovering Solana wallets using both
 * the Solana Wallet Standard and legacy wallet injection methods.
 *
 * @module client/discovery/solana/types
 */

/**
 * Solana Wallet Standard Account
 * Represents a connected account in the wallet
 */
export interface SolanaWalletAccount {
  /** Account public key */
  address: string;
  /** Public key as bytes */
  publicKey: Uint8Array;
  /** Supported chains for this account */
  chains?: string[];
  /** Account features */
  features?: string[];
  /** Account label */
  label?: string;
  /** Account icon */
  icon?: string;
}

/**
 * Solana Wallet Standard Connect Options
 */
export interface SolanaConnectOptions {
  /** Silent connection without user interaction */
  silent?: boolean;
  /** Required features */
  requiredFeatures?: string[];
}

/**
 * Solana Wallet Standard Wallet
 * As defined in the Solana Wallet Standard specification
 */
export interface SolanaWalletStandardWallet {
  /** Wallet name */
  name: string;
  /** Wallet icon as data URI or URL */
  icon: string;
  /** Supported chains */
  chains: string[];
  /** Wallet features */
  features: Record<string, unknown>;
  /** Connected accounts */
  accounts: SolanaWalletAccount[];
  /** Connect to the wallet */
  connect(options?: SolanaConnectOptions): Promise<SolanaWalletAccount[]>;
  /** Disconnect from the wallet */
  disconnect(): Promise<void>;
}

/**
 * Solana Provider Interface
 * Common interface for injected Solana wallet providers
 */
export interface SolanaProvider {
  /** Public key of connected account */
  publicKey?: { toString: () => string; toBytes?: () => Uint8Array };
  /** Check if connected */
  isConnected?: boolean;

  /** Connect to wallet */
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString: () => string } }>;
  /** Disconnect from wallet */
  disconnect(): Promise<void>;
  /** Sign a transaction */
  signTransaction?(transaction: unknown): Promise<unknown>;
  /** Sign multiple transactions */
  signAllTransactions?(transactions: unknown[]): Promise<unknown[]>;
  /** Sign a message */
  signMessage?(message: Uint8Array): Promise<{ signature: Uint8Array }>;

  /** Event handling */
  on?(event: string, handler: (...args: unknown[]) => void): void;
  off?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  removeAllListeners?(): void;

  // Wallet identification flags
  /** Phantom wallet */
  isPhantom?: boolean;
  /** Solflare wallet */
  isSolflare?: boolean;
  /** Backpack wallet */
  isBackpack?: boolean;
  /** Glow wallet */
  isGlow?: boolean;
  /** Trust wallet */
  isTrust?: boolean;
  /** Exodus wallet */
  isExodus?: boolean;
  /** Coinbase wallet */
  isCoinbaseWallet?: boolean;
  /** MathWallet */
  isMathWallet?: boolean;
  /** Slope wallet */
  isSlope?: boolean;
  /** Torus wallet */
  isTorus?: boolean;
  /** Brave wallet */
  isBraveWallet?: boolean;
  /** TokenPocket */
  isTokenPocket?: boolean;
  /** Wallet version */
  version?: string;
}

/**
 * Discovered Solana Wallet
 * Wallet information that will be stored in the registry
 */
export interface DiscoveredSolanaWallet {
  /** Unique wallet identifier */
  id: string;
  /** Display name for the wallet */
  name: string;
  /** Icon data URI or URL */
  icon: string;
  /** How the wallet was discovered */
  type: 'wallet-standard' | 'injected' | 'legacy';
  /** Provider reference (stored for adapter creation) */
  provider: unknown;
  /** Additional metadata */
  metadata?: {
    /** Reverse DNS identifier */
    rdns?: string;
    /** Wallet version */
    version?: string;
    /** Supported features */
    features?: string[];
    /** Supported chains */
    chains?: string[];
  };
}

/**
 * Solana Discovery Configuration
 */
export interface SolanaDiscoveryConfig {
  /** Whether discovery is enabled */
  enabled?: boolean;
  /** Milliseconds to wait for wallet standard registration events */
  walletStandardTimeout?: number;
  /** Whether to prefer Wallet Standard over injected wallets */
  preferWalletStandard?: boolean;
  /** Include deprecated or legacy wallets */
  includeDeprecated?: boolean;
}

/**
 * Solana Discovery Results
 * Complete results from all discovery methods
 */
export interface SolanaDiscoveryResults {
  /** Wallets discovered via Wallet Standard */
  walletStandardWallets: DiscoveredSolanaWallet[];
  /** Wallets discovered via window injection */
  injectedWallets: DiscoveredSolanaWallet[];
  /** Legacy wallets (deprecated discovery methods) */
  legacyWallets?: DiscoveredSolanaWallet[];
  /** Total count of discovered wallets */
  totalCount: number;
}

/**
 * Window extensions for Solana wallets
 */
declare global {
  interface Window {
    solana?: SolanaProvider;
    phantom?: { solana?: SolanaProvider };
    solflare?: SolanaProvider;
    backpack?: { solana?: SolanaProvider };
    glow?: { solana?: SolanaProvider };
    coinbaseSolana?: SolanaProvider;
    trustwallet?: { solana?: SolanaProvider };
    exodus?: { solana?: SolanaProvider };
    mathWallet?: { solana?: SolanaProvider };
    slope?: SolanaProvider;
    torus?: { solana?: SolanaProvider };
    brave?: { solana?: SolanaProvider };
    tokenpocket?: { solana?: SolanaProvider };

    // Wallet Standard registry
    wallets?: {
      get(): SolanaWalletStandardWallet[];
      on(event: string, handler: (wallets: SolanaWalletStandardWallet[]) => void): void;
      off(event: string, handler: (wallets: SolanaWalletStandardWallet[]) => void): void;
    };
  }

  interface WindowEventMap {
    'wallet-standard:register': CustomEvent<{ wallet: SolanaWalletStandardWallet }>;
    'wallet-standard:app-ready': Event;
  }
}
