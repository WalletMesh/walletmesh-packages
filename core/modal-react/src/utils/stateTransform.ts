/**
 * State transformation utilities for React integration
 *
 * This module provides utilities to transform between the core state
 * (used by modal-core) and the React-specific state shape. These transformations
 * are essential for maintaining compatibility with React hooks and SSR.
 *
 * ## Key Responsibilities
 *
 * - **State Shape Conversion**: Transform core store state to React state
 * - **Status Mapping**: Convert session states to connection statuses
 * - **Wallet Data Mapping**: Extract wallet information from sessions
 * - **SSR Serialization**: Serialize/deserialize state for hydration
 *
 * ## Architecture
 *
 * The core store uses a session-based architecture while React components
 * expect a connection-based state shape. These utilities bridge this gap.
 *
 * @module utils/stateTransform
 * @category Utilities
 */

import type {
  ConnectionStatus,
  WalletMeshState as CoreWalletMeshState,
  SessionState,
  SupportedChain,
} from '@walletmesh/modal-core';
import { ChainType, ErrorFactory } from '@walletmesh/modal-core';
import type { ReactWalletMeshState } from '../types.js';
import { createComponentLogger } from './logger.js';

// Workaround for TypeScript treating ConnectionStatus as type-only import
// Define the enum values locally to match modal-core
const ConnectionStatusValues = {
  Disconnected: 'disconnected' as ConnectionStatus,
  Connecting: 'connecting' as ConnectionStatus,
  Connected: 'connected' as ConnectionStatus,
  Error: 'error' as ConnectionStatus,
  Reconnecting: 'reconnecting' as ConnectionStatus,
} as const;

// Using SessionState for WalletConnectionState
type WalletConnectionState = SessionState;

/**
 * Maps core connection state to React connection status
 *
 * @param activeConnection - The active session state from core store
 * @returns The corresponding React connection status
 * @internal
 */
function mapConnectionStatus(
  activeConnection: WalletConnectionState | undefined,
): ReactWalletMeshState['connectionStatus'] {
  if (!activeConnection) return ConnectionStatusValues.Disconnected;

  switch (activeConnection.status) {
    case 'connecting':
      return ConnectionStatusValues.Connecting;
    case 'connected':
      return ConnectionStatusValues.Connected;
    case 'error':
      return ConnectionStatusValues.Error;
    case 'disconnected':
      return ConnectionStatusValues.Disconnected;
    default:
      return ConnectionStatusValues.Disconnected;
  }
}

/**
 * Maps active wallet to selected wallet format
 *
 * @param activeWalletId - The ID of the active wallet
 * @param coreState - The core state
 * @returns The selected wallet information or null
 * @internal
 */
function mapSelectedWallet(
  activeWalletId: string | null,
  coreState: CoreWalletMeshState,
): ReactWalletMeshState['selectedWallet'] {
  if (!activeWalletId) return null;

  const walletInfo = coreState.entities.wallets[activeWalletId];
  if (!walletInfo) return null;

  return {
    id: walletInfo.id,
    name: walletInfo.name,
    ...(walletInfo.icon && { icon: walletInfo.icon }),
    chains: walletInfo.chains || [],
  };
}

/**
 * Maps connected wallets from core state
 *
 * @param coreState - The core state
 * @returns Array of connected wallet information
 * @internal
 */
function mapConnectedWallets(coreState: CoreWalletMeshState): ReactWalletMeshState['connectedWallets'] {
  const connectedWallets = [];

  for (const session of Object.values(coreState.entities.sessions)) {
    if (session.status === 'connected') {
      const walletInfo = coreState.entities.wallets[session.walletId];
      if (walletInfo) {
        connectedWallets.push({
          id: walletInfo.id,
          name: walletInfo.name,
          ...(walletInfo.icon && { icon: walletInfo.icon }),
          chains: walletInfo.chains || [],
        });
      }
    }
  }

  return connectedWallets;
}

/**
 * Gets provider from core state
 *
 * @param coreState - The core state
 * @returns The provider instance or null
 * @internal
 */
function getProviderFromState(coreState: CoreWalletMeshState): unknown {
  const activeSession = coreState.active.sessionId
    ? coreState.entities.sessions[coreState.active.sessionId]
    : undefined;

  if (!activeSession || activeSession.status !== 'connected') return null;

  return activeSession.provider?.instance || null;
}

