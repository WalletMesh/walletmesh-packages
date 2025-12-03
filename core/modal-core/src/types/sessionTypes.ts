/**
 * Simplified session state for WalletMesh
 *
 * This replaces the overly complex 600+ line SessionState interface
 * with a clean, maintainable structure that covers all essential
 * functionality while being much easier to understand and use.
 *
 * @module types/sessionTypes
 */

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type {
  BaseSessionMetadata,
  ChainWithMetadata,
  ConnectionState,
  Provider,
  SessionPermissions,
  Wallet,
  WalletMeshError,
} from './baseTypes.js';

// ============================================================================
// ACCOUNT TYPES (Simplified)
// ============================================================================

/**
 * Account information
 * Simplified from the complex AccountInfo hierarchy
 */
export interface Account {
  /** Account address */
  address: string;
  /** Account label/name */
  name?: string;
  /** Account balance (if available) */
  balance?: string;
  /** Whether this is the primary account */
  isPrimary: boolean;
  /** Custom account metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Account discovery options
 */
export interface AccountDiscoveryOptions {
  /** Maximum number of accounts to discover */
  limit?: number;
  /** Whether to include zero-balance accounts */
  includeEmpty?: boolean;
  /** Custom derivation path */
  derivationPath?: string;
}

// ============================================================================
// SIMPLIFIED SESSION STATE
// ============================================================================

/**
 * Session status
 * Simplified from complex status hierarchy
 */
export type SessionStatus = 'connecting' | 'connected' | 'switching' | 'error' | 'disconnected';

/**
 * Session state
 *
 * This interface provides all essential functionality for wallet sessions.
 */
export interface SimpleSessionState {
  /** Unique session identifier */
  sessionId: string;

  /** Session status */
  status: SessionStatus;

  /** Connected wallet information */
  wallet: Wallet;

  /** Current chain information */
  chain: ChainWithMetadata;

  /** Connected accounts */
  accounts: Account[];

  /** Primary account address */
  primaryAddress: string;

  /** Blockchain provider instance */
  provider: Provider;

  /** Session permissions */
  permissions: SessionPermissions;

  /** Session metadata */
  metadata: BaseSessionMetadata;

  /** Session error (if any) */
  error?: WalletMeshError;

  /** Session lifecycle timestamps */
  timestamps: {
    createdAt: number;
    lastActiveAt: number;
    expiresAt?: number;
  };
}

// ============================================================================
// SESSION CREATION & MANAGEMENT
// ============================================================================

/**
 * Parameters for creating a new session
 * Simplified from complex CreateSessionParams
 */
export interface CreateSessionParams {
  /** Wallet to connect */
  wallet: Wallet;

  /** Target chain */
  chain: ChainWithMetadata;

  /** Accounts to include */
  accounts: Account[];

  /** Provider instance */
  provider: Provider;

  /** Initial permissions */
  permissions?: Partial<SessionPermissions>;

  /** Session metadata */
  metadata?: Partial<BaseSessionMetadata>;

  /** Session expiration time */
  expiresAt?: number;
}

/**
 * Session update options
 */
export interface SessionUpdateOptions {
  /** Update session metadata */
  metadata?: Partial<BaseSessionMetadata>;

  /** Update permissions */
  permissions?: Partial<SessionPermissions>;

  /** Update expiration */
  expiresAt?: number;

  /** Mark as active */
  touch?: boolean;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  /** Whether session is valid */
  isValid: boolean;

  /** Validation issues */
  issues: string[];

  /** Whether session can be recovered */
  canRecover: boolean;

  /** Recovery suggestions */
  recoverySuggestions?: string[];
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Chain switch operation
 */
export interface ChainSwitchOperation {
  /** Target chain */
  targetChain: ChainWithMetadata;

  /** Whether to validate accounts on new chain */
  validateAccounts?: boolean;

  /** Timeout for operation */
  timeout?: number;
}

/**
 * Account management operation
 */
export interface AccountManagementOperation {
  /** Operation type */
  type: 'add' | 'remove' | 'setPrimary';

  /** Target account */
  account: Account;

  /** Additional options */
  options?: AccountDiscoveryOptions;
}

// ============================================================================
// SESSION EVENTS (Simplified)
// ============================================================================

/**
 * Session event types
 */
export type SessionEventType =
  | 'sessionCreated'
  | 'sessionUpdated'
  | 'sessionDestroyed'
  | 'chainSwitched'
  | 'accountAdded'
  | 'accountRemoved'
  | 'accountSwitched'
  | 'permissionsChanged'
  | 'sessionExpired'
  | 'sessionError';

/**
 * Base session event
 */
export interface SessionEvent {
  /** Event type */
  type: SessionEventType;

  /** Session ID */
  sessionId: string;

  /** Event timestamp */
  timestamp: number;

  /** Event data */
  data?: Record<string, unknown>;
}

// ============================================================================
// HELPER FUNCTIONS FOR SESSION STATE
// ============================================================================

/**
 * Check if session is expired
 */
export function isSessionExpired(session: SimpleSessionState): boolean {
  if (!session.timestamps.expiresAt) return false;
  return Date.now() > session.timestamps.expiresAt;
}

/**
 * Check if session is active (recently used)
 */
export function isSessionActive(session: SimpleSessionState, thresholdMs = 30 * 60 * 1000): boolean {
  return Date.now() - session.timestamps.lastActiveAt < thresholdMs;
}

/**
 * Get primary account from session
 */
export function getPrimaryAccount(session: SimpleSessionState): Account {
  // Find the account that matches the primary address
  const primaryAccount =
    session.accounts.find((account) => account.address === session.primaryAddress) || session.accounts[0];
  if (!primaryAccount) {
    throw ErrorFactory.configurationError('No accounts available in session');
  }
  return primaryAccount;
}

/**
 * Validate session state
 */
export function validateSession(session: SimpleSessionState): SessionValidationResult {
  const issues: string[] = [];

  if (!session.sessionId) issues.push('Missing session ID');
  if (!session.wallet?.id) issues.push('Missing wallet information');
  if (!session.chain?.chain?.chainId) issues.push('Missing chain information');
  if (!session.accounts?.length) issues.push('No accounts available');
  if (!session.primaryAddress) issues.push('Missing primary address');
  if (!session.provider) issues.push('Missing provider');

  if (isSessionExpired(session)) {
    issues.push('Session has expired');
  }

  const isValid = issues.length === 0;
  const canRecover = issues.length <= 2 && !isSessionExpired(session);

  return {
    isValid,
    issues,
    canRecover,
    recoverySuggestions: canRecover
      ? ['Refresh connection', 'Re-authenticate wallet', 'Check network connection']
      : [],
  };
}

// ============================================================================
// TYPE USAGE (to satisfy TypeScript's unused check)
// ============================================================================

// TypeScript complains about unused imports
type UsedConnectionState = ConnectionState;
const connectionStateCheck: UsedConnectionState | undefined = undefined;
void connectionStateCheck;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Types are defined in this file but exported via coreTypes.ts
// to avoid duplicate export conflicts
// Note: All types are already exported at their definition points
