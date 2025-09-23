/**
 * Session management service for WalletMesh
 *
 * Handles session lifecycle, validation, and account management.
 * Uses the unified store as the single source of truth for session state.
 *
 * @module services/session/SessionService
 * @category Services
 */

import type { StoreApi } from 'zustand';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import type {
  CreateSessionParams,
  SessionState,
  SessionStateMetadata,
} from '../../api/types/sessionState.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import { connectionActions } from '../../state/actions/connections.js';
import type { WalletMeshState } from '../../state/store.js';
import type { WalletInfo } from '../../types.js';
import type { ChainType } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';

/**
 * Session information
 */
export interface SessionInfo {
  /** Unique session identifier */
  id: string;
  /** Wallet ID associated with the session */
  walletId: string;
  /** Connection status */
  status: ConnectionStatus;
  /** Connected account address */
  account?: string;
  /** Connected chain ID */
  chainId?: string;
  /** Session creation timestamp */
  createdAt: number;
  /** Last activity timestamp */
  lastActivityAt: number;
  /** Session metadata */
  metadata?: SessionMetadata;
}

/**
 * Session metadata for internal use
 */
export interface SessionMetadata {
  /** Session name (user-defined) */
  name?: string;
  /** Session tags */
  tags?: string[];
  /** Custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Session creation context
 */
export interface SessionCreationContext {
  /** Wallet information */
  wallet: WalletInfo;
  /** Account address */
  account: string;
  /** Chain ID */
  chainId?: string;
  /** Session metadata */
  metadata?: SessionStateMetadata;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  /** Whether the session is valid */
  valid: boolean;
  /** Validation error if invalid */
  error?: string;
  /** Suggested action if invalid */
  suggestedAction?: 'reconnect' | 'refresh' | 'switch_account';
}

/**
 * Account display information
 */
export interface AccountDisplayInfo {
  /** Full account address */
  address: string;
  /** Formatted address for display */
  displayAddress: string;
  /** Account name (if available) */
  name?: string;
  /** ENS/domain name (if available) */
  ensName?: string;
  /** Avatar URL (if available) */
  avatar?: string;
}

/**
 * Address format options
 */
export type AddressFormat = 'short' | 'medium' | 'long' | 'full';

/**
 * Session service dependencies
 */
export interface SessionServiceDependencies extends BaseServiceDependencies {
  logger: Logger;
  store: StoreApi<WalletMeshState>;
}

/**
 * Session management service
 *
 * Handles session lifecycle, validation, and account management.
 * Uses the store as the single source of truth.
 */
export class SessionService {
  private logger: Logger;
  private store: StoreApi<WalletMeshState>;

  constructor(dependencies: SessionServiceDependencies) {
    this.logger = dependencies.logger;
    this.store = dependencies.store;
  }

  /**
   * Create a new session
   */
  async createSession(
    context: SessionCreationContext,
    metadata: SessionMetadata = {},
  ): Promise<SessionInfo | null> {
    if (!this.validateSessionContext(context)) {
      this.logger.error('Invalid session context');
      return null;
    }

    try {
      // Create session params for the store action
      const sessionParams: CreateSessionParams = {
        walletId: context.wallet.id,
        chain: {
          chainId: context.chainId || '1',
          chainType: (context.wallet.chains?.[0] || 'evm') as ChainType,
          name: 'Ethereum',
          required: false,
        },
        accounts: context.account ? [{ address: context.account }] : [],
        provider: {} as BlockchainProvider, // Will be set by actual provider integration
        metadata: {
          wallet: {
            name: context.wallet.name,
            icon: context.wallet.icon || '',
          },
          dapp: {
            name: '',
            url: '',
          },
          connection: {
            method: 'manual' as const,
            initiatedBy: 'user' as const,
          },
          // Note: SessionMetadata from sessionState doesn't have custom field
        },
        providerMetadata: {
          // Add default provider metadata
          type: 'unknown',
          version: '1.0.0',
          multiChainCapable: false,
          supportedMethods: ['eth_accounts', 'eth_chainId'],
        },
        permissions: {
          // Add default permissions
          methods: ['eth_accounts', 'eth_chainId'],
          events: [],
          autoSign: false,
        },
      };

      // Create session in the store
      const sessionState = await connectionActions.createSession(this.store, sessionParams);

      // Convert to SessionInfo format
      const session: SessionInfo = {
        id: sessionState.sessionId,
        walletId: sessionState.walletId,
        status: this.mapSessionStatus(sessionState.status),
        account: sessionState.activeAccount?.address,
        ...(sessionState.chain.chainId && { chainId: sessionState.chain.chainId }),
        createdAt: sessionState.lifecycle.createdAt,
        lastActivityAt: sessionState.lifecycle.lastActiveAt,
        metadata: {
          ...metadata,
          custom: {
            ...metadata?.custom,
            walletName: context.wallet.name,
          },
        },
      };

      this.logger.info('Session created', { sessionId: session.id, walletId: context.wallet.id });
      return session;
    } catch (error) {
      this.logger.error('Failed to create session', error);
      return null;
    }
  }

