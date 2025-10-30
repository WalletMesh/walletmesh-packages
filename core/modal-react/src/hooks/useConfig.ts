/**
 * Configuration and modal control hook for WalletMesh
 *
 * Provides access to configuration, modal controls, and discovery state
 *
 * @module hooks/useConfig
 */

import { type ChainType, ErrorFactory, type WalletMeshClient } from '@walletmesh/modal-core';
import type { SupportedChain, WalletInfo } from '@walletmesh/modal-core';
import { useCallback, useMemo } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { useStore, useStoreActions, useStoreInstance } from './internal/useStore.js';

/**
 * Hook return type for configuration and modal control
 *
 * @public
 */
export interface UseConfigReturn {
  // Client
  /** WalletMesh client instance */
  client: WalletMeshClient | null;

  // Modal control
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Open the wallet selection modal */
  open: (options?: { targetChainType?: ChainType }) => void;
  /** Close the wallet selection modal */
  close: () => void;

  // Configuration
  /** Application name */
  appName: string;
  /** Application description */
  appDescription: string | undefined;
  /** Application URL */
  appUrl: string | undefined;
  /** Application icon URL */
  appIcon: string | undefined;
  /** Supported chains */
  chains: SupportedChain[];

  // Discovery state
  /** Available wallets detected */
  wallets: WalletInfo[];

  // Wallet filtering
  /** Current wallet filter function */
  walletFilter: ((wallet: WalletInfo) => boolean) | null;
  /** Filtered wallets based on current filter */
  filteredWallets: WalletInfo[];
  /** Set a filter function to limit which wallets are shown */
  setWalletFilter: (filter: (wallet: WalletInfo) => boolean) => void;
  /** Clear the current wallet filter */
  clearWalletFilter: () => void;

  // Debug
  /** Whether debug mode is enabled */
  debug: boolean;
}

/**
 * Hook for accessing WalletMesh configuration and modal controls
 *
 * Provides configuration access and modal control interface
 * following wagmi's useConfig pattern.
 *
 * @returns Configuration and control methods
 *
 * @since 1.0.0
 *
 * @see {@link useAccount} - For account and connection state
 * @see {@link useConnect} - For connection operations
 *
 * @remarks
 * This is the primary hook for accessing WalletMesh configuration
 * and controlling the modal. It combines:
 * - Client instance access
 * - Modal open/close controls
 * - App configuration
 * - Wallet discovery state
 * - Debug mode status
 *
 * The modal will automatically handle wallet selection and connection
 * when opened.
 *
 * @example
 * ```tsx
 * function ConnectButton() {
 *   const { open, isOpen, wallets } = useConfig();
 *
 *   return (
 *     <div>
 *       <button onClick={open} disabled={isOpen}>
 *         Connect Wallet
 *       </button>
 *       <p>Available wallets: {wallets.length}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Access configuration
 * function AppInfo() {
 *   const { appName, chains, debug } = useConfig();
 *
 *   return (
 *     <div>
 *       <h1>{appName}</h1>
 *       <p>Supported chains: {chains.join(', ')}</p>
 *       {debug && <p>Debug mode enabled</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Wallet discovery state
 * function WalletDiscovery() {
 *   const { wallets, isDiscovering } = useConfig();
 *
 *   return (
 *     <div>
 *       <h3>Available Wallets ({wallets.length})</h3>
 *       {isDiscovering && <p>Discovering...</p>}
 *
 *       {wallets.map(wallet => (
 *         <div key={wallet.id}>
 *           <img src={wallet.icon} alt={wallet.name} />
 *           <span>{wallet.name}</span>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useConfig(): UseConfigReturn {
  const { client, config } = useWalletMeshContext();
  const actions = useStoreActions();
  const store = useStoreInstance();

  // Subscribe to modal state and wallet filter
  // Note: walletFilter is a function and may not serialize properly with persist middleware
  const { isOpen, wallets } = useStore((state) => ({
    isOpen: state.ui.modalOpen,
    wallets: Object.values(state.entities?.wallets || {}),
  }));

  // Subscribe to walletFilter separately to handle function storage properly
  const walletFilter = useStore((state) => state.ui.walletFilter || null);

  // Modal control methods
  const open = useCallback(
    (options?: { targetChainType?: ChainType }) => {
      if (!client) {
        throw ErrorFactory.configurationError(
          'WalletMesh client not available. Make sure useConfig is called within WalletMeshProvider.',
        );
      }
      client.openModal(options);
    },
    [client],
  );

  const close = useCallback(() => {
    if (!client) {
      throw ErrorFactory.configurationError(
        'Client not available. Make sure you are using this hook within WalletMeshProvider.',
      );
    }
    client.closeModal();
  }, [client]);

  // Extract chains from config - now SupportedChain objects instead of ChainType enums
  const chains: SupportedChain[] = useMemo(() => {
    if (!client) return [];
    try {
      // Get the current config from the client context
      // This should contain the SupportedChain[] passed to WalletMeshProvider
      const config = (
        client as { config?: { chains?: Array<{ chainId: string; name: string; chainType: string }> } }
      ).config; // Access internal config
      if (config?.chains) {
        // Transform back from internal format to SupportedChain format
        return config.chains.map((chain: { chainId: string; name: string; chainType: string }) => ({
          chainId: chain.chainId,
          chainType: chain.chainType as ChainType,
          name: chain.name,
          required: true, // Default since we don't store this in internal format
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [client]);

  // Get filtered wallets using store helper
  // Dependencies: walletFilter and wallets trigger recalculation when they change
  const filteredWallets = useMemo(() => {
    // Apply filter if set, otherwise return all wallets
    if (walletFilter) {
      return wallets.filter(walletFilter);
    }
    return wallets;
  }, [walletFilter, wallets]);

  // Set wallet filter function using store action
  const setWalletFilter = useCallback(
    (filter: (wallet: WalletInfo) => boolean) => {
      actions.ui.setWalletFilter(store, filter);
    },
    [actions, store],
  );

  // Clear wallet filter using store action
  const clearWalletFilter = useCallback(() => {
    // Note: clearWalletFilter is not available in the new uiActions
    store.setState((state) => {
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.walletFilter;
    });
  }, [store]);

  return {
    // Client
    client,

    // Modal control
    isOpen,
    open,
    close,

    // Configuration
    appName: config.appName,
    appDescription: config.appDescription || undefined,
    appUrl: config.appUrl || undefined,
    appIcon: config.appIcon || undefined,
    chains,

    // Discovery state
    wallets,

    // Wallet filtering
    walletFilter,
    filteredWallets,
    setWalletFilter,
    clearWalletFilter,

    // Debug
    debug: config.debug || false,
  };
}
