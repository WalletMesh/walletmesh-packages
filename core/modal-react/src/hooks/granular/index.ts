/**
 * Granular selector hooks for optimized re-renders
 *
 * These hooks provide fine-grained subscriptions to specific pieces of state,
 * reducing unnecessary re-renders when only specific values change.
 *
 * @module hooks/granular
 */

import {
  type WalletMeshState,
  getActiveSession,
  getActiveWallet,
  getAvailableWallets,
  getConnectionStatus,
  getCurrentView,
  getFilteredWallets,
  getSelectedWallet,
  isDiscovering,
  isModalOpen,
} from '@walletmesh/modal-core';
import { useDebugValue } from 'react';
import { useStore } from '../internal/useStore.js';

/**
 * Hook to get only the active wallet
 * Re-renders only when active wallet changes
 */
export function useActiveWallet() {
  const wallet = useStore(getActiveWallet);
  useDebugValue(wallet ? `Wallet: ${wallet.name}` : 'No active wallet');
  return wallet;
}

/**
 * Hook to get only the active session
 * Re-renders only when active session changes
 */
export function useActiveSession() {
  const session = useStore(getActiveSession);
  useDebugValue(session ? `Session: ${session.sessionId}` : 'No active session');
  return session;
}

/**
 * Hook to get only the selected wallet (before connection)
 * Re-renders only when selected wallet changes
 */
export function useSelectedWallet() {
  const wallet = useStore(getSelectedWallet);
  useDebugValue(wallet ? `Selected: ${wallet.name}` : 'No selection');
  return wallet;
}

/**
 * Hook to get only the connection status
 * Re-renders only when connection status changes
 */
export function useConnectionStatus() {
  const status = useStore(getConnectionStatus);
  useDebugValue(`Status: ${status}`);
  return status;
}

/**
 * Hook to get only the address from active session
 * Re-renders only when address changes
 */
export function useAddress() {
  const address = useStore((state) => getActiveSession(state)?.activeAccount?.address || null);
  useDebugValue(address ? `Address: ${address.slice(0, 6)}...${address.slice(-4)}` : 'No address');
  return address;
}

/**
 * Hook to get only the chain ID from active session
 * Re-renders only when chain changes
 */
export function useChainId() {
  const chainId = useStore((state) => getActiveSession(state)?.chain?.chainId || null);
  useDebugValue(chainId ? `Chain: ${chainId}` : 'No chain');
  return chainId;
}

/**
 * Hook to get only the chain type from active session
 * Re-renders only when chain type changes
 */
export function useChainType() {
  const chainType = useStore((state) => getActiveSession(state)?.chain?.chainType || null);
  useDebugValue(chainType ? `Type: ${chainType}` : 'No chain type');
  return chainType;
}

/**
 * Hook to check if connected (boolean only)
 * Re-renders only when connected state changes
 */
export function useIsConnected() {
  const isConnected = useStore((state) => getConnectionStatus(state) === 'connected');
  useDebugValue(isConnected ? 'Connected' : 'Not connected');
  return isConnected;
}

/**
 * Hook to check if connecting (boolean only)
 * Re-renders only when connecting state changes
 */
export function useIsConnecting() {
  const isConnecting = useStore((state) => getConnectionStatus(state) === 'connecting');
  useDebugValue(isConnecting ? 'Connecting...' : 'Not connecting');
  return isConnecting;
}

/**
 * Hook to check if modal is open
 * Re-renders only when modal open state changes
 */
export function useIsModalOpen() {
  const isOpen = useStore(isModalOpen);
  useDebugValue(isOpen ? 'Modal open' : 'Modal closed');
  return isOpen;
}

/**
 * Hook to get current modal view
 * Re-renders only when view changes
 */
export function useModalView() {
  const view = useStore(getCurrentView);
  useDebugValue(`View: ${view}`);
  return view;
}

/**
 * Hook to check if discovering wallets
 * Re-renders only when discovery state changes
 */
export function useIsDiscovering() {
  const discovering = useStore(isDiscovering);
  useDebugValue(discovering ? 'Discovering...' : 'Not discovering');
  return discovering;
}

/**
 * Hook to get available wallets
 * Re-renders only when available wallets change
 */
export function useAvailableWallets() {
  const wallets = useStore(getAvailableWallets);
  useDebugValue(`${wallets.length} wallets available`);
  return wallets;
}

/**
 * Hook to get filtered wallets (with filter applied)
 * Re-renders only when filtered wallets change
 */
export function useFilteredWallets() {
  const wallets = useStore(getFilteredWallets);
  useDebugValue(`${wallets.length} wallets (filtered)`);
  return wallets;
}

/**
 * Hook to get connection error
 * Re-renders only when connection error changes
 */
export function useConnectionError() {
  const error = useStore((state) => state.ui.errors['connection']);
  useDebugValue(error ? `Error: ${error.message}` : 'No error');
  return error;
}

/**
 * Hook to get all addresses from active session
 * Re-renders only when addresses change
 */
export function useAddresses() {
  const addresses = useStore((state) => {
    const session = getActiveSession(state);
    return session?.accounts?.map((acc) => acc.address) || [];
  });
  useDebugValue(`${addresses.length} addresses`);
  return addresses;
}

/**
 * Hook to get wallet name from active wallet
 * Re-renders only when wallet name changes
 */
export function useWalletName() {
  const name = useStore((state) => getActiveWallet(state)?.name || null);
  useDebugValue(name ? `Wallet: ${name}` : 'No wallet');
  return name;
}

/**
 * Hook to get wallet icon from active wallet
 * Re-renders only when wallet icon changes
 */
export function useWalletIcon() {
  const icon = useStore((state) => getActiveWallet(state)?.icon || null);
  useDebugValue(icon ? 'Has icon' : 'No icon');
  return icon;
}

/**
 * Hook to check if a specific wallet is available
 * Re-renders only when that wallet's availability changes
 */
export function useIsWalletAvailable(walletId: string) {
  const isAvailable = useStore((state) => state.meta.availableWalletIds.includes(walletId));
  useDebugValue(isAvailable ? `${walletId} available` : `${walletId} not available`);
  return isAvailable;
}

/**
 * Hook to get transaction status
 * Re-renders only when transaction status changes
 */
export function useTransactionStatus() {
  const status = useStore((state) => state.meta.transactionStatus);
  useDebugValue(`Transaction: ${status}`);
  return status;
}

/**
 * Hook composition helper for multiple granular values
 * Only re-renders when specific selected values change
 *
 * @example
 * ```tsx
 * const { address, chainId, isConnected } = useGranularValues(
 *   state => ({
 *     address: getActiveSession(state)?.activeAccount?.address,
 *     chainId: getActiveSession(state)?.chain?.chainId,
 *     isConnected: getConnectionStatus(state) === 'connected'
 *   })
 * );
 * ```
 */
export function useGranularValues<T>(selector: (state: WalletMeshState) => T): T {
  const values = useStore(selector);
  useDebugValue(values);
  return values;
}

/**
 * Export all hooks for convenience
 */
export const granularHooks = {
  useActiveWallet,
  useActiveSession,
  useSelectedWallet,
  useConnectionStatus,
  useAddress,
  useChainId,
  useChainType,
  useIsConnected,
  useIsConnecting,
  useIsModalOpen,
  useModalView,
  useIsDiscovering,
  useAvailableWallets,
  useFilteredWallets,
  useConnectionError,
  useAddresses,
  useWalletName,
  useWalletIcon,
  useIsWalletAvailable,
  useTransactionStatus,
  useGranularValues,
};
