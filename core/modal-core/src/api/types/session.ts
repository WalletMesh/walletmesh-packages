/**
 * Immutable session types for wallet connections
 *
 * A session represents a specific connection state between a dApp and wallet
 * at a point in time. Each chain switch creates a new session.
 */

import type { ChainType, SupportedChain } from '../../core/types.js';

/**
 * Immutable session representing a wallet connection at a specific chain
 */
export interface WalletConnectionSession {
  /** Unique session identifier */
  sessionId: string;

  /** Wallet that created this session */
  walletId: string;

  /** User addresses available in this session */
  addresses: string[];

  /** Primary address (first address) */
  primaryAddress: string;

  /** Chain this session is connected to */
  chain: SupportedChain;

  /** Type of blockchain */
  chainType: ChainType;

  /** Provider instance for this session */
  provider: unknown;

  /** Provider type identifier (e.g., 'eip1193', 'solana-standard') */
  providerType: string;

  /** Permissions granted in this session */
  permissions: SessionPermissions;

  /** Session metadata */
  metadata: ImmutableSessionMetadata;

  /** Session lifecycle timestamps */
  timestamps: {
    createdAt: number;
    lastActiveAt: number;
  };

  /** Previous session ID if this was created from chain switch */
  previousSessionId?: string;
}

/**
 * Permissions granted in a session
 */
export interface SessionPermissions {
  /** Methods the dApp is allowed to call */
  methods: string[];

  /** Events the dApp can subscribe to */
  events: string[];

  /** Custom permissions defined by wallet */
  custom?: Record<string, unknown>;
}

/**
 * Immutable session metadata for wallet connections
 * This interface is used for immutable session types and differs from the user-defined SessionMetadata
 */
export interface ImmutableSessionMetadata {
  /** Wallet display name */
  walletName: string;

  /** Wallet icon */
  walletIcon: string;

  /** dApp info at time of connection */
  dappInfo: {
    name: string;
    url?: string;
    icon?: string;
  };

  /** User agent at connection time */
  userAgent?: string;
}

/**
 * Session comparison result
 */
export interface SessionComparison {
  /** Whether the sessions are for the same wallet */
  sameWallet: boolean;

  /** Whether the addresses are the same */
  sameAddresses: boolean;

  /** Whether the chain is the same */
  sameChain: boolean;

  /** Whether the provider type is the same */
  sameProviderType: boolean;

  /** Whether permissions are equivalent */
  samePermissions: boolean;
}

/**
 * Session manager interface
 */
export interface SessionManager {
  /**
   * Create a new session
   */
  createSession(params: Omit<WalletConnectionSession, 'sessionId' | 'timestamps'>): WalletConnectionSession;

  /**
   * Get session by ID
   */
  getSession(sessionId: string): WalletConnectionSession | null;

  /**
   * Get current active session
   */
  getActiveSession(): WalletConnectionSession | null;

  /**
   * Set active session
   */
  setActiveSession(sessionId: string): void;

  /**
   * Get all sessions for a wallet
   */
  getWalletSessions(walletId: string): WalletConnectionSession[];

  /**
   * Get session history (ordered by creation time)
   */
  getSessionHistory(): WalletConnectionSession[];

  /**
   * Compare two sessions
   */
  compareSessions(sessionId1: string, sessionId2: string): SessionComparison | null;

  /**
   * End a session
   */
  endSession(sessionId: string): void;

  /**
   * Clear all sessions
   */
  clearSessions(): void;
}