  /**
   * Map session status from store to ConnectionStatus
   */
  private mapSessionStatus(status: SessionState['status']): ConnectionStatus {
    switch (status) {
      case 'connected':
        return ConnectionStatus.Connected;
      case 'connecting':
        return ConnectionStatus.Connecting;
      case 'disconnected':
        return ConnectionStatus.Disconnected;
      // Note: SessionStatus doesn't have 'reconnecting', map to Connecting
      // case 'reconnecting':
      //   return ConnectionStatus.Reconnecting;
      case 'error':
        return ConnectionStatus.Error;
      default:
        return ConnectionStatus.Disconnected;
    }
  }

  /**
   * Validate session context
   */
  private validateSessionContext(context: SessionCreationContext): boolean {
    if (!context.wallet || !context.wallet.id) {
      this.logger.error('Invalid wallet in session context');
      return false;
    }

    if (!context.account) {
      this.logger.error('No account in session context');
      return false;
    }

    return true;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionInfo | null {
    const state = this.store.getState();
    const sessionState = state.entities.sessions[sessionId];

    if (!sessionState) {
      return null;
    }

    return this.sessionStateToInfo(sessionState);
  }

  /**
   * Convert SessionState to SessionInfo
   */
  private sessionStateToInfo(sessionState: SessionState): SessionInfo {
    return {
      id: sessionState.sessionId,
      walletId: sessionState.walletId,
      status: this.mapSessionStatus(sessionState.status),
      account: sessionState.activeAccount?.address,
      ...(sessionState.chain.chainId && { chainId: sessionState.chain.chainId }),
      createdAt: sessionState.lifecycle.createdAt,
      lastActivityAt: sessionState.lifecycle.lastActiveAt,
      // SessionMetadata from sessionState doesn't have custom field
      // Return empty simple metadata
      metadata: {},
    };
  }

  /**
   * Get active session
   */
  getActiveSession(): SessionInfo | null {
    const state = this.store.getState();
    const activeSessionId = state.active.sessionId;

    if (!activeSessionId) {
      return null;
    }

    return this.getSession(activeSessionId);
  }

  /**
   * Set active session
   */
  setActiveSession(sessionId: string): boolean {
    const state = this.store.getState();
    const sessionState = state.entities.sessions[sessionId];

    if (!sessionState) {
      this.logger.error('Session not found', { sessionId });
      return false;
    }

    // Update active session in store
    this.store.setState({
      active: {
        ...this.store.getState().active,
        sessionId,
      },
      entities: {
        ...this.store.getState().entities,
        sessions: {
          ...this.store.getState().entities.sessions,
          [sessionId]: {
            ...sessionState,
            lifecycle: {
              ...sessionState.lifecycle,
              lastActiveAt: Date.now(),
            },
          },
        },
      },
    });

    return true;
  }

  /**
   * Update session
   */
  updateSession(sessionId: string, updates: Partial<SessionInfo>): boolean {
    const state = this.store.getState();
    const sessionState = state.entities.sessions[sessionId];

    if (!sessionState) {
      this.logger.error('Session not found for update', { sessionId });
      return false;
    }

    // Update session in store
    this.store.setState((state) => {
      const session = state.entities.sessions[sessionId];
      if (!session) {
        return state;
      }

      const updatedSession = { ...session };

      // Update status if provided
      if (updates.status !== undefined) {
        updatedSession.status = this.mapStatusToSessionState(updates.status);
      }

      // Update account if provided
      if (updates.account !== undefined) {
        updatedSession.activeAccount = { address: updates.account };
      }

      // Update chain if provided
      if (updates.chainId !== undefined) {
        updatedSession.chain = {
          ...updatedSession.chain,
          chainId: updates.chainId,
        };
      }

      // Update metadata if provided - SessionMetadata doesn't have custom field
      // Skip metadata update for now

      // Always update last activity
      updatedSession.lifecycle = {
        ...updatedSession.lifecycle,
        lastActiveAt: Date.now(),
      };

      return {
        ...state,
        entities: {
          ...state.entities,
          sessions: {
            ...state.entities.sessions,
            [sessionId]: updatedSession,
          },
        },
      };
    });

    this.logger.debug('Session updated', { sessionId, updates });
    return true;
  }

  /**
   * Map ConnectionStatus to session state status
   */
  private mapStatusToSessionState(status: ConnectionStatus): SessionState['status'] {
    switch (status) {
      case ConnectionStatus.Connected:
        return 'connected';
      case ConnectionStatus.Connecting:
        return 'connecting';
      case ConnectionStatus.Disconnected:
        return 'disconnected';
      case ConnectionStatus.Reconnecting:
        // Note: SessionStatus doesn't have 'reconnecting', map to 'connecting'
        return 'connecting';
      case ConnectionStatus.Error:
        return 'error';
      default:
        return 'disconnected';
    }
  }

  /**
   * Validate session
   */
  validateSession(session: SessionInfo, maxInactivityMs = 30 * 60 * 1000): SessionValidationResult {
    // Check if session exists
    if (!session || !session.id) {
      return {
        valid: false,
        error: 'Invalid session',
        suggestedAction: 'reconnect',
      };
    }

    // Check connection status
    if (session.status !== ConnectionStatus.Connected) {
      return {
        valid: false,
        error: 'Session not connected',
        suggestedAction: 'reconnect',
      };
    }

    // Check for account
    if (!session.account) {
      return {
        valid: false,
        error: 'No account in session',
        suggestedAction: 'switch_account',
      };
    }

    // Check inactivity
    const inactivityMs = Date.now() - session.lastActivityAt;
    if (inactivityMs > maxInactivityMs) {
      return {
        valid: false,
        error: 'Session inactive',
        suggestedAction: 'refresh',
      };
    }

    return { valid: true };
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    const state = this.store.getState();
    const exists = !!state.entities.sessions[sessionId];

    if (!exists) {
      return false;
    }

    // Delete session from store
    this.store.setState((state) => {
      const newSessions = { ...state.entities.sessions };
      delete newSessions[sessionId];

      return {
        ...state,
        entities: {
          ...state.entities,
          sessions: newSessions,
        },
        active: {
          ...state.active,
          sessionId: state.active.sessionId === sessionId ? null : state.active.sessionId,
        },
      };
    });

    this.logger.info('Session deleted', { sessionId });
    return true;
  }

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    this.store.setState((state) => ({
      ...state,
      entities: {
        ...state.entities,
        sessions: {},
      },
      active: {
        ...state.active,
        sessionId: null,
      },
    }));

    this.logger.info('All sessions cleared');
  }

