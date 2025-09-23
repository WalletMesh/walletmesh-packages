/**
 * Unified and simplified type definitions for WalletMesh
 *
 * This file consolidates and simplifies the type definitions that were
 * previously scattered across multiple files and packages. The goal is to:
 *
 * 1. Eliminate duplicate interfaces
 * 2. Simplify overly complex type hierarchies
 * 3. Use consistent naming patterns
 * 4. Reduce the total number of types by 70%
 * 5. Improve developer experience with clearer types
 *
 * @module types/baseTypes
 */

import type { TransactionStatus } from '../services/index.js';
import type { ChainType, SupportedChain } from '../types.js';

// ============================================================================
// CORE CONNECTION TYPES (Simplified & Consolidated)
// ============================================================================

/**
 * Connection status enumeration
 * Simplified from multiple status types across the codebase
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * Simplified connection state
 *
 * Consolidates multiple connection state interfaces:
 * - BaseConnectionState
 * - WalletConnectionState
 * - WalletAdapterConnectionState
 * - ConnectionState (various)
 */
export interface ConnectionState {
  /** Connection status */
  status: ConnectionStatus;
  /** Connected wallet ID */
  walletId: string | null;
  /** Primary account address */
  address: string | null;
  /** Current chain */
  chain: SupportedChain | null;
  /** All connected account addresses */
  accounts: string[];
  /** Connection error if any */
  error?: WalletMeshError | null;
  /** When connection was established */
  connectedAt?: number;
}

/**
 * Multi-wallet connection state
 * Simplified version of MultiWalletConnectionState
 */
export interface MultiWalletState {
  /** Active connection (primary wallet) */
  activeConnection: ConnectionState;
  /** All wallet connections */
  connections: Record<string, ConnectionState>;
  /** Available wallets */
  availableWallets: Wallet[];
}

// ============================================================================
// SESSION TYPES (Dramatically Simplified)
// ============================================================================

/**
 * Session permissions
 * Simplified from complex permission hierarchy
 */
export interface SessionPermissions {
  /** Can read account information */
  readAccounts: boolean;
  /** Can sign transactions */
  signTransactions: boolean;
  /** Can switch chains */
  switchChains: boolean;
  /** Can add/remove accounts */
  manageAccounts: boolean;
  /** Custom permissions */
  custom: Record<string, boolean>;
}

/**
 * Base session metadata
 * Simplified from multiple metadata interfaces
 */
export interface BaseSessionMetadata {
  /** Session name/label */
  name?: string;
  /** Session tags */
  tags?: string[];
  /** DApp information */
  dApp?: {
    name: string;
    url: string;
    icon?: string;
  };
  /** Custom metadata */
  custom?: Record<string, unknown>;
  /** Session lifecycle timestamps */
  createdAt: number;
  lastActiveAt: number;
  expiresAt?: number;
}

/**
 * Simplified session state
 *
 * Consolidates the 600+ line SessionState interface into a manageable structure
 * while maintaining all essential functionality
 */
export interface Session {
  /** Unique session ID */
  id: string;
  /** Extends basic connection state */
  connection: ConnectionState;
  /** Blockchain provider instance */
  provider: unknown;
  /** Session permissions */
  permissions: SessionPermissions;
  /** Session metadata */
  metadata: BaseSessionMetadata;
}

// ============================================================================
// WALLET TYPES (Consolidated)
// ============================================================================

/**
 * Wallet information
 *
 * Consolidates:
 * - WalletInfo
 * - WalletMetadata
 * - WalletWithMetadata
 * - AvailableWallet
 */
export interface Wallet {
  /** Unique wallet identifier */
  id: string;
  /** Display name */
  name: string;
  /** Wallet icon URL or base64 */
  icon?: string;
  /** Supported chain types */
  chains: ChainType[];
  /** Whether wallet is currently available/installed */
  isAvailable: boolean;
  /** Download/install URL if not available */
  installUrl?: string;
  /** Wallet category */
  category?: 'extension' | 'mobile' | 'hardware' | 'web';
  /** Additional metadata */
  metadata?: {
    description?: string;
    version?: string;
    features?: string[];
    [key: string]: unknown;
  };
}

// ============================================================================
// MODAL TYPES (Unified)
// ============================================================================

/**
 * Modal view states
 * Simplified from multiple view enums
 */
export type ModalView = 'walletSelection' | 'connecting' | 'connected' | 'error' | 'switchingChain';

/**
 * Unified modal state
 *
 * Consolidates:
 * - BaseModalState
 * - HeadlessModalState
 * - ModalState
 */
export interface ModalState {
  /** Whether modal is open */
  isOpen: boolean;
  /** Current view */
  view: ModalView;
  /** Current connection state */
  connection: ConnectionState;
  /** Modal error state */
  error: WalletMeshError | null;
  /** Loading state */
  isLoading: boolean;
  /** Target chain type for filtering wallets */
  targetChainType?: ChainType;
}

