/**
 * Unified session state architecture consolidating multiple session patterns
 *
 * This module consolidates the existing session patterns:
 * - WalletConnectionSession (immutable, chain-specific)
 * - WalletSession with ChainState (persistent, multi-chain)
 * - Mixed session state in unified store
 *
 * Into a single, consistent session architecture that supports both
 * chain-specific and multi-chain session management.
 */

import type { SupportedChain } from '../../core/types.js';
import type { BlockchainProvider } from './chainProviders.js';

/**
 * Core session state representing a wallet connection
 *
 * This is the fundamental session unit that tracks a specific
 * wallet connection to a specific chain at a point in time.
 * Enhanced with multi-account support for seamless account switching.
 */
export interface SessionState {
  /** Unique session identifier */
  sessionId: string;

  /** ID of the wallet that created this session */
  walletId: string;

  /** Session status */
  status: SessionStatus;

  /** All available accounts in this session */
  accounts: AccountInfo[];

  /** Currently active account (selected for transactions) */
  activeAccount: AccountInfo;

  /** Connected chain information */
  chain: ChainSessionInfo;

  /** Provider instance for this session */
  provider: SessionProvider;

  /** Permissions granted in this session */
  permissions: SessionPermissions;

  /** Session metadata and context */
  metadata: SessionStateMetadata;

  /** Session lifecycle information */
  lifecycle: SessionLifecycle;

  /** Multi-chain session context (if part of wallet session) */
  walletSession?: WalletSessionContext;

  /** Multi-account management context */
  accountContext?: AccountManagementContext;
}

/**
 * Session status enumeration
 */
export type SessionStatus =
  | 'initializing' // Session is being created
  | 'connecting' // Connection in progress
  | 'connected' // Active and ready
  | 'switching' // Chain switch in progress
  | 'disconnecting' // Disconnection in progress
  | 'disconnected' // No longer active
  | 'error'; // Error state

/**
 * Chain information within a session
 */
export interface ChainSessionInfo extends SupportedChain {
  /** Whether this is the native chain for the wallet */
  isNative?: boolean;
}

/**
 * Provider information in session context
 */
export interface SessionProvider {
  /** Provider instance (chain-specific) */
  instance: BlockchainProvider;

  /** Provider type identifier */
  type: string;

  /** Provider version */
  version: string;

  /** Whether provider supports multi-chain */
  multiChainCapable: boolean;

  /** Supported methods for this provider */
  supportedMethods: string[];
}

/**
 * Session permissions structure
 */
export interface SessionPermissions {
  /** Methods the dApp can call */
  methods: string[];

  /** Events the dApp can subscribe to */
  events: string[];

  /** Whether auto-sign is permitted */
  autoSign?: boolean;

  /** Maximum transaction value (if applicable) */
  maxTransactionValue?: string;

  /** Custom chain-specific permissions */
  chainSpecific?: Record<string, unknown>;

  /** Wallet-specific permissions */
  walletSpecific?: Record<string, unknown>;
}

/**
 * Session metadata and context information for session state
 */
export interface SessionStateMetadata {
  /** Wallet information */
  wallet: {
    name: string;
    icon: string;
    version?: string;
    installUrl?: string;
  };

  /** dApp information at connection time */
  dapp: {
    name: string;
    url?: string;
    icon?: string;
    domain?: string;
  };

  /** Connection context */
  connection: {
    /** How the connection was initiated */
    initiatedBy: 'user' | 'dapp' | 'auto';
    /** Method used for connection */
    method: 'manual' | 'deeplink' | 'qr' | 'extension' | 'injected';
    /** User agent at connection time */
    userAgent?: string;
    /** IP address (if available and permitted) */
    ipAddress?: string;
  };

  /** Chain switch history for this session */
  chainSwitches?: ChainSwitchRecord[];
}

/**
 * Session lifecycle tracking
 */
export interface SessionLifecycle {
  /** When the session was created */
  createdAt: number;

  /** When the session was last active */
  lastActiveAt: number;

  /** When the session was last accessed */
  lastAccessedAt: number;

  /** When the session expires (optional) */
  expiresAt?: number;

  /** Number of operations performed in this session */
  operationCount: number;

  /** Total time spent active (milliseconds) */
  activeTime: number;
}

/**
 * Chain switch record for tracking session history
 */
export interface ChainSwitchRecord {
  /** Unique identifier for this switch */
  switchId: string;

  /** Previous chain (null for initial connection) */
  fromChain: ChainSessionInfo | null;

  /** New chain */
  toChain: ChainSessionInfo;

  /** When the switch occurred */
  timestamp: number;

  /** Why the switch occurred */
  reason: 'user_request' | 'dapp_request' | 'auto_switch' | 'fallback';

  /** Whether the switch was successful */
  successful: boolean;

  /** Error if switch failed */
  error?: string;
}

