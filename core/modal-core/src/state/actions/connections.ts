/**
 * Connection actions for simplified WalletMesh store - FIXED VERSION
 *
 * External action functions for managing wallet connections and sessions
 */

import type { StoreApi } from 'zustand';
import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import type {
  AccountInfo,
  ChainSessionInfo,
  ChainSwitchRecord,
  CreateSessionParams,
  SessionState,
  SessionStateMetadata,
} from '../../api/types/sessionState.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import {
  createSessionParamsSchema,
  sessionIdSchema,
  sessionMetadataSchema,
  walletIdSchema,
  walletInfoSchema,
} from '../../schemas/actions.js';
import type { WalletInfo } from '../../types.js';
import { generateSessionId } from '../../utils/crypto.js';
import { parseWithErrorFactory } from '../../utils/zodHelpers.js';
import type { WalletMeshState } from '../store.js';

/**
 * Helper to properly handle immer state mutations
 * When using immer middleware, the state is a draft that can be mutated directly
 */
const mutateState = (store: StoreApi<WalletMeshState>, updater: (state: WalletMeshState) => void) => {
  // Cast to the expected immer type where the updater returns void
  (store.setState as (updater: (state: WalletMeshState) => void) => void)(updater);
};

/**
 * Helper to clean an object by removing undefined properties
 * This is needed for exactOptionalPropertyTypes compatibility
 */
function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  }
  return cleaned;
}

/**
 * Connection action functions
 */