/**
 * Maps current view from core state
 *
 * @param coreState - The core state
 * @returns The current modal view type
 * @internal
 */
function mapCurrentView(coreState: CoreWalletMeshState): ReactWalletMeshState['currentView'] {
  const { currentView, errors } = coreState.ui;
  const errorKeys = errors ? Object.keys(errors) : [];
  const error = errorKeys.length > 0 && errorKeys[0] ? errors[errorKeys[0]] : undefined;

  if (error) return 'error';

  // Map core views to React views (React doesn't support all core views yet)
  switch (currentView) {
    case 'walletSelection':
    case 'connecting':
    case 'connected':
    case 'error':
    case 'switchingChain':
      return currentView;
    default:
      // Map any unsupported views to a default
      return 'walletSelection';
  }
}

/**
 * Maps detected wallets (installed wallets)
 *
 * @param coreState - The core state
 * @returns Array of detected wallet information
 * @internal
 */
function mapAvailableWallets(coreState: CoreWalletMeshState): ReactWalletMeshState['detectedWallets'] {
  // In the new architecture, detectedWallets is just an array of WalletInfo
  // Return all available wallets from the connections state
  return Object.values(coreState.entities.wallets) || [];
}

/**
 * Gets current chain from connection
 *
 * @param connection - The wallet connection state
 * @returns The current chain or null
 * @internal
 */
function getCurrentChain(connection: WalletConnectionState | undefined): SupportedChain | null {
  if (connection?.status === 'connected' && connection.chain) {
    // Return the chain from the connection (already a SupportedChain/ChainConfig)
    return connection.chain;
  }
  return null;
}

/**
 * Gets supported chains from core state
 *
 * @param coreState - The core state
 * @returns Array of supported chain types
 * @internal
 */
function getSupportedChains(coreState: CoreWalletMeshState): SupportedChain[] {
  // Collect all unique chain types from available wallets and convert to ChainConfig
  const chainTypes = new Set<ChainType>();

  const allWallets = Object.values(coreState.entities.wallets);
  for (const wallet of allWallets) {
    if (wallet.chains) {
      for (const chain of wallet.chains) {
        chainTypes.add(chain);
      }
    }
  }

  // Convert ChainType to SupportedChain objects
  return Array.from(chainTypes).map((chainType): SupportedChain => {
    switch (chainType) {
      case 'evm':
        return {
          chainId: 'eip155:1',
          chainType: ChainType.Evm,
          name: 'Ethereum',
          required: false,
        };
      case 'solana':
        return {
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          chainType: ChainType.Solana,
          name: 'Solana',
          required: false,
        };
      case 'aztec':
        return {
          chainId: 'aztec:31337',
          chainType: ChainType.Aztec,
          name: 'Aztec Sandbox',
          required: false,
        };
      default:
        return {
          chainId: chainType,
          chainType: ChainType.Evm, // Default to EVM for unknown chain types
          name: chainType,
          required: false,
        };
    }
  });
}

/**
 * Gets address from connection
 *
 * @param connection - The wallet connection state
 * @returns The primary address or undefined
 * @internal
 */
function getAddress(connection: WalletConnectionState | undefined): string | undefined {
  if (connection?.status === 'connected') {
    return connection.activeAccount?.address || undefined;
  }
  return undefined;
}

/**
 * Gets accounts from connection
 *
 * @param connection - The wallet connection state
 * @returns Array of account addresses or undefined
 * @internal
 */
function getAccounts(connection: WalletConnectionState | undefined): string[] | undefined {
  if (connection?.status === 'connected') {
    return connection.accounts?.map((a) => a.address) || [];
  }
  return undefined;
}

/**
 * Gets connection progress from core state
 *
 * @param coreState - The core state
 * @returns Connection progress object or undefined
 * @internal
 */
function getConnectionProgress(coreState: CoreWalletMeshState): { message: string } | undefined {
  if (coreState.ui.loading && (coreState.ui.loading.connection || coreState.ui.loading.discovery)) {
    return { message: 'Loading...' };
  }
  return undefined;
}