  /**
   * Get all sessions
   */
  getAllSessions(): SessionInfo[] {
    const state = this.store.getState();
    return Object.values(state.entities.sessions).map((session) => this.sessionStateToInfo(session));
  }

  /**
   * Get sessions by wallet ID
   */
  getSessionsByWallet(walletId: string): SessionInfo[] {
    const state = this.store.getState();
    return Object.values(state.entities.sessions)
      .filter((session) => session.walletId === walletId)
      .map((session) => this.sessionStateToInfo(session));
  }

  /**
   * Format address for display
   */
  formatAddress(address: string, format: AddressFormat = 'short'): string {
    if (!address) return '';

    switch (format) {
      case 'short':
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      case 'medium':
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
      case 'long':
        return `${address.slice(0, 14)}...${address.slice(-12)}`;
      default:
        return address;
    }
  }

  /**
   * Get account display information
   */
  getAccountDisplayInfo(session: SessionInfo): AccountDisplayInfo | null {
    if (!session || !session.account) {
      return null;
    }

    return {
      address: session.account,
      displayAddress: this.formatAddress(session.account),
      ...(session.metadata?.name !== undefined && { name: session.metadata.name }),
      // ENS and avatar would be fetched from chain-specific services
    };
  }

  /**
   * Check if session is valid and connected
   */
  isValidConnectedSession(session: SessionInfo | null): boolean {
    if (!session) return false;

    const validation = this.validateSession(session);
    return validation.valid && session.status === ConnectionStatus.Connected;
  }

  /**
   * Update session activity timestamp
   */
  touchSession(sessionId: string): void {
    this.store.setState((state) => {
      const session = state.entities.sessions[sessionId];
      if (!session) {
        return state;
      }

      return {
        ...state,
        entities: {
          ...state.entities,
          sessions: {
            ...state.entities.sessions,
            [sessionId]: {
              ...session,
              lifecycle: {
                ...session.lifecycle,
                lastActiveAt: Date.now(),
              },
            },
          },
        },
      };
    });
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    inactiveSessions: number;
    connectedSessions: number;
  } {
    const sessions = this.getAllSessions();
    const now = Date.now();
    const maxInactivityMs = 30 * 60 * 1000; // 30 minutes

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => now - s.lastActivityAt < maxInactivityMs).length,
      inactiveSessions: sessions.filter((s) => now - s.lastActivityAt >= maxInactivityMs).length,
      connectedSessions: sessions.filter((s) => s.status === ConnectionStatus.Connected).length,
    };
  }
}