export const connectionActions = {
  /**
   * Create a new session
   */
  createSession: async (
    store: StoreApi<WalletMeshState>,
    params: CreateSessionParams,
  ): Promise<SessionState> => {
    // Validate parameters
    const validatedParams = parseWithErrorFactory(
      createSessionParamsSchema,
      params,
      'Invalid session parameters',
    );

    // This is a simplified version - in practice, this would integrate with SessionManager
    const sessionId = validatedParams.sessionId ?? generateSessionId('session');

    const defaultAccount: AccountInfo = {
      address: '',
    };

    // Clean accounts to remove undefined properties
    const cleanedAccounts = validatedParams.accounts?.map((acc) => cleanObject(acc) as AccountInfo) || [
      defaultAccount,
    ];
    const activeAccount = cleanedAccounts[0] || defaultAccount;

    const newSession: SessionState = {
      sessionId,
      walletId: validatedParams.walletId,
      status: 'connected',
      accounts: cleanedAccounts,
      activeAccount,
      chain: {
        chainId: validatedParams.chain.chainId,
        chainType: validatedParams.chain.chainType,
        name: validatedParams.chain.name,
        required: validatedParams.chain.required,
        ...(validatedParams.chain.label && { label: validatedParams.chain.label }),
        ...(validatedParams.chain.interfaces && { interfaces: validatedParams.chain.interfaces }),
        ...(validatedParams.chain.group && { group: validatedParams.chain.group }),
        ...(validatedParams.chain.icon && { icon: validatedParams.chain.icon }),
        ...(validatedParams.chain.isNative !== undefined && { isNative: validatedParams.chain.isNative }),
      },
      provider: {
        instance: validatedParams.provider as BlockchainProvider,
        type: validatedParams.providerMetadata?.type || 'unknown',
        version: validatedParams.providerMetadata?.version || '1.0.0',
        multiChainCapable: validatedParams.providerMetadata?.multiChainCapable || false,
        supportedMethods: validatedParams.providerMetadata?.supportedMethods || [],
      },
      permissions: {
        methods: validatedParams.permissions?.methods || [],
        events: validatedParams.permissions?.events || [],
        ...(validatedParams.permissions?.autoSign !== undefined && {
          autoSign: validatedParams.permissions.autoSign,
        }),
        ...(validatedParams.permissions?.maxTransactionValue && {
          maxTransactionValue: validatedParams.permissions.maxTransactionValue,
        }),
        ...(validatedParams.permissions?.chainSpecific && {
          chainSpecific: validatedParams.permissions.chainSpecific,
        }),
        ...(validatedParams.permissions?.walletSpecific && {
          walletSpecific: validatedParams.permissions.walletSpecific,
        }),
      },
      metadata: (() => {
        const metadataObj = validatedParams.metadata as Record<string, unknown> | undefined;
        const wallet = (metadataObj?.['wallet'] as Record<string, unknown>) || {};
        const dapp = (metadataObj?.['dapp'] as Record<string, unknown>) || {};
        const connection = (metadataObj?.['connection'] as Record<string, unknown>) || {};

        return {
          wallet: {
            name: (wallet['name'] as string) || '',
            icon: (wallet['icon'] as string) || '',
            ...(wallet['version'] !== undefined && { version: wallet['version'] as string }),
            ...(wallet['installUrl'] !== undefined && { installUrl: wallet['installUrl'] as string }),
          },
          dapp: {
            name: (dapp['name'] as string) || '',
            ...(dapp['url'] !== undefined && { url: dapp['url'] as string }),
            ...(dapp['icon'] !== undefined && { icon: dapp['icon'] as string }),
            ...(dapp['domain'] !== undefined && { domain: dapp['domain'] as string }),
          },
          connection: {
            method:
              (connection['method'] as 'manual' | 'deeplink' | 'qr' | 'extension' | 'injected') || 'manual',
            initiatedBy: (connection['initiatedBy'] as 'user' | 'dapp' | 'auto') || 'user',
            ...(connection['userAgent'] !== undefined && { userAgent: connection['userAgent'] as string }),
            ...(connection['ipAddress'] !== undefined && { ipAddress: connection['ipAddress'] as string }),
          },
          ...(metadataObj?.['chainSwitches']
            ? {
                chainSwitches: metadataObj['chainSwitches'] as ChainSwitchRecord[],
              }
            : {}),
        };
      })(),
      lifecycle: {
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        lastAccessedAt: Date.now(),
        ...(validatedParams.expiresAt && { expiresAt: validatedParams.expiresAt }),
        operationCount: 0,
        activeTime: 0,
      },
    };

    mutateState(store, (state) => {
      // Add session to normalized entities
      state.entities.sessions[sessionId] = newSession;
      // Set as active session
      state.active.sessionId = sessionId;
      // Update connection timestamp
      state.meta.connectionTimestamps[validatedParams.walletId] = Date.now();
    });

    return newSession;
  },

  /**
   * End a session
   */
  endSession: async (
    store: StoreApi<WalletMeshState>,
    sessionId: string,
    _options?: { isDisconnect?: boolean },
  ): Promise<void> => {
    // Validate session ID
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');

    mutateState(store, (state) => {
      // Remove session from entities
      delete state.entities.sessions[validatedSessionId];

      // Clear active session if it was the one being ended
      if (state.active.sessionId === validatedSessionId) {
        // Set the next available session as active, or null if none
        const remainingSessions = Object.keys(state.entities.sessions);
        state.active.sessionId = remainingSessions.length > 0 ? (remainingSessions[0] ?? null) : null;
      }
    });
  },

  /**
   * Switch to a different active session
   */
  switchToSession: (store: StoreApi<WalletMeshState>, sessionId: string) => {
    // Validate session ID
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');

    const state = store.getState();
    const session = state.entities.sessions[validatedSessionId];

    if (session) {
      mutateState(store, (state) => {
        state.active.sessionId = validatedSessionId;
      });
    } else {
      throw ErrorFactory.notFound(`Session not found: ${validatedSessionId}`, {
        sessionId: validatedSessionId,
      });
    }
  },

  /**
   * Update session status
   */
  updateSessionStatus: (
    store: StoreApi<WalletMeshState>,
    sessionId: string,
    status: SessionState['status'],
  ) => {
    // Validate session ID and status
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');

    mutateState(store, (state) => {
      const session = state.entities.sessions[validatedSessionId];
      if (session) {
        session.status = status;
        session.lifecycle.lastActiveAt = Date.now();
      }
    });
  },

  /**
   * Get active session from state
   */
  getActiveSession: (store: StoreApi<WalletMeshState>): SessionState | null => {
    const state = store.getState();
    const activeSessionId = state.active.sessionId;

    if (!activeSessionId) {
      return null;
    }

    const session = state.entities.sessions[activeSessionId];
    return session || null;
  },

  /**
   * Get sessions by wallet ID
   */
  getSessionsByWallet: (store: StoreApi<WalletMeshState>, walletId: string): SessionState[] => {
    // Validate wallet ID
    const validatedWalletId = parseWithErrorFactory(walletIdSchema, walletId, 'Invalid wallet ID');

    const state = store.getState();
    return Object.values(state.entities.sessions).filter((s) => s.walletId === validatedWalletId);
  },

  /**
   * Get wallet sessions (alias for getSessionsByWallet)
   */
  getWalletSessions: (store: StoreApi<WalletMeshState>, walletId: string): SessionState[] => {
    return connectionActions.getSessionsByWallet(store, walletId);
  },

  /**
   * Switch chain for a session
   */
  switchChain: async (
    store: StoreApi<WalletMeshState>,
    sessionId: string,
    chainId: string,
  ): Promise<SessionState | null> => {
    // Validate session ID
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');

    mutateState(store, (state) => {
      const session = state.entities.sessions[validatedSessionId];
      if (session) {
        session.chain.chainId = chainId;
        session.lifecycle.lastActiveAt = Date.now();
      }
    });

    const state = store.getState();
    return state.entities.sessions[validatedSessionId] || null;
  },

  /**
   * Add a wallet to the state
   */
  addWallet: (store: StoreApi<WalletMeshState>, wallet: WalletInfo) => {
    // Validate wallet info
    const validatedWallet = parseWithErrorFactory(walletInfoSchema, wallet, 'Invalid wallet info');
    const cleanedWallet = cleanObject(validatedWallet) as WalletInfo;

    mutateState(store, (state) => {
      // Add to wallets entities
      state.entities.wallets[cleanedWallet.id] = cleanedWallet;
    });
  },

  /**
   * Update session metadata
   */
  updateSessionMetadata: (
    store: StoreApi<WalletMeshState>,
    sessionId: string,
    metadata: Partial<SessionStateMetadata>,
  ) => {
    // Validate session ID
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');
    const validatedMetadata = parseWithErrorFactory(
      sessionMetadataSchema.partial(),
      metadata,
      'Invalid metadata',
    );

    mutateState(store, (state) => {
      const session = state.entities.sessions[validatedSessionId];
      if (session) {
        // Merge metadata, ensuring required properties are maintained
        const cleanedMetadata = cleanObject(validatedMetadata);

        // Build wallet object preserving existing values
        const wallet = cleanedMetadata.wallet || session.metadata.wallet;
        const dapp = cleanedMetadata.dapp || session.metadata.dapp;
        const connection = cleanedMetadata.connection || session.metadata.connection;

        session.metadata = {
          wallet: {
            name: wallet.name,
            icon: wallet.icon,
            ...(wallet.version !== undefined && { version: wallet.version }),
            ...(wallet.installUrl !== undefined && { installUrl: wallet.installUrl }),
          },
          dapp: {
            name: dapp.name,
            ...(dapp.url !== undefined && { url: dapp.url }),
            ...(dapp.icon !== undefined && { icon: dapp.icon }),
            ...(dapp.domain !== undefined && { domain: dapp.domain }),
          },
          connection: {
            initiatedBy: connection.initiatedBy,
            method: connection.method,
            ...(connection.userAgent !== undefined && { userAgent: connection.userAgent }),
            ...(connection.ipAddress !== undefined && { ipAddress: connection.ipAddress }),
          },
          ...(cleanedMetadata.chainSwitches
            ? { chainSwitches: cleanedMetadata.chainSwitches as ChainSwitchRecord[] }
            : {}),
        };
        session.lifecycle.lastActiveAt = Date.now();
      }
    });
  },

  /**
   * Update session chain
   */
  updateSessionChain: (
    store: StoreApi<WalletMeshState>,
    sessionId: string,
    chain: Partial<ChainSessionInfo>,
  ) => {
    // Validate session ID
    const validatedSessionId = parseWithErrorFactory(sessionIdSchema, sessionId, 'Invalid session ID');

    mutateState(store, (state) => {
      const session = state.entities.sessions[validatedSessionId];
      if (session) {
        session.chain = {
          ...session.chain,
          ...cleanObject(chain),
        };
        session.lifecycle.lastActiveAt = Date.now();
      }
    });

    const state = store.getState();
    const updatedSession = state.entities.sessions[validatedSessionId];
    return updatedSession;
  },

  /**
   * Add a discovered wallet to the state
   */
  addDiscoveredWallet: (store: StoreApi<WalletMeshState>, wallet: WalletInfo) => {
    console.log('[addDiscoveredWallet] Adding wallet to store:', { walletId: wallet.id, walletName: wallet.name });

    // Validate wallet info
    const validatedWallet = parseWithErrorFactory(walletInfoSchema, wallet, 'Invalid wallet info');
    const cleanedWallet = cleanObject(validatedWallet) as WalletInfo;

    console.log('[addDiscoveredWallet] Validated wallet:', cleanedWallet);

    mutateState(store, (state) => {
      // Add to wallets entities
      state.entities.wallets[cleanedWallet.id] = cleanedWallet;
      console.log('[addDiscoveredWallet] Added to entities.wallets');

      // Update available wallet IDs list
      if (!state.meta.availableWalletIds.includes(cleanedWallet.id)) {
        state.meta.availableWalletIds.push(cleanedWallet.id);
        console.log('[addDiscoveredWallet] Added to availableWalletIds:', cleanedWallet.id);
      } else {
        console.log('[addDiscoveredWallet] Wallet already in availableWalletIds:', cleanedWallet.id);
      }

      console.log('[addDiscoveredWallet] Current state after update:', {
        totalWallets: Object.keys(state.entities.wallets).length,
        availableWalletIds: state.meta.availableWalletIds,
        walletEntities: Object.keys(state.entities.wallets)
      });
    });
  },

  /**
   * Remove a wallet from the state
   */
  removeWallet: (store: StoreApi<WalletMeshState>, walletId: string) => {
    // Validate wallet ID
    const validatedWalletId = parseWithErrorFactory(walletIdSchema, walletId, 'Invalid wallet ID');

    mutateState(store, (state) => {
      // Remove wallet from entities
      delete state.entities.wallets[validatedWalletId];

      // Remove from available wallets list
      const availableIndex = state.meta.availableWalletIds.indexOf(validatedWalletId);
      if (availableIndex > -1) {
        state.meta.availableWalletIds.splice(availableIndex, 1);
      }

      // Clear sessions for this wallet
      const sessionIds = Object.values(state.entities.sessions)
        .filter((s) => s.walletId === validatedWalletId)
        .map((s) => s.sessionId);

      for (const sessionId of sessionIds) {
        delete state.entities.sessions[sessionId];
      }

      // Clear active session if it belonged to this wallet
      if (state.active.sessionId && sessionIds.includes(state.active.sessionId)) {
        const remainingSessions = Object.keys(state.entities.sessions);
        state.active.sessionId = remainingSessions.length > 0 ? (remainingSessions[0] ?? null) : null;
      }

      // Clear active wallet if it was the removed one
      if (state.active.walletId === validatedWalletId) {
        state.active.walletId = null;
      }
    });
  },

  /**
   * Mark a wallet as available
   */
  markWalletAvailable: (store: StoreApi<WalletMeshState>, walletId: string) => {
    // Validate wallet ID
    const validatedWalletId = parseWithErrorFactory(walletIdSchema, walletId, 'Invalid wallet ID');

    mutateState(store, (state) => {
      // Ensure wallet exists in entities
      if (state.entities.wallets[validatedWalletId]) {
        // Add to available list if not already there
        if (!state.meta.availableWalletIds.includes(validatedWalletId)) {
          state.meta.availableWalletIds.push(validatedWalletId);
        }
      }
    });
  },

  /**
   * Clear all connections
   */
  clearAll: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      // Clear all sessions
      state.entities.sessions = {};
      // Clear active references
      state.active.sessionId = null;
      state.active.walletId = null;
      // Clear connection timestamps
      state.meta.connectionTimestamps = {};
    });
  },
};