/**
 * Transform core state to WalletMeshState for React compatibility
 *
 * This is the main transformation function that converts the session-based
 * core store state into the connection-based React state shape. This
 * transformation is essential for maintaining compatibility with existing
 * React hooks and components.
 *
 * The transformation handles:
 * - Session state to connection status mapping
 * - Wallet information extraction from sessions
 * - Provider instance retrieval
 * - Error state normalization
 * - View state conversion
 *
 * @param coreState - The core state from modal-core
 * @returns The transformed React-compatible state
 *
 * @example
 * ```typescript
 * // Used internally by React hooks
 * const reactState = transformCoreToReactState(coreState);
 *
 * // Access transformed data
 * console.log(reactState.connectionStatus);
 * console.log(reactState.selectedWallet);
 * console.log(reactState.address);
 * ```
 *
 * @example
 * ```typescript
 * // SSR usage with state serialization
 * // Server-side
 * const state = transformCoreToReactState(coreState);
 * const serialized = serializeState(state);
 *
 * // Client-side
 * const hydrated = deserializeState(serialized);
 * ```
 *
 * @category Utilities
 * @public
 */
export function transformCoreToReactState(coreState: CoreWalletMeshState): ReactWalletMeshState {
  // Get active session from the normalized state
  const activeSessionId = coreState.active?.sessionId;
  const activeSession = activeSessionId ? coreState.entities.sessions?.[activeSessionId] : undefined;
  const activeWalletId = activeSession?.walletId || null;
  const activeConnection = activeSession;

  const address = getAddress(activeConnection);
  const accounts = getAccounts(activeConnection);
  const connectionProgress = getConnectionProgress(coreState);

  // Get available wallets from normalized state
  const availableWallets =
    coreState.meta?.availableWalletIds
      ?.map((id) => coreState.entities.wallets?.[id])
      .filter((wallet): wallet is NonNullable<typeof wallet> => wallet != null) || [];

  return {
    connectionStatus: mapConnectionStatus(activeConnection),
    selectedWallet: mapSelectedWallet(activeWalletId, coreState),
    connectedWallets: mapConnectedWallets(coreState),
    provider: getProviderFromState(coreState),
    isModalOpen: coreState.ui.modalOpen,
    currentView: mapCurrentView(coreState),
    availableWallets,
    detectedWallets: mapAvailableWallets(coreState),
    error: coreState.ui.errors?.['connection']
      ? typeof coreState.ui.errors['connection'] === 'string'
        ? {
            code: 'ERROR',
            message: coreState.ui.errors['connection'],
            category: 'network' as const,
            recoveryStrategy: 'retry' as const,
            data: {} as Record<string, unknown>,
          }
        : {
            code:
              coreState.ui.errors['connection'].code === 'GENERAL_ERROR'
                ? 'ERROR'
                : coreState.ui.errors['connection'].code,
            message: coreState.ui.errors['connection'].message,
            category: 'network' as const, // Always 'network' for React state
            recoveryStrategy: 'retry' as const, // Default to recoverable
            data:
              (coreState.ui.errors['connection'].data as Record<string, unknown>) ||
              ({} as Record<string, unknown>),
          }
      : null,
    currentChain: getCurrentChain(activeConnection),
    supportedChains: getSupportedChains(coreState),
    ...(address && { address }),
    ...(accounts && { accounts }),
    ...(connectionProgress && { connectionProgress }),
  };
}

/**
 * Helper to check if any wallet is connected
 *
 * Scans all active sessions to determine if at least one wallet
 * has an active connection.
 *
 * @param state - The core state
 * @returns True if any wallet is connected
 *
 * @example
 * ```typescript
 * const hasConnection = isAnyWalletConnected(state);
 * if (hasConnection) {
 *   console.log('At least one wallet is connected');
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export function isAnyWalletConnected(state: CoreWalletMeshState): boolean {
  for (const session of Object.values(state.entities.sessions)) {
    if (session.status === 'connected') {
      return true;
    }
  }
  return false;
}

/**
 * Helper to check if any wallet is connecting
 *
 * Scans all active sessions to determine if at least one wallet
 * is in the process of connecting.
 *
 * @param state - The core state
 * @returns True if any wallet is connecting
 *
 * @example
 * ```typescript
 * const isConnecting = isAnyWalletConnecting(state);
 * if (isConnecting) {
 *   showLoadingSpinner();
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export function isAnyWalletConnecting(state: CoreWalletMeshState): boolean {
  for (const session of Object.values(state.entities.sessions)) {
    if (session.status === 'connecting' || session.status === 'initializing') {
      return true;
    }
  }
  return false;
}

/**
 * Helper to disconnect active wallet
 *
 * Disconnects the currently active wallet by ending its session.
 * This is a convenience function for the common disconnect operation.
 *
 * @param state - The core state
 * @param actions - The store actions object
 * @returns Promise that resolves when disconnect is complete
 *
 * @example
 * ```typescript
 * await disconnectActiveWallet(state, actions);
 * console.log('Wallet disconnected');
 * ```
 *
 * @category Utilities
 * @public
 */