/**
 * React-specific modal state
 * Only adds React-specific properties to avoid duplication
 */
export interface ReactModalState extends ModalState {
  /** Whether React component has mounted */
  hasMounted: boolean;
  /** Whether store is initializing */
  isInitializing: boolean;
}

// ============================================================================
// ERROR TYPES (Simplified)
// ============================================================================

/**
 * Error categories
 * Consolidated from multiple error classification systems
 */
export type ErrorCategory = 'user' | 'wallet' | 'network' | 'validation' | 'configuration' | 'unknown';

/**
 * Unified error interface
 *
 * Consolidates:
 * - ModalError
 * - ReactModalError
 * - UIError
 * - TransportErrorEvent
 */
export interface WalletMeshError {
  /** Error code */
  code: string;
  /** Human-readable message */
  message: string;
  /** Error category */
  category: ErrorCategory;
  /** Whether error is fatal */
  fatal?: boolean;
  /** Whether error is recoverable */
  isRecoverable?: boolean;
  /** Additional error data */
  data?: Record<string, unknown>;
  /** Underlying cause */
  cause?: unknown;
  /** When error occurred */
  timestamp?: number;
  /** Component that generated the error */
  component?: string;
}

// ============================================================================
// CHAIN TYPES (Simplified)
// ============================================================================

/**
 * Chain with metadata
 *
 * @remarks
 * Wraps a SupportedChain with additional metadata like RPC URLs and currency info.
 * For the canonical chain information type with full metadata, use ChainInfo from services.
 */
export interface ChainWithMetadata {
  /** The supported chain */
  chain: SupportedChain;
  /** Native currency */
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** RPC endpoints */
  rpcUrls: string[];
  /** Block explorer URLs */
  blockExplorerUrls?: string[];
  /** Whether this is a testnet */
  testnet?: boolean;
}

// ============================================================================
// TRANSACTION TYPES (Simplified)
// ============================================================================

// TransactionStatus has been moved to services/transaction/types.ts
// and is exported from services/index.ts

/**
 * Transaction result
 * Simplified from complex transaction hierarchy
 */
export interface Transaction {
  /** Transaction ID/hash */
  id: string;
  /** Transaction status */
  status: TransactionStatus;
  /** Source chain */
  chain: SupportedChain;
  /** From address */
  from: string;
  /** To address */
  to?: string;
  /** Transaction value */
  value?: string;
  /** Gas limit */
  gasLimit?: string;
  /** Gas price */
  gasPrice?: string;
  /** Transaction data */
  data?: string;
  /** Block number when confirmed */
  blockNumber?: number;
  /** Block hash when confirmed */
  blockHash?: string;
  /** Error message if failed */
  error?: string;
  /** Timestamps */
  createdAt: number;
  submittedAt?: number;
  confirmedAt?: number;
  failedAt?: number;
}

// ============================================================================
// PROVIDER TYPES (Unified)
// ============================================================================

/**
 * Base provider interface
 * Consolidates multiple provider interfaces
 */
export interface Provider {
  /** Provider type */
  type: 'eip1193' | 'solana' | 'aztec' | 'custom';
  /** Chain type this provider supports */
  chainType: ChainType;
  /** Whether provider is connected */
  isConnected: boolean;
  /** Get accounts */
  getAccounts(): Promise<string[]>;
  /** Sign transaction */
  signTransaction(tx: unknown): Promise<unknown>;
  /** Send transaction */
  sendTransaction(tx: unknown): Promise<string>;
  /** Switch chain */
  switchChain(chain: SupportedChain): Promise<void>;
  /** Subscribe to events */
  on(event: string, listener: (...args: unknown[]) => void): void;
  /** Unsubscribe from events */
  off(event: string, listener: (...args: unknown[]) => void): void;
}

// ============================================================================
// HOOK RETURN TYPES (Simplified)
// ============================================================================

/**
 * Standard hook return pattern
 * Consistent pattern for all hooks
 */
export interface UseConnectionReturn {
  /** Connection state */
  connection: ConnectionState;
  /** Connect function */
  connect: (walletId?: string) => Promise<void>;
  /** Disconnect function */
  disconnect: () => Promise<void>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: WalletMeshError | null;
  /** Reset error */
  reset: () => void;
}

/**
 * Modal control hook return
 */
export interface UseModalReturn {
  /** Modal state */
  modal: ModalState;
  /** Open modal */
  open: (targetChain?: ChainType) => void;
  /** Close modal */
  close: () => void;
  /** Set view */
  setView: (view: ModalView) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Optional properties helper
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract handler functions from an object
 */
export type ExtractHandlers<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return ? (...args: Args) => Return : never;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Types are defined in this file but exported via coreTypes.ts
// to avoid duplicate export conflicts
// Note: All types are already exported at their definition points