/**
 * Multi-chain wallet session context
 *
 * This provides context when a session is part of a larger
 * multi-chain wallet connection.
 */
export interface WalletSessionContext {
  /** ID of the parent wallet session */
  walletSessionId: string;

  /** All sessions within this wallet connection */
  allSessions: Map<string, string>; // chainId -> sessionId

  /** Currently active session ID */
  activeSessionId: string;

  /** Session switch history */
  switchHistory: string[]; // Ordered list of sessionIds

  /** Wallet-level permissions */
  walletPermissions: {
    maxChains?: number;
    allowedChains?: string[];
    restrictedMethods?: string[];
  };

  /** Wallet session metadata */
  walletMetadata: {
    totalSessions: number;
    totalChainSwitches: number;
    createdAt: number;
    lastActiveAt: number;
  };
}

/**
 * Session comparison result
 */
export interface SessionComparison {
  /** Whether sessions are for the same wallet */
  sameWallet: boolean;

  /** Whether sessions have the same addresses */
  sameAddresses: boolean;

  /** Whether sessions are on the same chain */
  sameChain: boolean;

  /** Whether sessions have the same provider */
  sameProvider: boolean;

  /** Whether sessions have equivalent permissions */
  equivalentPermissions: boolean;

  /** Overall compatibility score (0-1) */
  compatibilityScore: number;
}

/**
 * Session manager interface for unified session operations
 */
export interface SessionManager {
  /**
   * Create a new session
   */
  createSession(params: CreateSessionParams): Promise<SessionState>;

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionState | null;

  /**
   * Get active session
   */
  getActiveSession(): SessionState | null;

  /**
   * Get all sessions for a wallet
   */
  getWalletSessions(walletId: string): SessionState[];

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: SessionStatus): void;

  /**
   * Switch chain within a session (creates new session if needed)
   */
  switchChain(sessionId: string, chain: SupportedChain): Promise<SessionState>;

  /**
   * Switch active account within a session
   */
  switchAccount(sessionId: string, accountAddress: string): Promise<SessionState>;

  /**
   * Discover additional accounts for a session
   */
  discoverAccounts(sessionId: string, options?: AccountDiscoveryOptions): Promise<AccountInfo[]>;

  /**
   * Add a new account to a session
   */
  addAccount(sessionId: string, account: AccountInfo): Promise<SessionState>;

  /**
   * Remove an account from a session
   */
  removeAccount(sessionId: string, accountAddress: string): Promise<SessionState>;

  /**
   * Get all accounts for a session
   */
  getSessionAccounts(sessionId: string): AccountInfo[];

  /**
   * Get active account for a session
   */
  getActiveAccount(sessionId: string): AccountInfo | null;

  /**
   * End a session
   */
  endSession(sessionId: string): Promise<void>;

  /**
   * Compare two sessions
   */
  compareSessions(sessionId1: string, sessionId2: string): SessionComparison | null;

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): Promise<void>;
}

/**
 * Account discovery options for multi-account wallets
 */
export interface AccountDiscoveryOptions {
  /** Maximum number of accounts to discover */
  limit?: number;

  /** Starting index for account discovery */
  startIndex?: number;

  /** Whether to include account balances */
  includeBalances?: boolean;

  /** Whether to force refresh even for known accounts */
  forceRefresh?: boolean;

  /** Derivation path template (for HD wallets) */
  derivationPathTemplate?: string;

  /** Gap limit for HD wallet discovery */
  gapLimit?: number;
}

/**
 * Parameters for creating a new session
 */
export interface CreateSessionParams {
  /** Wallet ID */
  walletId: string;

  /** Connected accounts with full information */
  accounts: AccountInfo[];

  /** Active account index (defaults to 0) */
  activeAccountIndex?: number;

  /** Chain information */
  chain: ChainSessionInfo;

  /** Provider instance */
  provider: BlockchainProvider;

  /** Provider metadata */
  providerMetadata: {
    type: string;
    version: string;
    multiChainCapable: boolean;
    supportedMethods: string[];
  };

  /** Initial permissions */
  permissions: SessionPermissions;

  /** Session metadata */
  metadata: Omit<SessionStateMetadata, 'chainSwitches'>;

  /** Optional wallet session context */
  walletSessionContext?: Omit<WalletSessionContext, 'walletMetadata'>;

  /** Optional account management context */
  accountContext?: Partial<AccountManagementContext>;

  /** Optional session expiration */
  expiresAt?: number;

  /** Optional session ID (for reconnection) */
  sessionId?: string;
}

/**
 * Account information for multi-account support
 */
export interface AccountInfo {
  /** Account address */
  address: string;

  /** Human-readable account name/label */
  name?: string;

  /** Account balance (if available) */
  balance?: {
    value: string;
    formatted: string;
    symbol: string;
    decimals: number;
  };

