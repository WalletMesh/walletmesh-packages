/**
 * State derivation utilities
 *
 * Framework-agnostic utilities for deriving UI state from core state.
 * These functions help UI packages (React, Vue, Svelte, etc.) derive
 * consistent state representations from the core state store.
 *
 * @module utils/stateDerivation
 * @packageDocumentation
 * @since 3.0.0
 */

import { ConnectionStatus } from '../types.js';
import type { ChainType } from '../types.js';

/**
 * Connection state flags
 */
export interface ConnectionFlags {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Whether reconnecting to previous session */
  isReconnecting: boolean;
  /** Whether wallet is disconnected */
  isDisconnected: boolean;
}

/**
 * Session status type
 */
export type SessionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

/**
 * UI view type
 */
export type UIView = 'idle' | 'connecting' | 'connected' | 'error';

/**
 * Derive connection flags from session and UI state
 *
 * Provides a consistent way to determine connection status across UI frameworks.
 *
 * @param sessionStatus - Current session status
 * @param currentView - Current UI view
 * @param isReconnecting - Whether this is a reconnection attempt
 * @returns Connection flags
 *
 * @example
 * ```typescript
 * const flags = deriveConnectionFlags('connected', 'connected', false);
 * console.log(flags);
 * // {
 * //   status: 'connected',
 * //   isConnected: true,
 * //   isConnecting: false,
 * //   isReconnecting: false,
 * //   isDisconnected: false
 * // }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function deriveConnectionFlags(
  sessionStatus?: SessionStatus,
  currentView?: UIView,
  isReconnecting = false,
): ConnectionFlags {
  const isConnected = sessionStatus === 'connected';
  const isConnecting = currentView === 'connecting' && !isReconnecting;
  const isDisconnected = !isConnected && !isConnecting && !isReconnecting;

  let status: ConnectionStatus;
  if (isConnected) {
    status = ConnectionStatus.Connected;
  } else if (isReconnecting) {
    status = ConnectionStatus.Reconnecting;
  } else if (isConnecting) {
    status = ConnectionStatus.Connecting;
  } else {
    status = ConnectionStatus.Disconnected;
  }

  return {
    status,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
  };
}

/**
 * Chain information
 */
export interface ChainInfo {
  /** Chain ID */
  chainId: string;
  /** Chain type */
  chainType: ChainType;
  /** Chain name */
  name: string;
}

/**
 * Wallet session info
 */
export interface WalletSession {
  /** Wallet ID */
  walletId: string;
  /** Session status */
  status: SessionStatus;
  /** Connected chain */
  chain?: ChainInfo;
  /** Primary account address */
  address?: string;
}

/**
 * Filter sessions by connection status
 *
 * Returns only sessions that match the specified status.
 *
 * @param sessions - Array of wallet sessions
 * @param status - Status to filter by (default: 'connected')
 * @returns Filtered sessions
 *
 * @example
 * ```typescript
 * const connectedSessions = filterSessionsByStatus(sessions, 'connected');
 * console.log(connectedSessions);
 * // [{ walletId: 'metamask', status: 'connected', ... }]
 * ```
 *
 * @category State Derivation
 * @public
 */
export function filterSessionsByStatus(
  sessions: WalletSession[],
  status: SessionStatus = 'connected',
): WalletSession[] {
  return sessions.filter((session) => session.status === status);
}

/**
 * Get connected wallet IDs
 *
 * Extracts wallet IDs from connected sessions.
 *
 * @param sessions - Array of wallet sessions
 * @returns Array of connected wallet IDs
 *
 * @example
 * ```typescript
 * const walletIds = getConnectedWalletIds(sessions);
 * console.log(walletIds);
 * // ['metamask', 'phantom']
 * ```
 *
 * @category State Derivation
 * @public
 */
export function getConnectedWalletIds(sessions: WalletSession[]): string[] {
  return filterSessionsByStatus(sessions, 'connected')
    .map((session) => session.walletId)
    .filter((id): id is string => !!id);
}

/**
 * Get active session from sessions array
 *
 * Returns the first connected session, or undefined if none connected.
 *
 * @param sessions - Array of wallet sessions
 * @returns Active session or undefined
 *
 * @example
 * ```typescript
 * const activeSession = getActiveSession(sessions);
 * if (activeSession) {
 *   console.log('Active wallet:', activeSession.walletId);
 * }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function getActiveSession(sessions: WalletSession[]): WalletSession | undefined {
  const connectedSessions = filterSessionsByStatus(sessions, 'connected');
  return connectedSessions.length > 0 ? connectedSessions[0] : undefined;
}

/**
 * Check if any sessions are connected
 *
 * @param sessions - Array of wallet sessions
 * @returns True if at least one session is connected
 *
 * @example
 * ```typescript
 * if (hasConnectedSession(sessions)) {
 *   console.log('User is connected to at least one wallet');
 * }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function hasConnectedSession(sessions: WalletSession[]): boolean {
  return sessions.some((session) => session.status === 'connected');
}

/**
 * Get primary address from active session
 *
 * Returns the address from the first connected session.
 *
 * @param sessions - Array of wallet sessions
 * @returns Primary address or undefined
 *
 * @example
 * ```typescript
 * const address = getPrimaryAddress(sessions);
 * if (address) {
 *   console.log('Connected address:', address);
 * }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function getPrimaryAddress(sessions: WalletSession[]): string | undefined {
  const activeSession = getActiveSession(sessions);
  return activeSession?.address;
}

/**
 * Get current chain from active session
 *
 * Returns the chain from the first connected session.
 *
 * @param sessions - Array of wallet sessions
 * @returns Current chain or undefined
 *
 * @example
 * ```typescript
 * const chain = getCurrentChain(sessions);
 * if (chain) {
 *   console.log('Connected to:', chain.name);
 * }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function getCurrentChain(sessions: WalletSession[]): ChainInfo | undefined {
  const activeSession = getActiveSession(sessions);
  return activeSession?.chain;
}

/**
 * Check if connected to a specific chain
 *
 * @param sessions - Array of wallet sessions
 * @param chainId - Chain ID to check
 * @returns True if connected to the specified chain
 *
 * @example
 * ```typescript
 * if (isConnectedToChain(sessions, '1')) {
 *   console.log('Connected to Ethereum mainnet');
 * }
 * ```
 *
 * @category State Derivation
 * @public
 */
export function isConnectedToChain(sessions: WalletSession[], chainId: string): boolean {
  const chain = getCurrentChain(sessions);
  return chain?.chainId === chainId;
}

/**
 * Get sessions by chain type
 *
 * Filters sessions to only those on the specified chain type.
 *
 * @param sessions - Array of wallet sessions
 * @param chainType - Chain type to filter by
 * @returns Sessions on the specified chain type
 *
 * @example
 * ```typescript
 * const evmSessions = getSessionsByChainType(sessions, 'evm');
 * console.log('EVM wallets:', evmSessions.map(s => s.walletId));
 * ```
 *
 * @category State Derivation
 * @public
 */
export function getSessionsByChainType(
  sessions: WalletSession[],
  chainType: ChainType,
): WalletSession[] {
  return sessions.filter((session) => session.chain?.chainType === chainType);
}
