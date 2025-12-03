/**
 * EVM Discovery Types
 *
 * Type definitions for discovering EVM wallets using both
 * EIP-6963 (event-based multi-provider discovery) and
 * EIP-1193 (standard Ethereum provider interface).
 *
 * @module client/discovery/evm/types
 */

/**
 * EIP-6963 Provider Information
 * As defined in the EIP-6963 specification for provider discovery
 */
export interface EIP6963ProviderInfo {
  /** Unique identifier (UUIDv4) */
  uuid: string;
  /** Human-readable wallet name */
  name: string;
  /** Icon as data URI or URL (square, min 96x96px) */
  icon: string;
  /** Reverse DNS identifier (e.g., "io.metamask") */
  rdns: string;
}

/**
 * EIP-6963 Provider Detail
 * Complete provider information including the provider instance
 */
export interface EIP6963ProviderDetail {
  /** Provider metadata */
  info: EIP6963ProviderInfo;
  /** EIP-1193 compatible provider instance */
  provider: EIP1193Provider;
}

/**
 * EIP-1193 Provider Interface
 * Standard Ethereum provider as defined in EIP-1193
 */
export interface EIP1193Provider {
  /** Make RPC requests to the provider */
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  /** Subscribe to provider events */
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  /** Unsubscribe from provider events */
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;

  // Wallet identification properties (non-standard but common)
  /** MetaMask wallet */
  isMetaMask?: boolean;
  /** Brave wallet */
  isBraveWallet?: boolean;
  /** Coinbase wallet */
  isCoinbaseWallet?: boolean;
  /** Rabby wallet */
  isRabby?: boolean;
  /** TokenPocket wallet */
  isTokenPocket?: boolean;
  /** Frame wallet */
  isFrame?: boolean;
  /** Trust wallet */
  isTrust?: boolean;
  /** Wallet version */
  version?: string;
}

/**
 * Discovered EVM Wallet
 * Wallet information that will be stored in the registry
 */
export interface DiscoveredEVMWallet {
  /** Unique wallet identifier (rdns or generated) */
  id: string;
  /** Display name for the wallet */
  name: string;
  /** Icon data URI or URL */
  icon: string;
  /** How the wallet was discovered */
  type: 'eip6963' | 'eip1193' | 'ethereumProviders';
  /** Provider reference (stored for adapter creation) */
  provider: unknown;
  /** Additional metadata */
  metadata?: {
    /** EIP-6963 UUID */
    uuid?: string;
    /** Reverse DNS identifier */
    rdns?: string;
    /** Wallet version */
    version?: string;
  };
}

/**
 * EVM Discovery Configuration
 */
export interface EVMDiscoveryConfig {
  /** Whether discovery is enabled */
  enabled?: boolean;
  /** Milliseconds to wait for EIP-6963 provider announcements */
  eip6963Timeout?: number;
  /** Whether to prefer EIP-6963 over window.ethereum */
  preferEIP6963?: boolean;
}

/**
 * EVM Discovery Results
 * Complete results from all discovery methods
 */
export interface EVMDiscoveryResults {
  /** Wallets discovered via EIP-6963 */
  eip6963Wallets: DiscoveredEVMWallet[];
  /** Wallet discovered via window.ethereum */
  eip1193Wallet?: DiscoveredEVMWallet;
  /** Total count of discovered wallets */
  totalCount: number;
}