export async function disconnectActiveWallet(
  state: CoreWalletMeshState,
  _actions: unknown, // Actions are now external and don't have a type in CoreWalletMeshState
): Promise<void> {
  const activeSessionId = state.active.sessionId;
  if (activeSessionId) {
    // Note: endSession action needs to be called from the external actions
    // This function signature may need to be updated to accept the proper action reference
    throw ErrorFactory.configurationError('endSession action needs to be implemented with new action system');
  }
}

/**
 * Maps React action to core store action
 *
 * Translates React-style actions (Redux-like) to core store method calls.
 * This enables compatibility with existing React patterns while using the
 * new core store architecture.
 *
 * @param action - The React-style action with type and optional payload
 * @param actions - The core store actions object
 * @param state - Optional current state for context
 *
 * @example
 * ```typescript
 * // Open modal
 * mapActionToCoreStore(
 *   { type: 'OPEN_MODAL' },
 *   actions
 * );
 *
 * // Select wallet
 * mapActionToCoreStore(
 *   { type: 'SELECT_WALLET', payload: { id: 'metamask' } },
 *   actions
 * );
 *
 * // Disconnect
 * mapActionToCoreStore(
 *   { type: 'DISCONNECT' },
 *   actions,
 *   state
 * );
 * ```
 *
 * @category Utilities
 * @public
 */
export function mapActionToCoreStore(
  action: { type: string; payload?: unknown },
  _actions: unknown, // Actions are now external and don't have a type in CoreWalletMeshState
  state?: CoreWalletMeshState,
): void {
  const logger = createComponentLogger('mapActionToCoreStore');
  switch (action.type) {
    case 'OPEN_MODAL':
      // Note: openModal action needs to be called with store as first parameter
      throw ErrorFactory.configurationError('openModal action needs to be called with new action system');
    case 'CLOSE_MODAL':
      // Note: closeModal action needs to be called with store as first parameter
      throw ErrorFactory.configurationError('closeModal action needs to be called with new action system');
    case 'SELECT_WALLET':
      if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
        // const walletId = (action.payload as { id: string }).id;
        // In the new architecture, connection is handled through sessions
        // This would need to be implemented via the session manager
        logger.warn('Connect wallet through session manager');
      }
      break;
    case 'DISCONNECT':
      if (action.payload && typeof action.payload === 'string') {
        // Find sessions for this wallet and end them
        const walletId = action.payload;
        if (state) {
          // Find sessions for this wallet
          const allSessions = Object.values(state.entities?.sessions || {});
          const sessions = allSessions.filter((s) => s.walletId === walletId);
          for (const _session of sessions) {
            // Note: endSession action needs to be called from the external actions
            logger.warn('endSession action needs to be implemented with new action system');
          }
        }
      } else {
        // End all active sessions
        if (state) {
          const allSessions = Object.values(state.entities?.sessions || {});
          for (const _session of allSessions) {
            // Note: endSession action needs to be called from the external actions
            logger.warn('endSession action needs to be implemented with new action system');
          }
        }
      }
      break;
    case 'SET_VIEW':
      if (action.payload && typeof action.payload === 'string') {
        const viewMap: Record<string, CoreWalletMeshState['ui']['currentView']> = {
          walletSelection: 'walletSelection',
          connecting: 'connecting',
          connected: 'connected',
          error: 'error',
        };
        const view = viewMap[action.payload as string];
        if (view) {
          // Note: setView action needs to be called with store as first parameter
          throw ErrorFactory.configurationError('setView action needs to be called with new action system');
        }
      }
      break;
    case 'SET_ERROR':
      if (action.payload && typeof action.payload === 'object') {
        // The UI error accepts a simpler format than ModalError
        // Note: setError action needs to be called with store as first parameter
        throw ErrorFactory.configurationError('setError action needs to be called with new action system');
      }
      break;
    case 'CLEAR_ERROR':
      // Note: setError action needs to be called with store as first parameter
      throw ErrorFactory.configurationError('setError action needs to be called with new action system');
  }
}