  /** Account derivation path (for HD wallets) */
  derivationPath?: string;

  /** Account index in wallet */
  index?: number;

  /** Whether this account is the default/primary account */
  isDefault?: boolean;

  /** Whether this account is currently active */
  isActive?: boolean;

  /** Account metadata */
  metadata?: {
    /** When this account was first discovered */
    discoveredAt: number;
    /** When this account was last used */
    lastUsedAt: number;
    /** Number of transactions from this account */
    transactionCount?: number;
    /** Account type (e.g., 'standard', 'multisig', 'contract') */
    accountType?: string;
  };
}

/**
 * Account management context for multi-account sessions
 */
export interface AccountManagementContext {
  /** Total number of available accounts */
  totalAccounts: number;

  /** Currently selected account index */
  activeAccountIndex: number;

  /** Account selection history */
  selectionHistory: AccountSelectionRecord[];

  /** Account discovery settings */
  discoverySettings: {
    /** Maximum number of accounts to discover */
    maxAccounts?: number;
    /** Whether to automatically discover new accounts */
    autoDiscover?: boolean;
    /** Discovery gap limit (for HD wallets) */
    gapLimit?: number;
  };

  /** Account access permissions */
  accountPermissions: {
    /** Whether the user can switch between accounts */
    canSwitchAccounts: boolean;
    /** Whether the user can add new accounts */
    canAddAccounts: boolean;
    /** Allowed account indices (if restricted) */
    allowedAccountIndices?: number[];
  };
}

/**
 * Account selection record for tracking account switches
 */
export interface AccountSelectionRecord {
  /** Unique identifier for this selection */
  selectionId: string;

  /** Previous account (null for initial selection) */
  fromAccount: AccountInfo | null;

  /** New account */
  toAccount: AccountInfo;

  /** When the selection occurred */
  timestamp: number;

  /** Why the selection occurred */
  reason: 'user_request' | 'dapp_request' | 'auto_switch' | 'default';

  /** Whether the selection was successful */
  successful: boolean;

  /** Error if selection failed */
  error?: string;
}

/**
 * Session event types
 */
export interface SessionEventMap {
  'session:created': { session: SessionState };
  'session:updated': { session: SessionState; changes: Partial<SessionState> };
  'session:status-changed': { sessionId: string; status: SessionStatus; previousStatus: SessionStatus };
  'session:chain-switched': { sessionId: string; switchRecord: ChainSwitchRecord };
  'session:account-switched': { sessionId: string; selectionRecord: AccountSelectionRecord };
  'session:accounts-discovered': { sessionId: string; accounts: AccountInfo[] };
  'session:ended': { sessionId: string; reason: string };
  'session:expired': { sessionId: string; expiresAt: number };
  'session:error': { sessionId: string; error: Error };
}

/**
 * Discriminated union for session states based on status
 */
export type DiscriminatedSessionState =
  | (SessionState & { status: 'initializing'; provider: { instance: null } })
  | (SessionState & { status: 'connecting'; accounts: []; activeAccount: null })
  | (SessionState & { status: 'connected'; accounts: AccountInfo[]; activeAccount: AccountInfo })
  | (SessionState & { status: 'switching'; accounts: AccountInfo[]; activeAccount: AccountInfo })
  | (SessionState & { status: 'disconnecting'; accounts: AccountInfo[]; activeAccount: AccountInfo })
  | (SessionState & { status: 'disconnected'; provider: { instance: null } })
  | (SessionState & { status: 'error'; accounts: AccountInfo[]; activeAccount: AccountInfo });

/**
 * Helper types for type-safe session operations
 */
export type ActiveSession = Extract<DiscriminatedSessionState, { status: 'connected' }>;
export type InactiveSession = Extract<DiscriminatedSessionState, { status: 'disconnected' | 'error' }>;
export type TransitionalSession = Extract<
  DiscriminatedSessionState,
  { status: 'connecting' | 'switching' | 'disconnecting' }
>;

/**
 * Session builder interface for creating sessions with fluent API
 */
export interface SessionBuilder {
  /** Set wallet ID */
  withWallet(walletId: string): SessionBuilder;

  /** Set addresses */
  withAddresses(addresses: string[]): SessionBuilder;

  /** Set chain information */
  withChain(chain: ChainSessionInfo): SessionBuilder;

  /** Set provider */
  withProvider(
    provider: BlockchainProvider,
    metadata: {
      type: string;
      version: string;
      multiChainCapable: boolean;
      supportedMethods: string[];
    },
  ): SessionBuilder;

  /** Set permissions */
  withPermissions(permissions: SessionPermissions): SessionBuilder;

  /** Set metadata */
  withMetadata(metadata: SessionStateMetadata): SessionBuilder;

  /** Set expiration */
  withExpiration(expiresAt: number): SessionBuilder;

  /** Build the session */
  build(): Promise<SessionState>;
}
