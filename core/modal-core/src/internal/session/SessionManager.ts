/**
 * Session Manager Implementation
 *
 * This implements the SessionManager interface and provides a bridge
 * between the legacy session implementations and the new SessionState architecture.
 */

import type {
  AccountDiscoveryOptions,
  AccountInfo,
  ChainSwitchRecord,
  CreateSessionParams,
  SessionManager as ISessionManager,
  SessionComparison,
  SessionState,
  SessionStatus,
} from '../../api/types/sessionState.js';
import { ChainType, type SupportedChain } from '../../types.js';
import { getChainName } from '../../utils/chainNameResolver.js';
import { generateId, generateSessionId } from '../../utils/crypto.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { modalLogger } from '../core/logger/globalLogger.js';
import {
  getProviderForSession,
  removeProviderForSession,
  setProviderForSession,
} from './ProviderRegistry.js';

/**
 * Session manager that consolidates multiple session patterns
 */
export class SessionManager implements ISessionManager {
  private sessions = new Map<string, SessionState>();
  private activeSessionId: string | null = null;
  private sessionsByWallet = new Map<string, Set<string>>();

  /**
   * Create a new session
   */
  async createSession(params: CreateSessionParams): Promise<SessionState> {
    // Validate required parameters
    if (!params.walletId) {
      throw ErrorFactory.configurationError('Invalid session parameters: walletId is required');
    }
    if (!params.chain || !params.chain.chainId) {
      throw ErrorFactory.configurationError('Invalid session parameters: chain.chainId is required');
    }

    // Use provided session ID or generate a new one
    const sessionId = params.sessionId || this.generateSessionId(params.walletId, params.chain.chainId);

    // Get provider from params or registry
    const provider = params.provider || getProviderForSession(sessionId);
    if (!provider) {
      throw ErrorFactory.configurationError(
        'Provider must be either passed in params or stored in ProviderRegistry before calling createSession',
        { sessionId },
      );
    }

    // Store provider in registry (NOT in state, to avoid cross-origin errors)
    setProviderForSession(sessionId, provider);

    // Create session provider wrapper (instance is null - stored in registry)
    const sessionProvider = {
      instance: null, // Provider stored in ProviderRegistry, not state
      type: params.providerMetadata.type,
      version: params.providerMetadata.version,
      multiChainCapable: params.providerMetadata.multiChainCapable,
      supportedMethods: params.providerMetadata.supportedMethods,
    };

    // Create session lifecycle
    const now = Date.now();
    const lifecycle = {
      createdAt: now,
      lastActiveAt: now,
      lastAccessedAt: now,
      ...(params.expiresAt && { expiresAt: params.expiresAt }),
      operationCount: 0,
      activeTime: 0,
    };

    // Create accounts from provided account info
    const accounts: AccountInfo[] = params.accounts || [];

    // Determine active account
    const activeAccountIndex = params.activeAccountIndex ?? 0;
    const activeAccount = accounts[activeAccountIndex] || accounts[0];

    if (!activeAccount) {
      throw ErrorFactory.configurationError('No valid account found for session', {
        accounts: params.accounts,
        activeAccountIndex,
      });
    }

    // Create account context
    const accountContext = {
      totalAccounts: accounts.length,
      activeAccountIndex: accounts.findIndex((acc) => acc.address === activeAccount.address),
      selectionHistory: [],
      discoverySettings: {
        maxAccounts: 10,
        autoDiscover: true,
        gapLimit: 20,
        ...(params.accountContext?.discoverySettings || {}),
      },
      accountPermissions: {
        canSwitchAccounts: true,
        canAddAccounts: true,
        ...(params.accountContext?.accountPermissions || {}),
      },
    };

    // Create the session state
    const session: SessionState = {
      sessionId,
      walletId: params.walletId,
      status: 'connected' as SessionStatus,
      accounts,
      activeAccount,
      chain: params.chain,
      provider: sessionProvider,
      permissions: params.permissions,
      metadata: {
        ...params.metadata,
        chainSwitches: [], // Initialize empty chain switch history
      },
      lifecycle,
      accountContext,
      ...(params.walletSessionContext && {
        walletSession: {
          ...params.walletSessionContext,
          walletMetadata: {
            totalSessions: 1,
            totalChainSwitches: 0,
            createdAt: now,
            lastActiveAt: now,
          },
        },
      }),
      // Include adapter reconstruction data if provided
      ...(params.adapterReconstruction && {
        adapterReconstruction: params.adapterReconstruction,
      }),
    };

    // Store the session
    this.sessions.set(sessionId, session);

    // Update wallet index
    if (!this.sessionsByWallet.has(params.walletId)) {
      this.sessionsByWallet.set(params.walletId, new Set());
    }
    this.sessionsByWallet.get(params.walletId)?.add(sessionId);

    // Set as active if first session
    if (!this.activeSessionId) {
      this.activeSessionId = sessionId;
    }

    // Session created successfully

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Update last accessed time
      session.lifecycle.lastAccessedAt = Date.now();
    }
    return session || null;
  }

  /**
   * Get active session
   */
  getActiveSession(): SessionState | null {
    if (!this.activeSessionId) {
      return null;
    }
    return this.getSession(this.activeSessionId);
  }

  /**
   * Get all sessions for a wallet
   */
  getWalletSessions(walletId: string): SessionState[] {
    const sessionIds = this.sessionsByWallet.get(walletId);
    if (!sessionIds) {
      return [];
    }

    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((session): session is SessionState => session !== undefined)
      .sort((a, b) => b.lifecycle.lastActiveAt - a.lifecycle.lastActiveAt);
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: SessionStatus): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    // Update our internal copy
    session.status = status;
    session.lifecycle.lastActiveAt = Date.now();

    // Status changed successfully

    // If session becomes inactive, remove from active
    if (status === 'disconnected' || status === 'error') {
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = null;
        // Try to set another session as active
        const walletSessions = this.getWalletSessions(session.walletId);
        const activeSession = walletSessions.find((s) => s.status === 'connected');
        if (activeSession) {
          this.activeSessionId = activeSession.sessionId;
        }
      }
    }
  }

  /**
   * Switch chain within a session (creates new session if needed)
   */
  async switchChain(sessionId: string, chain: SupportedChain): Promise<SessionState> {
    const currentSession = this.sessions.get(sessionId);
    if (!currentSession) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    // Check if we're already on the requested chain
    if (currentSession.chain.chainId === chain.chainId) {
      modalLogger.debug('Already on requested chain, no switch needed', {
        chainId: chain.chainId,
        sessionId,
      });
      return currentSession;
    }

    // Determine the chain type for the new chain
    const newChainType = chain.chainType;

    // Check if we already have a session for this chain
    const walletSessions = this.getWalletSessions(currentSession.walletId);
    const existingSession = walletSessions.find((s) => s.chain.chainId === chain.chainId);

    if (existingSession && existingSession.status === 'connected') {
      // Reuse existing session - create a copy to avoid modifying frozen object
      const updatedSession = { ...existingSession };
      updatedSession.lifecycle = { ...existingSession.lifecycle, lastActiveAt: Date.now() };

      // Update our internal state
      this.sessions.set(existingSession.sessionId, updatedSession);
      this.activeSessionId = existingSession.sessionId;

      // Record chain switch
      this.recordChainSwitch(currentSession, updatedSession);

      return updatedSession;
    }

    // For the same provider type, we can update the current session
    if (currentSession.chain.chainType === newChainType && currentSession.provider.multiChainCapable) {
      // Get provider from registry (NOT from state, to avoid cross-origin errors)
      const provider = getProviderForSession(currentSession.sessionId);

      // Check if the provider supports chain switching
      if (provider && typeof provider === 'object' && 'request' in provider) {
        try {
          // For EVM providers, use wallet_switchEthereumChain
          if (newChainType === ChainType.Evm) {
            const evmProvider = provider as {
              request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
            };
            await evmProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chain.chainId }],
            });
          }

          // Create an updated session with new chain information
          const previousChain = { ...currentSession.chain };
          const updatedSession = {
            ...currentSession,
            chain: {
              chainId: chain.chainId,
              chainType: newChainType,
              name: chain.name,
              required: chain.required,
            },
            lifecycle: {
              ...currentSession.lifecycle,
              lastActiveAt: Date.now(),
            },
            metadata: {
              ...currentSession.metadata,
              chainSwitches: [...(currentSession.metadata.chainSwitches || [])],
            },
          };

          // Record chain switch in metadata
          const switchRecord: ChainSwitchRecord = {
            switchId: generateId({ prefix: 'switch', timestamp: true }),
            fromChain: previousChain,
            toChain: updatedSession.chain,
            timestamp: Date.now(),
            reason: 'user_request',
            successful: true,
          };

          updatedSession.metadata.chainSwitches.push(switchRecord);

          // Update our internal state
          this.sessions.set(sessionId, updatedSession);

          return updatedSession;
        } catch (error) {
          throw ErrorFactory.connectionFailed(
            `Failed to switch to chain ${chain.chainId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { chainId: chain.chainId, sessionId, error },
          );
        }
      }
    }

    // If we can't switch the existing provider, create a new session
    // For now, we'll create a simplified new session with the same provider instance
    // but different chain metadata (this is a simplified implementation)
    const newSessionId = this.generateSessionId(currentSession.walletId, chain.chainId);

    const newSession: SessionState = {
      sessionId: newSessionId,
      walletId: currentSession.walletId,
      status: currentSession.status,
      accounts: [...(currentSession.accounts || [])],
      activeAccount: currentSession.activeAccount
        ? { ...currentSession.activeAccount }
        : currentSession.activeAccount,
      chain: {
        ...chain,
        chainType: newChainType,
        name: chain.name || getChainName(chain.chainId),
      },
      provider: {
        ...currentSession.provider,
        // Provider instance is stored in ProviderRegistry, not in state
        instance: null,
      },
      permissions: { ...currentSession.permissions },
      metadata: {
        ...currentSession.metadata,
        chainSwitches: [], // Start fresh for new session
      },
      lifecycle: {
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        lastAccessedAt: Date.now(),
        operationCount: 0,
        activeTime: 0,
        ...(currentSession.lifecycle.expiresAt && { expiresAt: currentSession.lifecycle.expiresAt }),
      },
      ...(currentSession.walletSession && {
        walletSession: { ...currentSession.walletSession },
      }),
      ...(currentSession.accountContext && {
        accountContext: { ...currentSession.accountContext },
      }),
    };

    // Store the new session
    this.sessions.set(newSessionId, newSession);

    // Update wallet index
    this.sessionsByWallet.get(currentSession.walletId)?.add(newSessionId);

    // Set as active session
    this.activeSessionId = newSessionId;

    // Record chain switch
    this.recordChainSwitch(currentSession, newSession);

    // Mark old session as disconnected if different session
    if (currentSession.sessionId !== newSessionId) {
      // Update the session in our map with disconnected status
      const updatedOldSession = {
        ...currentSession,
        status: 'disconnected' as SessionStatus,
      };
      this.sessions.set(currentSession.sessionId, updatedOldSession);
    }

    return newSession;
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return; // Already removed
    }

    // Create a copy to avoid modifying frozen object
    const updatedSession = {
      ...session,
      status: 'disconnected' as const,
      lifecycle: {
        ...session.lifecycle,
        lastActiveAt: Date.now(),
      },
    };

    // Update our internal state before removal
    this.sessions.set(sessionId, updatedSession);

    // Remove from active if it was active
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    // Remove from wallet index
    const walletSessions = this.sessionsByWallet.get(updatedSession.walletId);
    if (walletSessions) {
      walletSessions.delete(sessionId);
      if (walletSessions.size === 0) {
        this.sessionsByWallet.delete(updatedSession.walletId);
      }
    }

    // Clean up provider if needed
    try {
      // Get provider from registry (NOT from state, to avoid cross-origin errors)
      const provider = getProviderForSession(sessionId);
      if (provider && 'disconnect' in provider) {
        await (provider as { disconnect: () => Promise<void> }).disconnect();
      }
      // Remove provider from registry after disconnection
      removeProviderForSession(sessionId);
    } catch (error) {
      // Log but don't throw - session cleanup should be resilient
      modalLogger.warn('Error disconnecting provider during session cleanup', error);
    }

    // Remove from storage
    this.sessions.delete(sessionId);
  }

  /**
   * Compare two sessions
   */
  compareSessions(sessionId1: string, sessionId2: string): SessionComparison | null {
    const session1 = this.sessions.get(sessionId1);
    const session2 = this.sessions.get(sessionId2);

    if (!session1 || !session2) {
      return null;
    }

    const sameWallet = session1.walletId === session2.walletId;
    const sameAddresses = this.arraysEqual(
      session1.accounts.map((a) => a.address),
      session2.accounts.map((a) => a.address),
    );
    const sameChain =
      session1.chain.chainId === session2.chain.chainId &&
      session1.chain.chainType === session2.chain.chainType;
    const sameProvider = session1.provider.type === session2.provider.type;
    const equivalentPermissions = this.permissionsEqual(session1.permissions, session2.permissions);

    // Calculate compatibility score
    const factors = [sameWallet, sameAddresses, sameChain, sameProvider, equivalentPermissions];
    const compatibilityScore = factors.filter(Boolean).length / factors.length;

    return {
      sameWallet,
      sameAddresses,
      sameChain,
      sameProvider,
      equivalentPermissions,
      compatibilityScore,
    };
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lifecycle.expiresAt && session.lifecycle.expiresAt < now) {
        expiredSessions.push(sessionId);
      }
    }

    // Expired sessions cleaned up

    for (const sessionId of expiredSessions) {
      await this.endSession(sessionId);
    }
  }

  // Private helper methods

  private generateSessionId(walletId: string, chainId: string): string {
    return generateSessionId(`session_${walletId}_${chainId}`);
  }

  private recordChainSwitch(fromSession: SessionState, toSession: SessionState): void {
    const switchRecord: ChainSwitchRecord = {
      switchId: generateId({ prefix: 'switch', timestamp: true }),
      fromChain: fromSession.chain,
      toChain: toSession.chain,
      timestamp: Date.now(),
      reason: 'user_request',
      successful: true,
    };

    // Update the sessions in our internal map to add the switch record
    // We need to create new objects to avoid modifying potentially frozen objects
    if (this.sessions.has(fromSession.sessionId)) {
      const updatedFromSession = {
        ...fromSession,
        metadata: {
          ...fromSession.metadata,
          chainSwitches: [...(fromSession.metadata.chainSwitches || []), switchRecord],
        },
      };
      this.sessions.set(fromSession.sessionId, updatedFromSession);
    }

    if (this.sessions.has(toSession.sessionId)) {
      const updatedToSession = {
        ...toSession,
        metadata: {
          ...toSession.metadata,
          chainSwitches: [...(toSession.metadata.chainSwitches || []), switchRecord],
        },
      };
      this.sessions.set(toSession.sessionId, updatedToSession);
    }
  }

  private arraysEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private permissionsEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // Note: getChainName() and normalizeToCAIP2() have been consolidated to src/utils/chainNameResolver.ts

  /**
   * Switch active account within a session
   */
  async switchAccount(sessionId: string, accountAddress: string): Promise<SessionState> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    const account = session.accounts.find((acc) => acc.address === accountAddress);
    if (!account) {
      throw ErrorFactory.configurationError(`Account ${accountAddress} not found in session ${sessionId}`);
    }

    // Create a new session object with updated account
    const updatedSession = {
      ...session,
      activeAccount: account,
      primaryAddress: account.address,
      lifecycle: {
        ...session.lifecycle,
        lastActiveAt: Date.now(),
      },
    };

    // Record account selection
    if (session.accountContext) {
      const selectionRecord = {
        selectionId: generateId({ prefix: 'selection', timestamp: true }),
        fromAccount:
          session.accountContext.activeAccountIndex !== -1
            ? session.accounts[session.accountContext.activeAccountIndex] || null
            : null,
        toAccount: account,
        timestamp: Date.now(),
        reason: 'user_request' as const,
        successful: true,
      };

      updatedSession.accountContext = {
        ...session.accountContext,
        selectionHistory: [...session.accountContext.selectionHistory, selectionRecord],
        activeAccountIndex: session.accounts.findIndex((acc) => acc.address === accountAddress),
      };
    }

    // Update our internal state
    this.sessions.set(sessionId, updatedSession);

    return updatedSession;
  }

  /**
   * Discover additional accounts for a session
   */
  async discoverAccounts(sessionId: string, options: AccountDiscoveryOptions = {}): Promise<AccountInfo[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    const limit = options.limit || 5;
    const startIndex = options.startIndex || session.accounts.length;
    const now = Date.now();

    // Generate mock discovered accounts (in real implementation, this would call the provider)
    const discoveredAccounts: AccountInfo[] = [];
    for (let i = 0; i < limit; i++) {
      const index = startIndex + i;
      const account: AccountInfo = {
        address: `0x${index.toString(16).padStart(40, '0')}`,
        name: `Account ${index + 1}`,
        index,
        isDefault: false,
        derivationPath:
          options.derivationPathTemplate?.replace('{index}', index.toString()) || `m/44'/60'/0'/0/${index}`,
        metadata: {
          discoveredAt: now,
          lastUsedAt: now,
          transactionCount: 0,
          accountType: 'standard',
        },
      };

      if (options.includeBalances) {
        account.balance = {
          value: `${(Math.random() * 5 + 0.1).toFixed(1)}000000000000000000`,
          formatted: (Math.random() * 5 + 0.1).toFixed(1),
          symbol: 'ETH',
          decimals: 18,
        };
      }

      discoveredAccounts.push(account);
    }

    return discoveredAccounts;
  }

  /**
   * Add a new account to a session
   */
  async addAccount(sessionId: string, account: AccountInfo): Promise<SessionState> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    // Check if account already exists
    const existingAccount = session.accounts.find((acc) => acc.address === account.address);
    if (existingAccount) {
      throw ErrorFactory.configurationError(
        `Account ${account.address} already exists in session ${sessionId}`,
      );
    }

    // Create a new session object with the added account
    const updatedSession = {
      ...session,
      accounts: [...session.accounts, account],
      lifecycle: {
        ...session.lifecycle,
        lastActiveAt: Date.now(),
      },
    };

    // Update account context
    if (session.accountContext) {
      updatedSession.accountContext = {
        ...session.accountContext,
        totalAccounts: updatedSession.accounts.length,
      };
    }

    // Update our internal state
    this.sessions.set(sessionId, updatedSession);

    return updatedSession;
  }

  /**
   * Remove an account from a session
   */
  async removeAccount(sessionId: string, accountAddress: string): Promise<SessionState> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw ErrorFactory.configurationError(`Session not found: ${sessionId}`);
    }

    const accountIndex = session.accounts.findIndex((acc) => acc.address === accountAddress);
    if (accountIndex === -1) {
      throw ErrorFactory.configurationError(`Account ${accountAddress} not found in session ${sessionId}`);
    }

    // Can't remove the last account
    if (session.accounts.length === 1) {
      throw ErrorFactory.configurationError('Cannot remove the last account from a session');
    }

    // Create a new session object with the account removed
    const newAccounts = [...session.accounts];
    newAccounts.splice(accountIndex, 1);

    let newActiveAccount = session.activeAccount;

    // If we removed the active account, switch to the first one
    if (session.activeAccount.address === accountAddress) {
      const firstAccount = newAccounts[0];
      if (!firstAccount) {
        throw ErrorFactory.configurationError('No accounts remaining after removal');
      }
      newActiveAccount = firstAccount;
    }

    const updatedSession: SessionState = {
      ...session,
      accounts: newAccounts,
      activeAccount: newActiveAccount,
      lifecycle: {
        ...session.lifecycle,
        lastActiveAt: Date.now(),
      },
    };

    // Update account context
    if (session.accountContext) {
      updatedSession.accountContext = {
        ...session.accountContext,
        totalAccounts: newAccounts.length,
        // Update active account index if needed
        activeAccountIndex:
          session.accountContext.activeAccountIndex >= accountIndex
            ? Math.max(0, session.accountContext.activeAccountIndex - 1)
            : session.accountContext.activeAccountIndex,
      };
    }

    // Update our internal state
    this.sessions.set(sessionId, updatedSession);

    return updatedSession;
  }

  /**
   * Get all accounts for a session
   */
  getSessionAccounts(sessionId: string): AccountInfo[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }
    return session.accounts;
  }

  /**
   * Get active account for a session
   */
  getActiveAccount(sessionId: string): AccountInfo | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    return session.activeAccount;
  }
}
